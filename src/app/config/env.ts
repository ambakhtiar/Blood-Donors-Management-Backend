import dotenv from 'dotenv';
import status from 'http-status';
import AppError from '../errors/AppError';

dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    EMAIL_SENDER: {
        SMTP_USER: string;
        SMTP_PASS: string;
        SMTP_HOST: string;
        SMTP_PORT: number;
        SMTP_FROM: string;
    }
}


const loadEnvVariables = (): EnvConfig => {

    const requireEnvVariable = [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'EMAIL_SENDER_SMTP_USER',
        'EMAIL_SENDER_SMTP_PASS',
        'EMAIL_SENDER_SMTP_HOST',
        'EMAIL_SENDER_SMTP_PORT',
        'EMAIL_SENDER_SMTP_FROM',
    ]

    requireEnvVariable.forEach((variable) => {
        if (!process.env[variable]) {
            // throw new Error(`Environment variable ${variable} is required but not set in .env file.`);
            throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
        }
    })

    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: Number(process.env.PORT) || 5000,
        DATABASE_URL: process.env.DATABASE_URL as string,
        EMAIL_SENDER: {
            SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
            SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
            SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
            SMTP_PORT: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
            SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
        },
    }
}

export const envVars = loadEnvVariables();