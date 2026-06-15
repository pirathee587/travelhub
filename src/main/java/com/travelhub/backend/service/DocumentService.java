package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.DocumentResponse;
import com.travelhub.backend.entity.Document;
import com.travelhub.backend.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

/**
 * DocumentService handles the retrieval and categorization of user-related files.
 * This includes travel itineraries, booking invoices, and identity verification documents.
 */
@Service
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;

    /**
     * Constructor injection for document data access.
     */
    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    /**
     * Retrieves all documents associated with a specific user account.
     */
    public List<DocumentResponse> getDocumentsByUserId(Long userId) {
        return documentRepository.findByUserId(userId)
                .stream()
                .map(this::toDocumentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves documents for a user filtered by their specific type (e.g., "ID_CARD", "INVOICE").
     * Performs a case-insensitive match on the document type string.
     */
    public List<DocumentResponse> getDocumentsByType(Long userId, String docType) {
        return documentRepository.findByUserId(userId)
                .stream()
                .filter(doc -> doc.getDocType().equalsIgnoreCase(docType))
                .map(this::toDocumentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single document's metadata by its unique ID.
     */
    public DocumentResponse getDocumentById(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        return toDocumentResponse(doc);
    }

    /**
     * Maps a Document entity to its response DTO.
     * Includes logic to resolve the name of the associated travel package if the document is linked to a booking.
     */
    private DocumentResponse toDocumentResponse(Document doc) {
        String bookingName = null;
        // Traverse relationships to find the package name for context
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