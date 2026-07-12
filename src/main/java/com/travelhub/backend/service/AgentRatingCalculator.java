package com.travelhub.backend.service;

import com.travelhub.backend.entity.Package;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AgentRatingCalculator {

    private final PackageRepository packageRepository;
    private final ReviewRepository reviewRepository;

    public Double getAgentRating(Long agentId) {
        List<Package> packages = packageRepository.findByAgentId(agentId)
                .stream()
                .filter(p -> "Approved".equalsIgnoreCase(p.getApplicationStatus())
                        && Boolean.TRUE.equals(p.getIsActive()))
                .collect(Collectors.toList());

        if (packages.isEmpty()) {
            return 0.0;
        }

        List<Long> packageIds = packages.stream().map(Package::getId).collect(Collectors.toList());
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByPackageIds(packageIds);

        double sum = 0.0;
        int count = 0;
        for (Package pkg : packages) {
            Double r = avgRatings.get(pkg.getId());
            if (r != null && r > 0.0) {
                sum += r;
                count++;
            }
        }
        return count > 0 ? Math.round((sum / count) * 10.0) / 10.0 : 0.0;
    }

    public Map<Long, Double> getAgentRatings(List<Long> agentIds) {
        if (agentIds == null || agentIds.isEmpty()) return Collections.emptyMap();

        List<Package> packages = packageRepository.findByIsActiveTrue().stream()
                .filter(p -> "Approved".equalsIgnoreCase(p.getApplicationStatus())
                        && p.getAgent() != null
                        && agentIds.contains(p.getAgent().getId()))
                .collect(Collectors.toList());

        List<Long> packageIds = packages.stream().map(Package::getId).collect(Collectors.toList());
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByPackageIds(packageIds);

        Map<Long, List<Package>> packagesByAgentId = packages.stream()
                .collect(Collectors.groupingBy(p -> p.getAgent().getId()));

        return agentIds.stream().collect(Collectors.toMap(
                id -> id,
                id -> {
                    List<Package> agentPkgs = packagesByAgentId.get(id);
                    if (agentPkgs == null || agentPkgs.isEmpty()) {
                        return 0.0;
                    }
                    double sum = 0.0;
                    int count = 0;
                    for (Package pkg : agentPkgs) {
                        Double r = avgRatings.get(pkg.getId());
                        if (r != null && r > 0.0) {
                            sum += r;
                            count++;
                        }
                    }
                    return count > 0 ? Math.round((sum / count) * 10.0) / 10.0 : 0.0;
                }
        ));
    }
}
