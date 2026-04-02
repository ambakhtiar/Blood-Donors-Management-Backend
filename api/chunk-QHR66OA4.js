import{createRequire}from'module';const require=createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app/utils/sendEmail.ts
import ejs from "ejs";
import status2 from "http-status";
import nodemailer from "nodemailer";
import path2 from "path";

// src/app/config/env.ts
import dotenv from "dotenv";
import path from "path";
import status from "http-status";

// src/app/errors/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/config/env.ts
dotenv.config({ path: path.join(process.cwd(), ".env") });
var loadEnvVariables = () => {
  const requiredEnvVariables = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "SSL_COMMERZ_STORE_ID",
    "SSL_COMMERZ_STORE_PASSWORD",
    "SSL_COMMERZ_IS_LIVE",
    "BACKEND_URL",
    "FRINTEND_URL",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "SUPER_ADMIN_CONTACT_NUMBER"
  ];
  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: Number(process.env.PORT) || 5e3,
    BACKEND_URL: process.env.BACKEND_URL,
    FRINTEND_URL: process.env.FRINTEND_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT: {
      SECRET: process.env.JWT_SECRET,
      EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
      REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d"
    },
    BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    SSL_COMMERZ: {
      STORE_ID: process.env.SSL_COMMERZ_STORE_ID,
      STORE_PASSWORD: process.env.SSL_COMMERZ_STORE_PASSWORD,
      IS_LIVE: process.env.SSL_COMMERZ_IS_LIVE === "true"
    },
    SUPER_ADMIN: {
      EMAIL: process.env.SUPER_ADMIN_EMAIL,
      PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
      CONTACT_NUMBER: process.env.SUPER_ADMIN_CONTACT_NUMBER
    }
  };
};
var envVars = loadEnvVariables();

// src/app/utils/sendEmail.ts
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var sendOTPEmail = async ({ subject, templateData, templateName, to, attachments }) => {
  try {
    const templatePath = path2.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });
    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Email Sending Error", error.message);
    throw new AppError_default(status2.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
var sendNotificationEmail = async (to, title, message) => {
  try {
    const templatePath = path2.resolve(process.cwd(), `src/app/templates/notification.ejs`);
    const html = await ejs.renderFile(templatePath, { title, message });
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject: title,
      html
    });
    console.log(`Notification email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Notification Email Sending Error", error.message);
  }
};

export {
  __require,
  __commonJS,
  __toESM,
  AppError_default,
  envVars,
  sendOTPEmail,
  sendNotificationEmail
};
