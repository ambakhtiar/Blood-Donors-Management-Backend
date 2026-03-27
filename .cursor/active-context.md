> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `prisma\schema.prisma` (Domain: **Database (Models/Schema)**)

### 📐 Database (Models/Schema) Conventions & Fixes
- **[what-changed] 🟢 Edited prisma/schema.prisma (7 changes, 7min)**: Active editing session on prisma/schema.prisma.
7 content changes over 7 minutes.
- **[what-changed] Replaced auth DonationHistory — ensures atomic multi-step database operations**: - }
+ 
- 
+ model DonationHistory {
- model DonationHistory {
+   id                   String     @id @default(uuid(7))
-   id                   String     @id @default(uuid(7))
+   bloodDonorId         String
-   bloodDonorId         String
+   bloodDonor           BloodDonor @relation(fields: [bloodDonorId], references: [id])
-   bloodDonor           BloodDonor @relation(fields: [bloodDonorId], references: [id])
+   receiverOrgId        String?
-   receiverOrgId        String?
+   receiverOrg          User?      @relation("ReceiverHistory", fields: [receiverOrgId], references: [id])
-   receiverOrg          User?      @relation("ReceiverHistory", fields: [receiverOrgId], references: [id])
+   donationDate         DateTime
-   donationDate         DateTime
+   weightDuringDonation Float?
-   weightDuringDonation Float?
+   isDeleted            Boolean    @default(false)
-   isDeleted            Boolean    @default(false)
+   createdAt            DateTime   @default(now())
-   createdAt            DateTime   @default(now())
+ }
- }
+ 
- 
+ model OrganisationVolunteer {
- model OrganisationVolunteer {
+   id             String        @id @default(uuid(7))
-   id             String        @id @default(uuid(7))
+   organisationId String
-   organisationId String
+   organisation   User          @relation("OrganisationVolunteers", fields: [organisationId], references: [id])
-   organisation   User          @relation("OrganisationVolunteers", fields: [organisationId], references: [id])
+   bloodDonorId   String
-   bloodDonorId   String
+   bloodDonor     BloodDonor    @relation(fields: [bloodDonorId], references: [id])
-   bloodDonor     BloodDonor    @relation(fields: [bloodDonorId], references: [id])
+   status         RequestStatus @default(PENDING)
-   status         RequestStatus @default(PENDING)
+   isDeleted      Boolean       @default(false)
-   isDeleted      Boolean       @default(false)
+   createdAt      DateTime      @default(now())
-   createdAt      Date
… [diff truncated]
- **[what-changed] Added session cookies authentication — ensures atomic multi-step database ope...**: - }
+   payments             Payment[]
- 
+ }
- // ================= 1:1 Role Models =================
+ 
- model SuperAdmin {
+ // ================= 1:1 Role Models =================
-   id        String   @id @default(uuid(7))
+ model SuperAdmin {
-   name      String
+   id        String   @id @default(uuid(7))
-   userId    String   @unique
+   name      String
-   user      User     @relation(fields: [userId], references: [id])
+   userId    String   @unique
-   isDeleted Boolean  @default(false)
+   user      User     @relation(fields: [userId], references: [id])
-   createdAt DateTime @default(now())
+   isDeleted Boolean  @default(false)
-   updatedAt DateTime @updatedAt
+   createdAt DateTime @default(now())
- }
+   updatedAt DateTime @updatedAt
- 
+ }
- model Admin {
+ 
-   id        String   @id @default(uuid(7))
+ model Admin {
-   name      String
+   id        String   @id @default(uuid(7))
-   userId    String   @unique
+   name      String
-   user      User     @relation(fields: [userId], references: [id])
+   userId    String   @unique
-   isDeleted Boolean  @default(false)
+   user      User     @relation(fields: [userId], references: [id])
-   createdAt DateTime @default(now())
+   isDeleted Boolean  @default(false)
-   updatedAt DateTime @updatedAt
+   createdAt DateTime @default(now())
- }
+   updatedAt DateTime @updatedAt
- 
+ }
- model Hospital {
+ 
-   id                 String   @id @default(uuid(7))
+ model Hospital {
-   name               String
+   id                 String   @id @default(uuid(7))
-   registrationNumber String?  @unique
+   name               String
-   address            String?
+   registrationNumber String?  @unique
-   userId             String   @unique
+   address            String?
-   user               User     @relation(fields: [userId], references: [id])
+   userId             String   @unique
-   isDeleted          Boolean  @default(false)
+   user               User     @relation(fields: [userId], reference
… [diff truncated]
- **[what-changed] Replaced auth Payment — ensures atomic multi-step database operations**: - }
+   payments  Payment[]
- 
+ }
- model DonationHistory {
+ }
-   id                   String     @id @default(uuid(7))
+ 
-   bloodDonorId         String
+ model DonationHistory {
-   bloodDonor           BloodDonor @relation(fields: [bloodDonorId], references: [id])
+   id                   String     @id @default(uuid(7))
-   receiverOrgId        String?
+   bloodDonorId         String
-   receiverOrg          User?      @relation("ReceiverHistory", fields: [receiverOrgId], references: [id])
+   bloodDonor           BloodDonor @relation(fields: [bloodDonorId], references: [id])
-   donationDate         DateTime
+   receiverOrgId        String?
-   weightDuringDonation Float?
+   receiverOrg          User?      @relation("ReceiverHistory", fields: [receiverOrgId], references: [id])
-   isDeleted            Boolean    @default(false)
+   donationDate         DateTime
-   createdAt            DateTime   @default(now())
+   weightDuringDonation Float?
- }
+   isDeleted            Boolean    @default(false)
- 
+   createdAt            DateTime   @default(now())
- model OrganisationVolunteer {
+ }
-   id             String        @id @default(uuid(7))
+ 
-   organisationId String
+ model OrganisationVolunteer {
-   organisation   User          @relation("OrganisationVolunteers", fields: [organisationId], references: [id])
+   id             String        @id @default(uuid(7))
-   bloodDonorId   String
+   organisationId String
-   bloodDonor     BloodDonor    @relation(fields: [bloodDonorId], references: [id])
+   organisation   User          @relation("OrganisationVolunteers", fields: [organisationId], references: [id])
-   status         RequestStatus @default(PENDING)
+   bloodDonorId   String
-   isDeleted      Boolean       @default(false)
+   bloodDonor     BloodDonor    @relation(fields: [bloodDonorId], references: [id])
-   createdAt      DateTime      @default(now())
+   status         RequestStatus @default(PENDING)
- 
+   isDeleted      Boolean       @def
… [diff truncated]
- **[what-changed] Updated schema Payment — ensures atomic multi-step database operations**: + 
+ model Payment {
+   id            String   @id @default(uuid())
+   amount        Float
+   status        String   @default("PENDING") // PENDING, SUCCESS, FAILED, CANCELLED
+   transactionId String   @unique
+   postId        String
+   post          Post     @relation(fields: [postId], references: [id])
+   userId        String
+   user          User     @relation(fields: [userId], references: [id])
+   createdAt     DateTime @default(now())
+   updatedAt     DateTime @updatedAt
+ }
- **[convention] Added session cookies authentication — confirmed 6x**: - // This is your Prisma schema file,
+ // This is your Prisma schema file,
- // learn more about it in the docs: https://pris.ly/d/prisma-schema
+ // learn more about it in the docs: https://pris.ly/d/prisma-schema
- 
+ 
- generator client {
+ generator client {
-   provider = "prisma-client-js"
+   provider = "prisma-client-js"
-   output   = "../src/generated/prisma"
+   output   = "../src/generated/prisma"
- }
+ }
- 
+ 
- datasource db {
+ datasource db {
-   provider = "postgresql"
+   provider = "postgresql"
- }
+ }
- 
+ 
- // ================= Enums =================
+ // ================= Enums =================
- enum UserRole {
+ enum UserRole {
-   SUPER_ADMIN
+   SUPER_ADMIN
-   ADMIN
+   ADMIN
-   HOSPITAL
+   HOSPITAL
-   ORGANISATION
+   ORGANISATION
-   USER
+   USER
- }
+ }
- 
+ 
- enum AccountStatus {
+ enum AccountStatus {
-   PENDING
+   PENDING
-   ACTIVE
+   ACTIVE
-   BLOCKED
+   BLOCKED
-   REJECTED
+   REJECTED
- }
+ }
- 
+ 
- enum Gender {
+ enum Gender {
-   MALE
+   MALE
-   FEMALE
+   FEMALE
-   OTHER
+   OTHER
- }
+ }
- 
+ 
- enum PostType {
+ enum PostType {
-   BLOOD_FINDING
+   BLOOD_FINDING
-   BLOOD_DONATION
+   BLOOD_DONATION
-   HELPING
+   HELPING
- }
+ }
- 
+ 
- enum RequestStatus {
+ enum RequestStatus {
-   PENDING
+   PENDING
-   ACCEPTED
+   ACCEPTED
-   REJECTED
+   REJECTED
- }
+ }
- 
+ 
- // ================= Core User Model =================
+ // ================= Core User Model =================
- model User {
+ model User {
-   id               String        @id @default(uuid(7))
+   id            String        @id @default(uuid(7))
-   email            String?       @unique 
+   email         String?       @unique
-   contactNumber    String        @unique
+   contactNumber String        @unique
-   password         String?       
+   password      String?
-   role             UserRole      @default(USER)
+   role          UserRole      @default(USER)
-   accountS
… [diff truncated]
- **[what-changed] 🟢 Edited prisma/schema.prisma (27 changes, 2min)**: Active editing session on prisma/schema.prisma.
27 content changes over 2 minutes.
- **[convention] what-changed in schema.prisma — confirmed 4x**: -   isAvailableForDonation Boolean   @default(true) 
+   isAvailableForDonation Boolean   @default(true)
- **[what-changed] what-changed in schema.prisma**: File updated (external): src/generated/prisma/schema.prisma

Content summary (298 lines):
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ================= Enums =================
enum UserRole {
  SUPER_ADMIN
  ADMIN
  HOSPITAL
  ORGANISATION
  USER
}

enum AccountStatus {
  PENDING
  ACTIVE
  BLOCKED
  REJECTED
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum PostType {
  BLOOD_FINDING
 
