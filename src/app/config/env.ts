import dotenv from 'dotenv';
import path from 'path';
import status from 'http-status';
import AppError from '../errors/AppError';

// Load .env first
dotenv.config({ path: path.join(process.cwd(), '.env') });

interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    BACKEND_URL: string;
    FRINTEND_URL: string; // Legacy typo kept for compatibility
    DATABASE_URL: string;
    JWT: {
        SECRET: string;
        EXPIRES_IN: string;
        REFRESH_SECRET: string;
        REFRESH_EXPIRES_IN: string;
    };
    BCRYPT_SALT_ROUNDS: number;
    CLIENT_URL: string;
    EMAIL_SENDER: {
        SMTP_USER: string;
        SMTP_PASS: string;
        SMTP_HOST: string;
        SMTP_PORT: number;
        SMTP_FROM: string;
    };
    SSL_COMMERZ: {
        STORE_ID: string;
        STORE_PASSWORD: string;
        IS_LIVE: boolean;
    };
    SUPER_ADMIN: {
        EMAIL: string;
        PASSWORD: string;
        CONTACT_NUMBER: string;
    };
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables = [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'EMAIL_SENDER_SMTP_USER',
        'EMAIL_SENDER_SMTP_PASS',
        'EMAIL_SENDER_SMTP_HOST',
        'EMAIL_SENDER_SMTP_PORT',
        'EMAIL_SENDER_SMTP_FROM',
        'SSL_COMMERZ_STORE_ID',
        'SSL_COMMERZ_STORE_PASSWORD',
        'SSL_COMMERZ_IS_LIVE',
        'BACKEND_URL',
        'FRINTEND_URL',
        'SUPER_ADMIN_EMAIL',
        'SUPER_ADMIN_PASSWORD',
        'SUPER_ADMIN_CONTACT_NUMBER',
    ];

    requiredEnvVariables.forEach((variable) => {
        if (!process.env[variable]) {
            throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
        }
    });

    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: Number(process.env.PORT) || 5000,
        BACKEND_URL: process.env.BACKEND_URL as string,
        FRINTEND_URL: process.env.FRINTEND_URL as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        JWT: {
            SECRET: process.env.JWT_SECRET as string,
            EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
            REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
            REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        },
        BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
        CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
        EMAIL_SENDER: {
            SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
            SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
            SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
            SMTP_PORT: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
            SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
        },
        SSL_COMMERZ: {
            STORE_ID: process.env.SSL_COMMERZ_STORE_ID as string,
            STORE_PASSWORD: process.env.SSL_COMMERZ_STORE_PASSWORD as string,
            IS_LIVE: process.env.SSL_COMMERZ_IS_LIVE === 'true',
        },
        SUPER_ADMIN: {
            EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
            PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
            CONTACT_NUMBER: process.env.SUPER_ADMIN_CONTACT_NUMBER as string,
        }
    };
};

export const envVars = loadEnvVariables();