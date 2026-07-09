package com.travelhub.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.Comparator;
import java.time.format.DateTimeFormatter;

/**
 * ReceiptService handles the automated generation of PDF-based financial receipts.
 * It uses the OpenPDF library to construct professional transaction documents for travel bookings.
 */
@Service
public class ReceiptService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Constructor injection for booking and payment data required for receipt content.
     */
    public ReceiptService(BookingRepository bookingRepository, PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    /**
     * Generates a digital payment receipt for a specific booking.
     * Constructs a multi-section PDF containing customer details, payment metadata, and a booking summary.
     * @return byte array representing the PDF document.
     */
    @Transactional(readOnly = true)
    public byte[] generateBookingReceipt(Long bookingId) throws Exception {
        // Resolve associated business entities
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        // Retrieve the most recent payment record for this booking
        Payment payment = paymentRepository.findByBookingId(bookingId).stream()
                .max(Comparator.comparing(Payment::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "bookingId", bookingId));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);

        document.open();

        // Standardized font definitions for consistent branding
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLACK);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);

        // ── Document Header ────────────────────────────────
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        
        PdfPCell titleCell = new PdfPCell(new Phrase("TravelHub Sri Lanka", titleFont));
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        headerTable.addCell(titleCell);

        PdfPCell subTitleCell = new PdfPCell(new Phrase("OFFICIAL PAYMENT RECEIPT", subTitleFont));
        subTitleCell.setBorder(Rectangle.NO_BORDER);
        subTitleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        subTitleCell.setPaddingTop(10f);
        headerTable.addCell(subTitleCell);

        document.add(headerTable);
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("----------------------------------------------------------------------------------------------------------------------------------"));
        document.add(new Paragraph("\n"));

        // ── Stakeholder & Payment Information ───────────────
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingBefore(10f);

        // Section Headers
        addTableCell(infoTable, "CUSTOMER DETAILS", boldFont, true);
        addTableCell(infoTable, "PAYMENT DETAILS", boldFont, true);

        // Customer Row
        addTableCell(infoTable, "Name: " + booking.getUser().getName(), normalFont, false);
        addTableCell(infoTable, "Receipt No: " + payment.getTransactionId(), normalFont, false);

        // Contact Row
        addTableCell(infoTable, "Email: " + booking.getUser().getEmail(), normalFont, false);
        addTableCell(infoTable, "Date: " + payment.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), normalFont, false);

        // Status Row
        addTableCell(infoTable, "Phone: " + (booking.getUser().getTelephone() != null ? booking.getUser().getTelephone() : "N/A"), normalFont, false);
        addTableCell(infoTable, "Status: " + payment.getStatus().toUpperCase(), boldFont, false);

        document.add(infoTable);
        document.add(new Paragraph("\n"));

        // ── Transaction Summary Table ───────────────────────
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(100);
        summaryTable.setSpacingBefore(20f);
        summaryTable.setWidths(new float[]{3f, 1f});

        // Table Header Row
        PdfPCell h1 = new PdfPCell(new Phrase("Description", boldFont));
        h1.setBackgroundColor(Color.LIGHT_GRAY);
        h1.setPadding(8f);
        summaryTable.addCell(h1);

        PdfPCell h2 = new PdfPCell(new Phrase("Amount", boldFont));
        h2.setBackgroundColor(Color.LIGHT_GRAY);
        h2.setPadding(8f);
        h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(h2);

        // Itemized Booking Content
        addSummaryRow(summaryTable, "Package: " + booking.getPkg().getPackageName(), normalFont);
        addSummaryRow(summaryTable, "Start Date: " + booking.getStartDate().toString(), normalFont);
        addSummaryRow(summaryTable, "End Date: " + booking.getEndDate().toString(), normalFont);

        // Grand Total Calculation & Formatting
        PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL PAID (USD)", boldFont));
        totalLabel.setPadding(10f);
        totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(totalLabel);

        PdfPCell totalValue = new PdfPCell(new Phrase(String.format("%,.2f", payment.getAmount()), boldFont));
        totalValue.setPadding(10f);
        totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(totalValue);

        document.add(summaryTable);

        // ── Footer & Legal Disclaimer ───────────────────────
        document.add(new Paragraph("\n\n\n"));
        Paragraph footer = new Paragraph("Thank you for choosing TravelHub Sri Lanka!\nThis is a computer-generated receipt and does not require a signature.", 
                FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    /**
     * Helper to add a standardized cell to the information table.
     */
    private void addTableCell(PdfPTable table, String text, Font font, boolean isHeader) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5f);
        table.addCell(cell);
    }

    /**
     * Helper to add a summary row (Description | Amount) to the receipt table.
     */
    private void addSummaryRow(PdfPTable table, String description, Font font) {
        PdfPCell descCell = new PdfPCell(new Phrase(description, font));
        descCell.setPadding(8f);
        table.addCell(descCell);

        PdfPCell emptyCell = new PdfPCell(new Phrase("-", font)); // Specific item prices can be added here in future
        emptyCell.setPadding(8f);
        emptyCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(emptyCell);
    }
}
