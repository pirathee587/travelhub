package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPkgId(Long packageId);
    List<Review> findByHotelId(Long hotelId);
    List<Review> findByUserId(Long userId);
}