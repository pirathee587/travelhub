package com.travelhub.backend.controller.tourist;

import com.travelhub.backend.controller.PackageController;
import com.travelhub.backend.dto.response.PackageDetailResponse;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.service.PackageService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class PackageControllerTest {

    @Mock
    private PackageService packageService;

    @InjectMocks
    private PackageController packageController;

    @Test(description = "GET /api/packages without filter should return 200 with all packages")
    public void getAllPackages_NoFilter_ShouldReturn200() {
        PackageResponse pkg = PackageResponse.builder().id(1L).packageName("Colombo Explorer").build();
        when(packageService.getAllPackages()).thenReturn(List.of(pkg));

        ResponseEntity<List<PackageResponse>> response = packageController.getAllPackages(null, null);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());
        assertEquals(response.getBody().size(), 1);
        verify(packageService, times(1)).getAllPackages();
    }

    @Test(description = "GET /api/packages?district=Kandy should filter by district")
    public void getAllPackages_WithDistrict_ShouldFilterByDistrict() {
        PackageResponse pkg = PackageResponse.builder().id(2L).packageName("Kandy Cultural Tour").district("Kandy").build();
        when(packageService.getPackagesByDistrict("Kandy")).thenReturn(List.of(pkg));

        ResponseEntity<List<PackageResponse>> response = packageController.getAllPackages(null, "Kandy");

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertEquals(response.getBody().size(), 1);
        verify(packageService, times(1)).getPackagesByDistrict("Kandy");
    }

    @Test(description = "GET /api/packages?category=Adventure should filter by category")
    public void getAllPackages_WithCategory_ShouldFilterByCategory() {
        PackageResponse pkg = PackageResponse.builder().id(3L).packageName("Ella Hiking").category("Adventure").build();
        when(packageService.getPackagesByCategory("Adventure")).thenReturn(List.of(pkg));

        ResponseEntity<List<PackageResponse>> response = packageController.getAllPackages("Adventure", null);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertEquals(response.getBody().size(), 1);
        verify(packageService, times(1)).getPackagesByCategory("Adventure");
    }

    @Test(description = "GET /api/packages/{id} should return package detail")
    public void getPackageById_ShouldReturn200WithDetails() {
        PackageDetailResponse detail = PackageDetailResponse.builder().id(1L).packageName("Colombo Explorer").build();
        when(packageService.getPackageById(1L)).thenReturn(detail);

        ResponseEntity<PackageDetailResponse> response = packageController.getPackageById(1L);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());
        assertEquals(response.getBody().getPackageName(), "Colombo Explorer");
        verify(packageService, times(1)).getPackageById(1L);
    }

    @Test(description = "GET /api/packages/trending should return trending packages")
    public void getTrendingPackages_ShouldReturn200() {
        PackageResponse pkg = PackageResponse.builder().id(1L).packageName("Trending Sigiriya").build();
        when(packageService.getTrendingPackages()).thenReturn(List.of(pkg));

        ResponseEntity<List<PackageResponse>> response = packageController.getTrendingPackages();

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertEquals(response.getBody().size(), 1);
        verify(packageService, times(1)).getTrendingPackages();
    }
}
