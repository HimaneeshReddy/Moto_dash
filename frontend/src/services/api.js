// ──────────────────────────────────────────────────────────────
// api.js  —  central API service for all backend calls
// Base URL reads from the Vite env variable; falls back to localhost.
// ──────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Internal helper — throws a readable error if the response is not OK.
 */
const request = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };

    // Let the browser set the proper boundary header for multipart/form-data
    if (!isFormData) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }

    // Attach JWT if available
    const token = localStorage.getItem("authToken");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
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
 * Submit a support/feedback ticket.
 * POST /api/auth/support
 */
export const submitSupportTicket = (data) =>
    request("/auth/support", {
        method: "POST",
        body: JSON.stringify(data),
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

// ── Data Inputs ───────────────────────────────────────────────

/**
 * Upload a CSV to be dynamically converted into a PostgreSQL table.
 * POST /api/data/upload-csv
 */
export const uploadCsv = ({ datasetName, file }) => {
    const formData = new FormData();
    formData.append("datasetName", datasetName);
    formData.append("file", file);

    return request("/data/upload-csv", {
        method: "POST",
        body: formData,
    });
};

/**
 * Trigger LLM analysis (Ollama) on an uploaded dataset.
 * POST /api/data/:id/analyze
 */
export const analyzeDataset = (datasetId) => {
    // No timeout — let Ollama run to completion however long it needs
    return request(`/data/${datasetId}/analyze`, {
        method: "POST",
    });
};

// ── Dataset CRUD ───────────────────────────────────────────────

/** List all datasets for the org. GET /api/data/datasets */
export const listDatasets = () => request("/data/datasets");

/** List all datasets that have been analyzed by the LLM (i.e. have a saved dashboard). */
export const listAnalyzedDatasets = (search = "") =>
    request(`/data/analyzed${search ? `?search=${encodeURIComponent(search)}` : ""}`);

/** List analyzed datasets for a specific showroom (owner org console). */
export const listShowroomDashboards = (showroomId) =>
    request(`/data/analyzed?showroom_id=${encodeURIComponent(showroomId)}`);

/** Fetch the stored LLM analysis for a specific dataset. GET /api/data/:id/analysis */
export const getDatasetAnalysis = (datasetId) => request(`/data/${datasetId}/analysis`);

/** Save an auto-captured dashboard thumbnail (base64 PNG). PATCH /api/data/:id/thumbnail */
export const saveDatasetThumbnail = (datasetId, thumbnail) =>
    request(`/data/${datasetId}/thumbnail`, {
        method: 'PATCH',
        body: JSON.stringify({ thumbnail }),
    });

/** Save dashboard layout (viewMode + order arrays). PATCH /api/data/:id/layout */
export const saveDashboardLayout = (datasetId, layout) =>
    request(`/data/${datasetId}/layout`, {
        method: 'PATCH',
        body: JSON.stringify(layout),
    });

/** Load saved dashboard layout. GET /api/data/:id/layout */
export const getDashboardLayout = (datasetId) => request(`/data/${datasetId}/layout`);

/** Use LLM to edit a single chart or insight. POST /api/data/:id/edit-item */
export const editDashboardItem = (datasetId, { type, index, instruction }) =>
    request(`/data/${datasetId}/edit-item`, {
        method: 'POST',
        body: JSON.stringify({ type, index, instruction }),
    });

/** Test an external DB connection + get table list. POST /api/data/db-connect/test */
export const testDbConnection = (params) =>
    request('/data/db-connect/test', {
        method: 'POST',
        body: JSON.stringify(params),
    });

/** Import a table from an external DB as a new dataset. POST /api/data/db-connect/import */
export const importDbTable = (params) =>
    request('/data/db-connect/import', {
        method: 'POST',
        body: JSON.stringify(params),
    });

/** Get paginated (+ searchable) rows from a dataset. GET /api/data/:id/rows */
export const getDatasetRows = (datasetId, { page = 1, limit = 50, search = "" } = {}) => {
    const params = new URLSearchParams({ page, limit, ...(search && { search }) });
    return request(`/data/${datasetId}/rows?${params}`);
};

/** Add a new row to a dataset. POST /api/data/:id/rows */
export const addDatasetRow = (datasetId, values) =>
    request(`/data/${datasetId}/rows`, { method: "POST", body: JSON.stringify({ values }) });

/** Update a row in a dataset. PUT /api/data/:id/rows/:rowId */
export const updateDatasetRow = (datasetId, rowId, values) =>
    request(`/data/${datasetId}/rows/${rowId}`, { method: "PUT", body: JSON.stringify({ values }) });

/** Delete a row from a dataset. DELETE /api/data/:id/rows/:rowId */
export const deleteDatasetRow = (datasetId, rowId) =>
    request(`/data/${datasetId}/rows/${rowId}`, { method: "DELETE" });

// ── Admin: Showrooms ──────────────────────────────────────────
export const listShowrooms = (search = "") =>
    request(`/admin/showrooms${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const createShowroom = (data) =>
    request("/admin/showrooms", { method: "POST", body: JSON.stringify(data) });
export const updateShowroom = (id, data) =>
    request(`/admin/showrooms/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteShowroom = (id) =>
    request(`/admin/showrooms/${id}`, { method: "DELETE" });
export const uploadShowroomCover = (id, formData) =>
    request(`/admin/showrooms/${id}/cover`, { method: "PATCH", body: formData });

// ── Admin: Members ────────────────────────────────────────────
export const listMembers = (search = "") =>
    request(`/admin/members${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const removeMember = (id) =>
    request(`/admin/members/${id}`, { method: "DELETE" });
export const reassignMemberShowroom = (memberId, showroomId) =>
    request(`/admin/members/${memberId}/showroom`, { method: "PATCH", body: JSON.stringify({ showroom_id: showroomId || null }) });

// ── Admin: Invites ────────────────────────────────────────────
export const listInvites = () => request("/admin/invites");
export const sendInvite = (data) =>
    request("/admin/invites", { method: "POST", body: JSON.stringify(data) });
export const cancelInvite = (id) =>
    request(`/admin/invites/${id}`, { method: "DELETE" });

// ── Admin: Requests ───────────────────────────────────────────
export const listRequests = () => request("/admin/requests");
export const approveRequest = (id) =>
    request(`/admin/requests/${id}/approve`, { method: "POST" });
export const rejectRequest = (id) =>
    request(`/admin/requests/${id}/reject`, { method: "POST" });

// ── Admin: Owner Overview ─────────────────────────────────────
export const getOrgOverview = () => request("/admin/overview");

// ── Auth: Current User Profile (with org + showroom names) ───
export const getProfile = () => request("/auth/me");

// ── Insight SQL Execution ─────────────────────────────────────
/** Run a read-only AI-generated SQL query against a specific dataset. */
export const runInsightQuery = (datasetId, sql_query) =>
    request(`/data/${datasetId}/insight-query`, {
        method: "POST",
        body: JSON.stringify({ sql_query }),
    });

/** Permanently delete a dataset (rows, metadata, storage table). */
export const deleteDataset = (datasetId) =>
    request(`/data/${datasetId}`, { method: "DELETE" });

/** Send a natural-language question to the chatbot for a dataset. */
export const chatWithDataset = (datasetId, question) =>
    request(`/data/${datasetId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question }),
    });
