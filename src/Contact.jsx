import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader } from "lucide-react";

const T = {
  indigo:       "#4f46e5",
  indigoDeep:   "#140a50",
  indigoDark:   "#3730a3",
  indigoLight:  "#e0e7ff",
  indigoMid:    "#818cf8",
  ivory:        "#fafaf7",
  ivoryDark:    "#f0efe8",
  white:        "#ffffff",
  border:       "rgba(20,10,80,0.12)",
  borderMed:    "rgba(20,10,80,0.22)",
  textMuted:    "rgba(20,10,80,0.45)",
  textSub:      "rgba(20,10,80,0.62)",
};

const CONTACT_INFO = [
  {
    icon: Mail,
    title: "Write to Us",
    lines: ["support@aapnokaam.in", "rohit@aapnokaam.in"],
  },
  {
    icon: Phone,
    title: "Call Us",
    lines: ["+91 1800-123-4567", "Mon–Sat, 9 AM – 6 PM IST"],
  },
  {
    icon: MapPin,
    title: "Visit Us",
    lines: ["Udaipur, Rajasthan, India", "City of Lakes — 313001"],
  },
];

const Label = ({ children }) => (
  <label style={{
    display:       "block",
    fontFamily:    "'Open Sans', sans-serif",
    fontSize:      "0.68rem",
    fontWeight:    800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color:         T.textMuted,
    marginBottom:  "0.45rem",
  }}>
    {children}
  </label>
);

const fieldStyle = (isLoading) => ({
  width:        "100%",
  padding:      "0.8rem 1rem",
  border:       `1.5px solid ${T.border}`,
  borderRadius: "2px",
  fontFamily:   "'Open Sans', sans-serif",
  fontSize:     "0.92rem",
  fontWeight:   400,
  color:        T.indigoDeep,
  background:   isLoading ? T.ivoryDark : T.ivory,
  outline:      "none",
  boxSizing:    "border-box",
  transition:   "border-color 0.18s, box-shadow 0.18s, background 0.18s",
  opacity:      isLoading ? 0.65 : 1,
});

export default function ContactSection() {
  const [form, setForm]         = useState({ name: "", email: "", message: "" });
  const [status, setStatus]     = useState("idle");
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setFeedback("Please fill in all fields before submitting.");
      return;
    }
    setStatus("loading");
    setFeedback("");
    try {
      const res  = await fetch("http://localhost:8081/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setFeedback(data.message || "Your message has been sent!");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setFeedback(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setFeedback("Unable to reach the server. Please email us at support@aapnokaam.in");
    }
  };

  const isLoading = status === "loading";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap"
        rel="stylesheet"
      />

      <section
        id="contact"
        style={{
          padding:    "0",
          background: T.ivory,
          fontFamily: "'Open Sans', sans-serif",
          minHeight:  "100vh",
          display:    "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Section heading ── */}
        <div style={{
          padding:   "4rem 1.5rem 0",
          maxWidth:  "1100px",
          margin:    "0 auto",
          width:     "100%",
          boxSizing: "border-box",
        }}>
          <p style={{
            fontFamily:    "'Open Sans', sans-serif",
            fontSize:      "0.65rem",
            fontWeight:    800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color:         T.indigo,
            margin:        "0 0 0.75rem",
          }}>
            Get in Touch
          </p>
          <h2 style={{
            fontFamily:    "'Open Sans', sans-serif",
            fontSize:      "clamp(2rem, 5vw, 3rem)",
            fontWeight:    800,
            color:         T.indigoDeep,
            margin:        "0 0 0.75rem",
            lineHeight:    1.15,
            letterSpacing: "-0.01em",
          }}>
            Contact Us
          </h2>
          <p style={{
            fontFamily: "'Open Sans', sans-serif",
            fontSize:   "1rem",
            fontWeight: 400,
            color:      T.textSub,
            margin:     0,
            maxWidth:   "440px",
            lineHeight: "1.7",
          }}>
            We are here to help. Reach out through any of the channels below or send us a message directly.
          </p>
        </div>

        {/* ── Main content ── */}
        <div style={{
          flex:       1,
          padding:    "0 1.5rem 5rem",
          maxWidth:   "1100px",
          margin:     "0 auto",
          width:      "100%",
          boxSizing:  "border-box",
        }}>

          {/* ── Grid ── */}
          <div style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap:                 "0",
            marginTop:           "-1px",
          }}>

            {/* ── LEFT: contact cards ── */}
            <div style={{
              padding:    "3rem 3rem 3rem 0",
              borderRight:`1px solid ${T.border}`,
            }}>
              <p style={{
                fontFamily:    "'Open Sans', sans-serif",
                fontSize:      "0.65rem",
                fontWeight:    800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         T.textMuted,
                margin:        "0 0 2rem",
              }}>
                Contact Details
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {CONTACT_INFO.map(({ icon: Icon, title, lines }, i) => (
                  <div
                    key={i}
                    style={{
                      display:       "flex",
                      gap:           "1.25rem",
                      alignItems:    "flex-start",
                      padding:       "1.5rem 0",
                      borderBottom:  i < CONTACT_INFO.length - 1 ? `1px solid ${T.border}` : "none",
                    }}
                  >
                    <div style={{
                      width:          "40px",
                      height:         "40px",
                      flexShrink:     0,
                      background:     T.indigoLight,
                      borderRadius:   "2px",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                    }}>
                      <Icon size={17} color={T.indigo} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{
                        fontFamily:    "'Open Sans', sans-serif",
                        fontSize:      "0.62rem",
                        fontWeight:    800,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color:         T.textMuted,
                        margin:        "0 0 0.4rem",
                      }}>
                        {title}
                      </p>
                      {lines.map((line, j) => (
                        <p key={j} style={{
                          fontFamily: "'Open Sans', sans-serif",
                          fontSize:   j === 0 ? "0.97rem" : "0.83rem",
                          fontWeight: j === 0 ? 700 : 400,
                          color:      j === 0 ? T.indigoDeep : T.textSub,
                          margin:     0,
                          lineHeight: "1.6",
                        }}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Office hours badge */}
              <div style={{
                marginTop:    "2.5rem",
                padding:      "1.25rem",
                background:   T.indigoDeep,
                borderRadius: "2px",
              }}>
                <p style={{
                  fontFamily:    "'Open Sans', sans-serif",
                  fontSize:      "0.62rem",
                  fontWeight:    800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color:         T.indigoMid,
                  margin:        "0 0 0.5rem",
                }}>
                  Response Time
                </p>
                <p style={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize:   "0.88rem",
                  fontWeight: 400,
                  color:      "rgba(255,255,255,0.7)",
                  margin:     0,
                  lineHeight: "1.65",
                }}>
                  We typically respond within 24 hours on business days.
                </p>
              </div>
            </div>

            {/* ── RIGHT: form ── */}
            <div style={{
              padding: "3rem 0 3rem 3.5rem",
            }}>
              <p style={{
                fontFamily:    "'Open Sans', sans-serif",
                fontSize:      "0.65rem",
                fontWeight:    800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         T.textMuted,
                margin:        "0 0 2rem",
              }}>
                Send a Message
              </p>

              {/* Feedback banners */}
              {status === "success" && (
                <div style={{
                  display:      "flex",
                  alignItems:   "flex-start",
                  gap:          "0.75rem",
                  background:   "#f0fdf4",
                  border:       "1px solid #86efac",
                  borderLeft:   "3px solid #16a34a",
                  borderRadius: "2px",
                  padding:      "0.9rem 1.1rem",
                  marginBottom: "1.75rem",
                }}>
                  <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: "0.87rem", color: "#15803d", lineHeight: "1.55" }}>
                    {feedback}
                  </span>
                </div>
              )}

              {status === "error" && (
                <div style={{
                  display:      "flex",
                  alignItems:   "flex-start",
                  gap:          "0.75rem",
                  background:   "#fef2f2",
                  border:       "1px solid #fca5a5",
                  borderLeft:   "3px solid #dc2626",
                  borderRadius: "2px",
                  padding:      "0.9rem 1.1rem",
                  marginBottom: "1.75rem",
                }}>
                  <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: "0.87rem", color: "#b91c1c", lineHeight: "1.55" }}>
                    {feedback}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>

                {/* Name + Email row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <div>
                    <Label>Your Name</Label>
                    <input
                      className="ak-field"
                      name="name"
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={isLoading}
                      style={fieldStyle(isLoading)}
                    />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <input
                      className="ak-field"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      style={fieldStyle(isLoading)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Your Message</Label>
                  <textarea
                    className="ak-field"
                    name="message"
                    rows={6}
                    placeholder="How may we assist you?"
                    value={form.message}
                    onChange={handleChange}
                    disabled={isLoading}
                    style={{ ...fieldStyle(isLoading), resize: "none", lineHeight: "1.7" }}
                  />
                </div>

                {/* Submit row */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ak-btn"
                    style={{
                      padding:       "0.9rem 2.25rem",
                      background:    T.indigo,
                      color:         T.white,
                      border:        "none",
                      borderRadius:  "2px",
                      fontFamily:    "'Open Sans', sans-serif",
                      fontSize:      "0.72rem",
                      fontWeight:    800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      cursor:        isLoading ? "not-allowed" : "pointer",
                      display:       "flex",
                      alignItems:    "center",
                      gap:           "0.55rem",
                      opacity:       isLoading ? 0.7 : 1,
                      transition:    "background 0.18s, transform 0.1s",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader size={14} style={{ animation: "ak-spin 1s linear infinite" }} />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Send Message
                      </>
                    )}
                  </button>

                  <p style={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontSize:   "0.78rem",
                    fontWeight: 400,
                    color:      T.textMuted,
                    margin:     0,
                    lineHeight: "1.5",
                  }}>
                    All fields are required.
                  </p>
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes ak-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .ak-field:focus {
          border-color: ${T.indigo} !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.12) !important;
          background: ${T.white} !important;
        }
        .ak-field::placeholder {
          font-family: 'Open Sans', sans-serif;
          color: rgba(20,10,80,0.25);
          font-weight: 400;
        }
        .ak-btn:hover:not(:disabled) {
          background: ${T.indigoDark} !important;
          transform: translateY(-1px);
        }
        .ak-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
      `}</style>
    </>
  );
}