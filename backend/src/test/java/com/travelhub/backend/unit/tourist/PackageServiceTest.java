package com.travelhub.backend.unit.tourist;

import com.travelhub.backend.entity.Package;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.service.AgentRatingCalculator;
import com.travelhub.backend.service.PackageService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class PackageServiceTest {

    @Mock
    private PackageRepository packageRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private AgentRatingCalculator agentRatingCalculator;

    @InjectMocks
    private PackageService packageService;

    @Test(description = "getAllPackages should return approved active packages")
    public void getAllPackages_ShouldReturnApprovedPackages() {
        Package pkg = Package.builder()
                .id(1L)
                .packageName("Colombo City Tour")
                .applicationStatus("Approved")
                .isActive(true)
                .build();

        when(packageRepository.findByIsActiveTrue()).thenReturn(List.of(pkg));
        when(reviewRepository.getAverageRatingsByPackageIds(anyList())).thenReturn(Map.of());
        when(reviewRepository.getReviewCountsByPackageIds(anyList())).thenReturn(Map.of());

        var result = packageService.getAllPackages();

        assertNotNull(result);
        assertEquals(result.size(), 1);
        verify(packageRepository, times(1)).findByIsActiveTrue();
    }

    @Test(description = "getAllPackages should exclude non-approved packages")
    public void getAllPackages_ShouldExcludeNonApprovedPackages() {
        Package pending = Package.builder()
                .id(2L)
                .packageName("Pending Tour")
                .applicationStatus("Pending")
                .isActive(true)
                .build();

        when(packageRepository.findByIsActiveTrue()).thenReturn(List.of(pending));

        var result = packageService.getAllPackages();

        // Pending packages should be filtered out → empty result
        assertTrue(result.isEmpty());
    }

    @Test(description = "getPackageById should throw when package not found")
    public void getPackageById_WhenNotFound_ShouldThrow() {
        when(packageRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> packageService.getPackageById(99L));
    }

    @Test(description = "getPackagesByAgentId should return approved active packages for agent")
    public void getPackagesByAgentId_ShouldReturnAgentPackages() {
        Package pkg = Package.builder()
                .id(1L)
                .packageName("Safari Package")
                .applicationStatus("Approved")
                .isActive(true)
                .build();

        when(packageRepository.findByAgent_Id(10L)).thenReturn(List.of(pkg));
        when(reviewRepository.getAverageRatingsByPackageIds(anyList())).thenReturn(Map.of());
        when(reviewRepository.getReviewCountsByPackageIds(anyList())).thenReturn(Map.of());

        var result = packageService.getPackagesByAgentId(10L);

        assertEquals(result.size(), 1);
        verify(packageRepository, times(1)).findByAgent_Id(10L);
    }
}
