import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import FilterListIcon from '@mui/icons-material/FilterList';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';

// Chart Dependencies
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, ScatterChart, Scatter, Cell, ComposedChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

// API
import { getDatasetRows, saveDatasetThumbnail, runInsightQuery, chatWithDataset, saveDashboardLayout, getDashboardLayout, editDashboardItem } from '../services/api.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Components
import DatasetManager from './DatasetManager.jsx';

const Container = styled.div`
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f4f6f8;
  min-height: 100vh;

  /* Custom grid handle styles since we removed example-styles.css */
  .react-resizable-handle {
    background-image: none !important;
  }
  .react-resizable-handle::after {
    content: "";
    position: absolute;
    right: 5px;
    bottom: 5px;
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(0,0,0,0.1);
    border-bottom: 2px solid rgba(0,0,0,0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  color: #1a1a24;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Pill = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
`;

const InsightsSection = styled.div`
  margin-bottom: 30px;
`;

const InsightsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 14px;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const InsightCardWrapper = styled.div`
  background: white;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 4px 12px rgba(52,87,178,0.08);
  }
`;

const InsightTypeMap = {
  'Insight': { bg: '#eff6ff', color: '#3457B2', border: '#bfdbfe' },
};

const TYPE_DEFAULT = { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };

const TypeBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: ${p => p.bg};
  color: ${p => p.color};
  border: 1px solid ${p => p.border};
`;

const SqlBlock = styled.pre`
  background: #1e293b;
  color: #7dd3fc;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MiniTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  th { background: #f8fafc; color: #64748b; padding: 6px 10px; text-align: left; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
  td { padding: 6px 10px; color: #334155; border-bottom: 1px solid #f1f5f9; }
  tr:last-child td { border-bottom: none; }
`;

// Insight card sub-component — purely presentational for pre-computed insights
const InsightCard = ({ insight }) => {
  if (typeof insight === 'string') {
    return (
      <InsightCardWrapper>
        <span style={{ color: '#64748b', fontSize: 14 }}>• {insight}</span>
      </InsightCardWrapper>
    );
  }

  const { type, description } = insight;
  const typeStyle = InsightTypeMap[type] || TYPE_DEFAULT;

  return (
    <InsightCardWrapper style={{ borderLeft: `3px solid ${typeStyle.color}` }}>
      <TypeBadge bg={typeStyle.bg} color={typeStyle.color} border={typeStyle.border}>{type || 'Insight'}</TypeBadge>
      <p style={{ margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.7 }}>
        {description}
      </p>
    </InsightCardWrapper>
  );
};


// ── Dataset Chatbot ─────────────────────────────────────────────────────────────
const ChatToggleBtn = styled.button`
  position: fixed; bottom: 32px; right: 32px; z-index: 1000;
  background: #3457B2; color: white; border: none; border-radius: 50px;
  padding: 13px 24px; font-size: 14px; font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 24px rgba(52,87,178,0.35);
  display: flex; align-items: center; gap: 8px;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(52,87,178,0.4); }
`;

const ChatPanel = styled.div`
  position: fixed; bottom: 96px; right: 32px; z-index: 1000;
  width: 430px; max-height: 580px; background: #fff;
  border: 1px solid #e2e8f0; border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.14);
  display: flex; flex-direction: column; overflow: hidden;
  animation: slideUp 0.2s ease;
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #3457B2, #5b7de8);
  color: white; padding: 16px 20px; font-weight: 700; font-size: 15px;
  display: flex; align-items: center; justify-content: space-between;
`;

const ChatBody = styled.div`
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 14px; background: #f8fafc;
`;

const ChatInputRow = styled.div`
  display: flex; gap: 8px; padding: 12px 14px;
  border-top: 1px solid #e2e8f0; background: #fff;
`;

const ChatInput = styled.input`
  flex: 1; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 10px 14px; font-size: 13px; outline: none;
  &:focus { border-color: #3457B2; }
`;

const ChatSendBtn = styled.button`
  background: #3457B2; color: white; border: none; border-radius: 10px;
  padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Bubble = styled.div`
  max-width: 90%;
  padding: 10px 14px;
  border-radius: ${p => p.isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${p => p.isUser ? '#3457B2' : '#ffffff'};
  color: ${p => p.isUser ? '#fff' : '#1e293b'};
  font-size: 13px; line-height: 1.65;
  align-self: ${p => p.isUser ? 'flex-end' : 'flex-start'};
  border: ${p => p.isUser ? 'none' : '1px solid #e2e8f0'};
  box-shadow: ${p => p.isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'};
`;

const ChatResultTable = styled.div`
  overflow-x: auto; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 8px;
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f1f5f9; color: #64748b; padding: 6px 10px; text-align: left; font-weight: 600; }
  td { padding: 6px 10px; color: #334155; border-top: 1px solid #f1f5f9; }
`;

const DatasetChatbot = ({ datasetId, inline = false }) => {
  const [open, setOpen] = React.useState(inline);
  const [messages, setMessages] = React.useState([{
    isUser: false,
    text: '👋 Hi! Ask me anything about this dataset.'
  }]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(m => [...m, { isUser: true, text: q }]);
    setLoading(true);
    try {
      const res = await chatWithDataset(datasetId, q);
      setMessages(m => [...m, { isUser: false, text: res.description, rows: res.rows, columns: res.columns }]);
    } catch (err) {
      setMessages(m => [...m, { isUser: false, text: `⚠️ ${err.message || 'Something went wrong.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (inline) {
    return (
      <CardItem style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'white' }}>
        <ChatHeader style={{ borderRadius: '16px 16px 0 0' }}>
          <span>🤖 Data Assistant</span>
        </ChatHeader>
        <ChatBody ref={bodyRef} style={{ flex: 1 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isUser ? 'flex-end' : 'flex-start' }}>
              <Bubble isUser={msg.isUser}>{msg.text}</Bubble>
            </div>
          ))}
          {loading && <Bubble isUser={false}><span style={{ opacity: 0.6 }}>Thinking…</span></Bubble>}
        </ChatBody>
        <ChatInputRow>
          <ChatInput
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask a question..."
            disabled={loading}
          />
          <ChatSendBtn onClick={send} disabled={loading || !input.trim()}>Send</ChatSendBtn>
        </ChatInputRow>
      </CardItem>
    );
  }

  return (
    <>
      {open && (
        <ChatPanel>
          <ChatHeader>
            <span>🤖 Ask about this dataset</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </ChatHeader>
          <ChatBody ref={bodyRef}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isUser ? 'flex-end' : 'flex-start' }}>
                <Bubble isUser={msg.isUser}>{msg.text}</Bubble>
              </div>
            ))}
            {loading && <Bubble isUser={false}><span style={{ opacity: 0.6 }}>Thinking…</span></Bubble>}
          </ChatBody>
          <ChatInputRow>
            <ChatInput
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask a question about your data..."
              disabled={loading}
            />
            <ChatSendBtn onClick={send} disabled={loading || !input.trim()}>Send</ChatSendBtn>
          </ChatInputRow>
        </ChatPanel>
      )}
      <ChatToggleBtn onClick={() => setOpen(o => !o)}>
        {open ? '× Close Chat' : '🤖 Ask Data'}
      </ChatToggleBtn>
    </>
  );
};

const CardItem = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 420px;
  min-height: 420px;
  position: relative;

  /* Force recharts to respect container height */
  .recharts-responsive-container {
    width: 100% !important;
    height: 100% !important;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
`;

const PrimaryCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  grid-column: 1 / -1; /* spans full width */
  min-height: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const SecondaryCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  min-height: 350px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const ChartHeader = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ChartDesc = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 6px 0 0 0;
  max-width: 80%;
  line-height: 1.4;
`;

const ChartPlaceholder = styled.div`
  flex: 1;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #94a3b8;
  gap: 12px;
`;

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  width: 100%;
`;

const Section = styled.div`
  width: 100%;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const FlexCol = styled.div`
  flex: ${props => props.flex || 1};
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
  margin-right: 15px;
`;

const ToggleButton = styled.button`
  padding: 6px 12px;
  border-radius: 7px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.active ? '#fff' : 'transparent'};
  color: ${props => props.active ? '#3457B2' : '#64748b'};
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'};
  
  &:hover {
    color: ${props => props.active ? '#3457B2' : '#1e293b'};
  }
`;

const getIconForType = (type) => {
  switch (type.toLowerCase()) {
    case 'bar': return <BarChartIcon style={{ color: '#3457B2' }} />;
    case 'line': return <ShowChartIcon style={{ color: '#3457B2' }} />;
    case 'pie': return <PieChartIcon style={{ color: '#3457B2' }} />;
    default: return <InsertChartOutlinedIcon style={{ color: '#3457B2' }} />;
  }
};


// --- Recharts Dynamic Renderer ---
const COLORS = ['#3457B2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

// Format large numbers as 1.2M, 450K, etc. for Y-axis ticks
const formatYAxis = (value) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value;
};

// Detect if a sample value looks like a date string
const looksLikeDate = (val) => {
  if (!val || typeof val !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}/.test(val) || !isNaN(Date.parse(val));
};

// Helper to aggregate raw rows so charts aren't overwhelmed with 100+ ungrouped data points
const aggregateData = (rawData, xCol, yCols, chartType) => {
  console.log(`[aggregateData] Starting with xCol: "${xCol}", yCols:`, yCols);
  if (!xCol || !rawData || rawData.length === 0) {
    console.warn("[aggregateData] Missing rawData or xCol");
    return rawData ? rawData.slice(0, 15) : [];
  }

  const grouped = {};

  rawData.forEach(row => {
    let xVal = row[xCol];
    if (xVal === undefined || xVal === null || xVal === "") return;
    xVal = String(xVal);

    if (!grouped[xVal]) {
      grouped[xVal] = { [xCol]: xVal, _count: 0 };
      yCols.forEach(y => { if (y) grouped[xVal][y] = 0; });
    }

    grouped[xVal]._count += 1;
    yCols.forEach(y => {
      // Avoid overwriting the X-axis key or the internal _count key
      if (y && y !== xCol && y !== '_count') {
        const val = row[y];
        const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        if (!isNaN(num)) {
          grouped[xVal][y] = (grouped[xVal][y] || 0) + num;
        }
      }
    });
  });

  let agg = Object.values(grouped);
  const sortKey = yCols.length > 0 && yCols[0] ? yCols[0] : '_count';

  // Detect if the X-axis looks like dates — sort chronologically for time-series charts
  const isDateAxis = agg.length > 0 && looksLikeDate(agg[0][xCol]);
  const isTimeSeries = chartType === 'line' || chartType === 'area';

  if (isDateAxis && isTimeSeries) {
    // Sort chronologically and keep all date points (up to 20)
    agg.sort((a, b) => new Date(a[xCol]) - new Date(b[xCol]));
    console.log(`[aggregateData] Finished (Time-series). Points: ${agg.length}`);
    return agg.slice(0, 20);
  } else {
    // Sort descending by metric for categorical charts (bar, pie)
    agg.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    console.log(`[aggregateData] Finished (Categorical). Points: ${agg.length}`);
    return agg.slice(0, 15);
  }
};

const DynamicChart = ({ config, data }) => {
  if (!data || data.length === 0) return <div style={{ padding: 20 }}>No data available for chart.</div>;

  const { chart_type, x_axis_column, y_axis_column } = config;

  // Clean up LLM outputs and handle case-sensitivity fuzzy matching
  const findKey = (target) => {
    if (!target || !data || !data[0]) return target;
    const lowerTarget = String(target).toLowerCase();
    const actualKey = Object.keys(data[0]).find(k => k.toLowerCase() === lowerTarget);
    return actualKey || target;
  };

  const xColRaw = Array.isArray(x_axis_column) ? x_axis_column[0] : x_axis_column;
  const xCol = findKey(xColRaw);

  const yKeysRaw = Array.isArray(y_axis_column) ? y_axis_column : [y_axis_column];
  const yKeys = yKeysRaw.map(findKey);

  // CRITICAL: Filter for columns that actually exist and are numeric
  const sample = data[0] || {};
  const validYKeys = yKeys.filter(y => y && (typeof sample[y] === 'number' || (typeof sample[y] === 'string' && !isNaN(parseFloat(sample[y])))));
  const activeYKeys = validYKeys.length > 0 ? validYKeys : ['_count'];

  // Aggregate data
  console.log(`[DynamicChart] Processing "${config.title}" | xRaw: "${x_axis_column}" -> xCol: "${xCol}" | yKeys:`, activeYKeys);
  const processedData = aggregateData(data, xCol, activeYKeys, chart_type?.toLowerCase());
  console.log(`[DynamicChart] Result points: ${processedData?.length}`, processedData?.[0]);

  if (!processedData || processedData.length === 0) {
    return (
      <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', background: '#f8fafc', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
        No valid points found for "{xCol}". <br/>This column may contain empty values or the metric "{activeYKeys[0]}" is not numeric.
      </div>
    );
  }

  switch (chart_type.toLowerCase()) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={xCol}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              angle={-35}
              textAnchor="end"
              interval={Math.max(0, Math.floor(processedData.length / 6) - 1)}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              width={50}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => [Number(value).toLocaleString(), '']}
            />
            <Legend wrapperStyle={{ paddingTop: 16 }} />
            {activeYKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case 'area':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
            <defs>
              {activeYKeys.map((key, i) => (
                <linearGradient key={key} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={xCol}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              angle={-35}
              textAnchor="end"
              interval={Math.max(0, Math.floor(processedData.length / 6) - 1)}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              width={50}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => [Number(value).toLocaleString(), '']}
            />
            <Legend wrapperStyle={{ paddingTop: 16 }} />
            {activeYKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={`url(#grad-${i})`} strokeWidth={2.5} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );

    case 'pie': {
      const total = processedData.reduce((sum, d) => sum + (Number(d[activeYKeys[0]]) || 0), 0);
      const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null; // hide label if slice < 5%
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        );
      };
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              formatter={(value) => [Number(value).toLocaleString(), activeYKeys[0]]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: 12, lineHeight: '22px', paddingLeft: 16 }}
            />
            <Pie
              data={processedData}
              dataKey={activeYKeys[0]}
              nameKey={xCol}
              cx="40%"
              cy="50%"
              innerRadius={55}
              outerRadius={110}
              labelLine={false}
              label={renderCustomLabel}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    case 'scatter':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="category" dataKey={xCol} name={xCol} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis dataKey={activeYKeys[0]} name={activeYKeys[0]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Scatter name={activeYKeys[0]} data={processedData} fill="#3457B2" />
          </ScatterChart>
        </ResponsiveContainer>
      );

    case 'radar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={processedData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey={xCol} tick={{ fill: '#64748b', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={formatYAxis} />
            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: 16 }} />
            {activeYKeys.map((key, i) => (
              <Radar key={key} name={key} dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.4} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      );

    case 'composed':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={xCol}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              width={50}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => [Number(value).toLocaleString(), '']}
            />
            <Legend wrapperStyle={{ paddingTop: 16 }} />
            {activeYKeys.map((key, i) => {
              if (i === 0) return <Bar key={key} dataKey={key} barSize={40} fill={COLORS[0]} radius={[4, 4, 0, 0]} />;
              return <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />;
            })}
          </ComposedChart>
        </ResponsiveContainer>
      );

    case 'radialbar': {
      // radialBar expects data with a `name` and the metric key and a `fill` color per entry
      const radialData = processedData.map((d, i) => ({
        name: d[xCol],
        [activeYKeys[0]]: d[activeYKeys[0]] || d._count,
        fill: COLORS[i % COLORS.length],
      }));
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%" innerRadius="20%" outerRadius="90%"
            data={radialData}
            startAngle={180} endAngle={0}
          >
            <RadialBar
              minAngle={15}
              dataKey={activeYKeys[0]}
              label={{ position: 'insideStart', fill: '#fff', fontSize: 11 }}
            />
            <Legend iconSize={10} formatter={(value, entry) => entry.payload.name} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => [Number(value).toLocaleString(), activeYKeys[0]]}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      );
    }

    case 'treemap': {
      // Treemap expects {name, size} objects
      const treemapData = processedData.map(d => ({
        name: String(d[xCol]),
        size: d[activeYKeys[0]] || d._count || 1,
      }));
      const CustomTreemapContent = ({ root, depth, x, y, width, height, index, name }) => (
        <g>
          <rect
            x={x} y={y} width={width} height={height}
            style={{ fill: COLORS[index % COLORS.length], stroke: '#fff', strokeWidth: 2 }}
          />
          {width > 40 && height > 20 && (
            <text x={x + width / 2} y={y + height / 2} textAnchor="middle"
              fill="#fff" fontSize={12} fontWeight={600}>
              {name.length > 12 ? name.slice(0, 10) + '…' : name}
            </text>
          )}
        </g>
      );
      return (
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="size"
            ratio={4 / 3}
            content={<CustomTreemapContent />}
          >
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value, name) => [Number(value).toLocaleString(), name]}
            />
          </Treemap>
        </ResponsiveContainer>
      );
    }

    case 'bar':
    default:
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={xCol}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              width={50}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => [Number(value).toLocaleString(), '']}
            />
            <Legend wrapperStyle={{ paddingTop: 16 }} />
            {activeYKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={60} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
  }
};

export default function DashboardView({ analysisData, datasetName, datasetId }) {
  const [chartData, setChartData] = useState([]);
  const [screenCapture, setScreenCapture] = useState('');
  const [showDataset, setShowDataset] = useState(false);
  const [viewMode, setViewMode] = useState('balanced'); // 'balanced', 'sandwich', or 'focus'
  const [chartOrder, setChartOrder] = useState([0, 1, 2]);
  const [insightOrder, setInsightOrder] = useState([0, 1, 2, 3, 4]);
  const [dragOver, setDragOver] = useState({ type: null, index: null });
  const dragItem = useRef(null);
  const [localAnalysis, setLocalAnalysis] = useState(analysisData);
  useEffect(() => { setLocalAnalysis(analysisData); }, [analysisData]);
  const [editState, setEditState] = useState({ open: false, type: null, rawIndex: null, label: '' });
  const [editInstruction, setEditInstruction] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Persist layout to localStorage whenever it changes
  useEffect(() => { if (datasetId) localStorage.setItem(`layout_view_${datasetId}`, viewMode); }, [viewMode, datasetId]);
  useEffect(() => { if (datasetId) localStorage.setItem(`layout_charts_${datasetId}`, JSON.stringify(chartOrder)); }, [chartOrder, datasetId]);
  useEffect(() => { if (datasetId) localStorage.setItem(`layout_insights_${datasetId}`, JSON.stringify(insightOrder)); }, [insightOrder, datasetId]);

  // Debounce-save the full layout to the backend 800ms after any change settles
  useEffect(() => {
    if (!datasetId) return;
    const t = setTimeout(() => {
      saveDashboardLayout(datasetId, { viewMode, chartOrder, insightOrder }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [viewMode, chartOrder, insightOrder, datasetId]);
  const dashboardRef = useRef(null);
  const capturedRef = useRef(false);

  useEffect(() => {
    if (!datasetId) return;
    // Fetch the raw rows from the backend dataset to populate the charts
    // The LLM only provided the configuration/schema, not the full 1M rows
    getDatasetRows(datasetId, { limit: 100 }) // Load top 100 rows for visualisation
      .then(res => {
        if (res.rows) {
          // Try to convert string numbers to actual numbers for recharts
          const parsedData = res.rows.map(row => {
            const parsed = { ...row };
            Object.keys(parsed).forEach(k => {
              if (!isNaN(parsed[k]) && parsed[k] !== "" && parsed[k] !== null) {
                parsed[k] = Number(parsed[k]);
              }
            });
            return parsed;
          });
          setChartData(parsedData);
        }
      })
      .catch(err => console.error("Failed to fetch chart data:", err));
  }, [datasetId]);

  // Auto-capture the dashboard as a thumbnail once after charts have rendered
  useEffect(() => {
    if (!datasetId || chartData.length === 0 || capturedRef.current) return;
    const timer = setTimeout(async () => {
      if (!dashboardRef.current || capturedRef.current) return;
      try {
        const canvas = await html2canvas(dashboardRef.current, {
          scale: 0.75,          // Increased scale from 0.4 for better readability
          useCORS: true,
          logging: false,
          allowTaint: true,
          windowWidth: 1200,    // Force a fixed render width so it doesn't try to capture massive 4K screens
          imageTimeout: 0,      // Skip trying to load external images that might hang
          backgroundColor: '#f8fafc',
          ignoreElements: (element) => {
            // Ignore high-overhead vector/SVG details that aren't visible in small thumbnails anyway
            return element.tagName === 'svg' && element.getAttribute('class')?.includes('recharts-tooltip-wrapper');
          }
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Increased JPEG quality to 80%
        capturedRef.current = true; // Mark as done so we don't re-capture
        await saveDatasetThumbnail(datasetId, dataUrl);
      } catch (err) {
        console.warn('Auto-thumbnail capture failed (non-critical):', err.message);
      }
    }, 2500); // Wait 2.5s for recharts animations to finish
    return () => clearTimeout(timer);
  }, [datasetId, chartData]);

  const handleManualCapture = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 1, // Full resolution for manual downloads
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
      });
      const dataUrl = canvas.toDataURL('image/png', 1.0);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${datasetName || 'Dashboard'}_Capture.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Manual capture failed:', err);
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${datasetName || 'Dashboard'}_Report.pdf`);
    } catch (err) {
      console.error('PDF Export failed:', err);
    }
  };

  const handleExportCSV = () => {
    if (!chartData || chartData.length === 0) return;
    const headers = Object.keys(chartData[0]);
    const csvContent = [
      headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(","),
      ...chartData.map(row =>
        headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${datasetName || 'Dataset'}_Export.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load saved layout for this dataset from the backend, or reset to defaults if none saved
  useEffect(() => {
    if (!datasetId) return;
    getDashboardLayout(datasetId)
      .then(({ layout }) => {
        if (layout) {
          setViewMode(layout.viewMode || 'balanced');
          setChartOrder(layout.chartOrder || [0, 1, 2]);
          setInsightOrder(layout.insightOrder || [0, 1, 2, 3, 4]);
        } else {
          setViewMode('balanced');
          setChartOrder([0, 1, 2]);
          setInsightOrder([0, 1, 2, 3, 4]);
        }
        setDragOver({ type: null, index: null });
      })
      .catch(() => {
        setViewMode('balanced');
        setChartOrder([0, 1, 2]);
        setInsightOrder([0, 1, 2, 3, 4]);
      });
  }, [datasetId]);

  if (!analysisData) return null;

  const { charts: rawCharts, filters, insights: rawInsights } = localAnalysis || analysisData;
  // Apply drag-reorder state so all layout branches automatically use the reordered arrays
  const charts = chartOrder.map(i => rawCharts[i]).filter(Boolean);
  const insights = insightOrder.map(i => rawInsights[i]).filter(Boolean);

  // Returns spread-able drag event props for a chart or insight card
  const dragHandlers = (type, index) => ({
    draggable: true,
    onDragStart: () => { dragItem.current = { type, index }; },
    onDragEnd: () => { setDragOver({ type: null, index: null }); dragItem.current = null; },
    onDragOver: (e) => { e.preventDefault(); setDragOver({ type, index }); },
    onDrop: (e) => {
      e.preventDefault();
      if (!dragItem.current || dragItem.current.type !== type) return;
      const from = dragItem.current.index;
      if (from === index) { setDragOver({ type: null, index: null }); dragItem.current = null; return; }
      if (type === 'chart') {
        const next = [...chartOrder]; [next[from], next[index]] = [next[index], next[from]]; setChartOrder(next);
      } else {
        const next = [...insightOrder]; [next[from], next[index]] = [next[index], next[from]]; setInsightOrder(next);
      }
      setDragOver({ type: null, index: null }); dragItem.current = null;
    },
  });
  // Returns a style object to highlight a card while being dragged over
  const dragOverStyle = (type, index) =>
    dragOver.type === type && dragOver.index === index
      ? { outline: '2px dashed #3457B2', outlineOffset: '-2px' }
      : {};

  const openEdit = (type, displayIndex) => {
    const rawIndex = type === 'chart' ? chartOrder[displayIndex] : insightOrder[displayIndex];
    const item = type === 'chart' ? rawCharts[rawIndex] : rawInsights[rawIndex];
    const label = item
      ? (type === 'chart' ? item.title : (typeof item === 'string' ? item : item.description))
      : '';
    setEditState({ open: true, type, rawIndex, label: label.slice(0, 65) });
    setEditInstruction('');
  };

  const handleEditSubmit = async () => {
    if (!editInstruction.trim() || editLoading) return;
    setEditLoading(true);
    try {
      const result = await editDashboardItem(datasetId, {
        type: editState.type,
        index: editState.rawIndex,
        instruction: editInstruction.trim(),
      });
      if (result.analysis) setLocalAnalysis(result.analysis);
      setEditState({ open: false, type: null, rawIndex: null, label: '' });
      setEditInstruction('');
    } catch (err) {
      console.error('AI edit failed:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const editBtn = (type, displayIndex) => (
    <button
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px', color: '#b0bec5', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'color 0.15s' }}
      title={`Edit this ${type} with AI`}
      onClick={(e) => { e.stopPropagation(); openEdit(type, displayIndex); }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#3457B2'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#b0bec5'; }}
    >
      <EditIcon style={{ fontSize: '14px' }} />
    </button>
  );

  return (
    <>
      <Container ref={dashboardRef} style={{ paddingBottom: '100px' }}>
        <Header style={{ marginBottom: '40px' }}>
          <Title>
            <AutoAwesomeIcon style={{ color: '#3457B2', fontSize: '32px' }} />
            {datasetName || "AI Generated Dashboard"}
          </Title>
          <ActionsContainer>
            {!showDataset && (
              <ViewToggle>
                <ToggleButton active={viewMode === 'balanced'} onClick={() => setViewMode('balanced')}>
                  <DashboardCustomizeIcon fontSize="inherit" style={{ marginRight: '6px' }} /> Balanced
                </ToggleButton>
                <ToggleButton active={viewMode === 'sandwich'} onClick={() => setViewMode('sandwich')}>
                  <LayersIcon fontSize="inherit" style={{ marginRight: '6px' }} /> Sandwich
                </ToggleButton>
                <ToggleButton active={viewMode === 'focus'} onClick={() => setViewMode('focus')}>
                  <ViewQuiltIcon fontSize="inherit" style={{ marginRight: '6px' }} /> Focus
                </ToggleButton>
              </ViewToggle>
            )}

            <ActionButton onClick={() => setShowDataset(!showDataset)}>
              {showDataset ? (
                <><DashboardCustomizeIcon fontSize="small" style={{ color: '#3457B2' }} /> View Dashboard</>
              ) : (
                <><TableChartIcon fontSize="small" style={{ color: '#3457B2' }} /> View Dataset</>
              )}
            </ActionButton>

            {!showDataset && (
              <>
                <ActionButton onClick={handleExportCSV}>
                  <DescriptionIcon fontSize="small" style={{ color: '#3457B2' }} /> Export CSV
                </ActionButton>
                <ActionButton onClick={handleExportPDF}>
                  <PictureAsPdfIcon fontSize="small" style={{ color: '#3457B2' }} /> Export PDF
                </ActionButton>
                <ActionButton onClick={handleManualCapture}>
                  <CameraAltIcon fontSize="small" style={{ color: '#3457B2' }} /> Take Screenshot
                </ActionButton>
              </>
            )}
          </ActionsContainer>
        </Header>

        {showDataset ? (
          <div style={{ marginTop: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <DatasetManager fixedDatasetId={datasetId} hideHeader={true} />
          </div>
        ) : (
          <DashboardContainer>
            {viewMode === 'balanced' ? (
              <>
                {/* Section 1: Full-width focus chart */}
                {charts[0] && (
                  <Section>
                    <CardItem {...dragHandlers('chart', 0)} style={{ minHeight: '400px', ...dragOverStyle('chart', 0) }}>
                      <ChartHeader style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                        <div>
                          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>{charts[0].title}</h3>
                          <ChartDesc>{charts[0].description}</ChartDesc>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {editBtn('chart', 0)}
                          <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '20px' }} />
                          {getIconForType(charts[0].chart_type)}
                        </div>
                      </ChartHeader>
                      <ChartWrapper>
                        <DynamicChart config={charts[0]} data={chartData} />
                      </ChartWrapper>
                    </CardItem>
                  </Section>
                )}

                {/* Section 2: 1.5 Chart / 0.5 Insights */}
                {(charts[1] || insights.length > 0) && (
                  <Section>
                    <FlexRow>
                      <FlexCol flex={1.5}>
                        {charts[1] && (
                          <CardItem {...dragHandlers('chart', 1)} style={{ minHeight: '400px', ...dragOverStyle('chart', 1) }}>
                            <ChartHeader style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                              <div>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{charts[1].title}</h3>
                                <ChartDesc>{charts[1].description}</ChartDesc>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {editBtn('chart', 1)}
                                <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '20px' }} />
                                {getIconForType(charts[1].chart_type)}
                              </div>
                            </ChartHeader>
                            <ChartWrapper>
                              <DynamicChart config={charts[1]} data={chartData} />
                            </ChartWrapper>
                          </CardItem>
                        )}
                      </FlexCol>
                      <FlexCol flex={0.5}>
                        {insights.slice(0, 2).map((insight, i) => (
                          <CardItem key={i} {...dragHandlers('insight', i)} style={{ padding: '24px', minHeight: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', ...dragOverStyle('insight', i) }}>
                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                               {editBtn('insight', i)}
                               <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '16px' }} />
                               <AutoAwesomeIcon fontSize="small" style={{ color: '#3457B2', opacity: 0.6 }} />
                               <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Insight</span>
                            </div>
                            <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: 1.6, textAlign: 'center' }}>
                              {typeof insight === 'string' ? insight : insight.description}
                            </p>
                          </CardItem>
                        ))}
                      </FlexCol>
                    </FlexRow>
                  </Section>
                )}

                {/* Section 3: Mirrored 0.5 Insights / 1.5 Chart */}
                {(charts[2] || insights.length > 2) && (
                  <Section>
                    <FlexRow>
                      <FlexCol flex={0.5}>
                        {insights.slice(2, 5).map((insight, i) => (
                          <CardItem key={i} {...dragHandlers('insight', 2 + i)} style={{ padding: '20px', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', ...dragOverStyle('insight', 2 + i) }}>
                            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                               {editBtn('insight', 2 + i)}
                               <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '16px' }} />
                               <AutoAwesomeIcon fontSize="small" style={{ color: '#3457B2', opacity: 0.6 }} />
                               <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Insight</span>
                            </div>
                            <p style={{ margin: 0, color: '#475569', fontSize: '13px', lineHeight: 1.5, textAlign: 'center' }}>
                              {typeof insight === 'string' ? insight : insight.description}
                            </p>
                          </CardItem>
                        ))}
                      </FlexCol>
                      <FlexCol flex={1.5}>
                        {charts[2] && (
                          <CardItem {...dragHandlers('chart', 2)} style={{ minHeight: '450px', ...dragOverStyle('chart', 2) }}>
                            <ChartHeader style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                              <div>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{charts[2].title}</h3>
                                <ChartDesc>{charts[2].description}</ChartDesc>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {editBtn('chart', 2)}
                                <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '20px' }} />
                                {getIconForType(charts[2].chart_type)}
                              </div>
                            </ChartHeader>
                            <ChartWrapper style={{ height: '450px', minHeight: '450px' }}>
                              <DynamicChart config={charts[2]} data={chartData} />
                            </ChartWrapper>
                          </CardItem>
                        )}
                      </FlexCol>
                    </FlexRow>
                  </Section>
                )}
              </>
            ) : viewMode === 'focus' ? (
              <>
                {/* FOCUS LAYOUT — Section 1: Left (2 stacked charts) / Right (insight + chatbot + insight) */}
                <Section>
                  <FlexRow style={{ alignItems: 'stretch' }}>
                    {/* Left column: two stacked charts */}
                    <FlexCol flex={1} style={{ gap: '20px' }}>
                      {charts[0] && (
                        <CardItem {...dragHandlers('chart', 0)} style={{ flex: 1, minHeight: '320px', ...dragOverStyle('chart', 0) }}>
                          <ChartHeader style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                            <div>
                              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{charts[0].title}</h3>
                              <ChartDesc>{charts[0].description}</ChartDesc>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {editBtn('chart', 0)}
                              <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '20px' }} />
                              {getIconForType(charts[0].chart_type)}
                            </div>
                          </ChartHeader>
                          <ChartWrapper>
                            <DynamicChart config={charts[0]} data={chartData} />
                          </ChartWrapper>
                        </CardItem>
                      )}
                      {charts[1] && (
                        <CardItem {...dragHandlers('chart', 1)} style={{ flex: 1, minHeight: '320px', ...dragOverStyle('chart', 1) }}>
                          <ChartHeader style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                            <div>
                              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{charts[1].title}</h3>
                              <ChartDesc>{charts[1].description}</ChartDesc>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {editBtn('chart', 1)}
                              <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '20px' }} />
                              {getIconForType(charts[1].chart_type)}
                            </div>
                          </ChartHeader>
                          <ChartWrapper>
                            <DynamicChart config={charts[1]} data={chartData} />
                          </ChartWrapper>
                        </CardItem>
                      )}
                    </FlexCol>

                    {/* Right column: insight top / chatbot middle / insight bottom */}
                    <FlexCol flex={1} style={{ gap: '20px' }}>
                      {insights[0] && (
                        <CardItem {...dragHandlers('insight', 0)} style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', maxHeight: '110px', ...dragOverStyle('insight', 0) }}>
                          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {editBtn('insight', 0)}
                            <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '16px' }} />
                            <AutoAwesomeIcon fontSize="small" style={{ color: '#3457B2', opacity: 0.6 }} />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Insight</span>
                          </div>
                          <p style={{ margin: 0, color: '#475569', fontSize: '12px', lineHeight: 1.5 }}>
                            {typeof insights[0] === 'string' ? insights[0] : insights[0].description}
                          </p>
                        </CardItem>
                      )}
                      <div style={{ flex: 1, minHeight: '420px' }}>
                        <DatasetChatbot datasetId={datasetId} inline={true} />
                      </div>
                      {insights[1] && (
                        <CardItem {...dragHandlers('insight', 1)} style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', maxHeight: '110px', ...dragOverStyle('insight', 1) }}>
                          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {editBtn('insight', 1)}
                            <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '16px' }} />
                            <AutoAwesomeIcon fontSize="small" style={{ color: '#3457B2', opacity: 0.6 }} />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Insight</span>
                          </div>
                          <p style={{ margin: 0, color: '#475569', fontSize: '12px', lineHeight: 1.5 }}>
                            {typeof insights[1] === 'string' ? insights[1] : insights[1].description}
                          </p>
                        </CardItem>
                      )}
                    </FlexCol>
                  </FlexRow>
                </Section>

                {/* FOCUS LAYOUT — Section 2: 70% chart / 30% three stacked insights */}
                <Section>
                  <FlexRow style={{ alignItems: 'stretch' }}>
                    <FlexCol flex={0.7}>
                      {charts[2] && (
                        <CardItem {...dragHandlers('chart', 2)} style={{ height: '100%', minHeight: '420px', ...dragOverStyle('chart', 2) }}>
                          <ChartHeader style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                            <div>
                              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>{charts[2].title}</h3>
                              <ChartDesc>{charts[2].description}</ChartDesc>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {editBtn('chart', 2)}
                              <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '20px' }} />
                              {getIconForType(charts[2].chart_type)}
                            </div>
                          </ChartHeader>
                          <ChartWrapper style={{ height: '420px', minHeight: '420px' }}>
                            <DynamicChart config={charts[2]} data={chartData} />
                          </ChartWrapper>
                        </CardItem>
                      )}
                    </FlexCol>
                    <FlexCol flex={0.3} style={{ gap: '20px' }}>
                      {insights.slice(2, 5).map((insight, i) => (
                        <CardItem key={i} {...dragHandlers('insight', 2 + i)} style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', ...dragOverStyle('insight', 2 + i) }}>
                          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {editBtn('insight', 2 + i)}
                            <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '16px' }} />
                            <AutoAwesomeIcon fontSize="small" style={{ color: '#3457B2', opacity: 0.6 }} />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Insight</span>
                          </div>
                          <p style={{ margin: 0, color: '#475569', fontSize: '13px', lineHeight: 1.5 }}>
                            {typeof insight === 'string' ? insight : insight.description}
                          </p>
                        </CardItem>
                      ))}
                    </FlexCol>
                  </FlexRow>
                </Section>
              </>
            ) : (
              <>
                {/* Section 1: 2 Charts side by side (50/50) */}
                {(charts[0] || charts[1]) && (
                  <Section>
                    <FlexRow>
                      {charts[0] && (
                        <FlexCol flex={1}>
                          <CardItem {...dragHandlers('chart', 0)} style={{ height: '100%', minHeight: '400px', ...dragOverStyle('chart', 0) }}>
                            <ChartHeader style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                              <div>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{charts[0].title}</h3>
                                <ChartDesc>{charts[0].description}</ChartDesc>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {editBtn('chart', 0)}
                                <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '20px' }} />
                                {getIconForType(charts[0].chart_type)}
                              </div>
                            </ChartHeader>
                            <ChartWrapper>
                              <DynamicChart config={charts[0]} data={chartData} />
                            </ChartWrapper>
                          </CardItem>
                        </FlexCol>
                      )}
                      {charts[1] && (
                        <FlexCol flex={1}>
                          <CardItem {...dragHandlers('chart', 1)} style={{ height: '100%', minHeight: '400px', ...dragOverStyle('chart', 1) }}>
                            <ChartHeader style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                              <div>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{charts[1].title}</h3>
                                <ChartDesc>{charts[1].description}</ChartDesc>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {editBtn('chart', 1)}
                                <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '20px' }} />
                                {getIconForType(charts[1].chart_type)}
                              </div>
                            </ChartHeader>
                            <ChartWrapper>
                              <DynamicChart config={charts[1]} data={chartData} />
                            </ChartWrapper>
                          </CardItem>
                        </FlexCol>
                      )}
                    </FlexRow>
                  </Section>
                )}

                {/* Section 2: Insights Sandwich (3 top, 2 bottom) */}
                {insights.length > 0 && (
                  <Section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Sub-row 1: 3 insights */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      {insights.slice(0, 3).map((insight, i) => (
                        <CardItem key={i} {...dragHandlers('insight', i)} style={{ flex: '1 1 300px', padding: '24px', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', ...dragOverStyle('insight', i) }}>
                          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             {editBtn('insight', i)}
                             <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '16px' }} />
                             <AutoAwesomeIcon fontSize="small" style={{ color: '#3457B2', opacity: 0.6 }} />
                             <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Insight</span>
                          </div>
                          <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: 1.6, textAlign: 'center' }}>
                            {typeof insight === 'string' ? insight : insight.description}
                          </p>
                        </CardItem>
                      ))}
                    </div>
                    {/* Sub-row 2: 2 insights */}
                    {insights.length > 3 && (
                      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        {insights.slice(3, 5).map((insight, i) => (
                          <CardItem key={i} {...dragHandlers('insight', 3 + i)} style={{ flex: '1 1 450px', padding: '24px', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', ...dragOverStyle('insight', 3 + i) }}>
                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                               {editBtn('insight', 3 + i)}
                               <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '16px' }} />
                               <AutoAwesomeIcon fontSize="small" style={{ color: '#3457B2', opacity: 0.6 }} />
                               <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Insight</span>
                            </div>
                            <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: 1.6, textAlign: 'center' }}>
                              {typeof insight === 'string' ? insight : insight.description}
                            </p>
                          </CardItem>
                        ))}
                      </div>
                    )}
                  </Section>
                )}

                {/* Section 3: Full-width Hero Chart */}
                {charts[2] && (
                  <Section>
                    <CardItem {...dragHandlers('chart', 2)} style={{ minHeight: '450px', ...dragOverStyle('chart', 2) }}>
                      <ChartHeader style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                        <div>
                          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>{charts[2].title}</h3>
                          <ChartDesc>{charts[2].description}</ChartDesc>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {editBtn('chart', 2)}
                          <DragIndicatorIcon style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '20px' }} />
                          {getIconForType(charts[2].chart_type)}
                        </div>
                      </ChartHeader>
                      <ChartWrapper style={{ height: '450px', minHeight: '450px' }}>
                        <DynamicChart config={charts[2]} data={chartData} />
                      </ChartWrapper>
                    </CardItem>
                  </Section>
                )}
              </>
            )}
            
            {/* Any remaining insights (overflow) */}
            {((viewMode === 'balanced' && insights.length > 5) || (viewMode === 'sandwich' && insights.length > 5) || (viewMode === 'focus' && insights.length > 5)) && (
              <Section>
                <FlexRow style={{ flexWrap: 'wrap' }}>
                  {insights.slice(viewMode === 'balanced' ? 5 : 5).map((insight, i) => (
                    <CardItem key={i} style={{ flex: '0 0 calc(33.33% - 14px)', padding: '20px', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                       <p style={{ margin: 0, color: '#475569', fontSize: '13px', textAlign: 'center' }}>
                        {typeof insight === 'string' ? insight : insight.description}
                       </p>
                    </CardItem>
                  ))}
                </FlexRow>
              </Section>
            )}
          </DashboardContainer>
        )}
      </Container>
      <DatasetChatbot datasetId={datasetId} />

      {/* AI Edit Modal */}
      {editState.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px 32px', width: '500px', maxWidth: 'calc(100vw - 40px)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <AutoAwesomeIcon style={{ color: '#3457B2', fontSize: '22px' }} />
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Edit with AI</h3>
            </div>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '13px' }}>
              Editing <strong>{editState.type}</strong>:{' '}
              <em style={{ color: '#475569' }}>{editState.label}</em>
            </p>
            <textarea
              autoFocus
              value={editInstruction}
              onChange={(e) => setEditInstruction(e.target.value)}
              placeholder={editState.type === 'chart'
                ? 'e.g. "Change to a pie chart" or "Show revenue by region instead"'
                : 'e.g. "Show the average sale value" or "Change to reflect top 3 products"'}
              style={{ width: '100%', minHeight: '80px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1e293b' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleEditSubmit(); }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditState({ open: false, type: null, rawIndex: null, label: '' })}
                style={{ padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', color: '#64748b', fontSize: '14px', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editLoading || !editInstruction.trim()}
                style={{ padding: '8px 22px', border: 'none', borderRadius: '8px', background: (editLoading || !editInstruction.trim()) ? '#94a3b8' : '#3457B2', color: '#fff', cursor: editLoading ? 'wait' : 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
              >
                {editLoading ? 'Updating…' : <><AutoAwesomeIcon style={{ fontSize: '15px' }} /> Update</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
