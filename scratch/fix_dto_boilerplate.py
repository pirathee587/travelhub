import os
import re

def fix_boilerplate(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove Lombok imports
    content = re.sub(r'import lombok\..*;\n', '', content)
    
    # Remove Lombok annotations
    content = re.sub(r'@Data\n?', '', content)
    content = re.sub(r'@Getter\n?', '', content)
    content = re.sub(r'@Setter\n?', '', content)
    content = re.sub(r'@Builder\n?', '', content)
    content = re.sub(r'@NoArgsConstructor\n?', '', content)
    content = re.sub(r'@AllArgsConstructor\n?', '', content)
    content = re.sub(r'@RequiredArgsConstructor\n?', '', content)

    # Extract class name
    class_match = re.search(r'public class (\w+)', content)
    if not class_match:
        return False
    class_name = class_match.group(1)

    # Extract fields
    # Matches: private String name; or private List<String> list;
    fields = re.findall(r'private ([\w<>, ]+) (\w+);', content)
    if not fields:
        return False

    # Check if getters already exist
    if "public " + fields[0][0] + " get" in content:
        # Already has some getters, maybe just need to remove annotations
        with open(filepath, 'w') as f:
            f.write(content)
        return True

    # Build getters and setters
    boilerplate = ""
    for field_type, field_name in fields:
        cap_name = field_name[0].upper() + field_name[1:]
        # Getter
        boilerplate += f"\n    public {field_type} get{cap_name}() {{ return {field_name}; }}"
        # Setter
        boilerplate += f"\n    public void set{cap_name}({field_type} {field_name}) {{ this.{field_name} = {field_name}; }}"

    # Build No-Args Constructor
    boilerplate += f"\n\n    public {class_name}() {{}}"

    # Insert before the last closing brace
    content = content.strip()
    if content.endswith('}'):
        content = content[:-1] + boilerplate + "\n}"
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    return True

# Process DTOs
dto_path = "src/main/java/com/travelhub/backend/dto"
for root, dirs, files in os.walk(dto_path):
    for file in files:
        if file.endswith(".java"):
            filepath = os.path.join(root, file)
            success = fix_boilerplate(filepath)
            print(f"Fixed {filepath}: {success}")
