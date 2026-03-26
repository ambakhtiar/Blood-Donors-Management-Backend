# 🩸 System Architecture & Master Context: Blood Donation & Crowdfunding API

## 1. Project Overview & Motive
This is a highly scalable, industry-standard full-stack web application designed for **Blood Donation Management and Medical Crowdfunding**. The motive is to create a seamless bridge between blood donors, hospitals, and volunteer organizations with real-time location-based tracking and smart notifications.
- **Deadline:** March 31, 2026 (Rapid Development Phase)
- **Tech Stack:** Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM (v7.5.0 with `@prisma/adapter-pg`), Zod, JWT.
- **Architecture:** Strict Modular Pattern (`src/app/modules/...`).
- **Core Principle:** DRY (Don't Repeat Yourself), 100% Type-Safe, Soft-Deletes globally.


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








## 2. Core Business Logic & Rules
- **Role-Based Access Control (RBAC):** `SUPER_ADMIN`, `ADMIN`, `HOSPITAL`, `ORGANISATION`, `USER`.
- **1:1 Profile Architecture:** A central `User` model handles authentication. Specific details are stored in 1:1 relation tables (`DonorProfile`, `Hospital`, `Organisation`).
- **Account Approval System:** Hospitals and Organisations are created with a `PENDING` status. They cannot log in (403 Forbidden) until an Admin changes their status to `ACTIVE`.
- **Donation Rules:** Male donors must wait 2 months, and female donors 3 months between donations.
- **Authentication Strategy:** Hybrid Session-Based JWT. Access Token (Short-lived), Refresh Token (Hashed in DB Session), Device/IP tracking for "Logout from all devices" feature. Login supports both `email` and `contactNumber`.

## 3. Database Schema Summary (Prisma)
- **User:** `id`, `contactNumber`, `email`, `password`, `role`, `accountStatus`, `isDeleted`.
- **Profiles (1:1 with User):** `DonorProfile`, `Hospital`, `Organisation`, `Admin`, `SuperAdmin`.
- **Session:** Tracks login sessions (`userId`, `refreshToken`, `device`, `ipAddress`).
- **Post:** Handles feed posts (`BLOOD_FINDING`, `BLOOD_DONATION`, `HELPING`). `HELPING` posts require Admin approval.
- **DonationHistory:** Tracks past donations of users.
- **OrganisationVolunteer & HospitalRequest:** Pivot tables for managing volunteer mapping and direct blood requests.

---

## 4. Current Project Status & Roadmap

### ✅ COMPLETED TASKS (What we have done so far)
1. **Initial Setup:** Express app initialization, TypeScript configuration, strict modular folder structure created.
2. **Database Architecture:** Complete Prisma Schema written with all relations, enums, and soft-delete features.
3. **Database Connection:** Upgraded to Prisma v7.5.0 using `pg` driver adapter and `prisma.config.ts`.
4. **Error Handling:** Implemented Global Error Handler, `AppError`, `catchAsync`, and `sendResponse` generic utility.
5. **Auth Module (Core):**
   - Zod validation schemas (`userSignupValidationSchema`, `userLoginValidationSchema`) with strict conditional profile requirements.
   - JWT utility functions (`createToken`, `verifyToken`).
   - Transactional User Registration (Creates `User` + `Profile` concurrently).
   - Advanced Login system with DB Session creation and Refresh Token mapping.
6. **Central Routing:** Setup `routes/index.ts` to manage all module routes.

### ⏳ PENDING TASKS (To achieve 70% Backend Completion Tonight)

**👉 Phase 1: Security & Middleware (Next Immediate Step)**
- [ ] Implement `auth()` middleware to verify Access Tokens.
- [ ] Implement role checking inside `auth()` middleware (e.g., `auth('ADMIN', 'SUPER_ADMIN')`).

**👉 Phase 2: User & Profile Management**
- [ ] Get "My Profile" API (fetching User + nested Profile data).
- [ ] Update Profile API (allowing users/hospitals/orgs to update their editable info).
- [ ] Admin Endpoints: Get all pending Hospitals/Orgs, and Approve/Reject API.
- [ ] Donor Search API: Fetch `USER` role accounts filtered by `bloodGroup`, `division`, `district`, `upazila`, and `isAvailableForDonation`.

**👉 Phase 3: Post & Feed System**
- [ ] Create Post API (Blood Finding, Blood Donation).
- [ ] Create Helping Post API (Crowdfunding - sets `isApproved: false` by default).
- [ ] Get All Posts API (Feed logic).

---

## 🤖 INSTRUCTIONS FOR AI CONTEXT
If you are reading this as an AI assistant:
1. Strictly follow the Modular Architecture (`controller`, `service`, `route`, `validation`, `interface`).
2. Always wrap controller functions in `catchAsync`.
3. Always format responses using the `sendResponse` utility.
4. Always validate `req.body` using Zod before passing to the controller.
5. Ensure `isDeleted: false` is included in all database `findMany` or `findUnique` queries.



Public : 

See Blood Finding Post 

See Blood Donation Post 

But Dont Like or Comment 

Dont Post Anything 



User : 

Login/Signup 

Post Previous Blood Donation History / Check as usual Blood Donation Rule (like must after 2/3 months)

Post Blood Donation Post (option show:Blood Donation:Weight,  platilate, afer a blood donation must wait 2/3 month if male 2m and female 3m or other constraints), 

Add in Blood Donation History Automatically 

Blood Finding Post and have manage or not (and all important thing, like bg, weight, why, when, contact, address and other)

Helping Post like donation collection for any patients (there have admin approval or show admin approval badge) 





Organisations : 

There have many volunteers. In add manually like Facebook group. 

Manually add volunteers list 

If any user add in user wish or organisations add in platform user, this time organisations see donor or volunteers blood donation history and location 

Post blood finding post 

Helping post 



Organisations should show volunteers previous  blood donation record only which volunteers stay in this organisations 



Hospital : 

Blood giving post and if have this number/user in our platform, this time a send request blood donation post, if accept then add blood donation history in that user. and blood donation history add in user and organisation see updated blood donation time or new blood donated time.

Blood finding post 

Helping post 



Hospital show all donation record 



Admin :

Admin show all volunteer blood donation history, blood finding post, helping post, or other important thing. 

create account for organisations and hospital. 



Super Admin : 

Super admin have all access.

Seed admin and create account organisations and hospital.