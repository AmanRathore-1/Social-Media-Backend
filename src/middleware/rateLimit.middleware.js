import rateLimit from "express-rate-limit";

// =========================
// General API Limiter
// =========================
export const apiLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Please try again after 15 minutes."
    }

});

// =========================
// Authentication Limiter
// =========================
export const authLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 5,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    }

});