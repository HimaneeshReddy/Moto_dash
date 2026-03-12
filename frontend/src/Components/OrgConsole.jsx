import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import StoreIcon from "@mui/icons-material/Store";
import GroupIcon from "@mui/icons-material/Group";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CancelIcon from "@mui/icons-material/Cancel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DashboardIcon from "@mui/icons-material/Dashboard";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import {
    listShowrooms, createShowroom, updateShowroom, deleteShowroom,
    listMembers, removeMember, reassignMemberShowroom,
    listInvites, sendInvite, cancelInvite, getUser,
    listRequests, approveRequest, rejectRequest,
    listShowroomDashboards, getDatasetAnalysis
} from "../services/api.js";

const fadeIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;

const Wrapper = styled.div`
  padding: 32px 40px; 
  animation: ${fadeIn} 0.3s ease; 
  max-width: 1200px; 
  margin: 0 auto;
  background-color: #f4f6f8;
  min-height: 100vh;
`;
const PageHeader = styled.div`display: flex; align-items: center; gap: 14px; margin-bottom: 24px;`;
const PageTitle = styled.h1`font-size: 26px; color: #1e293b; margin: 0;`;

const Tabs = styled.div`display: flex; border-bottom: 2px solid #e2e8f0; margin-bottom: 28px;`;
const Tab = styled.button`
  padding: 10px 22px; border: none; background: none; font-size: 15px; font-weight: 600; cursor: pointer;
  color: ${p => p.active ? "#3457B2" : "#64748b"};
  border-bottom: 3px solid ${p => p.active ? "#3457B2" : "transparent"};
  margin-bottom: -2px; transition: all 0.2s;
  &:hover { color: #3457B2; }
`;

const Toolbar = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; flex-wrap: wrap;`;
const SearchBox = styled.div`
  display: flex; align-items: center; gap: 8px; background: white;
  border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; flex: 1; max-width: 360px;
  &:focus-within { border-color: #3457B2; }
  input { border: none; outline: none; font-size: 14px; width: 100%; }
`;

const Btn = styled.button`
  display: flex; align-items: center; gap: 6px; padding: 9px 16px;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  ${p => p.primary ? `background: #3457B2; color: white; border: none; &:hover { background: #2a458c; }` :
        p.danger ? `background: white; color: #ef4444; border: 1px solid #fecaca; &:hover { background: #fef2f2; }` :
            `background: white; color: #475569; border: 1px solid #e2e8f0; &:hover { background: #f8fafc; }`}
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── Card Grid (Showrooms) ── */
const CardGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px;`;
const Card = styled.div`
  background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 8px;
`;
const CardName = styled.h3`font-size: 17px; color: #1e293b; margin: 0;`;
const CardSub = styled.p`font-size: 13px; color: #94a3b8; margin: 0;`;
const CardActions = styled.div`display: flex; gap: 8px; margin-top: 12px;`;

/* ── Table (Members / Invites) ── */
const TableWrap = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;`;
const StyledTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 14px;
  th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f1f5f9; }
  th { background: #f8fafc; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafbff; }
  td { color: #334155; }
`;

const Badge = styled.span`
  padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
  ${p => p.role === "owner" ? `background:#fef3c7; color:#92400e;` :
        p.role === "manager" ? `background:#eff6ff; color:#1d4ed8;` : `background:#f0fdf4; color:#166534;`}
  ${p => p.status === "inactive" ? `background:#f1f5f9; color:#94a3b8;` : ""}
`;

/* ── Modal ── */
const Modal = styled.div`position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200;`;
const ModalBox = styled.div`background: white; border-radius: 16px; padding: 32px; width: 440px; max-width: 95vw; box-shadow: 0 25px 50px rgba(0,0,0,0.15);`;
const ModalTitle = styled.h2`font-size: 20px; color: #1e293b; margin: 0 0 20px 0;`;
const Field = styled.div`margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }`;
const Input = styled.input`
  width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;
  &:focus { border-color: #3457B2; box-shadow: 0 0 0 3px rgba(52,87,178,0.08); }
`;
const Select = styled.select`
  width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; background: white;
`;

/* ── Showroom Dashboards Modal ── */
const DashItem = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafbff; }
`;
const DashName = styled.div`font-size: 14px; font-weight: 600; color: #1e293b;`;
const DashMeta = styled.div`font-size: 12px; color: #94a3b8; margin-top: 2px;`;
const OpenBtn = styled.button`
  display: flex; align-items: center; gap: 5px; padding: 7px 14px;
  background: #3457B2; color: white; border: none; border-radius: 7px;
  font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
  &:hover { background: #2a458c; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Msg = styled.div`
  padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 12px;
  ${p => p.error ? `background:#fef2f2; color:#ef4444; border:1px solid #fecaca;` : p.info ? `background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-family:monospace;word-break:break-all;` : `background:#ecfdf5; color:#10b981; border:1px solid #a7f3d0;`}
`;
const Token = styled.div`
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;
  font-family: monospace; font-size: 12px; color: #1e293b; word-break: break-all; margin: 10px 0;
`;
const Toast = styled.div`
  position: fixed; top: 20px; right: 20px; z-index: 300; padding: 12px 20px; border-radius: 10px; font-size: 14px; min-width: 260px;
  ${p => p.error ? `background:#fef2f2; color:#ef4444; border:1px solid #fecaca;` : `background:#ecfdf5; color:#059669; border:1px solid #a7f3d0;`}
`;

/* ──────────────────────────────────────────────── */
export default function OrgConsole({ onOpenDashboard, setActivePage }) {
    const user = getUser(); // Grab user details from local storage utility
    const [tab, setTab] = useState(user?.role === "owner" ? "showrooms" : "members");
    const [toast, setToast] = useState(null);
    const showToast = (msg, error = false) => { setToast({ msg, error }); setTimeout(() => setToast(null), 3500); };

    /* ── Showroom Dashboards Modal ── */
    const [srDashModal, setSrDashModal] = useState(null); // { id, name } of selected showroom
    const [srDashboards, setSrDashboards] = useState([]);
    const [srDashLoading, setSrDashLoading] = useState(false);
    const [openingId, setOpeningId] = useState(null);

    const openShowroomDashboards = async (sr) => {
        setSrDashModal(sr);
        setSrDashboards([]);
        setSrDashLoading(true);
        try {
            const r = await listShowroomDashboards(sr.id);
            setSrDashboards(r.dashboards || []);
        } catch (e) { showToast(e.message, true); }
        finally { setSrDashLoading(false); }
    };

    const handleOpenDashboard = async (d) => {
        if (!onOpenDashboard || !setActivePage) return;
        setOpeningId(d.id);
        try {
            const r = await getDatasetAnalysis(d.id);
            setSrDashModal(null);
            onOpenDashboard(r.analysis, d.name, d.id);
            setActivePage("dashboard");
        } catch (e) { showToast(e.message, true); }
        finally { setOpeningId(null); }
    };

    /* ── Showrooms ── */
    const [showrooms, setShowrooms] = useState([]);
    const [srSearch, setSrSearch] = useState("");
    const [editSr, setEditSr] = useState(null); // { id, name, location }
    const [showSrModal, setShowSrModal] = useState(false);
    const [srForm, setSrForm] = useState({ name: "", location: "" });

    const fetchShowrooms = useCallback(async () => {
        try { const r = await listShowrooms(srSearch); setShowrooms(r.showrooms || []); }
        catch (e) { showToast(e.message, true); }
    }, [srSearch]);
    useEffect(() => { if (tab === "showrooms") fetchShowrooms(); }, [tab, fetchShowrooms]);

    const openCreateSr = () => { setSrForm({ name: "", location: "" }); setEditSr(null); setShowSrModal(true); };
    const openEditSr = (sr) => { setSrForm({ name: sr.name, location: sr.location || "" }); setEditSr(sr); setShowSrModal(true); };
    const submitSr = async () => {
        try {
            if (editSr) { await updateShowroom(editSr.id, srForm); showToast("Showroom updated!"); }
            else { await createShowroom(srForm); showToast("Showroom created!"); }
            setShowSrModal(false); fetchShowrooms();
        } catch (e) { showToast(e.message, true); }
    };
    const handleDeleteSr = async (id) => {
        if (!window.confirm("Delete this showroom? All related data may be affected.")) return;
        try { await deleteShowroom(id); showToast("Showroom deleted!"); fetchShowrooms(); }
        catch (e) { showToast(e.message, true); }
    };

    /* ── Members ── */
    const [members, setMembers] = useState([]);
    const [memberSearch, setMemberSearch] = useState("");
    const [reassigningId, setReassigningId] = useState(null);  // member id being reassigned
    const [reassignVal, setReassignVal] = useState("");         // selected showroom id
    const fetchMembers = useCallback(async () => {
        try { const r = await listMembers(memberSearch); setMembers(r.members || []); }
        catch (e) { showToast(e.message, true); }
    }, [memberSearch]);
    useEffect(() => { if (tab === "members") fetchMembers(); }, [tab, fetchMembers]);
    // Also fetch showrooms for the reassign dropdown when on members tab
    useEffect(() => { if (tab === "members") fetchShowrooms(); }, [tab, fetchShowrooms]);

    const startReassign = (m) => { setReassigningId(m.id); setReassignVal(m.showroom_id || ""); };
    const cancelReassign = () => { setReassigningId(null); setReassignVal(""); };
    const saveReassign = async (memberId) => {
        try {
            await reassignMemberShowroom(memberId, reassignVal || null);
            showToast("Showroom updated!");
            cancelReassign();
            fetchMembers();
        } catch (e) { showToast(e.message, true); }
    };

    /* ── Invites ── */
    const [invites, setInvites] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteForm, setInviteForm] = useState({ contactEmail: "", firstName: "", lastName: "", role: "analyst", showroom_id: "" });
    const [newToken, setNewToken] = useState(null);
    const fetchInvites = useCallback(async () => {
        try { const r = await listInvites(); setInvites(r.invites || []); }
        catch (e) { showToast(e.message, true); }
    }, []);
    useEffect(() => { if (tab === "members") fetchInvites(); }, [tab, fetchInvites]);

    const handleRemoveMember = async (id) => {
        if (!window.confirm("Deactivate this member?")) return;
        try {
            const res = await removeMember(id);
            if (res.message && res.message.includes("Removal request sent")) {
                showToast(res.message);
                fetchRequests();
            } else {
                showToast("Member deactivated.");
                fetchMembers();
            }
        }
        catch (e) { showToast(e.message, true); }
    };
    const handleSendInvite = async () => {
        try {
            const r = await sendInvite(inviteForm);
            if (r.message && r.message.includes("Invite request sent")) {
                showToast(r.message);
                fetchRequests();
            } else {
                setNewToken(r.invite_token);
                fetchInvites();
                showToast("Invite created!");
            }
        } catch (e) { showToast(e.message, true); }
    };
    const handleCancelInvite = async (id) => {
        try { await cancelInvite(id); showToast("Invite cancelled."); fetchInvites(); }
        catch (e) { showToast(e.message, true); }
    };
    /* ── Requests ── */
    const [requests, setRequests] = useState([]);
    const fetchRequests = useCallback(async () => {
        try { const r = await listRequests(); setRequests(r.requests || []); }
        catch (e) { showToast(e.message, true); }
    }, []);
    useEffect(() => { if (tab === "members") fetchRequests(); }, [tab, fetchRequests]);

    const handleApproveRequest = async (id) => {
        try {
            await approveRequest(id);
            showToast("Request approved.");
            fetchRequests();
            fetchMembers();
            fetchInvites();
        } catch (e) { showToast(e.message, true); }
    };

    const handleRejectRequest = async (id) => {
        if (!window.confirm("Reject this request?")) return;
        try {
            await rejectRequest(id);
            showToast("Request rejected.");
            fetchRequests();
        } catch (e) { showToast(e.message, true); }
    };

    const copyToken = () => { navigator.clipboard.writeText(newToken); showToast("Token copied!"); };

    return (
        <Wrapper>
            {toast && <Toast error={toast.error}>{toast.msg}</Toast>}

            <PageHeader>
                <StoreIcon style={{ color: "#3457B2", fontSize: 32 }} />
                <div>
                    <PageTitle>Organization Console</PageTitle>
                    <p style={{ margin: 0, fontSize: 14, color: "#94a3b8" }}>Manage your showrooms and team members</p>
                </div>
            </PageHeader>

            <Tabs>
                {user?.role === "owner" && (
                    <Tab active={tab === "showrooms"} onClick={() => setTab("showrooms")}><StoreIcon fontSize="small" /> &nbsp;Showrooms</Tab>
                )}
                <Tab active={tab === "members"} onClick={() => setTab("members")}><GroupIcon fontSize="small" /> &nbsp;Members & Invites</Tab>
            </Tabs>

            {/* ──── SHOWROOMS TAB ──── */}
            {tab === "showrooms" && (
                <>
                    <Toolbar>
                        <SearchBox>
                            <SearchIcon style={{ color: "#94a3b8" }} />
                            <input placeholder="Search showrooms..." value={srSearch} onChange={e => setSrSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchShowrooms()} />
                        </SearchBox>
                        <div style={{ display: "flex", gap: 8 }}>
                            <Btn onClick={fetchShowrooms}>Search</Btn>
                            {user?.role === "owner" && (
                                <Btn primary onClick={openCreateSr}><AddCircleOutlineIcon fontSize="small" /> Add Showroom</Btn>
                            )}
                        </div>
                    </Toolbar>
                    {showrooms.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>No showrooms found. Create your first one!</p>
                    ) : (
                        <CardGrid>
                            {showrooms.map(sr => (
                                <Card key={sr.id}>
                                    <CardName>{sr.name}</CardName>
                                    <CardSub>{sr.location || "No location set"}</CardSub>
                                    <CardSub>{new Date(sr.created_at).toLocaleDateString()}</CardSub>
                                    <CardActions>
                                        <Btn onClick={() => openShowroomDashboards(sr)} style={{ flex: 1, justifyContent: "center" }}>
                                            <DashboardIcon fontSize="small" /> Dashboards
                                        </Btn>
                                        {user?.role === "owner" && (
                                            <>
                                                <Btn onClick={() => openEditSr(sr)}><EditIcon fontSize="small" /></Btn>
                                                <Btn danger onClick={() => handleDeleteSr(sr.id)}><DeleteOutlineIcon fontSize="small" /></Btn>
                                            </>
                                        )}
                                    </CardActions>
                                </Card>
                            ))}
                        </CardGrid>
                    )}
                </>
            )}

            {/* ──── MEMBERS TAB ──── */}
            {tab === "members" && (
                <>
                    <Toolbar>
                        <SearchBox>
                            <SearchIcon style={{ color: "#94a3b8" }} />
                            <input placeholder="Search by name or email..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchMembers()} />
                        </SearchBox>
                        <div style={{ display: "flex", gap: 8 }}>
                            <Btn onClick={fetchMembers}>Search</Btn>
                            <Btn primary onClick={() => {
                                setInviteForm({
                                    contactEmail: "",
                                    firstName: "",
                                    lastName: "",
                                    role: "analyst",
                                    showroom_id: user?.role === "manager" ? user?.showroomId : ""
                                });
                                setNewToken(null);
                                setShowInviteModal(true);
                            }}>
                                <PersonAddIcon fontSize="small" /> Invite Member
                            </Btn>
                        </div>
                    </Toolbar>

                    <h3 style={{ color: "#64748b", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px 0" }}>Active Members</h3>
                    <TableWrap style={{ marginBottom: 28 }}>
                        <StyledTable>
                            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Showroom</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {members.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.first_name} {m.last_name}</td>
                                        <td>{m.email}</td>
                                        <td><Badge role={m.role}>{m.role}</Badge></td>
                                        <td>
                                            {reassigningId === m.id ? (
                                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                    <select
                                                        value={reassignVal}
                                                        onChange={e => setReassignVal(e.target.value)}
                                                        style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #3457B2", outline: "none", fontSize: 13 }}
                                                    >
                                                        <option value="">— None —</option>
                                                        {showrooms.map(sr => (
                                                            <option key={sr.id} value={sr.id}>{sr.name}</option>
                                                        ))}
                                                    </select>
                                                    <Btn primary onClick={() => saveReassign(m.id)}><SaveIcon fontSize="small" /></Btn>
                                                    <Btn onClick={cancelReassign}><CloseIcon fontSize="small" /></Btn>
                                                </div>
                                            ) : (
                                                <span
                                                    style={{
                                                        cursor: (user?.role === "owner" && m.role !== "owner") ? "pointer" : "default",
                                                        color: (user?.role === "owner" && m.role !== "owner") ? "#3457B2" : "#94a3b8",
                                                        textDecoration: (user?.role === "owner" && m.role !== "owner") ? "underline dotted" : "none",
                                                        fontSize: 13
                                                    }}
                                                    onClick={() => (user?.role === "owner" && m.role !== "owner") && startReassign(m)}
                                                    title={(user?.role === "owner" && m.role !== "owner") ? "Click to reassign showroom" : ""}
                                                >
                                                    {m.showroom_name || "— Unassigned"}
                                                </span>
                                            )}
                                        </td>
                                        <td><Badge status={m.status}>{m.status}</Badge></td>
                                        <td>
                                            {(user?.role === "owner" && m.role !== "owner") && (
                                                <Btn danger onClick={() => handleRemoveMember(m.id)}>
                                                    <DeleteOutlineIcon fontSize="small" /> Remove
                                                </Btn>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </StyledTable>
                    </TableWrap>

                    <h3 style={{ color: "#64748b", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px 0" }}>Pending Invites</h3>
                    <TableWrap>
                        <StyledTable>
                            <thead><tr><th>Email</th><th>Role</th><th>Expires</th><th>Actions</th></tr></thead>
                            <tbody>
                                {invites.length === 0 ? (
                                    <tr><td colSpan={4} style={{ color: "#94a3b8", textAlign: "center" }}>No pending invites.</td></tr>
                                ) : invites.map(inv => (
                                    <tr key={inv.id}>
                                        <td>{inv.email}</td>
                                        <td><Badge role={inv.role}>{inv.role}</Badge></td>
                                        <td>{new Date(inv.expires_at).toLocaleDateString()}</td>
                                        <td>
                                            <Btn danger onClick={() => handleCancelInvite(inv.id)}>
                                                <CancelIcon fontSize="small" /> Cancel
                                            </Btn>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </StyledTable>
                    </TableWrap>

                    <h3 style={{ color: "#64748b", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, margin: "20px 0 10px 0" }}>Requests (Approval Queue)</h3>
                    <TableWrap>
                        <StyledTable>
                            <thead><tr><th>Action</th><th>Target / Info</th><th>Status</th><th>Requested By</th><th>Date</th>{user?.role === "owner" && <th>Actions</th>}</tr></thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr><td colSpan={user?.role === "owner" ? 6 : 5} style={{ color: "#94a3b8", textAlign: "center" }}>No pending requests.</td></tr>
                                ) : requests.map(req => (
                                    <tr key={req.id}>
                                        <td><Badge role={req.action_type === 'invite_member' ? 'manager' : 'owner'}>
                                            {req.action_type === 'invite_member' ? 'Invite' : 'Remove'}
                                        </Badge></td>
                                        <td>
                                            {req.action_type === 'invite_member'
                                                ? `Invite ${req.payload?.contactEmail} as ${req.payload?.role}`
                                                : `Remove ${req.target_email}`}
                                        </td>
                                        <td><Badge status={req.status === 'rejected' ? 'inactive' : ''}>{req.status}</Badge></td>
                                        <td>{req.requester_first} {req.requester_last}</td>
                                        <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                        {user?.role === "owner" && (
                                            <td>
                                                {req.status === "pending" && (
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <Btn primary onClick={() => handleApproveRequest(req.id)}>Approve</Btn>
                                                        <Btn danger onClick={() => handleRejectRequest(req.id)}>Reject</Btn>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </StyledTable>
                    </TableWrap>
                </>
            )}

            {/* ──── SHOWROOM MODAL ──── */}
            {showSrModal && (
                <Modal onClick={() => setShowSrModal(false)}>
                    <ModalBox onClick={e => e.stopPropagation()}>
                        <ModalTitle>{editSr ? "Edit Showroom" : "Add New Showroom"}</ModalTitle>
                        <Field><label>Showroom Name *</label><Input placeholder="e.g. Chennai Main Showroom" value={srForm.name} onChange={e => setSrForm({ ...srForm, name: e.target.value })} /></Field>
                        <Field><label>Location</label><Input placeholder="e.g. 42 Mount Road, Chennai" value={srForm.location} onChange={e => setSrForm({ ...srForm, location: e.target.value })} /></Field>
                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <Btn primary onClick={submitSr}><SaveIcon fontSize="small" /> {editSr ? "Save Changes" : "Create Showroom"}</Btn>
                            <Btn onClick={() => setShowSrModal(false)}><CloseIcon fontSize="small" /> Cancel</Btn>
                        </div>
                    </ModalBox>
                </Modal>
            )}

            {/* ──── INVITE MODAL ──── */}
            {showInviteModal && (
                <Modal onClick={() => { setShowInviteModal(false); setNewToken(null); }}>
                    <ModalBox onClick={e => e.stopPropagation()}>
                        <ModalTitle>Invite Member</ModalTitle>
                        {!newToken ? (
                            <>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <Field style={{ flex: 1 }}><label>First Name *</label><Input placeholder="Jane" value={inviteForm.firstName} onChange={e => setInviteForm({ ...inviteForm, firstName: e.target.value })} /></Field>
                                    <Field style={{ flex: 1 }}><label>Last Name *</label><Input placeholder="Doe" value={inviteForm.lastName} onChange={e => setInviteForm({ ...inviteForm, lastName: e.target.value })} /></Field>
                                </div>
                                <Field><label>Personal Contact Email *</label><Input type="email" placeholder="jane.doe@personal.com" value={inviteForm.contactEmail} onChange={e => setInviteForm({ ...inviteForm, contactEmail: e.target.value })} /></Field>

                                <div style={{ display: "flex", gap: 10 }}>
                                    <Field style={{ flex: 1 }}>
                                        <label>Role *</label>
                                        <Select
                                            value={inviteForm.role}
                                            onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                                            disabled={user?.role === "manager"}
                                            title={user?.role === "manager" ? "Managers can only invite Analysts" : ""}
                                        >
                                            <option value="analyst">Analyst</option>
                                            {user?.role === "owner" && <option value="manager">Manager</option>}
                                        </Select>
                                        {user?.role === "manager" && <span style={{ fontSize: 11, color: "#64748b" }}>Managers can only invite Analysts</span>}
                                    </Field>

                                    <Field style={{ flex: 1 }}>
                                        <label>Showroom</label>
                                        {user?.role === "manager" ? (
                                            <Select disabled title="Auto-assigned to your showroom">
                                                <option>Your Showroom ({showrooms.find(s => s.id === user?.showroomId)?.name || 'Assigned'})</option>
                                            </Select>
                                        ) : (
                                            <Select value={inviteForm.showroom_id} onChange={e => setInviteForm({ ...inviteForm, showroom_id: e.target.value })}>
                                                <option value="">— Unassigned —</option>
                                                {showrooms.map(sr => (
                                                    <option key={sr.id} value={sr.id}>{sr.name}</option>
                                                ))}
                                            </Select>
                                        )}
                                    </Field>
                                </div>
                                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                    <Btn primary onClick={handleSendInvite}><PersonAddIcon fontSize="small" /> Send Invite</Btn>
                                    <Btn onClick={() => setShowInviteModal(false)}><CloseIcon fontSize="small" /> Cancel</Btn>
                                </div>
                            </>
                        ) : (
                            <>
                                <Msg>✅ Invite created! The system has auto-generated a company email and sent an invite link to the user's personal email.</Msg>
                                <Token>{newToken}</Token>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <Btn primary onClick={copyToken}><ContentCopyIcon fontSize="small" /> Copy Token</Btn>
                                    <Btn onClick={() => { setShowInviteModal(false); setNewToken(null); }}><CloseIcon fontSize="small" /> Done</Btn>
                                </div>
                            </>
                        )}
                    </ModalBox>
                </Modal>
            )}

            {/* ──── SHOWROOM DASHBOARDS MODAL ──── */}
            {srDashModal && (
                <Modal onClick={() => setSrDashModal(null)}>
                    <ModalBox onClick={e => e.stopPropagation()} style={{ width: 560, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                            <ModalTitle style={{ margin: 0 }}>
                                <DashboardIcon style={{ verticalAlign: "middle", marginRight: 8, color: "#3457B2" }} />
                                {srDashModal.name}
                            </ModalTitle>
                            <Btn onClick={() => setSrDashModal(null)} style={{ padding: "6px 10px" }}><CloseIcon fontSize="small" /></Btn>
                        </div>
                        <div style={{ overflowY: "auto", flex: 1, border: "1px solid #f1f5f9", borderRadius: 10 }}>
                            {srDashLoading ? (
                                <p style={{ color: "#94a3b8", textAlign: "center", padding: 24 }}>Loading dashboards...</p>
                            ) : srDashboards.length === 0 ? (
                                <p style={{ color: "#94a3b8", textAlign: "center", padding: 24 }}>No analyzed dashboards found for this showroom.</p>
                            ) : srDashboards.map(d => (
                                <DashItem key={d.id}>
                                    <div>
                                        <DashName>{d.name}</DashName>
                                        <DashMeta>
                                            {d.row_count?.toLocaleString()} rows · {d.column_count} columns
                                            &nbsp;·&nbsp;{new Date(d.updated_at || d.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </DashMeta>
                                    </div>
                                    <OpenBtn
                                        onClick={() => handleOpenDashboard(d)}
                                        disabled={openingId === d.id || !onOpenDashboard}
                                        title={!onOpenDashboard ? "Open from Home page" : ""}
                                    >
                                        {openingId === d.id ? "Opening..." : <><OpenInNewIcon fontSize="small" /> Open</>}
                                    </OpenBtn>
                                </DashItem>
                            ))}
                        </div>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "12px 0 0 0" }}>
                            {srDashboards.length} dashboard{srDashboards.length !== 1 ? "s" : ""} found
                        </p>
                    </ModalBox>
                </Modal>
            )}
        </Wrapper>
    );
}
