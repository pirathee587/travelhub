package com.travelhub.backend.repository;

import com.travelhub.backend.entity.PackageItinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageItineraryRepository extends JpaRepository<PackageItinerary, Long> {

    List<PackageItinerary> findByPkgIdOrderByDayNumberAsc(Long packageId);

    void deleteByPkgId(Long packageId);
}