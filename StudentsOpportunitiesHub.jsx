import { useState, useMemo, useEffect } from "react";
import {
  Search, MapPin, Clock, GraduationCap, Wallet, ChevronRight, Bookmark,
  BookmarkCheck, Bell, User, LayoutDashboard, Shield, Rocket, Code2,
  Trophy, Award, Users2, Menu, X, ArrowUpRight, CheckCircle2, Circle,
  TrendingUp, Building2, Filter, ChevronLeft, LogOut, Lock, Mail, Eye, EyeOff,
  Sparkles, Check, Share2, ExternalLink, Calendar, Briefcase, Star, Send, Plus,
  Activity, Zap
} from "lucide-react";

/* ---------------------------------------------------------------
   AUTH HELPERS — LOCAL (BROWSER-ONLY) PROTOTYPE MODE
---------------------------------------------------------------- */
const API_BASE = "";

async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function registerUser({ name, email, password, college, department, year }) {
  const key = `strivehub_users:${email.toLowerCase()}`;
  if (localStorage.getItem(key) || localStorage.getItem(`internpulse_users:${email.toLowerCase()}`) || localStorage.getItem(`soh_users:${email.toLowerCase()}`)) {
    throw new Error("An account with this email already exists.");
  }
  const passwordHash = await hashPassword(password);
  const user = { name, email: email.toLowerCase(), passwordHash, college, department, year, createdAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(user));
  localStorage.setItem("strivehub_session", email.toLowerCase());
  return user;
}

async function loginUser({ email, password }) {
  const key = `strivehub_users:${email.toLowerCase()}`;
  const legacyKey1 = `internpulse_users:${email.toLowerCase()}`;
  const legacyKey2 = `soh_users:${email.toLowerCase()}`;
  const raw = localStorage.getItem(key) || localStorage.getItem(legacyKey1) || localStorage.getItem(legacyKey2);
  if (!raw) throw new Error("No account found with this email.");
  const user = JSON.parse(raw);
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) throw new Error("Incorrect password.");
  localStorage.setItem("strivehub_session", email.toLowerCase());
  return user;
}

async function getSessionUser() {
  const email = localStorage.getItem("strivehub_session") || localStorage.getItem("internpulse_session") || localStorage.getItem("soh_session");
  if (!email) return null;
  const raw = localStorage.getItem(`strivehub_users:${email}`) || localStorage.getItem(`internpulse_users:${email}`) || localStorage.getItem(`soh_users:${email}`);
  return raw ? JSON.parse(raw) : null;
}

async function logoutUser() {
  localStorage.removeItem("strivehub_session");
  localStorage.removeItem("internpulse_session");
  localStorage.removeItem("soh_session");
}

/* ---------------------------------------------------------------
   CATEGORIES DATA
---------------------------------------------------------------- */
const CATEGORIES = [
  {
    id: "internships",
    name: "Internships",
    icon: Rocket,
    desc: "Summer & winter tech, research and product internships.",
    count: 214,
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textLight: "text-emerald-700",
    borderLight: "border-emerald-200/80",
  },
  {
    id: "jobs",
    name: "Jobs & Placements",
    icon: Building2,
    desc: "Fresher hiring, graduate engineer roles and campus placements.",
    count: 96,
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    textLight: "text-blue-700",
    borderLight: "border-blue-200/80",
  },
  {
    id: "hackathons",
    name: "Hackathons",
    icon: Code2,
    desc: "AI sprints, Web3 buildathons and 48-hour innovation challenges.",
    count: 41,
    gradient: "from-purple-500 to-violet-600",
    bgLight: "bg-purple-50",
    textLight: "text-purple-700",
    borderLight: "border-purple-200/80",
  },
  {
    id: "competitions",
    name: "Competitions",
    icon: Trophy,
    desc: "Coding arenas, UI/UX sprints and case study competitions.",
    count: 58,
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    textLight: "text-amber-700",
    borderLight: "border-amber-200/80",
  },
  {
    id: "scholarships",
    name: "Scholarships",
    icon: GraduationCap,
    desc: "Merit awards, need-based funds and research fellowships.",
    count: 73,
    gradient: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50",
    textLight: "text-rose-700",
    borderLight: "border-rose-200/80",
  },
  {
    id: "courses",
    name: "Certifications",
    icon: Award,
    desc: "Industry-recognized cloud, AI, and cybersecurity courses.",
    count: 130,
    gradient: "from-cyan-500 to-blue-600",
    bgLight: "bg-cyan-50",
    textLight: "text-cyan-700",
    borderLight: "border-cyan-200/80",
  },
  {
    id: "workshops",
    name: "Workshops & Events",
    icon: Users2,
    desc: "Hands-on tech bootcamps, guest webinars and developer meetups.",
    count: 39,
    gradient: "from-indigo-500 to-purple-600",
    bgLight: "bg-indigo-50",
    textLight: "text-indigo-700",
    borderLight: "border-indigo-200/80",
  },
];

/* ---------------------------------------------------------------
   OPPORTUNITIES DATA
---------------------------------------------------------------- */
const INITIAL_OPPS = [
  {
    id: 1,
    title: "Cybersecurity & Threat Defense Intern",
    org: "ABC Technologies",
    verified: true,
    category: "internships",
    location: "Remote",
    mode: "Online",
    deadline: "2026-09-15",
    stipend: "₹15,000/mo",
    skills: ["Python", "Linux", "Networking", "Wireshark"],
    eligibility: "B.E/B.Tech CSE, IT, Cybersecurity",
    desc: "Collaborate with the security operations center (SOC) team on real-time threat analysis, network traffic auditing, and automated triage scripts for cloud workloads.",
    applied: false
  },
  {
    id: 2,
    title: "Frontend Engineering Intern (React & Tailwind)",
    org: "Nimbus Labs",
    verified: true,
    category: "internships",
    location: "Bengaluru",
    mode: "Hybrid",
    deadline: "2026-09-10",
    stipend: "₹20,000/mo",
    skills: ["React", "CSS", "JavaScript", "TypeScript"],
    eligibility: "UG 2nd/3rd/4th Year students",
    desc: "Ship user-facing features on our production SaaS analytics product. You will work closely with senior designers and engineers on responsive interfaces and data charts.",
    applied: false
  },
  {
    id: 3,
    title: "Graduate Software Engineer (Backend)",
    org: "Meridian Systems",
    verified: true,
    category: "jobs",
    location: "Pune",
    mode: "On-site",
    deadline: "2026-09-30",
    stipend: "₹8,50,000/yr",
    skills: ["Java", "SQL", "DSA", "Spring Boot"],
    eligibility: "Final year / 2026 Graduates",
    desc: "Full-time role engineering microservices, caching pipelines, and transactional databases for a high-frequency supply chain network across 12 countries.",
    applied: false
  },
  {
    id: 4,
    title: "AI for Humanity Global Hackathon",
    org: "OpenSpark Foundation",
    verified: true,
    category: "hackathons",
    location: "Global / Online",
    mode: "Online",
    deadline: "2026-09-20",
    stipend: "₹2,50,000 pool",
    skills: ["Machine Learning", "Python", "LLMs", "FastAPI"],
    eligibility: "Open to all enrolled college students",
    desc: "48-hour global sprint to design AI-driven prototypes solving climate resilience, disaster management, and medical diagnostics for underserved communities.",
    applied: false
  },
  {
    id: 5,
    title: "National Student Algorithm Sprint",
    org: "CodeArena",
    verified: false,
    category: "competitions",
    location: "Online",
    mode: "Online",
    deadline: "2026-09-12",
    stipend: "₹75,000 pool",
    skills: ["DSA", "C++", "Python", "Algorithms"],
    eligibility: "Open to all undergraduates",
    desc: "Three rounds of timed algorithmic problem solving with live leaderboards, mentorship from tech giants, and direct interview invites for top 20 rankers.",
    applied: false
  },
  {
    id: 6,
    title: "Merit Fellowship for Future Engineers",
    org: "National Education Trust",
    verified: true,
    category: "scholarships",
    location: "India-wide",
    mode: "Merit-based",
    deadline: "2026-10-05",
    stipend: "₹1,00,000/yr",
    skills: ["Research", "Academics", "Innovation"],
    eligibility: "Engineering UG students, 8.5+ CGPA",
    desc: "Prestigious annual grant covering full tuition, hardware allowance, and conference travel grants for promising technology innovators.",
    applied: false
  },
  {
    id: 7,
    title: "AWS Cloud Architect Certification Track",
    org: "SkillForge Academy",
    verified: true,
    category: "courses",
    location: "Self-Paced",
    mode: "Online",
    deadline: "Rolling",
    stipend: "100% Free",
    skills: ["AWS", "Cloud", "Docker", "DevOps"],
    eligibility: "All students & recent grads",
    desc: "Comprehensive masterclass with hands-on AWS lab vouchers, architecture challenges, and official exam preparation leading to practitioner accreditation.",
    applied: false
  },
  {
    id: 8,
    title: "Full-Stack Design Systems Sprint",
    org: "Design Collective",
    verified: false,
    category: "workshops",
    location: "Remote",
    mode: "Online",
    deadline: "2026-09-14",
    stipend: "Free with Certificate",
    skills: ["Figma", "UI/UX", "Tailwind CSS"],
    eligibility: "Design & tech enthusiasts",
    desc: "Intensive weekend workshop covering token systems, component libraries in Figma, and bridging the handoff from design to React production components.",
    applied: false
  },
  {
    id: 9,
    title: "Data Science & Predictive Analytics Intern",
    org: "Quantiva Analytics",
    verified: true,
    category: "internships",
    location: "Hyderabad",
    mode: "Hybrid",
    deadline: "2026-09-25",
    stipend: "₹22,000/mo",
    skills: ["Python", "SQL", "Machine Learning", "Pandas"],
    eligibility: "B.Tech / M.Sc, 3rd year & above",
    desc: "Build automated predictive models for retail demand forecasting, analyze big data lakes, and deploy machine learning APIs in collaboration with staff scientists.",
    applied: false
  },
  {
    id: 10,
    title: "Smart Hardware & Embedded IoT Sprint",
    org: "CircuitWorks Labs",
    verified: true,
    category: "competitions",
    location: "Chennai",
    mode: "On-site Finals",
    deadline: "2026-09-18",
    stipend: "₹50,000 pool",
    skills: ["Embedded Systems", "PCB Design", "Arduino", "C"],
    eligibility: "ECE, EEE, Robotics students",
    desc: "Prototype smart physical devices addressing real industrial sensor automation problems with provided microcontroller developer hardware kits.",
    applied: false
  },
];

const STUDENT = {
  name: "Aisha Khan",
  department: "Computer Science & Engineering",
  year: "3rd Year",
  skills: ["Python", "Linux", "Networking", "React", "TypeScript"],
  interests: ["Cybersecurity", "Frontend Engineering", "Hackathons"],
  goal: "Full-Stack Security Specialist",
  college: "National Institute of Technology"
};

function matchScore(opp, user = null) {
  const userSkills = user?.skills || STUDENT.skills;
  const overlap = opp.skills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase())).length;
  const interestHit = (opp.title.toLowerCase().includes("security") || opp.title.toLowerCase().includes("react") || opp.category === "internships");
  const base = 62 + overlap * 11 + (interestHit ? 9 : 0);
  return Math.min(99, base);
}

function daysUntil(dateStr) {
  if (dateStr === "Rolling") return null;
  const target = new Date(dateStr);
  const now = new Date("2026-09-08");
  const diff = Math.ceil((target - now) / 86400000);
  return diff;
}

/* ---------------------------------------------------------------
   OPPORTUNITY CARD ATOM
---------------------------------------------------------------- */
function OppCard({ opp, saved, onToggleSave, onOpen, user }) {
  const d = daysUntil(opp.deadline);
  const isUrgent = d !== null && d <= 5;
  const score = matchScore(opp, user);

  // Generate initial monogram
  const initial = opp.org ? opp.org[0].toUpperCase() : "O";
  const avatarGradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-purple-500 to-violet-600",
    "from-rose-500 to-pink-600",
  ];
  const gradientClass = avatarGradients[opp.id % avatarGradients.length];

  return (
    <div
      onClick={() => onOpen(opp)}
      className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-amber-400/80 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top bar: Company Avatar, Title, Save */}
        <div className="flex items-start justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors text-sm sm:text-base leading-snug line-clamp-1">
                {opp.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs font-medium text-slate-600 truncate max-w-[130px] sm:max-w-none">{opp.org}</span>
                {opp.verified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(opp.id);
            }}
            aria-label="Save opportunity"
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 active:scale-95 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
          >
            {saved ? (
              <BookmarkCheck size={20} className="text-amber-500 fill-amber-500" />
            ) : (
              <Bookmark size={20} />
            )}
          </button>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
          {opp.desc}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mt-3.5 text-xs text-slate-600 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{opp.location} · {opp.mode}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-800 truncate">
            <Wallet size={13} className="text-emerald-500 shrink-0" />
            <span className="truncate">{opp.stipend}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:col-span-2 truncate">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">
              {opp.deadline === "Rolling" ? "Rolling Applications" : `Deadline: ${opp.deadline}`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Skills & Badges */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {opp.skills.slice(0, 2).map((s) => (
            <span key={s} className="text-[10px] sm:text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
              {s}
            </span>
          ))}
          {opp.skills.length > 2 && (
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">+{opp.skills.length - 2}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isUrgent ? (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
              <Clock size={11} /> {d}d left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles size={11} /> {score}% match
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   MAIN NAVBAR — STRIVEHUB
---------------------------------------------------------------- */
function NavBar({ view, setView, mobileOpen, setMobileOpen, currentUser, onLogout, savedCount, applicationsCount }) {
  const links = [
    { id: "home", label: "Explore" },
    { id: "dashboard", label: "My Dashboard" },
    { id: "admin", label: "Admin" },
  ];
  const initial = currentUser?.name?.[0]?.toUpperCase() || "S";

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* StriveHub Logo */}
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Activity size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                Strive<span className="text-amber-400">Hub</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" title="Live Pulse" />
            </div>
            <span className="text-[9px] sm:text-[10px] block -mt-1 font-medium text-amber-400/90 tracking-wider uppercase">
              Opportunity Radar
            </span>
          </div>
        </button>

        {/* Laptop / Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-full border border-slate-700/60">
          {links.map((l) => {
            const isActive = view === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setView(l.id)}
                className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </nav>

        {/* User / CTA Area for Laptop */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-slate-800/60 pl-3 pr-1.5 py-1 rounded-full border border-slate-700">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-amber-400">
                  {savedCount} saved · {applicationsCount} applied
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow">
                {initial}
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-full transition-colors ml-0.5"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("login")}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => setView("register")}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                Join StriveHub
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {currentUser && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow">
              {initial}
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-5 pt-2 border-t border-slate-800 space-y-1 bg-slate-900/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          {currentUser && (
            <div className="p-3 mb-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white leading-tight">{currentUser.name}</p>
                <p className="text-xs text-amber-400 mt-0.5">{savedCount} saved · {applicationsCount} applications</p>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileOpen(false);
                }}
                className="text-xs text-rose-400 font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 active:scale-95"
              >
                Log Out
              </button>
            </div>
          )}

          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setView(l.id);
                setMobileOpen(false);
              }}
              className={`w-full text-left text-sm px-4 py-3 rounded-xl font-semibold flex items-center justify-between min-h-[44px] ${
                view === l.id
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:bg-slate-800 active:bg-slate-800"
              }`}
            >
              <span>{l.label}</span>
              <ChevronRight size={16} />
            </button>
          ))}

          {!currentUser && (
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 mt-3">
              <button
                onClick={() => {
                  setView("login");
                  setMobileOpen(false);
                }}
                className="text-xs font-bold py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center min-h-[44px]"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setView("register");
                  setMobileOpen(false);
                }}
                className="text-xs font-bold py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-center min-h-[44px] shadow"
              >
                Join StriveHub
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

/* ---------------------------------------------------------------
   HERO & HOME VIEW — STRIVEHUB
---------------------------------------------------------------- */
function Home({ setView, query, setQuery, onSelectCategory }) {
  const quickTags = [
    { label: "🚀 React & Web Dev", val: "React" },
    { label: "🤖 AI & Machine Learning", val: "Machine Learning" },
    { label: "🔒 Cybersecurity", val: "Python" },
    { label: "💰 High Stipend", val: "15,000" },
    { label: "🏆 Hackathons", val: "Hackathon" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-10 sm:pt-16 pb-14 sm:pb-20 px-4 sm:px-6">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[250px] sm:h-[350px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-5 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-400 text-[11px] sm:text-xs font-semibold shadow-inner mb-4 sm:mb-6">
            <Activity size={13} className="text-amber-400 shrink-0 animate-pulse" />
            <span>StriveHub — 650+ Live Student Opportunities</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] px-1">
            Launch Your Career. <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Feel The Pulse.
            </span>
          </h1>

          <p className="mt-3.5 sm:mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed px-2">
            The real-time opportunity radar for ambitious college students. Discover verified tech internships, paid research, nationwide hackathons, and scholarships matched directly to your skills.
          </p>

          {/* Search Bar Container */}
          <div className="mt-6 sm:mt-8 max-w-2xl mx-auto bg-slate-800/95 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2.5 px-3 flex-1 min-h-[44px]">
              <Search size={19} className="text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setView("opportunities");
                }}
                placeholder="Search internships, companies, or skills..."
                className="w-full bg-transparent text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none py-2"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setView("opportunities")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Explore Pulse</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          {/* Quick Filter Tags (Swipeable on Mobile) */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center text-xs text-slate-400">
            <span className="font-medium text-slate-500 shrink-0">Popular:</span>
            {quickTags.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setQuery(t.val);
                  setView("opportunities");
                }}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-xs shrink-0 whitespace-nowrap active:scale-95"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-800/80 max-w-3xl mx-auto">
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-amber-400">650+</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Active Openings</p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-white">₹25L+</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Grants & Prizes</p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">96%</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Verified Posters</p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-blue-400">4,800+</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Students Placed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Browse by Track
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Explore Opportunities Tailored For You
            </h2>
          </div>
          <button
            onClick={() => setView("opportunities")}
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-600 flex items-center gap-1 transition-colors self-start"
          >
            View all 650+ openings <ChevronRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                onClick={() => {
                  onSelectCategory(c.id);
                  setView("opportunities");
                }}
                className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${c.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.bgLight} ${c.textLight} border ${c.borderLight}`}>
                      {c.count} open
                    </span>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-4 group-hover:text-amber-600 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {c.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                    Explore track
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center text-slate-600 transition-colors">
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Section Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-12 text-white border border-slate-800 shadow-2xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 mb-3 sm:mb-4">
              <Activity size={13} className="text-amber-400 animate-pulse" /> StriveHub Match Engine
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Get Notified When Perfect Matches Drop
            </h2>
            <p className="mt-2.5 sm:mt-3 text-slate-300 text-xs sm:text-base leading-relaxed">
              Create your profile with your degree, tech stack, and career targets. StriveHub calculates match percentage in real-time and surfaces high-value opportunities.
            </p>
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setView("dashboard")}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 text-center min-h-[44px]"
              >
                Set Up My Dashboard
              </button>
              <button
                onClick={() => setView("opportunities")}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-colors text-center min-h-[44px]"
              >
                Browse Without Sign In
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------
   OPPORTUNITIES BOARD VIEW
---------------------------------------------------------------- */
function Opportunities({ query, setQuery, saved, toggleSave, onOpen, category, setCategory, opps, user }) {
  const [sort, setSort] = useState("latest");
  const [selectedMode, setSelectedMode] = useState("all");

  const filtered = useMemo(() => {
    let list = opps.filter((o) => {
      const matchCat = category === "all" || o.category === category;
      const matchMode = selectedMode === "all" || o.mode.toLowerCase() === selectedMode.toLowerCase();
      const q = query.toLowerCase().trim();
      const matchQ =
        q === "" ||
        o.title.toLowerCase().includes(q) ||
        o.org.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        o.skills.some((s) => s.toLowerCase().includes(q));
      return matchCat && matchMode && matchQ;
    });

    if (sort === "deadline") {
      list = [...list].sort((a, b) => (daysUntil(a.deadline) ?? 999) - (daysUntil(b.deadline) ?? 999));
    } else if (sort === "recommended") {
      list = [...list].sort((a, b) => matchScore(b, user) - matchScore(a, user));
    }
    return list;
  }, [query, category, sort, selectedMode, opps, user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Opportunities Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{filtered.length}</strong> active listings verified for college students
          </p>
        </div>

        {/* Search Bar in list view */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200/90 shadow-sm w-full md:w-80 min-h-[44px]">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, orgs, skills..."
            className="w-full text-base sm:text-sm bg-transparent focus:outline-none placeholder-slate-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Category Pills & Sort Select */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mt-5 sm:mt-6">
        {/* Swipeable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar max-w-full">
          <button
            onClick={() => setCategory("all")}
            className={`text-xs font-semibold px-3.5 py-2 rounded-full transition-all shrink-0 whitespace-nowrap min-h-[38px] ${
              category === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Tracks
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-full transition-all shrink-0 whitespace-nowrap min-h-[38px] ${
                category === c.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full lg:w-auto shrink-0">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 shadow-sm focus:outline-none min-h-[40px]"
          >
            <option value="all">Mode: All</option>
            <option value="online">Online / Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="on-site">On-site</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 shadow-sm focus:outline-none min-h-[40px]"
          >
            <option value="latest">Sort: Latest</option>
            <option value="deadline">Sort: Closing Soon</option>
            <option value="recommended">Sort: Match Score</option>
          </select>
        </div>
      </div>

      {/* Grid of Opportunity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-6">
        {filtered.map((o) => (
          <OppCard
            key={o.id}
            opp={o}
            saved={saved.has(o.id)}
            onToggleSave={toggleSave}
            onOpen={onOpen}
            user={user}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3">
              <Search size={22} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No opportunities found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find anything matching your filter criteria. Try clearing search keywords or selecting "All Tracks".
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("all");
                setSelectedMode("all");
              }}
              className="mt-4 text-xs font-bold text-amber-600 hover:underline min-h-[40px]"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   OPPORTUNITY DETAIL VIEW (WITH MOBILE BOTTOM ACTION BAR)
---------------------------------------------------------------- */
function Detail({ opp, saved, toggleSave, back, onApply, applied }) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [resumeUrl, setResumeUrl] = useState("https://linkedin.com/in/student");
  const [copied, setCopied] = useState(false);

  if (!opp) return null;

  const d = daysUntil(opp.deadline);
  const similar = INITIAL_OPPS.filter((o) => o.category === opp.category && o.id !== opp.id).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormApply = (e) => {
    e.preventDefault();
    onApply(opp.id);
    setShowApplyModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-28 lg:pb-12">
      
      {/* Back button */}
      <button
        onClick={back}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-full shadow-sm mb-5 transition-colors min-h-[40px]"
      >
        <ChevronLeft size={16} /> Back to opportunities
      </button>

      {/* Main Grid: Info + Quick Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2-Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm">
            
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {opp.category}
                  </span>
                  {opp.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={12} /> Verified Organization
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 leading-tight">
                  {opp.title}
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  Posted by <strong className="text-slate-900">{opp.org}</strong>
                </p>
              </div>

              <button
                onClick={() => toggleSave(opp.id)}
                aria-label="Save bookmark"
                className="p-3 rounded-2xl bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-500 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {saved.has(opp.id) ? (
                  <BookmarkCheck size={22} className="text-amber-500 fill-amber-500" />
                ) : (
                  <Bookmark size={22} />
                )}
              </button>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                About the Opportunity
              </h2>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                {opp.desc}
              </p>
            </div>

            {/* Grid Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Location & Mode</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{opp.location} ({opp.mode})</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Stipend / Award</span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">{opp.stipend}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Eligibility Criteria</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{opp.eligibility}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Application Deadline</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {opp.deadline === "Rolling" ? "Rolling Basis" : opp.deadline}
                </p>
              </div>
            </div>

            {/* Required Skills */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Target Technologies & Skills
              </h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {opp.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1-Col: Desktop / Laptop Sticky Sidebar Card */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md sticky top-24">
            <div className="text-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400">Total Compensation / Prize</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{opp.stipend}</p>
              {d !== null && (
                <span className="inline-block mt-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  ⚠️ Closes in {d} days
                </span>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {applied ? (
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-200 flex items-center justify-center gap-2 cursor-default"
                >
                  <CheckCircle2 size={18} /> Application Submitted
                </button>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Apply Now
                </button>
              )}

              <button
                onClick={() => toggleSave(opp.id)}
                className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                {saved.has(opp.id) ? (
                  <>
                    <BookmarkCheck size={16} className="text-amber-500 fill-amber-500" />
                    Saved to Bookmarks
                  </>
                ) : (
                  <>
                    <Bookmark size={16} />
                    Save for Later
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 size={14} />
                {copied ? "Link Copied to Clipboard!" : "Share Opportunity"}
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center space-y-1">
              <p>🛡️ Zero application fees on StriveHub</p>
              <p>⚡ Direct student submission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 shadow-2xl lg:hidden flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Stipend</span>
          <p className="text-base font-black text-slate-900 leading-tight mt-0.5">{opp.stipend}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSave(opp.id)}
            aria-label="Save"
            className="p-3 rounded-xl bg-slate-100 text-slate-600 active:scale-95"
          >
            {saved.has(opp.id) ? (
              <BookmarkCheck size={18} className="text-amber-500 fill-amber-500" />
            ) : (
              <Bookmark size={18} />
            )}
          </button>

          {applied ? (
            <button
              disabled
              className="px-5 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} /> Submitted
            </button>
          ) : (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <Send size={14} /> Apply Now
            </button>
          )}
        </div>
      </div>

      {/* Similar Opportunities */}
      {similar.length > 0 && (
        <div className="mt-12 sm:mt-14 pt-8 sm:pt-10 border-t border-slate-200">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-5">
            More in {CATEGORIES.find((c) => c.id === opp.category)?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {similar.map((o) => (
              <OppCard
                key={o.id}
                opp={o}
                saved={saved.has(o.id)}
                onToggleSave={toggleSave}
                onOpen={(target) => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  back();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Interactive Quick Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase">Apply to</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{opp.title}</h3>
                <p className="text-xs text-slate-500">{opp.org}</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormApply} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume / Portfolio Link
                </label>
                <input
                  type="url"
                  required
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://github.com/..."
                  className="w-full text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quick Cover Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Briefly state why you are excited for this opportunity..."
                  className="w-full text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-800">
                ℹ️ Your student profile details will be submitted to the organization.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-bold shadow hover:brightness-110 active:scale-95 min-h-[44px]"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   STUDENT DASHBOARD
---------------------------------------------------------------- */
function Dashboard({ saved, applications, toggleApply, currentUser, opps }) {
  const recommended = useMemo(() => {
    return [...opps].sort((a, b) => matchScore(b, currentUser) - matchScore(a, currentUser)).slice(0, 3);
  }, [opps, currentUser]);

  const savedOpps = opps.filter((o) => saved.has(o.id));
  const upcoming = [...opps]
    .filter((o) => (daysUntil(o.deadline) ?? 999) <= 12)
    .sort((a, b) => (daysUntil(a.deadline) ?? 0) - (daysUntil(b.deadline) ?? 0));

  const displayName = currentUser?.name || STUDENT.name;
  const dept = currentUser?.department || STUDENT.department;
  const college = currentUser?.college || STUDENT.college;
  const year = currentUser?.year || STUDENT.year;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      
      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            {displayName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
                {displayName}
              </h1>
              <span className="text-[10px] sm:text-[11px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                Active Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {dept} · {year}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              🏫 {college}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 w-full sm:w-auto text-left sm:text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Career Target</span>
          <span className="text-xs font-semibold text-amber-400">{STUDENT.goal}</span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Send size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900">{applications.size}</p>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Applications</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <BookmarkCheck size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900">{saved.size}</p>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Bookmarks</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900">{recommended.length}</p>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">High Matches</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {upcoming.filter((o) => (daysUntil(o.deadline) ?? 99) <= 7).length}
            </p>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Due This Week</p>
          </div>
        </div>
      </div>

      {/* Main Content: Recommendations & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Left 2 Cols: Recommendations & Active Applications */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recommended Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" />
                Recommended Based On Your Profile
              </h2>
              <span className="text-xs text-slate-500">AI match scoring</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommended.map((o) => {
                const score = matchScore(o, currentUser);
                return (
                  <div
                    key={o.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {o.category}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {score}% Match
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">
                        {o.title}
                      </h3>
                      <p className="text-xs text-slate-500">{o.org} · {o.location}</p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {o.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] sm:text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700 font-bold">{o.stipend}</span>
                      <button
                        onClick={() => toggleApply(o.id)}
                        className="text-amber-600 hover:text-amber-700 font-semibold py-1 px-2 rounded-lg hover:bg-amber-50 active:scale-95"
                      >
                        {applications.has(o.id) ? "Applied ✓" : "Quick Apply →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Applications Tracker */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              My Application Tracker
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
              {opps.slice(0, 4).map((o, i) => {
                const isApplied = applications.has(o.id);
                return (
                  <div
                    key={o.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 sm:mt-0 ${
                        isApplied ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {isApplied ? "✓" : (i + 1)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{o.title}</p>
                        <p className="text-xs text-slate-500">{o.org} · {o.stipend}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isApplied
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {isApplied ? "Under Review" : "Not Applied"}
                      </span>

                      <button
                        onClick={() => toggleApply(o.id)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 min-h-[36px]"
                      >
                        {isApplied ? "Withdraw" : "Mark as Sent"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Deadlines & Saved List */}
        <div className="space-y-6">
          
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-rose-500" /> Closing Soon
            </h3>
            <div className="space-y-2.5 mt-4">
              {upcoming.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="max-w-[65%] min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{o.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{o.org}</p>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                    {daysUntil(o.deadline)}d left
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bookmarked Items */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Bookmark size={16} className="text-amber-500" /> Saved For Review ({savedOpps.length})
            </h3>
            <div className="space-y-2 mt-4">
              {savedOpps.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No bookmarks yet. Click the bookmark icon on any card to save it here.
                </p>
              ) : (
                savedOpps.map((o) => (
                  <div key={o.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{o.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{o.org}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ADMIN DASHBOARD
---------------------------------------------------------------- */
function Admin({ opps, setOpps }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newOpp, setNewOpp] = useState({
    title: "",
    org: "",
    category: "internships",
    location: "Remote",
    mode: "Online",
    deadline: "2026-09-30",
    stipend: "₹15,000/mo",
    skills: "React, Python",
    eligibility: "Open to all students",
    desc: ""
  });

  const handleAdd = (e) => {
    e.preventDefault();
    const item = {
      ...newOpp,
      id: Date.now(),
      verified: true,
      skills: newOpp.skills.split(",").map(s => s.trim()).filter(Boolean)
    };
    setOpps([item, ...opps]);
    setShowAdd(false);
  };

  const toggleVerify = (id) => {
    setOpps(opps.map(o => o.id === id ? { ...o, verified: !o.verified } : o));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield size={24} className="text-indigo-600 shrink-0" /> StriveHub Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage opportunities, verification badges, and system moderation.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 active:scale-95 min-h-[44px]"
        >
          <Plus size={16} /> Add Opportunity
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Total Opportunities</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{opps.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Verified Posters</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{opps.filter(o => o.verified).length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Active Categories</p>
          <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">{CATEGORIES.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Security Mode</p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">Live Demo</p>
        </div>
      </div>

      {/* Opps Table / List */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
          Listing Moderation
        </div>
        <div className="divide-y divide-slate-100">
          {opps.map((o) => (
            <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{o.title}</p>
                <p className="text-xs text-slate-500">{o.org} · {o.category} · {o.stipend}</p>
              </div>
              <button
                onClick={() => toggleVerify(o.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border self-start sm:self-auto min-h-[32px] ${
                  o.verified
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {o.verified ? "Verified ✓" : "Unverified"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Post New Opportunity</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                required
                placeholder="Title"
                value={newOpp.title}
                onChange={e => setNewOpp({ ...newOpp, title: e.target.value })}
                className="w-full text-base sm:text-xs p-3 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
              />
              <input
                required
                placeholder="Organization Name"
                value={newOpp.org}
                onChange={e => setNewOpp({ ...newOpp, org: e.target.value })}
                className="w-full text-base sm:text-xs p-3 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={newOpp.category}
                  onChange={e => setNewOpp({ ...newOpp, category: e.target.value })}
                  className="text-base sm:text-xs p-3 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input
                  placeholder="Stipend / Prize"
                  value={newOpp.stipend}
                  onChange={e => setNewOpp({ ...newOpp, stipend: e.target.value })}
                  className="w-full text-base sm:text-xs p-3 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                />
              </div>
              <input
                placeholder="Skills (comma-separated)"
                value={newOpp.skills}
                onChange={e => setNewOpp({ ...newOpp, skills: e.target.value })}
                className="w-full text-base sm:text-xs p-3 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
              />
              <textarea
                placeholder="Description"
                rows={2}
                value={newOpp.desc}
                onChange={e => setNewOpp({ ...newOpp, desc: e.target.value })}
                className="w-full text-base sm:text-xs p-3 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 text-xs font-semibold border rounded-xl min-h-[44px]">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-xs font-bold bg-amber-500 text-slate-950 rounded-xl shadow min-h-[44px]">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   AUTH SCREEN (LOGIN / REGISTER) — STRIVEHUB
---------------------------------------------------------------- */
function AuthScreen({ mode, setMode, onAuthed }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", college: "", department: "", year: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = mode === "register" ? await registerUser(form) : await loginUser(form);
      onAuthed(user);
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
            <Activity size={24} className="stroke-[2.5]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-4 tracking-tight">
            {mode === "register" ? "Join StriveHub" : "Welcome Back"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "register"
              ? "Set up your student portfolio to unlock live opportunity matching."
              : "Sign in to access your saved bookmarks and applications."}
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3 mt-6">
          {mode === "register" && (
            <>
              <div>
                <input
                  required
                  placeholder="Full Name (e.g. Aisha Khan)"
                  value={form.name}
                  onChange={update("name")}
                  className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  placeholder="College Name"
                  value={form.college}
                  onChange={update("college")}
                  className="w-full text-base sm:text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
                <input
                  placeholder="Department (e.g. CSE)"
                  value={form.department}
                  onChange={update("department")}
                  className="w-full text-base sm:text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>
              <div>
                <input
                  placeholder="Current Year (e.g. 3rd Year)"
                  value={form.year}
                  onChange={update("year")}
                  className="w-full text-base sm:text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              required
              type="email"
              placeholder="College or personal email"
              value={form.email}
              onChange={update("email")}
              className="w-full text-base sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              required
              minLength={6}
              type={showPw ? "text" : "password"}
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={update("password")}
              className="w-full text-base sm:text-sm pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label="Toggle password visibility"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all mt-2 min-h-[44px]"
          >
            {loading ? "Verifying..." : mode === "register" ? "Create Free Account" : "Log In"}
          </button>
        </form>

        <div className="text-center mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {mode === "register" ? "Already have an account?" : "New to StriveHub?"}{" "}
            <button
              onClick={() => setMode(mode === "register" ? "login" : "register")}
              className="font-bold text-amber-600 hover:underline ml-1"
            >
              {mode === "register" ? "Log in here" : "Sign up free"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT APPLICATION
---------------------------------------------------------------- */
export default function App() {
  const [view, setView] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [saved, setSaved] = useState(new Set([1, 4]));
  const [applications, setApplications] = useState(new Set([2]));
  const [activeOpp, setActiveOpp] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [opps, setOpps] = useState(INITIAL_OPPS);

  useEffect(() => {
    getSessionUser()
      .then((user) => {
        if (user) setCurrentUser(user);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const toggleSave = (id) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleApply = (id) => {
    setApplications((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApply = (id) => {
    setApplications((prev) => new Set([...prev, id]));
  };

  const openOpp = (opp) => {
    setActiveOpp(opp);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthed = (user) => {
    setCurrentUser(user);
    setView("dashboard");
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setView("home");
  };

  const goToView = (id) => {
    if (id === "dashboard" && !currentUser) {
      setAuthMode("login");
      setView("login");
      return;
    }
    setView(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* StriveHub Navigation */}
      <NavBar
        view={view}
        setView={goToView}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
        savedCount={saved.size}
        applicationsCount={applications.size}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {checkingSession ? (
          <div className="flex items-center justify-center py-32 text-slate-400 text-sm">
            <Activity className="w-5 h-5 text-amber-500 animate-spin mr-2" />
            Connecting to StriveHub...
          </div>
        ) : (
          <>
            {view === "home" && (
              <Home
                setView={goToView}
                query={query}
                setQuery={setQuery}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {view === "opportunities" && (
              <Opportunities
                query={query}
                setQuery={setQuery}
                saved={saved}
                toggleSave={toggleSave}
                onOpen={openOpp}
                category={selectedCategory}
                setCategory={setSelectedCategory}
                opps={opps}
                user={currentUser}
              />
            )}

            {view === "detail" && (
              <Detail
                opp={activeOpp}
                saved={saved}
                toggleSave={toggleSave}
                back={() => setView("opportunities")}
                onApply={handleApply}
                applied={activeOpp && applications.has(activeOpp.id)}
              />
            )}

            {view === "dashboard" && (
              <Dashboard
                saved={saved}
                applications={applications}
                toggleApply={toggleApply}
                currentUser={currentUser}
                opps={opps}
              />
            )}

            {view === "admin" && (
              <Admin opps={opps} setOpps={setOpps} />
            )}

            {(view === "login" || view === "register") && (
              <AuthScreen
                mode={view === "login" ? "login" : "register"}
                setMode={(m) => setView(m)}
                onAuthed={handleAuthed}
              />
            )}
          </>
        )}
      </main>

      {/* StriveHub Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 sm:py-10 mt-auto pb-24 lg:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0">
              <Activity size={13} className="stroke-[3]" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">Strive<span className="text-amber-400">Hub</span></span>
            <span className="text-xs text-slate-500">· The Opportunity Network for Students</span>
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-right">
            Curated student internships, hackathons & scholarships. Free forever for students.
          </p>
        </div>
      </footer>
    </div>
  );
}
