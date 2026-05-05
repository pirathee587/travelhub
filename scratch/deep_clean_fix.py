import os
import re

def clean_and_fix(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    new_lines = []
    in_class = False
    class_name = ""
    fields = []
    
    for line in lines:
        if "public class" in line:
            in_class = True
            class_name = re.search(r'public class (\w+)', line).group(1)
            new_lines.append(line)
            continue
        
        if not in_class:
            if "import lombok" not in line:
                new_lines.append(line)
            continue
        
        # We are inside the class
        # Keep only fields
        field_match = re.search(r'private ([\w<>, ]+) (\w+);', line)
        if field_match:
            fields.append((field_match.group(1), field_match.group(2)))
            new_lines.append(line)
            continue
        
        # Ignore everything else until the last closing brace
        # But wait, there might be @PrePersist or other annotations we want to keep
        if "@PrePersist" in line or "protected void onCreate" in line or "LocalDateTime.now()" in line:
            new_lines.append(line)
            continue

    # Reconstruct the class
    content = "".join(new_lines)
    # Remove the last closing brace if it was kept
    content = content.strip()
    if content.endswith('}'):
        content = content[:content.rfind('}')].strip()

    # Add boilerplate
    boilerplate = "\n\n    public " + class_name + "() {}\n"
    for f_type, f_name in fields:
        cap_name = f_name[0].upper() + f_name[1:]
        boilerplate += f"\n    public {f_type} get{cap_name}() {{ return {f_name}; }}"
        boilerplate += f"\n    public void set{cap_name}({f_type} {f_name}) {{ this.{f_name} = {f_name}; }}"

    # Builder
    builder_methods = ""
    build_assignments = ""
    for f_type, f_name in fields:
        cap_name = f_name[0].upper() + f_name[1:]
        builder_methods += f"\n        public Builder {f_name}({f_type} {f_name}) {{ this.{f_name} = {f_name}; return this; }}"
        build_assignments += f"\n            res.set{cap_name}({f_name});"

    builder_class = f"""
    public static class Builder {{
        {" ".join([f"private {f[0]} {f[1]};" for f in fields])}
        {builder_methods}
        public {class_name} build() {{
            {class_name} res = new {class_name}();
            {build_assignments}
            return res;
        }}
    }}
    public static Builder builder() {{ return new Builder(); }}
"""
    boilerplate += builder_class
    content += boilerplate + "\n}"
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    return True

files_to_clean = [
    "src/main/java/com/travelhub/backend/dto/response/DriverResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/OwnerProfileResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/AgentProfileResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/PackageResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/HotelResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/BookingResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/PackageDetailResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/NotificationResponse.java",
    "src/main/java/com/travelhub/backend/entity/Driver.java",
]

for f in files_to_clean:
    if os.path.exists(f):
        clean_and_fix(f)
        print(f"Cleaned and Fixed {f}")
