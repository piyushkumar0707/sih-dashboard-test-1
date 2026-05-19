import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheckIcon,
  MapPinIcon,
  BellAlertIcon,
  CpuChipIcon,
  LockClosedIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// ── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ value, label, suffix = '' }) {
  const [count, ref] = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-extrabold text-white">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-2 text-blue-200 text-sm md:text-base">{label}</p>
    </div>
  );
}

// ── Feature Card ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, gradient }) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`} />
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${gradient}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl font-extrabold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            Travira
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {['Features', 'How it Works', 'Technology', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                scrolled ? 'text-gray-600' : 'text-blue-100'
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onLogin}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
              scrolled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={onLogin}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-blue-500/30"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage({ onLogin }) {
  const handleLogin = () => {
    if (onLogin) onLogin();
  };

  const features = [
    {
      icon: MapPinIcon,
      title: 'Real-Time GPS Tracking',
      description: 'Continuous location monitoring with interactive maps, geo-fencing alerts, and live tourist status updates.',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      icon: CpuChipIcon,
      title: 'AI Safety Scoring',
      description: 'Machine learning algorithms assess individual risk in real time, enabling proactive safety interventions.',
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
    },
    {
      icon: BellAlertIcon,
      title: 'Automated E-FIR',
      description: 'Instantly generate First Information Reports with AI-compiled evidence, reducing response time dramatically.',
      gradient: 'bg-gradient-to-br from-rose-500 to-red-600',
    },
    {
      icon: LockClosedIcon,
      title: 'Blockchain Security',
      description: 'Tamper-proof, immutable audit trails for every incident and activity — backed by Ethereum smart contracts.',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    },
    {
      icon: ChartBarIcon,
      title: 'Predictive Analytics',
      description: 'Trend analysis, anomaly detection, and risk heat maps help officers act before incidents escalate.',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Role Access',
      description: 'Granular RBAC for Admins, Officers, and Tourists — each with tailored dashboards and permissions.',
      gradient: 'bg-gradient-to-br from-cyan-500 to-sky-600',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Register & Onboard',
      description: 'Tourists register via the app. Admins approve officer accounts through the automated workflow.',
    },
    {
      step: '02',
      title: 'Live Monitoring',
      description: 'Officers track GPS locations, safety scores, and geo-fence breaches on a real-time dashboard.',
    },
    {
      step: '03',
      title: 'Incident Response',
      description: 'On an alert, AI generates an E-FIR, notifies authorities, and compiles evidence automatically.',
    },
    {
      step: '04',
      title: 'Secure Audit',
      description: 'Every action is logged immutably on the blockchain — full accountability, zero tampering.',
    },
  ];

  const techStack = [
    { name: 'React 19', color: 'bg-blue-100 text-blue-700' },
    { name: 'Node.js', color: 'bg-green-100 text-green-700' },
    { name: 'MongoDB', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Python FastAPI', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Blockchain', color: 'bg-purple-100 text-purple-700' },
    { name: 'Socket.io', color: 'bg-gray-100 text-gray-700' },
    { name: 'Leaflet Maps', color: 'bg-teal-100 text-teal-700' },
    { name: 'JWT Auth', color: 'bg-rose-100 text-rose-700' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar onLogin={handleLogin} />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 mb-8">
            <SparklesIcon className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">AI-Powered Tourism Safety Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-6">
            Protecting Tourists{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              With Intelligence
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-blue-100/80 text-lg md:text-xl leading-relaxed mb-10">
            Travira combines real-time GPS tracking, AI safety scoring, automated incident management,
            and blockchain-secured logging — all in one unified platform for tourism authorities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLogin}
              className="group flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-blue-600/40 hover:shadow-blue-500/60"
            >
              <span>Enter Dashboard</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="https://github.com/piyushkumar0707/sih-dashboard-test-1"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all"
            >
              <PlayIcon className="w-5 h-5" />
              <span>View Demo</span>
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1 animate-bounce">
            <div className="w-px h-8 bg-white/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatCard value={12000} label="Tourists Monitored" suffix="+" />
          <StatCard value={98} label="Incident Resolution Rate" suffix="%" />
          <StatCard value={3} label="AI Microservices" />
          <StatCard value={500} label="E-FIRs Generated" suffix="+" />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Features
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Everything You Need to Keep Tourists Safe
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              A fully integrated stack of intelligent tools — from field monitoring to executive reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">Four Steps to Safer Tourism</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px border-t-2 border-dashed border-blue-200 z-0" style={{ width: '100%' }} />
                )}
                <div className="relative z-10 bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:border-blue-200 transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                    <span className="text-white font-black text-lg">{s.step}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology ── */}
      <section id="technology" className="py-24 bg-gradient-to-br from-slate-900 to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Technology
              </span>
              <h2 className="text-4xl font-extrabold text-white mb-6">
                Built on a Robust, Modern Stack
              </h2>
              <p className="text-blue-100/70 text-lg mb-8 leading-relaxed">
                Every layer of Travira is engineered for reliability, speed, and security —
                from the React frontend to Python AI microservices and Ethereum-backed blockchain logging.
              </p>
              <ul className="space-y-3">
                {[
                  'Monorepo architecture with independent scaling',
                  'End-to-end encrypted communications',
                  'Real-time updates via Socket.io WebSockets',
                  'PWA-ready — installable on mobile devices',
                ].map((item) => (
                  <li key={item} className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100/80 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {techStack.map((t) => (
                <span
                  key={t.name}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${t.color} shadow-sm`}
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <GlobeAltIcon className="w-12 h-12 text-blue-500 mx-auto mb-6" />
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Ready to Modernise Tourism Safety?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Sign in to the Travira dashboard and experience AI-powered safety management in action.
          </p>
          <button
            onClick={handleLogin}
            className="group inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-700/40"
          >
            <span>Go to Dashboard</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" className="bg-gray-950 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">Travira</span>
          </div>
          <p className="text-sm text-center">
            © 2025 Travira Team · Built for tourist safety ·{' '}
            <a
              href="mailto:121piyush466mits@gmail.com"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              121piyush466mits@gmail.com
            </a>
          </p>
          <a
            href="https://github.com/piyushkumar0707/sih-dashboard-test-1"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}
