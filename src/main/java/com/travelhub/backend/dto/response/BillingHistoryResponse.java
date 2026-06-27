package com.travelhub.backend.dto.response;

public class BillingHistoryResponse {
    private Long paymentId;
    private String transactionId;
    private Long bookingId;
    private String packageName;
    private Double amount;
    private String status;
    private String paymentMethod;
    private String date;
    private boolean receiptAvailable;

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public boolean isReceiptAvailable() { return receiptAvailable; }
    public void setReceiptAvailable(boolean receiptAvailable) { this.receiptAvailable = receiptAvailable; }
}
