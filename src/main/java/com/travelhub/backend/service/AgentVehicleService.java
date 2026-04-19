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

    public List<VehicleResponse> getAllVehicles(Long agentId, String lifecycleStatus) {
        List<Vehicle> vehicles;
        if (lifecycleStatus != null) {
            vehicles = vehicleRepository.findByAgentIdAndLifecycleStatus(agentId, lifecycleStatus);
        } else {
            vehicles = vehicleRepository.findByAgentId(agentId);
        }
        return vehicles.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public VehicleResponse getVehicleById(Long agentId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle not found for this agent");
        }
        return toResponse(vehicle);
    }

    public VehicleResponse createVehicle(Long agentId, VehicleRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

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

        return toResponse(vehicleRepository.save(vehicle));
    }

    public VehicleResponse updateVehicle(Long agentId, Long vehicleId, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle not found for this agent");
        }

        // Only update editable fields
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

    public VehicleResponse updateStatus(Long agentId, Long vehicleId, String status) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle not found for this agent");
        }
        vehicle.setStatus(status);
        vehicle.setIsAvailable(status.equals("available"));
        return toResponse(vehicleRepository.save(vehicle));
    }

    public VehicleResponse updateLifecycle(Long agentId, Long vehicleId, String lifecycleStatus) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle not found for this agent");
        }
        vehicle.setLifecycleStatus(lifecycleStatus);
        return toResponse(vehicleRepository.save(vehicle));
    }

    public void deleteVehicle(Long agentId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        if (!vehicle.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Vehicle not found for this agent");
        }
        if (vehicle.getStatus().equals("booked")) {
            throw new BadRequestException("Cannot delete a vehicle that is currently booked");
        }
        vehicleRepository.delete(vehicle);
    }

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