import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, User, Wrench, Star, MessageCircle, Bell, LogOut, Edit, Save, X,
  Upload, Check, TrendingUp, DollarSign, Briefcase, Clock, MapPin, Phone,
  Mail, Award, Calendar, ChevronLeft, ChevronRight, Send, Trash2, Eye,
  Settings, Plus, Minus, AlertCircle, CheckCircle2, XCircle, Info
} from 'lucide-react';
import ChatSection from './ChatSection';
import NotificationPanel from './NotificationPanel';
import ReviewModal from './ReviewModal';
import WorkerNotificationsSection from './WorkerNotificationSection';
import WorkerReviewsSection from './WorkerReviewSection';
import WorkerSkillsSection from './WorkerSkillSection';
import WorkerBookingsSection from './WorkerBookingSection';

// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE_URL = 'http://localhost:8081/api';

const workerApi = {
  getDashboard: async (token) => {
    const r = await fetch(`${API_BASE_URL}/worker/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  toggleAvailability: async (token, isAvailable) => {
    const r = await fetch(`${API_BASE_URL}/worker/availability`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable }),
    });
    return r.json();
  },
  getProfile: async (token) => {
    const r = await fetch(`${API_BASE_URL}/worker/profile`, { headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  updateProfile: async (token, profileData) => {
    const r = await fetch(`${API_BASE_URL}/worker/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return r.json();
  },
  uploadProfilePicture: async (token, file) => {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch(`${API_BASE_URL}/worker/profile/picture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    return r.json();
  },
  getSkills: async (token) => {
    const r = await fetch(`${API_BASE_URL}/worker/skills`, { headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  getCategories: async (token) => {
    const r = await fetch(`${API_BASE_URL}/worker/categories`, { headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  updateSkills: async (token, skills) => {
    const r = await fetch(`${API_BASE_URL}/worker/skills`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills }),
    });
    return r.json();
  },
  getReviews: async (token, page = 0, size = 10) => {
    const r = await fetch(`${API_BASE_URL}/worker/reviews?page=${page}&size=${size}`, { headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  getConversations: async (token) => {
    const r = await fetch(`${API_BASE_URL}/chat/conversations`, { headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  getMessages: async (token, conversationId, page = 0, size = 50) => {
    const r = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`, { headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  sendMessage: async (token, messageData) => {
    const r = await fetch(`${API_BASE_URL}/chat/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    return r.json();
  },
  markConversationAsRead: async (token, conversationId) => {
    const r = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/read`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` },
    });
    return r.json();
  },
  getNotifications: async (token, unreadOnly = false, page = 0, size = 20) => {
    const r = await fetch(`${API_BASE_URL}/notifications?unreadOnly=${unreadOnly}&page=${page}&size=${size}`, { headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  markNotificationAsRead: async (token, notificationId) => {
    const r = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  markAllNotificationsAsRead: async (token) => {
    const r = await fetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
  deleteNotification: async (token, notificationId) => {
    const r = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  },
};

// ─── Ivory & Indigo Theme ─────────────────────────────────────────────────────
const T = {
  ivory:        '#f0ebe0',
  ivoryDeep:    '#e8e0ce',
  ivoryMid:     '#ede7d9',
  indigo:       '#1a1050',
  indigoDeep:   '#140c40',
  indigoHover:  '#251870',
  indigoSubtle: 'rgba(20, 10, 80, 0.06)',
  indigoMid:    'rgba(20, 10, 80, 0.10)',
  indigoText:   'rgba(20, 10, 80, 0.78)',
  indigoMuted:  'rgba(20, 10, 80, 0.50)',
  border:       'rgba(20, 10, 80, 0.15)',
  borderStrong: 'rgba(20, 10, 80, 0.28)',
  shadow:       'rgba(20, 10, 80, 0.14)',
  shadowSoft:   'rgba(20, 10, 80, 0.07)',
  success:      '#166534',
  successBg:    'rgba(22, 101, 52, 0.08)',
  successBd:    'rgba(22, 101, 52, 0.3)',
  error:        '#b91c1c',
  errorBg:      'rgba(185, 28, 28, 0.07)',
  errorBd:      'rgba(185, 28, 28, 0.3)',
  warn:         'rgba(20, 10, 80, 0.65)',
  warnBg:       'rgba(20, 10, 80, 0.06)',
  warnBd:       'rgba(20, 10, 80, 0.2)',
};

// ─── Font Loader ──────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
    .ak-spin { animation: ak-spin 0.85s linear infinite; }
    @keyframes ak-spin { to { transform: rotate(360deg); } }
    .ak-tab:hover { color: ${T.indigo} !important; background: ${T.indigoSubtle} !important; }
    .ak-tab-active { color: ${T.indigo} !important; border-bottom: 2px solid ${T.indigo} !important; background: ${T.indigoSubtle} !important; }
    .ak-card:hover { border-color: rgba(26,16,80,0.3) !important; box-shadow: 0 8px 32px ${T.shadow} !important; }
    .ak-btn-primary:hover:not(:disabled) { background: ${T.indigoHover} !important; }
    .ak-btn-ghost:hover { background: ${T.indigoSubtle} !important; border-color: ${T.indigo} !important; }
    .ak-btn-danger:hover { background: rgba(185,28,28,0.9) !important; }
    .ak-input:focus { border-color: ${T.indigo} !important; box-shadow: 0 0 0 3px rgba(26,16,80,0.08) !important; }
    .ak-input::placeholder { color: ${T.indigoMuted}; font-family: 'Open Sans', sans-serif; font-size: 0.78rem; }
    .ak-textarea:focus { border-color: ${T.indigo} !important; box-shadow: 0 0 0 3px rgba(26,16,80,0.08) !important; }
    .ak-textarea::placeholder { color: ${T.indigoMuted}; }
    .ak-link:hover { color: ${T.indigo} !important; }
    .ak-scroll::-webkit-scrollbar { width: 5px; }
    .ak-scroll::-webkit-scrollbar-track { background: ${T.ivoryDeep}; }
    .ak-scroll::-webkit-scrollbar-thumb { background: rgba(26,16,80,0.2); border-radius: 3px; }
  `}</style>
);

// ─── Ornament ─────────────────────────────────────────────────────────────────
const Ornament = () => (
  <div style={{ opacity: 0.25, lineHeight: 1 }}>
    <svg width="70" height="12" viewBox="0 0 70 12" fill="none">
      <line x1="0" y1="6" x2="24" y2="6" stroke={T.indigo} strokeWidth="0.8"/>
      <circle cx="29" cy="6" r="1.5" fill={T.indigo}/>
      <circle cx="35" cy="6" r="3" fill="none" stroke={T.indigo} strokeWidth="0.8"/>
      <circle cx="41" cy="6" r="1.5" fill={T.indigo}/>
      <line x1="46" y1="6" x2="70" y2="6" stroke={T.indigo} strokeWidth="0.8"/>
    </svg>
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ sz = 18, ivory = false }) => (
  <svg className="ak-spin" width={sz} height={sz} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={ivory ? T.ivory : T.indigo} strokeWidth="3" opacity="0.15"/>
    <path fill={ivory ? T.ivory : T.indigo} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.8"/>
  </svg>
);

// ─── HR ───────────────────────────────────────────────────────────────────────
const HR = ({ my = 16 }) => <div style={{ margin: `${my}px 0`, borderTop: `1px solid ${T.border}` }} />;

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, hover = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={hover ? 'ak-card' : ''}
    style={{
      background: T.ivory,
      border: `1px solid ${T.border}`,
      borderRadius: '3px',
      padding: '1.5rem',
      boxShadow: `0 4px 20px ${T.shadowSoft}`,
      transition: 'border-color 0.2s, box-shadow 0.2s',
      position: 'relative',
      ...style,
    }}
  >
    {children}
  </motion.div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, valueColor }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{
          fontFamily: "'Open Sans', sans-serif",
          fontSize: '0.68rem',
          fontWeight: '700',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: T.indigoMuted,
          marginBottom: '6px',
        }}>{label}</p>
        <p style={{
          fontFamily: "'Open Sans', sans-serif",
          fontSize: '1.7rem',
          fontWeight: '800',
          color: valueColor || T.indigo,
          lineHeight: 1,
        }}>{value}</p>
      </div>
      <div style={{
        width: '44px', height: '44px',
        background: T.indigoSubtle,
        border: `1px solid ${T.border}`,
        borderRadius: '2px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.indigo,
        flexShrink: 0,
      }}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
    </div>
  </Card>
);

// ─── Section Heading ──────────────────────────────────────────────────────────
const SectionHeading = ({ icon: Icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
    {Icon && <Icon size={20} color={T.indigo} strokeWidth={1.5} />}
    <h2 style={{
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '1rem',
      fontWeight: '700',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: T.indigoDeep,
      margin: 0,
    }}>{title}</h2>
    <div style={{ flex: 1, height: '1px', background: T.border, marginLeft: '8px' }} />
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = ({ label, error, icon: Icon, ...props }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{
      display: 'block',
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '0.72rem',
      fontWeight: '700',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: T.indigoMuted,
      marginBottom: '6px',
    }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && (
        <Icon
          size={15}
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.indigoMuted }}
          strokeWidth={1.5}
        />
      )}
      <input
        className="ak-input"
        style={{
          width: '100%',
          padding: Icon ? '10px 14px 10px 36px' : '10px 14px',
          background: T.ivoryMid,
          border: `1px solid ${error ? T.error : T.borderStrong}`,
          borderRadius: '2px',
          color: T.indigoDeep,
          fontFamily: "'Open Sans', sans-serif",
          fontSize: '1rem',
          fontWeight: '600',
          outline: 'none',
          transition: 'border-color 0.18s, box-shadow 0.18s',
          boxSizing: 'border-box',
        }}
        {...props}
      />
    </div>
    {error && (
      <p style={{
        color: T.error,
        fontSize: '0.75rem',
        fontFamily: "'Open Sans', sans-serif",
        fontWeight: '600',
        marginTop: '4px',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        <AlertCircle size={12} />{error}
      </p>
    )}
  </div>
);

// ─── TextArea ─────────────────────────────────────────────────────────────────
const TextArea = ({ label, error, ...props }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{
      display: 'block',
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '0.72rem',
      fontWeight: '700',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: T.indigoMuted,
      marginBottom: '6px',
    }}>{label}</label>
    <textarea
      className="ak-textarea"
      rows={3}
      style={{
        width: '100%',
        padding: '10px 14px',
        background: T.ivoryMid,
        border: `1px solid ${error ? T.error : T.borderStrong}`,
        borderRadius: '2px',
        color: T.indigoDeep,
        fontFamily: "'Open Sans', sans-serif",
        fontSize: '1rem',
        fontWeight: '600',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color 0.18s, box-shadow 0.18s',
        boxSizing: 'border-box',
      }}
      {...props}
    />
    {error && (
      <p style={{ color: T.error, fontSize: '0.75rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '600', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <AlertCircle size={12} />{error}
      </p>
    )}
  </div>
);

// ─── Button ───────────────────────────────────────────────────────────────────
const Button = ({ children, loading, onClick, variant = 'primary', type = 'button', disabled, icon: Icon, style: extraStyle = {} }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
    padding: '9px 18px',
    border: 'none',
    borderRadius: '2px',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: '700',
    fontSize: '0.75rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    opacity: loading || disabled ? 0.65 : 1,
    transition: 'background 0.18s, border-color 0.18s',
    boxSizing: 'border-box',
  };

  const variants = {
    primary: {
      background: T.indigo, color: T.ivory,
      boxShadow: `0 4px 14px ${T.shadow}`,
    },
    secondary: {
      background: T.indigoMid, color: T.indigoDeep,
      border: `1px solid ${T.border}`,
    },
    success: {
      background: T.success, color: T.ivory,
      boxShadow: `0 4px 14px ${T.successBg}`,
    },
    danger: {
      background: T.error, color: T.ivory,
      boxShadow: `0 4px 14px ${T.errorBg}`,
    },
    outline: {
      background: 'transparent', color: T.indigo,
      border: `1px solid ${T.borderStrong}`,
    },
  };

  const classMap = {
    primary:  'ak-btn-primary',
    secondary:'ak-btn-primary',
    success:  'ak-btn-primary',
    danger:   'ak-btn-danger',
    outline:  'ak-btn-ghost',
  };

  return (
    <button
      type={type}
      className={classMap[variant]}
      onClick={onClick}
      disabled={loading || disabled}
      style={{ ...base, ...variants[variant], ...extraStyle }}
    >
      {loading ? <><Spinner sz={13} ivory={variant === 'primary' || variant === 'danger' || variant === 'success'} /> Loading…</> : <>{Icon && <Icon size={15} strokeWidth={1.8} />}{children}</>}
    </button>
  );
};

// ─── Alert ────────────────────────────────────────────────────────────────────
const Alert = ({ type, message, onClose }) => {
  const cfg = {
    success: { color: T.success, bg: T.successBg, border: T.successBd, Icon: CheckCircle2 },
    error:   { color: T.error,   bg: T.errorBg,   border: T.errorBd,   Icon: XCircle },
    warning: { color: T.warn,    bg: T.warnBg,     border: T.warnBd,    Icon: AlertCircle },
    info:    { color: T.indigo,  bg: T.indigoSubtle, border: T.border,  Icon: Info },
  };
  const { color, bg, border, Icon: AlertIcon } = cfg[type] || cfg.info;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px',
        borderLeft: `3px solid ${color}`,
        background: bg, padding: '10px 14px', marginBottom: '16px', borderRadius: '0 2px 2px 0',
        color,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
        <AlertIcon size={17} strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
        <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.78rem', fontWeight: '600', letterSpacing: '0.03em', lineHeight: 1.55 }}>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color, opacity: 0.7, padding: 0, lineHeight: 0 }}>
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
};

// ─── Info Row (profile view) ──────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ marginBottom: '16px' }}>
    <p style={{
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '0.68rem',
      fontWeight: '700',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: T.indigoMuted,
      marginBottom: '4px',
      display: 'flex', alignItems: 'center', gap: '5px',
    }}>
      {Icon && <Icon size={12} strokeWidth={2} />}{label}
    </p>
    <p style={{
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '1.05rem',
      fontWeight: '600',
      color: T.indigoDeep,
      margin: 0,
    }}>{value || '—'}</p>
  </div>
);

// ─── Logout Modal ─────────────────────────────────────────────────────────────
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(20,10,80,0.45)', backdropFilter: 'blur(3px)',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          style={{
            background: T.ivoryMid, border: `1px solid ${T.borderStrong}`,
            borderTop: `3px solid ${T.indigo}`, borderRadius: '3px',
            padding: '40px 36px', width: '100%', maxWidth: '360px',
            textAlign: 'center', boxShadow: `0 16px 48px ${T.shadow}`,
          }}
        >
          <div style={{
            width: '52px', height: '52px', margin: '0 auto 16px',
            border: `1px solid ${T.borderStrong}`, background: T.indigoSubtle,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.indigo,
          }}>
            <LogOut size={22} strokeWidth={1.5} />
          </div>
          <h3 style={{
            fontFamily: "'Open Sans', sans-serif", color: T.indigoDeep,
            fontWeight: '700', fontSize: '1.15rem', margin: '0 0 8px', letterSpacing: '0.04em',
          }}>Confirm Logout</h3>
          <p style={{
            fontFamily: "'Open Sans', sans-serif",
            color: T.indigoMuted, fontSize: '1rem', fontWeight: '500', margin: '0 0 24px',
          }}>Are you sure you want to sign out of your account?</p>
          <HR my={20} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={onClose} icon={X} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="danger" onClick={onConfirm} icon={LogOut} style={{ flex: 1 }}>Sign Out</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Dashboard Overview ───────────────────────────────────────────────────────
const DashboardOverview = ({ token, dashboardData, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleToggleAvailability = async () => {
    setLoading(true); setAlert(null);
    try {
      const r = await workerApi.toggleAvailability(token, !dashboardData.isAvailable);
      if (r.message) { setAlert({ type: 'success', message: r.message }); onRefresh(); }
    } catch { setAlert({ type: 'error', message: 'Failed to update availability' }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* Page header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Ornament />
          </div>
          <h2 style={{
            fontFamily: "'Open Sans', sans-serif", fontSize: '1.05rem', fontWeight: '700',
            letterSpacing: '0.05em', textTransform: 'uppercase', color: T.indigoDeep, margin: 0,
          }}>Dashboard Overview</h2>
        </div>
        <Button
          onClick={handleToggleAvailability}
          loading={loading}
          variant={dashboardData.isAvailable ? 'danger' : 'success'}
          icon={dashboardData.isAvailable ? XCircle : CheckCircle2}
        >
          {dashboardData.isAvailable ? 'Set Unavailable' : 'Set Available'}
        </Button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <StatCard
          label="Status"
          value={dashboardData.isAvailable ? 'Available' : 'Unavailable'}
          icon={dashboardData.isAvailable ? CheckCircle2 : XCircle}
          valueColor={dashboardData.isAvailable ? T.success : T.error}
        />
        <StatCard label="Avg. Rating" value={dashboardData.averageRating ? dashboardData.averageRating.toFixed(1) : 'N/A'} icon={Star} />
        <StatCard label="Total Jobs" value={dashboardData.totalJobsCompleted || 0} icon={Briefcase} />
        <StatCard label="Total Reviews" value={dashboardData.totalReviews || 0} icon={Award} />
      </div>

      {/* Worker Info */}
      <Card style={{ marginBottom: '16px' }}>
        <SectionHeading icon={User} title="Worker Information" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px' }}>
          <InfoRow icon={User} label="Name" value={dashboardData.workerName} />
          <InfoRow icon={Award} label="Worker ID" value={dashboardData.workerId} />
          <InfoRow icon={MessageCircle} label="Unread Messages" value={dashboardData.unreadMessages || 0} />
          <InfoRow icon={Bell} label="Unread Notifications" value={dashboardData.unreadNotifications || 0} />
        </div>
      </Card>

      {/* Primary Skills */}
      {dashboardData.primarySkills?.length > 0 && (
        <Card style={{ marginBottom: '16px' }}>
          <SectionHeading icon={Wrench} title="Primary Skills" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {dashboardData.primarySkills.map((skill, i) => (
              <span key={i} style={{
                padding: '5px 14px',
                background: T.indigoSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                color: T.indigoDeep,
                fontFamily: "'Open Sans', sans-serif",
                fontSize: '0.72rem',
                fontWeight: '700',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}>{skill}</span>
            ))}
          </div>
        </Card>
      )}

      {/* Detailed Stats */}
      {dashboardData.stats && (
        <Card>
          <SectionHeading icon={TrendingUp} title="Detailed Statistics" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              { icon: Briefcase, label: 'Jobs This Month', value: dashboardData.stats.jobsThisMonth || 0 },
              { icon: DollarSign, label: 'Total Earnings', value: `₹${dashboardData.stats.totalEarnings || 0}` },
              { icon: Calendar, label: 'Earnings This Month', value: `₹${dashboardData.stats.earningsThisMonth || 0}` },
              { icon: TrendingUp, label: 'Response Rate', value: `${dashboardData.stats.responseRate || 0}%` },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} style={{
                padding: '14px',
                background: T.ivoryMid,
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Icon size={14} color={T.indigoMuted} strokeWidth={1.5} />
                  <p style={{
                    fontFamily: "'Open Sans', sans-serif", fontSize: '0.65rem', fontWeight: '700',
                    letterSpacing: '0.09em', textTransform: 'uppercase', color: T.indigoMuted, margin: 0,
                  }}>{label}</p>
                </div>
                <p style={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1.6rem', fontWeight: '800', color: T.indigo, margin: 0, lineHeight: 1,
                }}>{value}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Open Sans', sans-serif", fontSize: '0.68rem', fontWeight: '600',
              color: T.indigoMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            }}>
              <Calendar size={12} />Member Since: {dashboardData.stats.memberSince}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── Profile Section ──────────────────────────────────────────────────────────
const ProfileSection = ({ token, onRefresh }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await workerApi.getProfile(token);
      setProfile(data);
      setFormData({
        fullName: data.fullName || '', phoneNumber: data.phoneNumber || '',
        bio: data.bio || '', experienceYears: data.experienceYears || '',
        hourlyRate: data.hourlyRate || '', address: data.address || '',
        city: data.city || '', state: data.state || '', pincode: data.pincode || '',
        languagesSpoken: data.languagesSpoken || '',
        latitude: data.latitude || null, longitude: data.longitude || null,
      });
    } catch { setAlert({ type: 'error', message: 'Failed to load profile' }); }
    finally { setLoading(false); }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setAlert({ type: 'error', message: 'Geolocation is not supported by your browser' }); return; }
    setDetectingLocation(true); setAlert(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data?.address) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name || prev.address,
              city: data.address.city || data.address.town || data.address.village || prev.city,
              state: data.address.state || prev.state,
              pincode: data.address.postcode || prev.pincode,
            }));
          }
          setAlert({ type: 'success', message: `Location detected! ${lat.toFixed(6)}, ${lng.toFixed(6)}. Address auto-filled — please verify and save.` });
        } catch {
          setAlert({ type: 'success', message: `Location detected! ${lat.toFixed(6)}, ${lng.toFixed(6)}. Please fill in your address details.` });
        }
        setDetectingLocation(false);
      },
      (error) => {
        let msg = 'Unable to get your location. ';
        if (error.code === error.PERMISSION_DENIED) msg += 'Please enable location access in your browser settings.';
        else if (error.code === error.POSITION_UNAVAILABLE) msg += 'Location information is unavailable.';
        else if (error.code === error.TIMEOUT) msg += 'Location request timed out.';
        setAlert({ type: 'error', message: msg });
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleUpdate = async () => {
    if (!formData.latitude || !formData.longitude) {
      setAlert({ type: 'warning', message: 'Please detect your location before saving. This helps customers find you!' });
      return;
    }
    setLoading(true); setAlert(null);
    try {
      const r = await workerApi.updateProfile(token, formData);
      if (r.success) {
        setAlert({ type: 'success', message: r.message || 'Profile updated successfully!' });
        setEditing(false); loadProfile(); onRefresh();
      } else setAlert({ type: 'error', message: r.message || 'Failed to update profile' });
    } catch { setAlert({ type: 'error', message: 'Failed to update profile' }); }
    finally { setLoading(false); }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setAlert({ type: 'error', message: 'File size must be less than 5MB' }); return; }
    setUploadingPicture(true); setAlert(null);
    try {
      const r = await workerApi.uploadProfilePicture(token, file);
      if (r.success) { setAlert({ type: 'success', message: r.message || 'Profile picture updated!' }); loadProfile(); onRefresh(); }
      else setAlert({ type: 'error', message: r.message || 'Failed to upload picture' });
    } catch { setAlert({ type: 'error', message: 'Failed to upload picture' }); }
    finally { setUploadingPicture(false); }
  };

  if (loading && !profile) {
    return (
      <Card style={{ textAlign: 'center', padding: '4rem' }}>
        <Spinner sz={36} />
        <p style={{ marginTop: '16px', fontFamily: "'Open Sans', sans-serif", fontSize: '0.8rem', fontWeight: '600', color: T.indigoMuted, letterSpacing: '0.1em' }}>Loading profile…</p>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1.05rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.indigoDeep, margin: 0 }}>
          My Profile
        </h2>
        {!editing && <Button onClick={() => setEditing(true)} icon={Edit}>Edit Profile</Button>}
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Location warning */}
      {(!profile?.latitude || !profile?.longitude) && !editing && (
        <Card style={{ marginBottom: '16px', background: T.warnBg, borderColor: T.warnBd }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={20} color={T.warn} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.06em', color: T.indigoDeep, margin: '0 0 5px' }}>Location Not Set</p>
              <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1rem', fontWeight: '500', color: T.indigoText, margin: '0 0 12px', lineHeight: 1.65 }}>
                Your location is not set. Customers won't be able to find you in location-based searches. Please edit your profile and use "Detect My Location".
              </p>
              <Button onClick={() => setEditing(true)} variant="outline" icon={MapPin}>Set Location Now</Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {/* Profile Picture */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            {profile?.profilePictureUrl ? (
              <img src={profile.profilePictureUrl} alt="Profile" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.borderStrong}` }} />
            ) : (
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: T.indigo,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.ivory,
                fontFamily: "'Open Sans', sans-serif", fontSize: '2rem', fontWeight: '700',
                border: `2px solid ${T.borderStrong}`,
              }}>
                {profile?.fullName?.charAt(0) || 'W'}
              </div>
            )}
            {uploadingPicture && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(20,10,80,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Spinner sz={24} ivory />
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleProfilePictureUpload} accept="image/*" style={{ display: 'none' }} />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={uploadingPicture} icon={Upload}>
            {uploadingPicture ? 'Uploading…' : 'Change Picture'}
          </Button>
          {profile?.isVerified && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', color: T.success }}>
              <CheckCircle2 size={15} strokeWidth={2} />
              <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Verified Worker</span>
            </div>
          )}
        </div>

        {/* View Mode */}
        {!editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            <InfoRow icon={User}     label="Full Name"        value={profile?.fullName} />
            <InfoRow icon={Mail}     label="Email"            value={profile?.email} />
            <InfoRow icon={Phone}    label="Phone Number"     value={profile?.phoneNumber} />
            <InfoRow icon={Clock}    label="Experience Years" value={profile?.experienceYears} />
            <InfoRow icon={DollarSign} label="Hourly Rate"   value={profile?.hourlyRate ? `₹${profile.hourlyRate}` : null} />
            <InfoRow icon={Settings} label="Languages"        value={profile?.languagesSpoken} />
            <div style={{ gridColumn: '1 / -1' }}>
              <InfoRow icon={null} label="Bio" value={profile?.bio || 'No bio added'} />
            </div>
            <InfoRow icon={MapPin}   label="Address"  value={profile?.address} />
            <InfoRow icon={MapPin}   label="City"     value={profile?.city} />
            <InfoRow icon={MapPin}   label="State"    value={profile?.state} />
            <InfoRow icon={MapPin}   label="Pincode"  value={profile?.pincode} />
            {profile?.latitude && profile?.longitude && (
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: T.success, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={12} strokeWidth={2} />GPS Coordinates
                </p>
                <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1rem', fontWeight: '700', color: T.success, margin: 0 }}>
                  {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
                </p>
              </div>
            )}
            <InfoRow icon={Briefcase} label="Jobs Completed" value={profile?.totalJobsCompleted || 0} />
            <div>
              <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: T.indigoMuted, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Star size={12} strokeWidth={2} />Avg. Rating
              </p>
              <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1.05rem', fontWeight: '600', color: T.indigoDeep, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {profile?.averageRating ? <><Star size={14} fill={T.indigo} color={T.indigo} />{profile.averageRating.toFixed(1)}</> : '—'}
              </p>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div>
            <Input label="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} icon={User} />
            <Input label="Phone Number" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} icon={Phone} />
            <TextArea label="Bio" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Input label="Experience Years" type="number" value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: e.target.value })} icon={Clock} />
              <Input label="Hourly Rate (₹)" type="number" value={formData.hourlyRate} onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })} icon={DollarSign} />
            </div>

            {/* Location Detection Card */}
            <div style={{
              background: T.successBg, border: `1px solid ${T.successBd}`,
              borderRadius: '2px', padding: '16px', marginBottom: '18px',
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <MapPin size={18} color={T.success} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.03em', color: T.success, margin: '0 0 5px' }}>Set Your Work Location</p>
                  <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1rem', fontWeight: '500', color: T.indigoText, margin: '0 0 12px', lineHeight: 1.6 }}>
                    Click below to automatically detect your location. This helps customers find you in their area!
                  </p>
                  <Button onClick={handleDetectLocation} loading={detectingLocation} variant="success" icon={MapPin} style={{ marginBottom: '12px' }}>
                    {detectingLocation ? 'Detecting…' : 'Detect My Location'}
                  </Button>
                  {formData.latitude && formData.longitude && (
                    <div style={{ background: T.ivory, border: `1px solid ${T.successBd}`, borderRadius: '2px', padding: '10px 14px' }}>
                      <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.68rem', fontWeight: '700', color: T.success, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} />Location Detected
                      </p>
                      <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.95rem', fontWeight: '600', color: T.success, margin: 0, lineHeight: 1.7 }}>
                        Lat: {formData.latitude.toFixed(6)}<br />Lng: {formData.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Input label="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} icon={MapPin} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
              <Input label="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              <Input label="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
              <Input label="Pincode" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
            </div>
            <Input label="Languages Spoken (comma separated)" value={formData.languagesSpoken} onChange={e => setFormData({ ...formData, languagesSpoken: e.target.value })} placeholder="e.g., Hindi, English, Punjabi" />

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button onClick={handleUpdate} loading={loading} icon={Save}>Save Changes</Button>
              <Button onClick={() => setEditing(false)} variant="outline" icon={X}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── Main Worker Dashboard ────────────────────────────────────────────────────
const WorkerDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try { const data = await workerApi.getDashboard(user.token); setDashboardData(data); }
    catch (e) { console.error('Failed to load dashboard', e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { setShowLogoutModal(false); logout(); };

  const tabs = [
    { id: 'dashboard',     label: 'Dashboard',     icon: Home },
    { id: 'profile',       label: 'Profile',        icon: User },
    { id: 'skills',        label: 'Skills',         icon: Wrench },
    { id: 'reviews',       label: 'Reviews',        icon: Star },
    { id: 'bookings', label: 'Bookings', icon: Briefcase },
    { id: 'chat',          label: 'Messages',       icon: MessageCircle, badge: dashboardData?.unreadMessages },
    { id: 'notifications', label: 'Notifications',  icon: Bell,          badge: dashboardData?.unreadNotifications },
  ];

  // Loading screen
  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <FontLoader />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(20%2C10%2C80%2C0.045)'/%3E%3Cpath d='M0 20h40M20 0v40' stroke='rgba(20%2C10%2C80%2C0.025)' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
      <Spinner sz={38} />
      <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.82rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.indigoMuted, position: 'relative' }}>Loading Dashboard…</p>
    </div>
  );

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: T.ivoryDeep, display: 'flex', flexDirection: 'column' }}>
      <FontLoader />
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />

      {/* ── Header ── */}
      <header style={{
        background: T.ivory,
        borderBottom: `2px solid ${T.indigo}`,
        boxShadow: `0 4px 24px ${T.shadowSoft}`,
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '68px' }}>
          <div>
            <h1 style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1.5rem', fontWeight: '700', color: T.indigo, margin: 0, letterSpacing: '0.02em', lineHeight: 1 }}>
              aapno<span style={{ color: 'rgba(26,16,80,0.45)' }}>kaam</span>
            </h1>
            <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.65rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.indigoMuted, margin: '2px 0 0' }}>
              Worker — Welcome, {dashboardData?.workerName}
            </p>
          </div>
          <Button onClick={() => setShowLogoutModal(true)} variant="outline" icon={LogOut}>Sign Out</Button>
        </div>
      </header>

      {/* ── Navigation Tabs ── */}
      <nav style={{
        background: T.ivory,
        borderBottom: `1px solid ${T.border}`,
        boxShadow: `0 2px 8px ${T.shadowSoft}`,
        flexShrink: 0,
        overflowX: 'auto',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'flex' }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={active ? 'ak-tab-active' : 'ak-tab'}
                style={{
                  padding: '14px 20px',
                  background: active ? T.indigoSubtle : 'transparent',
                  color: active ? T.indigo : T.indigoMuted,
                  border: 'none',
                  borderBottom: active ? `2px solid ${T.indigo}` : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  transition: 'color 0.15s, background 0.15s, border-color 0.15s',
                }}
              >
                <tab.icon size={15} strokeWidth={active ? 2 : 1.5} />
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: '8px', right: '6px',
                    background: T.error, color: T.ivory,
                    fontFamily: "'Open Sans', sans-serif",
                    fontSize: '0.58rem', fontWeight: '700',
                    borderRadius: '50%', width: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="ak-scroll" style={{ flex: 1, overflowY: 'auto', background: T.ivoryDeep }}>
        {/* Jali overlay */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(20%2C10%2C80%2C0.03)'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '32px 2rem 48px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardOverview token={user.token} dashboardData={dashboardData} onRefresh={loadDashboard} />}
              {activeTab === 'profile' && <ProfileSection token={user.token} onRefresh={loadDashboard} />}
              {activeTab === 'skills' && <WorkerSkillsSection token={user.token} />}
              {activeTab === 'reviews' && <WorkerReviewsSection token={user.token} />}
{activeTab === 'notifications' && <WorkerNotificationsSection token={user.token} />}
              {activeTab === 'chat' && <ChatSection user={user} token={user.token} />}
              {activeTab === 'bookings' && <WorkerBookingsSection token={user.token} />}
            
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;