const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak, LevelFormat, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const BLUE = "1E3A5F";
const LIGHT_BLUE = "2E75B6";
const ACCENT = "1ABC9C";
const LIGHT_BG = "EBF5FB";
const GRAY_BG = "F2F3F4";
const BORDER_COLOR = "BDC3C7";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 36, color: BLUE, font: "Arial" })],
    spacing: { before: 360, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 4 } }
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 28, color: LIGHT_BLUE, font: "Arial" })],
    spacing: { before: 280, after: 120 }
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 24, color: BLUE, font: "Arial" })],
    spacing: { before: 200, after: 80 }
  });
}

function para(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Arial", ...options })],
    spacing: { before: 60, after: 60 }
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: 22, font: "Arial" });
}

function code(text) {
  return new TextRun({ text, font: "Courier New", size: 18, color: "C0392B" });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun({ text, size: 22, font: "Arial" })],
    spacing: { before: 40, after: 40 }
  });
}

function spacer(size = 120) {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: size } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function sectionBox(label, value) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2200, 7160],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 2200, type: WidthType.DXA },
            shading: { fill: GRAY_BG, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, font: "Arial", color: BLUE })] })]
          }),
          new TableCell({
            borders,
            width: { size: 7160, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, font: "Arial" })] })]
          })
        ]
      })
    ]
  });
}

function headerRow(cols) {
  return new TableRow({
    children: cols.map(({ text, width }) =>
      new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: { fill: BLUE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: "Arial", color: WHITE })] })]
      })
    )
  });
}

function dataRow(cells) {
  return new TableRow({
    children: cells.map(({ text, width, bg }) =>
      new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: { fill: bg || WHITE, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: text || "", size: 19, font: "Arial" })] })]
      })
    )
  });
}

function apiTable(endpoints) {
  const colWidths = [1200, 3400, 2000, 2760];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      headerRow([
        { text: "Method", width: colWidths[0] },
        { text: "Endpoint", width: colWidths[1] },
        { text: "Access", width: colWidths[2] },
        { text: "Description", width: colWidths[3] }
      ]),
      ...endpoints.map(([method, ep, access, desc], i) =>
        dataRow([
          { text: method, width: colWidths[0], bg: i % 2 === 0 ? WHITE : GRAY_BG },
          { text: ep, width: colWidths[1], bg: i % 2 === 0 ? WHITE : GRAY_BG },
          { text: access, width: colWidths[2], bg: i % 2 === 0 ? WHITE : GRAY_BG },
          { text: desc, width: colWidths[3], bg: i % 2 === 0 ? WHITE : GRAY_BG }
        ])
      )
    ]
  });
}

function fieldTable(fields) {
  const colWidths = [2200, 1600, 1200, 4360];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      headerRow([
        { text: "Field", width: colWidths[0] },
        { text: "Type", width: colWidths[1] },
        { text: "Nullable", width: colWidths[2] },
        { text: "Description", width: colWidths[3] }
      ]),
      ...fields.map(([field, type, nullable, desc], i) =>
        dataRow([
          { text: field, width: colWidths[0], bg: i % 2 === 0 ? WHITE : GRAY_BG },
          { text: type, width: colWidths[1], bg: i % 2 === 0 ? WHITE : GRAY_BG },
          { text: nullable, width: colWidths[2], bg: i % 2 === 0 ? WHITE : GRAY_BG },
          { text: desc, width: colWidths[3], bg: i % 2 === 0 ? WHITE : GRAY_BG }
        ])
      )
    ]
  });
}

// ─── Cover Page ──────────────────────────────────────────────────────────────

const coverPage = [
  spacer(1200),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "AAPNOKAAM", bold: true, size: 72, color: BLUE, font: "Arial" })],
    spacing: { before: 0, after: 160 }
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "HyperSkill Local Workers Platform", size: 32, color: ACCENT, font: "Arial", italics: true })],
    spacing: { before: 0, after: 400 }
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Technical Documentation", bold: true, size: 48, color: LIGHT_BLUE, font: "Arial" })],
    spacing: { before: 0, after: 160 }
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Version 1.0  |  Spring Boot + React.js", size: 24, color: "888888", font: "Arial" })],
    spacing: { before: 0, after: 800 }
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 4680, type: WidthType.DXA },
            shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Backend", bold: true, size: 24, color: BLUE, font: "Arial" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Java 17 + Spring Boot 3", size: 20, font: "Arial", color: "555555" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Spring Security + JWT", size: 20, font: "Arial", color: "555555" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "JPA / Hibernate + MySQL", size: 20, font: "Arial", color: "555555" })] }),
            ]
          }),
          new TableCell({
            borders,
            width: { size: 4680, type: WidthType.DXA },
            shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Frontend", bold: true, size: 24, color: BLUE, font: "Arial" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "React.js (Vite)", size: 20, font: "Arial", color: "555555" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "SockJS + STOMP (WebSocket)", size: 20, font: "Arial", color: "555555" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Razorpay Payment Integration", size: 20, font: "Arial", color: "555555" })] }),
            ]
          })
        ]
      })
    ]
  }),
  pageBreak()
];

// ─── Section 1: Overview ─────────────────────────────────────────────────────

const overviewSection = [
  h1("1. Project Overview"),
  para("AapnoKaam is a full-stack service marketplace platform connecting local skilled workers (plumbers, electricians, carpenters, etc.) with consumers who need their services. The platform supports the full lifecycle of a service booking — from worker discovery and booking creation, through Razorpay payment processing, real-time chat communication, to job completion and review submission."),
  spacer(100),
  h2("1.1 Key Features"),
  bullet("Role-based access control with three distinct roles: ADMIN, CONSUMER, WORKER"),
  bullet("JWT-based stateless authentication with Google OAuth2 (Sign-in with Google)"),
  bullet("3-step OTP password reset flow with SHA-256 hashed storage"),
  bullet("Worker approval workflow — workers must be approved by admin before login"),
  bullet("Razorpay payment integration — order creation and HMAC signature verification"),
  bullet("Real-time WebSocket messaging (chat) and push notifications via STOMP over SockJS"),
  bullet("Location-based worker search using GPS coordinates and Haversine distance"),
  bullet("Favorites system for consumers to bookmark preferred workers"),
  bullet("Email notifications for every booking lifecycle event"),
  bullet("Newsletter subscription management with one-click unsubscribe tokens"),
  spacer(100),
  h2("1.2 Technology Stack"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: [
      headerRow([{ text: "Component", width: 3000 }, { text: "Technology", width: 6360 }]),
      dataRow([{ text: "Backend Framework", width: 3000 }, { text: "Spring Boot 3 (Java 17)", width: 6360 }]),
      dataRow([{ text: "Security", width: 3000, bg: GRAY_BG }, { text: "Spring Security 6, JWT, BCrypt, Google OAuth2", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "ORM / Database", width: 3000 }, { text: "Spring Data JPA / Hibernate — MySQL (prod), H2 (dev)", width: 6360 }]),
      dataRow([{ text: "Real-Time", width: 3000, bg: GRAY_BG }, { text: "Spring WebSocket, STOMP protocol, SockJS", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "Payments", width: 3000 }, { text: "Razorpay Java SDK", width: 6360 }]),
      dataRow([{ text: "Email", width: 3000, bg: GRAY_BG }, { text: "JavaMailSender via SMTP (Gmail)", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "File Storage", width: 3000 }, { text: "Local file system (configurable upload directory)", width: 6360 }]),
      dataRow([{ text: "Frontend", width: 3000, bg: GRAY_BG }, { text: "React.js with Vite, running on port 5173 / 5174", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "Build Tool", width: 3000 }, { text: "Maven (pom.xml)", width: 6360 }]),
    ]
  }),
  pageBreak()
];

// ─── Section 2: Architecture ─────────────────────────────────────────────────

const archSection = [
  h1("2. System Architecture"),
  h2("2.1 Package Structure"),
  para("The backend follows a layered architecture under the base package com.xyz.lastdemo:"),
  spacer(60),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: [
      headerRow([{ text: "Package", width: 3000 }, { text: "Purpose", width: 6360 }]),
      dataRow([{ text: "config/", width: 3000 }, { text: "Security, CORS, WebSocket, DataSeeder configuration beans", width: 6360 }]),
      dataRow([{ text: "controller/", width: 3000, bg: GRAY_BG }, { text: "REST controllers mapping HTTP requests to service calls", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "service/", width: 3000 }, { text: "Business logic layer — all transactional operations", width: 6360 }]),
      dataRow([{ text: "repository/", width: 3000, bg: GRAY_BG }, { text: "Spring Data JPA repositories for database access", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "entity/", width: 3000 }, { text: "JPA entity classes representing database tables", width: 6360 }]),
      dataRow([{ text: "dto/", width: 3000, bg: GRAY_BG }, { text: "Data Transfer Objects for request/response payloads", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "security/", width: 3000 }, { text: "JWT filter, JWT service, authentication logic", width: 6360 }]),
      dataRow([{ text: "exception/", width: 3000, bg: GRAY_BG }, { text: "Custom exceptions: AuthException, BookingException, ResourceNotFoundException, UnauthorizedException, FileStorageException", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "specification/", width: 3000 }, { text: "JPA Specifications for dynamic worker search queries", width: 6360 }]),
      dataRow([{ text: "util/", width: 3000, bg: GRAY_BG }, { text: "PanEncryptionUtil for PAN card masking", width: 6360, bg: GRAY_BG }]),
    ]
  }),
  spacer(120),
  h2("2.2 Request Flow"),
  para("Every authenticated API request follows this path:"),
  bullet("Client sends HTTP request with Authorization: Bearer <jwt_token> header"),
  bullet("JwtAuthenticationFilter intercepts the request, extracts and validates the JWT"),
  bullet("Validated claims are loaded into Spring SecurityContext"),
  bullet("SecurityFilterChain evaluates role-based access rules defined in SecurityConfig"),
  bullet("Request reaches the appropriate Controller method"),
  bullet("Controller delegates to a Service which performs business logic within a @Transactional boundary"),
  bullet("Service calls one or more Repositories for database operations"),
  bullet("Response DTO is returned, serialized to JSON, and sent back"),
  spacer(120),
  h2("2.3 User Roles & Login Rules"),
  para("The platform defines three roles with distinct login preconditions (enforced by User.canLogin()):"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 7560],
    rows: [
      headerRow([{ text: "Role", width: 1800 }, { text: "Login Requirements", width: 7560 }]),
      dataRow([{ text: "ADMIN", width: 1800 }, { text: "Account enabled only. No email verification required. Created once by DataSeeder at startup.", width: 7560 }]),
      dataRow([{ text: "CONSUMER", width: 1800, bg: GRAY_BG }, { text: "Account enabled AND email verified.", width: 7560, bg: GRAY_BG }]),
      dataRow([{ text: "WORKER", width: 1800 }, { text: "Account enabled AND email verified AND workerApproved = true (set by admin).", width: 7560 }]),
    ]
  }),
  pageBreak()
];

// ─── Section 3: Security ─────────────────────────────────────────────────────

const securitySection = [
  h1("3. Security & Authentication"),
  h2("3.1 JWT Authentication"),
  para("The application uses stateless JWT-based authentication. There are no server-side sessions. Every request must include a valid JWT in the Authorization header."),
  spacer(80),
  bullet("Token type: Bearer"),
  bullet("Algorithm: HMAC-SHA256 (HS256)"),
  bullet("Claims include: subject (email), userId, role, issued-at, expiry"),
  bullet("The JwtAuthenticationFilter runs before UsernamePasswordAuthenticationFilter"),
  bullet("On every request, the filter validates the token and populates the SecurityContext"),
  spacer(120),
  h2("3.2 Password Security"),
  para("All passwords are hashed with BCrypt before storage. The PasswordEncoder bean is a BCryptPasswordEncoder. OTPs and password reset tokens are stored as SHA-256 hashes — never in plain text."),
  spacer(120),
  h2("3.3 Google OAuth2"),
  para("Users can sign in with Google via the POST /api/auth/google endpoint. The frontend sends a Google ID token obtained from the Google Identity Services SDK. The backend verifies the token using GoogleIdTokenVerifier (Google API client library). On first login, a new account is auto-registered. If an account with the same email already exists, the googleId is linked."),
  spacer(120),
  h2("3.4 Endpoint Access Matrix"),
  apiTable([
    ["ANY", "/api/auth/**", "Public", "Registration, login, email verification, password reset"],
    ["ANY", "/api/subscribe", "Public", "Newsletter subscription"],
    ["ANY", "/api/contact", "Public", "Contact form submission"],
    ["ANY", "/h2-console/**", "Public", "H2 dev console (remove in production)"],
    ["ANY", "/swagger-ui/**, /v3/api-docs/**", "Public", "API documentation"],
    ["ANY", "/actuator/**", "Public", "Spring Boot Actuator health endpoints"],
    ["GET/POST/WS", "/ws/**", "Authenticated", "WebSocket connections"],
    ["ALL", "/api/admin/**", "ADMIN only", "Full system visibility and management"],
    ["ALL", "/api/workers/**", "CONSUMER, WORKER, ADMIN", "Public worker listing"],
    ["ALL", "/api/worker/**", "WORKER only", "Worker dashboard, profile, bookings"],
    ["ALL", "/api/consumer/**", "CONSUMER only", "Consumer dashboard, search, bookings"],
    ["ALL", "/api/chat/**", "CONSUMER, WORKER", "Messaging between parties"],
    ["ALL", "/api/notifications/**", "Authenticated", "Notification management"],
    ["GET", "/api/dashboard", "Authenticated", "Role-specific welcome dashboard"],
    ["ALL", "/api/payments/**", "CONSUMER, WORKER", "Razorpay payment operations"],
  ]),
  spacer(120),
  h2("3.5 CORS Configuration"),
  para("CORS is configured to allow requests from the frontend development servers:"),
  bullet("Allowed Origins: http://localhost:5173, http://localhost:5174"),
  bullet("Allowed Methods: GET, POST, PUT, DELETE, OPTIONS"),
  bullet("Allowed Headers: Authorization, Content-Type, X-Requested-With"),
  bullet("Credentials: Allowed (required for JWT in Authorization header)"),
  bullet("Preflight cache (max-age): 3600 seconds"),
  para("Update allowed origins before deploying to production."),
  pageBreak()
];

// ─── Section 4: Data Models ───────────────────────────────────────────────────

const dataModelSection = [
  h1("4. Data Models (Entities)"),
  para("All entities are JPA-managed and mapped to MySQL tables. Timestamps use @CreationTimestamp and @UpdateTimestamp Hibernate annotations."),
  spacer(80),
  h2("4.1 User"),
  para("The central authentication entity implementing Spring Security UserDetails. Stored in the users table."),
  fieldTable([
    ["id", "Long (PK)", "No", "Auto-generated primary key"],
    ["username", "String", "No", "Unique login username"],
    ["name", "String", "No", "Full display name; used by Razorpay checkout prefill"],
    ["email", "String", "No", "Unique email; used as login identifier by Spring Security"],
    ["password", "String", "No", "BCrypt-hashed password"],
    ["phone", "String(15)", "Yes", "Phone number; nullable for existing rows"],
    ["role", "UserRole (enum)", "No", "ADMIN, CONSUMER, or WORKER"],
    ["emailVerified", "boolean", "No", "True after clicking verification link"],
    ["emailVerificationToken", "String", "Yes", "UUID token sent in verification email; cleared after use"],
    ["emailVerificationTokenExpiry", "LocalDateTime", "Yes", "Verification link expires 24 hours after issuance"],
    ["panNumber", "String", "Yes", "Encrypted PAN card number (workers only)"],
    ["workerApproved", "boolean", "No", "Set to true by admin to activate worker accounts"],
    ["workerId", "String", "Yes", "System-generated worker identifier"],
    ["otpHash", "String", "Yes", "SHA-256 hash of the 6-digit OTP for password reset"],
    ["otpExpiry", "LocalDateTime", "Yes", "OTP expires 10 minutes after issuance"],
    ["passwordResetToken", "String", "Yes", "SHA-256 hash of the reset token issued after OTP verification"],
    ["passwordResetTokenExpiry", "LocalDateTime", "Yes", "Reset token expires 15 minutes after issuance"],
    ["googleId", "String", "Yes", "Google subject ID for OAuth2 users"],
    ["authProvider", "String", "No", "LOCAL or GOOGLE"],
    ["enabled", "boolean", "No", "Account can be disabled by admin"],
    ["createdAt, updatedAt", "LocalDateTime", "No", "Audit timestamps"],
  ]),
  spacer(100),
  h2("4.2 WorkerProfile"),
  para("Extended profile information for workers. One-to-one with User. Stored in worker_profiles table."),
  fieldTable([
    ["id", "Long (PK)", "No", "Auto-generated primary key"],
    ["user", "User (FK)", "No", "One-to-one relationship with User"],
    ["fullName", "String(100)", "No", "Display name of the worker"],
    ["phoneNumber", "String(15)", "Yes", "Contact number"],
    ["profilePictureUrl", "String(500)", "Yes", "URL path to uploaded profile image"],
    ["bio", "String(500)", "Yes", "Short worker biography"],
    ["experienceYears", "Integer", "Yes", "Years of professional experience"],
    ["hourlyRate", "BigDecimal", "Yes", "Hourly service rate in INR"],
    ["address, city, state, pincode", "String", "Yes", "Full location details"],
    ["latitude, longitude", "Double", "Yes", "GPS coordinates for location-based search"],
    ["distance", "Double (transient)", "Yes", "Calculated at search time; not persisted"],
    ["isAvailable", "Boolean", "No", "Worker toggles this to accept/reject new bookings"],
    ["averageRating", "BigDecimal(3,2)", "No", "Incrementally updated on each review"],
    ["totalReviews", "Integer", "No", "Count of reviews received"],
    ["totalJobsCompleted", "Integer", "No", "Count of completed bookings"],
    ["languagesSpoken", "String(200)", "Yes", "Comma-separated languages"],
    ["isVerified", "Boolean", "No", "Set to true when admin approves the worker"],
    ["skills", "List<WorkerSkill>", "No", "One-to-many: worker's skill categories"],
    ["reviews", "List<Review>", "No", "One-to-many: reviews received"],
  ]),
  spacer(100),
  h2("4.3 ConsumerProfile"),
  para("Extended profile for consumers. One-to-one with User. Stored in consumer_profiles table."),
  fieldTable([
    ["id", "Long (PK)", "No", "Auto-generated primary key"],
    ["user", "User (FK)", "No", "One-to-one with User"],
    ["fullName", "String", "No", "Consumer display name"],
    ["phoneNumber", "String(15)", "Yes", "Contact number"],
    ["profilePictureUrl", "String", "Yes", "Profile image URL"],
    ["address, city, state, pincode", "String", "Yes", "Location details"],
    ["totalBookings", "Integer", "No", "Lifetime booking count"],
    ["totalReviewsGiven", "Integer", "No", "Total reviews submitted"],
    ["bookings", "List<Booking>", "No", "All bookings made"],
    ["reviews", "List<Review>", "No", "All reviews given"],
    ["favoriteWorkers", "List<FavoriteWorker>", "No", "Favorited workers"],
  ]),
  spacer(100),
  h2("4.4 Booking"),
  para("Core transactional entity representing a service request. Stored in bookings table with DB indexes on consumer_id, worker_id, status, scheduled_date."),
  fieldTable([
    ["id", "Long (PK)", "No", "Auto-generated primary key"],
    ["consumer", "ConsumerProfile (FK)", "No", "The consumer who created the booking"],
    ["worker", "WorkerProfile (FK)", "No", "The worker assigned to the booking"],
    ["category", "SkillCategory (FK)", "No", "Service category"],
    ["serviceTitle", "String", "No", "Short title describing the service"],
    ["serviceDescription", "TEXT", "Yes", "Detailed description of the work needed"],
    ["scheduledDate, scheduledTime", "LocalDateTime", "No", "When the work is scheduled"],
    ["estimatedDuration", "Integer", "No", "Duration in hours"],
    ["address, city, state, pincode", "String", "No", "Service location"],
    ["latitude, longitude", "Double", "Yes", "GPS coordinates of service location"],
    ["hourlyRate", "BigDecimal", "No", "Worker's hourly rate at time of booking"],
    ["estimatedCost", "BigDecimal", "No", "Calculated as hourlyRate * estimatedDuration"],
    ["actualCost", "BigDecimal", "Yes", "Set by worker when completing the job"],
    ["totalAmount", "BigDecimal", "Yes", "Resolved amount for payment (actual > estimated > error)"],
    ["status", "BookingStatus (enum)", "No", "PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED"],
    ["paymentStatus", "PaymentStatus (enum)", "No", "PENDING, SUCCESS, FAILED, REFUNDED"],
    ["cancellationReason", "TEXT", "Yes", "Reason provided when cancelling"],
    ["cancelledBy", "String", "Yes", "CONSUMER, WORKER, or ADMIN"],
    ["confirmedAt, startedAt, completedAt, cancelledAt", "LocalDateTime", "Yes", "Lifecycle timestamps"],
    ["review", "Review (OneToOne)", "Yes", "Review submitted for this booking"],
    ["payment", "Payment (OneToOne)", "Yes", "Razorpay payment for this booking"],
  ]),
  spacer(100),
  h2("4.5 Payment"),
  para("Tracks Razorpay payment state for each booking. Stored in payments table (one-to-one with Booking)."),
  fieldTable([
    ["id", "Long (PK)", "No", "Auto-generated primary key"],
    ["booking", "Booking (OneToOne FK)", "No", "The booking this payment covers"],
    ["razorpayOrderId", "String (unique)", "Yes", "order_xxx returned by Razorpay Create Order API"],
    ["razorpayPaymentId", "String (unique)", "Yes", "pay_xxx returned after successful payment"],
    ["razorpaySignature", "String", "Yes", "HMAC-SHA256 signature for verification"],
    ["amount", "BigDecimal", "No", "Amount in INR (Razorpay stores paise; we store rupees)"],
    ["currency", "String(3)", "No", "Always INR"],
    ["status", "PaymentStatus", "No", "PENDING, SUCCESS, FAILED, REFUNDED"],
    ["failureReason", "String", "Yes", "Error message from Razorpay on failure"],
    ["paidAt", "LocalDateTime", "Yes", "Timestamp of successful payment verification"],
  ]),
  spacer(100),
  h2("4.6 Review"),
  para("Consumer-submitted rating and comment for a completed booking. Stored in reviews table."),
  fieldTable([
    ["id", "Long (PK)", "No", "Auto-generated"],
    ["booking", "Booking (OneToOne FK)", "No", "One review per booking"],
    ["worker", "WorkerProfile (FK)", "No", "Worker being reviewed"],
    ["consumer", "ConsumerProfile (FK)", "No", "Consumer who wrote the review"],
    ["rating", "BigDecimal(2,1)", "No", "1.0 to 5.0 star rating"],
    ["comment", "TEXT", "Yes", "Written feedback"],
    ["isVerified", "Boolean", "No", "Always true for platform-created reviews"],
    ["helpfulCount", "Integer", "No", "Future upvote feature"],
  ]),
  spacer(100),
  h2("4.7 Conversation & ChatMessage"),
  para("Conversation is a thread between one worker and one consumer. ChatMessage stores individual messages within a conversation."),
  fieldTable([
    ["Conversation.id", "Long (PK)", "No", "Auto-generated"],
    ["Conversation.worker, consumer", "User (FK)", "No", "Participants (both User entities)"],
    ["Conversation.lastMessage", "String(500)", "Yes", "Preview text for conversation list"],
    ["Conversation.workerUnreadCount", "Integer", "No", "Messages unread by worker"],
    ["Conversation.consumerUnreadCount", "Integer", "No", "Messages unread by consumer"],
    ["Conversation.isActive", "Boolean", "No", "Soft-delete flag"],
    ["ChatMessage.sender", "User (FK)", "No", "Who sent the message"],
    ["ChatMessage.content", "String(2000)", "No", "Message text"],
    ["ChatMessage.messageType", "Enum", "No", "TEXT, IMAGE, FILE, SYSTEM"],
    ["ChatMessage.attachmentUrl", "String(500)", "Yes", "URL for file/image messages"],
    ["ChatMessage.isRead", "Boolean", "No", "Whether recipient has read the message"],
    ["ChatMessage.readAt", "LocalDateTime", "Yes", "When the message was read"],
  ]),
  spacer(100),
  h2("4.8 Notification"),
  para("Push notifications sent to users on platform events. Delivered via WebSocket and persisted for the notification bell."),
  fieldTable([
    ["id", "Long (PK)", "No", "Auto-generated"],
    ["user", "User (FK)", "No", "Recipient of the notification"],
    ["title", "String(200)", "No", "Short notification heading"],
    ["message", "String(500)", "No", "Notification body text"],
    ["type", "NotificationType (enum)", "No", "Categorises the notification (see below)"],
    ["relatedEntityId", "Long", "Yes", "ID of linked booking, review, conversation, etc."],
    ["actionUrl", "String(500)", "Yes", "Deep-link for frontend navigation"],
    ["isRead", "Boolean", "No", "Whether the user has dismissed the notification"],
  ]),
  spacer(60),
  para("Notification types: NEW_MESSAGE, NEW_REVIEW, JOB_REQUEST, JOB_ACCEPTED, JOB_COMPLETED, PAYMENT_RECEIVED, PROFILE_UPDATE, SYSTEM, NEW_BOOKING, BOOKING_CONFIRMED, BOOKING_CANCELLED, BOOKING_COMPLETED, BOOKING_IN_PROGRESS, PAYMENT_REFUNDED, ACCOUNT_APPROVED, ACCOUNT_REJECTED, SYSTEM_ANNOUNCEMENT."),
  spacer(100),
  h2("4.9 Supporting Entities"),
  h3("SkillCategory"),
  para("Defines service categories (e.g. Plumbing, Electrical). Fields: id, name (unique), description, iconUrl, isActive, displayOrder."),
  h3("WorkerSkill"),
  para("Many-to-many join between WorkerProfile and SkillCategory with extra attributes. Fields: worker (FK), category (FK), proficiencyLevel (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT), yearsOfExperience, isPrimary."),
  h3("FavoriteWorker"),
  para("Tracks which workers a consumer has bookmarked. Unique constraint on (consumer_id, worker_id). Fields: consumer (FK), worker (FK), createdAt."),
  h3("EmailSubscription"),
  para("Newsletter subscriber list. Fields: email (unique), unsubscribeToken (UUID, unique), active (boolean), subscribedAt, unsubscribedAt."),
  pageBreak()
];

// ─── Section 5: API Reference ─────────────────────────────────────────────────

const apiSection = [
  h1("5. REST API Reference"),
  para("All endpoints are prefixed with /api. Requests and responses use JSON. Authentication via Bearer JWT token in the Authorization header unless noted as Public."),
  spacer(80),
  h2("5.1 Authentication — POST /api/auth"),
  apiTable([
    ["POST", "/register/consumer", "Public", "Register a new consumer account. Sends verification email."],
    ["POST", "/register/worker", "Public", "Register a new worker. Requires PAN number. Sends verification email. Account inactive until admin approval."],
    ["GET", "/verify-email?token=xxx", "Public", "Verify email using the token from the verification email."],
    ["POST", "/resend-verification", "Public", "Resend email verification link. Body: { email }"],
    ["POST", "/login", "Public", "Login for ADMIN and CONSUMER. Returns JWT token and role."],
    ["POST", "/login/worker", "Public", "Worker login using numeric worker ID + password."],
    ["POST", "/forgot-password", "Public", "Step 1 of password reset: sends 6-digit OTP to email."],
    ["POST", "/verify-otp", "Public", "Step 2: verify OTP. Returns a 15-minute resetToken on success."],
    ["POST", "/reset-password", "Public", "Step 3: use resetToken to set a new password."],
    ["POST", "/google", "Public", "Google OAuth2 login. Body: { token: googleIdToken, role? }"],
  ]),
  spacer(80),
  h2("5.2 Admin — /api/admin (ADMIN only)"),
  apiTable([
    ["GET", "/stats", "ADMIN", "System-wide statistics: user counts, booking counts, revenue totals."],
    ["GET", "/workers/pending", "ADMIN", "List all workers awaiting approval."],
    ["POST", "/workers/{workerId}/approve", "ADMIN", "Approve a pending worker. Sets workerApproved = true."],
    ["POST", "/workers/{workerId}/reject", "ADMIN", "Reject a pending worker."],
    ["GET", "/users?role=&page=&size=&search=", "ADMIN", "Paginated list of all users with optional role and search filters."],
    ["GET", "/users/{userId}", "ADMIN", "Get full details for a specific user."],
    ["POST", "/users/{userId}/toggle-enabled", "ADMIN", "Enable or disable a user account."],
    ["POST", "/users/{userId}/notify", "ADMIN", "Send a push notification to a user. Body: { title, message }"],
    ["GET", "/bookings?status=&page=&size=&search=", "ADMIN", "Paginated list of all bookings with filters."],
    ["GET", "/bookings/{bookingId}", "ADMIN", "Get full booking details."],
    ["POST", "/bookings/{bookingId}/cancel", "ADMIN", "Force cancel any booking. Body: { reason? }"],
    ["GET", "/payments?status=&page=&size=&search=", "ADMIN", "Paginated list of all Razorpay payment records."],
  ]),
  spacer(80),
  h2("5.3 Consumer — /api/consumer (CONSUMER only)"),
  apiTable([
    ["GET", "/dashboard", "CONSUMER", "Overview: recent bookings, stats, featured workers, unread counts."],
    ["GET", "/workers/search?...", "CONSUMER", "Search workers by category, location (city/GPS), rating, price, availability."],
    ["GET", "/workers", "CONSUMER", "List all verified, approved workers (paginated)."],
    ["GET", "/workers/{workerId}", "CONSUMER", "Detailed worker profile including skills and recent reviews."],
    ["GET", "/workers/{workerId}/reviews", "CONSUMER", "Paginated reviews for a worker with rating distribution."],
    ["GET", "/categories", "CONSUMER", "List all active skill categories."],
    ["POST", "/bookings", "CONSUMER", "Create a booking. Returns booking details + Razorpay order for immediate payment."],
    ["GET", "/bookings?status=&page=&size=", "CONSUMER", "Get consumer's bookings, optionally filtered by status."],
    ["GET", "/bookings/{bookingId}", "CONSUMER", "Full booking detail view."],
    ["PUT", "/bookings/{bookingId}/cancel", "CONSUMER", "Cancel a booking. Body: { reason }"],
    ["PUT", "/bookings/{bookingId}/complete", "CONSUMER", "Mark an in-progress booking as completed."],
    ["POST", "/bookings/{bookingId}/review", "CONSUMER", "Submit a 1-5 star review for a completed booking."],
    ["GET", "/profile", "CONSUMER", "Get consumer profile."],
    ["PUT", "/profile", "CONSUMER", "Update profile (name, phone, address, etc.)."],
    ["POST", "/profile/picture", "CONSUMER", "Upload profile picture (multipart/form-data, field: file)."],
    ["GET", "/stats", "CONSUMER", "Booking counts by status, total spent, favorites count."],
    ["POST", "/favorites/{workerId}", "CONSUMER", "Add a worker to favorites."],
    ["DELETE", "/favorites/{workerId}", "CONSUMER", "Remove a worker from favorites."],
    ["GET", "/favorites", "CONSUMER", "List favorited workers."],
    ["POST", "/chat/initiate/{workerId}", "CONSUMER", "Create or retrieve conversation with a worker."],
  ]),
  spacer(80),
  h2("5.4 Worker — /api/worker (WORKER only)"),
  apiTable([
    ["GET", "/dashboard", "WORKER", "Overview: stats, upcoming bookings, availability status."],
    ["PUT", "/availability", "WORKER", "Toggle availability. Body: { isAvailable: true/false }"],
    ["GET", "/profile", "WORKER", "Get worker profile with skills."],
    ["PUT", "/profile", "WORKER", "Update profile (bio, hourlyRate, location, GPS coords, etc.)."],
    ["POST", "/profile/picture", "WORKER", "Upload profile picture."],
    ["GET", "/skills", "WORKER", "List worker's current skills."],
    ["PUT", "/skills", "WORKER", "Replace all skills. Body: { skills: [{categoryId, proficiencyLevel, yearsOfExperience, isPrimary}] }"],
    ["GET", "/categories", "WORKER", "List all available skill categories."],
    ["GET", "/reviews?page=&size=", "WORKER", "Get reviews received with rating distribution."],
    ["GET", "/stats", "WORKER", "Earnings, jobs completed, response rate."],
    ["GET", "/bookings?status=&page=&size=", "WORKER", "Worker's bookings filtered by status."],
    ["GET", "/bookings/{bookingId}", "WORKER", "Full booking detail."],
    ["PUT", "/bookings/{bookingId}/accept", "WORKER", "Accept a payment-confirmed booking."],
    ["PUT", "/bookings/{bookingId}/reject", "WORKER", "Reject a confirmed booking. Body: { reason }"],
    ["PUT", "/bookings/{bookingId}/start", "WORKER", "Mark booking as IN_PROGRESS."],
    ["PUT", "/bookings/{bookingId}/complete", "WORKER", "Mark booking as COMPLETED. Body: { actualDuration? }"],
    ["PUT", "/bookings/{bookingId}/cancel", "WORKER", "Cancel a booking. Body: { reason }"],
    ["GET", "/", "CONSUMER, WORKER, ADMIN", "List all approved, available workers (no auth required for /api/workers/**)."],
  ]),
  spacer(80),
  h2("5.5 Chat — /api/chat (CONSUMER, WORKER)"),
  apiTable([
    ["GET", "/conversations", "Authenticated", "List all conversations for the logged-in user."],
    ["GET", "/conversations/{id}/messages?page=&size=", "Authenticated", "Paginated messages in a conversation (newest first)."],
    ["POST", "/messages", "Authenticated", "Send a message. Body: { conversationId, content, messageType?, attachmentUrl? }"],
    ["PUT", "/conversations/{id}/read", "Authenticated", "Mark all messages in a conversation as read."],
    ["GET", "/unread-count", "Authenticated", "Total unread messages and conversations."],
  ]),
  spacer(80),
  h2("5.6 Notifications — /api/notifications (Authenticated)"),
  apiTable([
    ["GET", "/?unreadOnly=false&page=0&size=20", "Authenticated", "Get notifications, optionally filtered to unread only."],
    ["PUT", "/{notificationId}/read", "Authenticated", "Mark one notification as read."],
    ["PUT", "/read-all", "Authenticated", "Mark all notifications as read."],
    ["GET", "/unread-count", "Authenticated", "Count of unread notifications."],
    ["DELETE", "/{notificationId}", "Authenticated", "Delete a notification."],
  ]),
  spacer(80),
  h2("5.7 Payments — /api/payments"),
  apiTable([
    ["POST", "/create-order/{bookingId}", "CONSUMER", "Create Razorpay order for a booking. Returns razorpayKeyId, razorpayOrderId, amount, customer details for the checkout modal."],
    ["POST", "/verify", "CONSUMER", "Verify payment after Razorpay checkout. Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }. Marks booking CONFIRMED on success."],
    ["GET", "/booking/{bookingId}", "CONSUMER, WORKER", "Get payment status for a booking."],
  ]),
  spacer(80),
  h2("5.8 Public Endpoints"),
  apiTable([
    ["POST", "/api/contact", "Public", "Submit contact form. Body: { name, email, message }. Sends emails to admin and submitter."],
    ["POST", "/api/subscribe", "Public", "Subscribe email to newsletter. Body: { email }"],
    ["GET", "/api/subscribe/unsubscribe?token=xxx", "Public", "One-click unsubscribe from newsletter. Returns HTML confirmation page."],
    ["GET", "/api/subscribe/count", "Public", "Count of active subscribers (add @PreAuthorize in production)."],
    ["GET", "/api/dashboard", "Authenticated", "Role-specific welcome message."],
  ]),
  pageBreak()
];

// ─── Section 6: WebSocket ─────────────────────────────────────────────────────

const wsSection = [
  h1("6. WebSocket & Real-Time Communication"),
  h2("6.1 Connection"),
  para("The WebSocket endpoint is /ws with SockJS fallback. Clients connect using the SockJS library on the frontend. JWT authentication is required and must be passed as the Authorization header in the STOMP CONNECT frame."),
  spacer(80),
  h2("6.2 Message Broker"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2800, 6560],
    rows: [
      headerRow([{ text: "Prefix", width: 2800 }, { text: "Usage", width: 6560 }]),
      dataRow([{ text: "/app", width: 2800 }, { text: "Application destination prefix — messages sent from client to server", width: 6560 }]),
      dataRow([{ text: "/topic", width: 2800, bg: GRAY_BG }, { text: "Simple broker topic for broadcasting (currently unused by app)", width: 6560, bg: GRAY_BG }]),
      dataRow([{ text: "/queue", width: 2800 }, { text: "Queue for user-specific messages (chat, notifications, typing)", width: 6560 }]),
      dataRow([{ text: "/user", width: 2800, bg: GRAY_BG }, { text: "User destination prefix — routes messages to specific authenticated users", width: 6560, bg: GRAY_BG }]),
    ]
  }),
  spacer(120),
  h2("6.3 Client Destinations (Send to Server)"),
  apiTable([
    ["STOMP", "/app/chat.send", "CONSUMER, WORKER", "Send a chat message. Payload: ChatMessagePayload"],
    ["STOMP", "/app/chat.typing", "CONSUMER, WORKER", "Send typing indicator. Payload: TypingIndicatorPayload"],
  ]),
  spacer(80),
  h2("6.4 Server-to-Client Destinations (Subscribe)"),
  apiTable([
    ["Subscribe", "/user/{userId}/queue/messages", "CONSUMER, WORKER", "Receive incoming chat messages in real-time"],
    ["Subscribe", "/user/{userId}/queue/typing", "CONSUMER, WORKER", "Receive typing indicator events"],
    ["Subscribe", "/user/{userId}/queue/notifications", "Any authenticated", "Receive push notifications instantly"],
  ]),
  spacer(80),
  h2("6.5 WebSocket Authentication Flow"),
  bullet("Client obtains a JWT via standard REST login"),
  bullet("Client connects to /ws with SockJS"),
  bullet("Client sends STOMP CONNECT frame with header: Authorization: Bearer <token>"),
  bullet("Server's ChannelInterceptor in WebSocketConfig intercepts the CONNECT command"),
  bullet("JWT is validated via JwtService.validateToken()"),
  bullet("User ID is extracted and stored in the STOMP session attributes as userId"),
  bullet("Authentication is set in SecurityContext for the session lifetime"),
  pageBreak()
];

// ─── Section 7: Booking Lifecycle ─────────────────────────────────────────────

const bookingSection = [
  h1("7. Booking Lifecycle"),
  para("Bookings follow a well-defined state machine. The valid transitions are:"),
  spacer(80),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 1800, 5760],
    rows: [
      headerRow([{ text: "From Status", width: 1800 }, { text: "To Status", width: 1800 }, { text: "Trigger & Actor", width: 5760 }]),
      dataRow([{ text: "—", width: 1800 }, { text: "PENDING", width: 1800 }, { text: "Consumer creates booking and Razorpay order is created immediately", width: 5760 }]),
      dataRow([{ text: "PENDING", width: 1800, bg: GRAY_BG }, { text: "CONFIRMED", width: 1800, bg: GRAY_BG }, { text: "Consumer completes payment and backend verifies Razorpay signature via POST /api/payments/verify", width: 5760, bg: GRAY_BG }]),
      dataRow([{ text: "CONFIRMED", width: 1800 }, { text: "IN_PROGRESS", width: 1800 }, { text: "Worker calls PUT /api/worker/bookings/{id}/start", width: 5760 }]),
      dataRow([{ text: "IN_PROGRESS", width: 1800, bg: GRAY_BG }, { text: "COMPLETED", width: 1800, bg: GRAY_BG }, { text: "Worker calls PUT /api/worker/bookings/{id}/complete OR consumer calls PUT /api/consumer/bookings/{id}/complete", width: 5760, bg: GRAY_BG }]),
      dataRow([{ text: "CONFIRMED", width: 1800 }, { text: "REJECTED", width: 1800 }, { text: "Worker calls PUT /api/worker/bookings/{id}/reject before starting", width: 5760 }]),
      dataRow([{ text: "PENDING / CONFIRMED / IN_PROGRESS", width: 1800, bg: GRAY_BG }, { text: "CANCELLED", width: 1800, bg: GRAY_BG }, { text: "Consumer, Worker, or Admin cancels the booking", width: 5760, bg: GRAY_BG }]),
    ]
  }),
  spacer(120),
  h2("7.1 Payment & Booking Integration"),
  para("AapnoKaam uses a payment-first confirmation model:"),
  bullet("Booking is created in PENDING status with paymentStatus = PENDING"),
  bullet("A Razorpay order is created immediately and the razorpayOrderId + razorpayKeyId are returned in the POST /consumer/bookings response — no second API call needed"),
  bullet("Frontend opens the Razorpay checkout modal using the returned order details"),
  bullet("On successful payment, frontend calls POST /api/payments/verify with the three Razorpay values"),
  bullet("Backend verifies the HMAC-SHA256 signature: signature = HMAC(razorpayKeySecret, orderId + '|' + paymentId)"),
  bullet("If valid: booking status → CONFIRMED, paymentStatus → SUCCESS, confirmation emails sent"),
  bullet("If invalid: payment record marked FAILED, RuntimeException thrown"),
  spacer(120),
  h2("7.2 Conflict Detection"),
  para("When creating a booking, the system checks for scheduling conflicts via BookingRepository.existsConflictingBooking(). A conflict exists if the worker has a PENDING, CONFIRMED, or IN_PROGRESS booking whose time window overlaps with the requested window."),
  pageBreak()
];

// ─── Section 8: Email Service ─────────────────────────────────────────────────

const emailSection = [
  h1("8. Email Notifications"),
  para("All emails are sent as styled HTML via JavaMailSender (SMTP/Gmail). Email sending is non-blocking for booking confirmation flows — failures are logged but do not roll back the transaction."),
  spacer(80),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3200, 1800, 4360],
    rows: [
      headerRow([{ text: "Email", width: 3200 }, { text: "Recipient", width: 1800 }, { text: "Trigger", width: 4360 }]),
      dataRow([{ text: "Email Verification", width: 3200 }, { text: "User", width: 1800 }, { text: "Registration (consumer & worker)", width: 4360 }]),
      dataRow([{ text: "OTP Password Reset", width: 3200, bg: GRAY_BG }, { text: "User", width: 1800, bg: GRAY_BG }, { text: "POST /api/auth/forgot-password", width: 4360, bg: GRAY_BG }]),
      dataRow([{ text: "Worker Approval / Rejection", width: 3200 }, { text: "Worker", width: 1800 }, { text: "Admin approves or rejects worker", width: 4360 }]),
      dataRow([{ text: "Booking Confirmation", width: 3200, bg: GRAY_BG }, { text: "Consumer", width: 1800, bg: GRAY_BG }, { text: "Payment verified successfully", width: 4360, bg: GRAY_BG }]),
      dataRow([{ text: "New Booking Notification", width: 3200 }, { text: "Worker", width: 1800 }, { text: "Payment verified (worker receives job details)", width: 4360 }]),
      dataRow([{ text: "Job Completion (Consumer)", width: 3200, bg: GRAY_BG }, { text: "Consumer", width: 1800, bg: GRAY_BG }, { text: "Worker marks booking COMPLETED", width: 4360, bg: GRAY_BG }]),
      dataRow([{ text: "Job Completion (Worker)", width: 3200 }, { text: "Worker", width: 1800 }, { text: "Booking marked COMPLETED", width: 4360 }]),
      dataRow([{ text: "Contact Form — Admin Notification", width: 3200, bg: GRAY_BG }, { text: "Admin", width: 1800, bg: GRAY_BG }, { text: "POST /api/contact submission", width: 4360, bg: GRAY_BG }]),
      dataRow([{ text: "Contact Form — User Acknowledgement", width: 3200 }, { text: "Submitter", width: 1800 }, { text: "POST /api/contact submission", width: 4360 }]),
      dataRow([{ text: "Newsletter Subscription Confirmation", width: 3200, bg: GRAY_BG }, { text: "Subscriber", width: 1800, bg: GRAY_BG }, { text: "POST /api/subscribe (new subscriber)", width: 4360, bg: GRAY_BG }]),
      dataRow([{ text: "Newsletter Welcome Back", width: 3200 }, { text: "Subscriber", width: 1800 }, { text: "POST /api/subscribe (re-subscribing)", width: 4360 }]),
      dataRow([{ text: "Unsubscribe Confirmation", width: 3200, bg: GRAY_BG }, { text: "Subscriber", width: 1800, bg: GRAY_BG }, { text: "GET /api/subscribe/unsubscribe?token=xxx", width: 4360, bg: GRAY_BG }]),
    ]
  }),
  pageBreak()
];

// ─── Section 9: Configuration ─────────────────────────────────────────────────

const configSection = [
  h1("9. Configuration"),
  h2("9.1 application.properties Keys"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3800, 5560],
    rows: [
      headerRow([{ text: "Property", width: 3800 }, { text: "Description", width: 5560 }]),
      dataRow([{ text: "spring.datasource.url", width: 3800 }, { text: "JDBC URL for MySQL database", width: 5560 }]),
      dataRow([{ text: "spring.datasource.username/password", width: 3800, bg: GRAY_BG }, { text: "Database credentials", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "spring.jpa.hibernate.ddl-auto", width: 3800 }, { text: "Schema strategy: update (dev), validate (prod)", width: 5560 }]),
      dataRow([{ text: "jwt.secret", width: 3800, bg: GRAY_BG }, { text: "Base64-encoded HMAC-SHA256 secret for JWT signing", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "jwt.expiration", width: 3800 }, { text: "JWT token validity in milliseconds", width: 5560 }]),
      dataRow([{ text: "spring.mail.host / port / username / password", width: 3800, bg: GRAY_BG }, { text: "SMTP configuration for Gmail or other provider", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "razorpay.key.id", width: 3800 }, { text: "Razorpay API Key ID (from Razorpay dashboard)", width: 5560 }]),
      dataRow([{ text: "razorpay.key.secret", width: 3800, bg: GRAY_BG }, { text: "Razorpay API Key Secret — used for HMAC verification", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "spring.security.oauth2.client.registration.google.client-id", width: 3800 }, { text: "Google OAuth2 client ID for token verification", width: 5560 }]),
      dataRow([{ text: "admin.email", width: 3800, bg: GRAY_BG }, { text: "Admin account email created by DataSeeder on startup", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "admin.password", width: 3800 }, { text: "Admin initial password — change immediately in production", width: 5560 }]),
      dataRow([{ text: "app.upload.dir", width: 3800, bg: GRAY_BG }, { text: "Local directory path for file uploads (default: uploads)", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "app.contact.admin-email", width: 3800 }, { text: "Email address that receives contact form submissions", width: 5560 }]),
    ]
  }),
  spacer(120),
  h2("9.2 File Storage"),
  para("Uploaded files (profile pictures) are stored in the local filesystem under app.upload.dir. Files are stored in subdirectories (e.g. uploads/profiles/). Maximum file size: 10 MB. Accepted types: image/jpeg, image/png, image/gif. Filenames are replaced with UUID-based names to prevent collisions and path traversal attacks."),
  spacer(120),
  h2("9.3 Admin Seed"),
  para("On every application startup, DataSeeder checks whether the admin email exists in the database. If not, it creates an ADMIN user with emailVerified = true and enabled = true. The admin email and password are read from application.properties. Change the default password before deploying to production."),
  pageBreak()
];

// ─── Section 10: Services Summary ─────────────────────────────────────────────

const servicesSection = [
  h1("10. Service Layer Summary"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2600, 6760],
    rows: [
      headerRow([{ text: "Service", width: 2600 }, { text: "Responsibilities", width: 6760 }]),
      dataRow([{ text: "AuthService", width: 2600 }, { text: "Consumer/worker registration, email verification, login (email+password), worker approval/rejection", width: 6760 }]),
      dataRow([{ text: "OtpService", width: 2600, bg: GRAY_BG }, { text: "3-step forgot-password flow: OTP generation, OTP verification, password reset with hashed token storage", width: 6760, bg: GRAY_BG }]),
      dataRow([{ text: "OAuth2Service", width: 2600 }, { text: "Google Sign-In token verification, account linking, auto-registration of new Google users", width: 6760 }]),
      dataRow([{ text: "AdminService", width: 2600, bg: GRAY_BG }, { text: "System stats aggregation, user/booking/payment management with in-memory search + pagination", width: 6760, bg: GRAY_BG }]),
      dataRow([{ text: "ConsumerService", width: 2600 }, { text: "Worker search with JPA Specifications, booking creation (with embedded payment order), reviews, favorites, profile management", width: 6760 }]),
      dataRow([{ text: "WorkerService", width: 2600, bg: GRAY_BG }, { text: "Worker dashboard, availability toggle, profile/skills updates, earnings stats from BookingRepository", width: 6760, bg: GRAY_BG }]),
      dataRow([{ text: "WorkerBookingService", width: 2600 }, { text: "Worker-side booking state transitions: accept, reject, start, complete, cancel — with email and notification triggers", width: 6760 }]),
      dataRow([{ text: "ChatService", width: 2600, bg: GRAY_BG }, { text: "Conversation management, message persistence, WebSocket delivery via SimpMessagingTemplate, typing indicators, read receipts", width: 6760, bg: GRAY_BG }]),
      dataRow([{ text: "NotificationService", width: 2600 }, { text: "Notification creation, WebSocket push delivery, read/unread management, deletion", width: 6760 }]),
      dataRow([{ text: "PaymentService", width: 2600, bg: GRAY_BG }, { text: "Razorpay order creation, HMAC signature verification, payment status updates, booking confirmation after successful payment", width: 6760, bg: GRAY_BG }]),
      dataRow([{ text: "EmailService", width: 2600 }, { text: "Transactional HTML emails for auth, booking lifecycle, and contact form via JavaMailSender (SMTP)", width: 6760 }]),
      dataRow([{ text: "SubscriptionService", width: 2600, bg: GRAY_BG }, { text: "Newsletter subscribe, re-subscribe, and unsubscribe via UUID tokens embedded in emails", width: 6760, bg: GRAY_BG }]),
      dataRow([{ text: "SubscriptionEmailService", width: 2600 }, { text: "Dedicated email service for subscription lifecycle: confirmation, welcome-back, unsubscribe confirmation", width: 6760 }]),
      dataRow([{ text: "FileStorageService", width: 2600, bg: GRAY_BG }, { text: "Multipart file validation (size, MIME type), UUID renaming, local filesystem storage, deletion", width: 6760, bg: GRAY_BG }]),
      dataRow([{ text: "ContactService", width: 2600 }, { text: "Routes contact form submissions to admin email and sends acknowledgement to submitter", width: 6760 }]),
      dataRow([{ text: "CustomUserDetailsService", width: 2600, bg: GRAY_BG }, { text: "Spring Security UserDetailsService — loads User by email for authentication", width: 6760, bg: GRAY_BG }]),
      dataRow([{ text: "GoogleTokenVerifier", width: 2600 }, { text: "Validates Google ID tokens using Google API client library against the configured OAuth2 client-id", width: 6760 }]),
    ]
  }),
  pageBreak()
];

// ─── Section 11: Frontend Integration ─────────────────────────────────────────

const frontendSection = [
  h1("11. Frontend Integration Guide"),
  para("The React frontend runs on http://localhost:5173 (or 5174). All API calls go to the Spring Boot backend at http://localhost:8081."),
  spacer(80),
  h2("11.1 Authentication Flow"),
  bullet("On login, store the JWT token from AuthResponse.token in localStorage or a secure cookie"),
  bullet("Attach to every API request: Authorization: Bearer <token>"),
  bullet("Decode the JWT to read role, userId, username for routing and display"),
  bullet("On 401 responses, redirect to login and clear stored token"),
  spacer(100),
  h2("11.2 Razorpay Checkout Integration"),
  para("The consumer booking flow is designed for a single API call before opening the Razorpay modal:"),
  bullet("Consumer submits booking form → POST /api/consumer/bookings"),
  bullet("Response includes: bookingId, razorpayKeyId, razorpayOrderId, customerName, customerEmail, customerPhone"),
  bullet("Open the Razorpay checkout modal using the returned key and order ID"),
  bullet("On payment success (handler.razorpay_payment_id), call POST /api/payments/verify with the three Razorpay values"),
  bullet("On payment failure, the booking remains in PENDING status and the consumer can retry"),
  spacer(100),
  h2("11.3 WebSocket Setup"),
  bullet("Install: npm install sockjs-client @stomp/stompjs"),
  bullet("Connect to: http://localhost:8081/ws with SockJS"),
  bullet("Include STOMP CONNECT header: { Authorization: 'Bearer ' + token }"),
  bullet("Subscribe to /user/{userId}/queue/messages for real-time chat messages"),
  bullet("Subscribe to /user/{userId}/queue/notifications for push notifications"),
  bullet("Subscribe to /user/{userId}/queue/typing for typing indicators"),
  bullet("Send messages to /app/chat.send and typing events to /app/chat.typing"),
  spacer(100),
  h2("11.4 Worker Search Parameters"),
  para("The GET /api/consumer/workers/search endpoint accepts the following query parameters:"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 1400, 5560],
    rows: [
      headerRow([{ text: "Parameter", width: 2400 }, { text: "Type", width: 1400 }, { text: "Description", width: 5560 }]),
      dataRow([{ text: "categoryId", width: 2400 }, { text: "Long", width: 1400 }, { text: "Filter by skill category ID", width: 5560 }]),
      dataRow([{ text: "city, state, pincode", width: 2400, bg: GRAY_BG }, { text: "String", width: 1400, bg: GRAY_BG }, { text: "Text-based location filters", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "latitude, longitude", width: 2400 }, { text: "Double", width: 1400 }, { text: "GPS coordinates of the consumer for distance calculation", width: 5560 }]),
      dataRow([{ text: "radiusKm", width: 2400, bg: GRAY_BG }, { text: "Double", width: 1400, bg: GRAY_BG }, { text: "Search radius in kilometers from latitude/longitude", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "minRating", width: 2400 }, { text: "Double", width: 1400 }, { text: "Minimum average rating filter (0.0 to 5.0)", width: 5560 }]),
      dataRow([{ text: "maxHourlyRate", width: 2400, bg: GRAY_BG }, { text: "Double", width: 1400, bg: GRAY_BG }, { text: "Maximum hourly rate filter in INR", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "availableOnly", width: 2400 }, { text: "Boolean", width: 1400 }, { text: "If true, only return workers with isAvailable = true", width: 5560 }]),
      dataRow([{ text: "sortBy", width: 2400, bg: GRAY_BG }, { text: "String", width: 1400, bg: GRAY_BG }, { text: "rating (default), price_low, price_high, experience, jobs", width: 5560, bg: GRAY_BG }]),
      dataRow([{ text: "page, size", width: 2400 }, { text: "Integer", width: 1400 }, { text: "Pagination: default page=0, size=20", width: 5560 }]),
    ]
  }),
  pageBreak()
];

// ─── Section 12: Error Handling ────────────────────────────────────────────────

const errorSection = [
  h1("12. Error Handling"),
  h2("12.1 Custom Exceptions"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: [
      headerRow([{ text: "Exception Class", width: 3000 }, { text: "Usage", width: 6360 }]),
      dataRow([{ text: "AuthException", width: 3000 }, { text: "Authentication and authorization failures (invalid credentials, unverified email, unapproved worker)", width: 6360 }]),
      dataRow([{ text: "BookingException", width: 3000, bg: GRAY_BG }, { text: "Invalid booking operations (unavailable worker, past date, already cancelled, conflicting schedule)", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "ResourceNotFoundException", width: 3000 }, { text: "Entity not found (booking, user, worker profile, notification)", width: 6360 }]),
      dataRow([{ text: "UnauthorizedException", width: 3000, bg: GRAY_BG }, { text: "Ownership validation failures (accessing another user's booking, notification, or conversation)", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "FileStorageException", width: 3000 }, { text: "File upload issues (empty file, path traversal attempt, size over 10 MB, invalid MIME type)", width: 6360 }]),
    ]
  }),
  spacer(100),
  h2("12.2 Validation Rules"),
  bullet("Booking date must be in the future and within 3 months"),
  bullet("Estimated duration: 1 to 24 hours"),
  bullet("Review rating: 1 to 5 (integer)"),
  bullet("Only one review allowed per booking"),
  bullet("Only COMPLETED bookings can be reviewed"),
  bullet("Booking cancellation not allowed if status is COMPLETED or already CANCELLED"),
  bullet("Duplicate payment is prevented: SUCCESS payment for same booking throws exception"),
  spacer(100),
  h2("12.3 Forgot Password Security"),
  bullet("OTP is always 6 digits, generated using SecureRandom — cryptographically secure"),
  bullet("OTP expires after 10 minutes"),
  bullet("Both OTP and reset token are stored as SHA-256 hashes only — never plain text"),
  bullet("Reset token (UUID) expires after 15 minutes"),
  bullet("The forgot-password endpoint always returns a generic success message regardless of whether the email exists — prevents user enumeration"),
  pageBreak()
];

// ─── Section 13: Deployment Notes ─────────────────────────────────────────────

const deploySection = [
  h1("13. Deployment Notes"),
  h2("13.1 Before Going to Production"),
  bullet("Remove the H2 console endpoint from security whitelist in SecurityConfig"),
  bullet("Set spring.jpa.hibernate.ddl-auto=validate and manage schema changes with Flyway or Liquibase"),
  bullet("Restrict CORS allowed origins to the actual production frontend domain"),
  bullet("Move all secrets (JWT secret, Razorpay keys, DB credentials, mail password) to environment variables or a secrets manager"),
  bullet("Change admin.password immediately after first deployment"),
  bullet("Remove or secure the /api/subscribe/count endpoint with @PreAuthorize('hasRole(\"ADMIN\")')"),
  bullet("Replace the H2 database with the production MySQL database URL"),
  bullet("Configure a production SMTP provider (not Gmail dev credentials)"),
  bullet("Update all hardcoded localhost URLs in EmailService and SubscriptionEmailService to production domains"),
  bullet("Consider replacing local FileStorageService with cloud storage (AWS S3, GCP Cloud Storage, etc.)"),
  spacer(100),
  h2("13.2 Running Locally"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: [
      headerRow([{ text: "Component", width: 3000 }, { text: "Command / Port", width: 6360 }]),
      dataRow([{ text: "Spring Boot Backend", width: 3000 }, { text: "mvn spring-boot:run   →  http://localhost:8081", width: 6360 }]),
      dataRow([{ text: "React Frontend", width: 3000, bg: GRAY_BG }, { text: "npm run dev   →  http://localhost:5173", width: 6360, bg: GRAY_BG }]),
      dataRow([{ text: "H2 Console (dev only)", width: 3000 }, { text: "http://localhost:8081/h2-console", width: 6360 }]),
      dataRow([{ text: "Swagger UI", width: 3000, bg: GRAY_BG }, { text: "http://localhost:8081/swagger-ui/index.html", width: 6360, bg: GRAY_BG }]),
    ]
  }),
];

// ─── Build Document ────────────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: LIGHT_BLUE },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }, {
          level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      ...coverPage,
      ...overviewSection,
      ...archSection,
      ...securitySection,
      ...dataModelSection,
      ...apiSection,
      ...wsSection,
      ...bookingSection,
      ...emailSection,
      ...configSection,
      ...servicesSection,
      ...frontendSection,
      ...errorSection,
      ...deploySection,
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/AapnoKaam_Documentation.docx', buffer);
  console.log('Documentation generated successfully!');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});