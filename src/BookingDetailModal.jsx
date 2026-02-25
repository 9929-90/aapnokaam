import React from 'react';
import { X, User, Tag, Calendar, Clock, MapPin, Star } from 'lucide-react';

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

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS = {
  PENDING:     { bg: 'rgba(200, 150, 12, 0.12)',  color: '#8a6200',  label: 'Pending'     },
  CONFIRMED:   { bg: 'rgba(20,  10, 80, 0.08)',   color: '#1a1050',  label: 'Confirmed'   },
  IN_PROGRESS: { bg: 'rgba(80,  20, 120, 0.10)',  color: '#4a1278',  label: 'In Progress' },
  COMPLETED:   { bg: 'rgba(20,  100, 60, 0.10)',  color: '#14643c',  label: 'Completed'   },
  CANCELLED:   { bg: 'rgba(160, 30,  30, 0.10)',  color: '#a01e1e',  label: 'Cancelled'   },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p style={{
    fontSize: '0.70rem', fontWeight: 700, color: T.indigoMuted,
    textTransform: 'uppercase', letterSpacing: '0.07em',
    margin: '0 0 5px', ...font,
  }}>
    {children}
  </p>
);

const FieldValue = ({ children }) => (
  <p style={{ color: T.indigoDeep, fontWeight: 600, fontSize: '0.88rem', margin: 0, ...font }}>
    {children}
  </p>
);

const MetaRow = ({ icon: Icon, label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '12px 14px',
    background: T.ivory,
    border: `1px solid ${T.border}`,
    borderRadius: '2px',
  }}>
    <div style={{
      width: '28px', height: '28px', flexShrink: 0,
      background: T.indigoSubtle,
      border: `1px solid ${T.border}`,
      borderRadius: '2px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={13} color={T.indigoMuted} strokeWidth={1.8} />
    </div>
    <div>
      <SectionLabel>{label}</SectionLabel>
      <FieldValue>{value}</FieldValue>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const BookingDetailModal = ({ booking, onClose, onRefresh, onReview }) => {
  const status = STATUS[booking.status] || STATUS.PENDING;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        .ak-bd-overlay { animation: ak-fade 0.18s ease; }
        .ak-bd-card    { animation: ak-rise 0.22s ease; }
        @keyframes ak-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ak-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        .ak-review-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .ak-close-btn:hover { background: ${T.indigoSubtle} !important; }
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.ivoryDeep}; }
        ::-webkit-scrollbar-thumb { background: rgba(26,16,80,0.18); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(26,16,80,0.32); }
      `}</style>

      {/* Overlay */}
      <div
        className="ak-bd-overlay"
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(20, 10, 80, 0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Card */}
        <div
          className="ak-bd-card"
          style={{
            background: T.ivoryMid,
            border: `1px solid ${T.borderStrong}`,
            borderRadius: '3px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: `0 20px 60px rgba(20,10,80,0.22), 0 4px 16px ${T.shadowSoft}`,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: T.ivory,
            borderTop: `3px solid ${T.indigo}`,
            borderBottom: `1px solid ${T.border}`,
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: `0 2px 8px ${T.shadowSoft}`,
            flexShrink: 0,
          }}>
            <div>
              <h2 style={{
                color: T.indigoDeep, fontWeight: 800,
                fontSize: '1.05rem', margin: 0, ...font,
                letterSpacing: '-0.01em',
              }}>
                Booking Details
              </h2>
              <p style={{ color: T.indigoMuted, fontSize: '0.74rem', margin: '3px 0 0', ...font, fontWeight: 500 }}>
                #{booking.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ak-close-btn"
              style={{
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent',
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                cursor: 'pointer',
                color: T.indigoMuted,
                transition: 'background 0.15s',
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* ── Body ────────────────────────────────────────────────────── */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

            {/* Title + Status */}
            <div style={{
              background: T.ivory,
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.indigo}`,
              borderRadius: '2px',
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            }}>
              <h3 style={{
                color: T.indigoDeep, fontWeight: 800,
                fontSize: '0.95rem', margin: 0, ...font,
              }}>
                {booking.serviceTitle}
              </h3>
              <span style={{
                padding: '4px 10px',
                background: status.bg,
                color: status.color,
                fontSize: '0.70rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                borderRadius: '2px', flexShrink: 0,
                ...font,
              }}>
                {status.label}
              </span>
            </div>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <MetaRow icon={User}     label="Worker"   value={booking.workerName} />
              <MetaRow icon={Tag}      label="Category" value={booking.categoryName} />
              <MetaRow icon={Calendar} label="Date"     value={new Date(booking.scheduledDate).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} />
              <MetaRow icon={Clock}    label="Time"     value={new Date(booking.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            </div>

            {/* Description */}
            <div style={{
              background: T.ivory,
              border: `1px solid ${T.border}`,
              borderRadius: '2px',
              padding: '14px 16px',
            }}>
              <SectionLabel>Description</SectionLabel>
              <p style={{
                color: T.indigoText, fontSize: '0.86rem',
                margin: 0, lineHeight: 1.65, ...font, fontWeight: 400,
              }}>
                {booking.serviceDescription || 'No description provided'}
              </p>
            </div>

            {/* Location */}
            <div style={{
              background: T.ivory,
              border: `1px solid ${T.border}`,
              borderRadius: '2px',
              padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
            }}>
              <div style={{
                width: '28px', height: '28px', flexShrink: 0,
                background: T.indigoSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '2px',
              }}>
                <MapPin size={13} color={T.indigoMuted} strokeWidth={1.8} />
              </div>
              <div>
                <SectionLabel>Service Location</SectionLabel>
                <FieldValue>
                  {booking.address}, {booking.city}, {booking.state} — {booking.pincode}
                </FieldValue>
              </div>
            </div>

            {/* Cost summary */}
            <div style={{
              background: T.indigoSubtle,
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.indigo}`,
              borderRadius: '2px',
              padding: '14px 16px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{ color: T.indigoText, fontSize: '0.85rem', ...font, fontWeight: 600 }}>
                  Estimated Cost
                </span>
                <span style={{ color: T.indigo, fontSize: '1.25rem', fontWeight: 800, ...font }}>
                  ₹{booking.estimatedCost}
                </span>
              </div>
              <p style={{
                color: T.indigoMuted, fontSize: '0.76rem',
                margin: 0, ...font, fontWeight: 500,
                borderTop: `1px solid ${T.border}`, paddingTop: '8px',
              }}>
                {booking.estimatedDuration} hours × ₹{booking.hourlyRate}/hour
              </p>
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          {booking.status === 'COMPLETED' && !booking.hasReview && (
            <div style={{
              position: 'sticky', bottom: 0,
              background: T.ivory,
              borderTop: `1px solid ${T.border}`,
              padding: '14px 20px',
              boxShadow: `0 -2px 8px ${T.shadowSoft}`,
              flexShrink: 0,
            }}>
              <button
                onClick={() => { onClose(); onReview(booking); }}
                className="ak-review-btn"
                style={{
                  width: '100%',
                  padding: '11px 20px',
                  background: T.indigo,
                  border: 'none', borderRadius: '2px',
                  color: T.ivory,
                  cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.78rem',
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  transition: 'opacity 0.15s',
                  boxShadow: `0 3px 12px ${T.shadow}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  ...font,
                }}
              >
                <Star size={14} strokeWidth={2} />
                Leave a Review
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingDetailModal;