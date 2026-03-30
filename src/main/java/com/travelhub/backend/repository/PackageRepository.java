package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByIsActiveTrue();
    List<Package> findByCategory(String category);
    List<Package> findByTrendingTrue();
    List<Package> findByAgentId(Long agentId);
}