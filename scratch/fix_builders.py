import os
import re

def fix_boilerplate_with_builder(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove Lombok imports
    content = re.sub(r'import lombok\..*;\n', '', content)
    
    # Remove Lombok annotations
    for ann in ['@Data', '@Getter', '@Setter', '@Builder', '@NoArgsConstructor', '@AllArgsConstructor', '@RequiredArgsConstructor']:
        content = re.sub(ann + r'\n?', '', content)

    # Extract class name
    class_match = re.search(r'public class (\w+)', content)
    if not class_match:
        return False
    class_name = class_match.group(1)

    # Extract fields
    fields = re.findall(r'private ([\w<>, ]+) (\w+);', content)
    if not fields:
        return False

    # Check if getters already exist
    # If it has getters but missing builder, we still want to add builder if the error logs showed it's missing.
    # To keep it simple, I'll always recreate if @Builder was there.

    # Build getters, setters, and builder
    boilerplate = ""
    for field_type, field_name in fields:
        cap_name = field_name[0].upper() + field_name[1:]
        boilerplate += f"\n    public {field_type} get{cap_name}() {{ return {field_name}; }}"
        boilerplate += f"\n    public void set{cap_name}({field_type} {field_name}) {{ this.{field_name} = {field_name}; }}"

    # Build Builder class
    builder_methods = ""
    build_assignments = ""
    for field_type, field_name in fields:
        builder_methods += f"\n        public Builder {field_name}({field_type} {field_name}) {{ this.{field_name} = {field_name}; return this; }}"
        build_assignments += f"\n            res.set{field_name[0].upper() + field_name[1:]}({field_name});"

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
    boilerplate += f"\n\n    public {class_name}() {{}}"
    boilerplate += builder_class

    # Insert before the last closing brace
    content = content.strip()
    if content.endswith('}'):
        # Find the last closing brace
        last_brace_idx = content.rfind('}')
        content = content[:last_brace_idx] + boilerplate + "\n}"
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    return True

# Fix specific files reported in errors
files_to_fix = [
    "src/main/java/com/travelhub/backend/entity/Driver.java",
    "src/main/java/com/travelhub/backend/dto/response/DriverResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/OwnerProfileResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/AgentProfileResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/PackageResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/HotelResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/BookingResponse.java",
    "src/main/java/com/travelhub/backend/dto/response/PackageDetailResponse.java",
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        success = fix_boilerplate_with_builder(filepath)
        print(f"Fixed {filepath}: {success}")
