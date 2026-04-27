# Developer Guide: Event-Driven Email Notifications

This system uses Spring's `ApplicationEventPublisher` to send emails asynchronously. This means your API responses stay fast, and you don't have to worry about email templates in your service logic.

## 🚀 How to trigger an Email

Instead of calling `EmailService` directly, you publish an **Event**.

### 1. User Account Notifications (Registration, Approval, Rejection)
Use this for Agent or Hotel Owner account updates.

```java
@Autowired
private ApplicationEventPublisher eventPublisher;

// When an admin approves an agent
eventPublisher.publishEvent(new UserAccountEvent(this, user, "APPROVED"));

// When an admin rejects an agent
eventPublisher.publishEvent(new UserAccountEvent(this, user, "REJECTED", "Documents were invalid"));
```

### 2. Hotel Notifications (Approval, Rejection, Deletion)
Use this when an Admin manages a Hotel listing.

```java
// Approve a hotel
eventPublisher.publishEvent(new HotelEvent(this, hotel, "APPROVED"));

// Reject a hotel
eventPublisher.publishEvent(new HotelEvent(this, hotel, "REJECTED", "Images are poor quality"));

// Delete a hotel
eventPublisher.publishEvent(new HotelEvent(this, hotel, "DELETED", "Requested by owner"));
```

### 3. Travel Package Notifications (Approval, Rejection, Deletion)
Use this when an Admin manages a Package created by an Agent.

```java
// Approve a package
eventPublisher.publishEvent(new PackageEvent(this, pkg, "APPROVED"));

// Reject a package
eventPublisher.publishEvent(new PackageEvent(this, pkg, "REJECTED", "Price is too high for the destination"));

// Delete a package
eventPublisher.publishEvent(new PackageEvent(this, pkg, "DELETED"));
```

### 4. Booking Notifications (Confirmation, Approval, Decline)
Already integrated for standard flows.

```java
// Booking Confirmation (Sent to Tourist)
eventPublisher.publishEvent(new BookingEvent(this, booking, "CREATED"));

// Booking Approved (Sent to Tourist)
eventPublisher.publishEvent(new BookingEvent(this, booking, "APPROVED"));

// Booking Declined (Sent to Tourist)
eventPublisher.publishEvent(new BookingEvent(this, booking, "DECLINED", "No rooms available"));
```

---

## 🛠 Available Event Types Summary:

| Event Class | Types (`type` field) | Recipient |
| :--- | :--- | :--- |
| `UserAccountEvent` | `"REGISTERED"`, `"APPROVED"`, `"REJECTED"`, `"PASSWORD_RESET"` | The User |
| `HotelEvent` | `"APPROVED"`, `"REJECTED"`, `"DELETED"` | The Hotel Owner |
| `PackageEvent` | `"APPROVED"`, `"REJECTED"`, `"DELETED"` | The Agent who owns it |
| `BookingEvent` | `"CREATED"`, `"APPROVED"`, `"DECLINED"`, `"CANCELLED"` | The Tourist |

## 💡 Benefits
- **Clean Service Logic**: No more HTML strings in your services.
- **Asynchronous**: Email sending happens in a separate thread.
- **Scalable**: We can add SMS or push notifications by just adding another listener without changing your code.
