import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Skills Data — 40 local/Indian hyperlocal skills ─────────────────────────
const SKILLS = [
  { id: 1,  name: 'Plumber',           emoji: '🔧', desc: 'Pipe repairs & installations' },
  { id: 2,  name: 'Electrician',       emoji: '⚡', desc: 'Wiring & electrical work' },
  { id: 3,  name: 'Carpenter',         emoji: '🪚', desc: 'Furniture & woodwork' },
  { id: 4,  name: 'Painter',           emoji: '🖌️', desc: 'Wall & texture painting' },
  { id: 5,  name: 'AC Repair',         emoji: '❄️', desc: 'Servicing & gas refill' },
  { id: 6,  name: 'Mehendi Artist',    emoji: '🌿', desc: 'Bridal & festival designs' },
  { id: 7,  name: 'Cook / Chef',       emoji: '👨‍🍳', desc: 'Home & event cooking' },
  { id: 8,  name: 'Driver',            emoji: '🚗', desc: 'Personal & outstation trips' },
  { id: 9,  name: 'Tailor',            emoji: '🧵', desc: 'Stitching & alterations' },
  { id: 10, name: 'Washer / Dhobi',    emoji: '👕', desc: 'Laundry & ironing' },
  { id: 11, name: 'Maid / Housekeep',  emoji: '🧹', desc: 'Daily cleaning & cooking' },
  { id: 12, name: 'Security Guard',    emoji: '💂', desc: 'Building & event security' },
  { id: 13, name: 'Gardener',          emoji: '🌱', desc: 'Lawn & plant care' },
  { id: 14, name: 'Tiffin Service',    emoji: '🍱', desc: 'Daily home-cooked meals' },
  { id: 15, name: 'Pest Control',      emoji: '🐜', desc: 'Termite & rodent removal' },
  { id: 16, name: 'CCTV Install',      emoji: '📹', desc: 'Camera setup & DVR config' },
  { id: 17, name: 'Mobile Repair',     emoji: '📱', desc: 'Screen & hardware fix' },
  { id: 18, name: 'Computer Repair',   emoji: '💻', desc: 'Virus removal & hardware' },
  { id: 19, name: 'TV Repair',         emoji: '📺', desc: 'LCD, LED & smart TVs' },
  { id: 20, name: 'Washing Machine',   emoji: '🫧', desc: 'Repair & servicing' },
  { id: 21, name: 'Fridge Repair',     emoji: '🧊', desc: 'Cooling & compressor fix' },
  { id: 22, name: 'Geyser Repair',     emoji: '🚿', desc: 'Water heater servicing' },
  { id: 23, name: 'Inverter / UPS',    emoji: '🔋', desc: 'Battery & installation' },
  { id: 24, name: 'RO Water Purifier', emoji: '💧', desc: 'Service & filter change' },
  { id: 25, name: 'Beautician',        emoji: '💅', desc: 'Facial, waxing & makeup' },
  { id: 26, name: 'Barber',            emoji: '✂️', desc: 'Haircut & shave at home' },
  { id: 27, name: 'Yoga Trainer',      emoji: '🧘', desc: 'Morning yoga sessions' },
  { id: 28, name: 'Gym Trainer',       emoji: '🏋️', desc: 'Personal fitness coaching' },
  { id: 29, name: 'Tutor',             emoji: '📚', desc: 'School & competitive exams' },
  { id: 30, name: 'Event Decorator',   emoji: '🎊', desc: 'Weddings & birthdays' },
  { id: 31, name: 'Photographer',      emoji: '📷', desc: 'Events & portraits' },
  { id: 32, name: 'Videographer',      emoji: '🎥', desc: 'Wedding & reels shooting' },
  { id: 33, name: 'DJ / Sound',        emoji: '🎵', desc: 'Events & parties' },
  { id: 34, name: 'Tent House',        emoji: '⛺', desc: 'Shamiana & furniture hire' },
  { id: 35, name: 'Catering',          emoji: '🍽️', desc: 'Bulk cooking for events' },
  { id: 36, name: 'Packers & Movers',  emoji: '📦', desc: 'Home shifting & transport' },
  { id: 37, name: 'Tile / Flooring',   emoji: '🧱', desc: 'Marble, tiles & mosaic' },
  { id: 38, name: 'Welding',           emoji: '🔩', desc: 'Iron grill & gate work' },
  { id: 39, name: 'Astrologer',        emoji: '🔮', desc: 'Kundali & vastu consult' },
  { id: 40, name: 'Priest / Pandit',   emoji: '🪔', desc: 'Puja & religious ceremonies' },
];

// Triple the array for seamless infinite loop
const TRACK = [...SKILLS, ...SKILLS, ...SKILLS];

// ─── Theme ────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800;900&display=swap');

  .sk-root {
    width: 100%;
    background: #f0ebe0;
    padding: 56px 0 64px;
    overflow: hidden;
    position: relative;
    font-family: 'Open Sans', sans-serif;
  }

  .sk-noise {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  .sk-header {
    text-align: center;
    margin-bottom: 44px;
    position: relative;
    z-index: 1;
    padding: 0 24px;
  }

  .sk-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(20, 10, 80, 0.5);
    margin-bottom: 14px;
  }

  .sk-eyebrow::before,
  .sk-eyebrow::after {
    content: '';
    display: block;
    width: 32px;
    height: 1px;
    background: rgba(20, 10, 80, 0.25);
  }

  .sk-title {
    font-family: 'Open Sans', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 900;
    color: #140c40;
    margin: 0 0 12px;
    line-height: 1.2;
    letter-spacing: -0.03em;
  }

  .sk-title span {
    color: #1a1050;
    position: relative;
  }

  .sk-title span::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(20, 10, 80, 0.18);
    border-radius: 2px;
  }

  .sk-sub {
    font-size: 0.9rem;
    color: rgba(20, 10, 80, 0.55);
    font-weight: 500;
    margin: 0;
    line-height: 1.6;
  }

  /* Tracks container */
  .sk-tracks {
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    z-index: 1;
  }

  /* Edge fade */
  .sk-tracks::before,
  .sk-tracks::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 120px;
    z-index: 2;
    pointer-events: none;
  }
  .sk-tracks::before {
    left: 0;
    background: linear-gradient(to right, #f0ebe0 0%, transparent 100%);
  }
  .sk-tracks::after {
    right: 0;
    background: linear-gradient(to left, #f0ebe0 0%, transparent 100%);
  }

  /* Single row */
  .sk-row {
    overflow: hidden;
  }

  .sk-track {
    display: flex;
    gap: 12px;
    width: max-content;
    will-change: transform;
  }

  .sk-track.row-a {
    animation: sk-scroll-left 55s linear infinite;
  }
  .sk-track.row-b {
    animation: sk-scroll-right 65s linear infinite;
  }
  .sk-track.row-c {
    animation: sk-scroll-left 48s linear infinite;
  }

  .sk-track:hover,
  .sk-track:focus-within {
    animation-play-state: paused;
  }

  @keyframes sk-scroll-left {
    0%   { transform: translateX(0); }
    100% { transform: translateX(calc(-100% / 3)); }
  }
  @keyframes sk-scroll-right {
    0%   { transform: translateX(calc(-100% / 3)); }
    100% { transform: translateX(0); }
  }

  /* Card */
  .sk-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    background: #ede7d9;
    border: 1px solid rgba(20, 10, 80, 0.14);
    border-radius: 3px;
    cursor: pointer;
    user-select: none;
    transition: background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  .sk-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(20,10,80,0.04) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .sk-card:hover {
    background: #140c40;
    border-color: #140c40;
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 28px rgba(20, 10, 80, 0.22);
  }

  .sk-card:hover::before { opacity: 1; }
  .sk-card:hover .sk-card-name { color: #f0ebe0; }
  .sk-card:hover .sk-card-desc { color: rgba(240, 235, 224, 0.6); }
  .sk-card:hover .sk-card-emoji-wrap {
    background: rgba(240, 235, 224, 0.12);
    border-color: rgba(240, 235, 224, 0.2);
  }

  .sk-card:active {
    transform: translateY(-1px) scale(1.01);
  }

  .sk-card-emoji-wrap {
    width: 42px;
    height: 42px;
    background: rgba(20, 10, 80, 0.06);
    border: 1px solid rgba(20, 10, 80, 0.12);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
    flex-shrink: 0;
    transition: background 0.18s, border-color 0.18s;
  }

  .sk-card-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sk-card-name {
    font-family: 'Open Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    color: #140c40;
    letter-spacing: 0.01em;
    transition: color 0.18s;
  }

  .sk-card-desc {
    font-family: 'Open Sans', sans-serif;
    font-size: 0.68rem;
    font-weight: 500;
    color: rgba(20, 10, 80, 0.5);
    transition: color 0.18s;
  }

  /* Login nudge tooltip */
  .sk-card-login-nudge {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    background: #140c40;
    color: #f0ebe0;
    font-family: 'Open Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 2px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s, transform 0.15s;
    z-index: 10;
  }

  .sk-card-login-nudge::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #140c40;
  }

  .sk-card:hover .sk-card-login-nudge {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }

  /* Bottom CTA */
  .sk-cta {
    text-align: center;
    margin-top: 48px;
    position: relative;
    z-index: 1;
    padding: 0 24px;
  }

  .sk-cta-inner {
    display: inline-flex;
    align-items: center;
    gap: 20px;
    background: #140c40;
    border-radius: 3px;
    padding: 20px 36px;
    box-shadow: 0 12px 40px rgba(20, 10, 80, 0.22);
  }

  .sk-cta-text {
    font-family: 'Open Sans', sans-serif;
    color: rgba(240, 235, 224, 0.75);
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.5;
    text-align: left;
  }

  .sk-cta-text strong {
    display: block;
    color: #f0ebe0;
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 2px;
  }

  .sk-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 11px 24px;
    background: #f0ebe0;
    border: none;
    border-radius: 2px;
    color: #140c40;
    font-family: 'Open Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .sk-cta-btn:hover {
    background: #fff;
    transform: translateY(-1px);
  }

  /* Count badge */
  .sk-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(20, 10, 80, 0.07);
    border: 1px solid rgba(20, 10, 80, 0.14);
    border-radius: 2px;
    padding: 4px 12px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(20, 10, 80, 0.55);
    margin-bottom: 16px;
  }

  @media (max-width: 640px) {
    .sk-cta-inner {
      flex-direction: column;
      text-align: center;
      padding: 20px 24px;
    }
    .sk-cta-text { text-align: center; }
    .sk-tracks::before, .sk-tracks::after { width: 60px; }
  }
`;

// ─── Split skills into 3 rows ─────────────────────────────────────────────────
const ROW_A = [...SKILLS.slice(0,  14), ...SKILLS.slice(0,  14), ...SKILLS.slice(0,  14)];
const ROW_B = [...SKILLS.slice(13, 27), ...SKILLS.slice(13, 27), ...SKILLS.slice(13, 27)];
const ROW_C = [...SKILLS.slice(26, 40), ...SKILLS.slice(26, 40), ...SKILLS.slice(26, 40)];

// ─── Single Skill Card ────────────────────────────────────────────────────────
const SkillCard = ({ skill, isLoggedIn, onNavigateToLogin }) => {
  const handleClick = () => {
    if (!isLoggedIn) {
      onNavigateToLogin(skill);
    }
    // if logged in, do whatever — search by category, navigate to results, etc.
  };

  return (
    <div className="sk-card" onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      {!isLoggedIn && (
        <span className="sk-card-login-nudge">🔐 Login to Book</span>
      )}
      <div className="sk-card-emoji-wrap">
        <span role="img" aria-label={skill.name}>{skill.emoji}</span>
      </div>
      <div className="sk-card-text">
        <span className="sk-card-name">{skill.name}</span>
        <span className="sk-card-desc">{skill.desc}</span>
      </div>
    </div>
  );
};

// ─── Main SkillsSlider ────────────────────────────────────────────────────────
const SkillsSlider = ({ isLoggedIn = false, onNavigateToLogin }) => {
  // fallback if no navigate prop passed
const handleNavigateToLogin = (skill) => {
    if (onNavigateToLogin) {
      onNavigateToLogin(skill);
    } else {
      window.location.href = '/login';
    }
  };

  const cardProps = { isLoggedIn, onNavigateToLogin: handleNavigateToLogin };

  return (
    <>
      <style>{CSS}</style>
      <section className="sk-root" aria-label="Available Skills">
        <div className="sk-noise" aria-hidden="true" />

        {/* Header */}
        <div className="sk-header">
          <div className="sk-eyebrow">
            <span>Local Services</span>
          </div>
          <div className="sk-count-badge">
            ✦ {SKILLS.length}+ Skill Categories
          </div>
          <h2 className="sk-title">
            Every skill you need,<br />
            <span>right in your city</span>
          </h2>
          <p className="sk-sub">
            From daily household needs to special occasions — find trusted local workers near you.
          </p>
        </div>

        {/* Three auto-scroll rows */}
        <div className="sk-tracks">
          {/* Row A — scrolls left */}
          <div className="sk-row" aria-hidden="true">
            <div className="sk-track row-a">
              {ROW_A.map((skill, i) => (
                <SkillCard key={`a-${skill.id}-${i}`} skill={skill} {...cardProps} />
              ))}
            </div>
          </div>

          {/* Row B — scrolls right */}
          <div className="sk-row" aria-hidden="true">
            <div className="sk-track row-b">
              {ROW_B.map((skill, i) => (
                <SkillCard key={`b-${skill.id}-${i}`} skill={skill} {...cardProps} />
              ))}
            </div>
          </div>

          {/* Row C — scrolls left faster */}
          <div className="sk-row" aria-hidden="true">
            <div className="sk-track row-c">
              {ROW_C.map((skill, i) => (
                <SkillCard key={`c-${skill.id}-${i}`} skill={skill} {...cardProps} />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="sk-cta">
          <div className="sk-cta-inner">
            <div className="sk-cta-text">
              <strong>Can't find your service?</strong>
              Browse all categories after logging in
            </div>
            {!isLoggedIn && (
              <button className="sk-cta-btn" onClick={() => window.location.href = '/login'}>
                Login to Explore →
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default SkillsSlider;

/*
─── USAGE ────────────────────────────────────────────────────────────────────

  // In your landing page / homepage:
  import SkillsSlider from './SkillsSlider';

  // Not logged in — redirect to /login on card click:
  <SkillsSlider
    isLoggedIn={false}
    onNavigateToLogin={(skill) => navigate('/login', { state: { from: 'skills', skill } })}
  />

  // Logged in — cards can do something else (search, filter, etc.):
  <SkillsSlider
    isLoggedIn={true}
    onNavigateToLogin={(skill) => navigate(`/consumer/search?category=${skill?.name}`)}
  />

─────────────────────────────────────────────────────────────────────────────
*/