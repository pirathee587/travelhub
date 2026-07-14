package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.dto.request.VehicleOwnerRequest;
import com.travelhub.backend.dto.response.VehicleOwnerResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.VehicleOwner;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.VehicleOwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleOwnerService {

    private final VehicleOwnerRepository vehicleOwnerRepository;
    private final AgentRepository agentRepository;

    /**
     * Retrieve all vehicle owners associated with a specific agent.
     */
    public List<VehicleOwnerResponse> getAllOwners(Long agentId) {
        Agent agent = agentRepository.findByOwnerId(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentId));
        Long realAgentId = agent.getId();

        List<VehicleOwner> owners = vehicleOwnerRepository.findByAgentId(realAgentId);
        return owners.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Retrieve a specific owner details.
     */
    public VehicleOwnerResponse getOwnerById(Long agentId, Long ownerId) {
        Agent agent = agentRepository.findByOwnerId(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentId));
        Long realAgentId = agent.getId();

        VehicleOwner owner = vehicleOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleOwner", "id", ownerId));
        if (owner.getAgent() != null && !owner.getAgent().getId().equals(realAgentId)) {
            throw new BadRequestException("Owner does not belong to this agent");
        }
        return toResponse(owner);
    }

    /**
     * Create a new vehicle owner.
     */
    public VehicleOwnerResponse createOwner(Long agentId, VehicleOwnerRequest request) {
        Agent agent = agentRepository.findByOwnerId(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentId));

        // Check if NIC number is already registered
        Optional<VehicleOwner> existing = vehicleOwnerRepository.findByNicNumber(request.getNicNumber());
        if (existing.isPresent()) {
            throw new BadRequestException("An owner with this NIC number is already registered.");
        }

        VehicleOwner owner = VehicleOwner.builder()
                .agent(agent)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .nicNumber(request.getNicNumber())
                .nicFrontImage(request.getNicFrontImage())
                .nicRearImage(request.getNicRearImage())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .mobileNumber(request.getMobileNumber())
                .secondaryMobileNumber(request.getSecondaryMobileNumber())
                .email(request.getEmail())
                .build();

        return toResponse(vehicleOwnerRepository.save(owner));
    }

    /**
     * Update an existing vehicle owner's details.
     */
    public VehicleOwnerResponse updateOwner(Long agentId, Long ownerId, VehicleOwnerRequest request) {
        Agent agent = agentRepository.findByOwnerId(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentId));
        Long realAgentId = agent.getId();

        VehicleOwner owner = vehicleOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleOwner", "id", ownerId));
        if (owner.getAgent() != null && !owner.getAgent().getId().equals(realAgentId)) {
            throw new BadRequestException("Owner does not belong to this agent");
        }

        // Check NIC uniqueness if NIC is changing
        if (request.getNicNumber() != null && !request.getNicNumber().equals(owner.getNicNumber())) {
            Optional<VehicleOwner> existing = vehicleOwnerRepository.findByNicNumber(request.getNicNumber());
            if (existing.isPresent()) {
                throw new BadRequestException("An owner with this NIC number is already registered.");
            }
            owner.setNicNumber(request.getNicNumber());
        }

        owner.setFirstName(request.getFirstName());
        owner.setLastName(request.getLastName());
        owner.setNicFrontImage(request.getNicFrontImage());
        owner.setNicRearImage(request.getNicRearImage());
        owner.setAddressLine1(request.getAddressLine1());
        owner.setAddressLine2(request.getAddressLine2());
        owner.setMobileNumber(request.getMobileNumber());
        owner.setSecondaryMobileNumber(request.getSecondaryMobileNumber());
        owner.setEmail(request.getEmail());

        return toResponse(vehicleOwnerRepository.save(owner));
    }

    /**
     * Map VehicleOwner entity to VehicleOwnerResponse DTO.
     */
    public VehicleOwnerResponse toResponse(VehicleOwner owner) {
        if (owner == null) return null;
        return VehicleOwnerResponse.builder()
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
}
