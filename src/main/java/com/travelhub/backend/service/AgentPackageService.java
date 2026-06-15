package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.PackageRequest;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.PackageItinerary;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.PackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AgentPackageService manages the travel packages created and managed by agents.
 * It handles the full lifecycle of a package, including its detailed itineraries and approval status.
 */
@Service
@Transactional
public class AgentPackageService {

    private final PackageRepository packageRepository;
    private final AgentRepository agentRepository;

    /**
     * Constructor injection for package and agent data access.
     */
    public AgentPackageService(PackageRepository packageRepository, AgentRepository agentRepository) {
        this.packageRepository = packageRepository;
        this.agentRepository = agentRepository;
    }

    /**
     * Retrieves all travel packages associated with a specific agent.
     */
    public List<PackageResponse> getAgentPackages(Long agentId) {
        return packageRepository.findByAgentId(agentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new travel package for an agent.
     * New packages are initialized with 'Pending' status and are not active until approved by admin.
     */
    public PackageResponse createPackage(Long agentId, PackageRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        Package pkg = new Package();
        updatePackageFromRequest(pkg, request);
        pkg.setAgent(agent);
        // Initial status settings
        pkg.setApplicationStatus("Pending");
        pkg.setIsActive(false);

        Package saved = packageRepository.save(pkg);
        return mapToResponse(saved);
    }

    /**
     * Updates an existing travel package.
     * Includes security checks to ensure the package belongs to the requesting agent.
     */
    public PackageResponse updatePackage(Long agentId, Long packageId, PackageRequest request) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", packageId));

        // Security check: Ensure agent ownership
        if (!pkg.getAgent().getId().equals(agentId)) {
            throw new RuntimeException("Unauthorized access to package");
        }

        updatePackageFromRequest(pkg, request);
        Package saved = packageRepository.save(pkg);
        return mapToResponse(saved);
    }

    /**
     * Deletes a specific travel package after verifying agent ownership.
     */
    public void deletePackage(Long agentId, Long packageId) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", packageId));

        // Security check: Ensure agent ownership
        if (!pkg.getAgent().getId().equals(agentId)) {
            throw new RuntimeException("Unauthorized access to package");
        }

        packageRepository.delete(pkg);
    }

    /**
     * Internal helper to populate/update a Package entity from a PackageRequest DTO.
     * Handles complex mapping of daily itineraries and activity lists.
     */
    private void updatePackageFromRequest(Package pkg, PackageRequest request) {
        pkg.setPackageName(request.getPackageName());
        pkg.setDestination(request.getDestination());
        pkg.setStartPlace(request.getStartPlace());
        pkg.setEndPlace(request.getEndPlace());
        pkg.setPriceFrom(request.getPriceFrom());
        pkg.setPriceTo(request.getPriceTo());
        pkg.setDuration(request.getDuration());
        pkg.setCategory(request.getCategory());
        pkg.setImageUrl(request.getImageUrl());
        pkg.setFestivalDetails(request.getFestivalDetails());
        pkg.setTrending(request.getTrending());
        pkg.setDistrict(request.getDistrict());

        // Process itinerary updates
        if (request.getItinerary() != null) {
            List<PackageItinerary> itinerary = request.getItinerary().stream().map(dayReq -> {
                PackageItinerary day = new PackageItinerary();
                day.setDayNumber(dayReq.getDayNumber());
                day.setTitle(dayReq.getTitle());
                day.setDescription(dayReq.getDescription());
                // Join activity list into a single comma-separated string for database storage
                if (dayReq.getActivities() != null) {
                    day.setActivities(String.join(",", dayReq.getActivities()));
                }
                day.setPkg(pkg);
                return day;
            }).collect(Collectors.toList());
            
            // Manage the collection to maintain JPA state and avoid duplicate entries
            if (pkg.getItinerary() != null) {
                pkg.getItinerary().clear();
                pkg.getItinerary().addAll(itinerary);
            } else {
                pkg.setItinerary(itinerary);
            }
        }
    }

    /**
     * Maps a Package entity to a summary response DTO.
     */
    private PackageResponse mapToResponse(Package pkg) {
        PackageResponse res = new PackageResponse();
        res.setId(pkg.getId());
        res.setPackageName(pkg.getPackageName());
        res.setDestination(pkg.getDestination());
        res.setStartPlace(pkg.getStartPlace());
        res.setEndPlace(pkg.getEndPlace());
        res.setPriceFrom(pkg.getPriceFrom());
        res.setPriceTo(pkg.getPriceTo());
        res.setDuration(pkg.getDuration());
        res.setCategory(pkg.getCategory());
        res.setImageUrl(pkg.getImageUrl());
        res.setRating(pkg.getRating() != null ? pkg.getRating() : 0.0);
        res.setReviewCount(pkg.getReviewCount() != null ? pkg.getReviewCount() : 0);
        res.setFestivalDetails(pkg.getFestivalDetails());
        res.setTrending(pkg.getTrending());
        res.setAgentName(pkg.getAgent() != null ? pkg.getAgent().getUser().getName() : null);
        res.setDistrict(pkg.getDistrict());
        return res;
    }
}
