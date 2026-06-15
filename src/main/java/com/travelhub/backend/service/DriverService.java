package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.DriverRequest;
import com.travelhub.backend.dto.response.DriverResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Driver;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.DriverRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DriverService manages the transport staff (drivers) for travel agents.
 * It handles recruitment (registration), licensing oversight, and operational availability for trips.
 */
@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final AgentRepository agentRepository;

    /**
     * Constructor injection for driver and agent data access.
     */
    public DriverService(DriverRepository driverRepository, AgentRepository agentRepository) {
        this.driverRepository = driverRepository;
        this.agentRepository = agentRepository;
    }

    /**
     * Retrieves all drivers belonging to a specific agent's fleet.
     * Optionally filters by system lifecycle status (e.g., "active", "suspended").
     */
    public List<DriverResponse> getAllDrivers(Long agentId, String lifecycleStatus) {
        List<Driver> drivers;
        if (lifecycleStatus != null) {
            drivers = driverRepository.findByAgentIdAndLifecycleStatus(agentId, lifecycleStatus);
        } else {
            drivers = driverRepository.findByAgentId(agentId);
        }
        return drivers.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Retrieves detailed information for a specific driver, with agent ownership verification.
     */
    public DriverResponse getDriverById(Long agentId, Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        
        // Security check: Verify the driver belongs to the requesting agent
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "agentId", agentId);
        }
        return toResponse(driver);
    }

    /**
     * Registers a new driver in the agent's staff list.
     * Includes strict validation for NIC and License uniqueness across the platform.
     */
    public DriverResponse createDriver(Long agentId, DriverRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        // Integrity check: prevent duplicate driver registrations
        if (driverRepository.existsByNic(request.getNic())) {
            throw new BadRequestException("A driver with this NIC already exists");
        }
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new BadRequestException("A driver with this license number already exists");
        }

        // Use Builder pattern to construct the persistent entity
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
                // Parse date string to persistent LocalDate type
                .licenseExpiryDate(request.getLicenseExpiryDate() != null ?
                        LocalDate.parse(request.getLicenseExpiryDate()) : null)
                .licenseFrontImage(request.getLicenseFrontImage())
                .licenseRearImage(request.getLicenseRearImage())
                .vehicleTypes(request.getVehicleTypes())
                .profileImage(request.getProfileImage())
                .status("available") // Initial operational status
                .lifecycleStatus("active") // Initial system status
                .build();

        return toResponse(driverRepository.save(driver));
    }

    /**
     * Updates an existing driver's contact and address information.
     * Prevents updates to immutable identity fields (NIC, License) after registration.
     */
    public DriverResponse updateDriver(Long agentId, Long driverId, DriverRequest request) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "agentId", agentId);
        }

        // Synchronize editable fields
        driver.setEmail(request.getEmail());
        driver.setMobileNumber(request.getMobileNumber());
        driver.setSecondaryMobileNumber(request.getSecondaryMobileNumber());
        driver.setAddressLine1(request.getAddressLine1());
        driver.setAddressLine2(request.getAddressLine2());
        driver.setVehicleTypes(request.getVehicleTypes());
        if (request.getProfileImage() != null) {
            driver.setProfileImage(request.getProfileImage());
        }

        return toResponse(driverRepository.save(driver));
    }

    /**
     * Updates the operational status of a driver (e.g., "available", "on-trip", "off-duty").
     */
    public DriverResponse updateStatus(Long agentId, Long driverId, String status) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "agentId", agentId);
        }
        
        driver.setStatus(status);
        return toResponse(driverRepository.save(driver));
    }

    /**
     * Updates the system lifecycle status of a driver (e.g., "active", "suspended", "resigned").
     */
    public DriverResponse updateLifecycle(Long agentId, Long driverId, String lifecycleStatus) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "agentId", agentId);
        }
        
        driver.setLifecycleStatus(lifecycleStatus);
        return toResponse(driverRepository.save(driver));
    }

    /**
     * Removes a driver from the agent's staff list.
     * Safety check: prevents deletion if the driver is currently assigned to an ongoing trip.
     */
    public void deleteDriver(Long agentId, Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        
        if (!driver.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Driver", "agentId", agentId);
        }
        
        // Operational safety constraint
        if (driver.getStatus().equals("on-trip")) {
            throw new BadRequestException("Cannot delete a driver who is currently on a trip");
        }
        
        driverRepository.delete(driver);
    }

    /**
     * Maps a Driver entity to a detailed DriverResponse DTO.
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
