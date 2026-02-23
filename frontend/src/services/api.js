// ──────────────────────────────────────────────────────────────
// api.js  —  central API service for all backend calls
// Base URL reads from the Vite env variable; falls back to localhost.
// ──────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Internal helper — throws a readable error if the response is not OK.
 */
const request = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        credentials: "include",
        ...options,
    });

    // Only parse as JSON if the server actually sent JSON.
    // Avoids the 'Unexpected token <' crash when an HTML error page is returned.
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await res.json()
        : { message: `Server error ${res.status}: ${res.statusText}` };

    if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

// ── Auth ──────────────────────────────────────────────────────

/**
 * Create a new organisation + owner account.
 * POST /api/auth/create-organization
 */
export const createOrganization = ({ organizationName, firstName, lastName, email, password }) =>
    request("/auth/create-organization", {
        method: "POST",
        body: JSON.stringify({ organizationName, firstName, lastName, email, password }),
    });

/**
 * Register an individual user via emailed invite token.
 * POST /api/auth/register
 */
export const registerUser = ({ token, email, firstName, lastName, password }) =>
    request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ token, email, firstName, lastName, password }),
    });

/**
 * Login with email + password.
 * POST /api/auth/login
 */
export const loginUser = ({ email, password }) =>
    request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

// ── Token helpers ─────────────────────────────────────────────

/** Save JWT + basic user to localStorage after login/register. */
export const saveSession = (token, user) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
};

/** Read the stored JWT (used to attach to protected API calls). */
export const getToken = () => localStorage.getItem("authToken");

/** Read the stored user object. */
export const getUser = () => {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
};

/** Clear session on logout. */
export const clearSession = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
};
