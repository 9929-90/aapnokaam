import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save, X, CheckCircle2, Navigation } from 'lucide-react';
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

// ─── Primitives ───────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <label style={{
    display: 'block',
    fontSize: '0.70rem', fontWeight: 700, color: T.indigoMuted,
    textTransform: 'uppercase', letterSpacing: '0.07em',
    marginBottom: '6px', ...font,
  }}>
    {children}
  </label>
);

const inputStyle = {
  width: '100%', padding: '8px 12px',
  background: T.ivoryMid,
  border: `1px solid ${T.borderStrong}`,
  borderRadius: '2px', outline: 'none',
  color: T.indigoDeep, fontSize: '0.84rem', fontWeight: 400,
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  ...font,
};

const ReadField = ({ children }) => (
  <p style={{
    padding: '8px 12px',
    background: T.ivoryDeep,
    border: `1px solid ${T.border}`,
    borderRadius: '2px',
    color: T.indigoText, fontSize: '0.84rem',
    margin: 0, ...font, fontWeight: 500,
  }}>
    {children}
  </p>
);

// ─── ProfileSection ───────────────────────────────────────────────────────────
const ProfileSection = ({ onUpdate }) => {
  const [profile, setProfile]               = useState(null);
  const [editing, setEditing]               = useState(false);
  const [formData, setFormData]             = useState({});
  const [loading, setLoading]               = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [focusedField, setFocusedField]     = useState(null);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/consumer/profile');
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) { console.error('Failed to load profile:', error); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      await api.put('/consumer/profile', formData);
      setProfile(formData);
      setEditing(false);
      onUpdate();
      alert('Profile updated successfully!');
    } catch { alert('Failed to update profile. Please try again.'); }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported by your browser'); return; }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setFormData(prev => ({
            ...prev, latitude, longitude,
            address: data.display_name || '',
            city:    data.address?.city || data.address?.town || data.address?.village || '',
            state:   data.address?.state || '',
            pincode: data.address?.postcode || '',
          }));
          alert('Location detected and address auto-filled!');
        } catch {
          setFormData(prev => ({ ...prev, latitude, longitude }));
          alert('Coordinates saved. Please fill address manually.');
        } finally { setGettingLocation(false); }
      },
      () => { alert('Unable to retrieve location. Please allow location access.'); setGettingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const focusStyle = (f) => focusedField === f
    ? { borderColor: T.indigo, boxShadow: `0 0 0 3px rgba(26,16,80,0.08)` }
    : {};

  const field = (key) => ({
    value: formData[key] || '',
    onChange: e => setFormData({ ...formData, [key]: e.target.value }),
    onFocus:  () => setFocusedField(key),
    onBlur:   () => setFocusedField(null),
    className: 'ak-input',
    style: { ...inputStyle, ...focusStyle(key) },
  });

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '12px' }}>
      <div style={{ width: '28px', height: '28px', border: `2px solid ${T.border}`, borderTop: `2px solid ${T.indigo}`, borderRadius: '50%', animation: 'ak-spin 0.75s linear infinite' }} />
      <p style={{ color: T.indigoMuted, fontSize: '0.84rem', margin: 0, ...font, fontWeight: 500 }}>Loading profile…</p>
      <style>{`@keyframes ak-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px 32px', boxSizing: 'border-box', background: T.ivoryMid }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes ak-spin { to { transform: rotate(360deg) } }
        .ak-input:focus        { border-color: ${T.indigo} !important; box-shadow: 0 0 0 3px rgba(26,16,80,0.08) !important; }
        .ak-input::placeholder { color: ${T.indigoMuted}; font-family: 'Open Sans', sans-serif; }
        .ak-edit-btn:hover     { opacity: 0.88 !important; }
        .ak-cancel-btn:hover   { background: ${T.indigoMid} !important; }
        .ak-save-btn:hover     { opacity: 0.88 !important; }
        .ak-loc-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.ivoryDeep}; }
        ::-webkit-scrollbar-thumb { background: rgba(26,16,80,0.18); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(26,16,80,0.32); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{
          background: T.ivory,
          border: `1px solid ${T.borderStrong}`,
          borderTop: `3px solid ${T.indigo}`,
          borderRadius: '3px',
          boxShadow: `0 4px 24px ${T.shadowSoft}`,
          display: 'flex', flexDirection: 'column',
          flex: 1, minHeight: 0, overflow: 'hidden',
        }}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', flexShrink: 0,
            borderBottom: `1px solid ${T.border}`,
            boxShadow: `0 2px 6px ${T.shadowSoft}`,
          }}>
            <div>
              <h1 style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '1.05rem', margin: 0, ...font, letterSpacing: '-0.01em' }}>
                My Profile
              </h1>
              <p style={{ color: T.indigoMuted, fontSize: '0.74rem', margin: '3px 0 0', ...font, fontWeight: 500 }}>
                {editing ? 'Editing — save when done' : 'View and manage your details'}
              </p>
            </div>

            {!editing ? (
              <button onClick={() => setEditing(true)} className="ak-edit-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', background: T.indigo, border: 'none', borderRadius: '2px', color: T.ivory, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'opacity 0.15s', boxShadow: `0 3px 10px ${T.shadow}`, ...font }}>
                <Edit2 size={13} strokeWidth={2} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setEditing(false); setFormData(profile); }} className="ak-cancel-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: T.ivoryDeep, border: `1px solid ${T.borderStrong}`, borderRadius: '2px', color: T.indigoText, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'background 0.15s', ...font }}>
                  <X size={13} strokeWidth={2} /> Cancel
                </button>
                <button onClick={handleSave} className="ak-save-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: T.indigo, border: 'none', borderRadius: '2px', color: T.ivory, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'opacity 0.15s', boxShadow: `0 3px 10px ${T.shadow}`, ...font }}>
                  <Save size={13} strokeWidth={2} /> Save
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, minHeight: 0 }}>

            {/* ── Avatar row ────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '14px', borderBottom: `1px solid ${T.border}` }}>
              {/* Always show User icon — no media storage */}
              <div style={{
                width: '80px', height: '80px', flexShrink: 0,
                borderRadius: '2px',
                background: T.indigoSubtle,
                border: `2px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={36} color={T.indigoMuted} strokeWidth={1.2} />
              </div>

              <div>
                <h2 style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '1rem', margin: '0 0 4px', ...font }}>
                  {profile.fullName}
                </h2>
                <p style={{ display: 'flex', alignItems: 'center', gap: '5px', color: T.indigoMuted, fontSize: '0.80rem', margin: 0, ...font, fontWeight: 500 }}>
                  <Mail size={13} strokeWidth={1.8} /> {profile.email}
                </p>
              </div>
            </div>

            {/* ── Form fields ───────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>

              {/* Full Name */}
              <div>
                <SectionLabel>Full Name</SectionLabel>
                {editing
                  ? <input type="text" {...field('fullName')} />
                  : <ReadField>{profile.fullName}</ReadField>
                }
              </div>

              {/* Phone */}
              <div>
                <SectionLabel>Phone</SectionLabel>
                {editing
                  ? <input type="tel" {...field('phoneNumber')} />
                  : <ReadField>{profile.phoneNumber || 'Not provided'}</ReadField>
                }
              </div>

              {/* Auto-fill location banner (edit mode only) */}
              {editing && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '14px 16px',
                  background: T.indigoSubtle,
                  border: `1px solid ${T.border}`,
                  borderLeft: `3px solid ${T.indigo}`,
                  borderRadius: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                }}>
                  <div>
                    <p style={{ color: T.indigoDeep, fontWeight: 700, fontSize: '0.82rem', margin: '0 0 3px', ...font }}>
                      Auto-fill Address
                    </p>
                    <p style={{ color: T.indigoMuted, fontSize: '0.74rem', margin: 0, ...font, fontWeight: 400 }}>
                      Use your current location to populate address fields automatically
                    </p>
                    {formData.latitude && (
                      <p style={{ display: 'flex', alignItems: 'center', gap: '5px', color: T.indigoText, fontSize: '0.70rem', margin: '6px 0 0', ...font, fontWeight: 600 }}>
                        <CheckCircle2 size={12} color={T.indigo} strokeWidth={2} />
                        GPS: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                  <button onClick={handleUseMyLocation} disabled={gettingLocation} className="ak-loc-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 14px', background: gettingLocation ? 'rgba(26,16,80,0.35)' : T.indigo, border: 'none', borderRadius: '2px', color: T.ivory, cursor: gettingLocation ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.74rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'opacity 0.15s', boxShadow: gettingLocation ? 'none' : `0 2px 10px ${T.shadow}`, flexShrink: 0, ...font }}>
                    {gettingLocation ? (
                      <>
                        <span style={{ width: '13px', height: '13px', border: `2px solid rgba(240,235,224,0.3)`, borderTop: `2px solid ${T.ivory}`, borderRadius: '50%', animation: 'ak-spin 0.7s linear infinite', flexShrink: 0 }} />
                        Detecting…
                      </>
                    ) : (
                      <>
                        <Navigation size={13} strokeWidth={2} />
                        Use My Location
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Address */}
              <div style={{ gridColumn: '1 / -1' }}>
                <SectionLabel>Address</SectionLabel>
                {editing
                  ? <input type="text" {...field('address')} />
                  : <ReadField>{profile.address || 'Not provided'}</ReadField>
                }
              </div>

              {/* City */}
              <div>
                <SectionLabel>City</SectionLabel>
                {editing
                  ? <input type="text" {...field('city')} />
                  : <ReadField>{profile.city || 'Not provided'}</ReadField>
                }
              </div>

              {/* State */}
              <div>
                <SectionLabel>State</SectionLabel>
                {editing
                  ? <input type="text" {...field('state')} />
                  : <ReadField>{profile.state || 'Not provided'}</ReadField>
                }
              </div>

              {/* Pincode */}
              <div>
                <SectionLabel>Pincode</SectionLabel>
                {editing
                  ? <input type="text" {...field('pincode')} maxLength="6" />
                  : <ReadField>{profile.pincode || 'Not provided'}</ReadField>
                }
              </div>

            </div>

            {/* ── Activity stats ────────────────────────────────────────── */}
            <div style={{ paddingTop: '14px', borderTop: `1px solid ${T.border}` }}>
              <p style={{ color: T.indigoDeep, fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px', ...font }}>
                Activity
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Total Bookings',  value: profile.totalBookings,     accent: T.indigo  },
                  { label: 'Reviews Given',   value: profile.totalReviewsGiven, accent: '#14643c' },
                  { label: 'Member Since',    value: new Date(profile.memberSince).toLocaleDateString([], { month: 'short', year: 'numeric' }), accent: '#4a1278' },
                ].map(({ label, value, accent }) => (
                  <div key={label} style={{
                    background: T.ivoryMid,
                    border: `1px solid ${T.border}`,
                    borderTop: `3px solid ${accent}`,
                    borderRadius: '2px',
                    padding: '10px 14px',
                  }}>
                    <p style={{ color: T.indigoMuted, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px', ...font }}>
                      {label}
                    </p>
                    <p style={{ color: T.indigoDeep, fontSize: '1.1rem', fontWeight: 800, margin: 0, ...font }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;