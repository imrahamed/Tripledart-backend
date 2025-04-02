import dotenv from "dotenv";

dotenv.config();
export const ENV = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
    REDIS_URI: process.env.REDIS_URI || "localhost",
    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
    PHYLLO_API_KEY: process.env.PHYLLO_API_KEY || "",
    PHYLLO_BASE_URL: process.env.PHYLLO_BASE_URL || "",
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    AWS_REGION: process.env.AWS_REGION || "",
    SES_SENDER_EMAIL: process.env.SES_SENDER_EMAIL || "",
    INSIGHTIQ_API_KEY: process.env.INSIGHTIQ_API_KEY || "",
    INSIGHTIQ_CLIENT_ID: process.env.INSIGHTIQ_CLIENT_ID || "",
    INSIGHTIQ_BASE_URL: process.env.INSIGHTIQ_BASE_URL || "https://api.insightiq.ai/v1"
};
