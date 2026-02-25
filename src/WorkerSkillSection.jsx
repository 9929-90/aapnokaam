import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, ChevronDown, CheckCircle2, AlertCircle, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081/api';

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  ivory:        '#f0ebe0',
  ivoryDeep:    '#e8e0ce',
  ivoryMid:     '#ede7d9',
  indigo:       '#1a1050',
  indigoDeep:   '#140c40',
  indigoHover:  '#251870',
  indigoSubtle: 'rgba(20, 10, 80, 0.06)',
  indigoMid:    'rgba(20, 10, 80, 0.10)',
  indigoText:   'rgba(20, 10, 80, 0.78)',
  indigoMuted:  'rgba(20, 10, 80, 0.50)',
  border:       'rgba(20, 10, 80, 0.15)',
  borderStrong: 'rgba(20, 10, 80, 0.28)',
  shadow:       'rgba(20, 10, 80, 0.14)',
  shadowSoft:   'rgba(20, 10, 80, 0.07)',
  success:      '#166534',
  successBg:    'rgba(22, 101, 52, 0.08)',
  successBd:    'rgba(22, 101, 52, 0.3)',
  error:        '#b91c1c',
  errorBg:      'rgba(185, 28, 28, 0.07)',
  errorBd:      'rgba(185, 28, 28, 0.3)',
};

const font = { fontFamily: "'Open Sans', sans-serif" };

// ─── Proficiency config ───────────────────────────────────────────────────────
const PROFICIENCY_LEVELS = [
  { value: 'BEGINNER',     label: 'Beginner',     bars: 1, color: '#94a3b8' },
  { value: 'INTERMEDIATE', label: 'Intermediate', bars: 2, color: '#f59e0b' },
  { value: 'ADVANCED',     label: 'Advanced',     bars: 3, color: '#3b82f6' },
  { value: 'EXPERT',       label: 'Expert',       bars: 4, color: T.indigo  },
];

// ─── Proficiency Bars ─────────────────────────────────────────────────────────
const ProficiencyBars = ({ level, size = 'md' }) => {
  const cfg = PROFICIENCY_LEVELS.find(p => p.value === level) || PROFICIENCY_LEVELS[0];
  const h = size === 'sm' ? '10px' : '14px';
  const w = size === 'sm' ? '8px'  : '10px';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: w,
          height: `calc(${h} * ${0.4 + i * 0.2})`,
          borderRadius: '1px',
          background: i <= cfg.bars ? cfg.color : T.border,
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  );
};

// ─── Custom Select ────────────────────────────────────────────────────────────
const Select = ({ value, onChange, options, placeholder, disabled }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: '100%', padding: '8px 36px 8px 12px',
          background: disabled ? T.ivoryDeep : T.ivoryMid,
          border: `1px solid ${T.borderStrong}`,
          borderRadius: '2px', cursor: disabled ? 'not-allowed' : 'pointer',
          color: selected ? T.indigoDeep : T.indigoMuted,
          ...font, fontSize: '0.84rem', fontWeight: selected ? 600 : 400,
          textAlign: 'left', position: 'relative',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 0.15s',
        }}
      >
        {selected ? selected.label : placeholder}
        <ChevronDown size={14} color={T.indigoMuted} strokeWidth={2}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
            background: T.ivory, border: `1px solid ${T.borderStrong}`,
            borderRadius: '2px', marginTop: '2px',
            boxShadow: `0 8px 24px ${T.shadow}`,
            overflow: 'hidden',
          }}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: '100%', padding: '9px 12px',
                  background: opt.value === value ? T.indigoSubtle : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: opt.value === value ? T.indigo : T.indigoText,
                  ...font, fontSize: '0.84rem',
                  fontWeight: opt.value === value ? 700 : 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderLeft: opt.value === value ? `3px solid ${T.indigo}` : '3px solid transparent',
                  transition: 'background 0.12s',
                }}
              >
                <span>{opt.label}</span>
                {opt.bars && <ProficiencyBars level={opt.value} size="sm" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Alert strip ──────────────────────────────────────────────────────────────
const Alert = ({ type, message, onClose }) => {
  const cfg = {
    success: { color: T.success, bg: T.successBg, border: T.successBd, Icon: CheckCircle2 },
    error:   { color: T.error,   bg: T.errorBg,   border: T.errorBd,   Icon: AlertCircle  },
  };
  const { color, bg, border: bd, Icon } = cfg[type] || cfg.error;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px',
      background: bg, borderLeft: `3px solid ${color}`, borderRadius: '0 2px 2px 0',
      padding: '10px 14px', marginBottom: '16px',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color, ...font, fontSize: '0.82rem', fontWeight: 600 }}>
        <Icon size={16} strokeWidth={2} /> {message}
      </span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color, opacity: 0.7, padding: 0, lineHeight: 0 }}>
          <X size={15} />
        </button>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WorkerSkillsSection = ({ token }) => {
  const [skills, setSkills]           = useState([]);       // current worker skills
  const [categories, setCategories]   = useState([]);       // all available categories
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [alert, setAlert]             = useState(null);
  const [dirty, setDirty]             = useState(false);

  // New skill form state
  const [newCategoryId, setNewCategoryId]   = useState('');
  const [newProficiency, setNewProficiency] = useState('BEGINNER');
  const [newYears, setNewYears]             = useState('');
  const [newIsPrimary, setNewIsPrimary]     = useState(false);
  const [addOpen, setAddOpen]               = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [skillsRes, catsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/worker/skills`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/worker/categories`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const skillsData = await skillsRes.json();
      const catsData   = await catsRes.json();
      setSkills(Array.isArray(skillsData) ? skillsData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch {
      setAlert({ type: 'error', message: 'Failed to load skills data. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Add skill to local list ────────────────────────────────────────────────
  const handleAddSkill = () => {
    if (!newCategoryId) { setAlert({ type: 'error', message: 'Please select a skill category.' }); return; }
    if (skills.some(s => s.categoryId === parseInt(newCategoryId))) {
      setAlert({ type: 'error', message: 'You already have this skill. Edit the existing one instead.' });
      return;
    }
    const cat = categories.find(c => c.id === parseInt(newCategoryId));
    const newSkill = {
      id:                  null, // new, not yet saved
      categoryId:          parseInt(newCategoryId),
      categoryName:        cat?.name || '',
      categoryDescription: cat?.description || '',
      proficiencyLevel:    newProficiency,
      yearsOfExperience:   newYears ? parseInt(newYears) : null,
      isPrimary:           newIsPrimary,
      _isNew:              true,
    };
    setSkills(prev => [...prev, newSkill]);
    setNewCategoryId(''); setNewProficiency('BEGINNER');
    setNewYears(''); setNewIsPrimary(false); setAddOpen(false);
    setDirty(true); setAlert(null);
  };

  // ── Remove skill from local list ───────────────────────────────────────────
  const handleRemove = (categoryId) => {
    setSkills(prev => prev.filter(s => s.categoryId !== categoryId));
    setDirty(true);
  };

  // ── Edit skill inline ──────────────────────────────────────────────────────
  const handleEdit = (categoryId, field, value) => {
    setSkills(prev => prev.map(s =>
      s.categoryId === categoryId ? { ...s, [field]: value } : s
    ));
    setDirty(true);
  };

  // ── Set primary (only one can be primary) ──────────────────────────────────
  const handleSetPrimary = (categoryId) => {
    setSkills(prev => prev.map(s => ({ ...s, isPrimary: s.categoryId === categoryId })));
    setDirty(true);
  };

  // ── Save all to backend ────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setAlert(null);
    try {
      const payload = {
        skills: skills.map(s => ({
          categoryId:       s.categoryId,
          proficiencyLevel: s.proficiencyLevel,
          yearsOfExperience: s.yearsOfExperience || 0,
          isPrimary:        s.isPrimary || false,
        })),
      };
      const res  = await fetch(`${API_BASE_URL}/worker/skills`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setAlert({ type: 'success', message: data.message || 'Skills saved successfully!' });
        setDirty(false);
        loadAll(); // reload to get proper IDs
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to save skills.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const usedCategoryIds = new Set(skills.map(s => s.categoryId));
  const availableCategories = categories.filter(c => !usedCategoryIds.has(c.id));
  const categoryOptions = availableCategories.map(c => ({ value: String(c.id), label: c.name }));
  const proficiencyOptions = PROFICIENCY_LEVELS.map(p => ({ value: p.value, label: p.label, bars: p.bars }));

  const primarySkill = skills.find(s => s.isPrimary);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes ak-spin  { to { transform: rotate(360deg) } }
        @keyframes ak-slide { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .ak-skill-row:hover  { border-color: rgba(26,16,80,0.3) !important; }
        .ak-del-btn:hover    { color: ${T.error} !important; background: ${T.errorBg} !important; }
        .ak-primary-btn:hover { border-color: ${T.success} !important; color: ${T.success} !important; }
        .ak-save-btn:hover:not(:disabled) { background: ${T.indigoHover} !important; }
        .ak-add-toggle:hover { border-color: ${T.indigo} !important; color: ${T.indigo} !important; }
        .ak-input:focus { border-color: ${T.indigo} !important; box-shadow: 0 0 0 3px rgba(26,16,80,0.08) !important; outline: none; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Header row ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ ...font, color: T.indigoDeep, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
              My Skills
            </h2>
            <p style={{ ...font, color: T.indigoMuted, fontSize: '0.76rem', fontWeight: 500, margin: '4px 0 0' }}>
              {skills.length} skill{skills.length !== 1 ? 's' : ''} · {primarySkill ? `Primary: ${primarySkill.categoryName}` : 'No primary skill set'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="ak-save-btn"
                style={{
                  ...font, padding: '9px 20px',
                  background: saving ? 'rgba(26,16,80,0.4)' : T.indigo,
                  color: T.ivory, border: 'none', borderRadius: '2px',
                  fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  boxShadow: `0 3px 12px ${T.shadow}`,
                  transition: 'background 0.15s',
                }}
              >
                {saving ? (
                  <><span style={{ width: '13px', height: '13px', border: `2px solid rgba(240,235,224,0.3)`, borderTop: `2px solid ${T.ivory}`, borderRadius: '50%', animation: 'ak-spin 0.7s linear infinite' }} /> Saving…</>
                ) : (
                  <><CheckCircle2 size={14} strokeWidth={2} /> Save Changes</>
                )}
              </button>
            )}
            <button
              onClick={() => setAddOpen(o => !o)}
              className="ak-add-toggle"
              style={{
                ...font, padding: '9px 16px',
                background: addOpen ? T.indigoSubtle : 'transparent',
                color: addOpen ? T.indigo : T.indigoMuted,
                border: `1px solid ${addOpen ? T.indigo : T.borderStrong}`,
                borderRadius: '2px', cursor: 'pointer',
                fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '7px',
                transition: 'all 0.15s',
              }}
            >
              {addOpen ? <><X size={13} strokeWidth={2} /> Cancel</> : <><Plus size={13} strokeWidth={2} /> Add Skill</>}
            </button>
          </div>
        </div>

        {/* ── Alert ───────────────────────────────────────────────────── */}
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* ── Add skill form ───────────────────────────────────────────── */}
        {addOpen && (
          <div style={{
            background: T.ivory,
            border: `1px solid ${T.borderStrong}`,
            borderTop: `3px solid ${T.indigo}`,
            borderRadius: '3px',
            padding: '20px',
            boxShadow: `0 4px 20px ${T.shadowSoft}`,
            animation: 'ak-slide 0.18s ease',
          }}>
            <p style={{ ...font, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.indigoMuted, margin: '0 0 16px' }}>
              Add New Skill
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px', gap: '12px', alignItems: 'end' }}>

              {/* Category */}
              <div>
                <label style={{ ...font, display: 'block', fontSize: '0.68rem', fontWeight: 700, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>
                  Skill Category *
                </label>
                <Select
                  value={newCategoryId}
                  onChange={setNewCategoryId}
                  options={categoryOptions}
                  placeholder={categoryOptions.length === 0 ? 'All skills added' : 'Select a category…'}
                  disabled={categoryOptions.length === 0}
                />
              </div>

              {/* Proficiency */}
              <div>
                <label style={{ ...font, display: 'block', fontSize: '0.68rem', fontWeight: 700, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>
                  Proficiency
                </label>
                <Select value={newProficiency} onChange={setNewProficiency} options={proficiencyOptions} />
              </div>

              {/* Years */}
              <div>
                <label style={{ ...font, display: 'block', fontSize: '0.68rem', fontWeight: 700, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>
                  Yrs Exp
                </label>
                <input
                  type="number" min="0" max="50"
                  value={newYears}
                  onChange={e => setNewYears(e.target.value)}
                  placeholder="0"
                  className="ak-input"
                  style={{
                    width: '100%', padding: '8px 12px',
                    background: T.ivoryMid, border: `1px solid ${T.borderStrong}`,
                    borderRadius: '2px', color: T.indigoDeep,
                    ...font, fontSize: '0.84rem', fontWeight: 600,
                    boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
              </div>
            </div>

            {/* Primary toggle + Add button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newIsPrimary}
                  onChange={e => setNewIsPrimary(e.target.checked)}
                  style={{ accentColor: T.indigo, width: '15px', height: '15px' }}
                />
                <span style={{ ...font, fontSize: '0.78rem', fontWeight: 600, color: T.indigoText }}>
                  Set as primary skill
                </span>
              </label>
              <button
                onClick={handleAddSkill}
                disabled={!newCategoryId}
                style={{
                  ...font, padding: '9px 20px',
                  background: !newCategoryId ? 'rgba(26,16,80,0.25)' : T.indigo,
                  color: T.ivory, border: 'none', borderRadius: '2px',
                  fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.07em',
                  textTransform: 'uppercase', cursor: !newCategoryId ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '7px',
                }}
              >
                <Plus size={14} strokeWidth={2} /> Add to List
              </button>
            </div>
          </div>
        )}

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ padding: '56px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '32px', height: '32px', border: `2px solid ${T.border}`, borderTop: `2px solid ${T.indigo}`, borderRadius: '50%', animation: 'ak-spin 0.75s linear infinite' }} />
            <p style={{ ...font, color: T.indigoMuted, fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Loading skills…</p>
          </div>

        ) : skills.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────── */
          <div style={{
            background: T.ivory, border: `1px solid ${T.border}`, borderRadius: '3px',
            padding: '56px 24px', textAlign: 'center',
            boxShadow: `0 4px 20px ${T.shadowSoft}`,
          }}>
            <div style={{ width: '56px', height: '56px', background: T.indigoSubtle, border: `1px solid ${T.border}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Wrench size={24} color={T.indigoMuted} strokeWidth={1.2} />
            </div>
            <p style={{ ...font, color: T.indigoDeep, fontWeight: 700, fontSize: '0.92rem', margin: '0 0 6px' }}>No skills added yet</p>
            <p style={{ ...font, color: T.indigoMuted, fontSize: '0.82rem', fontWeight: 400, margin: '0 0 16px' }}>
              Add your skills so customers can find you for the right jobs.
            </p>
            <button
              onClick={() => setAddOpen(true)}
              style={{
                ...font, padding: '9px 20px',
                background: T.indigo, color: T.ivory,
                border: 'none', borderRadius: '2px',
                fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.07em',
                textTransform: 'uppercase', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '7px',
              }}
            >
              <Plus size={14} strokeWidth={2} /> Add Your First Skill
            </button>
          </div>

        ) : (
          /* ── Skills list */
          <div style={{
            background: T.ivory, border: `1px solid ${T.borderStrong}`,
            borderTop: `3px solid ${T.indigo}`, borderRadius: '3px',
            boxShadow: `0 4px 20px ${T.shadowSoft}`, overflow: 'hidden',
          }}>
            {/* List header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1.2fr 80px 90px 44px',
              gap: '12px', padding: '10px 18px',
              background: T.ivoryDeep, borderBottom: `1px solid ${T.border}`,
            }}>
              {['Skill', 'Proficiency', 'Yrs Exp', 'Primary', ''].map((h, i) => (
                <p key={i} style={{ ...font, fontSize: '0.64rem', fontWeight: 800, color: T.indigoMuted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {h}
                </p>
              ))}
            </div>

            {skills.map((skill, idx) => {
              const profCfg = PROFICIENCY_LEVELS.find(p => p.value === skill.proficiencyLevel) || PROFICIENCY_LEVELS[0];
              return (
                <div
                  key={skill.categoryId}
                  className="ak-skill-row"
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.2fr 80px 90px 44px',
                    gap: '12px', padding: '14px 18px', alignItems: 'center',
                    borderBottom: idx < skills.length - 1 ? `1px solid ${T.border}` : 'none',
                    background: skill.isPrimary ? 'rgba(26,16,80,0.03)' : 'transparent',
                    borderLeft: skill.isPrimary ? `3px solid ${T.indigo}` : '3px solid transparent',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Skill name + description */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ ...font, color: T.indigoDeep, fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>
                        {skill.categoryName}
                      </p>
                      {skill._isNew && (
                        <span style={{
                          ...font, fontSize: '0.6rem', fontWeight: 800, color: T.success,
                          background: T.successBg, border: `1px solid ${T.successBd}`,
                          padding: '1px 6px', borderRadius: '2px', letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}>New</span>
                      )}
                    </div>
                    {skill.categoryDescription && (
                      <p style={{ ...font, color: T.indigoMuted, fontSize: '0.74rem', fontWeight: 400, margin: '2px 0 0', lineHeight: 1.4 }}>
                        {skill.categoryDescription}
                      </p>
                    )}
                  </div>

                  {/* Proficiency select */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ProficiencyBars level={skill.proficiencyLevel} />
                    <select
                      value={skill.proficiencyLevel}
                      onChange={e => handleEdit(skill.categoryId, 'proficiencyLevel', e.target.value)}
                      className="ak-input"
                      style={{
                        flex: 1, padding: '5px 8px',
                        background: T.ivoryMid, border: `1px solid ${T.border}`,
                        borderRadius: '2px', color: T.indigoDeep,
                        ...font, fontSize: '0.76rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'border-color 0.15s',
                      }}
                    >
                      {PROFICIENCY_LEVELS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Years of experience */}
                  <input
                    type="number" min="0" max="50"
                    value={skill.yearsOfExperience ?? ''}
                    onChange={e => handleEdit(skill.categoryId, 'yearsOfExperience', e.target.value ? parseInt(e.target.value) : null)}
                    className="ak-input"
                    style={{
                      width: '100%', padding: '5px 8px',
                      background: T.ivoryMid, border: `1px solid ${T.border}`,
                      borderRadius: '2px', color: T.indigoDeep,
                      ...font, fontSize: '0.82rem', fontWeight: 600,
                      boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                  />

                  {/* Primary toggle */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {skill.isPrimary ? (
                      <span style={{
                        ...font, fontSize: '0.65rem', fontWeight: 800,
                        color: T.success, background: T.successBg, border: `1px solid ${T.successBd}`,
                        padding: '3px 8px', borderRadius: '2px', letterSpacing: '0.05em',
                        textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <CheckCircle2 size={11} strokeWidth={2.5} /> Primary
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetPrimary(skill.categoryId)}
                        className="ak-primary-btn"
                        title="Set as primary"
                        style={{
                          ...font, fontSize: '0.65rem', fontWeight: 700,
                          color: T.indigoMuted, background: 'transparent',
                          border: `1px solid ${T.border}`, borderRadius: '2px',
                          padding: '3px 8px', cursor: 'pointer', letterSpacing: '0.05em',
                          textTransform: 'uppercase', transition: 'border-color 0.15s, color 0.15s',
                        }}
                      >
                        Set Primary
                      </button>
                    )}
                  </div>

                  {/* Delete */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleRemove(skill.categoryId)}
                      className="ak-del-btn"
                      title="Remove skill"
                      style={{
                        width: '30px', height: '30px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent', border: `1px solid ${T.border}`,
                        borderRadius: '2px', cursor: 'pointer',
                        color: T.indigoMuted, transition: 'color 0.15s, background 0.15s',
                      }}
                    >
                      <Trash2 size={13} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Unsaved changes notice ───────────────────────────────────── */}
        {dirty && !saving && (
          <div style={{
            padding: '10px 16px',
            background: 'rgba(20,10,80,0.05)',
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${T.indigo}`,
            borderRadius: '0 2px 2px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p style={{ ...font, fontSize: '0.78rem', fontWeight: 600, color: T.indigoText, margin: 0 }}>
              You have unsaved changes.
            </p>
            <button
              onClick={handleSave}
              style={{
                ...font, padding: '6px 16px',
                background: T.indigo, color: T.ivory,
                border: 'none', borderRadius: '2px',
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Save Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkerSkillsSection;