import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
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

const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating]               = useState(5);
  const [comment, setComment]             = useState('');
  const [loading, setLoading]             = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [focused, setFocused]             = useState(false);

  if (!booking || !booking.id) return null;

  const activeRating = hoveredRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || comment.trim() === '') {
      alert('Please provide a rating and review comment.');
      return;
    }
    try {
      setLoading(true);
      await api.post(`/consumer/bookings/${booking.id}/review`, {
        rating,
        comment: comment.trim(),
      });
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(error?.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        .ak-review-overlay { animation: ak-fade 0.18s ease; }
        .ak-review-card    { animation: ak-rise 0.22s ease; }
        @keyframes ak-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ak-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        .ak-star-btn { background: none; border: none; padding: 2px; cursor: pointer; line-height: 0; }
        .ak-star-btn:focus { outline: none; }
        .ak-textarea::placeholder { color: ${T.indigoMuted}; font-family: 'Open Sans', sans-serif; font-size: 0.86rem; }
        .ak-close-btn:hover  { background: ${T.indigoSubtle} !important; }
        .ak-cancel-btn:hover { background: ${T.indigoMid} !important; }
        .ak-submit-btn:hover:not(:disabled) { opacity: 0.88 !important; }
      `}</style>

      {/* Overlay */}
      <div
        className="ak-review-overlay"
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
          className="ak-review-card"
          style={{
            background: T.ivory,
            border: `1px solid ${T.borderStrong}`,
            borderRadius: '3px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: `0 20px 60px rgba(20,10,80,0.22), 0 4px 16px ${T.shadowSoft}`,
          }}
        >
          {/* ── Header ────────────────────────────────────────────────────── */}
          <div style={{
            borderTop: `3px solid ${T.indigo}`,
            borderBottom: `1px solid ${T.border}`,
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: `0 2px 8px ${T.shadowSoft}`,
          }}>
            <div>
              <h2 style={{
                color: T.indigoDeep, fontWeight: 800,
                fontSize: '1.05rem', margin: 0, ...font,
                letterSpacing: '-0.01em',
              }}>
                Leave a Review
              </h2>
              {booking.workerName && (
                <p style={{ color: T.indigoMuted, fontSize: '0.78rem', margin: '3px 0 0', ...font, fontWeight: 500 }}>
                  for {booking.workerName}
                </p>
              )}
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

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Star Rating */}
            <div>
              <p style={{
                fontSize: '0.72rem', fontWeight: 700, color: T.indigoMuted,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                margin: '0 0 12px', ...font,
              }}>
                Rating
              </p>

              {/* Stars + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className="ak-star-btn"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <Star
                      size={34}
                      strokeWidth={1.5}
                      style={{
                        transition: 'transform 0.12s, color 0.12s',
                        transform: star <= activeRating ? 'scale(1.12)' : 'scale(1)',
                        color: star <= activeRating ? '#c8960c' : T.borderStrong,
                        fill:  star <= activeRating ? '#f5c842' : 'transparent',
                      }}
                    />
                  </button>
                ))}
                <span style={{
                  marginLeft: '8px',
                  padding: '3px 10px',
                  background: T.indigoSubtle,
                  border: `1px solid ${T.border}`,
                  borderRadius: '2px',
                  color: T.indigoDeep,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  ...font,
                  transition: 'all 0.15s',
                }}>
                  {ratingLabels[activeRating]}
                </span>
              </div>

              {/* Progress bar indicators */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <div
                    key={star}
                    style={{
                      height: '3px', flex: 1, borderRadius: '2px',
                      background: star <= activeRating ? T.indigo : T.border,
                      transition: 'background 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.72rem', fontWeight: 700, color: T.indigoMuted,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                marginBottom: '6px', ...font,
              }}>
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                rows={5}
                required
                placeholder="Write about your experience…"
                className="ak-textarea"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: T.ivoryMid,
                  border: `1px solid ${focused ? T.indigo : T.borderStrong}`,
                  borderRadius: '2px',
                  outline: 'none',
                  color: T.indigoDeep,
                  fontSize: '0.88rem',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  boxShadow: focused ? `0 0 0 3px rgba(26,16,80,0.08)` : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  ...font,
                }}
              />
              <p style={{
                textAlign: 'right', fontSize: '0.70rem',
                color: T.indigoMuted, margin: '5px 0 0', ...font, fontWeight: 500,
              }}>
                {comment.length} characters
              </p>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex', gap: '12px',
              paddingTop: '12px',
              borderTop: `1px solid ${T.border}`,
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="ak-cancel-btn"
                style={{
                  flex: 1, padding: '11px 20px',
                  background: T.ivoryDeep,
                  border: `1px solid ${T.borderStrong}`,
                  borderRadius: '2px',
                  color: T.indigoText,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: '0.78rem',
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  transition: 'background 0.15s',
                  opacity: loading ? 0.5 : 1,
                  ...font,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ak-submit-btn"
                style={{
                  flex: 1, padding: '11px 20px',
                  background: loading ? 'rgba(26,16,80,0.35)' : T.indigo,
                  border: 'none', borderRadius: '2px',
                  color: T.ivory,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: '0.78rem',
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  transition: 'opacity 0.15s',
                  boxShadow: loading ? 'none' : `0 3px 12px ${T.shadow}`,
                  ...font,
                }}
              >
                {loading ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReviewModal;