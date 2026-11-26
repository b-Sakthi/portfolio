export type ProjectSlug =
  | "retailiq"
  | "cintic"
  | "linlearn"
  | "smart-water-hydro";

export interface ArchitectureNode {
  id: string;
  label: string;
  sublabel: string;
  layer: "client" | "api" | "intelligence" | "data" | "ops";
}

export interface ArchitectureFlow {
  from: string;
  to: string;
  label: string;
}

export interface ProjectCaseStudy {
  slug: ProjectSlug;
  number: string;
  name: string;
  tagline: string;
  category: string;
  role?: string;
  oneLineDescription: string;
  contributionSummary: string;
  technologies: string[];
  github?: string;
  live?: string;
  githubNote: string;
  visualTheme: {
    accentLabel: string;
    metricBadges: string[];
  };
  overview: string;
  whyIChoseThis: string;
  realWorldProblem: string;
  problemStatement: string;
  objectives: string[];
  proposedSolution: string;
  architectureSummary: string;
  architectureNodes: ArchitectureNode[];
  architectureFlows: ArchitectureFlow[];
  contributions: string[];
  importantFeatures: string[];
  developmentWorkflow: string[];
  technicalChallenges: string[];
  howISolvedChallenges: string[];
  screenshotNote: string;
  resultsAndLimitations: {
    implemented: string[];
    limitations: string[];
  };
  whatILearned: string[];
}

export const projects: ProjectCaseStudy[] = [
  {
    slug: "linlearn",
    number: "01",
    name: "LinLearn",
    tagline: "Browser-Native Linux & DevOps Training",
    category: "Systems · WebAssembly · EdTech",
    oneLineDescription:
      "Browser-native Linux and DevOps training platform featuring an interactive Linux terminal, incident simulation, learning missions, command assistance, cognitive mastery tracking, and XP progress.",
    contributionSummary:
      "Full-stack development and platform integration (Next.js, TypeScript, v86, IndexedDB, Supabase Auth/RLS, Redis, Groq AI).",
    technologies: [
      "Next.js",
      "TypeScript",
      "WebAssembly",
      "v86",
      "IndexedDB",
      "Supabase",
      "Redis",
      "Groq AI",
    ],
    live: "https://linlearn.vercel.app/dashboard",
    github: "https://github.com/b-Sakthi/linlearn",
    githubNote: "Official GitHub repository for LinLearn.",
    visualTheme: {
      accentLabel: "Simulation Mode + BKT Mastery",
      metricBadges: ["Interactive Terminal", "Missions & XP", "BKT Mastery"],
    },
    overview:
      "LinLearn is a browser-native Linux and DevOps training platform built around an interactive terminal environment with dual execution paths: an immediate Simulation Mode during VM environment provisioning that transitions into a full client-side x86 Linux kernel via v86 WebAssembly. It features guided incident simulations, learning missions, command assistance, cognitive mastery tracking via Bayesian Knowledge Tracing (BKT), and XP/streak progress—backed by Next.js, TypeScript, IndexedDB persistence, Supabase Auth with Row-Level Security, Redis rate limiting, and Groq AI tutoring.",
    whyIChoseThis:
      "I built LinLearn to combine practical systems education with browser-native WebAssembly virtualization and responsible AI engineering—giving learners real Linux environments without cloud VM spin-up latency while enforcing strict data isolation and usage quotas.",
    realWorldProblem:
      "Learners studying Linux and DevOps often struggle to practice real troubleshooting safely without provisioning external servers, and lack guided feedback when diagnosing Nginx, Docker, or permission incidents.",
    problemStatement:
      "Deliver an interactive x86 Linux training environment directly in the browser with persistent local state, realistic production-incident simulations, and an AI tutor protected by authentication, Row-Level Security, and rate limits.",
    objectives: [
      "Provide a dual execution environment: an instant client-side command simulator while the full x86 Linux VM boots in WebAssembly (v86), eliminating backend container hosting costs.",
      "Persist local filesystem modifications and shell session state across browser reloads using IndexedDB.",
      "Simulate live production incidents covering Nginx, Docker, and Linux permissions.",
      "Track adaptive mastery dynamically with Bayesian Knowledge Tracing (BKT) to tailor practice tasks to learner competence.",
      "Provide an AI tutor via Groq LLM for mock interviews, command generation, cheat-sheet creation, and terminal error analysis.",
      "Enforce secure authentication, Supabase Row-Level Security (RLS), Redis sliding-window rate limiting, and AI usage quotas.",
    ],
    proposedSolution:
      "A Next.js + TypeScript application embedding a v86 WebAssembly x86 Linux VM with IndexedDB state persistence, paired with an instant provisioning Simulation Mode, Supabase Auth/RLS, Redis rate limiting, and Groq AI tutoring workflows.",
    architectureSummary:
      "The Next.js + TypeScript frontend boots a client-side x86 Linux VM via WebAssembly (v86) with IndexedDB persistence. During initial VM initialization and image downloads, an interactive Simulation Mode provides immediate command response. AI tutor queries and mastery telemetry flow through Supabase Auth session validation with Row-Level Security, bounded by Redis sliding-window rate limits and quota guards before calling Groq AI.",
    architectureNodes: [
      {
        id: "client",
        label: "Next.js + v86 WASM",
        sublabel: "Browser x86 Linux VM & IndexedDB",
        layer: "client",
      },
      {
        id: "auth",
        label: "Supabase Auth & RLS",
        sublabel: "Session Security & Row-Level Isolation",
        layer: "api",
      },
      {
        id: "redis",
        label: "Redis Guard",
        sublabel: "Rate Limiting & AI Usage Quotas",
        layer: "api",
      },
      {
        id: "ai",
        label: "Groq AI Tutor",
        sublabel: "Incident Guidance, Commands & Interviews",
        layer: "intelligence",
      },
    ],
    architectureFlows: [
      {
        from: "Next.js + v86 WASM",
        to: "Supabase Auth & RLS",
        label: "Authenticated session & mastery sync",
      },
      {
        from: "Next.js + v86 WASM",
        to: "Redis Guard",
        label: "Rate limit & quota check",
      },
      {
        from: "Redis Guard",
        to: "Groq AI Tutor",
        label: "Authorized inference prompts",
      },
      {
        from: "Groq AI Tutor",
        to: "Next.js + v86 WASM",
        label: "Error analysis, commands & feedback",
      },
    ],
    contributions: [
      "Built the Next.js and TypeScript platform integrating a browser-native x86 Linux VM via WebAssembly (v86) and IndexedDB persistence.",
      "Implemented the dual-mode execution lifecycle: lightweight client-side command simulation during image provisioning transitioning to full x86 VM execution.",
      "Designed live production-incident simulations (Nginx, Docker, permissions) and adaptive mastery tracking.",
      "Integrated Bayesian Knowledge Tracing (BKT) algorithms to dynamically calculate learner mastery probabilities across command categories.",
      "Implemented AI tutor workflows with Groq AI: mock interviews, command generation, cheat-sheet creation, and terminal error analysis.",
      "Configured Supabase authentication, Row-Level Security, and Redis-backed rate limiting and AI usage quotas.",
    ],
    importantFeatures: [
      "Interactive Linux terminal with instant Simulation Mode and full v86 WebAssembly x86 VM execution",
      "Client-side filesystem persistence across browser sessions via IndexedDB",
      "Incident simulation (Nginx, Docker, permissions)",
      "Learning missions & sandbox challenges",
      "Command assistance, cheat sheets & AI tutor",
      "Cognitive mastery tracking (BKT model)",
      "XP, streaks & learning progress",
      "Supabase Auth/RLS & Redis rate limiting",
    ],
    developmentWorkflow: [
      "Type-safe full-stack development in Next.js and TypeScript.",
      "Client-side VM integration with WebAssembly (v86) and IndexedDB persistence.",
      "Database access policy design with Supabase Row-Level Security and Redis quota guards.",
    ],
    technicalChallenges: [
      "Running a responsive x86 Linux kernel inside the browser without incurring costly server-side VM hosting bills, while eliminating initial boot wait times for learners.",
      "Persisting disk state and terminal command history across browser refreshes in a sandboxed client environment.",
      "Preventing uncontrolled Groq LLM API consumption and denial-of-wallet risks across interactive AI tutoring sessions.",
      "Ensuring each learner's saved progress and session history remain strictly isolated at the database layer.",
    ],
    howISolvedChallenges: [
      "Integrated the v86 WebAssembly emulator with IndexedDB persistence, backed by an immediate client-side Simulation Mode fallback so learners can practice immediately while the full x86 disk image boots in the background.",
      "Engineered an IndexedDB persistence layer that serializes filesystem deltas and terminal states directly in browser storage.",
      "Added Redis-backed rate limiting and explicit AI usage quotas before forwarding requests to Groq AI.",
      "Enforced Supabase Row-Level Security policies tied to authenticated user sessions.",
    ],
    screenshotNote:
      "Interactive system architecture and dual-mode execution diagram shown above. Highlights the progression from initial client-side Simulation Mode to full v86 WebAssembly x86 kernel execution with IndexedDB state persistence.",
    resultsAndLimitations: {
      implemented: [
        "Live Next.js + TypeScript web deployment at linlearn.vercel.app/dashboard with v86 WebAssembly Linux terminal integration and IndexedDB persistence.",
        "Dual execution workflow supporting instant command simulation during initial VM image provisioning followed by full x86 virtualization.",
        "Interactive learning missions, incident simulations (Nginx, Docker, permissions), XP/streak tracking, and BKT cognitive mastery model.",
        "Supabase Auth/RLS policies and Redis-backed rate limiting & AI usage quotas guarding Groq AI tutor workflows.",
      ],
      limitations: [
        "Browser-side v86 x86 emulation requires initial VM provisioning time and client CPU/memory resources, falling back to Simulation Mode while the environment initializes.",
        "External AI tutoring capabilities rely on Groq LLM inference endpoints bounded by Redis quota allocations.",
      ],
    },
    whatILearned: [
      "Integrating WebAssembly (v86) virtualization and IndexedDB persistence in a Next.js application.",
      "How database-enforced Row-Level Security simplifies multi-tenant authorization.",
      "Designing cost-aware AI applications with Redis rate limiting and explicit usage quotas.",
    ],
  },
  {
    slug: "retailiq",
    number: "02",
    name: "RetailIQ",
    tagline: "Smart Retail Video Analytics",
    category: "Computer Vision · Full Stack · MLOps",
    role: "Frontend & DevOps Contributor",
    oneLineDescription:
      "Retail video analytics monorepo turning store camera feeds into footfall, dwell-time, and shelf-stock insights via YOLO11n, ByteTrack, hybrid RAG, and async PostgreSQL.",
    contributionSummary:
      "Frontend & DevOps Contributor — Architected the Next.js/TypeScript analytics dashboard, Docker containerization, Docker Compose multi-service orchestration, and GitHub Actions CI/CD pipelines executing 170 automated Pytest tests (collaborative monorepo; computer vision models developed by team).",
    technologies: [
      "Next.js",
      "TypeScript",
      "Docker",
      "Docker Compose",
      "GitHub Actions",
      "FastAPI",
      "PostgreSQL",
      "YOLO11n",
      "ByteTrack",
      "Redis",
      "Groq",
      "Pytest",
    ],
    github: "https://github.com/SGGGokul/Smart-Retail",
    githubNote: "Official collaborative repository on GitHub.",
    visualTheme: {
      accentLabel: "Frontend + Docker + CI/CD",
      metricBadges: ["Next.js + TS", "Docker Compose", "GitHub Actions"],
    },
    overview:
      "RetailIQ is a collaborative smart retail analytics monorepo designed to convert store camera feeds and video streams into actionable footfall, dwell-time, and inventory insights. It integrates a Next.js frontend, FastAPI backend, YOLO11n object detection, ByteTrack customer tracking, async PostgreSQL persistence, Redis rate limiting, and a hybrid RAG assistant—orchestrated with Docker Compose and validated through a 170-test Pytest suite in GitHub Actions CI/CD.",
    whyIChoseThis:
      "I contributed to RetailIQ as a Frontend & DevOps Contributor to gain hands-on experience integrating a Next.js + TypeScript frontend with an AI-backed FastAPI/PostgreSQL backend, standardizing multi-service environments with Docker Compose, and automating CI/CD workflows via GitHub Actions.",
    realWorldProblem:
      "Physical retail stores generate continuous visual data from cameras, yet store teams often lack structured visibility into customer footfall, dwell time, and shelf stock levels without manual auditing.",
    problemStatement:
      "Build an end-to-end retail analytics system that processes images and videos to track customer movement and shelf inventory, persists time-series analytics reliably, protects API endpoints from abuse, and lets operators query insights safely using natural language.",
    objectives: [
      "Detect objects on retail images and videos using YOLO11n.",
      "Track individual customer trajectories across frames with ByteTrack for footfall and dwell-time analytics.",
      "Monitor shelf stock status from visual inputs.",
      "Persist structured analytics asynchronously in PostgreSQL using SQLAlchemy and Alembic.",
      "Enforce API fairness with Redis sliding-window rate limiting.",
      "Provide a hybrid RAG AI assistant (vector search + BM25) with Groq LLM fallback and prompt-injection guardrails.",
      "Automate validation and delivery with a 170-test Pytest suite, Docker Compose, GitHub Actions CI/CD, and MLOps checks.",
    ],
    proposedSolution:
      "A unified monorepo separating the Next.js analytics interface from the FastAPI inference and API service. Visual inputs pass through YOLO11n and ByteTrack to extract footfall, dwell time, and shelf stock metrics into async PostgreSQL, while the query layer combines vector search and BM25 retrieval with guarded Groq LLM synthesis.",
    architectureSummary:
      "Client requests from Next.js hit FastAPI protected by Redis sliding-window rate limiting. Computer vision tasks run YOLO11n + ByteTrack and write structured records via async SQLAlchemy + Alembic to PostgreSQL. The AI assistant executes hybrid vector + BM25 retrieval with prompt-injection guardrails and Groq LLM fallback, all orchestrated with Docker Compose and validated by GitHub Actions and MLOps drift/registry checks.",
    architectureNodes: [
      {
        id: "client",
        label: "Next.js Dashboard",
        sublabel: "Analytics UI & Query Interface",
        layer: "client",
      },
      {
        id: "api",
        label: "FastAPI + Redis",
        sublabel: "REST API & Sliding-Window Rate Limiter",
        layer: "api",
      },
      {
        id: "cv",
        label: "YOLO11n + ByteTrack",
        sublabel: "Object Detection, Tracking & Shelf Stock",
        layer: "intelligence",
      },
      {
        id: "rag",
        label: "Hybrid RAG + Groq",
        sublabel: "Vector Search + BM25 + Guardrails",
        layer: "intelligence",
      },
      {
        id: "db",
        label: "PostgreSQL",
        sublabel: "Async SQLAlchemy + Alembic Migrations",
        layer: "data",
      },
      {
        id: "ops",
        label: "Docker & MLOps",
        sublabel: "Compose, GitHub Actions, 170 Pytest Tests",
        layer: "ops",
      },
    ],
    architectureFlows: [
      {
        from: "Next.js Dashboard",
        to: "FastAPI + Redis",
        label: "Rate-limited API requests",
      },
      {
        from: "FastAPI + Redis",
        to: "YOLO11n + ByteTrack",
        label: "Image & video inference",
      },
      {
        from: "YOLO11n + ByteTrack",
        to: "PostgreSQL",
        label: "Async footfall, dwell & stock writes",
      },
      {
        from: "FastAPI + Redis",
        to: "Hybrid RAG + Groq",
        label: "Guarded NL queries",
      },
    ],
    contributions: [
      "Role: Frontend & DevOps Contributor on a collaborative monorepo (GitHub: SGGGokul/Smart-Retail; core computer vision models developed by team members).",
      "Frontend Engineering: Architected and built the responsive Next.js + TypeScript analytics dashboard, visualizing real-time customer footfall, dwell-time distributions, and shelf inventory metrics.",
      "Containerization: Engineered Docker container configurations and multi-service Docker Compose orchestration coordinating the Next.js frontend, FastAPI backend, PostgreSQL, and Redis.",
      "CI/CD Pipeline Engineering: Designed and implemented automated GitHub Actions workflows running linting, type checks, and the complete 170-test Pytest suite on pull requests.",
      "Full-Stack Integration: Connected frontend state management with asynchronous FastAPI endpoints, handling streaming video analytics updates and query responses.",
    ],
    importantFeatures: [
      "Customer footfall and dwell-time analytics across video frames via ByteTrack",
      "YOLO11n object detection for person detection and shelf stock monitoring",
      "Interactive Next.js + TypeScript dashboard with live metrics and historical trends",
      "Asynchronous PostgreSQL persistence with SQLAlchemy and Alembic schema migrations",
      "Redis sliding-window rate limiting protecting API endpoints from abuse",
      "Hybrid RAG assistant (ChromaDB vector search + BM25 keyword search) with Groq LLM fallback",
      "Prompt-injection guardrails safeguarding store analytics queries",
      "Automated CI/CD with Docker Compose and a comprehensive 170-test Pytest test suite",
    ],
    developmentWorkflow: [
      "Monorepo service composition managed locally with Docker Compose.",
      "Database schema evolution tracked through Alembic migrations.",
      "Automated verification via a 170-test Pytest suite.",
      "Continuous integration and deployment automated with GitHub Actions.",
      "MLOps lifecycle checks covering dataset validation, model registry, and drift monitoring.",
    ],
    technicalChallenges: [
      "Tracking customer journeys across continuous video frames to compute genuine dwell times without duplicate counting from detection flicker.",
      "Ensuring multi-service orchestration across Next.js, FastAPI, PostgreSQL, and Redis runs identically in local development and automated CI environments.",
      "Handling asynchronous database writes for high-frequency detection events without degrading API response times.",
      "Guarding natural-language store queries against prompt-injection attacks while maintaining high retrieval precision.",
    ],
    howISolvedChallenges: [
      "Paired YOLO11n detections with ByteTrack to associate bounding boxes across frames using motion similarity and Kalman filtering, maintaining persistent tracking IDs for dwell-time calculations (single-camera tracking scope).",
      "Standardized service configurations with Docker Compose and created reproducible GitHub Actions CI pipelines executing the full 170-test Pytest suite.",
      "Engineered asynchronous SQLAlchemy sessions and Alembic migrations in FastAPI to write footfall and inventory events non-blockingly to PostgreSQL.",
      "Implemented a hybrid RAG architecture combining dense vector embeddings with BM25 sparse keyword retrieval, sanitized by prompt-injection guardrails and Groq LLM fallback.",
    ],
    screenshotNote:
      "Interactive system architecture and video analytics pipeline visualization shown above. Details the multi-service flow from YOLO11n detection and ByteTrack tracking through FastAPI, async PostgreSQL, and the Next.js dashboard.",
    resultsAndLimitations: {
      implemented: [
        "Collaborative multi-service monorepo integrating Next.js + TypeScript frontend, FastAPI backend, async PostgreSQL (SQLAlchemy + Alembic), and Redis rate limiting.",
        "Containerized local and CI orchestration via Docker Compose and GitHub Actions, verified by a 170-test Pytest suite.",
        "Computer vision pipeline (YOLO11n + ByteTrack) and hybrid RAG (vector search + BM25 + Groq fallback) integrated with the analytics web UI.",
      ],
      limitations: [
        "Designed for local and edge deployments via Docker Compose; does not maintain a permanent public cloud demo instance.",
        "Object tracking is performed on single-camera video streams using ByteTrack; cross-camera re-identification (Re-ID across disjoint camera views) is outside the current project scope.",
      ],
    },
    whatILearned: [
      "How to cleanly architect a Next.js + TypeScript dashboard interfacing with high-throughput asynchronous FastAPI and PostgreSQL backends.",
      "Standardizing complex multi-container microservices with Docker Compose to eliminate environment discrepancies between development and CI.",
      "Building resilient GitHub Actions CI/CD automation enforcing strict testing standards (170 Pytest tests) before code integration.",
      "Understanding the operational realities of computer vision pipelines, including frame association and dwell-time calculation boundaries.",
    ],
  },
  {
    slug: "cintic",
    number: "03",
    name: "CinTic",
    tagline: "Intelligent Cinema Ticket Booking System",
    category: "Full Stack · Concurrency · Algorithms",
    oneLineDescription:
      "Cinema ticket booking platform solving seat-stranding and double-booking race conditions with Vision IQ geometric recommendations, dynamic pricing, and atomic MongoDB reservations.",
    contributionSummary:
      "Full-stack implementation: Node.js/MongoDB backend, Vision IQ seat-scoring & anti-stranding engine, atomic reservations, JWT RBAC, and revenue analytics.",
    technologies: ["Node.js", "MongoDB", "JWT", "HTML", "CSS", "JavaScript"],
    live: "https://cintic.vercel.app/",
    github: "https://github.com/b-Sakthi/sead",
    githubNote: "Official GitHub repository for CinTic.",
    visualTheme: {
      accentLabel: "Vision IQ + Atomic Booking",
      metricBadges: ["Geometric Scoring", "Anti-Stranding", "Atomic MongoDB"],
    },
    overview:
      "CinTic is a full-stack movie ticket booking platform built with Node.js, MongoDB, JWT authentication, and a responsive HTML/CSS/JavaScript frontend. Its centerpiece is the Vision IQ seat recommendation engine, paired with dynamic pricing, atomic seat reservations, and a role-based admin dashboard with revenue analytics.",
    whyIChoseThis:
      "I chose CinTic to tackle two classic engineering problems in ticketing systems: algorithmic seat selection that avoids awkward single-seat gaps, and race-condition-free concurrency when multiple users book the same seats simultaneously.",
    realWorldProblem:
      "Standard cinema booking interfaces leave users manually scanning seat maps and often create orphaned single seats that cannot be sold to pairs or groups, while concurrent checkouts risk double-booking.",
    problemStatement:
      "Design a ticket booking platform that recommends optimal seats for individuals and groups, prevents seat stranding, adjusts pricing dynamically, enforces role-based access, and guarantees atomic seat reservations under concurrent requests.",
    objectives: [
      "Build Vision IQ, a seat recommendation engine using geometric scoring and group optimization.",
      "Incorporate anti-seat-stranding heuristics to minimize unbookable single-seat gaps.",
      "Support dynamic pricing across shows/seats.",
      "Guarantee conflict-free concurrent seat reservations using MongoDB atomic operations.",
      "Secure user and admin flows with JWT authentication and role-based access control.",
      "Provide an admin dashboard with revenue analytics.",
    ],
    proposedSolution:
      "A Node.js backend backed by MongoDB atomic update operations for reservation integrity, paired with the Vision IQ scoring algorithm and a role-based admin analytics interface.",
    architectureSummary:
      "The HTML/CSS/JavaScript client communicates with Node.js REST endpoints authenticated via JWT. Seat selection queries invoke the Vision IQ engine (geometric scoring, group optimization, anti-seat-stranding heuristics) and dynamic pricing logic, while final bookings execute MongoDB atomic operations to lock seats safely. Admin users access role-gated revenue analytics.",
    architectureNodes: [
      {
        id: "client",
        label: "Booking & Admin UI",
        sublabel: "HTML, CSS, JavaScript Client",
        layer: "client",
      },
      {
        id: "api",
        label: "Node.js API + JWT",
        sublabel: "Auth & Role-Based Access Control",
        layer: "api",
      },
      {
        id: "visioniq",
        label: "Vision IQ Engine",
        sublabel: "Geometric Scoring & Anti-Stranding",
        layer: "intelligence",
      },
      {
        id: "pricing",
        label: "Pricing & Analytics",
        sublabel: "Dynamic Pricing & Revenue Aggregation",
        layer: "intelligence",
      },
      {
        id: "db",
        label: "MongoDB",
        sublabel: "Atomic Seat Reservation Operations",
        layer: "data",
      },
    ],
    architectureFlows: [
      {
        from: "Booking & Admin UI",
        to: "Node.js API + JWT",
        label: "Authenticated booking & admin requests",
      },
      {
        from: "Node.js API + JWT",
        to: "Vision IQ Engine",
        label: "Group size & auditorium layout",
      },
      {
        from: "Node.js API + JWT",
        to: "MongoDB",
        label: "Atomic seat lock & reservation write",
      },
      {
        from: "Pricing & Analytics",
        to: "Booking & Admin UI",
        label: "Dynamic fares & revenue metrics",
      },
    ],
    contributions: [
      "Built the end-to-end movie ticket booking platform in Node.js, MongoDB, HTML, CSS, and JavaScript.",
      "Designed and implemented the Vision IQ seat recommendation engine with geometric scoring, group optimization, and anti-seat-stranding heuristics.",
      "Implemented dynamic pricing logic and a role-based admin dashboard with revenue analytics.",
      "Secured user and admin routes using JWT authentication.",
      "Implemented MongoDB atomic operations to prevent race conditions during concurrent seat reservations.",
    ],
    importantFeatures: [
      "Vision IQ seat recommendation engine",
      "Geometric scoring for optimal viewing positions",
      "Group optimization for multi-seat bookings",
      "Anti-seat-stranding heuristics",
      "Dynamic pricing",
      "JWT authentication and role-based admin dashboard",
      "Revenue analytics",
      "MongoDB atomic operations for concurrent seat reservations",
    ],
    developmentWorkflow: [
      "Iterative backend endpoint development in Node.js with MongoDB schema modeling.",
      "Algorithmic tuning of Vision IQ scoring weights and anti-stranding rules.",
      "Role-based access verification for customer and admin workflows.",
    ],
    technicalChallenges: [
      "Preventing double-bookings when multiple users attempt to reserve the same seat at the exact same moment.",
      "Balancing optimal viewing geometry against the risk of leaving isolated single seats in a row.",
      "Ensuring administrative revenue analytics remain strictly isolated from standard user sessions.",
    ],
    howISolvedChallenges: [
      "Used MongoDB atomic operations so seat availability checks and reservation updates execute as a single indivisible operation.",
      "Combined geometric scoring with group optimization and anti-seat-stranding heuristics inside Vision IQ to penalize layouts that orphan single seats.",
      "Enforced JWT authentication with role-based authorization checks guarding the admin dashboard and revenue analytics endpoints.",
    ],
    screenshotNote:
      "Interactive seat-map recommendation and system architecture diagram shown above. Illustrates the dynamic pricing engine, JWT role-based access control, and atomic MongoDB reservation flow.",
    resultsAndLimitations: {
      implemented: [
        "Full-stack cinema booking flow deployed on Vercel with JWT role-based auth, atomic MongoDB seat reservations, and Vision IQ seat recommendations.",
        "Dynamic pricing and admin revenue analytics separated behind admin-only routes.",
      ],
      limitations: [
        "Architected as a full-stack portfolio system; uses atomic reservation locks rather than an external commercial payment gateway or theater POS integration.",
        "Single-region database deployment; multi-region active-active replication is outside the project scope.",
      ],
    },
    whatILearned: [
      "How database-level atomic operations eliminate race conditions without heavy application-level locking.",
      "Designing practical heuristics (geometric scoring + anti-stranding) that improve both user experience and seat inventory utilization.",
      "Implementing clean role-based access boundaries with JWT.",
    ],
  },
  {
    slug: "smart-water-hydro",
    number: "04",
    name: "Smart Water Hydro System",
    tagline: "IoT Full-Stack Dashboard",
    category: "Cloud · IoT · Real-Time Systems",
    oneLineDescription:
      "IoT water monitoring platform replacing manual polling with a containerized Python REST API on GCP Cloud Run, Supabase real-time sync, and a live JavaScript dashboard.",
    contributionSummary:
      "Full-stack cloud & IoT pipeline: Dockerized Python REST API on GCP Cloud Run, Supabase sync, JavaScript dashboard, and automated CI/CD.",
    technologies: ["Python", "GCP Cloud Run", "Supabase", "Docker", "JavaScript"],
    github: "https://github.com/b-Sakthi/haloo",
    githubNote: "Official GitHub repository for Smart Water Hydro System.",
    visualTheme: {
      accentLabel: "Cloud Run + Real-Time IoT",
      metricBadges: ["GCP Cloud Run", "Docker", "Supabase Sync"],
    },
    overview:
      "Smart Water Hydro System is an IoT full-stack monitoring platform that connects a containerized Python REST API deployed on Google Cloud Run with Supabase real-time cloud database synchronization and a live JavaScript visualization dashboard, delivered via automated CI/CD deployments.",
    whyIChoseThis:
      "I chose this project to gain hands-on experience running containerized Python backends on serverless cloud infrastructure (GCP Cloud Run) and streaming live IoT telemetry into a responsive web dashboard.",
    realWorldProblem:
      "Hydro and water monitoring setups require continuous visibility into sensor readings; polling-heavy or manually deployed backends struggle to stay reliable and up to date.",
    problemStatement:
      "Build a cloud-hosted IoT telemetry pipeline that ingests sensor readings via a Python REST API, synchronizes state in real time to a cloud database, visualizes live data in a JavaScript dashboard, and deploys automatically.",
    objectives: [
      "Develop a Python REST API for ingesting and serving water/hydro sensor data.",
      "Containerize the backend with Docker for consistent execution.",
      "Deploy the containerized service serverlessly on GCP Cloud Run.",
      "Synchronize telemetry in real time using Supabase.",
      "Build a JavaScript dashboard for live sensor data visualization.",
      "Automate deployments through a CI/CD pipeline.",
    ],
    proposedSolution:
      "A Docker-containerized Python REST service running on GCP Cloud Run that writes to Supabase for real-time cloud synchronization, consumed by a lightweight JavaScript dashboard for live sensor visualization, with CI/CD handling automated builds and deployments.",
    architectureSummary:
      "Sensor telemetry enters the Python REST API packaged in Docker and hosted on GCP Cloud Run. The backend persists and synchronizes readings with Supabase's real-time cloud database, which updates the JavaScript live visualization dashboard. Code changes flow through automated CI/CD deployments.",
    architectureNodes: [
      {
        id: "sensors",
        label: "IoT Sensor Input",
        sublabel: "Telemetry Payloads",
        layer: "client",
      },
      {
        id: "cloudrun",
        label: "Python REST API",
        sublabel: "Docker Container on GCP Cloud Run",
        layer: "api",
      },
      {
        id: "supabase",
        label: "Supabase Cloud DB",
        sublabel: "Real-Time Database Synchronization",
        layer: "data",
      },
      {
        id: "dashboard",
        label: "JS Live Dashboard",
        sublabel: "Real-Time Sensor Data Visualization",
        layer: "client",
      },
      {
        id: "cicd",
        label: "CI/CD Pipeline",
        sublabel: "Automated Container Deployments",
        layer: "ops",
      },
    ],
    architectureFlows: [
      {
        from: "IoT Sensor Input",
        to: "Python REST API",
        label: "REST telemetry ingestion",
      },
      {
        from: "Python REST API",
        to: "Supabase Cloud DB",
        label: "Persisted sensor state",
      },
      {
        from: "Supabase Cloud DB",
        to: "JS Live Dashboard",
        label: "Real-time cloud sync",
      },
      {
        from: "CI/CD Pipeline",
        to: "Python REST API",
        label: "Automated Cloud Run deploys",
      },
    ],
    contributions: [
      "Built the Python REST API backend and containerized it with Docker.",
      "Deployed the containerized backend to GCP Cloud Run.",
      "Integrated Supabase real-time cloud database synchronization.",
      "Created the JavaScript dashboard for live sensor data visualization.",
      "Configured automated deployments through CI/CD.",
    ],
    importantFeatures: [
      "Python REST API backend",
      "Docker containerization",
      "Serverless deployment on GCP Cloud Run",
      "Supabase real-time cloud database synchronization",
      "JavaScript dashboard for live sensor data visualization",
      "Automated deployments through CI/CD",
    ],
    developmentWorkflow: [
      "Local container builds and API verification with Docker.",
      "Automated build and deployment pipeline targeting GCP Cloud Run.",
      "Real-time database sync verification between Python API and JavaScript dashboard.",
    ],
    technicalChallenges: [
      "Ensuring the Python backend runs identically from local development to serverless GCP Cloud Run.",
      "Keeping the JavaScript dashboard synchronized with incoming sensor updates without manual page refreshes.",
    ],
    howISolvedChallenges: [
      "Packaged the Python REST API in a Docker container deployed to GCP Cloud Run via automated CI/CD.",
      "Leveraged Supabase real-time cloud database synchronization so the JavaScript dashboard reflects live sensor updates immediately.",
    ],
    screenshotNote:
      "IoT telemetry and data streaming pipeline architecture shown above. Illustrates sensor data ingestion, MQTT broker dispatch, time-series persistence, and the live Next.js monitoring dashboard.",
    resultsAndLimitations: {
      implemented: [
        "Containerized Python REST API deployed to GCP Cloud Run with automated CI/CD, Supabase real-time database sync, and a live JavaScript dashboard.",
      ],
      limitations: [
        "Edge IoT firmware targets standard MQTT sensor gateways; custom PCB schematics are maintained separately from the software repository.",
        "Serverless container deployment on GCP Cloud Run uses scale-to-zero to optimize operational cost during idle telemetry periods.",
      ],
    },
    whatILearned: [
      "Packaging Python APIs in Docker for stateless, serverless execution on GCP Cloud Run.",
      "Using real-time cloud database synchronization to simplify live IoT dashboards.",
      "Setting up automated CI/CD workflows to eliminate manual deployment steps.",
    ],
  },
];

export function getProjectBySlug(slug: string): ProjectCaseStudy | undefined {
  return projects.find((project) => project.slug === slug);
}
