import os
import re

def convert_lombok_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Check if @RequiredArgsConstructor is used
    if '@RequiredArgsConstructor' not in content:
        return False

    # Remove Lombok imports
    content = re.sub(r'import lombok\..*;\n', '', content)
    
    # Remove @RequiredArgsConstructor annotation
    content = content.replace('@RequiredArgsConstructor\n', '')
    content = content.replace('@RequiredArgsConstructor', '')

    # Extract class name
    class_match = re.search(r'public class (\w+)', content)
    if not class_match:
        return False
    class_name = class_match.group(1)

    # Extract final fields
    fields = re.findall(r'private final ([\w<>, ]+) (\w+);', content)
    if not fields:
        # If no final fields, maybe it's just an empty constructor or no injection needed
        # But we still need to remove the annotation
        with open(filepath, 'w') as f:
            f.write(content)
        return True

    # Build constructor
    constructor_params = ", ".join([f"{f[0]} {f[1]}" for f in fields])
    constructor_body = "\n        ".join([f"this.{f[1]} = {f[1]};" for f in fields])
    
    constructor = f"""
    public {class_name}({constructor_params}) {{
        {constructor_body}
    }}
"""

    # Insert constructor after the last final field
    field_lines = re.findall(r'private final .*?;', content)
    if field_lines:
        last_field = field_lines[-1]
        content = content.replace(last_field, last_field + constructor)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    return True

files_to_convert = [
    "src/main/java/com/travelhub/backend/controller/AdminDashboardController.java",
    "src/main/java/com/travelhub/backend/controller/AdminAgentController.java",
    "src/main/java/com/travelhub/backend/controller/DocumentController.java",
    "src/main/java/com/travelhub/backend/controller/OwnerProfileController.java",
    "src/main/java/com/travelhub/backend/controller/AgentDashboardController.java",
    "src/main/java/com/travelhub/backend/controller/AgentVehicleController.java",
    "src/main/java/com/travelhub/backend/controller/AgentReviewController.java",
    "src/main/java/com/travelhub/backend/controller/ImageUploadController.java",
    "src/main/java/com/travelhub/backend/controller/AgentAnalyticsController.java",
    "src/main/java/com/travelhub/backend/controller/AgentBookingController.java",
    "src/main/java/com/travelhub/backend/controller/RecommendationController.java",
    "src/main/java/com/travelhub/backend/controller/AdminPackageController.java",
    "src/main/java/com/travelhub/backend/controller/AgentNotificationController.java",
    "src/main/java/com/travelhub/backend/controller/AdminHotelController.java",
    "src/main/java/com/travelhub/backend/controller/AgentSettingsController.java",
    "src/main/java/com/travelhub/backend/controller/DashboardController.java",
    "src/main/java/com/travelhub/backend/controller/AgentProfileController.java",
    "src/main/java/com/travelhub/backend/controller/AdminAgentAnalyticsController.java",
    "src/main/java/com/travelhub/backend/controller/HotelOwnerDashboardController.java",
    "src/main/java/com/travelhub/backend/controller/DriverController.java",
    "src/main/java/com/travelhub/backend/service/AgentAnalyticsService.java",
    "src/main/java/com/travelhub/backend/service/AgentSettingsService.java",
    "src/main/java/com/travelhub/backend/service/AdminDashboardService.java",
    "src/main/java/com/travelhub/backend/service/AgentNotificationService.java",
    "src/main/java/com/travelhub/backend/service/AdminPackageService.java",
    "src/main/java/com/travelhub/backend/service/AdminPaymentService.java",
    "src/main/java/com/travelhub/backend/service/AgentVehicleService.java",
    "src/main/java/com/travelhub/backend/service/AgentBookingService.java",
    "src/main/java/com/travelhub/backend/service/AdminAgentService.java",
    "src/main/java/com/travelhub/backend/service/DriverService.java",
    "src/main/java/com/travelhub/backend/service/AgentProfileService.java",
    "src/main/java/com/travelhub/backend/service/AdminAgentAnalyticsService.java",
    "src/main/java/com/travelhub/backend/service/DashboardService.java",
    "src/main/java/com/travelhub/backend/service/DocumentService.java",
    "src/main/java/com/travelhub/backend/service/AgentDashboardService.java",
    "src/main/java/com/travelhub/backend/service/OwnerProfileService.java",
    "src/main/java/com/travelhub/backend/service/AgentReviewService.java"
]

for filepath in files_to_convert:
    if os.path.exists(filepath):
        success = convert_lombok_file(filepath)
        print(f"Converted {filepath}: {success}")
    else:
        print(f"File not found: {filepath}")
