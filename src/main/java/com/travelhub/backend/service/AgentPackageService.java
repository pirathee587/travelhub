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

@Service
@Transactional
public class AgentPackageService {

    private final PackageRepository packageRepository;
    private final AgentRepository agentRepository;

    public AgentPackageService(PackageRepository packageRepository, AgentRepository agentRepository) {
        this.packageRepository = packageRepository;
        this.agentRepository = agentRepository;
    }

    public List<PackageResponse> getAgentPackages(Long agentId) {
        return packageRepository.findByAgentId(agentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PackageResponse createPackage(Long agentId, PackageRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        Package pkg = new Package();
        updatePackageFromRequest(pkg, request);
        pkg.setAgent(agent);
        pkg.setApplicationStatus("Pending");
        pkg.setIsActive(false);

        Package saved = packageRepository.save(pkg);
        return mapToResponse(saved);
    }

    public PackageResponse updatePackage(Long agentId, Long packageId, PackageRequest request) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", packageId));

        if (!pkg.getAgent().getId().equals(agentId)) {
            throw new RuntimeException("Unauthorized access to package");
        }

        updatePackageFromRequest(pkg, request);
        Package saved = packageRepository.save(pkg);
        return mapToResponse(saved);
    }

    public void deletePackage(Long agentId, Long packageId) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", packageId));

        if (!pkg.getAgent().getId().equals(agentId)) {
            throw new RuntimeException("Unauthorized access to package");
        }

        packageRepository.delete(pkg);
    }

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

        if (request.getItinerary() != null) {
            List<PackageItinerary> itinerary = request.getItinerary().stream().map(dayReq -> {
                PackageItinerary day = new PackageItinerary();
                day.setDayNumber(dayReq.getDayNumber());
                day.setTitle(dayReq.getTitle());
                day.setDescription(dayReq.getDescription());
                if (dayReq.getActivities() != null) {
                    day.setActivities(String.join(",", dayReq.getActivities()));
                }
                day.setPkg(pkg);
                return day;
            }).collect(Collectors.toList());
            
            if (pkg.getItinerary() != null) {
                pkg.getItinerary().clear();
                pkg.getItinerary().addAll(itinerary);
            } else {
                pkg.setItinerary(itinerary);
            }
        }
    }

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
