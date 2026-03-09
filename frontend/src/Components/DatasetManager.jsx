import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { listDatasets, getDatasetRows, addDatasetRow, updateDatasetRow, deleteDatasetRow } from "../services/api.js";

const fadeIn = keyframes`from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); }`;

const Wrapper = styled.div`padding: 32px 40px; animation: ${fadeIn} 0.3s ease;`;

const PageHeader = styled.div`
  display: flex; align-items: center; gap: 16px; margin-bottom: 32px;
`;
const PageTitle = styled.h1`font-size: 26px; color: #1e293b; margin: 0;`;

const DatasetList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const DatasetCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  &:hover { border-color: #3457B2; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(52,87,178,0.1); }
`;
const CardName = styled.h3`font-size: 17px; color: #1e293b; margin: 0 0 8px 0;`;
const CardMeta = styled.p`font-size: 13px; color: #94a3b8; margin: 0;`;

const Toolbar = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
`;

const SearchBox = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px;
  flex: 1; max-width: 380px;
  &:focus-within { border-color: #3457B2; box-shadow: 0 0 0 3px rgba(52,87,178,0.08); }
  input { border: none; outline: none; font-size: 15px; width: 100%; color: #1e293b; }
`;

const Btn = styled.button`
  display: flex; align-items: center; gap: 6px; padding: 9px 18px;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  ${p => p.primary ? `
    background: #3457B2; color: white; border: none;
    &:hover { background: #2a458c; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  ` : p.danger ? `
    background: white; color: #ef4444; border: 1px solid #fecaca;
    &:hover { background: #fef2f2; }
  ` : `
    background: white; color: #475569; border: 1px solid #e2e8f0;
    &:hover { background: #f8fafc; }
  `}
`;

const TableWrapper = styled.div`
  background: white; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const StyledTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 14px;
  th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
  th { background: #f8fafc; color: #64748b; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafbff; }
  td { color: #334155; }
`;

const InlineInput = styled.input`
  border: 1px solid #3457B2; border-radius: 6px; padding: 5px 8px;
  font-size: 13px; outline: none; width: 100%; min-width: 80px; max-width: 160px;
`;

const Pagination = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #64748b;
`;

const Modal = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex;
  align-items: center; justify-content: center; z-index: 200;
`;
const ModalBox = styled.div`
  background: white; border-radius: 16px; padding: 32px; width: 480px; max-width: 95vw;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
`;
const ModalTitle = styled.h2`font-size: 20px; color: #1e293b; margin: 0 0 20px 0;`;
const ModalField = styled.div`margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }`;
const ModalInput = styled.input`
  width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none;
  &:focus { border-color: #3457B2; box-shadow: 0 0 0 3px rgba(52,87,178,0.08); }
  box-sizing: border-box;
`;
const Msg = styled.div`
  padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 12px;
  ${p => p.error ? `background:#fef2f2; color:#ef4444; border:1px solid #fecaca;` : `background:#ecfdf5; color:#10b981; border:1px solid #a7f3d0;`}
`;

const LIMIT = 50;

export default function DatasetManager({ fixedDatasetId, hideHeader }) {
    const [view, setView] = useState(fixedDatasetId ? "table" : "list"); // "list" | "table"
    const [datasets, setDatasets] = useState([]);
    const [activeDataset, setActiveDataset] = useState(fixedDatasetId ? { id: fixedDatasetId, name: 'Dashboard Dataset' } : null);

    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [editRowId, setEditRowId] = useState(null);
    const [editValues, setEditValues] = useState({});

    const [showAddModal, setShowAddModal] = useState(false);
    const [addValues, setAddValues] = useState({});

    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch datasets on mount if no fixed ID
    useEffect(() => {
        if (!fixedDatasetId) {
            listDatasets().then(res => setDatasets(res.datasets || [])).catch(console.error);
        }
    }, [fixedDatasetId]);

    const openDataset = async (dataset) => {
        setActiveDataset(dataset);
        setPage(1);
        setSearch("");
        setSearchInput("");
        setView("table");
    };

    const fetchRows = useCallback(async () => {
        if (!activeDataset) return;
        setLoading(true);
        try {
            const res = await getDatasetRows(activeDataset.id, { page, limit: LIMIT, search });
            setRows(res.rows);
            setColumns(res.columns);
            setTotalCount(res.totalCount);
        } catch (e) { showToast(e.message, true); }
        finally { setLoading(false); }
    }, [activeDataset, page, search]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    const showToast = (msg, error = false) => {
        setToast({ msg, error });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSearch = () => { setSearch(searchInput); setPage(1); };

    // Inline Edit
    const startEdit = (row) => {
        setEditRowId(row._id);
        const vals = {};
        columns.forEach(col => vals[col] = row[col] || "");
        setEditValues(vals);
    };
    const cancelEdit = () => { setEditRowId(null); setEditValues({}); };
    const saveEdit = async (rowId) => {
        try {
            await updateDatasetRow(activeDataset.id, rowId, editValues);
            showToast("Row updated!");
            cancelEdit();
            fetchRows();
        } catch (e) { showToast(e.message, true); }
    };

    // Delete
    const handleDelete = async (rowId) => {
        if (!window.confirm("Delete this row?")) return;
        try {
            await deleteDatasetRow(activeDataset.id, rowId);
            showToast("Row deleted!");
            fetchRows();
        } catch (e) { showToast(e.message, true); }
    };

    // Add New Row
    const openAddModal = () => {
        const init = {};
        columns.forEach(col => init[col] = "");
        setAddValues(init);
        setShowAddModal(true);
    };
    const handleAddRow = async () => {
        try {
            await addDatasetRow(activeDataset.id, addValues);
            showToast("Row added!");
            setShowAddModal(false);
            setPage(1);
            fetchRows();
        } catch (e) { showToast(e.message, true); }
    };

    const totalPages = Math.ceil(totalCount / LIMIT);

    if (view === "list") {
        return (
            <Wrapper>
                <PageHeader>
                    <TableRowsIcon style={{ color: "#3457B2", fontSize: 32 }} />
                    <PageTitle>Datasets</PageTitle>
                </PageHeader>
                {datasets.length === 0 ? (
                    <p style={{ color: "#94a3b8" }}>No datasets found. Upload a CSV from the Create page.</p>
                ) : (
                    <DatasetList>
                        {datasets.map(ds => (
                            <DatasetCard key={ds.id} onClick={() => openDataset(ds)}>
                                <CardName>{ds.name}</CardName>
                                <CardMeta>{ds.row_count?.toLocaleString()} rows · {ds.column_count} columns</CardMeta>
                                <CardMeta style={{ marginTop: 6 }}>{new Date(ds.created_at).toLocaleDateString()}</CardMeta>
                            </DatasetCard>
                        ))}
                    </DatasetList>
                )}
            </Wrapper>
        );
    }

    return (
        <Wrapper style={hideHeader ? { padding: 0 } : {}}>
            {toast && <Msg error={toast.error} style={{ position: 'fixed', top: 20, right: 20, zIndex: 300, minWidth: 260 }}>{toast.msg}</Msg>}

            {!hideHeader && (
                <PageHeader>
                    {!fixedDatasetId && <Btn onClick={() => setView("list")}><ArrowBackIcon fontSize="small" /> Back</Btn>}
                    <PageTitle>{activeDataset?.name}</PageTitle>
                    <CardMeta>{totalCount.toLocaleString()} total rows</CardMeta>
                </PageHeader>
            )}

            <Toolbar>
                <SearchBox>
                    <SearchIcon style={{ color: "#94a3b8", flexShrink: 0 }} />
                    <input
                        placeholder="Search all columns..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                    />
                </SearchBox>
                <div style={{ display: "flex", gap: 10 }}>
                    <Btn onClick={handleSearch}>Search</Btn>
                    {search && <Btn onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>Clear</Btn>}
                    <Btn primary onClick={openAddModal}><AddCircleOutlineIcon fontSize="small" /> Add Row</Btn>
                </div>
            </Toolbar>

            <TableWrapper>
                {loading ? (
                    <p style={{ padding: "24px", color: "#94a3b8", textAlign: "center" }}>Loading...</p>
                ) : (
                    <StyledTable>
                        <thead>
                            <tr>
                                {columns.map(col => <th key={col}>{col}</th>)}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row._id}>
                                    {columns.map(col => (
                                        <td key={col}>
                                            {editRowId === row._id ? (
                                                <InlineInput
                                                    value={editValues[col] ?? ""}
                                                    onChange={e => setEditValues({ ...editValues, [col]: e.target.value })}
                                                />
                                            ) : (
                                                String(row[col] ?? "")
                                            )}
                                        </td>
                                    ))}
                                    <td style={{ display: "flex", gap: 6 }}>
                                        {editRowId === row._id ? (
                                            <>
                                                <Btn primary onClick={() => saveEdit(row._id)}><SaveIcon fontSize="small" /></Btn>
                                                <Btn onClick={cancelEdit}><CloseIcon fontSize="small" /></Btn>
                                            </>
                                        ) : (
                                            <>
                                                <Btn onClick={() => startEdit(row)}><EditIcon fontSize="small" /></Btn>
                                                <Btn danger onClick={() => handleDelete(row._id)}><DeleteOutlineIcon fontSize="small" /></Btn>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                )}
                <Pagination>
                    <span>Page {page} of {totalPages || 1} · {totalCount.toLocaleString()} rows</span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Btn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Btn>
                        <Btn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next →</Btn>
                    </div>
                </Pagination>
            </TableWrapper>

            {showAddModal && (
                <Modal onClick={() => setShowAddModal(false)}>
                    <ModalBox onClick={e => e.stopPropagation()}>
                        <ModalTitle>Add New Row</ModalTitle>
                        {columns.map(col => (
                            <ModalField key={col}>
                                <label>{col}</label>
                                <ModalInput
                                    placeholder={`Enter ${col}`}
                                    value={addValues[col] || ""}
                                    onChange={e => setAddValues({ ...addValues, [col]: e.target.value })}
                                />
                            </ModalField>
                        ))}
                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            <Btn primary onClick={handleAddRow}>Add Row</Btn>
                            <Btn onClick={() => setShowAddModal(false)}>Cancel</Btn>
                        </div>
                    </ModalBox>
                </Modal>
            )}
        </Wrapper>
    );
}
