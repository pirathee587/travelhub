package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.VehicleOwnerResponse;
import com.travelhub.backend.dto.response.VehicleResponse;
import com.travelhub.backend.entity.Vehicle;
import com.travelhub.backend.entity.VehicleOwner;
import com.travelhub.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminVehicleService {

    private final VehicleRepository vehicleRepository;
    private final AgentNotificationService agentNotificationService;

    @Transactional(readOnly = true)
    public List<VehicleResponse> getPendingVehicles() {
        return vehicleRepository.findByLifecycleStatus("pending")
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehicles(String lifecycleStatus) {
        List<Vehicle> list;
        if (lifecycleStatus != null && !lifecycleStatus.isEmpty() && !"all".equalsIgnoreCase(lifecycleStatus)) {
            list = vehicleRepository.findByLifecycleStatus(lifecycleStatus.toLowerCase());
        } else {
            list = vehicleRepository.findAll();
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public VehicleResponse getVehicleDetail(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        return toResponse(vehicle);
    }

    @Transactional
    public VehicleResponse approveVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        vehicle.setLifecycleStatus("active");
        vehicle.setIsAvailable(true);
        Vehicle saved = vehicleRepository.save(vehicle);
        if (saved.getAgent() != null) {
            agentNotificationService.createNotification(
                    saved.getAgent(),
                    "vehicle",
                    "Vehicle Approved",
                    "Your vehicle with registration " + saved.getRegistration() + " has been approved and is now active."
            );
        }
        return toResponse(saved);
    }

    @Transactional
    public VehicleResponse rejectVehicle(Long vehicleId, String reason) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        vehicle.setLifecycleStatus("rejected");
        vehicle.setRejectionReason(reason);
        vehicle.setIsAvailable(false);
        Vehicle saved = vehicleRepository.save(vehicle);
        if (saved.getAgent() != null) {
            agentNotificationService.createNotification(
                    saved.getAgent(),
                    "vehicle",
                    "Vehicle Rejected",
                    "Your vehicle with registration " + saved.getRegistration() + " was rejected. Reason: " + reason
            );
        }
        return toResponse(saved);
    }

    private VehicleResponse toResponse(Vehicle v) {
        VehicleOwner owner = v.getOwner();
        VehicleOwnerResponse ownerRes = null;
        if (owner != null) {
            ownerRes = VehicleOwnerResponse.builder()
                    .id(owner.getId())
                    .firstName(owner.getFirstName())
                    .lastName(owner.getLastName())
                    .nicNumber(owner.getNicNumber())
                    .nicFrontImage(owner.getNicFrontImage())
                    .nicRearImage(owner.getNicRearImage())
                    .addressLine1(owner.getAddressLine1())
                    .addressLine2(owner.getAddressLine2())
                    .mobileNumber(owner.getMobileNumber())
                    .secondaryMobileNumber(owner.getSecondaryMobileNumber())
                    .email(owner.getEmail())
                    .build();
        }

        return VehicleResponse.builder()
                .id(v.getId())
                .owner(ownerRes)
                .ownerFirstName(owner != null ? owner.getFirstName() : null)
                .ownerLastName(owner != null ? owner.getLastName() : null)
                .nicNumber(owner != null ? owner.getNicNumber() : null)
                .addressLine1(owner != null ? owner.getAddressLine1() : null)
                .addressLine2(owner != null ? owner.getAddressLine2() : null)
                .mobileNumber(owner != null ? owner.getMobileNumber() : null)
                .secondaryMobileNumber(owner != null ? owner.getSecondaryMobileNumber() : null)
                .ownerEmail(owner != null ? owner.getEmail() : null)
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
                .rejectionReason(v.getRejectionReason())
                .build();
    }
}
