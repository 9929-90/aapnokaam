import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, Mail, MapPin, User, Database, Lock, Share2, Cookie, RefreshCw, Phone } from 'lucide-react';

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

// ─── Policy sections ──────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'collect',
    Icon: Database,
    title: 'Information We Collect',
    content: [
      {
        sub: 'Account Information',
        text: 'When you register on AapnoKaam, we collect your full name, email address, phone number, and a password. Workers additionally provide their PAN number, skill category, hourly rate, and a profile photograph for identity verification purposes.',
      },
      {
        sub: 'Location Data',
        text: 'To connect you with nearby service providers, we collect your approximate or precise GPS coordinates when you use the "Use My Location" feature. Location is used solely to surface relevant workers within your area and is never stored beyond the active session without your consent.',
      },
      {
        sub: 'Booking & Payment Data',
        text: 'We record details of every booking you create or accept, including service titles, descriptions, scheduled dates, addresses, and estimated costs. Payment transactions are processed via Razorpay; AapnoKaam does not store raw card or bank details — only the Razorpay order ID and payment status.',
      },
      {
        sub: 'Usage Data',
        text: 'We automatically collect standard server logs including your IP address, browser type, pages visited, and timestamps. This helps us diagnose issues and improve platform performance.',
      },
    ],
  },
  {
    id: 'use',
    Icon: User,
    title: 'How We Use Your Information',
    content: [
      {
        sub: 'Service Delivery',
        text: 'Your information is primarily used to facilitate bookings between consumers and workers — matching you based on location, skill, and availability, and enabling in-app messaging between parties.',
      },
      {
        sub: 'Payments & Invoicing',
        text: 'We use your contact and booking data to generate payment orders via Razorpay and to maintain a transaction history accessible from your dashboard.',
      },
      {
        sub: 'Notifications',
        text: 'We send you in-app and email notifications regarding booking status updates, new messages, and platform announcements. You may manage notification preferences from your profile settings.',
      },
      {
        sub: 'Platform Improvement',
        text: 'Aggregated, anonymised usage data helps us understand how people navigate AapnoKaam so we can fix bugs and prioritise new features. This is an active learning project — your feedback genuinely shapes what gets built next.',
      },
    ],
  },
  {
    id: 'share',
    Icon: Share2,
    title: 'Sharing Your Information',
    content: [
      {
        sub: 'Between Users',
        text: 'When a booking is created, relevant details (name, contact, address, service description) are shared between the consumer and the assigned worker to facilitate the service. Workers\' public profiles — name, skill, rating, and city — are visible to all consumers on the platform.',
      },
      {
        sub: 'Third-Party Services',
        text: 'We use Razorpay for payment processing and Nominatim (OpenStreetMap) for reverse geocoding. These services receive only the minimum data required for their function and operate under their own privacy policies.',
      },
      {
        sub: 'Legal Obligations',
        text: 'We may disclose your data if required by law, court order, or to protect the rights and safety of AapnoKaam, its users, or the public. We will notify you of such disclosure where legally permissible.',
      },
      {
        sub: 'No Data Sales',
        text: 'AapnoKaam does not sell, rent, or trade your personal information to any third party for marketing purposes. Ever.',
      },
    ],
  },
  {
    id: 'security',
    Icon: Lock,
    title: 'Data Security',
    content: [
      {
        sub: 'Storage & Encryption',
        text: 'Your data is stored on secured servers. Passwords are hashed using industry-standard algorithms and are never stored in plain text. Payment data is handled exclusively by Razorpay under PCI-DSS compliance.',
      },
      {
        sub: 'Access Controls',
        text: 'Only authenticated users can access their own data. Admin-level access is restricted to the platform operator (Rohit) and requires separate credentials with additional verification.',
      },
      {
        sub: 'Honest Disclaimer',
        text: 'AapnoKaam is a learning project built by a solo developer. While every reasonable precaution is taken, we cannot guarantee absolute security. We encourage you not to share sensitive information beyond what is necessary for using the platform.',
      },
    ],
  },
  {
    id: 'rights',
    Icon: Shield,
    title: 'Your Rights',
    content: [
      {
        sub: 'Access & Correction',
        text: 'You may view and update your personal information at any time from the Profile section of your dashboard. Changes to your name, phone number, and address take effect immediately.',
      },
      {
        sub: 'Account Deletion',
        text: 'You may request deletion of your account and associated data by contacting us at the email below. We will process deletion requests within 30 days, subject to retention requirements for completed financial transactions.',
      },
      {
        sub: 'Data Portability',
        text: 'You may request a copy of the personal data we hold about you in a readable format. Contact us and we will respond within 14 days.',
      },
    ],
  },
  {
    id: 'cookies',
    Icon: Cookie,
    title: 'Cookies & Local Storage',
    content: [
      {
        sub: 'Authentication',
        text: 'We use browser session storage to maintain your logged-in state. No persistent tracking cookies are set by AapnoKaam itself.',
      },
      {
        sub: 'Third-Party Scripts',
        text: 'Razorpay\'s payment widget may set its own cookies in accordance with Razorpay\'s privacy policy. No advertising or analytics third-party cookies are loaded on this platform.',
      },
    ],
  },
  {
    id: 'updates',
    Icon: RefreshCw,
    title: 'Changes to This Policy',
    content: [
      {
        sub: 'Living Document',
        text: 'As AapnoKaam grows and as Rohit learns more about building responsible SaaS products, this policy will evolve. Material changes will be communicated via an in-app notification and the "Last Updated" date below will be revised.',
      },
      {
        sub: 'Continued Use',
        text: 'Your continued use of AapnoKaam after a policy update constitutes acceptance of the revised terms. If you disagree with any change, you may request account deletion.',
      },
    ],
  },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────
const PolicySection = ({ section, isOpen, onToggle, index }) => {
  const { Icon, title, content } = section;
  return (
    <div
      style={{
        background: T.ivory,
        border: `1px solid ${isOpen ? T.borderStrong : T.border}`,
        borderLeft: `3px solid ${isOpen ? T.indigo : T.border}`,
        borderRadius: '2px',
        transition: 'border-color 0.2s',
        animationDelay: `${index * 0.06}s`,
        animationFillMode: 'both',
      }}
      className="ak-section"
    >
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="ak-section-btn"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
          padding: '16px 18px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: '34px', height: '34px', flexShrink: 0,
          background: isOpen ? T.indigo : T.indigoSubtle,
          border: `1px solid ${isOpen ? T.indigo : T.border}`,
          borderRadius: '2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s, border-color 0.2s',
        }}>
          <Icon size={15} color={isOpen ? T.ivory : T.indigoMuted} strokeWidth={1.8} />
        </div>
        <span style={{
          flex: 1,
          color: isOpen ? T.indigoDeep : T.indigoText,
          fontWeight: isOpen ? 800 : 600,
          fontSize: '0.88rem', ...font,
          transition: 'color 0.2s',
        }}>
          {title}
        </span>
        <div style={{ color: T.indigoMuted, flexShrink: 0 }}>
          {isOpen
            ? <ChevronUp size={16} strokeWidth={2} />
            : <ChevronDown size={16} strokeWidth={2} />}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div style={{
          padding: '0 18px 18px 18px',
          borderTop: `1px solid ${T.border}`,
          paddingTop: '16px',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          {content.map(({ sub, text }) => (
            <div key={sub}>
              <p style={{
                color: T.indigoDeep, fontWeight: 700,
                fontSize: '0.78rem', textTransform: 'uppercase',
                letterSpacing: '0.06em', margin: '0 0 5px', ...font,
              }}>
                {sub}
              </p>
              <p style={{
                color: T.indigoText, fontSize: '0.86rem',
                lineHeight: 1.7, margin: 0, ...font, fontWeight: 400,
              }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PrivacyPolicy = () => {
  const [openId, setOpenId] = useState('collect');

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes ak-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ak-page { animation: ak-fade-up 0.3s ease both; }

        .ak-section {
          animation: ak-fade-up 0.3s ease both;
        }

        .ak-section-btn:hover { background: ${T.indigoSubtle} !important; }

        .ak-expand-all:hover { background: ${T.indigoMid} !important; }

        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.ivoryDeep}; }
        ::-webkit-scrollbar-thumb { background: rgba(26,16,80,0.18); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(26,16,80,0.32); }
      `}</style>

      <div style={{ minHeight: '100vh', background: T.ivoryMid, ...font }}>

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div style={{
          background: T.ivory,
          borderBottom: `1px solid ${T.borderStrong}`,
          borderTop: `3px solid ${T.indigo}`,
          padding: '40px 0 32px',
          boxShadow: `0 4px 24px ${T.shadowSoft}`,
        }}>
          <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 32px' }} className="ak-page">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              {/* Shield icon block */}
              <div style={{
                width: '56px', height: '56px', flexShrink: 0,
                background: T.indigo, borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 20px ${T.shadow}`,
                marginTop: '4px',
              }}>
                <Shield size={26} color={T.ivory} strokeWidth={1.5} />
              </div>

              <div style={{ flex: 1 }}>
                {/* Eyebrow */}
                <p style={{
                  fontSize: '0.68rem', fontWeight: 800, color: T.indigoMuted,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  margin: '0 0 8px', ...font,
                }}>
                  AapnoKaam · Legal
                </p>
                <h1 style={{
                  color: T.indigoDeep, fontWeight: 800,
                  fontSize: '1.6rem', margin: '0 0 10px', ...font,
                  letterSpacing: '-0.02em', lineHeight: 1.2,
                }}>
                  Privacy Policy
                </h1>
                <p style={{
                  color: T.indigoMuted, fontSize: '0.82rem',
                  margin: 0, ...font, fontWeight: 400, lineHeight: 1.6,
                  maxWidth: '560px',
                }}>
                  AapnoKaam is a local worker marketplace built by Rohit, a fullstack developer learning to build SaaS products from Udaipur, Rajasthan. This policy explains what data we collect, why, and how we protect it.
                </p>

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {[
                    { Icon: MapPin,  text: 'Udaipur, Rajasthan, India' },
                    { Icon: User,    text: 'Operated by Rohit'         },
                    { Icon: RefreshCw, text: 'Last updated: Feb 2026'  },
                  ].map(({ Icon, text }) => (
                    <span key={text} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      color: T.indigoMuted, fontSize: '0.74rem', fontWeight: 500, ...font,
                    }}>
                      <Icon size={12} strokeWidth={1.8} />
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 32px 60px' }}>

          {/* Honest intro banner */}
          <div style={{
            padding: '14px 18px',
            background: T.indigoSubtle,
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${T.indigo}`,
            borderRadius: '2px',
            marginBottom: '24px',
            animation: 'ak-fade-up 0.3s ease 0.1s both',
          }}>
            <p style={{ color: T.indigoText, fontSize: '0.84rem', margin: 0, ...font, fontWeight: 500, lineHeight: 1.65 }}>
              <strong style={{ color: T.indigoDeep, fontWeight: 800 }}>A note from Rohit:</strong> This is a real privacy policy for a real learning project. I'm building AapnoKaam to connect local workers in Udaipur with consumers who need their services. I'm not a lawyer — but I've written this as plainly and honestly as I can. If something is unclear, email me.
            </p>
          </div>

          {/* Expand / Collapse all */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button
              onClick={() => setOpenId(openId ? null : 'collect')}
              className="ak-expand-all"
              style={{
                padding: '6px 12px',
                background: T.ivoryDeep,
                border: `1px solid ${T.borderStrong}`,
                borderRadius: '2px',
                color: T.indigoMuted, cursor: 'pointer',
                fontSize: '0.70rem', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                transition: 'background 0.15s', ...font,
              }}
            >
              {openId ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {/* Accordion sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SECTIONS.map((section, i) => (
              <PolicySection
                key={section.id}
                section={section}
                index={i}
                isOpen={openId === section.id}
                onToggle={() => toggle(section.id)}
              />
            ))}
          </div>

          {/* ── Contact card ────────────────────────────────────────────── */}
          <div style={{
            marginTop: '32px',
            background: T.ivory,
            border: `1px solid ${T.borderStrong}`,
            borderTop: `3px solid ${T.indigo}`,
            borderRadius: '3px',
            padding: '22px 24px',
            boxShadow: `0 4px 16px ${T.shadowSoft}`,
            animation: 'ak-fade-up 0.3s ease 0.4s both',
          }}>
            <p style={{
              color: T.indigoDeep, fontWeight: 800, fontSize: '0.78rem',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              margin: '0 0 14px', ...font,
            }}>
              Questions? Contact Us
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { Icon: User,   label: 'Operator',  value: 'Rohit'                              },
                { Icon: MapPin, label: 'Location',  value: 'Udaipur, Rajasthan, India'          },
                { Icon: Mail,   label: 'Email',     value: 'rohit@aapnokaam.in'                 },
                { Icon: Phone,  label: 'Platform',  value: 'aapnokaam.in'                       },
              ].map(({ Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '30px', height: '30px', flexShrink: 0,
                    background: T.indigoSubtle, border: `1px solid ${T.border}`,
                    borderRadius: '2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={13} color={T.indigoMuted} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0, ...font }}>
                      {label}
                    </p>
                    <p style={{ fontSize: '0.84rem', fontWeight: 600, color: T.indigoText, margin: 0, ...font }}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p style={{
            textAlign: 'center', color: T.indigoMuted, fontSize: '0.72rem',
            margin: '24px 0 0', ...font, fontWeight: 400, lineHeight: 1.6,
          }}>
            AapnoKaam is a learning project. Policies are written in good faith and will evolve as the platform grows.
            <br />© 2026 Rohit · Udaipur, Rajasthan
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;