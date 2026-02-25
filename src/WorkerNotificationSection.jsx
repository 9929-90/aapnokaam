import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';

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

const WorkerNotificationsSection = ({ token }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(
        `${API_BASE_URL}/notifications?unreadOnly=false&page=0&size=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await r.json();
      setNotifications(Array.isArray(data) ? data : data.content || data.notifications || []);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes ak-spin { to { transform: rotate(360deg) } }
        .ak-notif-row:hover { background: ${T.indigoSubtle} !important; }
        .ak-notif-del:hover { color: #b91c1c !important; }
        .ak-mark-all:hover  { color: ${T.indigo} !important; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Page heading + actions ───────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{
              ...font, color: T.indigoDeep, fontWeight: 800,
              fontSize: '1.05rem', letterSpacing: '0.05em',
              textTransform: 'uppercase', margin: 0,
            }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span style={{
                background: T.indigo, color: T.ivory,
                ...font, fontSize: '0.65rem', fontWeight: 700,
                padding: '3px 9px', borderRadius: '2px', letterSpacing: '0.04em',
              }}>
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="ak-mark-all"
              style={{
                ...font, fontSize: '0.72rem', fontWeight: 700,
                color: T.indigoMuted, background: 'none', border: 'none',
                cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'color 0.15s',
              }}
            >
              <Check size={13} strokeWidth={2} /> Mark all as read
            </button>
          )}
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

        {/* ── Main panel ──────────────────────────────────────────────── */}
        <div style={{
          background: T.ivory,
          border: `1px solid ${T.borderStrong}`,
          borderTop: `3px solid ${T.indigo}`,
          borderRadius: '3px',
          boxShadow: `0 4px 20px ${T.shadowSoft}`,
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '56px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '32px', height: '32px', border: `2px solid ${T.border}`, borderTop: `2px solid ${T.indigo}`, borderRadius: '50%', animation: 'ak-spin 0.75s linear infinite' }} />
              <p style={{ ...font, color: T.indigoMuted, fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Loading notifications…</p>
            </div>

          ) : notifications.length === 0 ? (
            <div style={{ padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '56px', height: '56px', background: T.indigoSubtle, border: `1px solid ${T.border}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={24} color={T.indigoMuted} strokeWidth={1.2} />
              </div>
              <p style={{ ...font, color: T.indigoDeep, fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>No notifications</p>
              <p style={{ ...font, color: T.indigoMuted, fontSize: '0.82rem', fontWeight: 400, margin: 0 }}>You're all caught up.</p>
            </div>

          ) : (
            notifications.map((notif, i) => (
              <div
                key={notif.id || i}
                className="ak-notif-row"
                onClick={() => !notif.isRead && markRead(notif.id)}
                style={{
                  padding: '14px 20px',
                  borderBottom: i < notifications.length - 1 ? `1px solid ${T.border}` : 'none',
                  background: notif.isRead ? 'transparent' : T.indigoSubtle,
                  borderLeft: notif.isRead ? '3px solid transparent' : `3px solid ${T.indigo}`,
                  cursor: notif.isRead ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  transition: 'background 0.15s',
                }}
              >
                {/* Unread dot */}
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  marginTop: '6px', flexShrink: 0,
                  background: notif.isRead ? 'transparent' : T.indigo,
                  border: notif.isRead ? `1px solid ${T.border}` : 'none',
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    ...font,
                    color: notif.isRead ? T.indigoText : T.indigoDeep,
                    fontWeight: notif.isRead ? 500 : 700,
                    fontSize: '0.88rem', margin: 0,
                  }}>
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p style={{
                      ...font, color: T.indigoMuted, fontSize: '0.80rem',
                      fontWeight: 400, lineHeight: 1.55, margin: '4px 0 0',
                    }}>
                      {notif.message}
                    </p>
                  )}
                  {notif.createdAt && (
                    <p style={{
                      ...font, color: T.indigoMuted, fontSize: '0.68rem',
                      fontWeight: 400, margin: '6px 0 0', opacity: 0.75,
                    }}>
                      {new Date(notif.createdAt).toLocaleString([], {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                  className="ak-notif-del"
                  title="Delete"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: T.indigoMuted, padding: '4px', lineHeight: 0, flexShrink: 0,
                    transition: 'color 0.15s',
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.8} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default WorkerNotificationsSection;