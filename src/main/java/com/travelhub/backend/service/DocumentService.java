package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.DocumentResponse;
import com.travelhub.backend.entity.Document;
import com.travelhub.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    // Get all documents for a user
    public List<DocumentResponse> getDocumentsByUserId(Long userId) {
        return documentRepository.findByUserId(userId)
                .stream()
                .map(this::toDocumentResponse)
                .collect(Collectors.toList());
    }

    // Get documents by type
    public List<DocumentResponse> getDocumentsByType(Long userId, String docType) {
        return documentRepository.findByUserId(userId)
                .stream()
                .filter(doc -> doc.getDocType().equalsIgnoreCase(docType))
                .map(this::toDocumentResponse)
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