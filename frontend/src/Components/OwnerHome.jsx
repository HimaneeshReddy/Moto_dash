import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { getOrgOverview, getUser, listShowroomDashboards, getDatasetAnalysis } from "../services/api.js";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const slideIn = keyframes`from { transform: translateX(100%); } to { transform: translateX(0); }`;
const shimmerAnim = keyframes`from { background-position: 200% 0; } to { background-position: -200% 0; }`;

/* ── Page shell ── */
const Wrapper = styled.div`
  min-height: 100vh;
  background: #f0f2f7;
  animation: ${fadeIn} 0.3s ease;
`;

/* ── Hero banner ── */
const Hero = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #3457B2 55%, #4f6fd1 100%);
  padding: 36px 44px 80px;
  position: relative;
  &::before {
    content: '';
    position: absolute; inset: 0; overflow: hidden;
    background: url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='26' cy='26' r='2'/%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
`;
const HeroInner = styled.div`
  max-width: 1300px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: flex-start;
  position: relative; z-index: 1;
`;
const HeroLeft = styled.div``;
const OrgBadge = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.88); font-size: 11px; font-weight: 700;
  padding: 4px 12px; border-radius: 20px; margin-bottom: 14px;
  text-transform: uppercase; letter-spacing: 0.8px;
`;
const HeroTitle = styled.h1`
  font-size: 30px; font-weight: 800; color: #fff; margin: 0 0 8px 0; line-height: 1.2;
`;
const HeroSub = styled.p`font-size: 14px; color: rgba(255,255,255,0.62); margin: 0;`;
const HeroRight = styled.div`display: flex; flex-direction: column; align-items: flex-end; gap: 12px;`;
const DateBadge = styled.div`
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.78); font-size: 12px; padding: 5px 12px; border-radius: 8px;
`;
const RefreshBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 9px; font-size: 13px; font-weight: 600;
  cursor: pointer; background: rgba(255,255,255,0.15); color: #fff;
  border: 1px solid rgba(255,255,255,0.28); transition: all 0.2s; backdrop-filter: blur(4px);
  &:hover { background: rgba(255,255,255,0.24); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── Content area (overlaps hero) ── */
const Content = styled.div`
  max-width: 1300px; margin: 50px auto 0; padding: 0 44px 48px; position: relative; z-index: 2;
`;

/* ── KPI row ── */
const KpiRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 36px;
`;
const KpiCard = styled.div`
  background: white; border-radius: 16px; padding: 22px 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  display: flex; align-items: center; gap: 16px;
  border-top: 4px solid ${p => p.color || "#3457B2"};
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
`;
const KpiIconBox = styled.div`
  width: 50px; height: 50px; border-radius: 13px;
  background: ${p => p.bg || "#eff6ff"}; color: ${p => p.color || "#3457B2"};
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;
const KpiText = styled.div``;
const KpiValue = styled.div`font-size: 30px; font-weight: 800; color: #1e293b; line-height: 1;`;
const KpiLabel = styled.div`font-size: 12px; color: #64748b; margin-top: 5px; font-weight: 500;`;

/* ── Section heading ── */
const SectionRow = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;`;
const SectionHeading = styled.h2`
  font-size: 13px; font-weight: 700; color: #475569;
  text-transform: uppercase; letter-spacing: 1px; margin: 0;
  display: flex; align-items: center; gap: 8px;
  &::before { content: ''; display: block; width: 4px; height: 16px; background: #3457B2; border-radius: 2px; }
`;
const SectionCount = styled.span`
  font-size: 12px; color: #94a3b8; background: #f1f5f9; padding: 3px 10px; border-radius: 20px;
`;

/* ── Showroom grid ── */
const SR_COLORS = ["#3457B2", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
const OvGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
`;
const OvCardClickable = styled.div`
  background: white; border-radius: 16px; overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06); cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column;
  &:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.11); }
`;
const CardAccent = styled.div`height: 5px; background: ${p => p.color || "#3457B2"};`;
const CardBody = styled.div`padding: 20px 22px; flex: 1; display: flex; flex-direction: column; gap: 14px;`;
const CardTopRow = styled.div`display: flex; justify-content: space-between; align-items: flex-start;`;
const OvCardTitle = styled.h3`font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 6px 0;`;
const LocationPill = styled.div`
  display: inline-flex; align-items: center; gap: 4px; font-size: 12px;
  color: #64748b; background: #f8fafc; border: 1px solid #edf0f4; padding: 3px 10px; border-radius: 20px;
`;
const ActiveDot = styled.div`
  width: 9px; height: 9px; border-radius: 50%; margin-top: 4px; flex-shrink: 0;
  background: ${p => p.active ? "#10b981" : "#e2e8f0"};
  box-shadow: ${p => p.active ? "0 0 0 3px rgba(16,185,129,0.18)" : "none"};
`;
const OvStats = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: #f1f5f9; border-radius: 10px; overflow: hidden;
`;
const OvStat = styled.div`background: white; padding: 12px; text-align: center;`;
const OvStatVal = styled.div`font-size: 20px; font-weight: 700; color: ${p => p.color || "#1e293b"};`;
const OvStatLabel = styled.div`font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;`;
const ActivityBar = styled.div`height: 4px; background: #f1f5f9; border-radius: 4px; overflow: hidden;`;
const ActivityFill = styled.div`
  height: 100%; border-radius: 4px; background: ${p => p.color || "#3457B2"};
  width: ${p => p.pct || "0%"}; transition: width 0.7s ease;
`;
const CardFooter = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 22px; background: #fafbfd; border-top: 1px solid #f1f5f9;
`;
const LastUpload = styled.div`font-size: 11px; color: #94a3b8;`;
const ViewHint = styled.div`
  font-size: 12px; color: #3457B2; font-weight: 600; display: flex; align-items: center; gap: 4px;
`;

/* ── Drawer ── */
const DrawerOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.38); z-index: 200;
  display: flex; justify-content: flex-end; backdrop-filter: blur(2px);
`;
const DrawerPanel = styled.div`
  width: 440px; max-width: 95vw; background: #f4f6f8; height: 100%;
  display: flex; flex-direction: column;
  animation: ${slideIn} 0.25s ease;
  box-shadow: -8px 0 40px rgba(0,0,0,0.15);
`;
const DrawerHead = styled.div`
  padding: 22px 22px 0;
  background: white; border-bottom: 1px solid #e2e8f0;
`;
const DrawerTitleRow = styled.div`display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;`;
const DrawerTitle = styled.h2`font-size: 18px; font-weight: 700; color: #1e293b; margin: 0;`;
const DrawerSub = styled.p`font-size: 13px; color: #94a3b8; margin: 5px 0 0 0;`;
const DrawerAccent = styled.div`height: 3px; background: ${p => p.color || "#3457B2"}; margin: 0 -22px;`;
const DrawerClose = styled.button`
  background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px;
  cursor: pointer; color: #64748b; display: flex; align-items: center;
  &:hover { background: #f1f5f9; }
`;
const DrawerBody = styled.div`flex: 1; overflow-y: auto; padding: 16px;`;
const DashCard = styled.div`
  background: white; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 16px 18px; margin-bottom: 12px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: box-shadow 0.15s;
  &:hover { box-shadow: 0 4px 12px rgba(52,87,178,0.09); border-color: #bfdbfe; }
`;
const DashCardInfo = styled.div`flex: 1; min-width: 0;`;
const DashCardName = styled.div`font-size: 14px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
const DashCardMeta = styled.div`font-size: 12px; color: #94a3b8; margin-top: 3px;`;
const OpenBtn = styled.button`
  display: flex; align-items: center; gap: 5px; padding: 8px 14px;
  background: #3457B2; color: white; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
  transition: background 0.2s;
  &:hover { background: #2a458c; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const EmptyDrawer = styled.div`text-align: center; padding: 48px 24px; color: #94a3b8; font-size: 14px;`;

const Skeleton = styled.div`
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: ${shimmerAnim} 1.4s infinite;
  border-radius: 14px;
  height: ${p => p.$h || "100px"};
`;

/* ── Financial metrics on showroom cards ── */
const FinanceRow = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: #f1f5f9; border-radius: 10px; overflow: hidden;
`;
const FMetric = styled.div`background: white; padding: 10px 8px; text-align: center;`;
const FMetricVal = styled.div`font-size: 13px; font-weight: 700; color: ${p => p.color || "#1e293b"}; white-space: nowrap;`;
const FMetricLabel = styled.div`font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px;`;

const fmtCurrency = (val) => {
    const n = Number(val) || 0;
    if (n === 0) return "—";
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
    if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
    return `₹${n.toFixed(0)}`;
};

export default function OwnerHome({ onOpenDashboard, setActivePage }) {
    const user = getUser();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ── Showroom drawer ── */
    const [drawer, setDrawer] = useState(null);   // selected showroom { id, name, location }
    const [dashboards, setDashboards] = useState([]);
    const [dashLoading, setDashLoading] = useState(false);
    const [openingId, setOpeningId] = useState(null);

    const openDrawer = useCallback(async (sr) => {
        setDrawer(sr);
        setDashboards([]);
        setDashLoading(true);
        try {
            const r = await listShowroomDashboards(sr.id);
            setDashboards(r.dashboards || []);
        } catch { /* ignore */ }
        finally { setDashLoading(false); }
    }, []);

    const handleOpen = async (d) => {
        if (!onOpenDashboard || !setActivePage) return;
        setOpeningId(d.id);
        try {
            const r = await getDatasetAnalysis(d.id);
            setDrawer(null);
            onOpenDashboard(r.analysis, d.name, d.id);
            setActivePage("dashboard");
        } catch { /* ignore */ }
        finally { setOpeningId(null); }
    };

    const load = useCallback(async () => {
        setLoading(true);
        try { const r = await getOrgOverview(); setData(r); }
        catch { /* silently fail – show retry */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <Wrapper>
        {/* ── Hero Banner ── */}
        <Hero>
            <HeroInner>
                <HeroLeft>
                    {data?.org?.org_name && (
                        <OrgBadge>
                            <ApartmentIcon style={{ fontSize: 12 }} />
                            {data.org.org_name}
                        </OrgBadge>
                    )}
                    <HeroTitle>Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! 👋</HeroTitle>
                    <HeroSub>Here's what's happening across your organization today.</HeroSub>
                </HeroLeft>
                <HeroRight>
                    <DateBadge>
                        {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                    </DateBadge>
                    <RefreshBtn onClick={load} disabled={loading}>
                        <RefreshIcon fontSize="small" style={{ transition: "transform 0.5s", transform: loading ? "rotate(360deg)" : "none" }} />
                        Refresh
                    </RefreshBtn>
                </HeroRight>
            </HeroInner>
        </Hero>

        <Content>
            {loading ? (
                <>
                    <KpiRow>
                        {[1,2,3,4].map(i => <Skeleton key={i} $h="100px" />)}
                    </KpiRow>
                    <OvGrid>
                        {[1,2,3].map(i => <Skeleton key={i} $h="240px" />)}
                    </OvGrid>
                </>
            ) : !data || !data.org ? (
                <div style={{ textAlign: "center", marginTop: 60 }}>
                    <p style={{ color: "#94a3b8", marginBottom: 16 }}>Could not load overview.</p>
                    <button onClick={load} style={{ padding: "10px 22px", background: "#3457B2", color: "white", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 600 }}>Retry</button>
                </div>
            ) : (
                <>
                    {/* ── KPI Cards ── */}
                    <KpiRow>
                        <KpiCard color="#3457B2">
                            <KpiIconBox bg="#eff6ff" color="#3457B2"><ApartmentIcon /></KpiIconBox>
                            <KpiText>
                                <KpiValue>{data.org.total_showrooms}</KpiValue>
                                <KpiLabel>Showrooms</KpiLabel>
                            </KpiText>
                        </KpiCard>
                        <KpiCard color="#10b981">
                            <KpiIconBox bg="#ecfdf5" color="#10b981"><GroupsIcon /></KpiIconBox>
                            <KpiText>
                                <KpiValue>{data.org.total_members}</KpiValue>
                                <KpiLabel>Active Members</KpiLabel>
                            </KpiText>
                        </KpiCard>
                        <KpiCard color="#8b5cf6">
                            <KpiIconBox bg="#f5f3ff" color="#8b5cf6"><FolderOpenIcon /></KpiIconBox>
                            <KpiText>
                                <KpiValue>{data.org.total_datasets}</KpiValue>
                                <KpiLabel>Datasets Uploaded</KpiLabel>
                            </KpiText>
                        </KpiCard>
                        <KpiCard color="#f59e0b">
                            <KpiIconBox bg="#fffbeb" color="#f59e0b"><TrendingUpIcon /></KpiIconBox>
                            <KpiText>
                                <KpiValue>{Number(data.org.total_rows).toLocaleString()}</KpiValue>
                                <KpiLabel>Total Rows Analyzed</KpiLabel>
                            </KpiText>
                        </KpiCard>
                    </KpiRow>

                    {/* ── Showroom Breakdown ── */}
                    <SectionRow>
                        <SectionHeading>Showroom Breakdown</SectionHeading>
                        {data.showrooms.length > 0 && (
                            <SectionCount>{data.showrooms.length} showroom{data.showrooms.length !== 1 ? "s" : ""}</SectionCount>
                        )}
                    </SectionRow>

                    {data.showrooms.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>
                            No showrooms yet — create your first one in <strong>Org Console › Showrooms</strong>.
                        </p>
                    ) : (() => {
                        const maxRows = Math.max(...data.showrooms.map(s => Number(s.total_rows)), 1);
                        return (
                            <OvGrid>
                                {data.showrooms.map((sr, idx) => {
                                    const color = SR_COLORS[idx % SR_COLORS.length];
                                    const pct = Math.round((Number(sr.total_rows) / maxRows) * 100) + "%";
                                    const hasData = Number(sr.total_rows) > 0;
                                    return (
                                        <OvCardClickable key={sr.id} onClick={() => openDrawer(sr)}>
                                            <CardAccent color={color} />
                                            <CardBody>
                                                <CardTopRow>
                                                    <div>
                                                        <OvCardTitle>{sr.name}</OvCardTitle>
                                                        <LocationPill>
                                                            <LocationOnIcon style={{ fontSize: 12, color: "#94a3b8" }} />
                                                            {sr.location || "No location set"}
                                                        </LocationPill>
                                                    </div>
                                                    <ActiveDot active={hasData} title={hasData ? "Has data" : "No data yet"} />
                                                </CardTopRow>

                                                <OvStats>
                                                    <OvStat>
                                                        <OvStatVal color={color}>{sr.member_count}</OvStatVal>
                                                        <OvStatLabel>Members</OvStatLabel>
                                                    </OvStat>
                                                    <OvStat>
                                                        <OvStatVal color={color}>{sr.dataset_count}</OvStatVal>
                                                        <OvStatLabel>Datasets</OvStatLabel>
                                                    </OvStat>
                                                    <OvStat>
                                                        <OvStatVal style={{ fontSize: 16 }} color={color}>
                                                            {Number(sr.total_rows).toLocaleString()}
                                                        </OvStatVal>
                                                        <OvStatLabel>Total Rows</OvStatLabel>
                                                    </OvStat>
                                                </OvStats>

                                                {(Number(sr.total_revenue) > 0 || Number(sr.total_expenditure) > 0 || Number(sr.total_salary_expense) > 0) && (
                                                    <FinanceRow>
                                                        <FMetric>
                                                            <FMetricVal color="#10b981">{fmtCurrency(sr.total_revenue)}</FMetricVal>
                                                            <FMetricLabel>Revenue</FMetricLabel>
                                                        </FMetric>
                                                        <FMetric>
                                                            <FMetricVal color="#ef4444">{fmtCurrency(sr.total_expenditure)}</FMetricVal>
                                                            <FMetricLabel>Expenditure</FMetricLabel>
                                                        </FMetric>
                                                        <FMetric>
                                                            <FMetricVal color="#f59e0b">{fmtCurrency(sr.total_salary_expense)}</FMetricVal>
                                                            <FMetricLabel>Salary</FMetricLabel>
                                                        </FMetric>
                                                    </FinanceRow>
                                                )}

                                                <div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
                                                        <span>Data Volume</span>
                                                        <span>{pct}</span>
                                                    </div>
                                                    <ActivityBar>
                                                        <ActivityFill color={color} pct={pct} />
                                                    </ActivityBar>
                                                </div>
                                            </CardBody>

                                            <CardFooter>
                                                <LastUpload>
                                                    {sr.last_upload
                                                        ? `Last upload: ${new Date(sr.last_upload).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                                                        : "No datasets uploaded yet"}
                                                </LastUpload>
                                                <ViewHint>
                                                    <DashboardIcon style={{ fontSize: 13 }} /> View
                                                </ViewHint>
                                            </CardFooter>
                                        </OvCardClickable>
                                    );
                                })}
                            </OvGrid>
                        );
                    })()}
                </>
            )}
        </Content>

        {/* ── Showroom Dashboards Drawer ── */}
        {drawer && (
            <DrawerOverlay onClick={() => setDrawer(null)}>
                <DrawerPanel onClick={e => e.stopPropagation()}>
                    <DrawerHead>
                        <DrawerTitleRow>
                            <div>
                                <DrawerTitle>
                                    <DashboardIcon style={{ verticalAlign: "middle", marginRight: 8,
                                        color: data?.showrooms ? SR_COLORS[data.showrooms.findIndex(s => s.id === drawer.id) % SR_COLORS.length] : "#3457B2",
                                        fontSize: 20 }} />
                                    {drawer.name}
                                </DrawerTitle>
                                <DrawerSub>
                                    <LocationOnIcon style={{ fontSize: 12, verticalAlign: "middle", marginRight: 3 }} />
                                    {drawer.location || "No location set"}
                                </DrawerSub>
                            </div>
                            <DrawerClose onClick={() => setDrawer(null)}>
                                <CloseIcon fontSize="small" />
                            </DrawerClose>
                        </DrawerTitleRow>
                        <DrawerAccent color={data?.showrooms ? SR_COLORS[data.showrooms.findIndex(s => s.id === drawer.id) % SR_COLORS.length] : "#3457B2"} />
                    </DrawerHead>

                    <DrawerBody>
                        {dashLoading ? (
                            [1,2,3].map(i => <Skeleton key={i} $h="72px" style={{ marginBottom: 12 }} />)
                        ) : dashboards.length === 0 ? (
                            <EmptyDrawer>
                                <DashboardIcon style={{ fontSize: 44, color: "#e2e8f0", marginBottom: 12 }} />
                                <div>No analyzed dashboards for this showroom.</div>
                                <div style={{ fontSize: 12, marginTop: 8 }}>Upload a dataset to generate insights.</div>
                            </EmptyDrawer>
                        ) : (
                            dashboards.map(d => (
                                <DashCard key={d.id}>
                                    <DashCardInfo>
                                        <DashCardName title={d.name}>{d.name}</DashCardName>
                                        <DashCardMeta>
                                            {d.row_count?.toLocaleString()} rows · {d.column_count} cols
                                            &nbsp;·&nbsp;
                                            {new Date(d.updated_at || d.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </DashCardMeta>
                                    </DashCardInfo>
                                    <OpenBtn onClick={() => handleOpen(d)} disabled={openingId === d.id}>
                                        {openingId === d.id ? "Opening..." : <><OpenInNewIcon style={{ fontSize: 15 }} /> Open</>}
                                    </OpenBtn>
                                </DashCard>
                            ))
                        )}
                    </DrawerBody>

                    {!dashLoading && dashboards.length > 0 && (
                        <div style={{ padding: "12px 22px", borderTop: "1px solid #e2e8f0", background: "white", fontSize: 12, color: "#94a3b8" }}>
                            {dashboards.length} dashboard{dashboards.length !== 1 ? "s" : ""} · click Open to view full insights
                        </div>
                    )}
                </DrawerPanel>
            </DrawerOverlay>
        )}
        </Wrapper>
    );
}
