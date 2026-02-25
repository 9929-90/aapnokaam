import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, Users, Briefcase, Shield, Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, Navigate } from "react-router-dom";
import axios from 'axios';
import ContactSection from './Contact';
import SkillsSlider from './Skills';

// ─── API ─────────────────────────────────────────────────────────────────────
const API_BASE_URL = 'http://localhost:8081/api';
const subscribeApi = async (d) => (await axios.post(`${API_BASE_URL}/subscribe`, d)).data;

// ─── Theme Variables ────────────────────────────────────────────────────────
const T = {
  ivory:         '#f0ebe0',
  ivoryDeep:     '#e8e0ce',
  ivoryMid:      '#ede7d9',
  indigo:        '#1a1050',
  indigoDeep:    '#140c40',
  indigoHover:   '#251870',
  indigoSubtle:  'rgba(20, 10, 80, 0.06)',
  indigoTint:    'rgba(20, 10, 80, 0.10)',
  indigoSoft:    'rgba(30, 15, 80, 0.60)',
  indigoText:    'rgba(20, 10, 80, 0.75)',
  indigoMuted:   'rgba(20, 10, 80, 0.50)',
  border:        'rgba(20, 10, 80, 0.15)',
  borderStrong:  'rgba(20, 10, 80, 0.25)',
  shadow:        'rgba(20, 10, 80, 0.18)',
  shadowSoft:    'rgba(20, 10, 80, 0.09)',
};

// ─── Inline style helpers ────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: T.ivory,
    color: T.indigoDeep,
    fontFamily: "'Open Sans', sans-serif",
    position: 'relative',
  },
  jaliOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(20%2C10%2C80%2C0.045)'/%3E%3Cpath d='M0 20h40M20 0v40' stroke='rgba(20%2C10%2C80%2C0.025)' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
    pointerEvents: 'none',
    zIndex: 0,
  },
  nav: {
    position: 'fixed',
    top: 0,
    width: '100%',
    background: 'rgba(240, 235, 224, 0.96)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 50,
    borderBottom: `1px solid ${T.border}`,
    boxShadow: `0 2px 24px rgba(20,10,80,0.09)`,
  },
  navInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '68px',
  },
  logo: {
    fontSize: '1.75rem',
    fontWeight: '700',
    letterSpacing: '0.02em',
    color: T.indigo,
    fontFamily: "'Open Sans', sans-serif",
  },
  logoSpan: { color: 'rgba(26, 16, 80, 0.55)', fontStyle: 'normal' },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2.5rem',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.82rem',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    color: 'rgba(20, 10, 80, 0.75)',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: '600',
    padding: '4px 0',
    transition: 'color 0.2s',
  },
  btnPrimary: {
    padding: '0.6rem 1.6rem',
    background: T.indigo,
    color: T.ivory,
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderRadius: '2px',
    boxShadow: `0 4px 16px ${T.shadow}`,
    transition: 'background 0.2s, box-shadow 0.2s',
  },
  btnSecondary: {
    padding: '0.6rem 1.6rem',
    background: 'transparent',
    color: T.indigo,
    border: `1px solid ${T.borderStrong}`,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderRadius: '2px',
    transition: 'background 0.2s, border-color 0.2s',
  },
  section: {
    position: 'relative',
    zIndex: 1,
    padding: '5rem 2rem',
  },
  sectionInner: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  sectionAlt: {
    background: `linear-gradient(160deg, ${T.ivoryDeep} 0%, ${T.ivory} 100%)`,
    borderTop: `1px solid ${T.border}`,
    borderBottom: `1px solid ${T.border}`,
  },
  eyebrow: {
    display: 'inline-block',
    padding: '0.35rem 1.2rem',
    background: T.indigoSubtle,
    border: `1px solid ${T.border}`,
    borderRadius: '1px',
    color: 'rgba(20, 10, 80, 0.75)',
    fontSize: '0.78rem',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: '600',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '1.5rem',
  },
  h1: {
    fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)',
    fontWeight: '800',
    lineHeight: '1.12',
    color: T.indigoDeep,
    letterSpacing: '-0.01em',
    marginBottom: '1.5rem',
    fontFamily: "'Open Sans', sans-serif",
    fontStyle: 'normal',
  },
  h1Accent: { color: T.indigo, fontWeight: '800' },
  h2: {
    fontSize: 'clamp(2.1rem, 4vw, 3.2rem)',
    fontWeight: '800',
    color: T.indigoDeep,
    letterSpacing: '-0.01em',
    marginBottom: '0.75rem',
    fontFamily: "'Open Sans', sans-serif",
    fontStyle: 'normal',
  },
  h2Accent: { color: T.indigo, fontWeight: '800' },
  h3: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: T.indigoDeep,
    marginBottom: '0.75rem',
    fontFamily: "'Open Sans', sans-serif",
    fontStyle: 'normal',
  },
  bodyText: {
    color: 'rgba(20, 10, 80, 0.82)',
    lineHeight: '1.85',
    fontSize: '1.15rem',
  },
  card: {
    background: T.ivory,
    border: `1px solid ${T.border}`,
    borderRadius: '3px',
    padding: '2rem',
    boxShadow: `0 4px 24px rgba(20,10,80,0.09)`,
    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
  },
  iconBox: {
    width: '3rem',
    height: '3rem',
    background: T.indigoSubtle,
    border: `1px solid ${T.border}`,
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem',
    flexShrink: 0,
  },
  statNum: {
    fontSize: '2rem',
    fontWeight: '800',
    color: T.indigo,
    fontFamily: "'Open Sans', sans-serif",
    fontStyle: 'normal',
  },
  statLabel: {
    fontSize: '0.82rem',
    color: 'rgba(20, 10, 80, 0.72)',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: '600',
    marginTop: '0.15rem',
  },
  input: {
    width: '100%',
    padding: '0.85rem 1rem',
    background: T.ivory,
    border: `1px solid ${T.borderStrong}`,
    borderRadius: '2px',
    color: T.indigoDeep,
    fontSize: '1rem',
    fontFamily: "'Open Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(20, 10, 80, 0.75)',
    marginBottom: '0.5rem',
  },
  ornament: {
    textAlign: 'center',
    color: T.indigoSoft,
    fontSize: '1.2rem',
    letterSpacing: '0.3em',
    margin: '0.5rem 0',
    opacity: 0.4,
    userSelect: 'none',
  },
  footerBase: {
    background: T.indigoDeep,
    color: T.ivory,
    borderTop: `1px solid ${T.border}`,
    padding: '4rem 2rem 2rem',
    position: 'relative',
    zIndex: 1,
  },
  footerHeading: {
    fontSize: '0.82rem',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: `rgba(240,235,224,0.75)`,
    marginBottom: '1.25rem',
  },
  footerLink: {
    color: `rgba(240,235,224,0.80)`,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: '600',
    padding: 0,
    textDecoration: 'none',
    display: 'block',
    marginBottom: '0.5rem',
    transition: 'color 0.2s',
    lineHeight: '1.6',
  },
};

// ─── Google Fonts Loader ─────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .nav-link:hover { color: ${T.indigo} !important; }
    .btn-primary:hover { background: ${T.indigoHover} !important; box-shadow: 0 6px 24px rgba(20,10,80,0.32) !important; }
    .btn-secondary:hover { background: ${T.indigoSubtle} !important; border-color: ${T.indigo} !important; }
    .card-hover:hover {
      border-color: rgba(26,16,80,0.35) !important;
      box-shadow: 0 8px 40px rgba(20,10,80,0.13) !important;
      transform: translateY(-2px);
    }
    .footer-link:hover { color: rgba(240,235,224,1) !important; }
    .input-focus:focus { border-color: ${T.indigo} !important; box-shadow: 0 0 0 3px rgba(26,16,80,0.08); }
    .social-icon:hover { background: rgba(240,235,224,0.12) !important; }
    .mobile-nav-btn:hover { background: ${T.indigoSubtle}; color: ${T.indigo} !important; }
    .stat-divider { width: 1px; height: 3rem; background: ${T.border}; }
    em, i { font-style: normal !important; }

    .faq-item { transition: border-color 0.2s, box-shadow 0.2s; }
    .faq-item:hover { border-color: rgba(26,16,80,0.30) !important; }
    .faq-btn:hover { background: rgba(20,10,80,0.04) !important; }

    /* ── Newsletter section ── */
    .nl-input::placeholder { color: rgba(20,10,80,0.35); font-family: 'Open Sans', sans-serif; font-size: 0.9rem; }
    .nl-input:focus { outline: none; border-color: ${T.indigo} !important; }
    .nl-sub-btn:hover:not(:disabled) { background: ${T.indigoHover} !important; }
    .nl-feature-card:hover { border-color: rgba(26,16,80,0.28) !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(20,10,80,0.12) !important; }
    @keyframes ak-spin { to { transform: rotate(360deg); } }
    .ak-animate-spin { animation: ak-spin 0.9s linear infinite; }
    @keyframes checkPop { 0% { transform: scale(0.6); opacity: 0; } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
    .check-pop { animation: checkPop 0.4s ease forwards; }

    @media (max-width: 768px) {
      .hero-grid      { grid-template-columns: 1fr !important; }
      .about-grid     { grid-template-columns: 1fr !important; }
      .features-grid  { grid-template-columns: 1fr !important; }
      .faq-map-grid   { grid-template-columns: 1fr !important; }
      .contact-grid   { grid-template-columns: 1fr !important; }
      .footer-grid    { grid-template-columns: 1fr 1fr !important; }
      .stats-row      { gap: 1.5rem !important; }
      .desktop-nav    { display: none !important; }
      .mobile-menu-btn { display: block !important; }
      .hero-card      { display: none !important; }
      .nl-grid        { grid-template-columns: 1fr !important; }
      .nl-features    { grid-template-columns: 1fr 1fr !important; }
    }
    @media (min-width: 769px) {
      .mobile-menu-btn { display: none !important; }
    }
  `}</style>
);

// ─── Spinner (ivory) ──────────────────────────────────────────────────────────
const IconSpinIvory = ({ sz = 16 }) => (
  <svg className="ak-animate-spin" width={sz} height={sz} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={T.ivory} strokeWidth="3" opacity="0.2"/>
    <path fill={T.ivory} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.85"/>
  </svg>
);

// ─── Newsletter Section ───────────────────────────────────────────────────────
const NewsletterSection = () => {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [msg,    setMsg]    = useState('');
  const inputRef            = useRef(null);

  const isValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleSubmit = async () => {
    if (!isValid(email)) {
      setStatus('error');
      setMsg('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    try {
      const r = await subscribeApi({ email: email.trim().toLowerCase() });
      if (r.success) {
        setStatus('success');
        setMsg(r.message || "You're subscribed — welcome aboard!");
        setEmail('');
      } else {
        setStatus('error');
        setMsg(r.message || 'Something went wrong. Please try again.');
      }
    } catch (ex) {
      setStatus('error');
      setMsg(ex.response?.data?.message || 'Network error. Please try again.');
    }
  };

  // Auto-clear error after 4 s
  useEffect(() => {
    if (status === 'error') {
      const t = setTimeout(() => { setStatus('idle'); setMsg(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const features = [
    { icon: '🔔', label: 'Platform Updates',    desc: 'New features & improvements' },
    { icon: '⭐', label: 'Worker Spotlights',   desc: 'Stories from our community'  },
    { icon: '💡', label: 'Tips & Guides',        desc: 'Make the most of the platform' },
    { icon: '🚫', label: 'Zero Spam',            desc: 'Unsubscribe anytime via link'  },
  ];

  return (
    <section
      id="newsletter"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '5rem 2rem',
        background: T.indigo,
        borderTop: `1px solid rgba(240,235,224,0.1)`,
        overflow: 'hidden',
      }}
    >
      {/* Decorative background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(240%2C235%2C224%2C0.06)'/%3E%3Cpath d='M0 20h40M20 0v40' stroke='rgba(240%2C235%2C224%2C0.04)' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.35rem 1.2rem',
            background: 'rgba(240,235,224,0.10)',
            border: `1px solid rgba(240,235,224,0.18)`,
            borderRadius: '1px',
            marginBottom: '1.5rem',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.ivory} strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span style={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(240,235,224,0.75)',
            }}>Stay in the Loop</span>
          </div>

          <h2 style={{
            fontFamily: "'Open Sans', sans-serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            color: T.ivory,
            letterSpacing: '-0.01em',
            margin: '0 0 1rem',
            lineHeight: 1.15,
          }}>
            The aapnokaam{' '}
            <span style={{ color: 'rgba(240,235,224,0.55)' }}>Newsletter</span>
          </h2>

          {/* Ornament */}
          <div style={{ textAlign: 'center', lineHeight: 1, opacity: 0.3, margin: '6px 0 0' }}>
            <svg width="90" height="16" viewBox="0 0 90 16" fill="none">
              <line x1="0" y1="8" x2="32" y2="8" stroke={T.ivory} strokeWidth="0.8"/>
              <circle cx="38" cy="8" r="2" fill={T.ivory}/>
              <circle cx="45" cy="8" r="3.5" fill="none" stroke={T.ivory} strokeWidth="0.8"/>
              <circle cx="52" cy="8" r="2" fill={T.ivory}/>
              <line x1="58" y1="8" x2="90" y2="8" stroke={T.ivory} strokeWidth="0.8"/>
            </svg>
          </div>

          <p style={{
            fontFamily: "'Open Sans', sans-serif",
            fontSize: '1.05rem',
            fontWeight: '500',
            color: 'rgba(240,235,224,0.65)',
            margin: '1.25rem auto 0',
            maxWidth: '520px',
            lineHeight: 1.8,
          }}>
            Platform updates, worker spotlights &amp; new features — delivered to your inbox. No spam, ever.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div
          className="nl-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3.5rem',
            alignItems: 'center',
            maxWidth: '960px',
            margin: '0 auto',
          }}
        >
          {/* Left — feature pills */}
          <div>
            <div
              className="nl-features"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.75rem',
              }}
            >
              {features.map(({ icon, label, desc }) => (
                <div
                  key={label}
                  className="nl-feature-card"
                  style={{
                    background: 'rgba(240,235,224,0.07)',
                    border: `1px solid rgba(240,235,224,0.14)`,
                    borderRadius: '3px',
                    padding: '1rem 1.1rem',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem', lineHeight: 1 }}>{icon}</div>
                  <div style={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    color: T.ivory,
                    marginBottom: '0.2rem',
                    letterSpacing: '0.02em',
                  }}>{label}</div>
                  <div style={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: '500',
                    fontSize: '0.73rem',
                    color: 'rgba(240,235,224,0.50)',
                    letterSpacing: '0.02em',
                    lineHeight: 1.5,
                  }}>{desc}</div>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.65rem 1rem',
              background: 'rgba(240,235,224,0.06)',
              border: `1px solid rgba(240,235,224,0.10)`,
              borderLeft: `3px solid rgba(240,235,224,0.28)`,
              borderRadius: '2px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,235,224,0.55)" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <p style={{
                fontFamily: "'Open Sans', sans-serif",
                fontSize: '0.73rem',
                fontWeight: '500',
                color: 'rgba(240,235,224,0.50)',
                margin: 0,
                lineHeight: 1.55,
              }}>
                Your email is safe. We never share or sell your data.{' '}
                <Link to="/privacy-policy" style={{ color: 'rgba(240,235,224,0.7)', fontWeight: '700', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  Privacy Policy
                </Link>
                
              </p>
            </div>
          </div>

          {/* Right — form card */}
          <div style={{
            background: T.ivoryMid,
            border: `1px solid ${T.borderStrong}`,
            borderRadius: '3px',
            padding: '2.25rem 2rem',
            boxShadow: `0 16px 48px rgba(0,0,0,0.25)`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Corner accents */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', width: '18px', height: '18px', borderTop: `1.5px solid ${T.border}`, borderRight: `1.5px solid ${T.border}`, opacity: 0.5 }} />
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '18px', height: '18px', borderBottom: `1.5px solid ${T.border}`, borderLeft: `1.5px solid ${T.border}`, opacity: 0.5 }} />

            {status !== 'success' ? (
              <>
                <p style={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: T.indigoMuted,
                  margin: '0 0 1.5rem',
                }}>Join the community</p>

                {/* Error message */}
                {status === 'error' && (
                  <div style={{
                    borderLeft: `3px solid #b91c1c`,
                    background: 'rgba(185,28,28,0.07)',
                    color: '#b91c1c',
                    padding: '8px 12px',
                    marginBottom: '14px',
                    fontSize: '0.78rem',
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: '600',
                    letterSpacing: '0.04em',
                    lineHeight: 1.55,
                    borderRadius: '1px',
                  }}>{msg}</div>
                )}

                {/* Email input */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: T.ivory,
                  border: `1px solid ${status === 'error' ? '#b91c1c' : T.borderStrong}`,
                  borderRadius: '2px',
                  padding: '0 12px',
                  marginBottom: '10px',
                  transition: 'border-color 0.18s',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.indigoMuted} strokeWidth="1.6" style={{ flexShrink: 0 }}>
                    <rect x="2" y="4" width="20" height="16" rx="1"/>
                    <polyline points="2,4 12,13 22,4"/>
                  </svg>
                  <input
                    ref={inputRef}
                    className="nl-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (status === 'error') { setStatus('idle'); setMsg(''); } }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    disabled={status === 'loading'}
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: T.indigoDeep,
                      fontFamily: "'Open Sans', sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      width: '100%',
                      padding: '12px 0',
                    }}
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                  className="nl-sub-btn"
                  style={{
                    width: '100%',
                    padding: '11px 0',
                    background: status === 'loading' ? 'rgba(26,16,80,0.60)' : T.indigo,
                    color: T.ivory,
                    border: 'none',
                    borderRadius: '2px',
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.18s',
                    boxShadow: `0 4px 16px rgba(20,10,80,0.22)`,
                    marginBottom: '12px',
                  }}
                >
                  {status === 'loading' ? (
                    <><IconSpinIvory sz={14} /> Subscribing…</>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22,2 15,22 11,13 2,9"/>
                      </svg>
                      Subscribe — it's free
                    </>
                  )}
                </button>

                <p style={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '0.66rem',
                  fontWeight: '500',
                  color: T.indigoMuted,
                  margin: 0,
                  letterSpacing: '0.02em',
                  opacity: 0.75,
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}>
                  By subscribing you agree to our{' '}
                  <Link to="/privacy-policy" style={{ color: T.indigoText, fontWeight: '600', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    Privacy Policy
                  </Link>. Unsubscribe anytime.
                </p>
              </>
            ) : (
              /* ── Success state ── */
              <div style={{
                textAlign: 'center',
                padding: '1.5rem 0.5rem',
              }}>
                <div className="check-pop" style={{
                  width: '52px',
                  height: '52px',
                  margin: '0 auto 1.25rem',
                  border: `1px solid ${T.indigo}`,
                  background: T.indigoSubtle,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.indigo,
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <p style={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  color: T.indigoDeep,
                  margin: '0 0 0.5rem',
                  letterSpacing: '0.01em',
                }}>You're subscribed!</p>
                <p style={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: '500',
                  fontSize: '0.88rem',
                  color: T.indigoMuted,
                  margin: 0,
                  lineHeight: 1.65,
                }}>{msg}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom subscriber count strip ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '3rem',
          opacity: 0.5,
        }}>
          <div style={{ height: '1px', width: '60px', background: 'rgba(240,235,224,0.3)' }} />
          <p style={{
            fontFamily: "'Open Sans', sans-serif",
            fontSize: '0.72rem',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'rgba(240,235,224,0.65)',
            margin: 0,
          }}>
            Join our growing community
          </p>
          <div style={{ height: '1px', width: '60px', background: 'rgba(240,235,224,0.3)' }} />
        </div>

      </div>
    </section>
  );
};

// ─── Decorative Arch Divider ─────────────────────────────────────────────────
const ArchDivider = () => (
  <div style={{ textAlign: 'center', lineHeight: 1, margin: '0.5rem 0 0', opacity: 0.35 }}>
    <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18 Q60 2 110 18" stroke={T.indigo} strokeWidth="1" fill="none"/>
      <circle cx="10" cy="18" r="2" fill={T.indigo}/>
      <circle cx="60" cy="4" r="2" fill={T.indigo}/>
      <circle cx="110" cy="18" r="2" fill={T.indigo}/>
      <line x1="0" y1="18" x2="10" y2="18" stroke={T.indigo} strokeWidth="1"/>
      <line x1="110" y1="18" x2="120" y2="18" stroke={T.indigo} strokeWidth="1"/>
    </svg>
  </div>
);

// ─── Section Heading ─────────────────────────────────────────────────────────
const SectionHeading = ({ top, accent, rest }) => (
  <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
    <div style={styles.ornament}>✦ ✦ ✦</div>
    <h2 style={styles.h2}>
      {top && <>{top} </>}
      <span style={styles.h2Accent}>{accent}</span>
      {rest && <>{rest}</>}
    </h2>
    <ArchDivider />
  </div>
);

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'What is AapnoKaam and how does it work?',
    a: 'AapnoKaam is a hyperlocal platform that connects skilled workers — carpenters, electricians, plumbers, painters, and more — with consumers who need their services in Udaipur and nearby areas. Simply sign up, search for workers near you using GPS, book a service, and pay securely via Razorpay.',
  },
  {
    q: 'How do I find workers near my location?',
    a: 'On your consumer dashboard, open the "Find Workers" section and tap "Use My Location." The platform will request your GPS coordinates and surface all available, verified workers within a 5km radius, sorted by rating.',
  },
  {
    q: 'Are all workers on AapnoKaam verified?',
    a: 'Yes. Every worker profile goes through a manual approval process before going live. Workers submit their PAN number for identity verification, and new worker accounts are reviewed and approved by the platform admin before they can accept bookings.',
  },
  {
    q: 'How does the booking process work?',
    a: 'Browse workers, select one, and click "Book Now." Fill in the service details, date, time, and address. You\'ll see an estimated cost before confirming. Once you confirm and complete payment via Razorpay, the worker is notified and the booking is tracked on your dashboard.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'AapnoKaam uses Razorpay for secure payment processing, which supports UPI, credit/debit cards, net banking, and popular wallets. AapnoKaam itself never stores your card or bank details — all payment data is handled by Razorpay under PCI-DSS compliance.',
  },
  {
    q: 'Can I cancel a booking after it is confirmed?',
    a: 'Yes. Consumers can cancel a booking from their dashboard as long as the booking has not been marked "In Progress." Cancellations past this point may require contacting support. Refund eligibility depends on the cancellation timing and is processed through Razorpay.',
  },
  {
    q: 'How do I leave a review for a worker?',
    a: 'After a booking is marked "Completed," a "Write a Review" button appears on that booking in your dashboard. You can rate the worker out of 5 stars and leave a written comment. Reviews are public and help other consumers make informed decisions.',
  },
  {
    q: 'I am a skilled worker — how do I sign up?',
    a: 'Register as a "Worker" on the sign-up page. Complete your profile with your skill category, hourly rate, city, and PAN number for verification. Your account will be reviewed by the admin. Once approved, your profile becomes visible to consumers searching in your area.',
  },
  {
    q: 'Is my personal data safe on AapnoKaam?',
    a: 'We take privacy seriously. Passwords are hashed and never stored in plain text. Payment data is handled exclusively by Razorpay. Location is used only to find nearby workers and is not stored beyond the active session. Read our full Privacy Policy for details.',
  },
  {
    q: 'Who built AapnoKaam and how can I get support?',
    a: 'AapnoKaam is built by Rohit, a fullstack developer from Udaipur, Rajasthan, learning to build SaaS products. It\'s a real, actively developed platform — not a mockup. For support, reach out via the Contact form on this page or email support@aapnokaam.in.',
  },
];

// ─── FAQ Item Component ───────────────────────────────────────────────────────
const FAQItem = ({ item, index, isOpen, onToggle }) => (
  <div
    className="faq-item"
    style={{
      background: T.ivory,
      border: `1px solid ${isOpen ? T.borderStrong : T.border}`,
      borderLeft: `3px solid ${isOpen ? T.indigo : T.border}`,
      borderRadius: '2px',
      transition: 'border-color 0.2s',
    }}
  >
    <button
      className="faq-btn"
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.1rem 1.4rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        borderRadius: '2px',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '22px',
          height: '22px',
          background: isOpen ? T.indigo : T.indigoSubtle,
          border: `1px solid ${isOpen ? T.indigo : T.border}`,
          borderRadius: '1px',
          color: isOpen ? T.ivory : 'rgba(20,10,80,0.55)',
          fontSize: '0.62rem',
          fontWeight: '800',
          fontFamily: "'Open Sans', sans-serif",
          flexShrink: 0,
          transition: 'background 0.2s, color 0.2s',
          letterSpacing: 0,
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span style={{
          fontFamily: "'Open Sans', sans-serif",
          fontWeight: isOpen ? '700' : '600',
          fontSize: '1rem',
          color: isOpen ? T.indigoDeep : 'rgba(20,10,80,0.82)',
          lineHeight: '1.4',
          transition: 'color 0.2s',
        }}>
          {item.q}
        </span>
      </div>
      <span style={{ flexShrink: 0, color: isOpen ? T.indigo : 'rgba(20,10,80,0.4)', transition: 'color 0.2s' }}>
        {isOpen ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
      </span>
    </button>

    {isOpen && (
      <div style={{
        padding: '0 1.4rem 1.25rem 3.85rem',
        borderTop: `1px solid ${T.border}`,
        paddingTop: '1rem',
      }}>
        <p style={{
          fontFamily: "'Open Sans', sans-serif",
          fontSize: '0.96rem',
          color: 'rgba(20,10,80,0.75)',
          lineHeight: '1.85',
          margin: 0,
        }}>
          {item.a}
        </p>
      </div>
    )}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Home({ isLoggedIn = false, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav]         = useState(null);
  const [openFaq, setOpenFaq]               = useState(0);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) { element.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }
  };

  const handleCTAClick = () => {
    if (onNavigate) { onNavigate(isLoggedIn ? '/dashboard' : '/login'); }
    else { window.location.href = isLoggedIn ? '/dashboard' : '/login'; }
  };

  const toggleFaq = (i) => setOpenFaq(prev => prev === i ? null : i);

  const NAV_IDS = ['home', 'about', 'features', 'faq', 'newsletter', 'contact'];

  return (
    <div style={styles.page}>
      <FontLoader />
      <div style={styles.jaliOverlay} />

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <h1 style={styles.logo}>aapno<span style={styles.logoSpan}>kaam</span></h1>

          <div className="desktop-nav" style={styles.navLinks}>
            {NAV_IDS.map((id) => (
              <button key={id} className="nav-link" onClick={() => scrollToSection(id)}
                style={{
                  ...styles.navBtn,
                  color: hoveredNav === id ? T.indigo : 'rgba(20, 10, 80, 0.75)',
                  borderBottom: hoveredNav === id ? `1px solid ${T.indigo}` : '1px solid transparent',
                  paddingBottom: '3px',
                }}
                onMouseEnter={() => setHoveredNav(id)} onMouseLeave={() => setHoveredNav(null)}>
                {id === 'newsletter' ? 'Newsletter' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <button className="btn-primary" onClick={handleCTAClick} style={styles.btnPrimary}>
              {isLoggedIn ? 'Dashboard' : 'Get Started'}
            </button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.indigo }}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ background: T.ivory, borderTop: `1px solid ${T.border}`, padding: '1rem 1.5rem 1.5rem' }}>
            {NAV_IDS.map((id) => (
              <button key={id} className="mobile-nav-btn" onClick={() => scrollToSection(id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.65rem 0.75rem', marginBottom: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: "'Open Sans', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: T.indigoSoft, borderRadius: '2px' }}>
                {id === 'newsletter' ? 'Newsletter' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <button className="btn-primary" onClick={handleCTAClick} style={{ ...styles.btnPrimary, width: '100%', marginTop: '0.75rem' }}>
              {isLoggedIn ? 'Dashboard' : 'Get Started'}
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="home" style={{ ...styles.section, paddingTop: '7rem', minHeight: '100vh', display: 'flex', alignItems: 'center', background: `radial-gradient(ellipse 70% 60% at 85% 50%, rgba(26,16,80,0.05) 0%, transparent 70%), ${T.ivory}` }}>
        <div style={styles.sectionInner}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={styles.eyebrow}>✦ Connecting Skills with Opportunities ✦</div>
              <h1 style={styles.h1}>
                Find <span style={styles.h1Accent}>Skilled Workers</span>{' '}or Get{' '}
                <span style={{ ...styles.h1Accent, color: 'rgba(20, 10, 80, 0.70)', fontStyle: 'normal' }}>Hired</span>{' '}Today
              </h1>
              <p style={{ ...styles.bodyText, maxWidth: '520px', marginBottom: '2.5rem' }}>
                India's premier platform connecting skilled workers with businesses. Whether you're looking for talent or seeking opportunities, aapnokaam makes it simple, fast, and reliable.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                <button className="btn-primary" onClick={handleCTAClick} style={{ ...styles.btnPrimary, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem', fontSize: '0.82rem' }}>
                  {isLoggedIn ? 'Go to Dashboard' : 'Find Workers'}<ArrowRight size={16} />
                </button>
                <button className="btn-secondary" onClick={handleCTAClick} style={{ ...styles.btnSecondary, padding: '0.9rem 2rem', fontSize: '0.82rem' }}>
                  {isLoggedIn ? 'Dashboard' : 'Find Work'}
                </button>
              </div>
              <div className="stats-row" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <div><div style={styles.statNum}>10,000+</div><div style={styles.statLabel}>Active Workers</div></div>
                <div className="stat-divider" />
                <div><div style={styles.statNum}>5,000+</div><div style={styles.statLabel}>Happy Clients</div></div>
                <div className="stat-divider" />
                <div><div style={styles.statNum}>50+</div><div style={styles.statLabel}>Skill Categories</div></div>
              </div>
            </div>

            <div className="hero-card" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-24px', border: `1px solid ${T.border}`, borderRadius: '4px', background: `radial-gradient(ellipse at center, rgba(26,16,80,0.03) 0%, transparent 70%)` }} />
              <div style={{ position: 'relative', background: T.ivoryMid, border: `1px solid ${T.borderStrong}`, borderRadius: '3px', padding: '2.5rem 2rem', boxShadow: `0 12px 48px rgba(20,10,80,0.09), 0 2px 8px ${T.shadow}` }}>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem', opacity: 0.3 }}>
                  <svg width="80" height="30" viewBox="0 0 80 30" fill="none">
                    <path d="M0 28 Q20 8 40 16 Q60 24 80 4" stroke={T.indigo} strokeWidth="1" fill="none"/>
                    <circle cx="0" cy="28" r="2" fill={T.indigo}/><circle cx="40" cy="16" r="2" fill={T.indigo}/><circle cx="80" cy="4" r="2" fill={T.indigo}/>
                  </svg>
                </div>
                {[
                  { icon: Briefcase, label: 'Skilled Professionals', sub: 'Verified & Rated' },
                  { icon: Shield,    label: 'Secure Platform',       sub: 'Safe & Trusted'  },
                  { icon: Users,     label: 'Easy Hiring',           sub: 'Quick & Simple'  },
                ].map(({ icon: Icon, label, sub }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: T.ivory, border: `1px solid ${T.border}`, borderRadius: '2px', marginBottom: i < 2 ? '0.75rem' : 0 }}>
                    <div style={styles.iconBox}><Icon size={20} color={T.indigo} strokeWidth={1.5} /></div>
                    <div>
                      <div style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: '700', color: T.indigoDeep, fontSize: '1.15rem', fontStyle: 'normal' }}>{label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(20, 10, 80, 0.65)', letterSpacing: '0.06em', fontFamily: "'Open Sans', sans-serif", fontWeight: '600', textTransform: 'uppercase' }}>{sub}</div>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: 'center', marginTop: '1.75rem', opacity: 0.3 }}>
                  <div style={{ fontSize: '0.85rem', letterSpacing: '0.35em', color: T.indigo }}>◇ ◆ ◇</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SkillsSlider
  isLoggedIn={false}
  onNavigateToLogin={(skill) =>
    navigate('/login', { state: { from: 'skills', skill } })
  }
/>

      {/* ── About ───────────────────────────────────────────────────────── */}
      <section id="about" style={{ ...styles.section, ...styles.sectionAlt }}>
        <div style={styles.sectionInner}>
          <SectionHeading top="About" accent="aapnokaam" />
          <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(20, 10, 80, 0.72)', marginBottom: '0.6rem' }}>Our Mission</div>
              <h3 style={{ ...styles.h3, fontStyle: 'normal', marginBottom: '1.25rem' }}>Bridging Talent & Opportunity</h3>
              <p style={{ ...styles.bodyText, marginBottom: '1.25rem' }}>At aapnokaam, we believe in empowering India's skilled workforce. Our platform connects talented professionals with businesses that need their expertise, creating opportunities and driving growth across communities.</p>
              <p style={{ ...styles.bodyText, marginBottom: '2rem' }}>Whether you're a carpenter, electrician, plumber, painter, or any skilled professional, aapnokaam helps you showcase your skills and connect with clients who value your work.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                {['Verified Professionals', 'Secure Payments', '24/7 Support'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '6px', height: '6px', background: T.indigo, borderRadius: '50%', opacity: 0.6 }} />
                    <span style={{ fontSize: '0.85rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '600', color: 'rgba(20, 10, 80, 0.78)', letterSpacing: '0.06em' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { icon: Users,    num: '10,000+', label: 'Registered Workers' },
                { icon: Briefcase,num: '5,000+',  label: 'Jobs Completed'     },
                { icon: Shield,   num: '100%',    label: 'Secure Platform'    },
                { icon: Users,    num: '50+',     label: 'Skill Categories'   },
              ].map(({ icon: Icon, num, label }, i) => (
                <div key={i} className="card-hover" style={{ ...styles.card, background: T.ivory, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ ...styles.iconBox, marginBottom: '1rem' }}><Icon size={18} color={T.indigo} strokeWidth={1.5} /></div>
                  <div style={styles.statNum}>{num}</div>
                  <div style={{ ...styles.statLabel, textAlign: 'left', marginTop: '0.35rem' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionInner}>
          <SectionHeading top="Why Choose" accent="aapnokaam" rest="?" />
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { icon: Users,    title: 'For Workers',    body: 'Create your profile, showcase your skills, get discovered by clients, and grow your business with verified reviews and ratings.' },
              { icon: Briefcase,title: 'For Businesses', body: 'Find verified skilled professionals instantly, compare profiles, check reviews, and hire with confidence for any project.'      },
              { icon: Shield,   title: 'Secure & Safe',  body: 'All profiles are verified, payments are secure, and our support team is always ready to help both workers and clients.'        },
            ].map(({ icon: Icon, title, body }, i) => (
              <div key={i} className="card-hover" style={{ ...styles.card, background: T.ivoryMid, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '24px', height: '24px', opacity: 0.12, borderTop: `2px solid ${T.indigo}`, borderRight: `2px solid ${T.indigo}` }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', width: '24px', height: '24px', opacity: 0.12, borderBottom: `2px solid ${T.indigo}`, borderLeft: `2px solid ${T.indigo}` }} />
                <div style={{ ...styles.iconBox, width: '3.5rem', height: '3.5rem' }}><Icon size={22} color={T.indigo} strokeWidth={1.5} /></div>
                <h3 style={styles.h3}>{title}</h3>
                <p style={{ ...styles.bodyText, fontSize: '1.08rem', marginBottom: '1.5rem' }}>{body}</p>
                <button className="nav-link" onClick={handleCTAClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.indigo, fontFamily: "'Open Sans', sans-serif", fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0, fontWeight: '700', opacity: 0.9 }}>
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <NewsletterSection />

      {/* ── FAQ + Map ───────────────────────────────────────────────────── */}
      <section id="faq" style={{ ...styles.section, ...styles.sectionAlt }}>
        <div style={styles.sectionInner}>
          <SectionHeading top="Frequently Asked" accent="Questions" />

          <div className="faq-map-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>

            {/* ── FAQ accordion ──────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem key={i} item={item} index={i} isOpen={openFaq === i} onToggle={() => toggleFaq(i)} />
              ))}
            </div>

            {/* ── Map + info ─────────────────────────────────────────── */}
            <div style={{ position: 'sticky', top: '88px' }}>
              <div style={{
                background: T.ivory,
                border: `1px solid ${T.borderStrong}`,
                borderTop: `3px solid ${T.indigo}`,
                borderRadius: '3px',
                overflow: 'hidden',
                boxShadow: `0 8px 32px rgba(20,10,80,0.09)`,
                marginBottom: '1rem',
              }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', background: T.indigo, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={15} color={T.ivory} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: '800', fontSize: '0.88rem', color: T.indigoDeep, margin: 0 }}>Our Base — Udaipur, Rajasthan</p>
                    <p style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: '500', fontSize: '0.72rem', color: 'rgba(20,10,80,0.55)', margin: 0, letterSpacing: '0.03em' }}>City of Lakes · 24.5854° N, 73.7125° E</p>
                  </div>
                </div>
                <iframe
                  title="AapnoKaam — Udaipur, Rajasthan"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=73.6725%2C24.5554%2C73.7525%2C24.6154&layer=mapnik&marker=24.5854%2C73.7125"
                  style={{ width: '100%', height: '340px', border: 'none', display: 'block', filter: 'sepia(0.18) contrast(1.04)' }}
                  loading="lazy"
                  allowFullScreen
                />
                <div style={{ padding: '0.85rem 1.25rem', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.72rem', color: 'rgba(20,10,80,0.45)', fontWeight: '500' }}>
                    © OpenStreetMap contributors
                  </span>
                  <a href="https://www.openstreetmap.org/?mlat=24.5854&mlon=73.7125#map=14/24.5854/73.7125" target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.72rem', color: T.indigo, fontWeight: '700', textDecoration: 'none', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Open in Maps ↗
                  </a>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { Icon: Mail,  label: 'Email',    value: 'rohit@aapnokaam.in' },
                  { Icon: Phone, label: 'Platform',  value: 'aapnokaam.in'       },
                ].map(({ Icon, label, value }) => (
                  <div key={label} style={{ background: T.ivory, border: `1px solid ${T.border}`, borderRadius: '2px', padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: `0 2px 8px rgba(20,10,80,0.09)` }}>
                    <div style={{ width: '28px', height: '28px', background: T.indigoSubtle, border: `1px solid ${T.border}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color={T.indigo} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.62rem', fontWeight: '700', color: 'rgba(20,10,80,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
                      <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.82rem', fontWeight: '600', color: T.indigoDeep, margin: 0 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* ── Contact ─────────────────────────────────────────────────────── */}
     <ContactSection/>


      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={styles.footerBase}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, rgba(240,235,224,0.15), transparent)` }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>

            <div>
              <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1.6rem', fontWeight: '700', color: T.ivory, marginBottom: '1rem', letterSpacing: '0.03em' }}>
                aapno<span style={{ opacity: 0.55 }}>kaam</span>
              </h2>
              <p style={{ color: 'rgba(240,235,224,0.75)', lineHeight: '1.8', fontSize: '1.05rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '500', maxWidth: '340px', marginBottom: '1.5rem' }}>
                Connecting India's skilled workforce with opportunities. Built with ❤ in Udaipur, Rajasthan.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  <path key="fb" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />,
                  <path key="tw" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />,
                  <path key="li" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />,
                ].map((pathEl, i) => (
                  <a key={i} href="#" className="social-icon" style={{ width: '2.25rem', height: '2.25rem', border: `1px solid rgba(240,235,224,0.15)`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(240,235,224,0.06)', transition: 'background 0.2s' }}>
                    <svg style={{ width: '1rem', height: '1rem', fill: 'rgba(240,235,224,0.6)' }} viewBox="0 0 24 24">{pathEl}</svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 style={styles.footerHeading}>Quick Links</h3>
              {[
                { label: 'About Us',    action: () => scrollToSection('about')      },
                { label: 'Features',    action: () => scrollToSection('features')   },
                { label: 'FAQ',         action: () => scrollToSection('faq')        },
                { label: 'Newsletter',  action: () => scrollToSection('newsletter') },
                { label: 'Contact',     action: () => scrollToSection('contact')    },
              ].map(({ label, action }, i) => (
                <button key={i} onClick={action} className="footer-link" style={styles.footerLink}>{label}</button>
              ))}
            </div>

            <div>
              <h3 style={styles.footerHeading}>Legal</h3>
              <Link to="/privacy-policy" className="footer-link" style={styles.footerLink}>Privacy Policy</Link>
              <a href="#" className="footer-link" style={styles.footerLink}>Terms of Service</a>
              <a href="#" className="footer-link" style={styles.footerLink}>Cookie Policy</a>
              <a href="#" className="footer-link" style={styles.footerLink}>Refund Policy</a>
              <a href="/AapnoKaam_Documentation.docx" download>
                 Download Documentation
              </a>
            </div>
          </div>

          <div style={{ borderTop: `1px solid rgba(240,235,224,0.1)`, paddingTop: '1.75rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.82rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '600', color: 'rgba(240,235,224,0.55)', letterSpacing: '0.06em' }}>
              © 2026 aapnokaam · Rohit, Udaipur. All rights reserved.
            </p>
            <p style={{ fontSize: '1rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '600', color: 'rgba(240,235,224,0.6)', letterSpacing: '0.04em' }}>
              Made with <span style={{ color: 'rgba(240,235,224,0.55)' }}>❤</span> in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}