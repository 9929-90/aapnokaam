import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign, AlertCircle } from 'lucide-react';
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

// ─── Reusable primitives ──────────────────────────────────────────────────────

const Label = ({ children }) => (
  <label style={{
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: T.indigoMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '6px',
    ...font,
  }}>
    {children}
  </label>
);

const inputBase = {
  width: '100%',
  padding: '10px 14px',
  background: T.ivoryMid,
  border: `1px solid ${T.borderStrong}`,
  borderRadius: '2px',
  outline: 'none',
  color: T.indigoDeep,
  fontSize: '0.88rem',
  fontWeight: 400,
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  ...font,
};

const errorStyle = {
  marginTop: '5px',
  fontSize: '0.74rem',
  color: '#c0392b',
  fontWeight: 600,
  ...font,
};

const SectionTitle = ({ children }) => (
  <h3 style={{
    color: T.indigoDeep,
    fontWeight: 800,
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    margin: '0 0 16px',
    paddingBottom: '8px',
    borderBottom: `1px solid ${T.border}`,
    ...font,
  }}>
    {children}
  </h3>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CreateBookingModal = ({ worker, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    workerId: worker.id,
    categoryId: '',
    serviceTitle: '',
    serviceDescription: '',
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 2,
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { calculateCost(); }, [formData.estimatedDuration]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/consumer/categories');
      setCategories(response.data);
      if (worker.primarySkill) {
        const primaryCategory = response.data.find(cat => cat.name === worker.primarySkill);
        if (primaryCategory) setFormData(prev => ({ ...prev, categoryId: primaryCategory.id }));
      }
    } catch (error) { console.error('Failed to load categories:', error); }
  };

  const calculateCost = () => {
    setEstimatedCost(worker.hourlyRate * formData.estimatedDuration);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.categoryId)        newErrors.categoryId        = 'Please select a service category';
    if (!formData.serviceTitle)      newErrors.serviceTitle      = 'Service title is required';
    if (!formData.serviceDescription)newErrors.serviceDescription= 'Description is required';
    if (!formData.scheduledDate)     newErrors.scheduledDate     = 'Date is required';
    if (!formData.scheduledTime)     newErrors.scheduledTime     = 'Time is required';
    if (formData.estimatedDuration < 1) newErrors.estimatedDuration = 'Duration must be at least 1 hour';
    if (!formData.address)           newErrors.address           = 'Address is required';
    if (!formData.city)              newErrors.city              = 'City is required';
    if (!formData.state)             newErrors.state             = 'State is required';
    if (!formData.pincode)           newErrors.pincode           = 'Pincode is required';

    const selectedDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    if (selectedDateTime <= new Date()) newErrors.scheduledDate = 'Please select a future date and time';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    setLoading(true);
    const bookingData = {
      ...formData,
      scheduledDate: `${formData.scheduledDate}T00:00:00`,
      scheduledTime: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
    };

    const response = await api.post('/consumer/bookings', bookingData);
    const bookingResult = response.data;

    // Only reset loading AFTER booking API call succeeds
    // Do NOT put setLoading(false) in finally — Razorpay modal is still open
    setLoading(false);

    const options = {
      key: bookingResult.razorpayKeyId,
      amount: bookingResult.estimatedCost * 100,
      currency: 'INR',
      name: 'AapnoKaam',
      description: `Booking #${bookingResult.bookingId}`,
      order_id: bookingResult.razorpayOrderId,
      handler: async function (razorpayResponse) {
        try {
          await api.post('/payments/verify', {
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            razorpaySignature: razorpayResponse.razorpay_signature,
            bookingId: bookingResult.bookingId,
          });
          onSuccess(); // ← closes modal + refreshes parent
        } catch (verifyError) {
          console.error('Payment verification failed:', verifyError);
          alert(
            verifyError.response?.data?.message ||
            'Payment was received but verification failed. Please contact support with Booking #' +
            bookingResult.bookingId
          );
        }
      },
      modal: {
        ondismiss: function () {
          // User closed Razorpay modal without paying — nothing to do
          console.log('Razorpay modal closed by user');
        },
      },
      prefill: {
        name: bookingResult.customerName,
        email: bookingResult.customerEmail,
        contact: bookingResult.customerPhone,
      },
      theme: { color: T.indigo },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      alert(`Payment failed: ${resp.error.description}`);
    });
    rzp.open();

  } catch (error) {
    // Only reaches here if the initial booking API call failed
    console.error('Failed to create booking:', error);
    alert(error.response?.data?.message || 'Failed to create booking. Please try again.');
    setLoading(false); // Reset loading only on booking creation failure
  }
  // ← NO finally block — loading is managed manually above
};

  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getMinTime = () => {
    const today = new Date();
    if (formData.scheduledDate === today.toISOString().split('T')[0]) return today.toTimeString().slice(0, 5);
    return '00:00';
  };

  const focusStyle = (field) => focusedField === field
    ? { borderColor: T.indigo, boxShadow: `0 0 0 3px rgba(26,16,80,0.08)` }
    : {};

  const errBorder = (field) => errors[field] ? { borderColor: '#c0392b' } : {};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap');
        .ak-modal-overlay { animation: ak-fade-in 0.18s ease; }
        @keyframes ak-fade-in { from { opacity: 0 } to { opacity: 1 } }
        .ak-modal-card { animation: ak-slide-up 0.22s ease; }
        @keyframes ak-slide-up { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        .ak-input::placeholder { color: ${T.indigoMuted}; font-family: 'Open Sans', sans-serif; font-size: 0.86rem; }
        .ak-input option { background: ${T.ivory}; color: ${T.indigoDeep}; }
        .ak-close-btn:hover { background: ${T.indigoSubtle} !important; }
        .ak-cancel-btn:hover { background: ${T.indigoMid} !important; }
        .ak-submit-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.ivoryDeep}; }
        ::-webkit-scrollbar-thumb { background: rgba(26,16,80,0.18); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(26,16,80,0.32); }
      `}</style>

      {/* Overlay */}
      <div
        className="ak-modal-overlay"
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(20, 10, 80, 0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          overflowY: 'auto',
        }}
      >
        {/* Card */}
        <div
          className="ak-modal-card"
          style={{
            background: T.ivory,
            border: `1px solid ${T.borderStrong}`,
            borderRadius: '3px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: `0 20px 60px rgba(20,10,80,0.22), 0 4px 16px ${T.shadowSoft}`,
          }}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: T.ivory,
            borderBottom: `1px solid ${T.border}`,
            borderTop: `3px solid ${T.indigo}`,
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: `0 2px 8px ${T.shadowSoft}`,
          }}>
            <div>
              <h2 style={{
                color: T.indigoDeep, fontWeight: 800,
                fontSize: '1.05rem', margin: 0, ...font,
                letterSpacing: '-0.01em',
              }}>
                Book Service
              </h2>
              <p style={{
                color: T.indigoMuted, fontSize: '0.78rem',
                margin: '3px 0 0', ...font, fontWeight: 500,
              }}>
                Booking with {worker.fullName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ak-close-btn"
              style={{
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent',
                border: `1px solid ${T.border}`,
                borderRadius: '2px',
                cursor: 'pointer',
                color: T.indigoMuted,
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* ── Form ────────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Service Details */}
            <section>
              <SectionTitle>Service Details</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Category */}
                <div>
                  <Label>Service Category *</Label>
                  <select
                    value={formData.categoryId}
                    onChange={e => handleInputChange('categoryId', e.target.value)}
                    onFocus={() => setFocusedField('categoryId')}
                    onBlur={() => setFocusedField(null)}
                    className="ak-input"
                    style={{ ...inputBase, ...focusStyle('categoryId'), ...errBorder('categoryId') }}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p style={errorStyle}>{errors.categoryId}</p>}
                </div>

                {/* Title */}
                <div>
                  <Label>Service Title *</Label>
                  <input
                    type="text"
                    value={formData.serviceTitle}
                    onChange={e => handleInputChange('serviceTitle', e.target.value)}
                    onFocus={() => setFocusedField('serviceTitle')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g., Fix leaking kitchen sink"
                    className="ak-input"
                    style={{ ...inputBase, ...focusStyle('serviceTitle'), ...errBorder('serviceTitle') }}
                  />
                  {errors.serviceTitle && <p style={errorStyle}>{errors.serviceTitle}</p>}
                </div>

                {/* Description */}
                <div>
                  <Label>Description *</Label>
                  <textarea
                    value={formData.serviceDescription}
                    onChange={e => handleInputChange('serviceDescription', e.target.value)}
                    onFocus={() => setFocusedField('serviceDescription')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Describe the work needed in detail..."
                    rows={4}
                    className="ak-input"
                    style={{
                      ...inputBase,
                      ...focusStyle('serviceDescription'),
                      ...errBorder('serviceDescription'),
                      resize: 'vertical',
                      lineHeight: 1.6,
                    }}
                  />
                  {errors.serviceDescription && <p style={errorStyle}>{errors.serviceDescription}</p>}
                </div>
              </div>
            </section>

            {/* Schedule */}
            <section>
              <SectionTitle>Schedule</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Date */}
                  <div>
                    <Label>Date *</Label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={e => handleInputChange('scheduledDate', e.target.value)}
                      onFocus={() => setFocusedField('scheduledDate')}
                      onBlur={() => setFocusedField(null)}
                      min={getMinDate()}
                      className="ak-input"
                      style={{ ...inputBase, ...focusStyle('scheduledDate'), ...errBorder('scheduledDate') }}
                    />
                    {errors.scheduledDate && <p style={errorStyle}>{errors.scheduledDate}</p>}
                  </div>
                  {/* Time */}
                  <div>
                    <Label>Time *</Label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={e => handleInputChange('scheduledTime', e.target.value)}
                      onFocus={() => setFocusedField('scheduledTime')}
                      onBlur={() => setFocusedField(null)}
                      min={getMinTime()}
                      className="ak-input"
                      style={{ ...inputBase, ...focusStyle('scheduledTime'), ...errBorder('scheduledTime') }}
                    />
                    {errors.scheduledTime && <p style={errorStyle}>{errors.scheduledTime}</p>}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <Label>Estimated Duration (hours) *</Label>
                  <input
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={e => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                    onFocus={() => setFocusedField('estimatedDuration')}
                    onBlur={() => setFocusedField(null)}
                    min="1" max="24"
                    className="ak-input"
                    style={{ ...inputBase, ...focusStyle('estimatedDuration'), ...errBorder('estimatedDuration') }}
                  />
                  {errors.estimatedDuration && <p style={errorStyle}>{errors.estimatedDuration}</p>}
                </div>
              </div>
            </section>

            {/* Location */}
            <section>
              <SectionTitle>Service Location</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Address */}
                <div>
                  <Label>Address *</Label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Street address, apartment, etc."
                    className="ak-input"
                    style={{ ...inputBase, ...focusStyle('address'), ...errBorder('address') }}
                  />
                  {errors.address && <p style={errorStyle}>{errors.address}</p>}
                </div>

                {/* City / State / Pincode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <Label>City *</Label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      onFocus={() => setFocusedField('city')}
                      onBlur={() => setFocusedField(null)}
                      className="ak-input"
                      style={{ ...inputBase, ...focusStyle('city'), ...errBorder('city') }}
                    />
                    {errors.city && <p style={errorStyle}>{errors.city}</p>}
                  </div>
                  <div>
                    <Label>State *</Label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => handleInputChange('state', e.target.value)}
                      onFocus={() => setFocusedField('state')}
                      onBlur={() => setFocusedField(null)}
                      className="ak-input"
                      style={{ ...inputBase, ...focusStyle('state'), ...errBorder('state') }}
                    />
                    {errors.state && <p style={errorStyle}>{errors.state}</p>}
                  </div>
                  <div>
                    <Label>Pincode *</Label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={e => handleInputChange('pincode', e.target.value)}
                      onFocus={() => setFocusedField('pincode')}
                      onBlur={() => setFocusedField(null)}
                      maxLength="6"
                      className="ak-input"
                      style={{ ...inputBase, ...focusStyle('pincode'), ...errBorder('pincode') }}
                    />
                    {errors.pincode && <p style={errorStyle}>{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* Cost Summary */}
            <section>
              <div style={{
                background: T.indigoSubtle,
                border: `1px solid ${T.border}`,
                borderLeft: `3px solid ${T.indigo}`,
                borderRadius: '2px',
                padding: '16px 18px',
              }}>
                <p style={{
                  color: T.indigoDeep, fontWeight: 800, fontSize: '0.78rem',
                  textTransform: 'uppercase', letterSpacing: '0.09em',
                  margin: '0 0 14px', ...font,
                }}>
                  Cost Summary
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: T.indigoText, fontSize: '0.85rem', ...font, fontWeight: 500 }}>Hourly Rate</span>
                    <span style={{ color: T.indigoDeep, fontSize: '0.85rem', ...font, fontWeight: 700 }}>₹{worker.hourlyRate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: T.indigoText, fontSize: '0.85rem', ...font, fontWeight: 500 }}>Duration</span>
                    <span style={{ color: T.indigoDeep, fontSize: '0.85rem', ...font, fontWeight: 700 }}>{formData.estimatedDuration} hrs</span>
                  </div>
                  <div style={{
                    borderTop: `1px solid ${T.borderStrong}`,
                    marginTop: '4px', paddingTop: '10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ color: T.indigoDeep, fontSize: '0.88rem', ...font, fontWeight: 700 }}>Estimated Total</span>
                    <span style={{ color: T.indigo, fontSize: '1.25rem', ...font, fontWeight: 800 }}>
                      ₹{estimatedCost.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  marginTop: '12px', paddingTop: '10px',
                  borderTop: `1px solid ${T.border}`,
                }}>
                  <AlertCircle size={13} color={T.indigoMuted} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: T.indigoMuted, fontSize: '0.74rem', margin: 0, ...font, fontWeight: 500, lineHeight: 1.5 }}>
                    Final cost may vary based on actual work completed
                  </p>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div style={{
              display: 'flex', gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${T.border}`,
            }}>
              <button
                type="button"
                onClick={onClose}
                className="ak-cancel-btn"
                style={{
                  flex: 1,
                  padding: '11px 20px',
                  background: T.ivoryDeep,
                  border: `1px solid ${T.borderStrong}`,
                  borderRadius: '2px',
                  color: T.indigoText,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  transition: 'background 0.15s',
                  ...font,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ak-submit-btn"
                style={{
                  flex: 1,
                  padding: '11px 20px',
                  background: loading ? 'rgba(26,16,80,0.35)' : T.indigo,
                  border: 'none',
                  borderRadius: '2px',
                  color: T.ivory,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  transition: 'opacity 0.15s',
                  boxShadow: loading ? 'none' : `0 3px 12px ${T.shadow}`,
                  ...font,
                }}
              >
                {loading ? 'Creating Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateBookingModal;