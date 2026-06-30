package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.DriverRequest;
import com.travelhub.backend.dto.response.DriverResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Driver;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.DriverRepository;
import com.travelhub.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final AgentRepository agentRepository;
    private final BookingRepository bookingRepository;

    /**
     * Returns all drivers owned by the given agent.
     * If lifecycleStatus is provided, results are filtered (e.g. "active", "inactive").
     * If startDate and endDate are provided, filters out drivers that are booked during that period.
     */
    public List<DriverResponse> getAllDrivers(Long agentId, String lifecycleStatus, String startDate, String endDate) {
        List<Driver> drivers;
        if (lifecycleStatus != null) {
            // Apply lifecycle filter when requested by the UI.
            drivers = driverRepository.findByAgentIdAndLifecycleStatus(agentId, lifecycleStatus);
        } else {
            // Otherwise return all drivers for the agent.
            drivers = driverRepository.findByAgentId(agentId);
        }
        
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<Long> bookedDriverIds = bookingRepository.findBookedDriverIds(agentId, start, end);
            drivers = drivers.stream()
                    .filter(d -> !bookedDriverIds.contains(d.getId()))
                    .collect(Collectors.toList());
        }

        // Convert entities to response DTOs.
        return drivers.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Returns a single driver by id, enforcing that it belongs to the given agent.
     * Throws ResourceNotFoundException if not found or not owned by the agent.
     */
    public DriverResponse getDriverById(Long agentId, Long driverId) {
        // Find driver by id.
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        // Ownership check.
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "agentId", agentId);
        }
        return toResponse(driver);
    }

    /**
     * Creates a new driver under the given agent.
     * Enforces NIC and license-number uniqueness before persisting.
     */
    public DriverResponse createDriver(Long agentId, DriverRequest request) {
        // Ensure agent exists before creating a driver under it.
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        // Uniqueness checks for primary identity fields.
        if (driverRepository.existsByNic(request.getNic())) {
            throw new BadRequestException("A driver with this NIC already exists");
        }
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new BadRequestException("A driver with this license number already exists");
        }

        // Map request fields -> Driver entity, with default status/lifecycle values.
        Driver driver = Driver.builder()
                .agent(agent)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .nic(request.getNic())
                .bloodGroup(request.getBloodGroup())
                .nicFrontImage(request.getNicFrontImage())
                .nicRearImage(request.getNicRearImage())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .secondaryMobileNumber(request.getSecondaryMobileNumber())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .licenseNumber(request.getLicenseNumber())
                .licenseExpiryDate(request.getLicenseExpiryDate() != null ?
                        LocalDate.parse(request.getLicenseExpiryDate()) : null)
                .licenseFrontImage(request.getLicenseFrontImage())
                .licenseRearImage(request.getLicenseRearImage())
                .vehicleTypes(request.getVehicleTypes())
                .profileImage(request.getProfileImage())
                .status("available")
                .lifecycleStatus("active")
                .build();

        // Persist and return created driver.
        return toResponse(driverRepository.save(driver));
    }

    /**
     Updates an existing driver (belonging to the agent).
     */
    public DriverResponse updateDriver(Long agentId, Long driverId, DriverRequest request) {
        // Lookup and enforce ownership.
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "id", driverId);
        }

        // Editable profile/identity fields (as allowed by current business rules).
        driver.setFirstName(request.getFirstName());
        driver.setLastName(request.getLastName());
        if (request.getProfileImage() != null) {
            driver.setProfileImage(request.getProfileImage());
        }

        // Always editable contact/address/operational fields.
        driver.setEmail(request.getEmail());
        driver.setMobileNumber(request.getMobileNumber());
        driver.setSecondaryMobileNumber(request.getSecondaryMobileNumber());
        driver.setAddressLine1(request.getAddressLine1());
        driver.setAddressLine2(request.getAddressLine2());
        driver.setVehicleTypes(request.getVehicleTypes());

        // Still locked (not updated here): nic, nicImages, licenseNumber, licenseImages.

        // Persist and return updated driver.
        return toResponse(driverRepository.save(driver));
    }

    /**
     * Updates driver availability status for the given agent-owned driver.
     */
    public DriverResponse updateStatus(Long agentId, Long driverId, String status) {
        // Lookup and enforce ownership.
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "agentId", agentId);
        }
        // Persist updated status.
        driver.setStatus(status);
        return toResponse(driverRepository.save(driver));
    }

    /**
     * Updates lifecycle status for the given agent-owned driver.
     */
    public DriverResponse updateLifecycle(Long agentId, Long driverId, String lifecycleStatus) {
        // Lookup and enforce ownership.
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "agentId", agentId);
        }
        // Persist lifecycle status change.
        driver.setLifecycleStatus(lifecycleStatus);
        return toResponse(driverRepository.save(driver));
    }

    /**
     * Deletes a driver owned by the agent.
     * Prevents deletion when the driver is currently on an active trip.
     */

    public void deleteDriver(Long agentId, Long driverId) {
        // Lookup and enforce ownership.
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "agentId", agentId);
        }
        // Business rule: cannot delete a driver currently assigned to a trip.
        if (driver.getStatus().equals("on-trip")) {
            throw new BadRequestException("Cannot delete a driver who is currently on a trip");
        }
        // Delete the record.
        driverRepository.delete(driver);
    }

    /**
     * Maps Driver entity -> API response DTO.
     */
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
                .build();
    }
}
