import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { listAnalyzedDatasets, getDatasetAnalysis, deleteDataset } from '../services/api.js';

const Wrapper = styled.div`
    padding: 30px 40px;
    max-width: 1400px;
    margin: 0 auto;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
`;

const Title = styled.h1`
    font-size: 26px;
    font-weight: 700;
    color: #1a1a24;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
    gap: 24px;
`;

const Card = styled.div`
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;

    &:hover {
        box-shadow: 0 8px 24px rgba(52, 87, 178, 0.12);
        transform: translateY(-3px);
        border-color: #c7d2fe;
    }
`;

const CardBanner = styled.div`
    height: 260px;
    background: linear-gradient(135deg, #3457B2 0%, #60a5fa 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
`;

const CardBody = styled.div`
    padding: 20px;
`;

const CardTitle = styled.h3`
    font-size: 17px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 6px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const CardMeta = styled.p`
    font-size: 13px;
    color: #64748b;
    margin: 0 0 16px 0;
`;

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #eff6ff;
    color: #3457B2;
    border: 1px solid #c7d2fe;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
`;

const OpenButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    padding: 8px 16px;
    background: #3457B2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: #2A458C; }
`;

const EmptyState = styled.div`
    text-align: center;
    color: #94a3b8;
    padding: 80px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
`;

const CreateButton = styled.button`
    padding: 10px 20px;
    background-color: #3457B2;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    &:hover { background-color: #2A458C; }
`;

export default function DashboardList({ onOpenDashboard, setActivePage }) {
    const [dashboards, setDashboards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [opening, setOpening] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null); // stores the id of the card whose menu is open

    useEffect(() => {
        listAnalyzedDatasets()
            .then(res => setDashboards(res.dashboards || []))
            .catch(() => setDashboards([]))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleOpen = async (dashboard) => {
        setOpening(dashboard.id);
        try {
            const res = await getDatasetAnalysis(dashboard.id);
            onOpenDashboard(res.analysis, res.name, res.id);
        } catch (err) {
            console.error('Failed to load dashboard analysis:', err);
        } finally {
            setOpening(null);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('This will permanently delete the dashboard, its dataset, and all data. Continue?')) return;
        try {
            await deleteDataset(id);
            setDashboards(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
        setMenuOpen(null);
    };

    if (loading) return (
        <Wrapper>
            <PageHeader><Title><AutoAwesomeIcon style={{ color: '#3457B2' }} /> Dashboards</Title></PageHeader>
            <p style={{ color: '#64748b' }}>Loading your dashboards...</p>
        </Wrapper>
    );

    return (
        <Wrapper>
            <PageHeader>
                <Title>
                    <AutoAwesomeIcon style={{ color: '#3457B2' }} />
                    Your AI Dashboards
                </Title>
                <CreateButton onClick={() => setActivePage('create')}>
                    <AddCircleOutlineIcon sx={{ fontSize: 18 }} /> Create New
                </CreateButton>
            </PageHeader>

            {dashboards.length === 0 ? (
                <EmptyState>
                    <AutoAwesomeIcon style={{ fontSize: 56, color: '#c7d2fe' }} />
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#475569', margin: 0 }}>No dashboards yet</p>
                    <p style={{ margin: 0 }}>Upload a CSV and let the AI generate your first dashboard.</p>
                    <CreateButton onClick={() => setActivePage('create')}>
                        <AddCircleOutlineIcon sx={{ fontSize: 18 }} /> Create New
                    </CreateButton>
                </EmptyState>
            ) : (
                <Grid>
                    {dashboards.map(d => (
                        <Card key={d.id} onClick={() => handleOpen(d)}>
                            {/* 3-dot menu */}
                            <div
                                onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === d.id ? null : d.id); }}
                                style={{ position: 'absolute', top: 8, right: 10, zIndex: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.85)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#475569', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
                            >⋯</div>
                            {menuOpen === d.id && (
                                <div
                                    onClick={e => e.stopPropagation()}
                                    style={{ position: 'absolute', top: 40, right: 10, zIndex: 20, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: 130, overflow: 'hidden' }}
                                >
                                    <div
                                        onClick={e => handleDelete(e, d.id)}
                                        style={{ padding: '10px 14px', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >🗑 Delete</div>
                                </div>
                            )}
                            {d.thumbnail ? (
                                <img src={d.thumbnail} alt={d.name} style={{ width: '100%', height: 260, objectFit: 'cover', objectPosition: 'top', display: 'block', borderRadius: '16px 16px 0 0' }} />
                            ) : (
                                    <div style={{ height: 260, background: 'linear-gradient(135deg, #3457B2, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px 16px 0 0' }}>
                                    </div>
                            )}
                            <CardBody>
                                <CardTitle>{d.name}</CardTitle>
                                <CardMeta>Created {formatDate(d.created_at)}</CardMeta>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <Badge><TableRowsIcon sx={{ fontSize: 13 }} /> {d.row_count?.toLocaleString() || '?'} rows</Badge>
                                    <Badge style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 13 }} /> AI Analyzed
                                    </Badge>
                                </div>
                                <OpenButton disabled={opening === d.id}>
                                    {opening === d.id ? 'Loading...' : <><OpenInNewIcon sx={{ fontSize: 16 }} /> Open Dashboard</>}
                                </OpenButton>
                            </CardBody>
                        </Card>
                    ))}
                </Grid>
            )}
        </Wrapper>
    );
}
