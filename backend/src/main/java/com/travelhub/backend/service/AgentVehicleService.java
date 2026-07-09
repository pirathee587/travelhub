package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.VehicleRequest;
import com.travelhub.backend.dto.response.VehicleResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Vehicle;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentVehicleService {

    private final VehicleRepository vehicleRepository;
    private final AgentRepository agentRepository;

    /**
     * Returns all vehicles owned by the given agent.
     * If lifecycleStatus is provided, results are filtered (e.g. "active", "inactive").
     */
    public List<VehicleResponse> getAllVehicles(Long agentId, String lifecycleStatus) {
        Agent agent = getAgentOrThrow(agentId);
        Long realAgentId = agent.getId();
        List<Vehicle> vehicles;
        if (lifecycleStatus != null) {
            // Filter by lifecycle status when requested by the UI (e.g. active/inactive).
            vehicles = vehicleRepository.findByAgentIdAndLifecycleStatus(realAgentId, lifecycleStatus);
        } else {
            // Otherwise return all vehicles for the agent.
            vehicles = vehicleRepository.findByAgentId(realAgentId);
        }

        // Convert entities to response DTOs.
        return vehicles.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Returns a single vehicle by id, enforcing that it belongs to the given agent.
     * Throws ResourceNotFoundException if the vehicle doesn't exist or doesn't belong to the agent.
     */
    public VehicleResponse getVehicleById(Long agentId, Long vehicleId) {
        // Find vehicle by id.
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        Agent agent = getAgentOrThrow(agentId);
        // Enforce ownership: agent can only access their own vehicles.
        if (!vehicle.getAgent().getId().equals(agent.getId())) {
            throw new ResourceNotFoundException("Vehicle", "agentId", agentId);
        }
        return toResponse(vehicle);
    }

    /**
     * Creates a new vehicle under the given agent.
     * Sets initial defaults:
     * - status: "available"
     * - lifecycleStatus: "active"
     * - isAvailable: true
     */
    public VehicleResponse createVehicle(Long agentId, VehicleRequest request) {
        // Ensure agent exists (prevents orphan vehicle records).
        Agent agent = getAgentOrThrow(agentId);

        // Build the Vehicle entity from the request (includes identity fields and images).
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
                .status("available")
                .lifecycleStatus("active")
                .isAvailable(true)
                .build();

        // Persist and return the created vehicle.
        return toResponse(vehicleRepository.save(vehicle));
    }

    /**
     * Updates an existing vehicle (belonging to the agent).
     * Some fields are intentionally "locked" (not updated here) to preserve identity/verification fields.
     */
    public VehicleResponse updateVehicle(Long agentId, Long vehicleId, VehicleRequest request) {
        // Lookup and enforce ownership.
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        Agent agent = getAgentOrThrow(agentId);
        if (!vehicle.getAgent().getId().equals(agent.getId())) {
            throw new ResourceNotFoundException("Vehicle", "id", vehicleId);
        }

        // Editable owner/vehicle identity fields (as permitted by current business rules).
        vehicle.setOwnerFirstName(request.getOwnerFirstName());
        vehicle.setOwnerLastName(request.getOwnerLastName());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());

        // Always editable
        vehicle.setColor(request.getColor());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setInsuranceCardFront(request.getInsuranceCardFront());
        vehicle.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        vehicle.setRevenueLicenseImage(request.getRevenueLicenseImage());
        vehicle.setVehicleImageFront(request.getVehicleImageFront());
        vehicle.setVehicleImageBack(request.getVehicleImageBack());
        vehicle.setVehicleImageSide(request.getVehicleImageSide());
        vehicle.setVehicleImageInside(request.getVehicleImageInside());

        // Still locked (not updated here): nicNumber, registration, yearOfManufacture.

        // Persist changes and return updated DTO.
        return toResponse(vehicleRepository.save(vehicle));
    }

    /**
     * Updates the vehicle availability status (e.g. "available", "booked").
     * Also keeps the boolean isAvailable field in sync with the status string.
     */
    public VehicleResponse updateStatus(Long agentId, Long vehicleId, String status) {
        // Lookup and enforce ownership.
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        Agent agent = getAgentOrThrow(agentId);
        if (!vehicle.getAgent().getId().equals(agent.getId())) {
            throw new ResourceNotFoundException("Vehicle", "agentId", agentId);
        }

        // Update status + keep isAvailable flag consistent with status string.
        vehicle.setStatus(status);
        vehicle.setIsAvailable(status.equals("available"));
        return toResponse(vehicleRepository.save(vehicle));
    }

    /**
     * Updates the vehicle lifecycle status for the agent (e.g. "active", "inactive").
     */
    public VehicleResponse updateLifecycle(Long agentId, Long vehicleId, String lifecycleStatus) {
        // Lookup and enforce ownership.
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        Agent agent = getAgentOrThrow(agentId);
        if (!vehicle.getAgent().getId().equals(agent.getId())) {
            throw new ResourceNotFoundException("Vehicle", "agentId", agentId);
        }

        // Update lifecycle status (e.g. active/inactive).
        vehicle.setLifecycleStatus(lifecycleStatus);
        return toResponse(vehicleRepository.save(vehicle));
    }

    /**
     * Deletes a vehicle owned by the agent.
     * Prevents deletion when the vehicle is currently "booked".
     */
    public void deleteVehicle(Long agentId, Long vehicleId) {
        // Lookup and enforce ownership.
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        Agent agent = getAgentOrThrow(agentId);
        if (!vehicle.getAgent().getId().equals(agent.getId())) {
            throw new ResourceNotFoundException("Vehicle", "agentId", agentId);
        }

        // Prevent deletion if the vehicle is currently in use by a booking.
        if (vehicle.getStatus().equals("booked")) {
            throw new BadRequestException("Cannot delete a vehicle that is currently booked");
        }

        // Perform vehicle deletion.
        vehicleRepository.delete(vehicle);
    }

    private Agent getAgentOrThrow(Long agentId) {
        return agentRepository.findByOwnerId(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentId));
    }

    /**
     * Maps Vehicle entity -> API response DTO.
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
