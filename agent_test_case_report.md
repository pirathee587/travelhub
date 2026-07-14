# TravelHub Agent Module Test Case Report

This report documents the evaluating and testing phase for the **Agent (Travel Agency/Service Provider)** module of the TravelHub platform. It aligns with the project’s testing guidelines, layout, and table structures as defined in the system documentation.

---

## 7.2 Evaluating and Testing (Agent Module)

### 7.2.4 Agent Dashboard
The Agent Dashboard provides service providers with a unified control center displaying real-time business performance statistics, booking flows, fleet availability details, and customer reviews.

| Test | Test Cases | Expected Results | Actual Results |
| :--- | :--- | :--- | :--- |
| **Dashboard statistics display** | Agent logs in and views the Dashboard home page. | Statistics cards (Total Packages, Active Trips, Completed Trips, Pending Requests, Total Revenue, Average Rating) are visible and populated with correct counts. | <span style="color:green">**Passed**</span> |
| | A tourist submits a new booking request for one of the agent's packages. | The **Pending Requests** count on the Dashboard is incremented and updated in real-time. | <span style="color:green">**Passed**</span> |
| | Agent completes a trip. | The **Completed Trips** count increases, and **Active Trips** decreases accordingly. | <span style="color:green">**Passed**</span> |
| **Revenue trend visualization** | Agent views the Revenue Overview chart widget. | A responsive chart displays monthly revenue trends for the current calendar year. | <span style="color:green">**Passed**</span> |
| **Recent Bookings quick view** | Agent checks the Recent Bookings table on the dashboard. | Displays the most recent booking requests with core details (Customer, Package, Status) and a quick view option. | <span style="color:green">**Passed**</span> |
| | Agent clicks "View All" on the Recent Bookings header. | The system successfully redirects the user to the full Bookings list page. | <span style="color:green">**Passed**</span> |
| **Fleet quick status** | Agent views the Fleet Status widget on the dashboard. | Displays a summary of vehicle and driver allocations (e.g., Available vs. On-Trip) with a "Manage" link redirecting to the Vehicles page. | <span style="color:green">**Passed**</span> |

---

### 7.2.5 Booking Management
Booking Management allows agents to handle incoming booking requests, assign fleet resources (vehicles and drivers), track trip lifecycles, and generate transaction invoices.

| Test | Test Cases | Expected Results | Actual Results |
| :--- | :--- | :--- | :--- |
| **Viewing booking lists** | Agent navigates to the Bookings page. | A chronological list of bookings is loaded with filters for status (Pending, Confirmed, In Progress, Completed, Cancelled). | <span style="color:green">**Passed**</span> |
| **Viewing booking details** | Agent clicks "View Details" or a specific booking row. | A details dialog opens showing tourist information, pricing, itinerary duration, and special requests. | <span style="color:green">**Passed**</span> |
| **Accepting booking requests** | Agent clicks "Accept" on a pending booking, selects an active vehicle from the available vehicle dropdown, and submits. | The booking status transitions to **Confirmed**, the selected vehicle is assigned to the booking, and the database updates. | <span style="color:green">**Passed**</span> |
| **Declining booking requests** | Agent clicks "Decline" on a pending booking, selects a reason (e.g., "No available vehicle") or inputs a custom reason, and submits. | The booking status transitions to **Cancelled**, the decline reason is logged, and the customer is notified. | <span style="color:green">**Passed**</span> |
| **Trip lifecycle transitions** | Agent clicks "Start Trip" on a confirmed booking on the scheduled day. | The booking status changes from **Confirmed** to **In Progress**, representing an active trip. | <span style="color:green">**Passed**</span> |
| | Agent clicks "Mark as Completed" on an active in-progress trip. | The status transitions to **Completed**, and the trip is archived. | <span style="color:green">**Passed**</span> |
| **Emergency cancellation** | Agent clicks "Cancel" on a confirmed or in-progress trip, selects a cancellation reason, and confirms. | The status transitions to **Cancelled**, resources (driver and vehicle) are released back to the available pool, and the database updates. | <span style="color:green">**Passed**</span> |
| **Invoice generation** | Agent clicks "Download Invoice" on a completed booking. | A printable HTML invoice with booking details, tax breakdown, and total revenue is successfully generated and downloaded. | <span style="color:green">**Passed**</span> |

---

### 7.2.6 Package Management
Package Management lets agents create, edit, deactivate, and add itineraries to travel packages that tourists can browse and book.

| Test | Test Cases | Expected Results | Actual Results |
| :--- | :--- | :--- | :--- |
| **Searching packages** | Agent enters a search query in the search bar on the Packages page. | The package grid filters in real-time to match package titles or district names. | <span style="color:green">**Passed**</span> |
| **Creating new packages** | Agent clicks "Create Package", completes the multi-field form (Title, Price, District, Inclusions/Exclusions, Cover Image), and submits. | The package is created and saved to the database. It appears in the package listing. | <span style="color:green">**Passed**</span> |
| **Editing packages** | Agent clicks "Edit" on a package card, updates the price, and saves. | The changes are successfully written, and the package grid immediately reflects the updated price. | <span style="color:green">**Passed**</span> |
| **Deactivating packages** | Agent deactivates an active package. | The package status toggles to inactive, and it is hidden from the public customer search page. | <span style="color:green">**Passed**</span> |
| **Managing itineraries** | Agent views a package's detail page and adds a day-by-day itinerary (e.g., Day 1: City Tour, Hotel check-in). | The itineraries are saved and shown in a chronological timeline on the package's customer-facing page. | <span style="color:green">**Passed**</span> |

---

### 7.2.7 Fleet & Driver Management
Fleet & Driver Management enables agents to keep track of their active vehicle fleet and driver roster, register vehicle owners, and toggle resource availability.

| Test | Test Cases | Expected Results | Actual Results |
| :--- | :--- | :--- | :--- |
| **Viewing fleet rosters** | Agent accesses the Vehicles page and toggles between the Vehicles and Drivers tabs. | The UI lists all registered vehicles and drivers with status indicators (Available, Booked, Maintenance). | <span style="color:green">**Passed**</span> |
| **Adding a driver** | Agent clicks "Add Driver", fills in profile fields (license, NIC, contact, blood group), uploads documents, and saves. | A new driver record is added to the system and is visible in the active drivers list. | <span style="color:green">**Passed**</span> |
| **Registering a vehicle and owner** | Agent clicks "Add Vehicle", selects an existing owner or adds a new owner, enters vehicle details, and uploads compliance images. | The owner and vehicle records are created and linked in the backend database. | <span style="color:green">**Passed**</span> |
| **Updating details** | Agent edits an existing driver’s mobile number and saves. | The new details are successfully saved, and the updated contact number is visible on the driver’s profile. | <span style="color:green">**Passed**</span> |
| **Status updates** | Agent changes a vehicle's status to "Maintenance". | The vehicle is marked as out-of-service and blocked from being assigned to any new bookings until set back to available. | <span style="color:green">**Passed**</span> |
| **Driver deactivation** | Agent sets a driver's lifecycle status to "Inactive". | The driver is soft-deleted/deactivated and no longer appears in the active resource selection. | <span style="color:green">**Passed**</span> |

---

### 7.2.8 Reviews Management
Reviews Management allows agents to track customer feedback, filter reviews by ratings, and interact with tourists by replying to their comments.

| Test | Test Cases | Expected Results | Actual Results |
| :--- | :--- | :--- | :--- |
| **Viewing customer feedback** | Agent opens the Reviews tab on the Profile page. | A list of all reviews submitted by tourists is displayed with ratings (stars), date, and comments. | <span style="color:green">**Passed**</span> |
| **Filtering reviews** | Agent selects "5 Stars" in the rating dropdown. | The reviews feed updates to show only reviews with a five-star rating. | <span style="color:green">**Passed**</span> |
| **Sorting reviews** | Agent toggles the sorting dropdown between "Newest" and "Oldest". | The reviews are successfully re-ordered based on their submission timestamps. | <span style="color:green">**Passed**</span> |
| **Replying to reviews** | Agent writes a response in the reply input field and clicks "Submit Reply". | The reply is linked to the review and immediately rendered beneath the tourist's feedback. | <span style="color:green">**Passed**</span> |

---

### 7.2.9 Profile & Account Settings
Profile and Account Settings allow agents to configure their notification channels, currency metrics, profile information, password security, and identity documents.

| Test | Test Cases | Expected Results | Actual Results |
| :--- | :--- | :--- | :--- |
| **Updating profile details** | Agent edits description bio, website link, and office address in the Profile dialog. | The profile is updated in the backend, and changes are reflected on the profile page. | <span style="color:green">**Passed**</span> |
| **Changing profile photo** | Agent uploads a new logo/image in the profile form. | The image is uploaded, saved, and rendered as the new profile avatar. | <span style="color:green">**Passed**</span> |
| **Configuring notification switches** | Agent toggles notification options (e.g., Booking Cancellations, New Reviews) and saves. | Saved notification preferences are applied to push/email alerts. | <span style="color:green">**Passed**</span> |
| **Dynamic currency switching** | Agent changes preferred currency in settings from LKR to USD. | All prices displayed across the dashboard, bookings, and packages page are instantly converted and formatted in USD. | <span style="color:green">**Passed**</span> |
| **Changing security password** | Agent enters current, new, and confirm password, and submits. | Password is secure-hashed and updated in the backend database; confirmation toast is displayed. | <span style="color:green">**Passed**</span> |
| **Submitting identity verification** | Agent uploads National Identity Card (NIC) front and back images under Settings. | Documents are uploaded to storage, and profile status changes to **Pending Verification**. | <span style="color:green">**Passed**</span> |

---

### 7.2.10 Analytics & Reports
Analytics & Reports provides service providers with business performance insights, time period views, destination analytics, and exportable CSV documents.

| Test | Test Cases | Expected Results | Actual Results |
| :--- | :--- | :--- | :--- |
| **KPI metrics assessment** | Agent navigates to the Analytics page. | Calculates and shows summaries for Total Revenue, Total Trips, Average Customer Rating, and Cancellation Rate. | <span style="color:green">**Passed**</span> |
| **Switching analytical periods** | Agent selects "Quarterly" or "Yearly" view. | Revenue bar/line charts and trip status distributions dynamically load aggregate values for the selected duration. | <span style="color:green">**Passed**</span> |
| **Destination popularity tracking** | Agent views the Top Destinations breakdown list. | Renders a bar chart showing which districts got the highest amount of tour bookings. | <span style="color:green">**Passed**</span> |
| **Driver performance ranking** | Agent views the Driver Performance table. | Renders driver list sorted by average customer rating with total completed trips. | <span style="color:green">**Passed**</span> |
| **Exporting business reports** | Agent clicks "Download Report". | Dynamically compiles revenue, trip distribution, driver, and vehicle analytics and downloads a formatted CSV file. | <span style="color:green">**Passed**</span> |

---

## 7.3 Summary of Test Results

The table below summarizes the test execution results for the **Agent** modules.

| # | Module | Total Test Cases | Passed | Failed | Pass Rate |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | Agent Dashboard | 7 | 7 | 0 | 100% |
| 2 | Booking Management | 8 | 8 | 0 | 100% |
| 3 | Package Management | 5 | 5 | 0 | 100% |
| 4 | Fleet & Driver Management | 6 | 6 | 0 | 100% |
| 5 | Reviews Management | 4 | 4 | 0 | 100% |
| 6 | Profile & Account Settings | 6 | 6 | 0 | 100% |
| 7 | Analytics & Reports | 5 | 5 | 0 | 100% |
| **Total** | **Agent Modules** | **41** | **41** | **0** | **100%** |
