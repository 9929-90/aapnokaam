import React from 'react';
import { X, Bell } from 'lucide-react';

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

const NotificationPanel = ({
  notifications = [],
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        .ak-notif-panel { animation: ak-notif-in 0.18s ease; }
        @keyframes ak-notif-in { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        .ak-notif-row:hover  { background: ${T.indigoSubtle} !important; }
        .ak-close-btn:hover  { background: ${T.indigoSubtle} !important; }
        .ak-mark-btn:hover   { color: ${T.indigo} !important; }
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.ivoryDeep}; }
        ::-webkit-scrollbar-thumb { background: rgba(26,16,80,0.18); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(26,16,80,0.32); }
      `}</style>

      <div
        className="ak-notif-panel"
        style={{
          position: 'absolute',
          right: 0,
          top: '48px',
          width: '360px',
          background: T.ivory,
          border: `1px solid ${T.borderStrong}`,
          borderRadius: '3px',
          borderTop: `3px solid ${T.indigo}`,
          boxShadow: `0 12px 40px rgba(20,10,80,0.18), 0 2px 8px ${T.shadowSoft}`,
          zIndex: 50,
          maxHeight: '500px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div style={{
          padding: '13px 16px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: T.ivory,
          flexShrink: 0,
          boxShadow: `0 2px 6px ${T.shadowSoft}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{
              color: T.indigoDeep, fontWeight: 800,
              fontSize: '0.82rem', margin: 0, ...font,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{
                background: T.indigo, color: T.ivory,
                fontSize: '0.62rem', fontWeight: 700,
                padding: '2px 7px', borderRadius: '2px',
                letterSpacing: '0.04em', ...font,
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="ak-mark-btn"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.indigoMuted, fontSize: '0.72rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '3px 6px', ...font,
                  transition: 'color 0.15s',
                }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="ak-close-btn"
              style={{
                width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent',
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                cursor: 'pointer',
                color: T.indigoMuted,
                transition: 'background 0.15s',
              }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── List ──────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {safeNotifications.length > 0 ? (
            safeNotifications.map((notif) => (
              <div
                key={notif.id}
                className="ak-notif-row"
                onClick={() => onMarkAsRead?.(notif.id)}
                style={{
                  padding: '13px 16px',
                  borderBottom: `1px solid ${T.border}`,
                  cursor: 'pointer',
                  background: notif.isRead ? 'transparent' : T.indigoSubtle,
                  borderLeft: notif.isRead ? '3px solid transparent' : `3px solid ${T.indigo}`,
                  transition: 'background 0.15s',
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                }}
              >
                {/* Unread dot */}
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  marginTop: '5px', flexShrink: 0,
                  background: notif.isRead ? 'transparent' : T.indigo,
                  border: notif.isRead ? `1px solid ${T.border}` : 'none',
                  transition: 'background 0.15s',
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    color: notif.isRead ? T.indigoText : T.indigoDeep,
                    fontWeight: notif.isRead ? 500 : 700,
                    fontSize: '0.84rem', margin: 0, ...font,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {notif.title}
                  </p>
                  <p style={{
                    color: T.indigoMuted, fontSize: '0.78rem',
                    margin: '4px 0 0', ...font, fontWeight: 400,
                    lineHeight: 1.5,
                  }}>
                    {notif.message}
                  </p>
                  {notif.createdAt && (
                    <p style={{
                      color: T.indigoMuted, fontSize: '0.68rem',
                      margin: '6px 0 0', ...font, fontWeight: 400,
                      opacity: 0.75,
                    }}>
                      {new Date(notif.createdAt).toLocaleString([], {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            /* Empty state */
            <div style={{
              padding: '40px 16px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '52px', height: '52px',
                background: T.indigoSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell size={22} color={T.indigoMuted} strokeWidth={1.2} />
              </div>
              <p style={{
                color: T.indigoMuted, fontSize: '0.82rem',
                margin: 0, ...font, fontWeight: 500,
              }}>
                No notifications
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;