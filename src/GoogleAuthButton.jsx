import React, { useEffect, useState, useRef } from 'react';

const GOOGLE_CLIENT_ID = '67504308659-7n8uhoep8bokomv2si8lon18qmk67a7l.apps.googleusercontent.com';
const API_BASE_URL = 'http://localhost:8081/api';

const T = {
  ivory:        '#f0ebe0',
  ivoryMid:     '#ede7d9',
  indigo:       '#1a1050',
  indigoDeep:   '#140c40',
  indigoMuted:  'rgba(20, 10, 80, 0.50)',
  border:       'rgba(20, 10, 80, 0.15)',
  borderStrong: 'rgba(20, 10, 80, 0.28)',
  shadow:       'rgba(20, 10, 80, 0.14)',
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Spinner = () => (
  <svg style={{ animation: 'gauth-spin 0.85s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={T.indigoMuted} strokeWidth="3" opacity="0.2"/>
    <path fill={T.indigo} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.8"/>
  </svg>
);

export const GoogleDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
    <div style={{ flex: 1, height: '1px', background: T.border }} />
    <span style={{
      fontFamily: "'Open Sans', sans-serif", fontSize: '0.65rem', fontWeight: '700',
      letterSpacing: '0.12em', textTransform: 'uppercase', color: T.indigoMuted, whiteSpace: 'nowrap',
    }}>or continue with</span>
    <div style={{ flex: 1, height: '1px', background: T.border }} />
  </div>
);

const GoogleAuthButton = ({ role = 'CONSUMER', onSuccess, onError, label = 'Continue with Google' }) => {
  const [loading, setLoading]   = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const roleRef                 = useRef(role);
  const clientRef               = useRef(null); // holds the oauth2 token client

  useEffect(() => { roleRef.current = role; }, [role]);

  // ── Load Google SDK once globally ─────────────────────────────────────────
  useEffect(() => {
    if (window.google?.accounts) { setSdkReady(true); return; }

    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const interval = setInterval(() => {
        if (window.google?.accounts) { setSdkReady(true); clearInterval(interval); }
      }, 100);
      return () => clearInterval(interval);
    }

    const script   = document.createElement('script');
    script.src     = 'https://accounts.google.com/gsi/client';
    script.async   = true;
    script.defer   = true;
    script.onload  = () => setSdkReady(true);
    script.onerror = () => onError?.('Failed to load Google SDK');
    document.head.appendChild(script);
  }, []);

  // ── Build the token client once SDK is ready ──────────────────────────────
  // We use oauth2.initTokenClient (implicit flow) — gets an access_token,
  // then we exchange it for user info + generate our own JWT on the backend.
  // BUT your backend expects a Google ID token, so we use initCodeClient instead
  // with a hidden iframe — actually the cleanest solution is to use
  // accounts.id.initialize with a custom button, bypassing One Tap entirely.
  useEffect(() => {
    if (!sdkReady) return;

    // Initialize ID services (no auto_select, no One Tap prompt)
    window.google.accounts.id.initialize({
      client_id:             GOOGLE_CLIENT_ID,
      callback:              handleCredentialResponse,
      auto_select:           false,
      cancel_on_tap_outside: true,
      // ✅ This tells Google to use a popup instead of FedCM/One Tap
      ux_mode:               'popup',
    });

    // Render a hidden Google button and steal its click — most reliable way
    // to get an ID token via popup without FedCM
    const container = document.getElementById('g-btn-hidden-container');
    if (container) {
      window.google.accounts.id.renderButton(container, {
        type:  'standard',
        size:  'large',
        theme: 'outline',
        text:  'signin_with',
      });
    }
  }, [sdkReady]);

  // ── Callback: receives Google ID token ───────────────────────────────────
  const handleCredentialResponse = async (response) => {
    if (!response?.credential) {
      onError?.('No credential received from Google');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: response.credential, role: roleRef.current }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        onError?.(data.message || 'Google login failed');
        return;
      }

      onSuccess?.(data); // ✅ App.jsx handles role-based redirect

    } catch {
      onError?.('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Click: trigger the hidden Google button (bypasses FedCM entirely) ────
  const handleClick = () => {
    if (!sdkReady) { onError?.('Google SDK not loaded yet'); return; }
    if (loading)   return;

    // Re-init with latest role's callback before clicking
    window.google.accounts.id.initialize({
      client_id:             GOOGLE_CLIENT_ID,
      callback:              handleCredentialResponse,
      auto_select:           false,
      cancel_on_tap_outside: true,
      ux_mode:               'popup',
    });

    const hiddenBtn = document.querySelector('#g-btn-hidden-container div[role="button"]');
    if (hiddenBtn) {
      hiddenBtn.click(); // ✅ Triggers Google's own popup — no FedCM, no One Tap
    } else {
      onError?.('Google button not ready. Please refresh and try again.');
    }
  };

  return (
    <>
      <style>{`
        @keyframes gauth-spin { to { transform: rotate(360deg); } }
        #g-btn-hidden-container {
          position: absolute !important;
          width: 1px !important; height: 1px !important;
          overflow: hidden !important; opacity: 0 !important;
          pointer-events: none !important;
        }
        .gauth-btn {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 11px 0; background: ${T.ivory};
          border: 1px solid ${T.borderStrong}; border-radius: 2px;
          color: ${T.indigoDeep}; font-family: 'Open Sans', sans-serif;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.15s, border-color 0.18s, box-shadow 0.18s;
          position: relative; overflow: hidden;
        }
        .gauth-btn:hover:not(:disabled) {
          background: ${T.ivoryMid}; border-color: ${T.indigo};
          box-shadow: 0 4px 16px ${T.shadow};
        }
        .gauth-btn:active:not(:disabled) { transform: translateY(1px); }
        .gauth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .gauth-btn-shimmer::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
          animation: gauth-shimmer 1.4s infinite;
        }
        @keyframes gauth-shimmer {
          0% { transform: translateX(-100%); } 100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Hidden Google-rendered button — we click this to trigger their popup */}
      <div id="g-btn-hidden-container" aria-hidden="true" />

      <button
        className={`gauth-btn${loading ? ' gauth-btn-shimmer' : ''}`}
        onClick={handleClick}
        disabled={loading || !sdkReady}
        type="button"
      >
        {loading
          ? <><Spinner /><span>Signing in…</span></>
          : <><GoogleIcon /><span>{!sdkReady ? 'Loading…' : label}</span></>
        }
      </button>
    </>
  );
};

export default GoogleAuthButton;