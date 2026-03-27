// import nodemailer from 'nodemailer';
// import { envVars } from '../config/env';

// export const sendEmail = async (to: string, resetLink: string) => {
//   // Configured with basic dummy or env provided config
//   // Gmail provider or standard SMTP
//   const transporter = nodemailer.createTransport({
//     host: envVars.EMAIL_SENDER.SMTP_HOST,
//     port: envVars.EMAIL_SENDER.SMTP_PORT,
//     secure: envVars.NODE_ENV === 'production',
//     auth: {
//       user: envVars.EMAIL_SENDER.SMTP_USER,
//       pass: envVars.EMAIL_SENDER.SMTP_PASS,
//     },
//   } as any);

//   await transporter.sendMail({
//     from: `"Blood Donation Platform" <${envVars.EMAIL_SENDER.SMTP_FROM}>`,
//     to, // list of receivers
//     subject: 'Password Reset Valid Token',
//     text: `Your password reset token is: ${resetLink}. Please use this to reset your password. It will expire in 10 minutes.`,
//     html: `<b>Your password reset token is:</b> <br> <p>${resetLink}</p> <br> <p>It will expire in 10 minutes.</p>`,
//   });
// };

/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env";
import AppError from "../errors/AppError";

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
})

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[]
}

export const sendEmail = async ({ subject, templateData, templateName, to, attachments }: SendEmailOptions) => {


  try {
    const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      }))
    })

    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error: any) {
    console.log("Email Sending Error", error.message);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
}