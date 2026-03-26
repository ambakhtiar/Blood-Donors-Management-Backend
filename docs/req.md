# 🩸 Master Blueprint: Blood Donation & Crowdfunding Platform

## 1. Project Overview
A highly scalable, industry-standard full-stack web application for blood donation, volunteer management, and medical crowdfunding.
- **Frontend Stack:** Next.js, Tailwind CSS, Redux/React Query.
- **Backend Stack:** Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL.
- **Architecture:** Strict Modular Pattern (`src/app/modules/...`).

## 2. Authentication & Security (JWT Based)
- **Login Strategy:** Dual login support (Email OR Contact Number).
- **Token System (3-Tier):** - Access Token (Short-lived, sent in headers).
  - Refresh Token (Long-lived, HTTP-only cookie).
  - Session Token (Stored in DB to track devices/IPs and allow "Logout from all devices").
- **Password Reset:** OTP/Link via Email (Nodemailer) or SMS.

## 3. Role-Based Access Control (RBAC) & Profiles
Every entity shares the core `User` model for auth, but has a strict **1:1 Relational Profile Model** for editable data.
- **Roles:** `SUPER_ADMIN`, `ADMIN`, `HOSPITAL`, `ORGANISATION`, `USER`.
- **Profile Models (Editable):** - `SuperAdminProfile` (Name, Details)
  - `AdminProfile` (Name, Details)
  - `HospitalProfile` (Name, Reg No, Address)
  - `OrganisationProfile` (Name, Reg No, Established Year, Address)
  - `DonorProfile` (Name, Blood Group, Gender, Weight, Last Donation Date)

## 4. Core Features & Business Logic
### A. Post System (Facebook-style Feed)
- **Blood Finding Post:** Searching for donors (Location & Blood Group based).
- **Blood Donation Post:** Users announcing their donation.
- **Helping Post (Crowdfunding):** Collecting funds for patients. Requires **Admin Approval Badge**. Integrated with **Stripe/SSLCommerz**.

### B. Blood Donation History & Rules
- **Rule Engine:** Male donors must wait 2 months, females 3 months between donations.
- **History Timeline:** A visual timeline on the user's profile showing all past donations (When, Where, Weight).
- **Auto-Update:** If a donation is confirmed via platform requests, history updates automatically.

### C. Organisation & Hospital Features
- **Volunteer Management:** Organisations can manually add volunteers (creates a soft/unregistered user profile) or send join requests to existing users.
- **Hospital Requests:** Hospitals can send direct blood donation requests to matched donors on the platform.
- **Visibility:** Hospitals see all donation records. Organisations see records of their specific volunteers.

### D. Smart Search & Notifications
- **Granular Search:** Find donors by Blood Group + Division + District + Upazila.
- **Smart Trigger:** If someone searches/posts for "A+" blood in a specific area, the system auto-sends notifications to all eligible "A+" donors in that area.

## 5. Coding Standards & Error Handling
- **No Code Repetition (DRY):** Use utilities and shared interfaces.
- **Error Handling:** Global Error Handler, `catchAsync`, and Zod Validation for 100% type safety and zero unhandled rejections.
- **Data Integrity:** Implement **Soft Delete** (`isDeleted: true`) globally instead of hard database deletes.