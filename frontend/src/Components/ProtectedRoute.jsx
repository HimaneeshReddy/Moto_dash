import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../services/api.js";

/**
 * ProtectedRoute
 * Wraps any route that requires the user to be logged in.
 * If no JWT is found in localStorage, redirects to "/" (login page).
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
    const token = getToken();
    if (!token) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;
