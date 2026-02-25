import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import WorkerDashboard from './WorkerDashboard';
import ConsumerDashboard from './ConsumerDashboard';
import AdminDashboard from './AdminDashboard';
import { AuthProvider, useAuth, AuthInterceptor } from './AuthContext';
import Home from './Home';
import PrivacyPolicy from './PrivacyPolicy';
import GoogleAuthButton, { GoogleDivider } from './GoogleAuthButton';

const API_BASE_URL = 'http://localhost:8081/api';
axios.defaults.baseURL = API_BASE_URL;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const api = {
  registerConsumer:   async (d) => (await axios.post('/auth/register/consumer', d)).data,
  registerWorker:     async (d) => (await axios.post('/auth/register/worker', d)).data,
  verifyEmail:        async (t) => (await axios.get(`/auth/verify-email?token=${t}`)).data,
  resendVerification: async (e) => (await axios.post('/auth/resend-verification', { email: e })).data,
  login:              async (d) => (await axios.post('/auth/login', d)).data,
  workerLogin:        async (d) => (await axios.post('/auth/login/worker', d)).data,
  // ── Forgot Password ──────────────────────────────────────────────────────
  forgotPassword:     async (d) => (await axios.post('/auth/forgot-password', d)).data,
  verifyOtp:          async (d) => (await axios.post('/auth/verify-otp', d)).data,
  resetPassword:      async (d) => (await axios.post('/auth/reset-password', d)).data,
  googleLogin: async (d) => (await axios.post('/auth/google', d)).data,
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
  indigoText:   'rgba(20, 10, 80, 0.75)',
  indigoMuted:  'rgba(20, 10, 80, 0.50)',
  border:       'rgba(20, 10, 80, 0.15)',
  borderStrong: 'rgba(20, 10, 80, 0.28)',
  shadow:       'rgba(20, 10, 80, 0.14)',
  shadowSoft:   'rgba(20, 10, 80, 0.07)',
};

// ─── Font Loader ─────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    .ak-input::placeholder { color: rgba(20,10,80,0.35); font-family: 'Open Sans', sans-serif; font-size: 0.78rem; letter-spacing: 0.03em; }
    .ak-input:focus { outline: none; }
    .ak-btn-primary:hover:not(:disabled) { background: ${T.indigoHover} !important; }
    .ak-btn-ghost:hover { background: ${T.indigoSubtle} !important; border-color: ${T.indigo} !important; }
    .ak-tab-active { border-bottom: 2px solid ${T.indigo} !important; color: ${T.indigo} !important; background: ${T.indigoSubtle} !important; }
    .ak-link:hover { color: ${T.indigo} !important; }
    .ak-back:hover { color: ${T.indigoText} !important; }
    .ak-check { accent-color: ${T.indigo}; }
    .ak-animate-spin { animation: ak-spin 0.9s linear infinite; }
    .ak-otp-input { caret-color: ${T.indigo}; }
    .ak-otp-input:focus { border-color: ${T.indigo} !important; background: rgba(20,10,80,0.04) !important; }
    @keyframes ak-spin { to { transform: rotate(360deg); } }
    @keyframes ak-pulse-dot { 0%,100% { opacity:0.4; transform:scale(0.8); } 50% { opacity:1; transform:scale(1); } }
    .ak-step-dot-active { animation: ak-pulse-dot 1.6s ease-in-out infinite; }
  `}</style>
);

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconMail    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="20" height="16" rx="1"/><polyline points="2,4 12,13 22,4"/></svg>;
const IconLock    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>;
const IconUser    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IconId      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="5" width="20" height="14" rx="1"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/></svg>;
const IconCard    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="5" width="20" height="14" rx="1"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IconCheck   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20,6 9,17 4,12"/></svg>;
const IconXMark   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconLogout  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const IconKey     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="15" r="5"/><path d="M21 3l-9.4 9.4"/><path d="M15 9l2 2"/></svg>;
const IconShield  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconSpin    = ({ sz = 16 }) => (
  <svg className="ak-animate-spin" width={sz} height={sz} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={T.indigo} strokeWidth="3" opacity="0.15"/>
    <path fill={T.indigo} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.7"/>
  </svg>
);
const IconSpinIvory = ({ sz = 16 }) => (
  <svg className="ak-animate-spin" width={sz} height={sz} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={T.ivory} strokeWidth="3" opacity="0.2"/>
    <path fill={T.ivory} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.85"/>
  </svg>
);

// ─── Decorative ornament ──────────────────────────────────────────────────────
const Ornament = () => (
  <div style={{ textAlign: 'center', lineHeight: 1, opacity: 0.3, margin: '2px 0' }}>
    <svg width="90" height="16" viewBox="0 0 90 16" fill="none">
      <line x1="0" y1="8" x2="32" y2="8" stroke={T.indigo} strokeWidth="0.8"/>
      <circle cx="38" cy="8" r="2" fill={T.indigo}/>
      <circle cx="45" cy="8" r="3.5" fill="none" stroke={T.indigo} strokeWidth="0.8"/>
      <circle cx="52" cy="8" r="2" fill={T.indigo}/>
      <line x1="58" y1="8" x2="90" y2="8" stroke={T.indigo} strokeWidth="0.8"/>
    </svg>
  </div>
);

// ─── Thin rule ────────────────────────────────────────────────────────────────
const HR = ({ my = 20 }) => (
  <div style={{ margin: `${my}px 0`, borderTop: `1px solid ${T.border}` }} />
);

// ─── Logo block ───────────────────────────────────────────────────────────────
const Logo = ({ subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
    <h1 style={{
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '2rem',
      fontWeight: '700',
      letterSpacing: '0.02em',
      color: T.indigo,
      margin: '0 0 4px',
      lineHeight: 1,
    }}>
      aapno<span style={{ color: 'rgba(26,16,80,0.45)' }}>kaam</span>
    </h1>
    <Ornament />
    {subtitle && (
      <p style={{
        fontFamily: "'Open Sans', sans-serif",
        fontSize: '0.72rem',
        fontWeight: '600',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: T.indigoMuted,
        margin: '8px 0 0',
      }}>{subtitle}</p>
    )}
  </div>
);

// ─── Underline Input ──────────────────────────────────────────────────────────
const UInput = ({ icon, label, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '22px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: `1px solid ${error ? '#b91c1c' : focused ? T.indigo : T.borderStrong}`,
        paddingBottom: '8px',
        transition: 'border-color 0.18s',
      }}>
        <span style={{
          color: focused ? T.indigo : T.indigoMuted,
          transition: 'color 0.18s',
          flexShrink: 0,
          lineHeight: 0,
        }}>{icon}</span>
        <input
          className="ak-input"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={label}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: T.indigoDeep,
            fontFamily: "'Open Sans', sans-serif",
            fontSize: '1.05rem',
            fontWeight: '600',
            width: '100%',
            letterSpacing: '0.01em',
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{
          color: '#b91c1c',
          fontSize: '0.75rem',
          fontFamily: "'Open Sans', sans-serif",
          fontWeight: '600',
          marginTop: '5px',
          letterSpacing: '0.03em',
        }}>{error}</p>
      )}
    </div>
  );
};

// ─── Primary Button ───────────────────────────────────────────────────────────
const SolidBtn = ({ children, loading, onClick, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="ak-btn-primary"
    style={{
      width: '100%',
      padding: '12px 0',
      background: loading ? 'rgba(26,16,80,0.6)' : T.indigo,
      color: T.ivory,
      border: 'none',
      borderRadius: '2px',
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: '700',
      fontSize: '0.78rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '9px',
      transition: 'background 0.18s',
      boxShadow: `0 4px 16px ${T.shadow}`,
    }}
  >
    {loading ? <><IconSpinIvory sz={14} /> Loading…</> : children}
  </button>
);

// ─── Ghost / outline Button ───────────────────────────────────────────────────
const GhostBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="ak-btn-ghost"
    style={{
      width: '100%',
      padding: '11px 0',
      background: 'transparent',
      color: T.indigo,
      border: `1px solid ${T.borderStrong}`,
      borderRadius: '2px',
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: '700',
      fontSize: '0.76rem',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'background 0.15s, border-color 0.15s',
    }}
  >
    {children}
  </button>
);

// ─── Alert strip ──────────────────────────────────────────────────────────────
const MAlert = ({ type, message }) => {
  const colors = {
    success: T.indigo,
    error:   '#b91c1c',
    warning: 'rgba(20,10,80,0.65)',
    info:    T.indigoMuted,
  };
  const col = colors[type] || T.indigoMuted;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderLeft: `3px solid ${col}`,
        background: type === 'error' ? 'rgba(185,28,28,0.07)' : T.indigoSubtle,
        color: col,
        padding: '9px 13px',
        marginBottom: '18px',
        fontSize: '0.8rem',
        fontFamily: "'Open Sans', sans-serif",
        fontWeight: '600',
        letterSpacing: '0.04em',
        lineHeight: 1.55,
      }}
    >
      {message}
    </motion.div>
  );
};

// ─── Icon Box for status pages ────────────────────────────────────────────────
const IBox = ({ color, children }) => (
  <div style={{
    width: '52px',
    height: '52px',
    margin: '0 auto 16px',
    border: `1px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    background: `${color}0a`,
  }}>{children}</div>
);

// ─── Auth Shell ───────────────────────────────────────────────────────────────
const Shell = ({ children, wide = false }) => (
  <div style={{
    minHeight: '100vh',
    background: T.ivory,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    fontFamily: "'Open Sans', sans-serif",
    position: 'relative',
  }}>
    <FontLoader />
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(20%2C10%2C80%2C0.045)'/%3E%3Cpath d='M0 20h40M20 0v40' stroke='rgba(20%2C10%2C80%2C0.025)' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
    <div style={{
      position: 'fixed',
      inset: 0,
      background: `radial-gradient(ellipse 70% 60% at 50% 40%, rgba(26,16,80,0.04) 0%, transparent 70%)`,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: wide ? '640px' : '380px',
        background: T.ivoryMid,
        border: `1px solid ${T.borderStrong}`,
        borderRadius: '3px',
        padding: wide ? '44px 48px' : '40px 38px',
        boxShadow: `0 12px 48px ${T.shadow}, 0 2px 8px ${T.shadowSoft}`,
      }}
    >
      <div style={{ position: 'absolute', top: '14px', right: '14px', width: '20px', height: '20px', borderTop: `1.5px solid ${T.border}`, borderRight: `1.5px solid ${T.border}`, opacity: 0.6 }} />
      <div style={{ position: 'absolute', bottom: '14px', left: '14px', width: '20px', height: '20px', borderBottom: `1.5px solid ${T.border}`, borderLeft: `1.5px solid ${T.border}`, opacity: 0.6 }} />
      {children}
    </motion.div>
  </div>
);

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current, steps }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '26px' }}>
    {steps.map((label, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: `1.5px solid ${done || active ? T.indigo : T.border}`,
              background: done ? T.indigo : active ? T.indigoSubtle : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: done ? T.ivory : active ? T.indigo : T.indigoMuted,
              fontSize: '0.7rem',
              fontWeight: '700',
              fontFamily: "'Open Sans', sans-serif",
              transition: 'all 0.25s',
            }}
              className={active ? 'ak-step-dot-active' : ''}
            >
              {done
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                : i + 1
              }
            </div>
            <span style={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '0.62rem',
              fontWeight: '700',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: active ? T.indigo : done ? T.indigoText : T.indigoMuted,
              whiteSpace: 'nowrap',
            }}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: '52px',
              height: '1px',
              background: i < current ? T.indigo : T.border,
              margin: '0 6px',
              marginBottom: '18px',
              transition: 'background 0.3s',
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── OTP Input Boxes ──────────────────────────────────────────────────────────
const OtpBoxes = ({ value, onChange, error }) => {
  const len = 6;
  const digits = value.split('').concat(Array(len).fill('')).slice(0, len);
  const refs = Array.from({ length: len }, () => React.createRef());

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      if (digits[idx] === '' && idx > 0) {
        refs[idx - 1].current?.focus();
        const next = [...digits]; next[idx - 1] = ''; onChange(next.join(''));
      } else {
        const next = [...digits]; next[idx] = ''; onChange(next.join(''));
      }
      return;
    }
    if (e.key === 'ArrowLeft' && idx > 0)       { refs[idx - 1].current?.focus(); return; }
    if (e.key === 'ArrowRight' && idx < len - 1) { refs[idx + 1].current?.focus(); return; }
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits]; next[idx] = val; onChange(next.join(''));
    if (val && idx < len - 1) refs[idx + 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, len);
    onChange(pasted.padEnd(len, '').slice(0, len));
    const focusIdx = Math.min(pasted.length, len - 1);
    refs[focusIdx].current?.focus();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '8px' }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            className="ak-otp-input"
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(e, i)}
            onKeyDown={e => handleKey(e, i)}
            onPaste={handlePaste}
            style={{
              width: '44px',
              height: '52px',
              textAlign: 'center',
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '1.5rem',
              fontWeight: '700',
              color: T.indigoDeep,
              background: d ? T.indigoSubtle : T.ivoryDeep,
              border: `1px solid ${error ? '#b91c1c' : d ? T.indigo : T.borderStrong}`,
              borderRadius: '3px',
              outline: 'none',
              transition: 'all 0.15s',
              cursor: 'text',
              letterSpacing: '0.1em',
            }}
          />
        ))}
      </div>
      {error && (
        <p style={{
          color: '#b91c1c',
          fontSize: '0.75rem',
          fontFamily: "'Open Sans', sans-serif",
          fontWeight: '600',
          textAlign: 'center',
          marginTop: '4px',
          letterSpacing: '0.03em',
        }}>{error}</p>
      )}
    </div>
  );
};

// ─── Countdown Timer ──────────────────────────────────────────────────────────
const OtpCountdown = ({ seconds, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const pct = (remaining / seconds) * 100;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '14px 0' }}>
      {/* Mini arc progress */}
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="11" fill="none" stroke={T.border} strokeWidth="2"/>
        <circle
          cx="14" cy="14" r="11"
          fill="none"
          stroke={remaining <= 30 ? '#b91c1c' : T.indigo}
          strokeWidth="2"
          strokeDasharray={`${2 * Math.PI * 11}`}
          strokeDashoffset={`${2 * Math.PI * 11 * (1 - pct / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 14 14)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span style={{
        fontFamily: "'Open Sans', sans-serif",
        fontSize: '0.82rem',
        fontWeight: '700',
        color: remaining <= 30 ? '#b91c1c' : T.indigoMuted,
        letterSpacing: '0.04em',
        transition: 'color 0.3s',
      }}>
        {remaining > 0
          ? `OTP expires in ${m}:${String(s).padStart(2, '0')}`
          : 'OTP expired'
        }
      </span>
    </div>
  );
};

// ─── Password Strength Meter ──────────────────────────────────────────────────
const StrengthMeter = ({ password }) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[@$!%*?&#]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#b91c1c', '#d97706', '#0369a1', '#059669'];

  if (!password) return null;

  return (
    <div style={{ marginTop: '-12px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            height: '3px',
            flex: 1,
            borderRadius: '2px',
            background: i <= score ? colors[score] : T.border,
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      <p style={{
        fontFamily: "'Open Sans', sans-serif",
        fontSize: '0.7rem',
        fontWeight: '600',
        color: colors[score] || T.indigoMuted,
        letterSpacing: '0.04em',
        margin: 0,
        textAlign: 'right',
      }}>{labels[score]}</p>
    </div>
  );
};

// ─── Logout Modal ─────────────────────────────────────────────────────────────
export const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(20,10,80,0.45)', backdropFilter: 'blur(3px)',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          style={{
            background: T.ivoryMid, border: `1px solid ${T.borderStrong}`,
            borderTop: `3px solid ${T.indigo}`, borderRadius: '3px',
            padding: '40px 36px', width: '100%', maxWidth: '360px',
            textAlign: 'center', boxShadow: `0 16px 48px ${T.shadow}`,
          }}
        >
          <IBox color={T.indigo}><IconLogout /></IBox>
          <h3 style={{ fontFamily: "'Open Sans', sans-serif", color: T.indigoDeep, fontWeight: '700', fontSize: '1.2rem', margin: '0 0 8px', letterSpacing: '0.02em' }}>Confirm Logout</h3>
          <p style={{ fontFamily: "'Open Sans', sans-serif", color: 'rgba(20,10,80,0.6)', fontSize: '1rem', fontWeight: '500', margin: '0 0 24px' }}>Are you sure you want to sign out?</p>
          <HR my={20} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            <SolidBtn onClick={onConfirm}>Sign Out</SolidBtn>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Forgot Password Page (3-Step) ────────────────────────────────────────────
const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // step: 0 = request OTP, 1 = verify OTP, 2 = reset password, 3 = success
  const [step, setStep]             = useState(0);
  const [email, setEmail]           = useState('');
  const [otp, setOtp]               = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading]       = useState(false);
  const [alert, setAlert]           = useState(null);
  const [err, setErr]               = useState({});
  const [otpExpired, setOtpExpired] = useState(false);
  const [canResend, setCanResend]   = useState(false);

  const STEPS = ['Request OTP', 'Verify OTP', 'New Password'];

  // ── Step 0: Send OTP ────────────────────────────────────────────────────
  const sendOtp = async (isResend = false) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErr({ email: 'Enter a valid email address' }); return;
    }
    setLoading(true); setAlert(null); setErr({});
    try {
      const r = await api.forgotPassword({ email });
      if (r.success) {
        setStep(1);
        setOtp('');
        setOtpExpired(false);
        setCanResend(false);
        if (isResend) setAlert({ type: 'success', message: 'A new OTP has been sent to your email.' });
      } else {
        setAlert({ type: 'error', message: r.message || 'Failed to send OTP.' });
      }
    } catch (ex) {
      setAlert({ type: 'error', message: ex.response?.data?.message || 'Network error. Please try again.' });
    } finally { setLoading(false); }
  };

  // ── Step 1: Verify OTP ──────────────────────────────────────────────────
  const verifyOtp = async () => {
    if (otp.length < 6) { setErr({ otp: 'Enter all 6 digits' }); return; }
    setLoading(true); setAlert(null); setErr({});
    try {
      const r = await api.verifyOtp({ email, otp });
      if (r.success && r.resetToken) {
        setResetToken(r.resetToken);
        setStep(2);
      } else {
        setAlert({ type: 'error', message: r.message || 'Invalid OTP.' });
      }
    } catch (ex) {
      setAlert({ type: 'error', message: ex.response?.data?.message || 'Invalid or expired OTP.' });
    } finally { setLoading(false); }
  };

  // ── Step 2: Reset Password ──────────────────────────────────────────────
  const doReset = async () => {
    const e = {};
    if (!newPwd || !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(newPwd))
      e.newPwd = 'Min 8 chars, 1 uppercase, 1 number, 1 special character';
    if (newPwd !== confirmPwd) e.confirmPwd = 'Passwords do not match';
    if (Object.keys(e).length) { setErr(e); return; }

    setLoading(true); setAlert(null); setErr({});
    try {
      const r = await api.resetPassword({ resetToken, newPassword: newPwd, confirmPassword: confirmPwd });
      if (r.success) setStep(3);
      else setAlert({ type: 'error', message: r.message || 'Reset failed.' });
    } catch (ex) {
      setAlert({ type: 'error', message: ex.response?.data?.message || 'Reset token expired. Please start over.' });
    } finally { setLoading(false); }
  };

  return (
    <Shell>
      <Logo subtitle="Password Recovery" />
      <HR my={20} />

      {/* Step indicator (only shown during steps 0-2) */}
      {step < 3 && <StepIndicator current={step} steps={STEPS} />}

      <AnimatePresence mode="wait">

        {/* ── Step 0: Email Input ─────────────────────────────────────────── */}
        {step === 0 && (
          <motion.div key="s0"
            initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }}
          >
            {alert && <MAlert {...alert} />}
            <p style={{
              fontFamily: "'Open Sans', sans-serif",
              color: T.indigoMuted,
              fontSize: '0.85rem',
              fontWeight: '600',
              lineHeight: 1.7,
              letterSpacing: '0.02em',
              marginBottom: '22px',
            }}>
              Enter your registered email address and we'll send you a 6-digit OTP.
            </p>
            <UInput
              icon={<IconMail />}
              label="Registered Email Address"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr({}); }}
              error={err.email}
            />
            <SolidBtn loading={loading} onClick={() => sendOtp(false)}>
              Send OTP
            </SolidBtn>
            <HR my={22} />
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => navigate('/login')}
                className="ak-back"
                style={{
                  color: T.indigoMuted, fontSize: '0.8rem',
                  fontFamily: "'Open Sans', sans-serif", fontWeight: '600',
                  background: 'none', border: 'none', cursor: 'pointer',
                  letterSpacing: '0.06em', transition: 'color 0.15s',
                }}
              >← Back to Login</button>
            </div>
          </motion.div>
        )}

        {/* ── Step 1: OTP Verification ────────────────────────────────────── */}
        {step === 1 && (
          <motion.div key="s1"
            initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }}
          >
            {alert && <MAlert {...alert} />}

            {/* Email hint */}
            <div style={{
              textAlign: 'center',
              background: T.indigoSubtle,
              border: `1px solid ${T.border}`,
              borderRadius: '2px',
              padding: '8px 12px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontFamily: "'Open Sans', sans-serif",
                fontSize: '0.75rem', fontWeight: '600',
                color: T.indigoMuted, letterSpacing: '0.04em',
                margin: '0 0 2px',
                textTransform: 'uppercase',
              }}>OTP sent to</p>
              <p style={{
                fontFamily: "'Open Sans', sans-serif",
                fontSize: '0.95rem', fontWeight: '700',
                color: T.indigo, margin: 0, letterSpacing: '0.02em',
              }}>{email}</p>
            </div>

            <OtpBoxes value={otp} onChange={v => { setOtp(v); setErr({}); }} error={err.otp} />

            {/* Countdown */}
            {!otpExpired && (
              <OtpCountdown
                seconds={600}
                onExpire={() => { setOtpExpired(true); setCanResend(true); }}
              />
            )}
            {otpExpired && (
              <MAlert type="warning" message="Your OTP has expired. Please request a new one." />
            )}

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {!otpExpired && (
                <SolidBtn loading={loading} onClick={verifyOtp}>
                  Verify OTP
                </SolidBtn>
              )}
              {(otpExpired || canResend) && (
                <GhostBtn onClick={() => sendOtp(true)}>
                  Resend OTP
                </GhostBtn>
              )}
              {!otpExpired && (
                <button
                  onClick={() => { setCanResend(true); }}
                  style={{
                    textAlign: 'center',
                    background: 'none', border: 'none',
                    fontFamily: "'Open Sans', sans-serif",
                    fontSize: '0.78rem', fontWeight: '600',
                    color: T.indigoMuted, cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                  }}
                >Didn't receive it? Resend</button>
              )}
              {canResend && !otpExpired && (
                <GhostBtn onClick={() => sendOtp(true)}>Resend OTP</GhostBtn>
              )}
            </div>

            <HR my={20} />
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => { setStep(0); setAlert(null); setErr({}); setOtp(''); }}
                className="ak-back"
                style={{
                  color: T.indigoMuted, fontSize: '0.8rem',
                  fontFamily: "'Open Sans', sans-serif", fontWeight: '600',
                  background: 'none', border: 'none', cursor: 'pointer',
                  letterSpacing: '0.06em', transition: 'color 0.15s',
                }}
              >← Change Email</button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: New Password ────────────────────────────────────────── */}
        {step === 2 && (
          <motion.div key="s2"
            initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }}
          >
            {alert && <MAlert {...alert} />}

            {/* Security badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: T.indigoSubtle, border: `1px solid ${T.border}`,
              borderRadius: '2px', padding: '8px 12px', marginBottom: '22px',
            }}>
              <span style={{ color: T.indigo, lineHeight: 0 }}><IconShield /></span>
              <p style={{
                fontFamily: "'Open Sans', sans-serif",
                fontSize: '0.75rem', fontWeight: '600',
                color: T.indigoText, letterSpacing: '0.03em', margin: 0,
              }}>
                Identity verified. Your reset token expires in 15 minutes.
              </p>
            </div>

            <UInput
              icon={<IconLock />}
              label="New Password"
              type="password"
              value={newPwd}
              onChange={e => { setNewPwd(e.target.value); setErr({}); }}
              error={err.newPwd}
            />
            <StrengthMeter password={newPwd} />

            <UInput
              icon={<IconLock />}
              label="Confirm New Password"
              type="password"
              value={confirmPwd}
              onChange={e => { setConfirmPwd(e.target.value); setErr({}); }}
              error={err.confirmPwd}
            />

            <SolidBtn loading={loading} onClick={doReset}>
              Reset Password
            </SolidBtn>
          </motion.div>
        )}

        {/* ── Step 3: Success ─────────────────────────────────────────────── */}
        {step === 3 && (
          <motion.div key="s3"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28 }}
          >
            <div style={{ textAlign: 'center', paddingTop: '4px' }}>
              <IBox color={T.indigo}><IconCheck /></IBox>
              <p style={{
                fontFamily: "'Open Sans', sans-serif",
                color: T.indigoDeep, fontWeight: '700',
                fontSize: '1.1rem', margin: '0 0 6px',
                letterSpacing: '0.02em',
              }}>Password Reset!</p>
              <p style={{
                fontFamily: "'Open Sans', sans-serif",
                color: 'rgba(20,10,80,0.6)',
                fontSize: '0.95rem', fontWeight: '500',
                margin: '0 0 24px', lineHeight: 1.65,
              }}>
                Your password has been updated successfully.<br/>
                You can now sign in with your new password.
              </p>
              <SolidBtn onClick={() => navigate('/login')}>
                Go to Login
              </SolidBtn>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </Shell>
  );
};

// ─── Login Page ───────────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const [fd, setFd]         = useState({ email: '', password: '' });
  const [err, setErr]       = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]   = useState(null);

  useEffect(() => {
    if (location.state?.message) setAlert({ type: 'warning', message: location.state.message });
  }, [location]);

  const validate = () => {
    const e = {};
    if (!fd.email)                            e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(fd.email)) e.email    = 'Invalid email address';
    if (!fd.password)                         e.password = 'Password is required';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErr(e); return; }
    setLoading(true); setAlert(null);
    try {
      const r = await api.login(fd);
      if (r.token) {
        login(r);
        setAlert({ type: 'success', message: 'Login successful!' });
        setTimeout(() => navigate('/dashboard'), 900);
      } else {
        if (r.message?.toLowerCase().includes('verify')) navigate('/needs-verification');
        else setAlert({ type: 'error', message: r.message || 'Login failed' });
      }
    } catch (ex) {
      setAlert({ type: 'error', message: ex.response?.data?.message || 'Invalid credentials' });
    } finally { setLoading(false); }
  };

  return (
    <Shell>
      <Logo subtitle="Sign In" />
      <HR my={20} />
      {alert && <MAlert {...alert} />}

      <div onKeyPress={e => e.key === 'Enter' && submit()}>
        <UInput icon={<IconMail />} label="Email Address" type="email"
          value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} error={err.email} />
        <UInput icon={<IconLock />} label="Password" type="password"
          value={fd.password} onChange={e => setFd({ ...fd, password: e.target.value })} error={err.password} />
      </div>

      {/* Remember / Forgot row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          color: T.indigoMuted, fontSize: '0.8rem',
          fontFamily: "'Open Sans', sans-serif", fontWeight: '600',
          cursor: 'pointer', letterSpacing: '0.05em',
        }}>
          <input type="checkbox" className="ak-check" style={{ width: '12px', height: '12px' }} />
          Remember me
        </label>

        {/* ── NOW NAVIGATES TO /forgot-password ── */}
        <button
          onClick={() => navigate('/forgot-password')}
          className="ak-back"
          style={{
            color: T.indigoMuted, fontSize: '0.78rem',
            fontFamily: "'Open Sans', sans-serif", fontWeight: '600',
            background: 'none', border: 'none', cursor: 'pointer',
            letterSpacing: '0.05em', transition: 'color 0.15s',
          }}
        >Forgot Password?</button>
      </div>

      <SolidBtn loading={loading} onClick={submit}>Sign In</SolidBtn>

      <GoogleDivider />
<GoogleAuthButton
  role="CONSUMER"
  label="Continue with Google"
  onSuccess={(r) => {
    login(r);
    // ✅ role-based redirect — DashboardRouter handles the split
    setTimeout(() => navigate('/dashboard'), 100);
  }}
  onError={(msg) => setAlert({ type: 'error', message: msg })}
/>

      <HR my={24} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <GhostBtn onClick={() => navigate('/worker-login')}>Sign In as Worker</GhostBtn>
        <p style={{
          textAlign: 'center', color: T.indigoMuted,
          fontSize: '0.82rem', fontFamily: "'Open Sans', sans-serif",
          fontWeight: '600', margin: 0, letterSpacing: '0.04em',
        }}>
          No account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="ak-link"
            style={{
              color: T.indigo, background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem',
              fontFamily: "'Open Sans', sans-serif", letterSpacing: '0.04em',
              textDecoration: 'underline', textUnderlineOffset: '3px',
              transition: 'color 0.15s',
            }}
          >Register Now</button>
        </p>
      </div>
    </Shell>
  );
};

// ─── Worker Login ─────────────────────────────────────────────────────────────
const WorkerLoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const [fd, setFd]           = useState({ workerId: '', password: '' });
  const [err, setErr]         = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  useEffect(() => {
    if (location.state?.message) setAlert({ type: 'warning', message: location.state.message });
  }, [location]);

  const validate = () => {
    const e = {};
    if (!fd.workerId) e.workerId = 'Worker ID is required';
    if (!fd.password) e.password = 'Password is required';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErr(e); return; }
    setLoading(true); setAlert(null);
    try {
      const r = await api.workerLogin({ workerId: parseInt(fd.workerId), password: fd.password });
      if (r.token) {
        login(r);
        setAlert({ type: 'success', message: 'Login successful!' });
        setTimeout(() => navigate('/dashboard'), 900);
      } else setAlert({ type: 'error', message: r.message || 'Login failed' });
    } catch (ex) {
      setAlert({ type: 'error', message: ex.response?.data?.message || 'Invalid credentials' });
    } finally { setLoading(false); }
  };

  return (
    <Shell>
      <Logo subtitle="Worker Portal" />
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <span style={{
          display: 'inline-block', padding: '4px 16px',
          border: `1px solid ${T.borderStrong}`, background: T.indigoSubtle,
          color: T.indigoText, fontSize: '0.72rem',
          fontFamily: "'Open Sans', sans-serif", fontWeight: '700',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>Worker Access</span>
      </div>
      <HR my={20} />
      {alert && <MAlert {...alert} />}

      <div onKeyPress={e => e.key === 'Enter' && submit()}>
        <UInput icon={<IconId />} label="Worker ID" type="number"
          value={fd.workerId} onChange={e => setFd({ ...fd, workerId: e.target.value })} error={err.workerId} />
        <UInput icon={<IconLock />} label="Password" type="password"
          value={fd.password} onChange={e => setFd({ ...fd, password: e.target.value })} error={err.password} />
      </div>

      <div style={{ marginBottom: '24px' }} />
      <SolidBtn loading={loading} onClick={submit}>Sign In</SolidBtn>

      <HR my={24} />
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => navigate('/login')}
          className="ak-back"
          style={{
            color: T.indigoMuted, fontSize: '0.8rem',
            fontFamily: "'Open Sans', sans-serif", fontWeight: '600',
            background: 'none', border: 'none', cursor: 'pointer',
            letterSpacing: '0.06em', transition: 'color 0.15s',
          }}
        >← Back to Regular Login</button>
      </div>
    </Shell>
  );
};

// ─── Register Page (wide, 2-col) ──────────────────────────────────────────────
const RegisterPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('consumer');
  const [fd, setFd]             = useState({ username: '', email: '', password: '', confirmPassword: '', panNumber: '' });
  const [err, setErr]           = useState({});
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);
  const [success, setSuccess]   = useState(false);

  const isWorker = userType === 'worker';

  const validate = () => {
    const e = {};
    if (!fd.username || fd.username.length < 3 || fd.username.length > 50) e.username = 'Username: 3–50 characters';
    if (!fd.email || !/\S+@\S+\.\S+/.test(fd.email)) e.email = 'Valid email required';
    if (!fd.password || !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(fd.password))
      e.password = 'Min 8 chars, 1 uppercase, 1 number, 1 special character';
    if (fd.password !== fd.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (isWorker && (!fd.panNumber || !/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(fd.panNumber))) e.panNumber = 'Invalid PAN (e.g. ABCDE1234F)';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErr(e); return; }
    setLoading(true); setAlert(null);
    try {
      const r = await (isWorker ? api.registerWorker : api.registerConsumer)(fd);
      if (r.success) setSuccess(true);
      else setAlert({ type: 'error', message: r.message || 'Registration failed' });
    } catch { setAlert({ type: 'error', message: 'Network error. Please try again.' }); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <Shell>
        <Logo subtitle="Registration Complete" />
        <HR my={20} />
        <div style={{ textAlign: 'center' }}>
          <IBox color={T.indigo}><IconCheck /></IBox>
          <p style={{ fontFamily: "'Open Sans', sans-serif", color: T.indigoDeep, fontWeight: '700', fontSize: '1.1rem', margin: '0 0 6px', letterSpacing: '0.02em' }}>Account Created!</p>
          <p style={{ fontFamily: "'Open Sans', sans-serif", color: 'rgba(20,10,80,0.6)', fontSize: '1rem', fontWeight: '500', margin: '0 0 20px' }}>Verification email sent to:</p>
          <div style={{ border: `1px solid ${T.borderStrong}`, background: T.indigoSubtle, padding: '10px 16px', marginBottom: '24px', color: T.indigo, fontSize: '1rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '700', letterSpacing: '0.02em' }}>{fd.email}</div>
          <SolidBtn onClick={() => navigate('/login')}>Go to Login</SolidBtn>
          <HR my={20} />
          <button
            onClick={() => navigate('/needs-verification')}
            className="ak-back"
            style={{ color: T.indigoMuted, fontSize: '0.8rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em', transition: 'color 0.15s' }}
          >Didn't receive it? Resend</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell wide>
      <Logo subtitle="Create Account" />
      <HR my={20} />
      <div style={{ display: 'flex', border: `1px solid ${T.borderStrong}`, borderRadius: '2px', marginBottom: '30px', overflow: 'hidden' }}>
        {['consumer', 'worker'].map(t => {
          const active = userType === t;
          return (
            <button key={t} onClick={() => { setUserType(t); setErr({}); }}
              style={{ flex: 1, padding: '11px 0', background: active ? T.indigo : 'transparent', color: active ? T.ivory : T.indigoMuted, border: 'none', fontFamily: "'Open Sans', sans-serif", fontWeight: '700', fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s' }}>
              {t === 'consumer' ? 'Consumer' : 'Worker'}
            </button>
          );
        })}
      </div>

      {alert && <MAlert {...alert} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
        <UInput icon={<IconUser />} label="Username" value={fd.username} onChange={e => setFd({ ...fd, username: e.target.value })} error={err.username} />
        <UInput icon={<IconMail />} label="Email Address" type="email" value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} error={err.email} />
        <UInput icon={<IconLock />} label="Password" type="password" value={fd.password} onChange={e => setFd({ ...fd, password: e.target.value })} error={err.password} />
        <UInput icon={<IconLock />} label="Confirm Password" type="password" value={fd.confirmPassword} onChange={e => setFd({ ...fd, confirmPassword: e.target.value })} error={err.confirmPassword} />
        {isWorker && (
          <UInput icon={<IconCard />} label="PAN Number" maxLength={10} value={fd.panNumber} onChange={e => setFd({ ...fd, panNumber: e.target.value.toUpperCase() })} error={err.panNumber} />
        )}
      </div>

      <div style={{ marginTop: '8px' }}>
        <SolidBtn loading={loading} onClick={submit}>Create Account</SolidBtn>
      
      </div>

      <GoogleDivider />
<GoogleAuthButton
  role={isWorker ? 'WORKER' : 'CONSUMER'}
  label={`Register with Google as ${isWorker ? 'Worker' : 'Consumer'}`}
  onSuccess={(r) => {
    login(r);
    // ✅ small delay lets AuthContext update before navigation
    setTimeout(() => navigate('/dashboard'), 100);
  }}
  onError={(msg) => setAlert({ type: 'error', message: msg })}
/>
      <HR my={22} />
      <p style={{ textAlign: 'center', color: T.indigoMuted, fontSize: '0.82rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '600', margin: 0, letterSpacing: '0.04em' }}>
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} className="ak-link" style={{ color: T.indigo, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', fontFamily: "'Open Sans', sans-serif", letterSpacing: '0.04em', textDecoration: 'underline', textUnderlineOffset: '3px', transition: 'color 0.15s' }}>Sign In</button>
      </p>
    </Shell>
  );
};

// ─── Verification Needed ──────────────────────────────────────────────────────
const VerificationNeededPage = () => {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  const submit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setAlert({ type: 'error', message: 'Enter a valid email address' }); return; }
    setLoading(true); setAlert(null);
    try {
      const r = await api.resendVerification(email);
      setAlert(r.success ? { type: 'success', message: 'Verification email sent!' } : { type: 'error', message: r.message || 'Failed' });
    } catch { setAlert({ type: 'error', message: 'Network error.' }); }
    finally { setLoading(false); }
  };

  return (
    <Shell>
      <Logo subtitle="Email Verification" />
      <HR my={20} />
      {alert && <MAlert {...alert} />}
      <p style={{ color: 'rgba(20,10,80,0.65)', fontSize: '1rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '500', marginBottom: '22px', lineHeight: 1.75 }}>
        Check your inbox for a verification link. If you didn't receive it, enter your email below to resend.
      </p>
      <UInput icon={<IconMail />} label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <div style={{ marginTop: '4px' }}>
        <SolidBtn loading={loading} onClick={submit}>Resend Email</SolidBtn>
      </div>
      <HR my={22} />
      <div style={{ textAlign: 'center' }}>
        <button onClick={() => navigate('/login')} className="ak-back" style={{ color: T.indigoMuted, fontSize: '0.8rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', transition: 'color 0.15s' }}>← Back to Login</button>
      </div>
    </Shell>
  );
};

// ─── Email Verification Page ──────────────────────────────────────────────────
const EmailVerificationPage = ({ verificationToken }) => {
  const navigate = useNavigate();
  const [status, setStatus]   = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (verificationToken) doVerify(verificationToken);
    else { setStatus('error'); setMessage('No verification token found.'); }
  }, [verificationToken]);

  const doVerify = async (token) => {
    try {
      const r = await api.verifyEmail(token);
      if (r.success) { setStatus('success'); setMessage(r.message || 'Email verified!'); }
      else { setStatus('error'); setMessage(r.message || 'Verification failed.'); }
    } catch { setStatus('error'); setMessage('Network error. Please try again.'); }
  };

  return (
    <Shell>
      <Logo subtitle="Email Verification" />
      <HR my={20} />
      <div style={{ textAlign: 'center', paddingTop: '8px' }}>
        {status === 'verifying' && (
          <>
            <IBox color={T.indigo}><IconSpin sz={22} /></IBox>
            <p style={{ color: 'rgba(20,10,80,0.6)', fontSize: '1rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '500' }}>Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <IBox color={T.indigo}><IconCheck /></IBox>
            <p style={{ fontFamily: "'Open Sans', sans-serif", color: T.indigoDeep, fontWeight: '700', fontSize: '1.1rem', margin: '0 0 6px', letterSpacing: '0.02em' }}>Verified!</p>
            <p style={{ color: 'rgba(20,10,80,0.6)', fontSize: '1rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '500', margin: '0 0 24px' }}>{message}</p>
            <SolidBtn onClick={() => navigate('/login')}>Go to Login</SolidBtn>
          </>
        )}
        {status === 'error' && (
          <>
            <IBox color="#b91c1c"><IconXMark /></IBox>
            <p style={{ fontFamily: "'Open Sans', sans-serif", color: T.indigoDeep, fontWeight: '700', fontSize: '1.1rem', margin: '0 0 6px', letterSpacing: '0.02em' }}>Verification Failed</p>
            <p style={{ color: 'rgba(20,10,80,0.6)', fontSize: '1rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '500', margin: '0 0 24px' }}>{message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <GhostBtn onClick={() => navigate('/needs-verification')}>Resend Email</GhostBtn>
              <SolidBtn onClick={() => navigate('/login')}>Back to Login</SolidBtn>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
};

// ─── Private Route ────────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <FontLoader />
      <IconSpin sz={32} />
      <p style={{ color: T.indigoMuted, fontSize: '0.8rem', fontFamily: "'Open Sans', sans-serif", fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Loading…</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// ─── Dashboard Router ─────────────────────────────────────────────────────────
const DashboardRouter = () => {
  const { user, logout } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'ADMIN':    return <AdminDashboard user={user} logout={logout} />;
    case 'CONSUMER': return <ConsumerDashboard user={user} logout={logout} />;
    case 'WORKER':   return <WorkerDashboard user={user} logout={logout} />;
    default:         return <Navigate to="/login" replace />;
  }
};

const VerifyEmailWrapper = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  return token ? <EmailVerificationPage verificationToken={token} /> : <Navigate to="/login" replace />;
};

// ─── 404 Page ─────────────────────────────────────────────────────────────────
const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', background: T.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', position: 'relative' }}>
    <FontLoader />
    <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(20%2C10%2C80%2C0.045)'/%3E%3Cpath d='M0 20h40M20 0v40' stroke='rgba(20%2C10%2C80%2C0.025)' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: 'none' }}/>
    <h1 style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '7rem', fontWeight: '800', color: T.indigo, margin: 0, letterSpacing: '-0.02em', lineHeight: 1, position: 'relative', zIndex: 1 }}>404</h1>
    <Ornament />
    <p style={{ fontFamily: "'Open Sans', sans-serif", color: T.indigoMuted, fontSize: '0.82rem', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>Page Not Found</p>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => (
  <AuthInterceptor>
    <Routes>
      <Route path="/"                   element={<Home />} />
      <Route path="/login"              element={<LoginPage />} />
      <Route path="/worker-login"       element={<WorkerLoginPage />} />
      <Route path="/register"           element={<RegisterPage />} />
      <Route path="/verify"             element={<VerifyEmailWrapper />} />
      <Route path="/needs-verification" element={<VerificationNeededPage />} />
      <Route path="/forgot-password"    element={<ForgotPasswordPage />} />
      <Route path="/dashboard"          element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
      <Route path="/privacy-policy"     element={<PrivacyPolicy />} />
      <Route path="*"                   element={<NotFoundPage />} />
    </Routes>
  </AuthInterceptor>
);

export default function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}