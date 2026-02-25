import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ChevronLeft, ChevronRight, X, LogOut, LayoutDashboard, Clock, Users, CalendarDays, CreditCard } from 'lucide-react';

// ─── Ivory & Indigo Theme ─────────────────────────────────────────────────────
const T = {
  ivory:        '#f0ebe0',
  ivoryDeep:    '#e8e0ce',
  ivoryMid:     '#ede7d9',
  indigo:       '#1a1050',
  indigoDeep:   '#140c40',
  indigoSubtle: 'rgba(20, 10, 80, 0.06)',
  indigoMid:    'rgba(20, 10, 80, 0.10)',
  indigoText:   'rgba(20, 10, 80, 0.78)',
  indigoMuted:  'rgba(20, 10, 80, 0.50)',
  border:       'rgba(20, 10, 80, 0.15)',
  borderStrong: 'rgba(20, 10, 80, 0.28)',
  shadow:       'rgba(20, 10, 80, 0.14)',
  shadowSoft:   'rgba(20, 10, 80, 0.07)',
};

const font = { fontFamily: "'Open Sans', sans-serif" };

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  PENDING:     { bg: 'rgba(200,150,12,0.12)',  color: '#8a6200'  },
  CONFIRMED:   { bg: 'rgba(20,10,80,0.08)',    color: '#1a1050'  },
  IN_PROGRESS: { bg: 'rgba(80,20,120,0.10)',   color: '#4a1278'  },
  COMPLETED:   { bg: 'rgba(20,100,60,0.10)',   color: '#14643c'  },
  CANCELLED:   { bg: 'rgba(160,30,30,0.10)',   color: '#a01e1e'  },
  REJECTED:    { bg: 'rgba(80,80,80,0.08)',    color: '#444444'  },
  SUCCESS:     { bg: 'rgba(20,100,60,0.10)',   color: '#14643c'  },
  FAILED:      { bg: 'rgba(160,30,30,0.10)',   color: '#a01e1e'  },
  REFUNDED:    { bg: 'rgba(180,90,10,0.10)',   color: '#8a4500'  },
  CONSUMER:    { bg: 'rgba(200,150,12,0.12)',  color: '#8a6200'  },
  WORKER:      { bg: 'rgba(20,10,80,0.08)',    color: '#1a1050'  },
  ADMIN:       { bg: 'rgba(160,30,30,0.10)',   color: '#a01e1e'  },
};

const CHART_COLORS = ['#1a1050', '#c8960c', '#14643c', '#a01e1e', '#4a1278', '#8a4500'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = {
  currency: (v) => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—',
  date:     (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  datetime: (v) => v ? new Date(v).toLocaleString('en-IN',  { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—',
};

// ─── API ──────────────────────────────────────────────────────────────────────
const adminApi = {
  getStats:      ()                        => axios.get('/admin/stats').then(r => r.data),
  getUsers:      (page, size, role, search) => {
    const params = { page, size };
    if (role)                params.role   = role;
    if (search?.trim())      params.search = search.trim();
    return axios.get('/admin/users', { params }).then(r => r.data);
  },
  toggleEnabled: (id)                      => axios.post(`/admin/users/${id}/toggle-enabled`).then(r => r.data),
  sendNotif:     (id, title, message)      => axios.post(`/admin/users/${id}/notify`, { title, message }).then(r => r.data),
  getBookings:   (page, size, status, search) => {
    const params = { page, size };
    if (status)              params.status = status;
    if (search?.trim())      params.search = search.trim();
    return axios.get('/admin/bookings', { params }).then(r => r.data);
  },
  cancelBooking: (id, reason)              => axios.post(`/admin/bookings/${id}/cancel`, { reason }).then(r => r.data),
  getPayments:   (page, size, status, search) => {
    const params = { page, size };
    if (status)              params.status = status;
    if (search?.trim())      params.search = search.trim();
    return axios.get('/admin/payments', { params }).then(r => r.data);
  },
  getPending:    ()                        => axios.get('/admin/workers/pending').then(r => r.data),
  approveWorker: (id)                      => axios.post(`/admin/workers/${id}/approve`).then(r => r.data),
  rejectWorker:  (id)                      => axios.post(`/admin/workers/${id}/reject`).then(r => r.data),
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { background: ${T.ivoryMid}; }
    @keyframes ak-spin { to { transform: rotate(360deg) } }
    @keyframes ak-fade { from { opacity:0 } to { opacity:1 } }

    .ak-tab-btn:hover:not(.active)  { background: ${T.indigoSubtle} !important; }
    .ak-filter-btn:hover            { background: ${T.indigoMid} !important; }
    .ak-row:hover                   { background: ${T.indigoSubtle} !important; }
    .ak-input:focus                 { border-color: ${T.indigo} !important; box-shadow: 0 0 0 3px rgba(26,16,80,0.08) !important; }
    .ak-input::placeholder          { color: ${T.indigoMuted}; font-family: 'Open Sans', sans-serif; }
    .ak-textarea::placeholder       { color: ${T.indigoMuted}; font-family: 'Open Sans', sans-serif; }
    .ak-worker-card:hover           { border-color: ${T.borderStrong} !important; box-shadow: 0 4px 18px ${T.shadow} !important; }
    .ak-btn-primary:hover           { opacity: 0.88 !important; }
    .ak-btn-ghost:hover             { background: ${T.indigoMid} !important; }
    .ak-btn-danger:hover            { background: rgba(160,30,30,0.15) !important; }
    .ak-btn-success:hover           { opacity: 0.88 !important; }
    .ak-page-btn:hover:not(:disabled) { background: ${T.indigoMid} !important; }
    .ak-close-btn:hover             { background: ${T.indigoSubtle} !important; }

    ::-webkit-scrollbar       { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: ${T.ivoryDeep}; }
    ::-webkit-scrollbar-thumb { background: rgba(26,16,80,0.18); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(26,16,80,0.32); }
  `}</style>
);

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

const Badge = ({ value }) => {
  const s = STATUS[value] || { bg: 'rgba(80,80,80,0.08)', color: '#444' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      background: s.bg, color: s.color,
      fontSize: '0.66rem', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      borderRadius: '2px', ...font,
    }}>
      {(value || '').replace('_', ' ')}
    </span>
  );
};

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
    <div style={{
      width: '32px', height: '32px',
      border: `2px solid ${T.border}`,
      borderTop: `2px solid ${T.indigo}`,
      borderRadius: '50%',
      animation: 'ak-spin 0.75s linear infinite',
    }} />
  </div>
);

const AlertBanner = ({ type, message, onClose }) => {
  const colors = {
    success: { bg: 'rgba(20,100,60,0.08)',  border: '#14643c', color: '#14643c'  },
    error:   { bg: 'rgba(160,30,30,0.08)', border: '#a01e1e', color: '#a01e1e'  },
    info:    { bg: T.indigoSubtle,         border: T.indigo,  color: T.indigoDeep },
  };
  const c = colors[type] || colors.info;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', marginBottom: '12px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeft: `3px solid ${c.border}`,
        borderRadius: '2px',
        color: c.color,
        fontSize: '0.82rem', fontWeight: 600, ...font,
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, fontSize: '1rem', lineHeight: 1, marginLeft: '12px', opacity: 0.7 }}>×</button>
      )}
    </motion.div>
  );
};

const SectionLabel = ({ children }) => (
  <p style={{ fontSize: '0.70rem', fontWeight: 700, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px', ...font }}>
    {children}
  </p>
);

const inputStyle = {
  width: '100%', padding: '9px 13px',
  background: T.ivoryMid,
  border: `1px solid ${T.borderStrong}`,
  borderRadius: '2px', outline: 'none',
  color: T.indigoDeep, fontSize: '0.84rem', fontWeight: 400,
  transition: 'border-color 0.15s, box-shadow 0.15s',
  ...font,
};

const SearchBar = ({ value, onChange, placeholder = 'Search…' }) => (
  <div style={{ position: 'relative' }}>
    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.indigoMuted, fontSize: '0.78rem', pointerEvents: 'none' }}>⌕</span>
    <input
      type="text" value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="ak-input"
      style={{ ...inputStyle, paddingLeft: '30px' }}
    />
  </div>
);

const Pagination = ({ page, totalPages, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${T.border}` }}>
    <button onClick={() => onChange(page - 1)} disabled={page === 0} className="ak-page-btn"
      style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.ivoryDeep, border: `1px solid ${T.borderStrong}`, borderRadius: '2px', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, color: T.indigoText, transition: 'background 0.15s' }}>
      <ChevronLeft size={14} strokeWidth={2} />
    </button>
    <span style={{ padding: '5px 12px', background: T.indigoSubtle, border: `1px solid ${T.border}`, borderRadius: '2px', color: T.indigoDeep, fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.04em', ...font }}>
      {page + 1} / {Math.max(totalPages, 1)}
    </span>
    <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} className="ak-page-btn"
      style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.ivoryDeep, border: `1px solid ${T.borderStrong}`, borderRadius: '2px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1, color: T.indigoText, transition: 'background 0.15s' }}>
      <ChevronRight size={14} strokeWidth={2} />
    </button>
  </div>
);

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ title, children, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(20,10,80,0.45)', backdropFilter: 'blur(2px)' }}>
    <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
      style={{ background: T.ivory, border: `1px solid ${T.borderStrong}`, borderTop: `3px solid ${T.indigo}`, borderRadius: '3px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: `0 20px 60px rgba(20,10,80,0.22)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
        <h3 style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '0.92rem', margin: 0, ...font, letterSpacing: '-0.01em' }}>{title}</h3>
        <button onClick={onClose} className="ak-close-btn"
          style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '2px', cursor: 'pointer', color: T.indigoMuted, transition: 'background 0.15s' }}>
          <X size={14} strokeWidth={2} />
        </button>
      </div>
      <div style={{ padding: '18px' }}>{children}</div>
    </motion.div>
  </div>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent = T.indigo }) => (
  <div style={{
    background: T.ivory,
    border: `1px solid ${T.border}`,
    borderTop: `3px solid ${accent}`,
    borderRadius: '2px',
    padding: '14px 16px',
    boxShadow: `0 2px 8px ${T.shadowSoft}`,
  }}>
    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', ...font }}>{label}</p>
    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: T.indigoDeep, margin: 0, lineHeight: 1, ...font }}>{value}</p>
    {sub && <p style={{ fontSize: '0.72rem', color: T.indigoMuted, margin: '5px 0 0', ...font, fontWeight: 500 }}>{sub}</p>}
  </div>
);

// ─── TABLE PRIMITIVES ─────────────────────────────────────────────────────────
const TableWrap = ({ children }) => (
  <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: '2px' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', ...font, fontSize: '0.82rem' }}>
      {children}
    </table>
  </div>
);
const THead = ({ cols }) => (
  <thead>
    <tr style={{ background: T.ivoryDeep, borderBottom: `1px solid ${T.borderStrong}` }}>
      {cols.map(c => (
        <th key={c} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 800, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap', ...font }}>{c}</th>
      ))}
    </tr>
  </thead>
);
const TR = ({ children, odd }) => (
  <tr className="ak-row" style={{ borderBottom: `1px solid ${T.border}`, background: odd ? T.ivoryMid : T.ivory, transition: 'background 0.12s' }}>
    {children}
  </tr>
);
const TD = ({ children, mono, muted, bold, truncate, title: ttl }) => (
  <td title={ttl} style={{ padding: '10px 12px', color: muted ? T.indigoMuted : bold ? T.indigoDeep : T.indigoText, fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? '0.74rem' : '0.82rem', fontWeight: bold ? 700 : 400, maxWidth: truncate ? '140px' : undefined, overflow: truncate ? 'hidden' : undefined, textOverflow: truncate ? 'ellipsis' : undefined, whiteSpace: truncate ? 'nowrap' : undefined }}>
    {children}
  </td>
);

const ActionBtn = ({ onClick, children, variant = 'ghost' }) => {
  const styles = {
    ghost:   { bg: T.ivoryDeep,              border: `1px solid ${T.borderStrong}`, color: T.indigoText,  cls: 'ak-btn-ghost'   },
    primary: { bg: T.indigo,                  border: 'none',                        color: T.ivory,       cls: 'ak-btn-primary' },
    danger:  { bg: 'rgba(160,30,30,0.08)',    border: `1px solid rgba(160,30,30,0.25)`, color: '#a01e1e', cls: 'ak-btn-danger'  },
    success: { bg: 'rgba(20,100,60,0.10)',    border: `1px solid rgba(20,100,60,0.25)`, color: '#14643c', cls: 'ak-btn-success' },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} className={s.cls}
      style={{ padding: '4px 10px', background: s.bg, border: s.border, borderRadius: '2px', color: s.color, cursor: 'pointer', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'background 0.15s, opacity 0.15s', ...font, boxShadow: variant === 'primary' ? `0 2px 8px ${T.shadow}` : 'none' }}>
      {children}
    </button>
  );
};

const FilterBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} className={active ? '' : 'ak-filter-btn'}
    style={{ padding: '5px 12px', background: active ? T.indigo : T.ivoryDeep, border: active ? 'none' : `1px solid ${T.borderStrong}`, borderRadius: '2px', color: active ? T.ivory : T.indigoText, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'background 0.15s', ...font, boxShadow: active ? `0 2px 8px ${T.shadow}` : 'none' }}>
    {children || 'All'}
  </button>
);

// ─── CHART CARD ───────────────────────────────────────────────────────────────
const ChartCard = ({ title, children }) => (
  <div style={{ background: T.ivory, border: `1px solid ${T.border}`, borderTop: `2px solid ${T.indigo}`, borderRadius: '2px', padding: '18px', boxShadow: `0 2px 8px ${T.shadowSoft}` }}>
    <p style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px', ...font }}>{title}</p>
    {children}
  </div>
);

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab = ({ stats }) => {
  if (!stats) return <Spinner />;

  const bookingStatusData = [
    { name: 'Pending',     value: stats.pendingBookings   },
    { name: 'Confirmed',   value: stats.confirmedBookings },
    { name: 'In Progress', value: stats.inProgressBookings },
    { name: 'Completed',   value: stats.completedBookings },
    { name: 'Cancelled',   value: stats.cancelledBookings },
  ];
  const userRoleData = [
    { name: 'Consumers', value: stats.totalConsumers },
    { name: 'Workers',   value: stats.totalWorkers   },
  ];
  const paymentStatusData = [
    { name: 'Success', value: stats.successfulPayments },
    { name: 'Failed',  value: stats.failedPayments     },
  ];
  const monthlyRevenueData = [
    { month: 'Jan', revenue: stats.totalRevenue * 0.08 },
    { month: 'Feb', revenue: stats.totalRevenue * 0.09 },
    { month: 'Mar', revenue: stats.totalRevenue * 0.11 },
    { month: 'Apr', revenue: stats.totalRevenue * 0.10 },
    { month: 'May', revenue: stats.totalRevenue * 0.12 },
    { month: 'Jun', revenue: stats.revenueThisMonth    },
  ];

  const accentMap = ['#c8960c', '#a01e1e', '#1a1050', '#8a6200'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Primary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <StatCard label="Total Users"       value={stats.totalUsers}                accent={T.indigo}      />
        <StatCard label="Consumers"         value={stats.totalConsumers}            accent="#c8960c"       />
        <StatCard label="Workers"           value={stats.totalWorkers}              accent="#4a1278"       />
        <StatCard label="Pending Approval"  value={stats.pendingWorkerApprovals}    accent="#a01e1e"       />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ChartCard title="Booking Status Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={bookingStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}>
                {bookingStatusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: T.ivory, border: `1px solid ${T.border}`, borderRadius: '2px', fontSize: '0.78rem', ...font }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={userRoleData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="name" tick={{ fontSize: '0.74rem', fill: T.indigoMuted, fontFamily: 'Open Sans' }} />
              <YAxis tick={{ fontSize: '0.74rem', fill: T.indigoMuted, fontFamily: 'Open Sans' }} />
              <Tooltip contentStyle={{ background: T.ivory, border: `1px solid ${T.border}`, borderRadius: '2px', fontSize: '0.78rem', ...font }} />
              <Bar dataKey="value" fill={T.indigo} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend — Last 6 Months">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="month" tick={{ fontSize: '0.74rem', fill: T.indigoMuted, fontFamily: 'Open Sans' }} />
              <YAxis tick={{ fontSize: '0.74rem', fill: T.indigoMuted, fontFamily: 'Open Sans' }} />
              <Tooltip formatter={v => fmt.currency(v)} contentStyle={{ background: T.ivory, border: `1px solid ${T.border}`, borderRadius: '2px', fontSize: '0.78rem', ...font }} />
              <Line type="monotone" dataKey="revenue" stroke={T.indigo} strokeWidth={2.5} dot={{ fill: T.indigo, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment Success Rate">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={paymentStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}>
                <Cell fill="#14643c" />
                <Cell fill="#a01e1e" />
              </Pie>
              <Tooltip contentStyle={{ background: T.ivory, border: `1px solid ${T.border}`, borderRadius: '2px', fontSize: '0.78rem', ...font }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Revenue stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <StatCard label="Total Revenue"       value={fmt.currency(stats.totalRevenue)}    sub="All time"      accent="#14643c" />
        <StatCard label="This Month"          value={fmt.currency(stats.revenueThisMonth)} sub="Current month" accent="#c8960c" />
        <StatCard label="Successful Payments" value={`${stats.successfulPayments} / ${stats.totalPayments}`} sub={`${stats.failedPayments} failed`} accent={T.indigo} />
      </div>

      {/* Booking stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Bookings',    value: stats.totalBookings,      accent: T.indigo       },
          { label: 'Completed',         value: stats.completedBookings,  accent: '#14643c'      },
          { label: 'In Progress',       value: stats.inProgressBookings, accent: '#4a1278'      },
          { label: 'Pending Bookings',  value: stats.pendingBookings,    accent: '#c8960c'      },
          { label: 'Cancelled',         value: stats.cancelledBookings,  accent: '#a01e1e'      },
          { label: 'Confirmed',         value: stats.confirmedBookings,  accent: '#1a5050'      },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>
    </div>
  );
};

// ─── PENDING WORKERS TAB ──────────────────────────────────────────────────────
const PendingWorkersTab = () => {
  const [workers, setWorkers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [alert, setAlert]           = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try   { setWorkers(await adminApi.getPending()); }
    catch { setAlert({ type: 'error', message: 'Failed to load pending workers' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredWorkers = React.useMemo(() => {
    if (!searchQuery.trim()) return workers;
    const q = searchQuery.toLowerCase();
    return workers.filter(w =>
      [w.username, w.email, w.panNumber, w.workerFullName].some(f => f?.toLowerCase().includes(q))
    );
  }, [searchQuery, workers]);

  const handle = async (id, action) => {
    try {
      const res = action === 'approve' ? await adminApi.approveWorker(id) : await adminApi.rejectWorker(id);
      setAlert({ type: 'success', message: res.message });
      load();
    } catch { setAlert({ type: 'error', message: `Failed to ${action} worker` }); }
  };

  return (
    <div>
      <AnimatePresence>{alert && <AlertBanner {...alert} onClose={() => setAlert(null)} />}</AnimatePresence>
      <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, email, or PAN…" />
        {searchQuery && (
          <p style={{ fontSize: '0.74rem', color: T.indigoMuted, margin: 0, ...font, fontWeight: 500 }}>
            {filteredWorkers.length} result{filteredWorkers.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {loading ? <Spinner /> : filteredWorkers.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: T.indigoSubtle, border: `1px solid ${T.border}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Clock size={20} color={T.indigoMuted} strokeWidth={1.2} />
          </div>
          <p style={{ color: T.indigoMuted, fontSize: '0.84rem', margin: 0, ...font, fontWeight: 500 }}>
            {searchQuery ? 'No matching applications' : 'No pending applications'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredWorkers.map(w => (
            <motion.div key={w.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              className="ak-worker-card"
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
                padding: '14px 16px',
                background: T.ivory,
                border: `1px solid ${T.border}`,
                borderLeft: `3px solid ${T.indigo}`,
                borderRadius: '2px',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}>
              <div>
                <p style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '0.88rem', margin: '0 0 3px', ...font }}>{w.workerFullName || w.username}</p>
                <p style={{ color: T.indigoMuted, fontSize: '0.76rem', margin: '0 0 2px', ...font, fontWeight: 500 }}>{w.email}</p>
                <p style={{ color: T.indigoMuted, fontSize: '0.72rem', margin: 0, ...font, fontWeight: 400 }}>
                  PAN: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: T.indigoText }}>{w.panNumber}</span>
                  <span style={{ marginLeft: '12px' }}>Applied {fmt.date(w.createdAt)}</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <ActionBtn onClick={() => handle(w.id, 'approve')} variant="success">✓ Approve</ActionBtn>
                <ActionBtn onClick={() => handle(w.id, 'reject')}  variant="danger">✗ Reject</ActionBtn>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── USERS TAB ────────────────────────────────────────────────────────────────
const UsersTab = () => {
  const [data, setData]               = useState(null);
  const [page, setPage]               = useState(0);
  const [roleFilter, setRoleFilter]   = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);
  const [alert, setAlert]             = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifModal, setNotifModal]   = useState(null);
  const [notifForm, setNotifForm]     = useState({ title: '', message: '' });
  const [notifLoading, setNotifLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try   { setData(await adminApi.getUsers(page, 15, roleFilter, searchQuery)); }
    catch { setAlert({ type: 'error', message: 'Failed to load users' }); }
    finally { setLoading(false); }
  }, [page, roleFilter, searchQuery]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);
  useEffect(() => { load(); }, [page, roleFilter]);

  const handleToggle = async (id) => {
    try { const r = await adminApi.toggleEnabled(id); setAlert({ type: 'success', message: r.message }); load(); }
    catch { setAlert({ type: 'error', message: 'Failed to toggle user' }); }
  };
  const handleSendNotif = async () => {
    if (!notifForm.title || !notifForm.message) return;
    setNotifLoading(true);
    try {
      const r = await adminApi.sendNotif(notifModal.id, notifForm.title, notifForm.message);
      setAlert({ type: 'success', message: r.message });
      setNotifModal(null); setNotifForm({ title: '', message: '' });
    } catch { setAlert({ type: 'error', message: 'Failed to send notification' }); }
    finally { setNotifLoading(false); }
  };

  const users = data?.content || [];

  return (
    <div>
      <AnimatePresence>{alert && <AlertBanner {...alert} onClose={() => setAlert(null)} />}</AnimatePresence>

      <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by email, name, or username…" />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['', 'CONSUMER', 'WORKER', 'ADMIN'].map(r => (
            <FilterBtn key={r} active={roleFilter === r} onClick={() => { setRoleFilter(r); setPage(0); }}>
              {r || 'All'}
            </FilterBtn>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <TableWrap>
          <THead cols={['ID', 'Email', 'Name', 'Role', 'Status', 'Joined', 'Actions']} />
          <tbody>
            {users.map((u, i) => (
              <TR key={u.id} odd={i % 2 === 1}>
                <TD mono muted>#{u.id}</TD>
                <TD truncate>{u.email}</TD>
                <TD bold>{u.consumerFullName || u.workerFullName || u.name || '—'}</TD>
                <TD><Badge value={u.role} /></TD>
                <TD>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: u.enabled ? '#14643c' : '#a01e1e', ...font }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.enabled ? '#14643c' : '#a01e1e', flexShrink: 0 }} />
                    {u.enabled ? 'Active' : 'Disabled'}
                  </span>
                </TD>
                <TD muted>{fmt.date(u.createdAt)}</TD>
                <TD>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <ActionBtn onClick={() => setSelectedUser(u)} variant="ghost">View</ActionBtn>
                    <ActionBtn onClick={() => handleToggle(u.id)} variant={u.enabled ? 'danger' : 'success'}>{u.enabled ? 'Disable' : 'Enable'}</ActionBtn>
                    <ActionBtn onClick={() => setNotifModal(u)} variant="ghost">Notify</ActionBtn>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </TableWrap>
      )}
      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <Modal title={`User #${selectedUser.id}`} onClose={() => setSelectedUser(null)}>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              {[
                ['Email', selectedUser.email], ['Username', selectedUser.username],
                ['Role', selectedUser.role], ['Name', selectedUser.consumerFullName || selectedUser.workerFullName || selectedUser.name || '—'],
                ['Phone', selectedUser.phone || '—'], ['Status', selectedUser.enabled ? 'Active' : 'Disabled'],
                ['Email Verified', selectedUser.emailVerified ? 'Yes' : 'No'], ['Joined', fmt.date(selectedUser.createdAt)],
                ...(selectedUser.role === 'WORKER' ? [
                  ['City', selectedUser.city || '—'], ['Rating', selectedUser.averageRating?.toFixed(1) || '—'],
                  ['Jobs Done', selectedUser.totalJobsCompleted ?? '—'], ['Available', selectedUser.isAvailable ? 'Yes' : 'No'],
                  ['Verified', selectedUser.isVerified ? 'Yes' : 'No'], ['Approved', selectedUser.workerApproved ? 'Yes' : 'No'],
                ] : []),
                ...(selectedUser.role === 'CONSUMER' ? [['Total Bookings', selectedUser.totalBookings ?? '—']] : []),
              ].map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt style={{ fontSize: '0.70rem', fontWeight: 700, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.06em', ...font }}>{k}</dt>
                  <dd style={{ color: T.indigoDeep, fontWeight: 600, fontSize: '0.84rem', margin: 0, ...font, overflow: 'hidden', textOverflow: 'ellipsis' }}>{String(v)}</dd>
                </React.Fragment>
              ))}
            </dl>
          </Modal>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {notifModal && (
          <Modal title={`Notify — ${notifModal.email}`} onClose={() => setNotifModal(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <SectionLabel>Title</SectionLabel>
                <input value={notifForm.title} onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))}
                  className="ak-input" style={inputStyle} placeholder="Notification title" />
              </div>
              <div>
                <SectionLabel>Message</SectionLabel>
                <textarea value={notifForm.message} onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))}
                  rows={4} className="ak-textarea"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  placeholder="Your message…" />
              </div>
              <button onClick={handleSendNotif} disabled={notifLoading} className="ak-btn-primary"
                style={{ padding: '11px', background: notifLoading ? 'rgba(26,16,80,0.35)' : T.indigo, border: 'none', borderRadius: '2px', color: T.ivory, cursor: notifLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.07em', textTransform: 'uppercase', transition: 'opacity 0.15s', boxShadow: `0 3px 12px ${T.shadow}`, ...font }}>
                {notifLoading ? 'Sending…' : 'Send Notification'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── BOOKINGS TAB ─────────────────────────────────────────────────────────────
const BookingsTab = () => {
  const [data, setData]               = useState(null);
  const [page, setPage]               = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);
  const [alert, setAlert]             = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try   { setData(await adminApi.getBookings(page, 15, statusFilter, searchQuery)); }
    catch { setAlert({ type: 'error', message: 'Failed to load bookings' }); }
    finally { setLoading(false); }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [searchQuery]);
  useEffect(() => { load(); }, [page, statusFilter]);

  const handleCancel = async () => {
    try {
      const r = await adminApi.cancelBooking(cancelModal.id, cancelReason);
      setAlert({ type: 'success', message: r.message });
      setCancelModal(null); setCancelReason(''); load();
    } catch { setAlert({ type: 'error', message: 'Failed to cancel booking' }); }
  };

  const bookings = data?.content || [];
  const STATUSES = ['', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div>
      <AnimatePresence>{alert && <AlertBanner {...alert} onClose={() => setAlert(null)} />}</AnimatePresence>

      <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by service, consumer, or worker…" />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <FilterBtn key={s} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(0); }}>
              {s.replace('_', ' ') || 'All'}
            </FilterBtn>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <TableWrap>
          <THead cols={['ID', 'Service', 'Consumer', 'Worker', 'Amount', 'Status', 'Payment', 'Date', 'Actions']} />
          <tbody>
            {bookings.map((b, i) => (
              <TR key={b.id} odd={i % 2 === 1}>
                <TD mono muted>#{b.id}</TD>
                <TD bold truncate>{b.serviceTitle}</TD>
                <TD truncate>{b.consumerName}</TD>
                <TD truncate>{b.workerName}</TD>
                <TD bold>{fmt.currency(b.totalAmount || b.estimatedCost)}</TD>
                <TD><Badge value={b.status} /></TD>
                <TD><Badge value={b.paymentStatus} /></TD>
                <TD muted>{fmt.date(b.scheduledDate)}</TD>
                <TD>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <ActionBtn onClick={() => setSelectedBooking(b)} variant="ghost">View</ActionBtn>
                    {!['COMPLETED', 'CANCELLED'].includes(b.status) && (
                      <ActionBtn onClick={() => setCancelModal(b)} variant="danger">Cancel</ActionBtn>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </TableWrap>
      )}
      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <Modal title={`Booking #${selectedBooking.id}`} onClose={() => setSelectedBooking(null)}>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              {[
                ['Service', selectedBooking.serviceTitle], ['Category', selectedBooking.categoryName || '—'],
                ['Status', selectedBooking.status], ['Payment', selectedBooking.paymentStatus || '—'],
                ['Consumer', selectedBooking.consumerName], ['Worker', selectedBooking.workerName],
                ['City', selectedBooking.city], ['Estimated', fmt.currency(selectedBooking.estimatedCost)],
                ['Actual', fmt.currency(selectedBooking.actualCost)], ['Total', fmt.currency(selectedBooking.totalAmount)],
                ['Scheduled', fmt.datetime(selectedBooking.scheduledDate)], ['Created', fmt.datetime(selectedBooking.createdAt)],
                ['Completed', fmt.datetime(selectedBooking.completedAt)], ['Cancelled At', fmt.datetime(selectedBooking.cancelledAt)],
                ['Cancelled By', selectedBooking.cancelledBy || '—'], ['Reason', selectedBooking.cancellationReason || '—'],
              ].map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt style={{ fontSize: '0.70rem', fontWeight: 700, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.06em', ...font }}>{k}</dt>
                  <dd style={{ color: T.indigoDeep, fontWeight: 600, fontSize: '0.84rem', margin: 0, ...font }}>{String(v)}</dd>
                </React.Fragment>
              ))}
            </dl>
          </Modal>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal && (
          <Modal title={`Cancel Booking #${cancelModal.id}`} onClose={() => setCancelModal(null)}>
            <div style={{ marginBottom: '14px', padding: '12px', background: T.indigoSubtle, border: `1px solid ${T.border}`, borderRadius: '2px' }}>
              <p style={{ color: T.indigoDeep, fontWeight: 700, fontSize: '0.84rem', margin: '0 0 4px', ...font }}>{cancelModal.serviceTitle}</p>
              <p style={{ color: T.indigoMuted, fontSize: '0.76rem', margin: 0, ...font, fontWeight: 500 }}>
                {cancelModal.consumerName} → {cancelModal.workerName}
              </p>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <SectionLabel>Reason for Cancellation</SectionLabel>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3}
                className="ak-textarea"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="Reason for cancellation…" />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCancelModal(null)} className="ak-btn-ghost"
                style={{ flex: 1, padding: '10px', background: T.ivoryDeep, border: `1px solid ${T.borderStrong}`, borderRadius: '2px', color: T.indigoText, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'background 0.15s', ...font }}>
                Go Back
              </button>
              <button onClick={handleCancel} className="ak-btn-primary"
                style={{ flex: 1, padding: '10px', background: '#a01e1e', border: 'none', borderRadius: '2px', color: T.ivory, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'opacity 0.15s', boxShadow: `0 3px 12px rgba(160,30,30,0.28)`, ...font }}>
                Confirm Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── PAYMENTS TAB ─────────────────────────────────────────────────────────────
const PaymentsTab = () => {
  const [data, setData]               = useState(null);
  const [page, setPage]               = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);
  const [alert, setAlert]             = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try   { setData(await adminApi.getPayments(page, 15, statusFilter, searchQuery)); }
    catch { setAlert({ type: 'error', message: 'Failed to load payments' }); }
    finally { setLoading(false); }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [searchQuery]);
  useEffect(() => { load(); }, [page, statusFilter]);

  const payments = data?.content || [];

  return (
    <div>
      <AnimatePresence>{alert && <AlertBanner {...alert} onClose={() => setAlert(null)} />}</AnimatePresence>

      <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by service, consumer, or Razorpay ID…" />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'].map(s => (
            <FilterBtn key={s} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(0); }}>
              {s || 'All'}
            </FilterBtn>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <TableWrap>
          <THead cols={['ID', 'Booking', 'Service', 'Consumer', 'Amount', 'Status', 'Razorpay ID', 'Paid At']} />
          <tbody>
            {payments.map((p, i) => (
              <TR key={p.id} odd={i % 2 === 1}>
                <TD mono muted>#{p.id}</TD>
                <TD mono>#{p.bookingId}</TD>
                <TD bold truncate>{p.serviceTitle}</TD>
                <TD truncate>{p.consumerName}</TD>
                <TD bold>{fmt.currency(p.amount)}</TD>
                <TD><Badge value={p.status} /></TD>
                <TD mono muted truncate title={p.razorpayPaymentId}>{p.razorpayPaymentId || p.razorpayOrderId || '—'}</TD>
                <TD muted>{fmt.datetime(p.paidAt)}</TD>
              </TR>
            ))}
          </tbody>
        </TableWrap>
      )}
      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  );
};

// ─── TABS CONFIG ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',  Icon: LayoutDashboard },
  { id: 'workers',   label: 'Pending',   Icon: Clock           },
  { id: 'users',     label: 'Users',     Icon: Users           },
  { id: 'bookings',  label: 'Bookings',  Icon: CalendarDays    },
  { id: 'payments',  label: 'Payments',  Icon: CreditCard      },
];

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
const AdminDashboard = ({ user, logout }) => {
  const navigate                      = useNavigate();
  const [activeTab, setActiveTab]     = useState('overview');
  const [stats, setStats]             = useState(null);
  const [showLogout, setShowLogout]   = useState(false);

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', background: T.ivoryMid }}>

        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
        <header style={{
          background: T.ivory,
          borderBottom: `1px solid ${T.borderStrong}`,
          borderTop: `3px solid ${T.indigo}`,
          position: 'sticky', top: 0, zIndex: 40,
          boxShadow: `0 2px 8px ${T.shadowSoft}`,
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '34px', height: '34px', background: T.indigo, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ivory, fontWeight: 800, fontSize: '0.9rem', ...font }}>
                A
              </div>
              <div>
                <h1 style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '0.95rem', margin: 0, ...font, letterSpacing: '-0.01em' }}>AapnoKaam Admin</h1>
                <p style={{ color: T.indigoMuted, fontSize: '0.72rem', margin: 0, ...font, fontWeight: 500 }}>{user?.email || 'Administrator'}</p>
              </div>
            </div>
            <button onClick={() => setShowLogout(true)} className="ak-btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(160,30,30,0.08)', border: `1px solid rgba(160,30,30,0.25)`, borderRadius: '2px', color: '#a01e1e', cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'background 0.15s', ...font }}>
              <LogOut size={13} strokeWidth={2} /> Logout
            </button>
          </div>
        </header>

        {/* ── Tab Nav ─────────────────────────────────────────────────────── */}
        <div style={{ background: T.ivory, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: '61px', zIndex: 30, boxShadow: `0 2px 6px ${T.shadowSoft}` }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '2px', overflowX: 'auto' }}>
            {TABS.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={active ? '' : 'ak-tab-btn'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '12px 16px',
                    background: active ? T.indigo : 'transparent',
                    border: 'none',
                    borderBottom: active ? 'none' : '2px solid transparent',
                    cursor: 'pointer',
                    color: active ? T.ivory : T.indigoMuted,
                    fontWeight: active ? 700 : 600,
                    fontSize: '0.76rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                    transition: 'background 0.15s, color 0.15s',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                    ...font,
                  }}>
                  <Icon size={13} strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                  {id === 'workers' && stats?.pendingWorkerApprovals > 0 && (
                    <span style={{ background: '#a01e1e', color: T.ivory, fontSize: '0.58rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font }}>
                      {stats.pendingWorkerApprovals}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
              {activeTab === 'overview'  && <OverviewTab stats={stats} />}
              {activeTab === 'workers'   && <PendingWorkersTab />}
              {activeTab === 'users'     && <UsersTab />}
              {activeTab === 'bookings'  && <BookingsTab />}
              {activeTab === 'payments'  && <PaymentsTab />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Logout Confirm ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {showLogout && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(20,10,80,0.45)', backdropFilter: 'blur(2px)' }}>
              <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                style={{ background: T.ivory, border: `1px solid ${T.borderStrong}`, borderTop: `3px solid ${T.indigo}`, borderRadius: '3px', padding: '28px 24px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: `0 20px 60px rgba(20,10,80,0.22)` }}>
                <div style={{ width: '44px', height: '44px', background: T.indigoSubtle, border: `1px solid ${T.border}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <LogOut size={18} color={T.indigoMuted} strokeWidth={1.5} />
                </div>
                <h3 style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '1rem', margin: '0 0 8px', ...font }}>Confirm Logout</h3>
                <p style={{ color: T.indigoMuted, fontSize: '0.82rem', margin: '0 0 22px', ...font, fontWeight: 500 }}>Are you sure you want to logout?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowLogout(false)} className="ak-btn-ghost"
                    style={{ flex: 1, padding: '10px', background: T.ivoryDeep, border: `1px solid ${T.borderStrong}`, borderRadius: '2px', color: T.indigoText, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'background 0.15s', ...font }}>
                    Cancel
                  </button>
                  <button onClick={handleLogout} className="ak-btn-primary"
                    style={{ flex: 1, padding: '10px', background: '#a01e1e', border: 'none', borderRadius: '2px', color: T.ivory, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'opacity 0.15s', boxShadow: `0 3px 12px rgba(160,30,30,0.28)`, ...font }}>
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminDashboard;