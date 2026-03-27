> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `prisma\schema.prisma` (Domain: **Database (Models/Schema)**)

### 📐 Database (Models/Schema) Conventions & Fixes
- **[what-changed] Added session cookies authentication**: - // This is your Prisma schema file,
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
-   id            String        @id @default(uuid(7))
+   id               String        @id @default(uuid(7))
-   email         String?       @unique
+   email            String?       @unique 
-   contactNumber String        @unique
+   contactNumber    String        @unique
-   password      String?
+   password         String?       
-   role          UserRole      @default(USER)
+   role             UserRole      @default(USER)
-   accountS
… [diff truncated]
- **[what-changed] 🟢 Edited prisma/schema.prisma (27 changes, 2min)**: Active editing session on prisma/schema.prisma.
27 content changes over 2 minutes.
- **[convention] what-changed in schema.prisma — confirmed 4x**: -   isAvailableForDonation Boolean   @default(true) 
+   isAvailableForDonation Boolean   @default(true)
- **[how-it-works] Git hotspots: src/app/config/index.ts(3x), package-lock.json(2x), package.json(2x), docs/req.md(2x), prisma/schema.prisma(2x)**: 
- **[what-changed] Added session cookies authentication**: - // This is your Prisma schema file,
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
-   id            String        @id @default(uuid(7))
+   id               String        @id @default(uuid(7))
-   email         String?       @unique
+   email            String?       @unique 
-   contactNumber String        @unique
+   contactNumber    String        @unique
-   password      String?
+   password         String?       
-   role          UserRole      @default(USER)
+   role             UserRole      @default(USER)
-   accountS
… [diff truncated]
