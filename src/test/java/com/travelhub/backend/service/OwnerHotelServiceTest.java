package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.ImageUploadResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.HotelImageRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OwnerHotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private HotelImageRepository hotelImageRepository;

    @Mock
    private ImageUploadService imageUploadService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private OwnerHotelService ownerHotelService;

    @Test
    void createHotel_savesEachUploadedImageToHotelImagesTable() throws Exception {
        User owner = new User();
        owner.setId(40L);
        when(userRepository.findById(40L)).thenReturn(Optional.of(owner));

        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> {
            Hotel hotel = invocation.getArgument(0);
            hotel.setId(101L);
            return hotel;
        });

        when(imageUploadService.uploadHotelImage(any(MultipartFile.class)))
                .thenReturn(new ImageUploadResponse("https://img1", "img1"))
                .thenReturn(new ImageUploadResponse("https://img2", "img2"))
                .thenReturn(new ImageUploadResponse("https://img3", "img3"))
                .thenReturn(new ImageUploadResponse("https://img4", "img4"));

        MockMultipartFile file1 = new MockMultipartFile("hotelImages", "a.jpg", "image/jpeg", "a".getBytes());
        MockMultipartFile file2 = new MockMultipartFile("hotelImages", "b.jpg", "image/jpeg", "b".getBytes());
        MockMultipartFile file3 = new MockMultipartFile("hotelImages", "c.jpg", "image/jpeg", "c".getBytes());

        OwnerHotelRequest request = OwnerHotelRequest.builder()
                .hotelName("Test Hotel")
                .destination("Colombo")
                .build();

        ownerHotelService.createHotel(request, null, 40L, List.of(file1, file2, file3));

        verify(hotelImageRepository, times(3)).save(any());
        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
        verify(hotelRepository).save(hotelCaptor.capture());
        assertEquals("https://img1", hotelCaptor.getValue().getImageUrl());
        // 1 call for hotel.imageUrl (files.get(0)) + 3 calls in the gallery loop = 4 total
        verify(imageUploadService, times(4)).uploadHotelImage(any(MultipartFile.class));
    }
}
