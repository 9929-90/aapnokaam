import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight,
  ChevronLeft, MapPin, DollarSign, Calendar, User, Phone, Play,
  Check, X, Filter, RefreshCw, Eye, Star
} from 'lucide-react';

// ─── Theme (matches WorkerDashboard) ─────────────────────────────────────────
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
  orange:       '#c2410c',
  orangeBg:     'rgba(194, 65, 12, 0.08)',
  orangeBd:     'rgba(194, 65, 12, 0.3)',
};

const font = { fontFamily: "'Open Sans', sans-serif" };

const API_BASE = 'http://localhost:8081/api';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING:     { label: 'Pending',     color: T.warn,    bg: T.warnBg,    bd: T.warnBd,    icon: Clock },
  CONFIRMED:   { label: 'Confirmed',   color: T.indigo,  bg: T.indigoSubtle, bd: T.border, icon: CheckCircle2 },
  IN_PROGRESS: { label: 'In Progress', color: T.orange,  bg: T.orangeBg,  bd: T.orangeBd,  icon: Play },
  COMPLETED:   { label: 'Completed',   color: T.success, bg: T.successBg, bd: T.successBd, icon: Check },
  CANCELLED:   { label: 'Cancelled',   color: T.error,   bg: T.errorBg,   bd: T.errorBd,   icon: XCircle },
  REJECTED:    { label: 'Rejected',    color: T.error,   bg: T.errorBg,   bd: T.errorBd,   icon: XCircle },
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const Spinner = ({ sz = 18, ivory = false }) => (
  <svg style={{ animation: 'ak-spin 0.85s linear infinite' }} width={sz} height={sz} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={ivory ? T.ivory : T.indigo} strokeWidth="3" opacity="0.15"/>
    <path fill={ivory ? T.ivory : T.indigo} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.8"/>
  </svg>
);

const Badge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.PENDING;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px',
      background: cfg.bg,
      border: `1px solid ${cfg.bd}`,
      borderRadius: '2px',
      color: cfg.color,
      ...font,
      fontSize: '0.65rem',
      fontWeight: '700',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}>
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
};

const Btn = ({ children, onClick, variant = 'primary', loading, disabled, icon: Icon, small }) => {
  const styles = {
    primary:  { bg: T.indigo,   color: T.ivory,    border: 'none' },
    success:  { bg: T.success,  color: T.ivory,    border: 'none' },
    danger:   { bg: T.error,    color: T.ivory,    border: 'none' },
    outline:  { bg: 'transparent', color: T.indigoText, border: `1px solid ${T.borderStrong}` },
    ghost:    { bg: T.indigoSubtle, color: T.indigoText, border: `1px solid ${T.border}` },
    orange:   { bg: T.orange,   color: T.ivory,    border: 'none' },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: small ? '6px 12px' : '8px 16px',
        background: s.bg,
        border: s.border,
        borderRadius: '2px',
        color: s.color,
        ...font,
        fontSize: small ? '0.67rem' : '0.72rem',
        fontWeight: '700',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.6 : 1,
        transition: 'opacity 0.15s, background 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {loading
        ? <><Spinner sz={12} ivory={['primary','success','danger','orange'].includes(variant)} />Loading…</>
        : <>{Icon && <Icon size={13} strokeWidth={2} />}{children}</>
      }
    </button>
  );
};

const HR = () => <div style={{ borderTop: `1px solid ${T.border}`, margin: '16px 0' }} />;

const InfoPill = ({ icon: Icon, text }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    color: T.indigoMuted,
    ...font, fontSize: '0.78rem', fontWeight: '500',
  }}>
    <Icon size={13} strokeWidth={1.5} />{text}
  </span>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(20,10,80,0.48)', backdropFilter: 'blur(3px)',
      padding: '16px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        style={{
          background: T.ivory,
          border: `1px solid ${T.borderStrong}`,
          borderTop: `3px solid ${T.indigo}`,
          borderRadius: '3px',
          padding: '28px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: `0 20px 60px ${T.shadow}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ ...font, fontSize: '0.9rem', fontWeight: '700', color: T.indigoDeep, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.indigoMuted, padding: '4px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

// ─── Booking Detail Modal ─────────────────────────────────────────────────────
const BookingDetailModal = ({ booking, onClose, onAction, actionLoading }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [actualDuration, setActualDuration] = useState(booking?.estimatedDuration || '');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);

  if (!booking) return null;

  const status = booking.status;
  const canStart    = status === 'CONFIRMED';
  const canComplete = status === 'IN_PROGRESS';
  const canReject   = status === 'CONFIRMED';
  const canCancel   = !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(status);

  const Row = ({ label, value, icon: Icon }) => (
    <div style={{ marginBottom: '12px' }}>
      <p style={{ ...font, fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: T.indigoMuted, margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {Icon && <Icon size={11} />}{label}
      </p>
      <p style={{ ...font, fontSize: '0.92rem', fontWeight: '600', color: T.indigoDeep, margin: 0 }}>{value || '—'}</p>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title={`Booking #${booking.id}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Badge status={status} />
        <span style={{ ...font, fontSize: '0.72rem', color: T.indigoMuted, fontWeight: '500' }}>
          Payment: {booking.paymentStatus}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <Row label="Service" value={booking.serviceTitle} icon={Briefcase} />
        <Row label="Category" value={booking.categoryName} icon={Star} />
        <Row label="Customer" value={booking.consumerName} icon={User} />
        <Row label="Phone" value={booking.consumerPhone} icon={Phone} />
        <Row label="Date" value={booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} icon={Calendar} />
        <Row label="Time" value={booking.scheduledTime ? new Date(booking.scheduledTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'} icon={Clock} />
        <Row label="Duration" value={`${booking.estimatedDuration} hrs`} icon={Clock} />
        <Row label="Hourly Rate" value={`₹${booking.hourlyRate}`} icon={DollarSign} />
        <Row label="Estimated Cost" value={`₹${booking.estimatedCost}`} icon={DollarSign} />
        {booking.actualCost && <Row label="Actual Cost" value={`₹${booking.actualCost}`} icon={DollarSign} />}
      </div>

      <div style={{ background: T.ivoryMid, border: `1px solid ${T.border}`, borderRadius: '2px', padding: '12px', marginBottom: '16px' }}>
        <p style={{ ...font, fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: T.indigoMuted, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={11} />Location
        </p>
        <p style={{ ...font, fontSize: '0.88rem', fontWeight: '600', color: T.indigoDeep, margin: 0 }}>
          {booking.address}, {booking.city}, {booking.state} — {booking.pincode}
        </p>
      </div>

      {booking.serviceDescription && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ ...font, fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: T.indigoMuted, margin: '0 0 4px' }}>Description</p>
          <p style={{ ...font, fontSize: '0.88rem', fontWeight: '500', color: T.indigoText, margin: 0, lineHeight: 1.6 }}>{booking.serviceDescription}</p>
        </div>
      )}

      <HR />

      {/* Complete form */}
      {canComplete && (
        <div style={{ marginBottom: '16px', background: T.successBg, border: `1px solid ${T.successBd}`, borderRadius: '2px', padding: '14px' }}>
          <p style={{ ...font, fontSize: '0.72rem', fontWeight: '700', color: T.success, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mark Job Complete
          </p>
          <label style={{ ...font, fontSize: '0.68rem', fontWeight: '700', color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
            Actual Duration (hrs)
          </label>
          <input
            type="number"
            min="1" max="24"
            value={actualDuration}
            onChange={e => setActualDuration(e.target.value)}
            style={{
              width: '120px', padding: '8px 12px',
              background: T.ivory, border: `1px solid ${T.successBd}`,
              borderRadius: '2px', color: T.indigoDeep,
              ...font, fontSize: '0.88rem', fontWeight: '600',
              outline: 'none', marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          />
          <div>
            <Btn
              variant="success"
              icon={Check}
              loading={actionLoading === 'complete'}
              onClick={() => onAction('complete', booking.id, { actualDuration: parseInt(actualDuration) })}
            >
              Mark as Completed
            </Btn>
          </div>
        </div>
      )}

      {/* Start button */}
      {canStart && !showRejectForm && (
        <div style={{ marginBottom: '12px' }}>
          <Btn
            variant="orange"
            icon={Play}
            loading={actionLoading === 'start'}
            onClick={() => onAction('start', booking.id)}
          >
            Start Work
          </Btn>
        </div>
      )}

      {/* Reject form */}
      {canReject && (
        <div style={{ marginBottom: '12px' }}>
          {!showRejectForm ? (
            <Btn variant="outline" icon={XCircle} onClick={() => setShowRejectForm(true)}>
              Reject Booking
            </Btn>
          ) : (
            <div style={{ background: T.errorBg, border: `1px solid ${T.errorBd}`, borderRadius: '2px', padding: '14px' }}>
              <p style={{ ...font, fontSize: '0.72rem', fontWeight: '700', color: T.error, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reject Booking</p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
                style={{
                  width: '100%', padding: '8px 12px',
                  background: T.ivory, border: `1px solid ${T.errorBd}`,
                  borderRadius: '2px', color: T.indigoDeep,
                  ...font, fontSize: '0.88rem', fontWeight: '500',
                  outline: 'none', resize: 'vertical', marginBottom: '10px',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Btn
                  variant="danger"
                  icon={XCircle}
                  loading={actionLoading === 'reject'}
                  disabled={!rejectReason.trim()}
                  onClick={() => onAction('reject', booking.id, { reason: rejectReason })}
                >
                  Confirm Reject
                </Btn>
                <Btn variant="ghost" onClick={() => setShowRejectForm(false)}>Cancel</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel form */}
      {canCancel && (
        <div>
          {!showCancelForm ? (
            <Btn variant="ghost" icon={X} small onClick={() => setShowCancelForm(true)}>
              Cancel Booking
            </Btn>
          ) : (
            <div style={{ background: T.warnBg, border: `1px solid ${T.warnBd}`, borderRadius: '2px', padding: '14px', marginTop: '10px' }}>
              <p style={{ ...font, fontSize: '0.72rem', fontWeight: '700', color: T.warn, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cancel Booking</p>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={3}
                style={{
                  width: '100%', padding: '8px 12px',
                  background: T.ivory, border: `1px solid ${T.warnBd}`,
                  borderRadius: '2px', color: T.indigoDeep,
                  ...font, fontSize: '0.88rem', fontWeight: '500',
                  outline: 'none', resize: 'vertical', marginBottom: '10px',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Btn
                  variant="danger"
                  icon={X}
                  loading={actionLoading === 'cancel'}
                  disabled={!cancelReason.trim()}
                  onClick={() => onAction('cancel', booking.id, { reason: cancelReason })}
                >
                  Confirm Cancel
                </Btn>
                <Btn variant="ghost" onClick={() => setShowCancelForm(false)}>Back</Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

// ─── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onViewDetails }) => {
  const cfg = STATUS_CFG[booking.status] || STATUS_CFG.PENDING;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: `0 8px 32px ${T.shadow}` }}
      onClick={() => onViewDetails(booking)}
      style={{
        background: T.ivory,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: '3px',
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: `0 2px 12px ${T.shadowSoft}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...font, fontSize: '0.68rem', fontWeight: '700', color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
            #{booking.id} · {booking.categoryName}
          </p>
          <h3 style={{ ...font, fontSize: '0.95rem', fontWeight: '700', color: T.indigoDeep, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {booking.serviceTitle}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
          <Badge status={booking.status} />
          <ChevronRight size={16} color={T.indigoMuted} />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
        <InfoPill icon={User} text={booking.workerName} />
        <InfoPill icon={Calendar} text={booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
        <InfoPill icon={Clock} text={booking.scheduledTime ? new Date(booking.scheduledTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'} />
        <InfoPill icon={Clock} text={`${booking.estimatedDuration} hrs`} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <DollarSign size={13} color={T.indigo} strokeWidth={1.5} />
          <span style={{ ...font, fontSize: '1.05rem', fontWeight: '800', color: T.indigo }}>₹{booking.estimatedCost}</span>
        </div>
        <span style={{ ...font, fontSize: '0.65rem', fontWeight: '600', color: T.indigoMuted }}>
          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN') : ''}
        </span>
      </div>

      {/* Quick action hint */}
      {booking.status === 'CONFIRMED' && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Play size={12} color={T.orange} strokeWidth={2.5} />
          <span style={{ ...font, fontSize: '0.67rem', fontWeight: '700', color: T.orange, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ready to start — tap to manage
          </span>
        </div>
      )}
      {booking.status === 'IN_PROGRESS' && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Check size={12} color={T.success} strokeWidth={2.5} />
          <span style={{ ...font, fontSize: '0.67rem', fontWeight: '700', color: T.success, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Work in progress — tap to complete
          </span>
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WorkerBookingsSection = ({ token }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [alert, setAlert] = useState(null);

  useEffect(() => { loadBookings(); }, [statusFilter, page]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 10 });
      if (statusFilter) params.append('status', statusFilter);
      const r = await fetch(`${API_BASE}/worker/bookings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      setBookings(data.bookings || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch {
      setAlert({ type: 'error', message: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, bookingId, payload = {}) => {
    setActionLoading(action);
    try {
      let url = `${API_BASE}/worker/bookings/${bookingId}/${action}`;
      let method = 'PUT';
      let body = undefined;

      if (action === 'complete') {
        body = JSON.stringify({ actualDuration: payload.actualDuration });
      } else if (action === 'reject') {
        body = JSON.stringify({ reason: payload.reason });
      } else if (action === 'cancel') {
        body = JSON.stringify({ reason: payload.reason });
      }

      const r = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      const data = await r.json();

      if (data.success) {
        setAlert({ type: 'success', message: data.message });
        setSelectedBooking(null);
        setDetailBooking(null);
        loadBookings();
      } else {
        setAlert({ type: 'error', message: data.message || 'Action failed' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    // Fetch full details
    try {
      const r = await fetch(`${API_BASE}/worker/bookings/${booking.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detail = await r.json();
      setDetailBooking(detail);
    } catch {
      setDetailBooking(booking); // fallback to card data
    }
  };

  const filters = [
    { value: '',            label: 'All' },
    { value: 'CONFIRMED',   label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED',   label: 'Completed' },
    { value: 'CANCELLED',   label: 'Cancelled' },
    { value: 'REJECTED',    label: 'Rejected' },
  ];

  // Stats summary
  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <style>{`
        @keyframes ak-spin { to { transform: rotate(360deg); } }
      `}</style>

      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailModal
            booking={detailBooking || selectedBooking}
            onClose={() => { setSelectedBooking(null); setDetailBooking(null); }}
            onAction={handleAction}
            actionLoading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ ...font, fontSize: '1.05rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.indigoDeep, margin: 0 }}>
            My Bookings
          </h2>
          <p style={{ ...font, fontSize: '0.75rem', color: T.indigoMuted, fontWeight: '500', margin: '4px 0 0' }}>
            {totalElements} total booking{totalElements !== 1 ? 's' : ''}
          </p>
        </div>
        <Btn variant="ghost" icon={RefreshCw} onClick={loadBookings} loading={loading}>
          Refresh
        </Btn>
      </div>

      {/* Alert */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px',
              borderLeft: `3px solid ${alert.type === 'success' ? T.success : T.error}`,
              background: alert.type === 'success' ? T.successBg : T.errorBg,
              padding: '10px 14px', marginBottom: '16px', borderRadius: '0 2px 2px 0',
              color: alert.type === 'success' ? T.success : T.error,
            }}
          >
            <span style={{ ...font, fontSize: '0.78rem', fontWeight: '600', lineHeight: 1.55 }}>{alert.message}</span>
            <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick stats strip */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { status: 'CONFIRMED',   label: 'To Start' },
          { status: 'IN_PROGRESS', label: 'In Progress' },
          { status: 'COMPLETED',   label: 'Completed' },
        ].map(({ status, label }) => {
          const cfg = STATUS_CFG[status];
          const count = statusCounts[status] || 0;
          return (
            <div
              key={status}
              onClick={() => { setStatusFilter(statusFilter === status ? '' : status); setPage(0); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px',
                background: statusFilter === status ? cfg.bg : T.ivory,
                border: `1px solid ${statusFilter === status ? cfg.bd : T.border}`,
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ ...font, fontSize: '1.1rem', fontWeight: '800', color: cfg.color }}>{count}</span>
              <span style={{ ...font, fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: T.indigoMuted }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color={T.indigoMuted} strokeWidth={1.5} />
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(0); }}
            style={{
              padding: '5px 12px',
              background: statusFilter === f.value ? T.indigo : T.ivory,
              border: `1px solid ${statusFilter === f.value ? T.indigo : T.borderStrong}`,
              borderRadius: '2px',
              color: statusFilter === f.value ? T.ivory : T.indigoText,
              ...font,
              fontSize: '0.65rem',
              fontWeight: '700',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Spinner sz={36} />
          <p style={{ ...font, fontSize: '0.78rem', fontWeight: '600', color: T.indigoMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Loading bookings…</p>
        </div>
      ) : bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', padding: '60px 24px',
            background: T.ivory,
            border: `1px solid ${T.border}`,
            borderRadius: '3px',
          }}
        >
          <Briefcase size={40} color={T.indigoMuted} strokeWidth={1} style={{ marginBottom: '16px' }} />
          <p style={{ ...font, fontSize: '0.9rem', fontWeight: '700', color: T.indigoDeep, margin: '0 0 6px' }}>No bookings found</p>
          <p style={{ ...font, fontSize: '0.78rem', color: T.indigoMuted, fontWeight: '500', margin: 0 }}>
            {statusFilter ? `No ${statusFilter.toLowerCase()} bookings` : 'You have no bookings yet'}
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
          <Btn
            variant="outline"
            icon={ChevronLeft}
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            small
          >
            Prev
          </Btn>
          <span style={{ ...font, fontSize: '0.72rem', fontWeight: '700', color: T.indigoMuted, letterSpacing: '0.04em' }}>
            Page {page + 1} of {totalPages}
          </span>
          <Btn
            variant="outline"
            icon={ChevronRight}
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            small
          >
            Next
          </Btn>
        </div>
      )}
    </>
  );
};

export default WorkerBookingsSection;