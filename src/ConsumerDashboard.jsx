import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Heart, MessageCircle, Calendar, DollarSign, User,
  Bell, LogOut, X, Check, TrendingUp, Briefcase, Award, Home, Menu,
  CheckCircle2, XCircle, AlertCircle, Info, ShoppingBag, Clock, Phone,
  Mail, Eye, Plus, Settings, ChevronRight, Filter
} from 'lucide-react';
import WorkerSearchSection from './WorkerSearchSection';
import WorkerDetailModal from './WorkerDetailModal';
import BookingSection from './BookingSection';
import BookingDetailModal from './BookingDetailModal';
import CreateBookingModal from './CreateBookingModal';
import ChatSection from './ChatSection';
import NotificationPanel from './NotificationPanel';
import ProfileSection from './ProfileSection';
import FavoritesSection from './FavoritesSection';
import ReviewModal from './ReviewModal';
import { api } from './api';

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
};

const font = { fontFamily: "'Open Sans', sans-serif" };

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  PENDING:     { color: 'rgba(20,10,80,0.65)',  bg: 'rgba(20,10,80,0.07)',  label: 'Pending' },
  CONFIRMED:   { color: '#166534',              bg: 'rgba(22,101,52,0.08)', label: 'Confirmed' },
  IN_PROGRESS: { color: '#1d4ed8',              bg: 'rgba(29,78,216,0.08)', label: 'In Progress' },
  COMPLETED:   { color: '#166534',              bg: 'rgba(22,101,52,0.08)', label: 'Completed' },
  CANCELLED:   { color: '#b91c1c',              bg: 'rgba(185,28,28,0.07)', label: 'Cancelled' },
  REJECTED:    { color: 'rgba(20,10,80,0.40)',  bg: 'rgba(20,10,80,0.05)',  label: 'Rejected' },
};

// ─── Font Loader ──────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    @keyframes ak-spin { to { transform: rotate(360deg); } }
    .ak-spin { animation: ak-spin 0.8s linear infinite; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: ${T.ivoryDeep}; }
    ::-webkit-scrollbar-thumb { background: rgba(26,16,80,0.18); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(26,16,80,0.32); }
    .ak-nav-btn:hover { color: ${T.indigo} !important; background: ${T.indigoSubtle} !important; border-color: ${T.border} !important; }
    .ak-card-hover:hover { border-color: rgba(26,16,80,0.3) !important; box-shadow: 0 6px 28px ${T.shadow} !important; }
    .ak-worker-card:hover { border-color: ${T.indigo} !important; }
    .ak-booking-card:hover { border-color: ${T.indigo} !important; }
    .ak-bell:hover { border-color: ${T.indigo} !important; color: ${T.indigo} !important; }
    .ak-collapse:hover { color: ${T.error} !important; }
    .ak-expand:hover { background: ${T.ivoryDeep} !important; }
    .ak-view-all:hover { color: ${T.indigoHover} !important; }
    .ak-tile:hover { border-color: ${T.indigo} !important; background: ${T.indigoSubtle} !important; }
    .ak-tile:hover .ak-tile-icon { color: ${T.indigo} !important; }
    .ak-btn-view:hover { border-color: ${T.indigo} !important; color: ${T.indigo} !important; }
    .ak-btn-book:hover { opacity: 0.85 !important; }
    .ak-solid:hover:not(:disabled) { background: ${T.indigoHover} !important; }
    .ak-ghost:hover { background: ${T.indigoSubtle} !important; border-color: ${T.indigo} !important; }
    .ak-danger:hover { background: ${T.errorBg} !important; }
  `}</style>
);

// ─── Ornament ─────────────────────────────────────────────────────────────────
const Ornament = () => (
  <div style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.25 }}>
    <svg width="48" height="10" viewBox="0 0 48 10" fill="none">
      <line x1="0" y1="5" x2="16" y2="5" stroke={T.indigo} strokeWidth="0.8"/>
      <circle cx="20" cy="5" r="1.5" fill={T.indigo}/>
      <circle cx="24" cy="5" r="2.5" fill="none" stroke={T.indigo} strokeWidth="0.8"/>
      <circle cx="28" cy="5" r="1.5" fill={T.indigo}/>
      <line x1="32" y1="5" x2="48" y2="5" stroke={T.indigo} strokeWidth="0.8"/>
    </svg>
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ sz = 16, ivory = false }) => (
  <svg className="ak-spin" width={sz} height={sz} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={ivory ? T.ivory : T.indigo} strokeWidth="3" opacity="0.15"/>
    <path fill={ivory ? T.ivory : T.indigo} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.8"/>
  </svg>
);

// ─── HR ───────────────────────────────────────────────────────────────────────
const HR = ({ my = 16 }) => <div style={{ borderTop: `1px solid ${T.border}`, margin: `${my}px 0` }} />;

// ─── Alert strip ──────────────────────────────────────────────────────────────
const MAlert = ({ type, message, onClose }) => {
  const cfg = {
    success: { color: T.success,  bg: T.successBg, Icon: CheckCircle2 },
    error:   { color: T.error,    bg: T.errorBg,   Icon: XCircle },
    warning: { color: T.indigoText, bg: T.indigoSubtle, Icon: AlertCircle },
    info:    { color: T.indigo,   bg: T.indigoSubtle, Icon: Info },
  };
  const { color, bg, Icon: AlertIcon } = cfg[type] || cfg.info;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      style={{
        borderLeft: `3px solid ${color}`, background: bg,
        color, padding: '9px 13px', marginBottom: '14px',
        fontSize: '0.8rem', ...font, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertIcon size={16} strokeWidth={2} /> {message}
      </span>
      {onClose && (
        <button onClick={onClose} style={{ color, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0, opacity: 0.7 }}>
          <X size={15} />
        </button>
      )}
    </motion.div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const FCard = ({ children, style = {}, onClick, hover = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={hover ? 'ak-card-hover' : ''}
    style={{
      background: T.ivory,
      border: `1px solid ${T.border}`,
      borderRadius: '3px',
      padding: '20px',
      boxShadow: `0 3px 16px ${T.shadowSoft}`,
      transition: 'border-color 0.18s, box-shadow 0.18s',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </motion.div>
);

// ─── Solid button ─────────────────────────────────────────────────────────────
const SolidBtn = ({ children, loading, onClick, icon: Icon, style: extraStyle = {}, disabled }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className="ak-solid"
    style={{
      padding: '9px 18px',
      background: (loading || disabled) ? 'rgba(26,16,80,0.5)' : T.indigo,
      color: T.ivory,
      border: 'none',
      borderRadius: '2px',
      ...font,
      fontWeight: 700,
      fontSize: '0.75rem',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      transition: 'background 0.18s',
      boxShadow: `0 3px 12px ${T.shadow}`,
      ...extraStyle,
    }}
  >
    {loading
      ? <><Spinner sz={13} ivory /> Loading…</>
      : <>{Icon && <Icon size={14} strokeWidth={2} />}{children}</>}
  </button>
);

// ─── Ghost button ─────────────────────────────────────────────────────────────
const GhostBtn = ({ children, onClick, icon: Icon, style: extraStyle = {} }) => (
  <button
    onClick={onClick}
    className="ak-ghost"
    style={{
      padding: '9px 18px',
      background: 'transparent',
      color: T.indigo,
      border: `1px solid ${T.borderStrong}`,
      borderRadius: '2px',
      ...font,
      fontWeight: 700,
      fontSize: '0.75rem',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      transition: 'background 0.15s, border-color 0.15s',
      ...extraStyle,
    }}
  >
    {Icon && <Icon size={14} strokeWidth={2} />}{children}
  </button>
);

// ─── Danger button ────────────────────────────────────────────────────────────
const DangerBtn = ({ children, onClick, icon: Icon, style: extraStyle = {} }) => (
  <button
    onClick={onClick}
    className="ak-danger"
    style={{
      padding: '9px 18px',
      background: 'transparent',
      color: T.error,
      border: `1px solid ${T.errorBd}`,
      borderRadius: '2px',
      ...font,
      fontWeight: 700,
      fontSize: '0.75rem',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      transition: 'background 0.15s',
      ...extraStyle,
    }}
  >
    {Icon && <Icon size={14} strokeWidth={2} />}{children}
  </button>
);

// ─── Section heading ──────────────────────────────────────────────────────────
const SHeading = ({ icon: Icon, children, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
    <h2 style={{
      color: T.indigoDeep,
      fontWeight: 700,
      fontSize: '0.82rem',
      margin: 0,
      ...font,
      display: 'flex', alignItems: 'center', gap: '8px',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
    }}>
      {Icon && <Icon size={16} color={T.indigo} strokeWidth={1.5} />}
      {children}
    </h2>
    {action}
  </div>
);

// ─── Status pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const cfg = STATUS[status] || STATUS.PENDING;
  return (
    <span style={{
      padding: '3px 10px',
      fontSize: '0.68rem',
      fontWeight: 700,
      ...font,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: cfg.color,
      border: `1px solid ${cfg.color}`,
      background: cfg.bg,
      borderRadius: '2px',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
};

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
            background: T.ivoryMid,
            border: `1px solid ${T.borderStrong}`,
            borderTop: `3px solid ${T.indigo}`,
            borderRadius: '3px',
            padding: '40px 36px',
            width: '100%', maxWidth: '360px',
            textAlign: 'center',
            boxShadow: `0 16px 48px ${T.shadow}`,
          }}
        >
          <div style={{
            width: '50px', height: '50px', margin: '0 auto 14px',
            border: `1px solid ${T.borderStrong}`,
            background: T.indigoSubtle,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.indigo,
          }}>
            <LogOut size={20} strokeWidth={1.5} />
          </div>
          <h3 style={{ color: T.indigoDeep, fontWeight: 700, fontSize: '1.1rem', margin: '0 0 7px', ...font }}>Confirm Logout</h3>
          <p style={{ color: T.indigoMuted, fontSize: '0.9rem', margin: '0 0 22px', ...font, lineHeight: 1.6 }}>
            Are you sure you want to sign out?
          </p>
          <HR my={18} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <GhostBtn onClick={onClose} icon={X} style={{ flex: 1, justifyContent: 'center' }}>Cancel</GhostBtn>
            <DangerBtn onClick={onConfirm} icon={LogOut} style={{ flex: 1, justifyContent: 'center' }}>Sign Out</DangerBtn>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon }) => (
  <FCard>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{
          color: T.indigoMuted,
          fontSize: '0.68rem',
          fontWeight: 700,
          margin: '0 0 6px',
          ...font,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>{title}</p>
        <p style={{
          color: T.indigoDeep,
          fontSize: '1.65rem',
          fontWeight: 800,
          margin: 0,
          ...font,
          lineHeight: 1,
        }}>{value}</p>
      </div>
      <div style={{
        width: '44px', height: '44px',
        border: `1px solid ${T.border}`,
        background: T.indigoSubtle,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.indigo, flexShrink: 0,
      }}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
    </div>
  </FCard>
);

// ─── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onClick }) => (
  <div
    onClick={onClick}
    className="ak-booking-card"
    style={{
      border: `1px solid ${T.border}`,
      background: T.ivoryMid,
      borderRadius: '2px',
      padding: '14px 16px',
      cursor: 'pointer',
      transition: 'border-color 0.15s',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
      <h3 style={{ color: T.indigoDeep, fontWeight: 700, fontSize: '0.88rem', margin: 0, ...font }}>{booking.serviceTitle}</h3>
      <StatusPill status={booking.status} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
      {[
        { Icon: User,       val: booking.workerName,                                         bold: false },
        { Icon: Calendar,   val: new Date(booking.scheduledDate).toLocaleDateString(),        bold: false },
        { Icon: DollarSign, val: `₹${booking.estimatedCost}`,                                bold: true  },
      ].map(({ Icon, val, bold }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', ...font }}>
          <Icon size={13} color={T.indigo} strokeWidth={1.5} />
          <span style={{ color: bold ? T.indigo : T.indigoMuted, fontWeight: bold ? 700 : 500 }}>{val}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Featured Worker Card ─────────────────────────────────────────────────────
const FeaturedWorkerCard = ({ worker, onViewDetails, onBook }) => (
  <div
    className="ak-worker-card"
    style={{
      border: `1px solid ${T.border}`,
      background: T.ivoryMid,
      borderRadius: '2px',
      transition: 'border-color 0.15s',
      overflow: 'hidden',
    }}
  >
    {/* Avatar strip — always User icon, no media storage */}
    <div style={{
      height: '88px',
      background: T.ivoryDeep,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        background: T.indigoSubtle,
        border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.indigoMuted,
      }}>
        <User size={24} strokeWidth={1.5} />
      </div>

      {worker.isVerified && (
        <span style={{
          position: 'absolute', top: 8, left: 8,
          border: `1px solid ${T.successBd}`,
          background: T.successBg,
          color: T.success,
          fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', ...font,
          letterSpacing: '0.05em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <CheckCircle2 size={10} strokeWidth={2.5} /> Verified
        </span>
      )}
    </div>

    <div style={{ padding: '12px 14px' }}>
      <p style={{
        color: T.indigoDeep, fontWeight: 700, fontSize: '0.85rem',
        margin: '0 0 3px', ...font,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>{worker.fullName}</p>
      <p style={{
        color: T.indigoMuted, fontSize: '0.78rem', margin: '0 0 10px', ...font,
        display: 'flex', alignItems: 'center', gap: '5px',
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>
        <Briefcase size={11} strokeWidth={1.5} /> {worker.primarySkill}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: T.indigo, fontWeight: 700, ...font }}>
          <Star size={12} fill={T.indigo} color={T.indigo} /> {worker.averageRating?.toFixed(1)}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: T.indigoMuted, ...font }}>
          <MapPin size={11} strokeWidth={1.5} /> {worker.city}
        </span>
      </div>

      <HR my={10} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '0.9rem', ...font }}>₹{worker.hourlyRate}/hr</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={e => { e.stopPropagation(); onViewDetails(); }}
            className="ak-btn-view"
            style={{
              padding: '5px 10px',
              border: `1px solid ${T.border}`,
              background: 'transparent',
              color: T.indigoMuted,
              fontSize: '0.72rem', fontWeight: 600, ...font,
              cursor: 'pointer', borderRadius: '2px',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            <Eye size={11} strokeWidth={1.5} /> View
          </button>
          <button
            onClick={e => { e.stopPropagation(); onBook(); }}
            className="ak-btn-book"
            style={{
              padding: '5px 10px',
              border: `1px solid ${T.indigo}`,
              background: T.indigo,
              color: T.ivory,
              fontSize: '0.72rem', fontWeight: 700, ...font,
              cursor: 'pointer', borderRadius: '2px',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'opacity 0.15s',
            }}
          >
            <ShoppingBag size={11} strokeWidth={1.5} /> Book
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Quick Action Tile ────────────────────────────────────────────────────────
const QuickTile = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="ak-tile"
    style={{
      width: '100%',
      padding: '20px 12px',
      border: `1px solid ${T.border}`,
      background: T.ivoryMid,
      borderRadius: '2px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'border-color 0.15s, background 0.15s',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
    }}
  >
    <Icon size={26} color={T.indigo} strokeWidth={1.5} className="ak-tile-icon" />
    <span style={{ color: T.indigoDeep, fontWeight: 700, fontSize: '0.8rem', ...font }}>{label}</span>
  </button>
);

// ─── Navigation items ─────────────────────────────────────────────────────────
const NAV = [
  { id: 'home',      label: 'Dashboard',    icon: Home },
  { id: 'search',    label: 'Find Workers',  icon: Search },
  { id: 'bookings',  label: 'My Bookings',   icon: Calendar },
  { id: 'favorites', label: 'Favorites',     icon: Heart },
  { id: 'messages',  label: 'Messages',      icon: MessageCircle },
  { id: 'profile',   label: 'Profile',       icon: User },
];

// ─── Main ConsumerDashboard ───────────────────────────────────────────────────
const ConsumerDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab]           = useState('home');
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [dashboardData, setDashboardData]   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal]     = useState(false);

  const [selectedWorker, setSelectedWorker]       = useState(null);
  const [selectedBooking, setSelectedBooking]     = useState(null);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [showReviewModal, setShowReviewModal]     = useState(false);
  const [bookingToReview, setBookingToReview]     = useState(null);

  useEffect(() => { loadDashboardData(); loadNotifications(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const r = await api.get('/consumer/dashboard');
      setDashboardData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadNotifications = async () => {
    try {
      const r = await api.get('/notifications?unreadOnly=false&page=0&size=10');
      setNotifications(r.data);
      setUnreadCount(r.data.filter(n => !n.isRead).length);
    } catch (e) { console.error(e); }
  };

  const handleBookWorker      = (w) => { setSelectedWorker(w); setShowCreateBooking(true); };
  const handleBookingCreated  = () => { setShowCreateBooking(false); setSelectedWorker(null); loadDashboardData(); setActiveTab('bookings'); };
  const handleReviewBooking   = (b) => { setBookingToReview(b); setShowReviewModal(true); };
  const handleReviewSubmitted = () => { setShowReviewModal(false); setBookingToReview(null); loadDashboardData(); };
  const handleLogout          = () => { setShowLogoutModal(false); logout(); };
  const markRead    = async (id) => { try { await api.put(`/notifications/${id}/read`); loadNotifications(); } catch {} };
  const markAllRead = async ()   => { try { await api.put('/notifications/read-all');    loadNotifications(); } catch {} };

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: T.ivory,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
    }}>
      <FontLoader />
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(20%2C10%2C80%2C0.045)'/%3E%3Cpath d='M0 20h40M20 0v40' stroke='rgba(20%2C10%2C80%2C0.025)' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <Spinner sz={36} />
      <p style={{ color: T.indigoMuted, fontSize: '0.8rem', ...font, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', position: 'relative' }}>
        Loading Dashboard…
      </p>
    </div>
  );

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: T.ivoryDeep, ...font }}>
      <FontLoader />

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header style={{
        background: T.ivory,
        borderBottom: `2px solid ${T.indigo}`,
        boxShadow: `0 4px 20px ${T.shadowSoft}`,
        position: 'sticky', top: 0, zIndex: 40,
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Logo */}
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em', lineHeight: 1, ...font }}>
              <span style={{ color: T.indigo }}>aapno</span>
              <span style={{ color: 'rgba(26,16,80,0.45)' }}>kaam</span>
            </h1>
            <p style={{ color: T.indigoMuted, fontSize: '0.68rem', margin: '2px 0 0', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', ...font }}>
              Welcome, {dashboardData?.consumerName || user?.username}
            </p>
          </div>
        </div>

        {/* Header right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="ak-bell"
              style={{
                background: 'none',
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                cursor: 'pointer',
                color: T.indigoMuted,
                padding: '8px',
                display: 'flex', alignItems: 'center',
                transition: 'border-color 0.15s, color 0.15s',
              }}
            >
              <Bell size={18} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  background: T.error, color: T.ivory,
                  fontSize: '0.6rem', fontWeight: 700,
                  width: '17px', height: '17px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${T.ivory}`,
                  ...font,
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
                onMarkAsRead={markRead}
                onMarkAllAsRead={markAllRead}
              />
            )}
          </div>

          <DangerBtn onClick={() => setShowLogoutModal(true)} icon={LogOut}>Logout</DangerBtn>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside style={{
          width: sidebarOpen ? '220px' : '0',
          minWidth: sidebarOpen ? '220px' : '0',
          overflow: 'hidden',
          background: T.ivory,
          borderRight: `1px solid ${T.border}`,
          transition: 'min-width 0.22s, width 0.22s',
          flexShrink: 0,
          boxShadow: sidebarOpen ? `4px 0 16px ${T.shadowSoft}` : 'none',
        }}>
          {/* Top accent line continues from header border */}
          <div style={{ borderTop: `2px solid ${T.indigo}`, marginBottom: '6px' }} />

          <nav style={{ padding: '8px 10px' }}>
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setSidebarOpen(window.innerWidth >= 1024); }}
                  className={active ? '' : 'ak-nav-btn'}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', marginBottom: '3px',
                    background: active ? T.indigoSubtle : 'transparent',
                    border: active ? `1px solid ${T.border}` : '1px solid transparent',
                    borderLeft: active ? `3px solid ${T.indigo}` : '3px solid transparent',
                    color: active ? T.indigo : T.indigoMuted,
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.8rem',
                    ...font,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    borderRadius: '2px',
                  }}
                >
                  <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                  <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
                  {active && <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                </button>
              );
            })}

            <div style={{ marginTop: '16px', borderTop: `1px solid ${T.border}`, paddingTop: '10px' }}>
              <button
                onClick={() => setSidebarOpen(false)}
                className="ak-collapse"
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: T.indigoMuted,
                  fontSize: '0.78rem',
                  ...font,
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  borderRadius: '2px',
                }}
              >
                <X size={14} strokeWidth={1.5} /> Collapse Sidebar
              </button>
            </div>
          </nav>
        </aside>

        {/* Expand tab when sidebar is collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="ak-expand"
            style={{
              position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)',
              background: T.ivory,
              border: `1px solid ${T.border}`,
              borderLeft: 'none',
              borderRadius: '0 2px 2px 0',
              color: T.indigo,
              padding: '12px 6px',
              cursor: 'pointer', zIndex: 30,
              transition: 'background 0.15s',
              boxShadow: `3px 0 12px ${T.shadowSoft}`,
            }}
          >
            <Menu size={15} strokeWidth={1.5} />
          </button>
        )}

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px', background: T.ivoryDeep, position: 'relative' }}>
          {/* Jali overlay */}
          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(20%2C10%2C80%2C0.03)'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }}
              >

                {/* ─── HOME TAB ────────────────────────────────────────────── */}
                {activeTab === 'home' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
                      <StatCard title="Total Bookings" value={dashboardData?.stats?.totalBookings || 0}                        icon={Briefcase} />
                      <StatCard title="Upcoming"       value={dashboardData?.upcomingBookings || 0}                             icon={Calendar} />
                      <StatCard title="Completed"      value={dashboardData?.stats?.completedBookings || 0}                     icon={Check} />
                      <StatCard title="Total Spent"    value={`₹${dashboardData?.stats?.totalSpent?.toFixed(2) || '0.00'}`}    icon={DollarSign} />
                    </div>

                    {/* Quick Actions */}
                    <FCard>
                      <SHeading icon={TrendingUp}>Quick Actions</SHeading>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                        <QuickTile icon={Search}        label="Find Workers"  onClick={() => setActiveTab('search')} />
                        <QuickTile icon={Calendar}      label="View Bookings" onClick={() => setActiveTab('bookings')} />
                        <QuickTile icon={MessageCircle} label="Messages"      onClick={() => setActiveTab('messages')} />
                      </div>
                    </FCard>

                    {/* Featured Workers */}
                    {dashboardData?.featuredWorkers?.length > 0 && (
                      <FCard>
                        <SHeading
                          icon={Award}
                          action={
                            <button
                              onClick={() => setActiveTab('search')}
                              className="ak-view-all"
                              style={{
                                color: T.indigoMuted, background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '0.78rem', fontWeight: 600, ...font,
                                display: 'flex', alignItems: 'center', gap: '4px',
                                transition: 'color 0.15s',
                              }}
                            >
                              View All <ChevronRight size={13} />
                            </button>
                          }
                        >
                          Featured Workers
                        </SHeading>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
                          {dashboardData.featuredWorkers.map(w => (
                            <FeaturedWorkerCard
                              key={w.id} worker={w}
                              onViewDetails={() => setSelectedWorker(w)}
                              onBook={() => handleBookWorker(w)}
                            />
                          ))}
                        </div>
                      </FCard>
                    )}

                    {/* Recent Bookings */}
                    <FCard>
                      <SHeading
                        icon={Calendar}
                        action={
                          <button
                            onClick={() => setActiveTab('bookings')}
                            className="ak-view-all"
                            style={{
                              color: T.indigoMuted, background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: '0.78rem', fontWeight: 600, ...font,
                              display: 'flex', alignItems: 'center', gap: '4px',
                              transition: 'color 0.15s',
                            }}
                          >
                            View All <ChevronRight size={13} />
                          </button>
                        }
                      >
                        Recent Bookings
                      </SHeading>

                      {dashboardData?.recentBookings?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {dashboardData.recentBookings.map(b => (
                            <BookingCard key={b.id} booking={b} onClick={() => setSelectedBooking(b)} />
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: T.indigoMuted }}>
                          <Calendar size={38} color={T.border} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
                          <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: '0.88rem', ...font, color: T.indigoMuted }}>No bookings yet</p>
                          <button
                            onClick={() => setActiveTab('search')}
                            style={{
                              color: T.indigo, background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: '0.8rem', fontWeight: 700, ...font,
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                            }}
                          >
                            <Search size={13} strokeWidth={2} /> Find a worker
                          </button>
                        </div>
                      )}
                    </FCard>

                  </div>
                )}

                {activeTab === 'search' && (
                  <WorkerSearchSection
                    onWorkerSelect={w => setSelectedWorker(w)}
                    onBookWorker={handleBookWorker}
                  />
                )}

                {activeTab === 'bookings' && (
                  <BookingSection
                    onViewBooking={b => setSelectedBooking(b)}
                    onReviewBooking={handleReviewBooking}
                    onRefresh={loadDashboardData}
                  />
                )}

                {activeTab === 'favorites' && (
                  <FavoritesSection
                    onWorkerSelect={w => setSelectedWorker(w)}
                    onBookWorker={handleBookWorker}
                  />
                )}

                {activeTab === 'messages' && <ChatSection user={user} />}

                {activeTab === 'profile' && <ProfileSection onUpdate={loadDashboardData} />}

              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      {selectedWorker && !showCreateBooking && (
        <WorkerDetailModal
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
          onBook={() => setShowCreateBooking(true)}
        />
      )}

      {showCreateBooking && selectedWorker && (
        <CreateBookingModal
          worker={selectedWorker}
          onClose={() => { setShowCreateBooking(false); setSelectedWorker(null); }}
          onSuccess={handleBookingCreated}
        />
      )}

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRefresh={loadDashboardData}
          onReview={handleReviewBooking}
        />
      )}

      {showReviewModal && bookingToReview && (
        <ReviewModal
          booking={bookingToReview}
          onClose={() => { setShowReviewModal(false); setBookingToReview(null); }}
          onSuccess={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default ConsumerDashboard;