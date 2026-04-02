# 🩸 MASTER BLUEPRINT: Blood Donation & Crowdfunding Platform

## 1. Project Overview & Motive
An industry-standard, highly scalable full-stack web application designed to create a seamless bridge between blood donors, hospitals, volunteer organizations, and patients needing funds. 
- **Deadline:** March 31, 2026.
- **Tech Stack:** Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM (v7.5.0), Zod, JWT.
- **Architecture:** Strict Modular Pattern (`src/app/modules/...`).
- **Core Principle:** DRY (Don't Repeat Yourself), 100% Type-Safe, Global Soft-Deletes (`isDeleted: true`).

## 2. Role-Based Features & Permissions (The Core Logic)

### 🌍 1. Public (Unauthenticated Users)
- **View Access:** Can see the public feed (Blood Finding Posts, Blood Donation Posts, Helping Posts).
- **Restrictions:** Cannot Like, Comment, or Post anything. Cannot view sensitive user contact details without logging in.

### 👤 2. User (Donor/General)
- **Auth:** Login/Signup via Email or Contact Number.
- **Donation History:** Can manually post past donation history. 
- **Rule Engine (Strict):** When creating a "Blood Donation Post", the system checks the last donation date. **Males must wait 2 months, Females 3 months.** If eligible, the post is created AND automatically added to their `DonationHistory`.
- **Finding Post:** Can create "Blood Finding Posts" (Fields: Blood Group, Weight, Reason, Date/Time, Contact, Address). Can manage/resolve the post once blood is found.
- **Helping Post:** Can create posts for crowdfunding/patient help. These posts feature an "Admin Verification Badge" once verified.

### 🏢 3. Organisation (Volunteer Groups)
- **Volunteer Management:** Can manually add volunteers (creates a soft profile) like a Facebook group, or send join requests to existing platform users.
- **Visibility:** Can view the blood donation history and location of **ONLY** the volunteers connected to their specific organisation.
- **Posting:** Can create Blood Finding and Helping posts on behalf of the organisation.

### 🏥 4. Hospital
- **Direct Requests:** Can create a "Blood Giving/Requirement" request directly targeting a specific user/number on the platform.
- **Auto-History:** If the user accepts and donates, the donation is automatically added to the user's `DonationHistory`. This updates the user's availability status globally.
- **Visibility:** Hospitals have global visibility—they can see **ALL** donation records across the platform to easily verify donors.
- **Posting:** Can create Blood Finding and Helping posts.

### 🛡️ 5. Admin & Super Admin
- **Admin:** Can view all users, volunteers, donation histories, finding posts, and helping posts. Can approve pending Hospital and Organisation accounts. Can approve/verify Helping Posts.
- **Super Admin:** Has ultimate access. Can seed other admins and manually create verified Organisation/Hospital accounts.

## 3. Authentication & Security Strategy
- **Tokens:** Hybrid Session-Based JWT. Access Token (Short-lived), Refresh Token (Hashed in DB Session).
- **Security:** "Logout from all devices" feature via Session ID tracking. Password reset via Nodemailer/Email OTP.

## 4. Current Project Status & Roadmap
- **Phase 1 & 2 (COMPLETED):** Base setup, Prisma Schema, Global Errors, Auth Module (Login/Register/Tokens), Auth Middleware, User Module (Get/Update Profile, Donor Search).
- **Phase 3 (PENDING - CURRENT):** Post Module (Feed, Blood Finding, Blood Donation with Rule Engine).
- **Phase 4 (PENDING):** Hospital Requests, Organisation Volunteer Management, Donation History tracking.

## 5. 🤖 INSTRUCTIONS FOR AI CONTEXT
1. Strictly follow the Modular Architecture (`controller`, `service`, `route`, `validation`, `interface`).
2. Do NOT use `any` types. Create strict TypeScript interfaces for all payloads.
3. Always wrap controller functions in `catchAsync` and format responses using `sendResponse`.
4. Always validate `req.body` using Zod before passing to the controller.


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