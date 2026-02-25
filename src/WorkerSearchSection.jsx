import React, { useState } from 'react';
import { MapPin, Star, Heart, Briefcase, Navigation, User as UserIcon } from 'lucide-react';
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

// ─── WorkerSearchSection ──────────────────────────────────────────────────────
const WorkerSearchSection = ({ onWorkerSelect, onBookWorker }) => {
  const [workers, setWorkers]               = useState([]);
  const [loading, setLoading]               = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [totalResults, setTotalResults]     = useState(0);
  const [favorites, setFavorites]           = useState(new Set());
  const [locationUsed, setLocationUsed]     = useState(false);
  const [errorMessage, setErrorMessage]     = useState('');

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setLoading(true);
          const queryParams = new URLSearchParams({
            latitude:      position.coords.latitude,
            longitude:     position.coords.longitude,
            radiusKm:      5,
            page:          0,
            size:          50,
            sortBy:        'rating',
            availableOnly: true,
          });
          const response = await api.get(`/consumer/workers/search?${queryParams}`);
          setWorkers(response.data.workers || []);
          setTotalResults(response.data.totalResults || 0);
          setLocationUsed(true);
          if (response.data.workers?.length === 0) setErrorMessage('No workers found within 5km of your location');
        } catch {
          setErrorMessage('Failed to search workers. Please try again.');
        } finally {
          setLoading(false);
          setLocationLoading(false);
        }
      },
      (error) => {
        let msg = 'Unable to get your location. ';
        if      (error.code === error.PERMISSION_DENIED)    msg += 'Please enable location access in your browser settings.';
        else if (error.code === error.POSITION_UNAVAILABLE) msg += 'Location information is unavailable.';
        else if (error.code === error.TIMEOUT)              msg += 'Location request timed out.';
        setErrorMessage(msg);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const toggleFavorite = async (workerId) => {
    try {
      if (favorites.has(workerId)) {
        await api.delete(`/consumer/favorites/${workerId}`);
        setFavorites(prev => { const s = new Set(prev); s.delete(workerId); return s; });
      } else {
        await api.post(`/consumer/favorites/${workerId}`);
        setFavorites(prev => new Set(prev).add(workerId));
      }
    } catch { console.error('Failed to toggle favorite'); }
  };

  const busy = locationLoading || loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes ak-spin   { to { transform: rotate(360deg) } }
        @keyframes ak-pulse  { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes ak-float  { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-4px) } }
        .ak-loc-btn:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-1px) !important; }
        .ak-loc-btn:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }
        .ak-worker-card:hover { border-color: ${T.borderStrong} !important; box-shadow: 0 8px 28px ${T.shadow} !important; transform: translateY(-2px); }
        .ak-fav-btn:hover { background: ${T.indigoSubtle} !important; }
        .ak-view-btn:hover { background: ${T.indigoMid} !important; }
        .ak-book-btn:hover:not(:disabled) { opacity: 0.88 !important; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Hero / Location panel ──────────────────────────────────────── */}
        <div style={{
          background: T.ivory,
          border: `1px solid ${T.borderStrong}`,
          borderTop: `3px solid ${T.indigo}`,
          borderRadius: '3px',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: `0 4px 24px ${T.shadowSoft}`,
        }}>
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div style={{
              width: '64px', height: '64px',
              background: T.indigo,
              border: `1px solid ${T.borderStrong}`,
              borderRadius: '2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: `0 6px 20px ${T.shadow}`,
              animation: 'ak-float 3s ease-in-out infinite',
            }}>
              <Navigation size={26} color={T.ivory} strokeWidth={1.5} />
            </div>

            <h1 style={{
              color: T.indigoDeep, fontWeight: 800,
              fontSize: '1.4rem', margin: '0 0 10px', ...font,
              letterSpacing: '-0.02em',
            }}>
              Find Workers Near You
            </h1>
            <p style={{
              color: T.indigoMuted, fontSize: '0.88rem',
              margin: '0 0 28px', lineHeight: 1.6, ...font, fontWeight: 400,
            }}>
              Click below to discover available workers within 5km of your location
            </p>

            <button
              onClick={handleUseMyLocation}
              disabled={busy}
              className="ak-loc-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '13px 28px',
                background: busy ? 'rgba(26,16,80,0.35)' : T.indigo,
                border: 'none', borderRadius: '2px',
                color: T.ivory,
                cursor: busy ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: '0.88rem',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                transition: 'opacity 0.15s, transform 0.15s',
                boxShadow: busy ? 'none' : `0 4px 16px ${T.shadow}`,
                ...font,
              }}
            >
              {locationLoading ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: `2px solid rgba(240,235,224,0.3)`, borderTop: `2px solid ${T.ivory}`, borderRadius: '50%', animation: 'ak-spin 0.7s linear infinite', flexShrink: 0 }} />
                  Getting Location…
                </>
              ) : (
                <>
                  <Navigation size={16} strokeWidth={2} />
                  Use My Location
                </>
              )}
            </button>

            {locationUsed && !loading && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                marginTop: '18px',
                padding: '6px 14px',
                background: T.indigoSubtle,
                border: `1px solid ${T.border}`,
                borderLeft: `3px solid ${T.indigo}`,
                borderRadius: '2px',
                color: T.indigoText, fontSize: '0.76rem', fontWeight: 700,
                letterSpacing: '0.04em', ...font,
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.indigo, animation: 'ak-pulse 1.8s ease-in-out infinite', flexShrink: 0 }} />
                Showing workers within 5km
              </div>
            )}

            {errorMessage && (
              <div style={{
                marginTop: '16px',
                padding: '11px 14px',
                background: 'rgba(160,30,30,0.07)',
                border: `1px solid rgba(160,30,30,0.22)`,
                borderLeft: `3px solid #a01e1e`,
                borderRadius: '2px',
                color: '#a01e1e', fontSize: '0.80rem', fontWeight: 600,
                textAlign: 'left', ...font,
              }}>
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* ── Results panel ─────────────────────────────────────────────── */}
        {locationUsed && (
          <div style={{
            background: T.ivory,
            border: `1px solid ${T.borderStrong}`,
            borderTop: `3px solid ${T.indigo}`,
            borderRadius: '3px',
            padding: '20px',
            boxShadow: `0 4px 24px ${T.shadowSoft}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '20px', paddingBottom: '14px',
              borderBottom: `1px solid ${T.border}`,
            }}>
              <div>
                <h2 style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '1rem', margin: 0, ...font }}>
                  {totalResults} Worker{totalResults !== 1 ? 's' : ''} Found
                </h2>
                {!loading && workers.length > 0 && (
                  <p style={{ color: T.indigoMuted, fontSize: '0.74rem', margin: '3px 0 0', ...font, fontWeight: 500 }}>
                    Sorted by rating
                  </p>
                )}
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px',
                background: T.indigoSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                color: T.indigoText, fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.04em', ...font,
              }}>
                <Navigation size={11} strokeWidth={2} color={T.indigoMuted} />
                Within 5km
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', border: `2px solid ${T.border}`, borderTop: `2px solid ${T.indigo}`, borderRadius: '50%', animation: 'ak-spin 0.75s linear infinite' }} />
                <p style={{ color: T.indigoMuted, fontSize: '0.84rem', margin: 0, ...font, fontWeight: 500 }}>Searching for workers…</p>
              </div>

            ) : workers.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {workers.map(worker => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    isFavorite={favorites.has(worker.id)}
                    onToggleFavorite={() => toggleFavorite(worker.id)}
                    onViewDetails={() => onWorkerSelect(worker)}
                    onBook={() => onBookWorker(worker)}
                  />
                ))}
              </div>

            ) : (
              <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '56px', height: '56px', background: T.indigoSubtle, border: `1px solid ${T.border}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={24} color={T.indigoMuted} strokeWidth={1.2} />
                </div>
                <p style={{ color: T.indigoDeep, fontWeight: 700, fontSize: '0.88rem', margin: 0, ...font }}>No workers found nearby</p>
                <p style={{ color: T.indigoMuted, fontSize: '0.80rem', margin: 0, ...font, fontWeight: 400 }}>Try again or check back later</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ─── WorkerCard ───────────────────────────────────────────────────────────────
const WorkerCard = ({ worker, isFavorite, onToggleFavorite, onViewDetails, onBook }) => (
  <div
    className="ak-worker-card"
    style={{
      background: T.ivoryMid,
      border: `1px solid ${T.border}`,
      borderRadius: '2px',
      overflow: 'hidden',
      transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      boxShadow: `0 2px 8px ${T.shadowSoft}`,
    }}
  >
    {/* ── Avatar area — always User icon, no media storage ──────────────── */}
    <div style={{ position: 'relative', height: '160px', background: T.ivoryDeep, overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: T.indigoSubtle,
          border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <UserIcon size={28} color={T.indigoMuted} strokeWidth={1.2} />
        </div>
      </div>

      {/* Overlay gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,12,64,0.18) 0%, transparent 60%)' }} />

      {/* Favorite button */}
      <button
        onClick={onToggleFavorite}
        className="ak-fav-btn"
        style={{
          position: 'absolute', top: '10px', right: '10px',
          width: '30px', height: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: T.ivory,
          border: `1px solid ${T.border}`,
          borderRadius: '2px',
          cursor: 'pointer',
          boxShadow: `0 2px 8px ${T.shadowSoft}`,
          transition: 'background 0.15s',
        }}
      >
        <Heart
          size={13}
          strokeWidth={2}
          style={{ color: isFavorite ? '#c0392b' : T.indigoMuted, fill: isFavorite ? '#c0392b' : 'transparent', transition: 'all 0.15s' }}
        />
      </button>

      {/* Verified badge */}
      {worker.isVerified && (
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          padding: '3px 8px',
          background: T.indigo, color: T.ivory,
          fontSize: '0.62rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          borderRadius: '2px', ...font,
        }}>
          ✓ Verified
        </span>
      )}

      {/* Bottom badges */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {worker.isAvailable && (
          <span style={{
            padding: '3px 8px',
            background: 'rgba(20,100,60,0.82)', color: '#e8f5ee',
            fontSize: '0.62rem', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            borderRadius: '2px', ...font,
            backdropFilter: 'blur(4px)',
          }}>
            Available
          </span>
        )}
        {worker.distance != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            marginLeft: 'auto',
            padding: '3px 8px',
            background: 'rgba(20,12,64,0.72)', color: T.ivory,
            fontSize: '0.62rem', fontWeight: 800,
            borderRadius: '2px', ...font,
            backdropFilter: 'blur(4px)',
          }}>
            <MapPin size={9} strokeWidth={2} />
            {worker.distance.toFixed(1)} km
          </span>
        )}
      </div>
    </div>

    {/* ── Info area ─────────────────────────────────────────────────────── */}
    <div style={{ padding: '14px 14px 0' }}>
      <h3 style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '0.92rem', margin: '0 0 4px', ...font }}>
        {worker.fullName}
      </h3>
      <p style={{ display: 'flex', alignItems: 'center', gap: '5px', color: T.indigoMuted, fontSize: '0.76rem', margin: '0 0 12px', ...font, fontWeight: 500 }}>
        <Briefcase size={11} strokeWidth={1.8} />
        {worker.primarySkill}
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: '12px', marginBottom: '10px',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={14} strokeWidth={1.5} style={{ fill: '#f5c842', color: '#c8960c' }} />
          <span style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '0.88rem', ...font }}>
            {worker.averageRating?.toFixed(1) || 'New'}
          </span>
          <span style={{ color: T.indigoMuted, fontSize: '0.74rem', ...font, fontWeight: 400 }}>
            ({worker.totalReviews})
          </span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: T.indigoMuted, fontSize: '0.74rem', ...font, fontWeight: 500 }}>
          <Briefcase size={11} strokeWidth={1.8} />
          {worker.totalJobsCompleted} jobs
        </span>
      </div>

      <p style={{ display: 'flex', alignItems: 'center', gap: '5px', color: T.indigoMuted, fontSize: '0.76rem', margin: '0 0 12px', ...font, fontWeight: 400 }}>
        <MapPin size={11} strokeWidth={1.8} />
        {worker.city}
      </p>
    </div>

    {/* ── Footer / CTA ──────────────────────────────────────────────────── */}
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px',
      borderTop: `1px solid ${T.border}`,
      background: T.ivory,
    }}>
      <div>
        <p style={{ fontSize: '0.64rem', fontWeight: 700, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px', ...font }}>
          Hourly Rate
        </p>
        <p style={{ color: T.indigo, fontWeight: 800, fontSize: '1.15rem', margin: 0, ...font }}>
          ₹{worker.hourlyRate}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onViewDetails}
          className="ak-view-btn"
          style={{
            padding: '7px 12px',
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
          View
        </button>
        <button
          onClick={onBook}
          className="ak-book-btn"
          style={{
            padding: '7px 14px',
            background: T.indigo,
            border: 'none',
            borderRadius: '2px',
            color: T.ivory,
            cursor: 'pointer',
            fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            transition: 'opacity 0.15s',
            boxShadow: `0 2px 10px ${T.shadow}`,
            ...font,
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  </div>
);

export default WorkerSearchSection;