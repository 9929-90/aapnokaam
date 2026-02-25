import React, { useState, useEffect } from 'react';
import { Star, User, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081/api';

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

const StarRow = ({ rating, size = 16 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s} size={size} strokeWidth={1.5}
        style={{
          color:  s <= rating ? '#c8960c' : T.border,
          fill:   s <= rating ? '#f5c842' : 'transparent',
        }}
      />
    ))}
  </div>
);

const WorkerReviewsSection = ({ token }) => {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary]   = useState(null);
  const [error, setError]       = useState('');
  const PAGE_SIZE = 10;

  useEffect(() => { loadReviews(page); }, [page]);

  const loadReviews = async (p) => {
    setLoading(true); setError('');
    try {
      const r = await fetch(
        `${API_BASE_URL}/worker/reviews?page=${p}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await r.json();
      // Support both { reviews, totalPages, summary } and flat array
      if (Array.isArray(data)) {
        setReviews(data);
        setTotalPages(1);
      } else {
        setReviews(data.reviews || data.content || []);
        setTotalPages(data.totalPages || 1);
        setSummary(data.summary || null);
      }
    } catch {
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Rating distribution for summary bar ────────────────────────────────────
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : '—';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes ak-spin { to { transform: rotate(360deg) } }
        .ak-review-card:hover { border-color: rgba(26,16,80,0.28) !important; box-shadow: 0 6px 24px ${T.shadow} !important; }
        .ak-page-btn:hover:not(:disabled) { border-color: ${T.indigo} !important; color: ${T.indigo} !important; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Page heading ────────────────────────────────────────────── */}
        <h2 style={{
          ...font, color: T.indigoDeep, fontWeight: 800,
          fontSize: '1.05rem', letterSpacing: '0.05em',
          textTransform: 'uppercase', margin: 0,
        }}>
          My Reviews
        </h2>

        {/* ── Summary card ────────────────────────────────────────────── */}
        <div style={{
          background: T.ivory,
          border: `1px solid ${T.borderStrong}`,
          borderTop: `3px solid ${T.indigo}`,
          borderRadius: '3px',
          padding: '24px',
          boxShadow: `0 4px 20px ${T.shadowSoft}`,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '32px',
          alignItems: 'center',
        }}>
          {/* Big average */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ ...font, fontSize: '3.5rem', fontWeight: 800, color: T.indigo, margin: 0, lineHeight: 1 }}>
              {summary?.averageRating?.toFixed(1) || avgRating}
            </p>
            <StarRow rating={Math.round(parseFloat(summary?.averageRating || avgRating))} size={18} />
            <p style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: T.indigoMuted, margin: '6px 0 0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {summary?.totalReviews || totalReviews} review{(summary?.totalReviews || totalReviews) !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Distribution bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ratingCounts.map(({ star, count }) => {
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ ...font, fontSize: '0.72rem', fontWeight: 700, color: T.indigoMuted, width: '14px', textAlign: 'right' }}>{star}</span>
                  <Star size={11} strokeWidth={1.5} style={{ color: '#c8960c', fill: '#f5c842', flexShrink: 0 }} />
                  <div style={{ flex: 1, height: '6px', background: T.border, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: T.indigo, borderRadius: '3px', transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ ...font, fontSize: '0.70rem', fontWeight: 600, color: T.indigoMuted, width: '20px' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Error ───────────────────────────────────────────────────── */}
        {error && (
          <div style={{
            padding: '11px 16px', background: 'rgba(185,28,28,0.07)',
            border: '1px solid rgba(185,28,28,0.25)', borderLeft: '3px solid #b91c1c',
            borderRadius: '2px', color: '#b91c1c', ...font, fontSize: '0.82rem', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ padding: '56px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '32px', height: '32px', border: `2px solid ${T.border}`, borderTop: `2px solid ${T.indigo}`, borderRadius: '50%', animation: 'ak-spin 0.75s linear infinite' }} />
            <p style={{ ...font, color: T.indigoMuted, fontSize: '0.82rem', fontWeight: 600, margin: 0, letterSpacing: '0.06em' }}>Loading reviews…</p>
          </div>

        ) : reviews.length === 0 ? (
          /* ── Empty ─────────────────────────────────────────────────── */
          <div style={{
            background: T.ivory,
            border: `1px solid ${T.border}`,
            borderRadius: '3px',
            padding: '56px 24px',
            textAlign: 'center',
            boxShadow: `0 4px 20px ${T.shadowSoft}`,
          }}>
            <div style={{ width: '56px', height: '56px', background: T.indigoSubtle, border: `1px solid ${T.border}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Star size={24} color={T.indigoMuted} strokeWidth={1.2} />
            </div>
            <p style={{ ...font, color: T.indigoDeep, fontWeight: 700, fontSize: '0.92rem', margin: '0 0 6px' }}>No reviews yet</p>
            <p style={{ ...font, color: T.indigoMuted, fontSize: '0.82rem', fontWeight: 400, margin: 0 }}>
              Complete jobs to start receiving reviews from customers.
            </p>
          </div>

        ) : (
          /* ── Review list ────────────────────────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map((review, i) => (
              <div
                key={review.id || i}
                className="ak-review-card"
                style={{
                  background: T.ivory,
                  border: `1px solid ${T.border}`,
                  borderRadius: '3px',
                  padding: '18px 20px',
                  boxShadow: `0 2px 10px ${T.shadowSoft}`,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Avatar */}
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: T.indigoSubtle, border: `1px solid ${T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <User size={18} color={T.indigoMuted} strokeWidth={1.2} />
                    </div>
                    <div>
                      <p style={{ ...font, color: T.indigoDeep, fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>
                        {review.consumerName || review.reviewerName || 'Anonymous'}
                      </p>
                      {review.createdAt && (
                        <p style={{ ...font, color: T.indigoMuted, fontSize: '0.72rem', fontWeight: 400, margin: '2px 0 0' }}>
                          {new Date(review.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <StarRow rating={review.rating} size={15} />
                    <span style={{
                      ...font, fontSize: '0.68rem', fontWeight: 700,
                      color: T.indigoMuted, letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                {/* Service title */}
                {review.serviceTitle && (
                  <p style={{
                    ...font, fontSize: '0.72rem', fontWeight: 700,
                    color: T.indigoMuted, letterSpacing: '0.06em', textTransform: 'uppercase',
                    margin: '0 0 8px',
                    padding: '3px 8px',
                    background: T.indigoSubtle,
                    border: `1px solid ${T.border}`,
                    borderRadius: '2px',
                    display: 'inline-block',
                  }}>
                    {review.serviceTitle}
                  </p>
                )}

                {/* Comment */}
                {review.comment && (
                  <p style={{
                    ...font, color: T.indigoText, fontSize: '0.88rem',
                    fontWeight: 400, lineHeight: 1.65, margin: 0,
                    paddingTop: '8px',
                    borderTop: `1px solid ${T.border}`,
                  }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}

            {/* ── Pagination ───────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', paddingTop: '8px' }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="ak-page-btn"
                  style={{
                    padding: '7px 14px', background: T.ivoryDeep,
                    border: `1px solid ${T.borderStrong}`, borderRadius: '2px',
                    color: page === 0 ? T.indigoMuted : T.indigoText,
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    ...font, fontSize: '0.72rem', fontWeight: 700,
                    opacity: page === 0 ? 0.45 : 1,
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                >
                  <ChevronLeft size={13} strokeWidth={2} /> Prev
                </button>
                <span style={{ ...font, fontSize: '0.78rem', fontWeight: 600, color: T.indigoMuted }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="ak-page-btn"
                  style={{
                    padding: '7px 14px', background: T.ivoryDeep,
                    border: `1px solid ${T.borderStrong}`, borderRadius: '2px',
                    color: page >= totalPages - 1 ? T.indigoMuted : T.indigoText,
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    ...font, fontSize: '0.72rem', fontWeight: 700,
                    opacity: page >= totalPages - 1 ? 0.45 : 1,
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                >
                  Next <ChevronRight size={13} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default WorkerReviewsSection;