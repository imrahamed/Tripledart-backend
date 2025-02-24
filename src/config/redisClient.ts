import { createClient } from "redis";
import { ENV } from "./environment";

export const redisClient = createClient({
    url: ENV.REDIS_URI,
    // username: "default",
    // password: "NQQpiIz0v2vUrFEk5Py2oaJYOVoulo48",
    // socket: {
    //     host: "redis-18295.c84.us-east-1-2.ec2.redns.redis-cloud.com",
    //     port: 18295,
    // },
});

redisClient.on("error", (err) => {
    console.error("❌ Redis error:", err);
});

