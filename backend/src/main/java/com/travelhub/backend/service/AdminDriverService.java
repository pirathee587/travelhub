package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.DriverResponse;
import com.travelhub.backend.entity.Driver;
import com.travelhub.backend.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDriverService {

    private final DriverRepository driverRepository;
    private final AgentNotificationService agentNotificationService;

    @Transactional(readOnly = true)
    public List<DriverResponse> getAllDrivers(String lifecycleStatus) {
        List<Driver> list;
        if (lifecycleStatus != null && !lifecycleStatus.isEmpty() && !"all".equalsIgnoreCase(lifecycleStatus)) {
            list = driverRepository.findByLifecycleStatus(lifecycleStatus.toLowerCase());
        } else {
            list = driverRepository.findAll();
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DriverResponse getDriverDetail(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        return toResponse(driver);
    }

    @Transactional
    public DriverResponse approveDriver(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        driver.setLifecycleStatus("active");
        driver.setStatus("available");
        Driver saved = driverRepository.save(driver);
        if (saved.getAgent() != null) {
            agentNotificationService.createNotification(
                    saved.getAgent(),
                    "driver",
                    "Driver Approved",
                    "Your driver " + saved.getFirstName() + " " + saved.getLastName() + " has been approved and is now active."
            );
        }
        return toResponse(saved);
    }

    @Transactional
    public DriverResponse rejectDriver(Long driverId, String reason) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        driver.setLifecycleStatus("rejected");
        driver.setStatus("off-duty");
        driver.setRejectionReason(reason);
        Driver saved = driverRepository.save(driver);
        if (saved.getAgent() != null) {
            agentNotificationService.createNotification(
                    saved.getAgent(),
                    "driver",
                    "Driver Rejected",
                    "Your driver " + saved.getFirstName() + " " + saved.getLastName() + " was rejected. Reason: " + reason
            );
        }
        return toResponse(saved);
    }

    private DriverResponse toResponse(Driver d) {
        return DriverResponse.builder()
                .id(d.getId())
                .firstName(d.getFirstName())
                .lastName(d.getLastName())
                .nic(d.getNic())
                .bloodGroup(d.getBloodGroup())
                .email(d.getEmail())
                .mobileNumber(d.getMobileNumber())
                .secondaryMobileNumber(d.getSecondaryMobileNumber())
                .addressLine1(d.getAddressLine1())
                .addressLine2(d.getAddressLine2())
                .licenseNumber(d.getLicenseNumber())
                .licenseExpiryDate(d.getLicenseExpiryDate() != null ?
                        d.getLicenseExpiryDate().toString() : null)
                .vehicleTypes(d.getVehicleTypes())
                .status(d.getStatus())
                .lifecycleStatus(d.getLifecycleStatus())
                .rating(d.getRating())
                .profileImage(d.getProfileImage())
                .assignedVehicle(d.getAssignedVehicle())
                .nicFrontImage(d.getNicFrontImage())
                .nicRearImage(d.getNicRearImage())
                .licenseFrontImage(d.getLicenseFrontImage())
                .licenseRearImage(d.getLicenseRearImage())
                .rejectionReason(d.getRejectionReason())
                .build();
    }
}
