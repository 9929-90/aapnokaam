import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';
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

// ─── Extract a clean display name ─────────────────────────────────────────────
// Tries richer name fields first; if only an email is available, converts
// "rohit.sharma@gmail.com" → "Rohit Sharma"
const getDisplayName = (conv) => {
  const raw =
    conv.otherUserFullName    ||
    conv.otherUserDisplayName ||
    conv.otherFullName        ||
    conv.otherName            ||
    conv.otherUserName        ||
    '';

  if (!raw) return 'Unknown';

  // Looks like an email — humanise the local part
  if (raw.includes('@')) {
    return raw
      .split('@')[0]                            // drop domain
      .replace(/[._\-+]+/g, ' ')               // dots/dashes → spaces
      .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
  }

  return raw;
};

const ChatSection = ({ user }) => {
  const [conversations, setConversations]               = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages]                         = useState([]);
  const [newMessage, setNewMessage]                     = useState('');
  const [loading, setLoading]                           = useState(true);
  const messagesEndRef                                  = useRef(null);

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (selectedConversation?.id) loadMessages(selectedConversation.id);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const r = await api.get('/chat/conversations');
      const data = r.data || [];
      setConversations(data);
      if (data.length > 0) setSelectedConversation(data[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadMessages = async (id) => {
    try {
      const r = await api.get(`/chat/conversations/${id}/messages`);
      setMessages([...(r.data || [])].reverse());
      await api.put(`/chat/conversations/${id}/read`);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation?.id) return;
    try {
      const r = await api.post('/chat/messages', {
        conversationId: selectedConversation.id,
        content: newMessage,
        messageType: 'TEXT',
      });
      setMessages(prev => [...prev, r.data]);
      setNewMessage('');
    } catch (e) { console.error(e); }
  };

  const isMine = (msg) => {
    const uid = user?.id ?? user?.userId ?? user?.workerId;
    const sid = msg?.senderId ?? msg?.sender?.id ?? msg?.userId;
    return uid && sid && Number(uid) === Number(sid);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', color: T.indigoMuted, ...font, fontSize: '0.85rem',
      fontWeight: 600, letterSpacing: '0.04em',
    }}>
      Loading messages…
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        .ak-conv-btn:hover { background: ${T.indigoSubtle} !important; }
        .ak-send:hover:not(:disabled) { opacity: 0.85 !important; }
        .ak-msg-input:focus { border-color: ${T.indigo} !important; box-shadow: 0 0 0 3px rgba(26,16,80,0.08) !important; }
        .ak-msg-input::placeholder { color: ${T.indigoMuted}; font-family: 'Open Sans', sans-serif; font-size: 0.85rem; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.ivoryDeep}; }
        ::-webkit-scrollbar-thumb { background: rgba(26,16,80,0.18); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(26,16,80,0.32); }
      `}</style>

      <div style={{
        display: 'flex',
        height: '520px',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
        border: `1px solid ${T.borderStrong}`,
        borderRadius: '3px',
        background: T.ivory,
        overflow: 'hidden',
        boxShadow: `0 4px 24px ${T.shadowSoft}`,
      }}>

        {/* ── LEFT: Conversation list ─────────────────────────────────────── */}
        <div style={{
          width: '260px', minWidth: '260px',
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${T.border}`,
          background: T.ivory,
          overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${T.border}`,
            borderTop: `2px solid ${T.indigo}`,
            flexShrink: 0,
            background: T.ivory,
          }}>
            <h2 style={{
              color: T.indigoDeep, fontWeight: 800,
              fontSize: '0.82rem', margin: 0, ...font,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>Messages</h2>
          </div>

          {/* Conversation list — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{
                padding: '32px 16px', textAlign: 'center',
                color: T.indigoMuted, fontSize: '0.82rem', ...font, fontWeight: 500,
              }}>
                No conversations yet
              </div>
            ) : (
              conversations.map(conv => {
                const active = selectedConversation?.id === conv.id;
                const name   = getDisplayName(conv); // ← clean name, never email
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={active ? '' : 'ak-conv-btn'}
                    style={{
                      width: '100%', padding: '12px 16px', textAlign: 'left',
                      background: active ? T.indigoSubtle : 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${T.border}`,
                      borderLeft: active ? `3px solid ${T.indigo}` : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{
                        color: active ? T.indigo : T.indigoText,
                        fontWeight: active ? 700 : 600,
                        fontSize: '0.85rem', ...font,
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        maxWidth: '160px',
                      }}>
                        {name}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span style={{
                          background: T.indigo, color: T.ivory,
                          fontSize: '0.62rem', fontWeight: 700,
                          padding: '2px 7px', ...font,
                          letterSpacing: '0.04em', borderRadius: '2px',
                          flexShrink: 0,
                        }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p style={{
                      color: T.indigoMuted, fontSize: '0.76rem', margin: 0, ...font,
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      fontWeight: 400,
                    }}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Chat area ────────────────────────────────────────────── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          background: T.ivoryMid, overflow: 'hidden',
        }}>
          {selectedConversation ? (
            <>
              {/* Chat header — shows clean name */}
              <div style={{
                padding: '13px 18px', flexShrink: 0,
                borderBottom: `1px solid ${T.border}`,
                borderTop: `2px solid ${T.indigo}`,
                background: T.ivory,
                display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: `0 2px 8px ${T.shadowSoft}`,
              }}>
                {/* Avatar initial */}
                <div style={{
                  width: '36px', height: '36px', flexShrink: 0,
                  borderRadius: '50%',
                  background: T.indigoSubtle,
                  border: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.indigo,
                  ...font, fontSize: '0.88rem', fontWeight: 800,
                }}>
                  {getDisplayName(selectedConversation).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: T.indigoDeep, fontWeight: 700, fontSize: '0.88rem', margin: 0, ...font }}>
                    {getDisplayName(selectedConversation)}
                  </p>
                  <p style={{ color: T.indigoMuted, fontSize: '0.72rem', margin: 0, ...font, fontWeight: 500 }}>
                    Active conversation
                  </p>
                </div>
              </div>

              {/* Messages — only this scrolls */}
              <div style={{
                flex: 1, overflowY: 'auto',
                padding: '18px',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    flex: 1, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: T.indigoMuted, fontSize: '0.85rem', ...font, fontWeight: 500,
                  }}>
                    No messages yet — start the conversation!
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const mine = isMine(msg);
                    return (
                      <div key={msg.id || i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '60%',
                          padding: '10px 14px',
                          background: mine ? T.indigo : T.ivory,
                          border: `1px solid ${mine ? T.indigo : T.border}`,
                          borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          boxShadow: mine ? `0 2px 10px ${T.shadow}` : `0 2px 8px ${T.shadowSoft}`,
                        }}>
                          <p style={{
                            color: mine ? T.ivory : T.indigoText,
                            fontSize: '0.85rem', margin: 0, lineHeight: 1.6,
                            ...font, fontWeight: 400,
                          }}>
                            {msg.content}
                          </p>
                          {msg.createdAt && (
                            <p style={{
                              color: mine ? 'rgba(240,235,224,0.55)' : T.indigoMuted,
                              fontSize: '0.68rem', margin: '5px 0 0',
                              textAlign: 'right', ...font, fontWeight: 400,
                            }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <form onSubmit={sendMessage} style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px',
                borderTop: `1px solid ${T.border}`,
                background: T.ivory,
                boxShadow: `0 -2px 8px ${T.shadowSoft}`,
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="ak-msg-input"
                  style={{
                    flex: 1, padding: '10px 14px',
                    background: T.ivoryMid,
                    border: `1px solid ${T.borderStrong}`,
                    borderRadius: '2px', outline: 'none',
                    color: T.indigoDeep, fontSize: '0.88rem',
                    ...font, fontWeight: 400,
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="ak-send"
                  style={{
                    padding: '10px 18px',
                    background: newMessage.trim() ? T.indigo : 'rgba(26,16,80,0.35)',
                    border: 'none', borderRadius: '2px',
                    color: T.ivory,
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: '7px',
                    fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.07em',
                    ...font, textTransform: 'uppercase',
                    transition: 'opacity 0.15s',
                    boxShadow: newMessage.trim() ? `0 3px 12px ${T.shadow}` : 'none',
                    flexShrink: 0,
                  }}
                >
                  <Send size={14} strokeWidth={2} /> Send
                </button>
              </form>
            </>
          ) : (
            /* No conversation selected */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '14px',
            }}>
              <div style={{
                width: '56px', height: '56px',
                border: `1px solid ${T.border}`,
                background: T.indigoSubtle, borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageCircle size={24} color={T.indigoMuted} strokeWidth={1.2} />
              </div>
              <p style={{ fontSize: '0.85rem', ...font, margin: 0, color: T.indigoMuted, fontWeight: 500 }}>
                Select a conversation to start messaging
              </p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default ChatSection;