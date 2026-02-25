import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from './api';

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
  PENDING:     { bg: 'rgba(200,150,12,0.12)',  color: '#8a6200',  label: 'Pending'     },
  CONFIRMED:   { bg: 'rgba(20,10,80,0.08)',    color: '#1a1050',  label: 'Confirmed'   },
  IN_PROGRESS: { bg: 'rgba(80,20,120,0.10)',   color: '#4a1278',  label: 'In Progress' },
  COMPLETED:   { bg: 'rgba(20,100,60,0.10)',   color: '#14643c',  label: 'Completed'   },
  CANCELLED:   { bg: 'rgba(160,30,30,0.10)',   color: '#a01e1e',  label: 'Cancelled'   },
  REJECTED:    { bg: 'rgba(80,80,80,0.08)',    color: '#444444',  label: 'Rejected'    },
};

const statusOptions = [
  { value: '',            label: 'All Bookings' },
  { value: 'PENDING',     label: 'Pending'      },
  { value: 'CONFIRMED',   label: 'Confirmed'    },
  { value: 'IN_PROGRESS', label: 'In Progress'  },
  { value: 'COMPLETED',   label: 'Completed'    },
  { value: 'CANCELLED',   label: 'Cancelled'    },
];

// ─── BookingSection ───────────────────────────────────────────────────────────
const BookingSection = ({ onViewBooking, onReviewBooking, onRefresh }) => {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage]   = useState(0);
  const [totalPages, setTotalPages]     = useState(0);

  useEffect(() => { loadBookings(); }, [statusFilter, currentPage]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, size: 10 });
      if (statusFilter) params.append('status', statusFilter);
      const response = await api.get(`/consumer/bookings?${params}`);
      setBookings(response.data.bookings);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    try {
      await api.put(`/consumer/bookings/${bookingId}/cancel`, { reason });
      loadBookings();
      onRefresh();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      background: T.ivory,
      border: `1px solid ${T.borderStrong}`,
      borderRadius: '3px',
      borderTop: `3px solid ${T.indigo}`,
      padding: '48px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
      boxShadow: `0 4px 24px ${T.shadowSoft}`,
    }}>
      <div style={{
        width: '36px', height: '36px',
        border: `2px solid ${T.border}`,
        borderTop: `2px solid ${T.indigo}`,
        borderRadius: '50%',
        animation: 'ak-spin 0.75s linear infinite',
      }} />
      <p style={{ color: T.indigoMuted, fontSize: '0.84rem', margin: 0, ...font, fontWeight: 500 }}>
        Loading bookings…
      </p>
      <style>{`@keyframes ak-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        .ak-card:hover        { border-color: ${T.borderStrong} !important; box-shadow: 0 4px 18px ${T.shadow} !important; }
        .ak-select:focus      { border-color: ${T.indigo} !important; box-shadow: 0 0 0 3px rgba(26,16,80,0.08) !important; }
        .ak-select option     { background: ${T.ivory}; color: ${T.indigoDeep}; }
        .ak-btn-ghost:hover   { background: ${T.indigoMid} !important; }
        .ak-btn-cancel:hover  { background: rgba(160,30,30,0.15) !important; }
        .ak-btn-review:hover  { opacity: 0.88 !important; }
        .ak-page-btn:hover:not(:disabled) { background: ${T.indigoMid} !important; }
        .ak-select::placeholder { color: ${T.indigoMuted}; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Header panel ──────────────────────────────────────────────── */}
        <div style={{
          background: T.ivory,
          border: `1px solid ${T.borderStrong}`,
          borderTop: `3px solid ${T.indigo}`,
          borderRadius: '3px',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: `0 2px 8px ${T.shadowSoft}`,
        }}>
          <div>
            <h1 style={{
              color: T.indigoDeep, fontWeight: 800,
              fontSize: '1.05rem', margin: 0, ...font,
              letterSpacing: '-0.01em',
            }}>
              My Bookings
            </h1>
            {bookings.length > 0 && (
              <p style={{ color: T.indigoMuted, fontSize: '0.74rem', margin: '3px 0 0', ...font, fontWeight: 500 }}>
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''} shown
              </p>
            )}
          </div>

          {/* Filter select */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            className="ak-select"
            style={{
              padding: '8px 12px',
              background: T.ivoryMid,
              border: `1px solid ${T.borderStrong}`,
              borderRadius: '2px',
              outline: 'none',
              color: T.indigoDeep,
              fontSize: '0.80rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              ...font,
            }}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ── Bookings list panel ────────────────────────────────────────── */}
        <div style={{
          background: T.ivory,
          border: `1px solid ${T.borderStrong}`,
          borderRadius: '3px',
          padding: '20px',
          boxShadow: `0 2px 8px ${T.shadowSoft}`,
        }}>
          {bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onView={() => onViewBooking(booking)}
                  onCancel={() => handleCancelBooking(booking.id)}
                  onReview={() => onReviewBooking(booking)}
                />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div style={{
              padding: '48px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '56px', height: '56px',
                background: T.indigoSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Calendar size={24} color={T.indigoMuted} strokeWidth={1.2} />
              </div>
              <p style={{ color: T.indigoDeep, fontWeight: 700, fontSize: '0.88rem', margin: 0, ...font }}>
                No bookings found
              </p>
              <p style={{ color: T.indigoMuted, fontSize: '0.80rem', margin: 0, ...font, fontWeight: 400 }}>
                Your bookings will appear here
              </p>
            </div>
          )}

          {/* ── Pagination ───────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="ak-page-btn"
                style={{
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: T.ivoryDeep,
                  border: `1px solid ${T.borderStrong}`,
                  borderRadius: '2px',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 0 ? 0.4 : 1,
                  color: T.indigoText,
                  transition: 'background 0.15s',
                }}
              >
                <ChevronLeft size={15} strokeWidth={2} />
              </button>

              <span style={{
                padding: '6px 14px',
                background: T.indigoSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                color: T.indigoDeep,
                fontSize: '0.76rem', fontWeight: 700,
                letterSpacing: '0.04em', ...font,
              }}>
                {currentPage + 1} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="ak-page-btn"
                style={{
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: T.ivoryDeep,
                  border: `1px solid ${T.borderStrong}`,
                  borderRadius: '2px',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages - 1 ? 0.4 : 1,
                  color: T.indigoText,
                  transition: 'background 0.15s',
                }}
              >
                <ChevronRight size={15} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── BookingCard ──────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onView, onCancel, onReview }) => {
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);
  const canReview = booking.status === 'COMPLETED' && !booking.hasReview;
  const status    = STATUS[booking.status] || STATUS.REJECTED;

  return (
    <div
      className="ak-card"
      style={{
        background: T.ivoryMid,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${T.indigo}`,
        borderRadius: '2px',
        padding: '16px',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: `0 1px 4px ${T.shadowSoft}`,
      }}
    >
      {/* ── Title row ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            color: T.indigoDeep, fontWeight: 800,
            fontSize: '0.92rem', margin: '0 0 4px', ...font,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {booking.serviceTitle}
          </h3>
          <p style={{ color: T.indigoMuted, fontSize: '0.76rem', margin: 0, ...font, fontWeight: 500 }}>
            {booking.categoryName}
          </p>
        </div>
        <span style={{
          padding: '3px 10px',
          background: status.bg,
          color: status.color,
          fontSize: '0.68rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.07em',
          borderRadius: '2px', flexShrink: 0,
          ...font,
        }}>
          {status.label}
        </span>
      </div>

      {/* ── Meta chips ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        {[
          { Icon: User,        text: booking.workerName },
          { Icon: Calendar,    text: new Date(booking.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) },
          { Icon: Clock,       text: new Date(booking.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { Icon: DollarSign,  text: `₹${booking.estimatedCost}`, bold: true },
        ].map(({ Icon, text, bold }) => (
          <span
            key={text}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px',
              background: T.ivory,
              border: `1px solid ${T.border}`,
              borderRadius: '2px',
              color: bold ? T.indigoDeep : T.indigoText,
              fontSize: '0.76rem',
              fontWeight: bold ? 700 : 500,
              ...font,
            }}
          >
            <Icon size={11} color={T.indigoMuted} strokeWidth={2} />
            {text}
          </span>
        ))}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: `1px solid ${T.border}`,
      }}>
        <p style={{ color: T.indigoMuted, fontSize: '0.72rem', margin: 0, ...font, fontWeight: 400 }}>
          Booked {new Date(booking.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>

        <div style={{ display: 'flex', gap: '6px' }}>
          {/* View Details */}
          <button
            onClick={onView}
            className="ak-btn-ghost"
            style={{
              padding: '6px 12px',
              background: T.ivoryDeep,
              border: `1px solid ${T.borderStrong}`,
              borderRadius: '2px',
              color: T.indigoText,
              cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              transition: 'background 0.15s',
              ...font,
            }}
          >
            View Details
          </button>

          {/* Leave Review */}
          {canReview && (
            <button
              onClick={onReview}
              className="ak-btn-review"
              style={{
                padding: '6px 12px',
                background: T.indigo,
                border: 'none',
                borderRadius: '2px',
                color: T.ivory,
                cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                transition: 'opacity 0.15s',
                boxShadow: `0 2px 8px ${T.shadow}`,
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                ...font,
              }}
            >
              <Star size={11} strokeWidth={2} />
              Review
            </button>
          )}

          {/* Cancel */}
          {canCancel && (
            <button
              onClick={onCancel}
              className="ak-btn-cancel"
              style={{
                padding: '6px 12px',
                background: 'rgba(160,30,30,0.08)',
                border: `1px solid rgba(160,30,30,0.25)`,
                borderRadius: '2px',
                color: '#a01e1e',
                cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                transition: 'background 0.15s',
                ...font,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSection;