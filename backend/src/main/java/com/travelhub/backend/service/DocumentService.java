package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.DocumentResponse;
import com.travelhub.backend.entity.Document;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.DocumentRepository;
import com.travelhub.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final BookingRepository bookingRepository;

    // Get all documents for a user (including dynamic Invoices and Receipts)
    public List<DocumentResponse> getDocumentsByUserId(Long userId) {
        List<DocumentResponse> list = new java.util.ArrayList<>(
            documentRepository.findByUserId(userId)
                .stream()
                .map(this::toDocumentResponse)
                .toList()
        );

        List<Booking> bookings = bookingRepository.findByUserId(userId);
        for (Booking booking : bookings) {
            String packageName = booking.getPkg() != null ? booking.getPkg().getPackageName() : "Travel Package";
            
            // Dynamic Invoice (available for all bookings)
            list.add(DocumentResponse.builder()
                    .id(booking.getId())
                    .title("Invoice for " + packageName)
                    .docType("invoice")
                    .fileSize("12 KB")
                    .filePath("/api/tourist/documents/invoice/" + booking.getId() + "/download")
                    .createdAt(booking.getCreatedAt())
                    .bookingName(packageName)
                    .build());

            // Dynamic Receipt (available only for Paid / Refunded bookings)
            String status = booking.getStatus();
            if ("Paid".equalsIgnoreCase(status) || "Refunded".equalsIgnoreCase(status)) {
                list.add(DocumentResponse.builder()
                        .id(booking.getId())
                        .title("Receipt for " + packageName)
                        .docType("receipt")
                        .fileSize("15 KB")
                        .filePath("/api/tourist/documents/receipt/" + booking.getId() + "/download")
                        .createdAt(booking.getCreatedAt())
                        .bookingName(packageName)
                        .build());
            }
        }

        // Sort by createdAt descending
        list.sort((d1, d2) -> {
            if (d1.getCreatedAt() == null) return 1;
            if (d2.getCreatedAt() == null) return -1;
            return d2.getCreatedAt().compareTo(d1.getCreatedAt());
        });

        return list;
    }

    // Get documents by type
    public List<DocumentResponse> getDocumentsByType(Long userId, String docType) {
        return getDocumentsByUserId(userId)
                .stream()
                .filter(doc -> doc.getDocType().equalsIgnoreCase(docType))
                .collect(Collectors.toList());
    }

    // Get single document
    public DocumentResponse getDocumentById(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        return toDocumentResponse(doc);
    }

    // Map Document → DocumentResponse
    private DocumentResponse toDocumentResponse(Document doc) {
        String bookingName = null;
        if (doc.getBooking() != null && doc.getBooking().getPkg() != null) {
            bookingName = doc.getBooking().getPkg().getPackageName();
        }

        return DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .docType(doc.getDocType())
                .fileSize(doc.getFileSize())
                .filePath(doc.getFilePath())
                .createdAt(doc.getCreatedAt())
                .bookingName(bookingName)
                .build();
    }
}