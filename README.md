# 🌾 AGRINEX

## Smart Agricultural Procurement & Slot Scheduling Platform

> **Smart Procurement • Less Waiting • Transparent Procurement**

AGRINEX is a smart digital agricultural procurement platform designed to connect **Farmers, Procurement Centres, Centre Officers, and Administrators** through a centralized procurement management system.

The platform enables farmers to select procurement centres, book available procurement slots, receive digital booking tokens, track procurement progress, and monitor payment information.

At the administrative level, AGRINEX provides tools to manage procurement centres, assign officers, manage farmers, verify farmer documents, manage slots, and monitor procurement operations.

The project is being developed as a prototype for the **Smart India Hackathon (SIH) 2026**.

---

# 🎯 Problem Statement

Agricultural procurement centres often face operational and coordination problems such as:

* Long waiting times for farmers
* Overcrowding at procurement centres
* Manual or inefficient slot allocation
* Lack of visibility into procurement queues
* Difficulty managing large numbers of farmers
* Lack of centralized farmer verification
* Manual document verification
* Difficulty assigning responsible officers to centres
* Limited transparency in procurement progress
* Difficulty tracking booking status
* Lack of centralized payment/procurement information
* Poor communication between farmers and procurement authorities

AGRINEX addresses these challenges by providing a centralized digital procurement ecosystem.

---

# 💡 AGRINEX Solution

AGRINEX uses a **role-based procurement management architecture**.

### Main Users

```text
                    AGRINEX
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     FARMER         OFFICER         ADMIN
        │              │              │
        │              │              │
   Book Slots     Verify Farmers   Manage System
   Track Queue    Manage Centre    Manage Centres
   Track Payment  Procurement      Assign Officers
        │              │              │
        └──────────────┼──────────────┘
                       │
              PROCUREMENT CENTRES
```

---

# 👥 User Roles

## 👨‍🌾 Farmer

Farmers can:

* Register/login
* Manage their profile
* Maintain farm information
* Upload required documents
* Select a preferred procurement centre
* View eligible procurement centres
* Search/filter procurement centres
* View available procurement slots
* Book procurement slots
* Enter crop and quantity information
* Add vehicle information
* Review booking details
* Receive procurement token
* Track booking status
* View procurement progress
* View queue information
* Track payment information
* Receive notifications

---

# 🧑‍💼 Centre Officer

Centre Officers are responsible for procurement operations at assigned centres.

Officers can:

* Login securely
* Access their assigned procurement centre
* View farmers associated with their centre
* View farmer profile information
* View farmer farm information
* View farmer documents
* Review farmer verification status
* Verify farmer documents
* Approve/reject submitted documents
* Verify eligible farmers
* Manage procurement operations
* View bookings
* Process farmer arrivals
* Update procurement status
* Perform weighing/quality workflow
* Manage procurement completion
* View relevant booking information

Officer access is intended to be restricted according to the procurement centre assigned to the officer.

---

# 👨‍💻 Administrator

The Admin panel provides centralized management of AGRINEX.

Administrators can manage:

* Procurement centres
* Centre officers
* Officer-centre assignments
* Farmers
* Farmer verification
* Farmer documents
* Procurement slots
* Bookings
* Procurement operations
* Centre activation/deactivation
* Centre information
* System-level monitoring

---

# 🏢 Procurement Centre Management

Procurement centres are a core component of AGRINEX.

Administrators can:

* Add procurement centres
* View all procurement centres
* Edit centre information
* Activate centres
* Deactivate centres
* Assign officers
* Change assigned officers
* View centre details
* Manage centre operational information

---

## Procurement Centre Information

A centre can contain information such as:

* Centre ID
* Centre name
* Address
* State
* District
* Pincode
* Contact number
* Email
* Operating hours
* Working days
* Daily capacity
* Processing capacity
* Description
* Status
* Assigned/managed officer

---

## Centre Status

```text
ACTIVE
INACTIVE
```

Only active centres are intended to be available for normal farmer booking operations.

---

# 👮 Officer Assignment

AGRINEX supports assigning procurement officers to procurement centres.

### Admin workflow

```text
Admin
 ↓
Open Procurement Centres
 ↓
Select Centre
 ↓
Assign Officer
 ↓
Centre managed by Officer
```

Administrators can also change an existing assignment.

### Example

```text
Centre:
Bhagalpur Procurement Centre

Managed By:
Officer - Raj Kumar
```

If the officer changes:

```text
Old Officer
     ↓
Change Assignment
     ↓
New Officer
```

The centre's `managedBy` information is updated accordingly.

---

# 👨‍🌾 Farmer Management

The Admin Farmer Management module provides centralized farmer administration.

Administrators can:

* View all farmers
* Search farmers
* Filter farmers
* View farmer details
* View farm details
* View location
* View preferred procurement centre
* View verification status
* View uploaded documents
* Review documents
* Approve documents
* Reject documents
* Reset document review status
* Verify eligible farmers
* Reject farmer verification
* Reset farmer review
* Activate farmer accounts
* Deactivate farmer accounts

---

# 📄 Farmer Document Verification

Farmers can submit required documents for verification.

### Supported document types

```text
IDENTITY_PROOF
LAND_RECORD
BANK_PROOF
OTHER
```

Each document can contain:

* Document type
* Document name
* Document URL
* Public ID
* MIME type
* File size
* Upload date
* Verification status

---

## Document Status

```text
PENDING
VERIFIED
REJECTED
```

### Verification Workflow

```text
Farmer uploads document
        ↓
       PENDING
        ↓
Officer/Admin reviews
        ↓
 ┌──────┼───────┐
 ↓      ↓       ↓
VERIFY REJECT  PENDING
```

---

# ✅ Farmer Verification

AGRINEX supports farmer-level verification after required documents have been reviewed.

The verification workflow considers required documents including:

* Identity Proof
* Land Record
* Bank Proof

A farmer can be verified only after the required documents have reached the appropriate verified state.

---

# 📍 Preferred Procurement Centre

Farmers can select a preferred procurement centre.

The preferred centre is stored against the farmer profile and is used to connect farmers with procurement operations.

### Farmer location

Farmer farm location contains:

* State
* District
* Village
* Pincode

---

# 📅 Procurement Slot Booking

The booking system is one of the core AGRINEX features.

Farmers can:

1. Select a procurement centre
2. Select a commodity/crop
3. Enter quantity
4. Select procurement date
5. Select an available slot
6. Enter vehicle details
7. Review booking
8. Confirm booking
9. Receive booking/token information

---

# 🏢 Procurement Centre Discovery

Farmers can view procurement centres available through the procurement centre API.

The centre listing supports:

* All Centres
* Nearby
* Open Now
* Low Queue

Centre information may include:

* Centre name
* Location
* Distance
* Queue information
* Estimated waiting time
* Capacity
* Operating status
* Available slots

---

## Centre Location Matching

Centre discovery supports state/district-based filtering.

Example:

```text
Farmer

State: Bihar
District: Bhagalpur
Pincode: 812001
```

The farmer can see active centres in:

```text
Bihar
Bhagalpur
```

even when the centre has a different pincode.

Pincode is intentionally not used as a strict centre visibility filter.

---

# 🔎 Procurement Centre API

The centre API supports both general and filtered requests.

### Get all active centres

```text
GET /api/procurement/centres
```

### Filter by state

```text
GET /api/procurement/centres?state=Bihar
```

### Filter by state and district

```text
GET /api/procurement/centres?state=Bihar&district=Bhagalpur
```

### Pincode

Pincode can be supplied as information but is not used to hide centres from the farmer.

---

# 🌾 Commodity Management

AGRINEX supports procurement commodities/crops.

Example commodities:

* Paddy
* Wheat
* Maize
* Mustard

Commodity information can include:

* Commodity name
* Variety
* Rate
* Quantity/unit information
* Procurement availability

---

# 📦 Produce Information

A booking can contain:

* Crop/commodity
* Variety
* Estimated quantity
* Quantity unit

### Example

```text
Crop: Paddy
Variety: PR-126
Quantity: 25
Unit: Quintal
```

---

# ⏰ Slot Management

Procurement centres can operate using predefined procurement slots.

A slot can contain:

* Procurement centre
* Date
* Start time
* End time
* Capacity
* Booked count
* Remaining capacity
* Status

---

## Slot Status

```text
AVAILABLE
FEW_SLOTS
FULL
CLOSED
```

### Example

```text
10:00 AM - 11:00 AM

Capacity: 10
Booked: 7
Remaining: 3
```

---

# 🎫 Booking System

AGRINEX maintains a structured booking system connecting:

```text
Farmer
   ↓
Procurement Centre
   ↓
Commodity
   ↓
Slot
   ↓
Vehicle
   ↓
Booking
```

The booking stores the information required for procurement processing.

---

# 🚜 Vehicle Details

Farmers can provide transportation information while booking.

### Supported vehicle types

* Tractor
* Tractor + Trolley
* Mini Truck
* Truck

Vehicle information can include:

```text
Vehicle Type
Vehicle Registration Number
```

---

# 📝 Booking Review

Before confirming a booking, the farmer can review:

* Farmer information
* Procurement centre
* Centre address
* Commodity
* Variety
* Estimated quantity
* Date
* Slot
* Vehicle type
* Vehicle registration number

The farmer must confirm the booking declaration before submitting.

---

# 🎟️ Digital Procurement Token

After successful booking, AGRINEX can generate a unique procurement token.

### Example

```text
AGR-TK-4709
```

The confirmation can contain:

* Procurement token
* QR code
* Procurement centre
* Date
* Time slot
* Crop
* Quantity
* Vehicle information
* Gate/arrival information

The token can be used to identify and validate the farmer's procurement booking at the centre.

---

# 👥 Queue Management

AGRINEX is designed to reduce physical waiting by providing queue visibility.

Farmers can view information such as:

```text
Current Queue
38 Farmers

Estimated Waiting Time
45 Minutes

Centre Capacity
68%
```

This allows farmers to better plan their arrival.

---

# ⚖️ Procurement Workflow

The procurement lifecycle follows a structured process.

```text
Booking Confirmed
       ↓
Farmer Arrived
       ↓
Gate Verification
       ↓
Weighing
       ↓
Quality Inspection
       ↓
Accepted / Rejected
       ↓
Procurement Completed
       ↓
Payment Processing
       ↓
Payment Completed
```

This provides transparency throughout the procurement lifecycle.

---

# 📊 Booking Status

Bookings can move through different operational states depending on the procurement workflow.

Typical lifecycle:

```text
PENDING
   ↓
CONFIRMED
   ↓
ARRIVED
   ↓
PROCESSING
   ↓
COMPLETED
```

Possible alternative outcomes include:

```text
CANCELLED
REJECTED
```

---

# 💰 Payment Tracking

AGRINEX provides a payment tracking layer for completed procurement.

Payment information can include:

* Procurement ID
* Crop
* Quantity
* Rate
* Gross amount
* Deductions
* Net payable amount
* Payment status
* Payment date
* Transaction/reference ID

### Example

```text
Quantity: 25 Quintals
Rate: ₹2,300 / Quintal

Gross Amount:
₹57,500

Payment Status:
PAID
```

---

# 🔔 Notifications

AGRINEX can provide procurement-related notifications.

Examples:

* Booking confirmed
* Booking cancelled
* Slot reminder
* Arrival reminder
* Queue update
* Centre schedule changed
* Procurement started
* Procurement completed
* Payment processed
* Centre announcements

---

# 👤 Farmer Profile

The farmer profile manages farmer-specific information.

## Personal Information

* Farmer name
* Farmer ID
* Phone number
* Email
* Address
* Location

## Farm Information

* Land area
* Land unit
* Main crop
* Farm location
* Preferred centre

## Verification

* Farmer verification status
* Document verification status
* Verification information

---

# 🌱 Farm Information

Farmer agricultural information can include:

```text
Land Area
Land Unit
Main Crop
```

Supported land units include:

```text
Acre
Hectare
```

---

# 🔐 Authentication & Security

AGRINEX uses role-based authentication.

Supported application roles include:

```text
FARMER
OFFICER
ADMIN
```

Authentication is designed to ensure users only access the functionality associated with their role.

---

# 🔑 Login

The authentication system supports account-based login.

The system validates:

```text
Identifier
Account Type / Role
Password
Account Status
```

Inactive accounts should not be allowed to access protected application functionality.

---

# 🛡️ Role-Based Access Control

### Farmer

```text
Farmer
 ├── Dashboard
 ├── Profile
 ├── Book Slot
 ├── Bookings
 ├── Queue
 ├── Procurement
 ├── Payments
 ├── Notifications
 ├── Settings
 └── Help
```

### Officer

```text
Officer
 ├── Dashboard
 ├── Assigned Centre
 ├── Farmers
 ├── Farmer Documents
 ├── Verification
 ├── Bookings
 └── Procurement Operations
```

### Admin

```text
Admin
 ├── Dashboard
 ├── Farmers
 ├── Officers
 ├── Procurement Centres
 ├── Officer Assignments
 ├── Commodities
 ├── Slots
 ├── Bookings
 └── System Management
```

---

# 🖥️ Application Pages

## Farmer

```text
/farmer
│
├── /dashboard
│   └── Farmer Dashboard
│
├── /bookings
│   └── Procurement Bookings
│
├── /bookings/new
│   └── Create Procurement Booking
│
├── /book-slot
│   └── Slot Booking Interface
│
├── /queue
│   └── Queue Information
│
├── /procurement
│   └── Procurement Status
│
├── /payments
│   └── Payment Tracking
│
├── /notifications
│   └── Notifications
│
├── /profile
│   └── Farmer Profile
│
├── /settings
│   └── Application Settings
│
└── /help
    └── Help & Support
```

---

# 🏢 Admin Pages

```text
/admin
│
├── /dashboard
│   └── Admin Dashboard
│
├── /farmers
│   └── Farmer Management
│
├── /officers
│   └── Officer Management
│
├── /centres
│   └── Procurement Centre Management
│
├── /commodities
│   └── Commodity Management
│
├── /slots
│   └── Slot Management
│
└── /bookings
    └── Booking Management
```

---

# 🧑‍💼 Officer Pages

```text
/officer
│
├── /dashboard
│   └── Officer Dashboard
│
├── /farmers
│   └── Assigned Centre Farmers
│
├── /verification
│   └── Farmer Verification
│
├── /documents
│   └── Document Verification
│
├── /bookings
│   └── Centre Bookings
│
└── /procurement
    └── Procurement Operations
```

---

# 🔌 API Architecture

AGRINEX uses Next.js App Router API routes.

## Procurement APIs

```text
/api/procurement/centres
/api/procurement/commodities
/api/procurement/slots
/api/procurement/bookings
```

---

# 👨‍🌾 Farmer APIs

The application uses farmer-related API endpoints for operations such as:

```text
Farmer profile
Farmer verification
Farmer documents
Preferred centre
Bookings
```

---

# 👨‍💼 Admin APIs

Administrative endpoints include functionality for:

```text
/api/admin/farmers
/api/admin/farmers/[id]
/api/admin/officers
```

Additional administrative routes can be organized around:

```text
Centres
Slots
Bookings
Commodities
```

---

# 🏢 Centre Management API

The procurement centre API supports:

```text
GET
```

for retrieving active procurement centres.

It supports optional filtering:

```text
state
district
pincode
```

The important design principle is:

> **State and district are optional for general centre discovery.**

Therefore:

```text
/api/procurement/centres
```

returns active centres without requiring the farmer's location.

---

# 🗄️ MongoDB Data Architecture

AGRINEX uses MongoDB with Mongoose models.

Core data entities include:

```text
User
Farmer
Officer
ProcurementCentre
Commodity
Slot
Booking
```

The data architecture connects these entities to form the complete procurement workflow.

---

# 🔗 Entity Relationships

```text
USER
 │
 ├── FARMER
 │      │
 │      ├── Farm Information
 │      ├── Documents
 │      ├── Preferred Centre
 │      └── Bookings
 │
 ├── OFFICER
 │      │
 │      └── Assigned Procurement Centre
 │
 └── ADMIN


PROCUREMENT CENTRE
 │
 ├── Assigned Officer
 ├── Slots
 └── Bookings


COMMODITY
 │
 └── Booking


SLOT
 │
 └── Booking


BOOKING
 │
 ├── Farmer
 ├── Centre
 ├── Commodity
 ├── Slot
 └── Procurement / Payment
```

---

# 📄 Farmer Data Model

The Farmer model supports information including:

```text
name
avatar
mobile
email
password
role
isActive
farmLocation
farm
preferredCentre
documents
verification
onboarding
preferredLanguage
notifications
lastLogin
password reset
timestamps
```

---

## Farmer Location

```text
farmLocation
├── state
├── district
├── village
└── pincode
```

---

## Farmer Farm

```text
farm
├── landArea
├── landUnit
└── mainCrop
```

---

## Farmer Verification

```text
verification
├── isVerified
├── verifiedAt
├── verifiedBy
├── verifiedAtCentre
└── rejectionReason
```

---

# 📑 Document Data Model

Documents contain:

```text
type
name
url
publicId
mimeType
size
status
uploadedAt
```

Document status:

```text
PENDING
VERIFIED
REJECTED
```

---

# 🏢 Procurement Centre Data Model

The Procurement Centre model supports operational information including:

```text
centreId
name
address
contactNumber
email
operatingHours
workingDays
dailyCapacity
processingCapacity
status
description
managedBy
```

---

# ⚙️ Settings

The application can provide user preferences such as:

* Theme
* Language
* Notification preferences
* Preferred procurement centre
* Account preferences
* Privacy preferences

---

## 🌓 Theme

AGRINEX supports:

```text
☀️ Light Mode
🌙 Dark Mode
```

Theme management can be handled through `next-themes`.

---

# 🆘 Help & Support

The Help & Support section can provide:

* FAQs
* Booking assistance
* Procurement information
* Payment assistance
* Centre contact information
* Support requests
* General platform guidance

---

# 📱 Responsive Design

AGRINEX is designed with responsive interfaces for:

* Desktop
* Laptop
* Tablet
* Mobile

The UI uses modern card-based dashboards, tables, filters, modals, forms, status indicators, and responsive layouts.

---

# 🎨 UI/UX Principles

The application focuses on:

* Simple navigation
* Clear status indicators
* Minimal farmer effort
* Mobile-friendly booking
* Easy document verification
* Clear procurement progress
* Accessible information hierarchy
* Responsive layouts
* Consistent design system

---

# 🔄 Complete AGRINEX Workflow

## Farmer Registration

```text
Farmer
 ↓
Create Account
 ↓
Login
 ↓
Complete Profile
 ↓
Add Farm Information
 ↓
Upload Documents
 ↓
Select Preferred Centre
```

---

## Farmer Verification

```text
Documents Uploaded
 ↓
PENDING
 ↓
Officer Reviews
 ↓
Document Verification
 ↓
Required Documents Verified
 ↓
Farmer Verified
```

---

## Booking

```text
Farmer
 ↓
Open Book Slot
 ↓
View Active Centres
 ↓
Select Centre
 ↓
Select Commodity
 ↓
Enter Quantity
 ↓
Select Date
 ↓
Select Available Slot
 ↓
Enter Vehicle Details
 ↓
Review Booking
 ↓
Confirm
 ↓
Booking Created
 ↓
Digital Token
```

---

## Procurement

```text
Booking Confirmed
 ↓
Farmer Arrives
 ↓
Gate Verification
 ↓
Queue
 ↓
Weighing
 ↓
Quality Check
 ↓
Accepted
 ↓
Procurement Completed
 ↓
Payment
```

---

# 📈 Future Enhancements

AGRINEX can be extended with:

* Real-time queue tracking
* Live centre capacity
* GPS-based distance calculation
* Map integration
* QR-code scanning at gates
* Digital gate passes
* SMS notifications
* WhatsApp notifications
* Payment gateway/bank integration
* Advanced analytics
* Admin reports
* Procurement forecasting
* AI-based demand prediction
* Crop price recommendations
* Automated farmer notifications
* Centre performance analytics
* Officer performance analytics
* Audit logs
* Advanced role permissions
* Multi-state procurement support
* Multi-language farmer interface
* Offline-friendly farmer workflows

---

# 🧠 Smart Features Roadmap

Future AGRINEX intelligence features can include:

### 📊 Demand Forecasting

Predict expected procurement load based on:

```text
Historical procurement
+
Farmer bookings
+
Crop
+
Season
+
Centre capacity
```

---

### 🚦 Queue Prediction

Estimate waiting time using:

```text
Current queue
+
Average processing time
+
Centre capacity
+
Active bookings
```

---

### 🌾 Crop Intelligence

Provide farmers with information about:

* Expected procurement demand
* Historical rates
* Centre availability
* Recommended booking periods

---

# 🛠️ Technology Stack

## Frontend

```text
Next.js
React
JavaScript
Tailwind CSS
```

## Backend

```text
Next.js App Router
Next.js API Routes
Node.js
```

## Database

```text
MongoDB
Mongoose
```

## Authentication

```text
NextAuth / Auth-based session management
Role-based authorization
```

## UI

```text
Tailwind CSS
Responsive layouts
Dark mode
next-themes
```

---

# 📁 Suggested Project Structure

```text
AGRINEX/
│
├── src/
│   ├── app/
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── farmers/
│   │   │   ├── officers/
│   │   │   ├── centres/
│   │   │   ├── commodities/
│   │   │   ├── slots/
│   │   │   └── bookings/
│   │   │
│   │   ├── farmer/
│   │   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   ├── book-slot/
│   │   │   ├── queue/
│   │   │   ├── procurement/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── help/
│   │   │
│   │   ├── officer/
│   │   │   ├── dashboard/
│   │   │   ├── farmers/
│   │   │   ├── verification/
│   │   │   ├── documents/
│   │   │   ├── bookings/
│   │   │   └── procurement/
│   │   │
│   │   └── api/
│   │       ├── admin/
│   │       │   ├── farmers/
│   │       │   └── officers/
│   │       │
│   │       ├── procurement/
│   │       │   ├── centres/
│   │       │   ├── commodities/
│   │       │   ├── slots/
│   │       │   └── bookings/
│   │       │
│   │       └── auth/
│   │
│   ├── components/
│   ├── lib/
│   │   └── db.js
│   │
│   └── models/
│       ├── User.js
│       ├── Farmer.js
│       ├── Officer.js
│       ├── ProcurementCentre.js
│       ├── Commodity.js
│       ├── Slot.js
│       └── Booking.js
│
├── public/
│
├── .env.local
├── package.json
└── README.md
```

---

# 🔌 Important API Endpoints

## Procurement

```http
GET /api/procurement/centres
GET /api/procurement/commodities
GET /api/procurement/slots
GET /api/procurement/bookings
POST /api/procurement/bookings
```

---

## Admin

```http
GET /api/admin/farmers
GET /api/admin/farmers/:id
PATCH /api/admin/farmers/:id

GET /api/admin/officers
```

Administrative APIs are used for farmer/officer management and role-specific operations.

---

# 🔒 Environment Variables

Create a `.env.local` file.

Example:

```env
MONGODB_URI=your_mongodb_connection_string

NEXTAUTH_SECRET=your_nextauth_secret

NEXTAUTH_URL=http://localhost:3000
```

Add other service credentials required by your configured authentication, file storage, notification, or payment integrations.

> Never commit `.env.local` or private credentials to GitHub.

---

# 🚀 Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Enter the project:

```bash
cd AGRINEX
```

Install dependencies:

```bash
npm install
```

Create environment configuration:

```text
.env.local
```

Add the required MongoDB and authentication configuration.

---

# ▶️ Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🏗️ Production Build

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

---

# 🧪 Testing the System

Recommended testing order:

## 1. Authentication

```text
Farmer Login
Officer Login
Admin Login
```

## 2. Centre Management

```text
Admin
 ↓
Create Centre
 ↓
Activate Centre
 ↓
Assign Officer
 ↓
Verify Centre
```

## 3. Farmer Management

```text
Create Farmer
 ↓
Upload Documents
 ↓
Officer/Admin Review
 ↓
Verify Documents
 ↓
Verify Farmer
```

## 4. Slot Management

```text
Create Centre Slot
 ↓
Set Capacity
 ↓
Set Date/Time
 ↓
Make Available
```

## 5. Booking

```text
Farmer
 ↓
Select Centre
 ↓
Select Commodity
 ↓
Select Slot
 ↓
Enter Quantity
 ↓
Enter Vehicle
 ↓
Confirm Booking
```

## 6. Procurement

```text
Booking
 ↓
Arrival
 ↓
Verification
 ↓
Weighing
 ↓
Quality Check
 ↓
Completion
```

---

# 🐛 Important Implementation Notes

## Procurement Centre API

The procurement centre endpoint supports requests without location parameters.

This is important because the farmer booking page requests:

```text
/api/procurement/centres
```

without necessarily sending state and district.

Therefore the API should not reject the request simply because:

```text
state
district
```

are missing.

When no filters are provided, active centres are returned.

---

## Pincode Matching

Pincode is not used as a strict visibility condition.

For example:

```text
Farmer:
Bihar / Bhagalpur / 812001

Centre:
Bihar / Bhagalpur / 812002
```

The centre remains eligible for display because the state and district match.

---

# 📊 AGRINEX Architecture

```text
                    ┌─────────────────────┐
                    │       AGRINEX       │
                    │   Web Application   │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        👨‍🌾 FARMER        🧑‍💼 OFFICER       👨‍💻 ADMIN
             │                 │                 │
             ▼                 ▼                 ▼
        Booking UI        Verification       Management
        Queue             Documents          Centres
        Payments          Procurement        Officers
        Profile           Bookings           Farmers
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     API LAYER       │
                    │   Next.js Routes    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MONGODB        │
                    │     + MONGOOSE      │
                    └─────────────────────┘
```

---

# 🌟 Why AGRINEX?

AGRINEX focuses on the complete procurement lifecycle instead of solving only slot booking.

```text
Farmer Registration
        ↓
Farmer Verification
        ↓
Centre Selection
        ↓
Slot Booking
        ↓
Digital Token
        ↓
Queue Management
        ↓
Centre Arrival
        ↓
Weighing
        ↓
Quality Verification
        ↓
Procurement
        ↓
Payment
```

At the same time, administrators and officers receive the tools necessary to operate the procurement ecosystem.

---

# 🏆 Smart India Hackathon Vision

AGRINEX aims to demonstrate how technology can improve agricultural procurement by combining:

* Digital farmer registration
* Document verification
* Procurement centre management
* Officer assignment
* Slot scheduling
* Digital tokens
* Queue management
* Procurement tracking
* Payment transparency
* Role-based administration

The long-term objective is to create a scalable digital infrastructure that can reduce waiting times, improve procurement centre efficiency, and provide farmers with greater transparency.

---

# 📌 Project Status

AGRINEX is an actively developed prototype.

### Core areas implemented/in development

```text
✅ Farmer authentication
✅ Officer authentication
✅ Admin authentication
✅ Farmer profile
✅ Farm information
✅ Farmer documents
✅ Farmer verification workflow
✅ Procurement centre management
✅ Centre activation/deactivation
✅ Officer-centre assignment
✅ Change assigned officer
✅ Centre discovery
✅ State/district centre filtering
✅ Active-centre filtering
✅ Commodity management
✅ Slot management
✅ Slot booking
✅ Farmer booking workflow
✅ Vehicle information
✅ Booking review
✅ Booking status workflow
✅ Procurement workflow
✅ Queue management foundation
✅ Payment tracking foundation
✅ Notifications foundation
✅ Responsive UI
✅ Dark/light theme support
```

Some advanced capabilities such as live queue prediction, GPS-based distance calculation, automated notifications, payment gateway integration, AI forecasting, and advanced analytics remain suitable for future iterations depending on the final implementation.

---

# 🔮 Future Vision

AGRINEX can evolve into a complete digital procurement infrastructure connecting:

```text
                 GOVERNMENT / ADMIN
                         │
                         ▼
                    AGRINEX CORE
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     FARMERS          OFFICERS         CENTRES
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                   PROCUREMENT
                         │
                         ▼
                      PAYMENT
```

The goal is simple:

> **Less waiting. Better planning. Transparent procurement. Better experience for farmers.**

---

# 👨‍💻 Development

AGRINEX is developed using modern web technologies with a focus on:

* Scalability
* Maintainability
* Role-based access
* Secure data handling
* Responsive design
* Modular APIs
* MongoDB-based persistence
* Real-world procurement workflows

---

# 📜 License

This project is currently developed as a prototype/project for **Smart India Hackathon 2026**.

Add an appropriate open-source or institutional license before public production deployment.

---

# 🌾 AGRINEX

## Smart Procurement • Less Waiting

**Connecting Farmers • Centres • Officers • Procurement • Payments**

> **Digital Procurement for a Smarter Agricultural Future.**
