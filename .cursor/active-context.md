> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `package.json` (Domain: **Config/Infrastructure**)

### 📐 Config/Infrastructure Conventions & Fixes
- **[what-changed] 🟢 Edited package.json (12 changes, 2min)**: Active editing session on package.json.
12 content changes over 2 minutes.
- **[convention] what-changed in package.json — confirmed 9x**: -     "seed:superadmin": "tsx src/app/db/index.ts",
+     "seed:superAdmin": "tsx src/app/db/index.ts",

📌 IDE AST Context: Modified symbols likely include [name, version, description, main, scripts]
- **[convention] Updated schema package — confirmed 4x**: -     "seed": "tsx src/app/db/index.ts",
+     "seed": "tsx prisma/seed.ts",

📌 IDE AST Context: Modified symbols likely include [name, version, description, main, scripts]
- **[what-changed] Added JWT tokens authentication — uses a proper password hashing algorithm**: -     "lint": "eslint . ./src/**/*",
+     
-     "start": "node dist/server.js"
+     "lint": "eslint . ./src/**/*",
-   },
+     "start": "node dist/server.js"
-   "keywords": [],
+   },
-   "author": "",
+   "keywords": [],
-   "license": "ISC",
+   "author": "",
-   "type": "module",
+   "license": "ISC",
-   "dependencies": {
+   "type": "module",
-     "@prisma/adapter-pg": "^7.5.0",
+   "dependencies": {
-     "@prisma/client": "^7.5.0",
+     "@prisma/adapter-pg": "^7.5.0",
-     "@types/ejs": "^3.1.5",
+     "@prisma/client": "^7.5.0",
-     "bcrypt": "^6.0.0",
+     "@types/ejs": "^3.1.5",
-     "cookie-parser": "^1.4.7",
+     "bcrypt": "^6.0.0",
-     "cors": "^2.8.6",
+     "cookie-parser": "^1.4.7",
-     "dotenv": "^17.3.1",
+     "cors": "^2.8.6",
-     "ejs": "^5.0.1",
+     "dotenv": "^17.3.1",
-     "express": "^5.2.1",
+     "ejs": "^5.0.1",
-     "http-status": "^2.1.0",
+     "express": "^5.2.1",
-     "jsonwebtoken": "^9.0.3",
+     "http-status": "^2.1.0",
-     "nodemailer": "^8.0.4",
+     "jsonwebtoken": "^9.0.3",
-     "pg": "^8.20.0",
+     "nodemailer": "^8.0.4",
-     "sslcommerz-lts": "^1.2.0",
+     "pg": "^8.20.0",
-     "zod": "^4.3.6"
+     "sslcommerz-lts": "^1.2.0",
-   },
+     "zod": "^4.3.6"
-   "devDependencies": {
+   },
-     "@eslint/js": "^10.0.1",
+   "devDependencies": {
-     "@types/bcrypt": "^6.0.0",
+     "@eslint/js": "^10.0.1",
-     "@types/cookie-parser": "^1.4.10",
+     "@types/bcrypt": "^6.0.0",
-     "@types/cors": "^2.8.19",
+     "@types/cookie-parser": "^1.4.10",
-     "@types/express": "^5.0.6",
+     "@types/cors": "^2.8.19",
-     "@types/jsonwebtoken": "^9.0.10",
+     "@types/express": "^5.0.6",
-     "@types/node": "^25.5.0",
+     "@types/jsonwebtoken": "^9.0.10",
-     "@types/nodemailer": "^7.0.11",
+     "@types/node": "^25.5.0",
-     "@types/pg": "^8.20.0",
+     "@types/nodemailer": "^7.0.11",
-     "eslint": "^10.1.0",
+     "@types/pg": "^8.20.0",
-     "nodemon": "^3.1.14",
+     "eslint"
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [name, version, description, main, scripts]
- **[what-changed] 🟢 Edited .env (9 changes, 1min)**: Active editing session on .env.
9 content changes over 1 minutes.
- **[convention] 🟢 Edited .env (5 changes, 1min) — confirmed 3x**: Active editing session on .env.
5 content changes over 1 minutes.
- **[convention] Added JWT tokens authentication — ensures atomic multi-step database operations — confirmed 3x**: - 					"name": "Approve Hospital",
+ 					"name": "Update Hospital Status",
- 						"url": {
+ 						"body": {
- 							"raw": "{{baseUrl}}/admin/approve-hospital/:id",
+ 							"mode": "raw",
- 							"host": [
+ 							"raw": "{\n  \"status\": \"ACTIVE\"\n}",
- 								"{{baseUrl}}"
+ 							"options": {
- 							],
+ 								"raw": {
- 							"path": [
+ 									"language": "json"
- 								"admin",
+ 								}
- 								"approve-hospital",
+ 							}
- 								":id"
+ 						},
- 							],
+ 						"url": {
- 							"variable": [
+ 							"raw": "{{baseUrl}}/admin/hospitals/:id/status",
- 								{
+ 							"host": [
- 									"key": "id",
+ 								"{{baseUrl}}"
- 									"value": "hospital_user_id_here"
+ 							],
- 								}
+ 							"path": [
- 							]
+ 								"admin",
- 						}
+ 								"hospitals",
- 					},
+ 								":id",
- 					"response": []
+ 								"status"
- 				},
+ 							],
- 				{
+ 							"variable": [
- 					"name": "Approve Organisation",
+ 								{
- 					"request": {
+ 									"key": "id",
- 						"method": "PATCH",
+ 									"value": "hospital_user_id_here"
- 						"header": [],
+ 								}
- 						"url": {
+ 							]
- 							"raw": "{{baseUrl}}/admin/approve-organisation/:id",
+ 						}
- 							"host": [
+ 					},
- 								"{{baseUrl}}"
+ 					"response": []
- 							],
+ 				},
- 							"path": [
+ 				{
- 								"admin",
+ 					"name": "Update Organisation Status",
- 								"approve-organisation",
+ 					"request": {
- 								":id"
+ 						"method": "PATCH",
- 							],
+ 						"header": [],
- 							"variable": [
+ 						"body": {
- 								{
+ 							"mode": "raw",
- 									"key": "id",
+ 							"raw": "{\n  \"status\": \"ACTIVE\"\n}",
- 									"value": "org_user_id_here"
+ 							"options": {
- 								}
+ 								"raw": {
- 							]
+ 									"language": "json"
- 						}
+ 								}
- 					},
+ 							}
- 					"response": []
+ 						},
- 				}
+ 						"url": {
- 			]
+ 							"raw": "{{baseUrl}}/admin/organisat
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [info, item, auth, event, variable]
- **[what-changed] what-changed in BloodLink_Postman_Collection.json**: File updated (external): Postman/BloodLink_Postman_Collection.json

Content summary (1228 lines):
{
	"info": {
		"_postman_id": "8025e8ff-661b-46dd-b16c-4023d6000c11",
		"name": "BloodLink API",
		"description": "Comprehensive Postman Collection for BloodLink Backend (v2.0 Updated)",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "1. Auth Module",
			"item": [
				{
					"name": "Register User (Donor)",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"ema
