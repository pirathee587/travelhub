package com.travelhub.backend.unit.tourist;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ForbiddenException;
import com.travelhub.backend.dto.request.BookingRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.*;
import com.travelhub.backend.service.BookingCreationService;
import com.travelhub.backend.service.BookingService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.context.ApplicationEventPublisher;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class BookingCreationServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PackageRepository packageRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private AgentSettingsRepository agentSettingsRepository;

    @Mock
    private BookingService bookingService;

    @Mock
    private BookingHotelPreferenceRepository bookingHotelPreferenceRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private BookingCreationService bookingCreationService;

    @Test(description = "createBooking with valid parameters should create booking successfully")
    public void createBooking_ValidRequest_ShouldCreatePendingBooking() {
        User user = User.builder().id(1L).email("tourist@example.com").name("Tourist One").build();
        Package pkg = Package.builder().id(10L).packageName("Sigiriya Day Trip").duration("1 day").district("Matale").build();
        Hotel hotel = Hotel.builder().id(100L).hotelName("Sigiriya Village").district("Matale").build();

        BookingRequest request = new BookingRequest();
        request.setUserId(1L);
        request.setPackageId(10L);
        request.setHotelIds(List.of(100L));
        request.setStartDate(LocalDate.now().plusDays(7));
        request.setAdults(2);
        request.setChildren(0);
        request.setTotalPrice(250.0);

        Booking savedBooking = Booking.builder()
                .id(50L)
                .user(user)
                .pkg(pkg)
                .status("pending")
                .paymentStatus("UNPAID")
                .startDate(request.getStartDate())
                .totalPrice(250.0)
                .build();

        BookingResponse expectedResponse = BookingResponse.builder()
                .id(50L)
                .bookingId("BK00050")
                .packageName("Sigiriya Day Trip")
                .status("pending")
                .totalPrice(250.0)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(packageRepository.findById(10L)).thenReturn(Optional.of(pkg));
        when(hotelRepository.findById(100L)).thenReturn(Optional.of(hotel));
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(bookingService.getBookingById(50L)).thenReturn(expectedResponse);

        BookingResponse response = bookingCreationService.createBooking(request);

        assertNotNull(response);
        assertEquals(response.getId(), Long.valueOf(50L));
        assertEquals(response.getStatus(), "pending");
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(eventPublisher, times(1)).publishEvent(any());
    }

    @Test(description = "createBooking when user not found should throw RuntimeException")
    public void createBooking_UserNotFound_ShouldThrow() {
        BookingRequest request = new BookingRequest();
        request.setUserId(999L);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> bookingCreationService.createBooking(request));
        verify(bookingRepository, never()).save(any());
    }

    @Test(description = "createBooking when package not found should throw RuntimeException")
    public void createBooking_PackageNotFound_ShouldThrow() {
        User user = User.builder().id(1L).build();
        BookingRequest request = new BookingRequest();
        request.setUserId(1L);
        request.setPackageId(999L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(packageRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> bookingCreationService.createBooking(request));
    }

    @Test(description = "createBooking when hotel district mismatches package district should throw RuntimeException")
    public void createBooking_HotelDistrictMismatch_ShouldThrow() {
        User user = User.builder().id(1L).build();
        Package pkg = Package.builder().id(10L).district("Kandy").duration("2 days").build();
        Hotel hotel = Hotel.builder().id(100L).district("Galle").build();

        BookingRequest request = new BookingRequest();
        request.setUserId(1L);
        request.setPackageId(10L);
        request.setHotelIds(List.of(100L));
        request.setStartDate(LocalDate.now().plusDays(5));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(packageRepository.findById(10L)).thenReturn(Optional.of(pkg));
        when(hotelRepository.findById(100L)).thenReturn(Optional.of(hotel));

        RuntimeException ex = expectThrows(RuntimeException.class,
                () -> bookingCreationService.createBooking(request));
        assertTrue(ex.getMessage().contains("does not match package's district"));
    }

    @Test(description = "cancelBooking by booking owner for pending booking should cancel successfully")
    public void cancelBooking_PendingBookingByOwner_ShouldCancelSuccessfully() {
        User user = User.builder().id(1L).build();
        Booking booking = Booking.builder()
                .id(50L)
                .user(user)
                .status("pending")
                .paymentStatus("UNPAID")
                .build();

        BookingResponse expectedResponse = BookingResponse.builder()
                .id(50L)
                .status("cancelled")
                .build();

        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingService.getBookingById(50L)).thenReturn(expectedResponse);

        BookingResponse response = bookingCreationService.cancelBooking(50L, 1L);

        assertNotNull(response);
        assertEquals(booking.getStatus(), "cancelled");
        verify(bookingRepository, times(1)).save(booking);
        verify(eventPublisher, times(1)).publishEvent(any());
    }

    @Test(description = "cancelBooking by non-owner should throw ForbiddenException")
    public void cancelBooking_UnauthorizedUser_ShouldThrowForbiddenException() {
        User owner = User.builder().id(1L).build();
        Booking booking = Booking.builder().id(50L).user(owner).status("pending").build();

        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThrows(ForbiddenException.class, () -> bookingCreationService.cancelBooking(50L, 999L));
        verify(bookingRepository, never()).save(any());
    }

    @Test(description = "cancelBooking for paid confirmed booking should throw BadRequestException")
    public void cancelBooking_PaidBooking_ShouldThrowBadRequestException() {
        User user = User.builder().id(1L).build();
        Booking booking = Booking.builder()
                .id(50L)
                .user(user)
                .status("confirmed")
                .paymentStatus("PAID")
                .build();

        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThrows(BadRequestException.class, () -> bookingCreationService.cancelBooking(50L, 1L));
    }
}
