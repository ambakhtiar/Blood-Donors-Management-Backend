# BloodLink API Documentation

This document provides a comprehensive list of all API endpoints available in the BloodLink backend.

## Base URL
`{{baseUrl}}` (e.g., `http://localhost:5000/api/v1`)

---

## 1. Authentication Module (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user (USER, HOSPITAL, ORGANISATION) | No |
| POST | `/auth/login` | Login and receive access/refresh tokens | No |
| POST | `/auth/refresh-token` | Renew access token using refresh token | No |
| POST | `/auth/change-password` | Update account password | Yes |
| POST | `/auth/forgot-password` | Request password reset OTP | No |
| POST | `/auth/reset-password` | Reset password using OTP | No |
| POST | `/auth/logout` | Invalidate current session | Yes |

---

## 2. Post Module (`/posts`)

Any role can create posts. `BLOOD_DONATION` posts track donor history.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/posts` | Create a new post (BLOOD_FINDING, BLOOD_DONATION, HELPING) | Yes |
| GET | `/posts` | Get all posts with filtering and pagination | No |
| GET | `/posts/:id` | Get details of a single post (includes creator info) | No |
| PATCH | `/posts/:id` | Update post details (Author/Admin only) | Yes |
| DELETE | `/posts/:id` | Soft delete a post (Author/Admin only) | Yes |
| PATCH | `/posts/:id/resolve` | Mark a blood finding post as resolved | Yes |
| PATCH | `/posts/:id/approve` | Approve a post (Admin only) | Yes |
| PATCH | `/posts/:id/verify` | Verify a post (Admin only) | Yes |

---

## 3. User & Donor Module (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Fetch current user's profile | Yes |
| PUT | `/users/me` | Update current user's profile | Yes |
| GET | `/users/donors` | Search available blood donors | Yes |

---

## 4. Hospital Module (`/hospitals`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/hospitals/record-donation` | Record a donor's blood donation (Hospitals Only) | Yes |
| GET | `/hospitals/donation-records` | View donation records managed by the hospital | Yes |
| PATCH | `/hospitals/requests/:id` | Update blood request status | Yes |

---

## 5. Organisation Module (`/organisations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/organisations/volunteers` | Add a donor to organisation's volunteer list | Yes |
| GET | `/organisations/volunteers` | List organization volunteers | Yes |
| PATCH | `/organisations/volunteers/:id/donation-date` | Manually update a volunteer's last donation date | Yes |
| GET | `/organisations/volunteers/history` | View donation history of volunteers | Yes |

---

## 6. Admin Module (`/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | List all users (User management) | Admin/SuperAdmin |
| PATCH | `/admin/users/:id/status` | Update account status (Approve/Reject/Block) | Admin/SuperAdmin |
| GET | `/admin/stats` | Dashboard statistics | Admin/SuperAdmin |

---

## Post Payload Example (BLOOD_DONATION)

```json
{
  "type": "BLOOD_DONATION",
  "title": "Weekend Blood Drive",
  "contactNumber": "+8801700000001",
  "bloodGroup": "O+",
  "donationTime": "2026-04-10T10:00:00Z",
  "location": "Banani Community Center",
  "content": "Join our community blood donation camp."
}
```

> [!NOTE]
> For `BLOOD_DONATION` posts, the system automatically checks donor eligibility (2 months for males, 3 months for females) and sends an inspirational notification to the donor if they are a registered user.
