package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.VehicleRequest;
import com.travelhub.backend.dto.response.VehicleResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Vehicle;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AgentVehicleService manages the transport fleet for a specific agent.
 * This includes registration of new vehicles, updating details, and monitoring availability/lifecycle status.
 */
@Service
public class AgentVehicleService {

    private final VehicleRepository vehicleRepository;
    private final AgentRepository agentRepository;

    /**
     * Constructor injection for vehicle and agent data access.
     */
    public AgentVehicleService(VehicleRepository vehicleRepository, AgentRepository agentRepository) {
        this.vehicleRepository = vehicleRepository;
        this.agentRepository = agentRepository;
    }

    /**
     * Retrieves all vehicles belonging to an agent.
     * Optionally filters by system lifecycle status (e.g., "active", "suspended").
     */
    public List<VehicleResponse> getAllVehicles(Long agentId, String lifecycleStatus) {
        List<Vehicle> vehicles;
        if (lifecycleStatus != null) {
            vehicles = vehicleRepository.findByAgentIdAndLifecycleStatus(agentId, lifecycleStatus);
        } else {
            vehicles = vehicleRepository.findByAgentId(agentId);
        }
        return vehicles.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Retrieves detailed information for a specific vehicle, with agent ownership verification.
     */
    public VehicleResponse getVehicleById(Long agentId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        
        // Security check: Verify the vehicle belongs to the requesting agent
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle", "agentId", agentId);
        }
        return toResponse(vehicle);
    }

    /**
     * Registers a new vehicle in the agent's fleet.
     * Initializes the vehicle as 'available' and 'active' by default.
     */
    public VehicleResponse createVehicle(Long agentId, VehicleRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        // Use Builder pattern to construct the persistent entity
        Vehicle vehicle = Vehicle.builder()
                .agent(agent)
                .ownerFirstName(request.getOwnerFirstName())
                .ownerLastName(request.getOwnerLastName())
                .nicNumber(request.getNicNumber())
                .nicFrontImage(request.getNicFrontImage())
                .nicRearImage(request.getNicRearImage())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .mobileNumber(request.getMobileNumber())
                .secondaryMobileNumber(request.getSecondaryMobileNumber())
                .ownerEmail(request.getOwnerEmail())
                .vehicleType(request.getVehicleType())
                .brand(request.getBrand())
                .model(request.getModel())
                .color(request.getColor())
                .capacity(request.getCapacity())
                .yearOfManufacture(request.getYearOfManufacture())
                .registration(request.getRegistration())
                .insuranceCardFront(request.getInsuranceCardFront())
                .insuranceExpiryDate(request.getInsuranceExpiryDate())
                .revenueLicenseImage(request.getRevenueLicenseImage())
                .vehicleImageFront(request.getVehicleImageFront())
                .vehicleImageBack(request.getVehicleImageBack())
                .vehicleImageSide(request.getVehicleImageSide())
                .vehicleImageInside(request.getVehicleImageInside())
                .status("available") // Initial operational status
                .lifecycleStatus("active") // Initial system status
                .isAvailable(true)
                .build();

        return toResponse(vehicleRepository.save(vehicle));
    }

    /**
     * Updates an existing vehicle's editable details (e.g., color, insurance, images).
     */
    public VehicleResponse updateVehicle(Long agentId, Long vehicleId, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        
        // Security check: Ensure agent ownership
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle", "agentId", agentId);
        }

        // Only update fields that are typically subject to change or correction
        vehicle.setColor(request.getColor());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setInsuranceCardFront(request.getInsuranceCardFront());
        vehicle.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        vehicle.setRevenueLicenseImage(request.getRevenueLicenseImage());
        vehicle.setVehicleImageFront(request.getVehicleImageFront());
        vehicle.setVehicleImageBack(request.getVehicleImageBack());
        vehicle.setVehicleImageSide(request.getVehicleImageSide());
        vehicle.setVehicleImageInside(request.getVehicleImageInside());

        return toResponse(vehicleRepository.save(vehicle));
    }

    /**
     * Updates the operational status of a vehicle (e.g., available, booked, maintenance).
     */
    public VehicleResponse updateStatus(Long agentId, Long vehicleId, String status) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle", "agentId", agentId);
        }
        
        vehicle.setStatus(status);
        // Sync the boolean availability flag with the status string
        vehicle.setIsAvailable(status.equals("available"));
        return toResponse(vehicleRepository.save(vehicle));
    }

    /**
     * Updates the system lifecycle status of a vehicle (e.g., active, retired).
     */
    public VehicleResponse updateLifecycle(Long agentId, Long vehicleId, String lifecycleStatus) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle", "agentId", agentId);
        }
        
        vehicle.setLifecycleStatus(lifecycleStatus);
        return toResponse(vehicleRepository.save(vehicle));
    }

    /**
     * Removes a vehicle from the agent's fleet.
     * Prevents deletion if the vehicle is currently associated with an active booking.
     */
    public void deleteVehicle(Long agentId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle", "agentId", agentId);
        }
        
        // Safety check: Don't delete assets currently in use
        if (vehicle.getStatus().equals("booked")) {
            throw new BadRequestException("Cannot delete a vehicle that is currently booked");
        }
        
        vehicleRepository.delete(vehicle);
    }

    /**
     * Maps a Vehicle entity to a detailed VehicleResponse DTO.
     */
    private VehicleResponse toResponse(Vehicle v) {
        return VehicleResponse.builder()
                .id(v.getId())
                .ownerFirstName(v.getOwnerFirstName())
                .ownerLastName(v.getOwnerLastName())
                .nicNumber(v.getNicNumber())
                .addressLine1(v.getAddressLine1())
                .addressLine2(v.getAddressLine2())
                .mobileNumber(v.getMobileNumber())
                .secondaryMobileNumber(v.getSecondaryMobileNumber())
                .ownerEmail(v.getOwnerEmail())
                .vehicleType(v.getVehicleType())
                .brand(v.getBrand())
                .model(v.getModel())
                .color(v.getColor())
                .capacity(v.getCapacity())
                .yearOfManufacture(v.getYearOfManufacture())
                .registration(v.getRegistration())
                .insuranceExpiryDate(v.getInsuranceExpiryDate())
                .vehicleImageFront(v.getVehicleImageFront())
                .vehicleImageBack(v.getVehicleImageBack())
                .vehicleImageSide(v.getVehicleImageSide())
                .vehicleImageInside(v.getVehicleImageInside())
                .status(v.getStatus())
                .lifecycleStatus(v.getLifecycleStatus())
                .assignedDriverName(v.getAssignedDriverName())
                .build();
    }
}
