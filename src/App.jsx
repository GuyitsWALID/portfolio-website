import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Cpu, 
  Database, 
  Globe, 
  Zap, 
  Code, 
  Github, 
  Linkedin, 
  Mail,
  Moon,
  Sun,
  ChevronRight,
  Activity,
  GitCommit
} from 'lucide-react';
// GitHub components
// import GithubActivity from './components/GithubActivity';
import ContributionHeatmap from './components/ContributionHeatmap';

// --- ASSETS & DATA ---

const IbexLogo = ({ className }) => (
    <img 
        src="/ibex.svg" 
        alt="Ibex Logo" 
        className={className}
        style={{ 
            objectFit: 'contain',
            filter: 'brightness(0) saturate(100%) invert(72%) sepia(96%) saturate(2426%) hue-rotate(76deg) brightness(102%) contrast(101%)',
            width: '60px',
            height: '60px'
        }}
    />
);

const PORTFOLIO_DATA = {
  roles: [
    "FULL-STACK DEVELOPER",
    "SYSTEM DESIGNER",
    "AUTOMATION ARCHITECT"
  ],
  skills: [
    { category: "CORE ENGINE", icon: <Code />, items: ["React / Next.js", "TypeScript", "Node.js", "Tailwind CSS"] },
    { category: "DATA SYSTEMS", icon: <Database />, items: ["Supabase", "PostgreSQL", "MongoDB", "Cloud Infrastructure"] },
    { category: "AI & INTELLIGENCE", icon: <Cpu />, items: ["Gemini AI Integration", "Python / PyTorch", "Scikit-learn", "Algorithm Design"] },
    { category: "AUTOMATION", icon: <Zap />, items: ["n8n Workflows", "Make.com", "System Protocols", "API Integration"] }
  ],
  projects: [
    {
      id: "01",
      name: "COSTPILOT",
      type: "AI FIN-TECH",
      status: "OPERATIONAL",
      desc: "AI Budget Forecaster using Gemini AI to predict project costs for technical leaders.",
      stack: ["Next.js", "Gemini AI", "Supabase", "Tailwind"],
      link: "http://costpiolt.vercel.app/"
    },
    {
      id: "02",
      name: "COREFIT",
      type: "SAAS PLATFORM",
      status: "SCALING",
      desc: "Multi-tenant gym management system designed for scaling fitness entrepreneurs.",
      stack: ["React", "Cloud Infra", "Multi-Tenant Arch", "Stripe"],
      link: "https://corefit-landing.vercel.app/"
    },
    {
      id: "03",
      name: "MEKINAHUB",
      type: "MARKETPLACE",
      status: "DEPLOYED",
      desc: "Modern automotive marketplace with 3D showroom capabilities connecting buyers and sellers.",
      stack: ["React", "Next.js", "3D Rendering", "Postgres"],
      link: "https://mekinahub.vercel.app/"
    },
    {
      id: "04",
      name: "INVOICEFLOW",
      type: "OPEN SOURCE",
      status: "ACTIVE DEV",
      desc: "Streamlined invoicing automation workflow built with TypeScript for rapid financial processing.",
      stack: ["TypeScript", "Automation", "Node.js"],
      link: "https://github.com/GuyitsWALID"
    }
  ],
  process: [
    { step: "01", title: "IDENTIFY", sub: "Target Acquisition", desc: "Anomaly detection & requirements gathering." },
    { step: "02", title: "ARCHITECT", sub: "Blueprint Generation", desc: "Multi-tenant system design & DB schema." },
    { step: "03", title: "AUTOMATE", sub: "Workflow Protocol", desc: "Inter-system comms via n8n/Make." },
    { step: "04", title: "PROTOTYPE", sub: "Rapid Deployment", desc: "High-fidelity MVP development." },
    { step: "05", title: "SCALE", sub: "System Optimization", desc: "Full deployment & load balancing." }
  ]
};

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME || 'GuyitsWALID';

// --- COMPONENTS ---

// 1. TYPEWRITER EFFECT COMPONENT
const Typewriter = ({ words, wait = 2000 }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timeout2 = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout2);
  }, []);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setReverse(true);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 50 : subIndex === words[index].length ? wait : 100, parseInt(Math.random() * 20)));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, wait]);

  return (
    <span>
      {words[index].substring(0, subIndex)}
      <span className={`${blink ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
    </span>
  );
};

// 2. MOUSE TRACKER COMPONENT
const SystemCursor = ({ isMatrixMode }) => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (followerRef.current) {
        setTimeout(() => {
            if(followerRef.current) followerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }, 50);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <div 
        ref={cursorRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[100] -ml-1 -mt-1 mix-blend-difference transition-colors duration-200 ${isMatrixMode ? 'bg-[#00FF00]' : 'bg-cyan-400'}`}
      />
      <div 
        ref={followerRef}
        className={`fixed top-0 left-0 w-8 h-8 border pointer-events-none z-[99] -ml-4 -mt-4 rounded-full transition-all duration-500 ease-out mix-blend-screen ${isMatrixMode ? 'border-[#00FF00] opacity-80 scale-125' : 'border-cyan-500/50 opacity-50'}`}
      />
    </>
  );
};

// 3. MATRIX RAIN COMPONENT
const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = 'WALIDMURADSYSTEMS010101FULLSTACK';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00FF00'; 
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[60] pointer-events-none opacity-90 mix-blend-screen"
    />
  );
};

// 4. HEARTBEAT & ACTIVITY COMPONENTS (FOOTER)
const HeartbeatMonitor = ({ theme, isMatrixMode, vitalColor, activity, orientation = 'vertical' }) => {
  // Realistic ECG Path (P-QRS-T Wave)
  const ecgPath = "M0 50 L10 50 L15 45 L20 50 L25 50 L30 55 L35 10 L40 80 L45 45 L50 50 L55 50 L60 45 L65 50 L100 50";

  const level = activity?.level || 'LOW';
  const speed = activity?.speed || 2.8; // seconds per cycle (higher = slower)
  // If level is LOW, force red; otherwise use the user's selected vitalColor (fallback to level-based colors)
  const levelColor = level === 'LOW' ? '#ef4444' : (vitalColor || (level === 'HIGH' ? '#22c55e' : '#f59e0b'));


  if (orientation === 'horizontal') {
    return (
      <>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono" style={{ color: levelColor }}>VITAL_SIGNS: <strong className="ml-1">{level}</strong></div>
          <div className={`h-10 w-40 border relative overflow-hidden rounded-sm ${theme === 'dark' || isMatrixMode ? 'bg-black/50 border-current' : 'bg-white border-gray-300'}`} style={{ borderColor: theme === 'dark' || isMatrixMode ? levelColor : undefined }}>
            <div className="absolute inset-0 flex items-center w-[200%] animate-ecg-scroll">
                 <svg className="h-full w-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <path
                        d={`${ecgPath} M100 50 L110 50 L115 45 L120 50 L125 50 L130 55 L135 10 L140 80 L145 45 L150 50 L155 50 L160 45 L165 50 L200 50`}
                        fill="none"
                        stroke={levelColor}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />
                 </svg>
            </div>
          </div>
        </div>

        {/* Animation style for horizontal heartbeat (kept local to component) */}
        <style>{`@keyframes ecg-scroll {0% { transform: translateX(0); } 100% { transform: translateX(-50%); }} .animate-ecg-scroll { animation: ecg-scroll ${speed}s linear infinite; }`}</style>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className={`text-[10px] font-mono tracking-widest mb-1`} style={{ color: levelColor }}>
        VITAL_SIGNS: {level}
      </div>
      <div className={`h-12 w-48 border relative overflow-hidden rounded-sm ${theme === 'dark' || isMatrixMode ? 'bg-black/50 border-current' : 'bg-white border-gray-300'}`} style={{ borderColor: theme === 'dark' || isMatrixMode ? levelColor : undefined }}>
        {/* Main Pulse Line */}
        <div className="absolute inset-0 flex items-center w-[200%] animate-ecg-scroll">
             <svg className="h-full w-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                    d={`${ecgPath} M100 50 L110 50 L115 45 L120 50 L125 50 L130 55 L135 10 L140 80 L145 45 L150 50 L155 50 L160 45 L165 50 L200 50`}
                    fill="none"
                    stroke={levelColor}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
             </svg>
        </div>
        
        {/* Fade Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${isMatrixMode ? 'from-transparent via-transparent to-black' : theme === 'dark' ? 'from-transparent via-transparent to-[#0A0A1A]' : 'from-transparent via-transparent to-white'}`} />
      </div>
      <style>{`
        @keyframes ecg-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ecg-scroll {
          animation: ecg-scroll ${speed}s linear infinite;
        }
      `}</style>
    </div>
  );
};

const ActivityHeatmap = ({ theme, isMatrixMode, vitalColor }) => {
  // Simulated Git Activity Visualization
  const weeks = 12;
  const days = 7;
  
  // Generate pattern: 0=None, 1=Low, 2=Med, 3=High
  const grid = Array.from({ length: weeks * days }, (_, i) => {
    const rand = Math.random();
    if (rand > 0.7) return 3; // High
    if (rand > 0.4) return 2; // Med
    if (rand > 0.2) return 1; // Low
    return 0; // None
  });

  // Function to return dynamic styles instead of fixed Tailwind classes
  const getStyle = (level) => {
    if (level === 0) {
      return { backgroundColor: theme === 'dark' || isMatrixMode ? '#1a1a1a' : '#e5e7eb' };
    }
    
    // Opacity based on activity level (Low: 0.3, Med: 0.6, High: 1.0)
    const opacity = level === 1 ? 0.3 : level === 2 ? 0.6 : 1.0;
    
    return { 
      backgroundColor: vitalColor, 
      opacity: opacity 
    };
  };

  return (
    <div className="flex flex-col gap-1">
      <div className={`text-[10px] font-mono tracking-widest mb-1`} style={{ color: vitalColor }}>
        SYSTEM_ACTIVITY: ON_GIT
      </div>
      <div className="grid grid-rows-7 grid-flow-col gap-[2px]">
        {grid.map((level, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-[1px] transition-colors duration-500`}
            style={getStyle(level)}
          />
        ))}
      </div>
    </div>
  );
};

const BootSequence = ({ onComplete }) => {
  const [text, setText] = useState([]);
  
  useEffect(() => {
    const sequence = [
      "INITIALIZING WALID_MURAD_PROTOCOL...",
      "CHECKING CORE SYSTEMS... [OK]",
      "LOADING FULL-STACK MODULES... [OK]",
      "SYNCING AUTOMATION WORKFLOWS... [OK]",
      "ESTABLISHING SECURE CONNECTION...",
      "WELCOME, COMMANDER."
    ];
    
    let delay = 0;
    sequence.forEach((line, index) => {
      setTimeout(() => {
        setText(prev => [...prev, line]);
        if (index === sequence.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, delay);
      delay += Math.random() * 400 + 200;
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center font-mono p-8">
      <div className="w-full max-w-2xl">
        {text.map((t, i) => (
          <div key={i} className="text-green-500 mb-2 animate-pulse">
            <span className="mr-2">{`>`}</span>{t}
          </div>
        ))}
        <div className="h-4 w-4 bg-green-500 animate-ping mt-4" />
      </div>
    </div>
  );
};

const GlitchText = ({ text, className }) => {
  return (
    <span className={`relative inline-block ${className} group`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-red-500 opacity-0 group-hover:opacity-70 group-hover:translate-x-[2px] transition-all duration-75 select-none">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-cyan-500 opacity-0 group-hover:opacity-70 group-hover:-translate-x-[2px] transition-all duration-75 select-none">{text}</span>
    </span>
  );
};

const TerminalContact = ({ theme }) => {
  const [history, setHistory] = useState([
    { type: 'system', content: 'SECURE COMMS CHANNEL ESTABLISHED.' },
    { type: 'system', content: 'TYPE "help" FOR COMMANDS OR "connect" FOR DETAILS.' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const isLight = theme === 'light';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      const newHistory = [...history, { type: 'user', content: input }];

      if (cmd === 'help') {
        newHistory.push({ type: 'response', content: 'AVAILABLE COMMANDS: [connect] [skills] [clear] [locate]' });
      } else if (cmd === 'connect') {
        newHistory.push({ type: 'response', content: 'EMAIL: walidmurad65@gmail.com' });
        newHistory.push({ type: 'response', content: 'LINKEDIN: linkedin.com/in/guysitswalid' });
        newHistory.push({ type: 'response', content: 'PHONE: +251 943 805 396' });
      } else if (cmd === 'skills') {
        newHistory.push({ type: 'response', content: 'LOADING SPECS... React, Node, Python, AI, Automation.' });
      } else if (cmd === 'locate') {
        newHistory.push({ type: 'response', content: 'COORDINATES: Addis Ababa, Ethiopia' });
      } else if (cmd === 'clear') {
        setHistory([{ type: 'system', content: 'CONSOLE CLEARED.' }]);
        setInput('');
        return;
      } else {
        newHistory.push({ type: 'error', content: `COMMAND '${cmd}' NOT RECOGNIZED.` });
      }

      setHistory(newHistory);
      setInput('');
    }
  };

  return (
    <div className={isLight 
      ? "border-2 border-gray-200 bg-white p-4 rounded font-mono text-sm h-64 flex flex-col shadow-sm" 
      : "border border-opacity-30 border-current bg-black/40 backdrop-blur-sm p-4 rounded font-mono text-sm h-64 flex flex-col shadow-[0_0_15px_rgba(0,255,0,0.1)]"
    }>
      <div className="flex-1 overflow-y-auto space-y-1" ref={scrollRef}>
        {history.map((entry, i) => (
          <div key={i} className={`${
            entry.type === 'error' ? 'text-red-500 font-bold' : 
            isLight ? 'text-red-600' : // Light Mode: All text follows Red theme
            entry.type === 'user' ? 'text-cyan-400' : 
            entry.type === 'response' ? 'text-green-400' : 'text-gray-400'
          }`}>
            <span className="opacity-50 mr-2">{entry.type === 'user' ? '$' : '>'}</span>
            {entry.content}
          </div>
        ))}
      </div>
      <div className={`mt-2 flex items-center ${isLight ? 'text-red-600' : 'text-green-500'}`}>
        <span className="mr-2">$</span>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className={`bg-transparent border-none outline-none w-full ${isLight ? 'text-red-800 placeholder-red-300' : 'text-green-500 placeholder-green-500/30'}`}
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
};

// 5. PROFILE CARD COMPONENT
const ProfileCard = ({ theme, isMatrixMode, colors }) => {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="perspective-[1000px] w-full max-w-md mx-auto lg:mx-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={cardRef}
        className={`
          relative w-full p-6 rounded-xl border backdrop-blur-md transition-transform duration-100 ease-out
          ${theme === 'dark' || isMatrixMode ? 'bg-black/60 border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.1)]' : 'bg-white/60 border-gray-300 shadow-lg'}
        `}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Header */}
        <div className={`flex items-center gap-4 mb-6 border-b border-dashed ${colors.border} pb-4`}>
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${colors.primary} p-0.5`}>
                <img src="https://github.com/GuyitsWALID.png" alt="Profile" className="w-full h-full object-cover rounded-full bg-black" />
            </div>
            <div>
                <div className={`font-mono text-[10px] tracking-widest ${colors.primary}`}>PROTOTYPE_ARCHITECT</div>
                <div className={`font-display font-bold text-xl ${colors.text}`}>Walid Murad</div>
            </div>
            <Cpu className={`ml-auto ${colors.primary} opacity-50`} />
        </div>

        {/* Body */}
        <div className="space-y-6 relative font-mono">
            <div className={`text-[10px] opacity-50 mb-4 tracking-widest`}>EXECUTION_PROTOCOL_V1</div>
            
            {/* Timeline Line */}
            <div className={`absolute left-[5px] top-8 bottom-2 w-px ${colors.border} opacity-30`}></div>

            {/* Step 1 */}
            <div className="relative pl-6">
                <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border ${colors.primary} bg-black flex items-center justify-center`}>
                    <div className={`w-1 h-1 rounded-full ${colors.bg === 'bg-black' ? 'bg-green-500' : 'bg-cyan-500'}`}></div>
                </div>
                <div className={`font-bold text-sm mb-1 ${colors.text}`}>FEASIBILITY_CHECK</div>
                <ul className="text-[10px] space-y-1 opacity-70">
                    <li className="flex items-center gap-2"><span className={colors.primary}>-</span> Tech Stack Analysis</li>
                    <li className="flex items-center gap-2"><span className={colors.primary}>-</span> Cost Projection</li>
                    <li className="flex items-center gap-2"><span className={colors.primary}>-</span> Risk Assessment</li>
                </ul>
            </div>

            {/* Step 2 */}
            <div className="relative pl-6">
                <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border ${colors.primary} bg-black`}></div>
                <div className={`font-bold text-sm mb-1 ${colors.text}`}>RAPID_PROTOTYPING</div>
                <ul className="text-[10px] space-y-1 opacity-70">
                    <li className="flex items-center gap-2"><span className={colors.primary}>-</span> 48h Turnaround</li>
                    <li className="flex items-center gap-2"><span className={colors.primary}>-</span> Working MVP</li>
                    <li className={`mt-1 ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'} px-1 py-0.5 inline-block rounded`}>Live Demo Environment</li>
                </ul>
            </div>

             {/* Step 3 */}
            <div className="relative pl-6">
                <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border ${colors.border} bg-transparent`}></div>
                <div className={`font-bold text-sm mb-1 ${colors.text} opacity-50`}>SCALE_ARCHITECTURE</div>
                <ul className="text-[10px] space-y-1 opacity-40">
                    <li>- Production Ready</li>
                    <li>- Load Balancing</li>
                    <li>- Security Audit</li>
                </ul>
            </div>
        </div>

        {/* Footer */}
        <div className={`mt-6 pt-4 border-t border-dashed ${colors.border} flex justify-between items-center font-mono text-[10px]`}>
            <div className={`${colors.primary} animate-pulse`}>STATUS: AVAILABLE</div>
            <div className="opacity-70">2 Slots Left This Month</div>
        </div>

        {/* Corner Accents */}
        <div className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${colors.primary} rounded-tl-lg opacity-50`}></div>
        <div className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${colors.primary} rounded-br-lg opacity-50`}></div>
        <div className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${colors.primary} rounded-tr-lg opacity-50`}></div>
        <div className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${colors.primary} rounded-bl-lg opacity-50`}></div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [booted, setBooted] = useState(true);
  const [theme, setTheme] = useState('dark'); // 'dark' (Deep Space) or 'light' (Orbital Day)
  const [isMatrixMode, setIsMatrixMode] = useState(false); // New Matrix State
  
  // Footer Vitals State
  const [vitalColor, setVitalColor] = useState('#00FF00'); // Default Neon Green
  const [allowCustomColor, setAllowCustomColor] = useState(true); // allow user's selected color to override level colors
  const [heatmapRange, setHeatmapRange] = useState(120); // 90 | 120 | 365 days (default: 120)
  
  // Process Scroll Animation
  const processRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // GitHub integration state
  const [githubData, setGithubData] = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState(null);
  const [activity, setActivity] = useState({ level: 'LOW', sum: 0, speed: 2 });

  useEffect(() => {
    if (!GITHUB_USERNAME) return;
    setGithubLoading(true);
    setGithubError(null);

    (async () => {
      try {
        const resp = await fetch(`/api/github?login=${encodeURIComponent(GITHUB_USERNAME)}`);
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '');
          throw new Error(txt || `HTTP ${resp.status}`);
        }
        const text = await resp.text();
        if (!text) throw new Error('Empty response from server');
        let d;
        try {
          d = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid JSON from server: ' + (text.length > 200 ? text.slice(0,200) + '...' : text));
        }

        if (d.error) {
          throw new Error(d.error + (d.details ? ' - ' + d.details : ''));
        }

        setGithubData(d);
      } catch (err) {
        console.error('GitHub fetch error:', err);
        setGithubError(err.message || String(err));
        setGithubData(null);
      } finally {
        setGithubLoading(false);
      }
    })();
  }, [GITHUB_USERNAME]);

  useEffect(() => {
    if (!githubData?.contributions) return;
    const map = new Map(githubData.contributions.map(c => [c.date, c.count]));
    let sum7 = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0,10);
      sum7 += map.get(iso) || 0;
    }
    const level = sum7 >= 15 ? 'HIGH' : sum7 >= 4 ? 'MED' : 'LOW';
    const speed = level === 'HIGH' ? 0.9 : level === 'MED' ? 1.6 : 2.8;
    setActivity({ level, sum: sum7, speed });
  }, [githubData]);

  useEffect(() => {
    const handleScroll = () => {
      if (!processRef.current) return;
      const rect = processRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress: 0 when top of section hits center of screen, 1 when bottom hits center
      const triggerPoint = windowHeight * 0.5;
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      let progress = (triggerPoint - sectionTop) / sectionHeight;
      progress = Math.max(0, Math.min(1, progress));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    // Call once to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [booted]);

  // Force scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Color Presets
  const COLOR_PRESETS = [
    { hex: '#00FF00', name: 'Neon Green' },
    { hex: '#FF0000', name: 'Red Alert' },
    { hex: '#00FFFF', name: 'Cyan Flux' },
    { hex: '#FFD700', name: 'Gold Standard' }
  ];

  // Matrix Mode Key Listener (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault(); // Prevent scrolling
        setIsMatrixMode(true);
        setVitalColor('#00FF00'); // Force Green in Matrix Mode
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsMatrixMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Base Theme Colors
  let colors = theme === 'dark' ? {
    bg: 'bg-[#0A0A1A]',
    text: 'text-gray-300',
    primary: 'text-[#00FF00]', // Neon Green
    accent: 'text-[#00FFFF]', // Cyan
    secondary: 'text-[#FF4500]', // Orange
    border: 'border-cyan-900',
    card: 'bg-[#0f172a]/80',
    nav: 'bg-[#0A0A1A]/90'
  } : {
    bg: 'bg-[#F0F2F5]',
    text: 'text-[#1A1A2E]',
    primary: 'text-[#00aa00]',
    accent: 'text-[#0088aa]',
    secondary: 'text-[#cc3300]',
    border: 'border-gray-300',
    card: 'bg-white/90',
    nav: 'bg-white/90'
  };

  // Matrix Mode Overrides (If active, force everything to Green/Black)
  if (isMatrixMode) {
    colors = {
      bg: 'bg-black',
      text: 'text-[#00FF00]',
      primary: 'text-[#00FF00]',
      accent: 'text-[#00FF00]',
      secondary: 'text-[#00FF00]',
      border: 'border-[#00FF00]',
      card: 'bg-black/90 border border-[#00FF00]',
      nav: 'bg-black border-b border-[#00FF00]'
    };
  }

  if (!booted) return <BootSequence onComplete={() => setBooted(true)} />;

  return (
    <div className={`
      ${colors.bg} ${colors.text} 
      min-h-screen transition-colors duration-200 
      ${isMatrixMode ? 'font-mono' : 'font-sans'} 
      selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden cursor-none`
    }>
      
      <SystemCursor isMatrixMode={isMatrixMode} />
      {isMatrixMode && <MatrixRain />}

      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&family=Space+Mono:wght@400;700&display=swap');
        .font-display { font-family: 'Orbitron', sans-serif; }
        .font-body { font-family: 'Rajdhani', sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
        
        /* CRT Scanline Effect */
        .scanlines::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
          z-index: 2;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>

      {/* BACKGROUND STARFIELD (Only shows in Dark Mode when NOT in Matrix Mode) */}
      {theme === 'dark' && !isMatrixMode && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40"
             style={{
               backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px), radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px)',
               backgroundSize: '550px 550px, 350px 350px, 250px 250px',
               backgroundPosition: '0 0, 40px 60px, 130px 270px'
             }}
        />
      )}

      <div className="scanlines fixed inset-0 z-50 pointer-events-none opacity-20 h-full w-full" />

      {/* NAVIGATION */}
      <nav className={`fixed top-0 w-full z-40 border-b ${colors.border} backdrop-blur-md ${colors.nav} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className={`${colors.primary} drop-shadow-[0_0_5px_rgba(0,255,0,0.5)] transition-transform group-hover:scale-110`}>
              <IbexLogo className="w-10 h-10" />
            </div>
            <div className="hidden md:block">
              <div className={`font-display font-bold tracking-widest ${colors.text}`}>WALID MURAD</div>
              <div className={`text-[10px] font-mono ${colors.primary} tracking-[0.3em]`}>INNOVATOR & BUILDER</div>
            </div>
          </div>

          {/* THEME TOGGLE */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono opacity-60 mr-4">
               <span className="animate-pulse">[HOLD SPACE FOR MATRIX]</span>
            </div>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`flex items-center gap-2 px-4 py-2 rounded border ${colors.border} hover:bg-cyan-500/10 transition-all font-mono text-xs z-50 cursor-none`}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'INITIATE_ORBITAL_DAY' : 'ENGAGE_DEEP_SPACE'}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24 px-6 max-w-7xl mx-auto pb-20">
        
        {/* SECTION 1: HERO */}
        <section className="min-h-[85vh] flex flex-col lg:flex-row items-center justify-between relative border-l-2 border-dashed border-cyan-500/20 pl-6 md:pl-12 ml-4 md:ml-0 gap-12">
          
          {/* Left Content */}
          <div className="flex-1">
              <div className={`font-mono text-xs md:text-sm ${colors.primary} mb-4 flex items-center gap-2`}>
                 <Activity size={14} className="animate-pulse" /> SYSTEM STATUS: ONLINE // READY FOR DEPLOYMENT
              </div>
              
              <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
                MISSION <br/>
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isMatrixMode ? 'from-[#00FF00] to-[#003300]' : 'from-cyan-400 to-blue-600'}`}>COMMANDER</span>
              </h1>

              <div className="font-mono text-lg md:text-2xl mb-8 h-8 flex items-center gap-3">
                <span className={colors.secondary}>{`>>`}</span>
                <span className={`border-r-2 ${isMatrixMode ? 'border-[#00FF00]' : 'border-cyan-500'} pr-1`}>
                  <Typewriter words={PORTFOLIO_DATA.roles} />
                </span>
              </div>

              <div className={`max-w-2xl font-body text-lg md:text-xl mb-10 border-l-4 ${theme === 'dark' || isMatrixMode ? 'border-green-500' : 'border-green-600'} pl-6 py-2 bg-gradient-to-r from-green-500/5 to-transparent`}>
                <strong className={`block mb-2 ${colors.primary} font-display tracking-wide`}>NAVIGATING COMPLEXITY</strong>
                I architect, build, and automate robust systems. Specializing in multi-tenant SaaS, AI-driven financial modeling, and automated workflow protocols.
              </div>

              <div className="flex flex-wrap gap-4">
                <a href="#projects" className={`group relative px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest border ${theme === 'dark' && !isMatrixMode ? 'border-cyan-500 text-cyan-400' : isMatrixMode ? 'border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00]' : 'border-cyan-700 text-cyan-900'} hover:bg-cyan-500 hover:text-black transition-all cursor-none`}>
                  <span className="absolute inset-0 w-0 bg-cyan-500 transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></span>
                  Mission_Logs
                </a>
                <a href="#contact" className={`group relative px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest border ${theme === 'dark' && !isMatrixMode ? 'border-orange-500 text-orange-500' : isMatrixMode ? 'border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00]' : 'border-orange-700 text-orange-800'} hover:bg-orange-500 hover:text-black transition-all cursor-none`}>
                   Open_Comms
                </a>
              </div>
          </div>

          {/* Right Content - Profile Card */}
          <div className="flex-1 flex justify-center lg:justify-end w-full">
             <div>
               <ProfileCard theme={theme} isMatrixMode={isMatrixMode} colors={colors} />
               {/* Color selector removed from profile area (footer will have the vertical picker) */}
             </div>
          </div>

        </section>

        {/* MARQUEE SECTION */}
        <div className="w-full overflow-hidden py-8 border-y border-dashed border-cyan-500/20 bg-black/20 mb-24">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(20)].map((_, i) => (
              <span key={i} className={`font-display font-black text-6xl md:text-8xl mx-4 ${isMatrixMode ? 'text-[#00FF00] opacity-50' : 'text-transparent bg-clip-text bg-gradient-to-b from-white/5 to-white/20'} select-none`}>
                BUILD SHIP SCALE
              </span>
            ))}
          </div>
        </div>

        {/* SECTION 2: SPECS (SKILLS) */}
        <section className="py-24">
          <div className="flex items-center gap-4 mb-12">
             <div className={`h-px w-12 ${theme === 'dark' && !isMatrixMode ? 'bg-cyan-500' : isMatrixMode ? 'bg-[#00FF00]' : 'bg-cyan-700'}`}></div>
             <h2 className={`font-mono text-xl ${colors.accent}`}>// ARCHIVE_INDEX: SYSTEM_SPECS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PORTFOLIO_DATA.skills.map((skill, idx) => (
              <div key={idx} className={`border ${colors.border} ${colors.card} p-6 relative overflow-hidden group hover:border-opacity-100 transition-all`}>
                <div className={`absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity ${colors.primary}`}>
                  {skill.icon}
                </div>
                <h3 className={`font-display font-bold text-lg mb-4 ${colors.text}`}>{skill.category}</h3>
                <ul className="space-y-2 font-mono text-xs">
                  {skill.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className={colors.secondary}>+</span> {item}
                    </li>
                  ))}
                </ul>
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-full translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`}></div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: PROJECTS */}
        <section id="projects" className="py-24">
          <div className="flex items-center justify-end gap-4 mb-12">
             <h2 className={`font-mono text-xl ${colors.secondary}`}>// MISSION_LOGS: DEPLOYED_SOLUTIONS</h2>
             <div className={`h-px w-12 ${theme === 'dark' && !isMatrixMode ? 'bg-orange-500' : isMatrixMode ? 'bg-[#00FF00]' : 'bg-orange-700'}`}></div>
          </div>
          {githubError && (
            <div className="max-w-7xl mx-auto px-6 mb-6 text-sm text-red-400 font-mono">GitHub fetch error: {githubError}. Ensure <code>GITHUB_TOKEN</code> is set and the server (`npm run start:server`) is running.</div>
          )}

          <div className="space-y-20">
            {/* Use pinned GitHub repos if available, otherwise fall back to static portfolio projects */}
            {(githubData?.pinned && githubData.pinned.length > 0 ? githubData.pinned : PORTFOLIO_DATA.projects).map((item, idx) => (
              <div key={item.name || item.id || idx} className="relative group">
                {/* Decorative Number (use ID if available, else P#) */}
                <div className={`absolute -top-10 -left-4 font-display text-9xl opacity-5 select-none ${colors.text}`}>
                  {item.id ?? `P${idx + 1}`}
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-dashed border-gray-700 pb-12">
                  {/* Project / Repo Info */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                     <div className={`inline-flex items-center gap-2 px-3 py-1 border ${colors.border} w-fit mb-4 font-mono text-[10px] uppercase tracking-widest`}>
                        <div className={`w-2 h-2 rounded-full ${githubData?.pinned && githubData.pinned.length > 0 ? 'bg-green-500' : (item.status === 'ACTIVE DEV' ? 'bg-cyan-500 animate-pulse' : item.status === 'OPERATIONAL' ? 'bg-green-500' : 'bg-yellow-500')}`}></div>
                        {githubData?.pinned && githubData.pinned.length > 0 ? 'STATUS: DEPLOYED' : `STATUS: ${item.status}`}
                     </div>
                     <h3 className="font-display text-4xl font-bold mb-4">
                       <GlitchText text={item.name} className={colors.text} />
                     </h3>
                     <p className="font-body text-lg opacity-80 mb-6 leading-relaxed">
                       {item.description}
                     </p>
                     <div className="flex flex-wrap gap-2 mb-8">
                       {(item.stack || (item.language ? [item.language] : [])).map((tech, t) => (
                         <span key={t} className={`text-xs font-mono px-2 py-1 ${theme === 'dark' && !isMatrixMode ? 'bg-cyan-900/30 text-cyan-300' : isMatrixMode ? 'bg-[#003300] text-[#00FF00]' : 'bg-cyan-100 text-cyan-800'}`}>
                           {tech}
                         </span>
                       ))}
                     </div>
                     <a href={item.url || item.link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 font-mono text-sm uppercase font-bold ${colors.primary} hover:tracking-wider transition-all cursor-none`}>
                       Access_System <ChevronRight size={16} />
                     </a>
                  </div>

                  {/* Project Visual / Repo Details */}
                  <div className={`lg:col-span-7 border ${colors.border} bg-black/20 backdrop-blur-sm p-2 relative group-hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-shadow`}>
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-20">
                      {[...Array(36)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-cyan-500/30"></div>
                      ))}
                    </div>
                    <div className="h-full w-full bg-gradient-to-br from-cyan-900/20 to-purple-900/20 flex items-center justify-center min-h-[300px]">
                      <div className="text-center p-8 border border-cyan-500/50 bg-black/60 backdrop-blur">
                        <div className="text-xs text-gray-400">★ {item.stars ?? 0} • Forks: {item.forks ?? 0} • Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}</div>
                        <pre className="text-xs font-mono text-gray-500 overflow-auto mt-3">{item.description}</pre>
                        <div className="mt-4">
                          <a href={item.url || item.link} target="_blank" rel="noopener noreferrer" className={`inline-block font-mono text-xs ${colors.primary} hover:underline`}>View on GitHub</a>
                        </div>
                      </div>
                    </div>
                    {/* Corners */}
                    <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${isMatrixMode ? 'border-[#00FF00]' : 'border-cyan-500'}`}></div>
                    <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${isMatrixMode ? 'border-[#00FF00]' : 'border-cyan-500'}`}></div>
                    <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${isMatrixMode ? 'border-[#00FF00]' : 'border-cyan-500'}`}></div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${isMatrixMode ? 'border-[#00FF00]' : 'border-cyan-500'}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: PROCESS */}
        <section className="py-20">
          <h2 className={`font-mono text-xl ${colors.accent} mb-12 text-center`}>// PROTOCOL_FLOW: NAVIGATING CHAOS</h2>
          
          <div className="relative max-w-3xl mx-auto" ref={processRef}>
            {/* Central Line Base */}
            <div className={`absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent md:-ml-[0.5px] ${isMatrixMode ? 'via-[#00FF00]/30' : ''}`}></div>
            
            {/* Animated Light Beam */}
            <div 
              className={`absolute left-[19px] md:left-1/2 top-0 w-[3px] md:-ml-[1.5px] transition-all duration-100 ease-out z-0
                ${isMatrixMode ? 'bg-gradient-to-b from-transparent via-[#00FF00] to-[#00FF00] shadow-[0_0_15px_#00FF00]' : 'bg-gradient-to-b from-transparent via-cyan-400 to-cyan-400 shadow-[0_0_20px_#22d3ee]'}
              `}
              style={{ height: `${scrollProgress * 100}%`, opacity: scrollProgress > 0.01 ? 1 : 0 }}
            >
               {/* Leading Edge Light */}
               <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-8 rounded-full blur-[6px] bg-white`}></div>
            </div>

            <div className="space-y-12">
              {PORTFOLIO_DATA.process.map((step, idx) => (
                <div key={idx} className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Marker */}
                  <div className={`absolute left-0 md:left-1/2 w-10 h-10 rounded-full border-2 ${isMatrixMode ? 'border-[#00FF00] text-[#00FF00]' : 'border-cyan-500 text-cyan-400'} bg-[#0A0A1A] flex items-center justify-center z-10 md:-ml-5`}>
                    <span className="font-mono text-[10px]">{step.step}</span>
                  </div>

                  {/* Content Card */}
                  <div className="ml-12 md:ml-0 w-full md:w-[calc(50%-3rem)]">
                    <div className={`p-6 border ${colors.border} ${colors.card} hover:-translate-y-1 transition-transform`}>
                       <div className={`font-mono text-xs ${colors.secondary} mb-1`}>{step.sub}</div>
                       <h3 className={`font-display font-bold text-xl mb-2 ${colors.text}`}>{step.title}</h3>
                       <p className="font-body text-sm opacity-70">{step.desc}</p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: CONTACT */}
        <section id="contact" className="py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <h2 className={`font-display text-4xl font-bold mb-6 ${colors.text}`}>
                INITIATE <span className={colors.primary}>COMMS</span>
              </h2>
              <p className="font-body text-lg opacity-80 mb-8">
                My systems are online and ready for new objectives. Whether you have a project blueprint or an anomaly to solve, open a channel.
              </p>
              
              <div className="flex flex-col gap-4 font-mono text-sm">
                <a href="mailto:walidmurad65@gmail.com" className={`flex items-center gap-4 p-4 border ${colors.border} hover:bg-cyan-500/10 transition-colors cursor-none`}>
                   <Mail className={colors.primary} /> walidmurad65@gmail.com
                </a>
                <a href="https://www.linkedin.com/in/guysitswalid" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 p-4 border ${colors.border} hover:bg-cyan-500/10 transition-colors cursor-none`}>
                   <Linkedin className={colors.primary} /> linkedin.com/in/guysitswalid
                </a>
                <a href="https://github.com/GuyitsWALID" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 p-4 border ${colors.border} hover:bg-cyan-500/10 transition-colors cursor-none`}>
                   <Github className={colors.primary} /> github.com/walidmurad
                </a>
              </div>
            </div>

            {/* TERMINAL UI */}
            <div className="relative">
               <div className="absolute -top-6 left-0 font-mono text-xs text-cyan-500 animate-pulse">
                 SECURE_CHANNEL_V.2.4
               </div>
               <TerminalContact theme={theme} />
            </div>

          </div>
        </section>

        {/* SECTION 6: CALL TO ACTION */}
        <section className="py-24 text-center relative overflow-hidden">
           <div className={`absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,${isMatrixMode ? '#00FF00' : 'rgba(6,182,212,0.5)'}_0%,transparent_70%)]`}></div>
           
           <div className="relative z-10 max-w-2xl mx-auto">
              <div className={`font-mono text-xs ${colors.primary} mb-4 tracking-[0.3em] animate-pulse`}>SYSTEM_READY</div>
              <h2 className={`font-display text-5xl md:text-6xl font-bold mb-6 ${colors.text}`}>
                READY TO <span className={isMatrixMode ? 'text-[#00FF00]' : 'text-cyan-500'}>DEPLOY?</span>
              </h2>
              <p className="font-body text-lg opacity-70 mb-10">
                Initiate the protocol. Let's build something that defies expectations.
              </p>
              
              <a 
                href="mailto:walidmurad65@gmail.com"
                className={`
                  inline-flex items-center gap-3 px-10 py-4 
                  font-mono text-lg font-bold uppercase tracking-widest 
                  border-2 transition-all duration-300
                  ${isMatrixMode 
                    ? 'border-[#00FF00] text-black bg-[#00FF00] hover:bg-black hover:text-[#00FF00]' 
                    : 'border-cyan-500 text-black bg-cyan-500 hover:bg-transparent hover:text-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                  }
                `}
              >
                <Zap size={20} className={isMatrixMode ? 'animate-pulse' : ''} />
                Connect_Now
              </a>
           </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className={`border-t ${colors.border} py-8 ${colors.nav} relative z-10`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 font-mono text-xs opacity-80">
           {/* LEFT: COPYRIGHT & LOC */}
           <div className="flex flex-col gap-2 mb-2">
             <div className="font-bold">
               WALID MURAD // <Typewriter words={PORTFOLIO_DATA.roles} /> © {new Date().getFullYear()}
             </div>
             <div className="flex gap-6 opacity-60">
               <span>LOC: ADDIS_ABABA</span>
               <span>LAT: 9.0192° N</span>
                <span>LON: 38.7619° E</span>
             </div>
           </div>

           {/* RIGHT: SYSTEM STATUS & VITAL SIGNS */}
           <div className="flex items-center gap-6">
              {/* COLOR SELECTORS (FOOTER) - horizontal */}
              <div className="flex flex-col items-center gap-2">
                 {COLOR_PRESETS.map((color) => (
                    <button
                       key={color.hex}
                       onClick={() => setVitalColor(color.hex)}
                       className={`w-4 h-4 rounded-full transition-all duration-200 ${vitalColor === color.hex ? 'scale-110 shadow-[0_0_8px]' : 'opacity-60 hover:opacity-100'}`}
                       style={{ backgroundColor: color.hex }}
                       title={`Switch System to ${color.name}`}
                    />
                 ))}
              </div>

              {/* SYSTEM ACTIVITY GRAPH (GIT) + RANGE TOGGLE */}
              <div className={`flex-1 transition-all duration-300 ${heatmapRange === 365 ? 'max-w-[900px]' : heatmapRange === 120 ? 'max-w-[560px]' : 'max-w-[420px]'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Range Toggle */}
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-mono text-cyan-300 mr-2">Range:</div>
                    <div className="inline-flex rounded-md bg-[#001018]/20 p-1">
                      {[90,120,365].map(d => (
                        <button
                          key={d}
                          aria-pressed={heatmapRange === d}
                          onClick={() => setHeatmapRange(d)}
                          className={`px-2 py-1 text-[12px] font-mono rounded ${heatmapRange === d ? 'bg-cyan-700 text-white' : 'text-cyan-200 hover:bg-cyan-800/30'}`}
                          title={`Show last ${d} days`}
                        >
                          {d === 365 ? '365d' : `${d}d`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap */}
                  <div className="flex-1">
                    <ContributionHeatmap contributions={githubData?.contributions || []} vitalColor={vitalColor} daysBack={heatmapRange} />
                  </div>
                </div>
              </div>

              {/* VITAL SIGNS (HEARTBEAT) - horizontal compact */}
              <div className="w-[220px]">
                <HeartbeatMonitor theme={theme} isMatrixMode={isMatrixMode} vitalColor={vitalColor} activity={activity} orientation="horizontal" />
              </div>
           </div>
        </div>
      </footer>

    </div>
  );
}
