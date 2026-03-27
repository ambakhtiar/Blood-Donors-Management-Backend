> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\modules\auth\auth.service.ts` (Domain: **Database (Models/Schema)**)

### 📐 Database (Models/Schema) Conventions & Fixes
- **[what-changed] Replaced auth verificationToken**: -   await prisma.verificationToken.upsert({
+   await (prisma as any).verificationToken.upsert({
-   const verificationToken = await prisma.verificationToken.findUnique({
+   const verificationToken = await (prisma as any).verificationToken.findUnique({
-     await tx.verificationToken.update({
+     await (tx as any).verificationToken.update({

📌 IDE AST Context: Modified symbols likely include [registerUser, loginUser, refreshToken, changePassword, forgotPassword]
- **[discovery] discovery in auth.service.ts**: File updated (external): src/app/modules/Auth/auth.service.ts

Content summary (382 lines):
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { Secret } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken, verifyToken } from '../../utils/jwt.utils';
import { 
  IChangePassword, 
  IForgotPassword, 
  ILocationInfo, 
  ILoginUser, 
  IRegisterUser, 
  IResetPassword 
} from './auth.interface';
import { prisma } from '../../lib/prisma';
import { AccountStatus, UserRole } from '../../../gen
- **[discovery] Found 1 TODO/FIXME/HACK comments across project**: TODO in src\generated\prisma\runtime\client.d.ts: count does not actually exist in DMMF
- **[how-it-works] Git hotspots: src/app/config/index.ts(3x), package-lock.json(2x), package.json(2x), docs/req.md(2x), prisma/schema.prisma(2x)**: 
