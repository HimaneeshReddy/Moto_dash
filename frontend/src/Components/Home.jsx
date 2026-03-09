import { Container } from 'lucide-react'
import React from 'react'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useState, useEffect } from "react";
import styled from 'styled-components';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { listAnalyzedDatasets, getDatasetAnalysis, deleteDataset } from '../services/api.js';





// const Container = styled.div`
//     display: flex;
//     width: 100vw;
//     height: 100vh;
//     overflow: hidden;
// `;

const MainContent = styled.div`
    flex: 1;
    min-height: 100vh;
    background-color: #f4f6f8; 
    overflow-y: scroll;
    /* overflow-x: hidden; */
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px; 
    width: 100%;
    border-bottom: 1px solid #ececec;
    background-color: #ffffff;
`

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    background-color: #f4f6f8;
    border-radius: 20px;
    padding: 0 15px;
    gap: 10px;
    height: 45px;
    margin-left: 20px;
`

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    transform: translateX(-20px);
`

const SearchBar = styled.input`
    width: 300px;
    height: 100%;
    background-color: transparent; 
    border: none;
    font-size: 15px;
    color: #555;

    &:focus {
        outline: none;
    }
    &::placeholder {
        color: #879ec7;
    }
`

const ContentArea = styled.div`
    display: flex;
    flex-direction: column;
    padding: 30px 40px;
    height: 100%;
`

const ContentHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between; 
    align-items: center;
    width: 100%;
    margin-bottom: 50px;
`

const Options = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 15px;
`

const SectionTitle = styled.h2`
    color: #1C2434;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
`

const PrimaryButton = styled.button`
    padding: 10px 20px;
    background-color: #3457B2;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        background-color: #2A458C;
    }
`;

const FilterWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`

const FilterButton = styled.button`
    display: flex;
    align-items: center;    
    justify-content: space-between;
    gap: 8px;
    padding: 10px 16px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #555;
    min-width: 100px;
    transition: all 0.2s;

    &:hover {
        background-color: #f9fafb;
        border-color: #d1d5db;
    }
`;

const FilterDropDown = styled.div`
    position: absolute;
    top: 48px;
    right: 0; 
    background-color: #ffffff;      
    border: 1px solid #eff3f9;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    z-index: 1000;
    width: 160px;
    overflow: hidden;
    padding: 4px;
`;

const FilterItem = styled.div`
    padding: 10px 12px;
    cursor: pointer;
    font-size: 14px;
    color: #555;
    border-radius: 4px;
    transition: background 0.1s;

    &:hover {
        background-color: #eff3f9;
        color: #3457B2;
    }
`;

const RecentCardArea = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    align-items: start;
`;

const ViewMoreButtonArea = styled.div`
    display: flex;
    justify-content: center;
    margin: 40px 0;
    margin-bottom: 20px;
`;

const ViewMoreButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    width: fit-content;
    background-color: #ffffff;
    color: #3457B2;
    border: 1px solid #3457B2;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 14px;
    &:hover {
        background-color: #f0f4ff;
    }
`;



const Home = ({ setActivePage, onOpenDashboard }) => {
    const [showFilter, setShowFilter] = useState(false);
    const [recentDashboards, setRecentDashboards] = useState([]);
    const [opening, setOpening] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuOpen, setMenuOpen] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            listAnalyzedDatasets(searchTerm)
                .then(res => setRecentDashboards((res.dashboards || []).slice(0, 6)))
                .catch(() => setRecentDashboards([]));
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);

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
            console.error('Failed to open dashboard:', err);
        } finally {
            setOpening(null);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('This will permanently delete the dashboard, its dataset, and all data. Continue?')) return;
        try {
            await deleteDataset(id);
            setRecentDashboards(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
        setMenuOpen(null);
    };
    return (
        <MainContent>
            <Header>
                <HeaderLeft>
                    <SearchOutlinedIcon sx={{ color: '#879ec7' }} />
                    <SearchBar
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </HeaderLeft>
                <HeaderRight>
                    <NotificationsNoneOutlinedIcon sx={{ color: '#64748B', cursor: 'pointer' }} />
                    <AccountCircleOutlinedIcon sx={{ color: '#64748B', cursor: 'pointer', fontSize: '32px' }} />
                </HeaderRight>
            </Header>
            <ContentArea>
                <ContentHeader>
                    <SectionTitle>Recent Work</SectionTitle>
                    <Options>
                        <PrimaryButton onClick={() => setActivePage("create")}>
                            <AddCircleOutlineIcon sx={{ fontSize: 18 }} /> Create New
                        </PrimaryButton>
                        <FilterWrapper>
                            <FilterButton onClick={() => setShowFilter(!showFilter)}>
                                Filter <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 18 }} />
                            </FilterButton>
                            {showFilter && (
                                <FilterDropDown>
                                    <FilterItem onClick={() => setShowFilter(false)}>All Projects</FilterItem>
                                    <FilterItem onClick={() => setShowFilter(false)}>Recent</FilterItem>
                                    <FilterItem onClick={() => setShowFilter(false)}>Last 7 Days</FilterItem>
                                    <FilterItem onClick={() => setShowFilter(false)}>Last 30 Days</FilterItem>
                                </FilterDropDown>
                            )}
                        </FilterWrapper>
                    </Options>
                </ContentHeader>
                <RecentCardArea>
                    {recentDashboards.length === 0 ? (
                        <div style={{ width: '100%', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px', color: '#94a3b8', background: 'transparent' }}>
                            <p style={{ fontWeight: 600, color: '#94a3b8', margin: '0 0 8px', fontSize: '20px' }}>No dashboards currently 😊</p>
                            <p style={{ margin: 0, fontSize: 14, color: '#b0bdd0' }}>Click on <strong style={{ color: '#3457B2' }}>Create</strong> to get started!</p>
                        </div>
                    ) : (
                        recentDashboards.map(d => (
                            <div
                                key={d.id}
                                onClick={() => !opening && handleOpen(d)}
                                style={{
                                    width: '100%', background: '#fff', border: '1px solid #e2e8f0',
                                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s', minWidth: 0, position: 'relative'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(52,87,178,0.12)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                            >
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
                                    <img src={d.thumbnail} alt={d.name} style={{ width: '100%', height: 220, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                                ) : (
                                    <div style={{ height: 220, background: 'linear-gradient(135deg, #3457B2, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    </div>
                                )}
                                <div style={{ padding: '14px 16px 16px' }}>
                                    <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 15, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                                    <p style={{ margin: '0 0 10px', fontSize: 12, color: '#94a3b8' }}>{formatDate(d.created_at)}</p>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <span style={{ background: '#eff6ff', color: '#3457B2', border: '1px solid #c7d2fe', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 500 }}>
                                            <TableRowsIcon sx={{ fontSize: 11 }} /> {d.row_count?.toLocaleString() || '?'} rows
                                        </span>
                                    </div>
                                    <p style={{ margin: '12px 0 0', fontSize: 12, color: opening === d.id ? '#3457B2' : '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <OpenInNewIcon sx={{ fontSize: 13 }} /> {opening === d.id ? 'Loading...' : 'Open Dashboard'}
                                    </p>
                                </div>
                            </div>
                        )))}
                </RecentCardArea>
                {recentDashboards.length >= 6 && (
                    <ViewMoreButtonArea>
                        <ViewMoreButton onClick={() => setActivePage('dashboards')}>
                            <ArrowDownwardIcon /> View More
                        </ViewMoreButton>
                    </ViewMoreButtonArea>
                )}

            </ContentArea>
        </MainContent>
    )
}

export default Home
