import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────
// verifyToken
// Base middleware — must be used on every protected route.
// Validates the JWT and attaches decoded payload to req.user.
// ─────────────────────────────────────────────
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};


// ─────────────────────────────────────────────
// verifyOwner
// Allows only the 'owner' role.
// Use AFTER verifyToken.
// ─────────────────────────────────────────────
export const verifyOwner = (req, res, next) => {
    if (req.user?.role !== "owner") {
        return res.status(403).json({ message: "Access denied: owners only" });
    }
    next();
};


// ─────────────────────────────────────────────
// verifyManager
// Allows 'manager' or 'owner' (owner can do everything a manager can).
// Use AFTER verifyToken.
// ─────────────────────────────────────────────
export const verifyManager = (req, res, next) => {
    const allowed = ["owner", "manager"];
    if (!allowed.includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied: managers and above only" });
    }
    next();
};
