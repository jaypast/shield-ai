import { useState, useEffect, useRef, useCallback } from "react";
import { Shield, Lock, Zap, Bot, Code2, FileText, Plug, ChevronRight, Send, Sparkles, Eye, EyeOff, Brain, Layers, Terminal, Play, RotateCcw, Download, Plus, X, Check, ArrowRight, MessageSquare, Cpu, Globe, Mic, Image, Settings, BarChart3, Clock, Users, Search, Menu, ChevronDown, Star, Activity, Database, Workflow } from "lucide-react";

// ─── Design Tokens ───
const T = {
  bg: "#0A0E17",
  surface: "#111827",
  surfaceHover: "#1A2332",
  card: "#151D2B",
  cardHover: "#1C2740",
  border: "#1E293B",
  borderAccent: "#2A3A52",
  accent: "#DE5833",
  accentGlow: "rgba(222,88,51,0.15)",
  accentSoft: "#E8714F",
  green: "#10B981",
  greenGlow: "rgba(16,185,129,0.12)",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  yellow: "#F59E0B",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  privacyGreen: "#22C55E",
};

// ─── Font Injection ───
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  `}</style>
);

// ─── Shared Styles ───
const S = {
  glass: {
    background: "rgba(17,24,39,0.7)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: `1px solid ${T.border}`,
  },
  glow: (color) => ({
    boxShadow: `0 0 30px ${color}`,
  }),
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
};

// ─── Privacy Shield Indicator ───
const PrivacyBadge = ({ level = "maximum" }) => (
  <div style={{
    ...S.pill,
    background: T.greenGlow,
    color: T.privacyGreen,
    border: `1px solid rgba(34,197,94,0.25)`,
  }}>
    <Shield size={11} />
    {level} privacy
  </div>
);

// ─── Animated Background ───
const AnimBg = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{
      position: "absolute", top: -200, right: -200, width: 600, height: 600,
      background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`,
      animation: "float 20s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute", bottom: -150, left: -150, width: 500, height: 500,
      background: `radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)`,
      animation: "float 25s ease-in-out infinite reverse",
    }} />
    <style>{`
      @keyframes float { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @keyframes typing { 0%{opacity:.2} 50%{opacity:1} 100%{opacity:.2} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
      @keyframes shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
    `}</style>
  </div>
);

// ─── Model Data ───
const MODELS = [
  { id: "gpt5", name: "GPT-5.5", provider: "OpenAI", color: "#10A37F", speed: "Fast", privacy: "Anonymized", best: "General + Creative" },
  { id: "claude", name: "Claude 4.6", provider: "Anthropic", color: "#D97706", speed: "Fast", privacy: "Anonymized", best: "Analysis + Code" },
  { id: "gemini", name: "Gemini 3.1", provider: "Google", color: "#4285F4", speed: "Medium", privacy: "Anonymized", best: "Multimodal" },
  { id: "llama", name: "Llama 4", provider: "Meta OSS", color: "#8B5CF6", speed: "Fast", privacy: "Zero Visibility", best: "Open Source" },
  { id: "mistral", name: "Mistral Large", provider: "Mistral", color: "#F97316", speed: "Fast", privacy: "Zero Visibility", best: "European Compliance" },
  { id: "deepseek", name: "DeepSeek v4", provider: "DeepSeek", color: "#06B6D4", speed: "Medium", privacy: "Anonymized", best: "Reasoning + Math" },
];

const AGENTS = [
  { id: "research", name: "Deep Research", icon: Search, desc: "Multi-source synthesis with citations", color: T.blue },
  { id: "code", name: "Code Engineer", icon: Code2, desc: "Full-stack development agent", color: T.green },
  { id: "docs", name: "Doc Generator", icon: FileText, desc: "Reports, decks, and summaries", color: T.purple },
  { id: "data", name: "Data Analyst", icon: BarChart3, desc: "CSV/Excel analysis with charts", color: T.yellow },
  { id: "workflow", name: "Workflow Bot", icon: Workflow, desc: "Multi-step task automation", color: T.accent },
  { id: "browser", name: "Web Navigator", icon: Globe, desc: "Private browsing agent", color: "#06B6D4" },
];

const INTEGRATIONS = [
  { name: "Slack", status: "available", category: "Communication" },
  { name: "Google Drive", status: "available", category: "Storage" },
  { name: "Gmail", status: "available", category: "Communication" },
  { name: "Notion", status: "available", category: "Productivity" },
  { name: "GitHub", status: "available", category: "Development" },
  { name: "Jira", status: "coming", category: "Project Mgmt" },
  { name: "Confluence", status: "available", category: "Knowledge" },
  { name: "Teams", status: "coming", category: "Communication" },
];

// ─── Simulated Chat Messages ───
const DEMO_MESSAGES = {
  router: [
    { role: "user", text: "Compare the economic impact of remote work policies across G7 nations since 2023." },
    { role: "system", text: "Routing to Claude 4.6 (best for multi-source analysis). Privacy: PII stripped, zero-log session." },
    { role: "assistant", text: "Based on analysis across 47 sources, here's a comparative breakdown:\n\n**United States**: Remote work adoption stabilized at ~28% of workforce. GDP contribution from remote-enabled sectors grew 3.2% YoY.\n\n**Germany**: Stricter return-to-office mandates reduced remote to ~18%, but manufacturing productivity gains offset this.\n\n**Japan**: Largest shift — remote went from 8% (2022) to 22% (2025), correlated with a 14% increase in workforce participation among women aged 30-45.\n\nShall I generate a full report with citations, or focus on a specific nation?" },
  ],
  agent: [
    { role: "user", text: "Research the top 5 privacy-focused AI startups, create a competitive analysis deck, and email it to my team." },
    { role: "system", text: "Agent activated: Deep Research → Doc Generator → Email. Estimated: 4 min. All data processed ephemerally." },
    { role: "assistant", text: "✅ Step 1/3: Research complete — analyzed 23 companies, narrowed to top 5 by funding, privacy architecture, and market traction.\n\n✅ Step 2/3: Generating 12-slide competitive analysis deck...\n\n⏳ Step 3/3: Preparing anonymized email relay to team@company.com\n\nDeck preview available now. No data retained after session ends." },
  ],
  code: [
    { role: "user", text: "Build a Python API that takes a CSV upload and returns anomaly detection results as JSON." },
    { role: "system", text: "Code sandbox activated. Environment: Python 3.12, isolated container. No code persisted beyond session." },
    { role: "assistant", text: "Here's your anomaly detection API:\n\n```python\nfrom fastapi import FastAPI, UploadFile\nimport pandas as pd\nfrom sklearn.ensemble import IsolationForest\n\napp = FastAPI()\n\n@app.post(\"/detect\")\nasync def detect_anomalies(file: UploadFile):\n    df = pd.read_csv(file.file)\n    numeric = df.select_dtypes(include='number')\n    model = IsolationForest(contamination=0.1)\n    df['anomaly'] = model.fit_predict(numeric)\n    anomalies = df[df['anomaly'] == -1]\n    return {\"count\": len(anomalies),\n            \"rows\": anomalies.to_dict('records')}\n```\n\n▶ Running tests... 3/3 passed. Ready to download or deploy." },
  ],
};

// ─── Tab Button ───
const TabBtn = ({ active, icon: Icon, label, onClick, badge }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
    background: active ? T.accentGlow : "transparent",
    border: active ? `1px solid rgba(222,88,51,0.3)` : `1px solid transparent`,
    borderRadius: 10, color: active ? T.accent : T.textMuted,
    fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
    position: "relative",
  }}>
    <Icon size={16} />
    {label}
    {badge && (
      <span style={{
        ...S.pill, padding: "2px 6px", fontSize: 9, background: T.green,
        color: "#fff", marginLeft: 4,
      }}>{badge}</span>
    )}
  </button>
);

// ─── Chat Message ───
const ChatMsg = ({ role, text, anim }) => {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 12, animation: anim ? "fadeUp 0.4s ease" : undefined,
    }}>
      <div style={{
        maxWidth: isSystem ? "100%" : "85%",
        padding: isSystem ? "8px 14px" : "14px 18px",
        borderRadius: isSystem ? 8 : isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isSystem ? "rgba(222,88,51,0.08)" : isUser ? T.accent : T.card,
        border: isSystem ? `1px solid rgba(222,88,51,0.2)` : isUser ? "none" : `1px solid ${T.border}`,
        color: isSystem ? T.accentSoft : T.text,
        fontSize: isSystem ? 12 : 14,
        fontFamily: isSystem ? "'JetBrains Mono', monospace" : "'DM Sans', sans-serif",
        lineHeight: 1.6, whiteSpace: "pre-wrap",
      }}>
        {isSystem && <Lock size={10} style={{ marginRight: 6, verticalAlign: "middle" }} />}
        {text}
      </div>
    </div>
  );
};

// ─── Model Card ───
const ModelCard = ({ model, selected, onSelect }) => (
  <button onClick={() => onSelect(model.id)} style={{
    display: "flex", flexDirection: "column", gap: 8, padding: 16,
    background: selected ? "rgba(222,88,51,0.08)" : T.card,
    border: selected ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
    borderRadius: 14, cursor: "pointer", textAlign: "left", width: "100%",
    transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%", background: model.color,
          boxShadow: `0 0 8px ${model.color}40`,
        }} />
        <span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{model.name}</span>
      </div>
      {selected && <Check size={14} color={T.accent} />}
    </div>
    <span style={{ color: T.textDim, fontSize: 11 }}>{model.provider}</span>
    <div style={{ display: "flex", gap: 6 }}>
      <span style={{ ...S.pill, background: T.greenGlow, color: T.privacyGreen, border: `1px solid rgba(34,197,94,0.2)` }}>
        <Lock size={9} /> {model.privacy}
      </span>
      <span style={{ ...S.pill, background: "rgba(59,130,246,0.1)", color: T.blue, border: `1px solid rgba(59,130,246,0.2)` }}>
        <Zap size={9} /> {model.speed}
      </span>
    </div>
    <span style={{ color: T.textMuted, fontSize: 11 }}>Best for: {model.best}</span>
  </button>
);

// ─── Agent Card ───
const AgentCard = ({ agent, onClick }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "flex-start", gap: 14, padding: 18,
    background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
    cursor: "pointer", textAlign: "left", width: "100%",
    transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = agent.color + "50"; e.currentTarget.style.background = T.cardHover; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.card; }}
  >
    <div style={{
      width: 42, height: 42, borderRadius: 12, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: agent.color + "15", border: `1px solid ${agent.color}30`,
      flexShrink: 0,
    }}>
      <agent.icon size={20} color={agent.color} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ color: T.text, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{agent.name}</div>
      <div style={{ color: T.textMuted, fontSize: 12, lineHeight: 1.4 }}>{agent.desc}</div>
    </div>
    <ChevronRight size={16} color={T.textDim} style={{ marginTop: 4 }} />
  </button>
);

// ─── Code Editor Simulation ───
const CodeSandbox = () => {
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const code = `# Anomaly Detection API — Shield AI Sandbox
from fastapi import FastAPI, UploadFile
import pandas as pd
from sklearn.ensemble import IsolationForest

app = FastAPI()

@app.post("/detect")
async def detect_anomalies(file: UploadFile):
    df = pd.read_csv(file.file)
    numeric = df.select_dtypes(include='number')
    model = IsolationForest(contamination=0.1)
    df['anomaly'] = model.fit_predict(numeric)
    results = df[df['anomaly'] == -1]
    return {
        "total_rows": len(df),
        "anomalies_found": len(results),
        "anomaly_rows": results.to_dict('records')
    }`;

  const runCode = () => {
    setRunning(true);
    setOutput("");
    setTimeout(() => {
      setOutput(`🔒 Sandbox: Ephemeral container spun up
📦 Installing: fastapi, pandas, scikit-learn
✅ Dependencies resolved (1.2s)

▶ Running test suite...
  ✓ POST /detect with valid CSV — 200 OK (340ms)
  ✓ POST /detect with empty file — 422 Validation Error
  ✓ POST /detect with 10k rows — 200 OK (890ms)

3/3 tests passed | 0 data retained | Container destroyed`);
      setRunning(false);
    }, 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Terminal size={14} color={T.accent} />
          <span style={{ color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans'" }}>Private Code Sandbox</span>
          <PrivacyBadge level="ephemeral" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={runCode} disabled={running} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
            background: running ? T.surface : T.accent, color: "#fff",
            border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: running ? "default" : "pointer", fontFamily: "'DM Sans'",
          }}>
            {running ? <><Activity size={12} style={{ animation: "pulse 1s infinite" }} /> Running...</> : <><Play size={12} /> Run</>}
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
            background: T.surface, color: T.textMuted, border: `1px solid ${T.border}`,
            borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans'",
          }}>
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      <div style={{
        background: "#0D1117", borderRadius: 12, padding: 20,
        border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12.5, lineHeight: 1.7, color: "#C9D1D9", overflowX: "auto",
        whiteSpace: "pre",
      }}>
        {code.split("\n").map((line, i) => {
          let c = "#C9D1D9";
          if (line.startsWith("#")) c = "#8B949E";
          else if (line.match(/^(from|import|async|def|return)/)) c = "#FF7B72";
          else if (line.match(/\b(FastAPI|UploadFile|IsolationForest)\b/)) c = "#79C0FF";
          else if (line.match(/"[^"]*"/)) c = "#A5D6FF";
          return (
            <div key={i} style={{ display: "flex" }}>
              <span style={{ color: "#484F58", width: 30, textAlign: "right", marginRight: 16, userSelect: "none" }}>{i + 1}</span>
              <span style={{ color: c }}>{line}</span>
            </div>
          );
        })}
      </div>

      {output && (
        <div style={{
          background: "#0D1117", borderRadius: 12, padding: 16,
          border: `1px solid rgba(16,185,129,0.2)`,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
          lineHeight: 1.7, color: T.green, whiteSpace: "pre-wrap",
          animation: "fadeUp 0.3s ease",
        }}>
          {output}
        </div>
      )}
    </div>
  );
};

// ─── Privacy Dashboard ───
const PrivacyDash = () => {
  const metrics = [
    { label: "Queries processed", value: "2.4M", sub: "this month" },
    { label: "Data retained", value: "0 bytes", sub: "always" },
    { label: "PII stripped", value: "100%", sub: "before model" },
    { label: "Avg latency overhead", value: "+12ms", sub: "for anonymization" },
  ];

  return (
    <div style={{
      padding: 24, background: T.card, borderRadius: 16,
      border: `1px solid rgba(34,197,94,0.15)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: T.greenGlow, border: `1px solid rgba(34,197,94,0.25)`,
        }}>
          <Shield size={18} color={T.privacyGreen} />
        </div>
        <div>
          <div style={{ color: T.text, fontWeight: 700, fontSize: 15, fontFamily: "'Outfit'" }}>Privacy Control Center</div>
          <div style={{ color: T.textMuted, fontSize: 11 }}>Real-time transparency into how your data flows</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            padding: 16, background: T.surface, borderRadius: 12,
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ color: T.textDim, fontSize: 11, marginBottom: 6, fontFamily: "'DM Sans'" }}>{m.label}</div>
            <div style={{ color: m.value === "0 bytes" || m.value === "100%" ? T.privacyGreen : T.text, fontSize: 22, fontWeight: 700, fontFamily: "'Outfit'" }}>{m.value}</div>
            <div style={{ color: T.textDim, fontSize: 10 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16, padding: 14, borderRadius: 10,
        background: "rgba(34,197,94,0.06)", border: `1px solid rgba(34,197,94,0.15)`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Lock size={14} color={T.privacyGreen} />
        <span style={{ color: T.privacyGreen, fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 500 }}>
          All sessions are ephemeral. No conversation history, no user profiles, no training data collection. Ever.
        </span>
      </div>
    </div>
  );
};

// ─── Integration Hub ───
const IntegrationHub = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    {INTEGRATIONS.map((int, i) => (
      <div key={i} style={{
        padding: 16, background: T.card, borderRadius: 12,
        border: `1px solid ${T.border}`, display: "flex",
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans'" }}>{int.name}</div>
          <div style={{ color: T.textDim, fontSize: 10 }}>{int.category}</div>
        </div>
        <div style={{
          ...S.pill, padding: "4px 10px",
          background: int.status === "available" ? T.greenGlow : "rgba(245,158,11,0.1)",
          color: int.status === "available" ? T.privacyGreen : T.yellow,
          border: `1px solid ${int.status === "available" ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
        }}>
          {int.status === "available" ? "Connect" : "Soon"}
        </div>
      </div>
    ))}
  </div>
);

// ─── Main App ───
export default function ShieldAI() {
  const [activeTab, setActiveTab] = useState("router");
  const [selectedModel, setSelectedModel] = useState("auto");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOnboard, setShowOnboard] = useState(true);
  const chatEndRef = useRef(null);

  const tabs = [
    { id: "router", label: "AI Router", icon: Brain },
    { id: "agents", label: "Agents", icon: Bot },
    { id: "sandbox", label: "Code Sandbox", icon: Code2 },
    { id: "privacy", label: "Privacy", icon: Shield, badge: "LIVE" },
    { id: "integrations", label: "Connect", icon: Plug },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!inputText.trim()) return;
    const userMsg = { role: "user", text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    const demoKey = activeTab === "agents" ? "agent" : activeTab === "sandbox" ? "code" : "router";
    const demo = DEMO_MESSAGES[demoKey];

    setTimeout(() => {
      setMessages(prev => [...prev, demo[1]]);
      setTimeout(() => {
        setMessages(prev => [...prev, demo[2]]);
        setIsTyping(false);
      }, 1500);
    }, 800);
  }, [inputText, activeTab]);

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      fontFamily: "'DM Sans', sans-serif", position: "relative",
    }}>
      <FontLoader />
      <AnimBg />

      {/* ─── Onboarding Splash ─── */}
      {showOnboard && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(10,14,23,0.95)", backdropFilter: "blur(30px)",
        }}>
          <div style={{
            maxWidth: 520, padding: 48, textAlign: "center",
            animation: "fadeUp 0.6s ease",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20, margin: "0 auto 28px",
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 8px 40px ${T.accentGlow}`,
            }}>
              <Shield size={40} color="#fff" />
            </div>

            <h1 style={{
              fontFamily: "'Outfit'", fontSize: 36, fontWeight: 800,
              marginBottom: 8, letterSpacing: "-0.02em",
              background: `linear-gradient(135deg, ${T.text}, ${T.textMuted})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Shield AI
            </h1>
            <p style={{ color: T.accent, fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
              by DuckDuckGo
            </p>
            <p style={{ color: T.textMuted, fontSize: 16, lineHeight: 1.7, marginBottom: 12 }}>
              Every frontier AI model. Autonomous agents. Code execution. Document generation. Enterprise integrations.
            </p>
            <p style={{ color: T.privacyGreen, fontSize: 15, fontWeight: 600, marginBottom: 36 }}>
              Zero data retention. Zero tracking. Zero compromise.
            </p>

            <button onClick={() => setShowOnboard(false)} style={{
              padding: "14px 40px", background: T.accent, color: "#fff",
              border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans'",
              boxShadow: `0 4px 20px ${T.accentGlow}`,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              Launch Platform <ArrowRight size={16} />
            </button>

            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 32 }}>
              {[["100+", "AI Models"], ["0", "Data Stored"], ["12ms", "Privacy Overhead"]].map(([v, l], i) => (
                <div key={i}>
                  <div style={{ color: T.text, fontSize: 20, fontWeight: 700, fontFamily: "'Outfit'" }}>{v}</div>
                  <div style={{ color: T.textDim, fontSize: 11 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Layout ─── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 0", borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <span style={{ fontFamily: "'Outfit'", fontSize: 18, fontWeight: 700 }}>Shield AI</span>
              <span style={{ color: T.textDim, fontSize: 11, marginLeft: 8 }}>by DuckDuckGo</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PrivacyBadge />
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: T.surface,
              border: `1px solid ${T.border}`, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}>
              <Settings size={15} color={T.textMuted} />
            </div>
          </div>
        </header>

        {/* Tab Bar */}
        <div style={{
          display: "flex", gap: 4, padding: "14px 0", overflowX: "auto",
          borderBottom: `1px solid ${T.border}`,
        }}>
          {tabs.map(tab => (
            <TabBtn key={tab.id} active={activeTab === tab.id} icon={tab.icon}
              label={tab.label} onClick={() => { setActiveTab(tab.id); setMessages([]); }}
              badge={tab.badge} />
          ))}
        </div>

        {/* Content Area */}
        <div style={{ display: "flex", gap: 20, padding: "20px 0 100px", minHeight: "70vh" }}>

          {/* Left Sidebar */}
          <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {activeTab === "router" && (
              <>
                <div style={{ padding: "12px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Model Selection</span>
                  </div>
                  <button onClick={() => setSelectedModel("auto")} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    width: "100%", background: selectedModel === "auto" ? T.accentGlow : T.card,
                    border: selectedModel === "auto" ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                    borderRadius: 12, cursor: "pointer", marginBottom: 10,
                    fontFamily: "'DM Sans'",
                  }}>
                    <Sparkles size={16} color={T.accent} />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>Auto-Route</div>
                      <div style={{ color: T.textDim, fontSize: 10 }}>AI picks the best model</div>
                    </div>
                    {selectedModel === "auto" && <Check size={14} color={T.accent} style={{ marginLeft: "auto" }} />}
                  </button>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {MODELS.map(m => (
                      <ModelCard key={m.id} model={m} selected={selectedModel === m.id}
                        onSelect={setSelectedModel} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "agents" && (
              <div style={{ padding: "12px 0" }}>
                <span style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>
                  Available Agents
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {AGENTS.map(a => (
                    <AgentCard key={a.id} agent={a} onClick={() => {}} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "sandbox" && <CodeSandbox />}
            {activeTab === "privacy" && <PrivacyDash />}
            {activeTab === "integrations" && (
              <div style={{ padding: "12px 0" }}>
                <span style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>
                  Integration Hub
                </span>
                <IntegrationHub />
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{
              flex: 1, padding: 20, background: T.surface, borderRadius: 16,
              border: `1px solid ${T.border}`, display: "flex", flexDirection: "column",
              minHeight: 500,
            }}>
              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
                {messages.length === 0 && (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", height: "100%", textAlign: "center",
                    padding: 40,
                  }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 16, marginBottom: 20,
                      background: T.accentGlow, border: `1px solid rgba(222,88,51,0.2)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {activeTab === "router" && <Brain size={28} color={T.accent} />}
                      {activeTab === "agents" && <Bot size={28} color={T.accent} />}
                      {activeTab === "sandbox" && <Code2 size={28} color={T.accent} />}
                      {activeTab === "privacy" && <Shield size={28} color={T.privacyGreen} />}
                      {activeTab === "integrations" && <Plug size={28} color={T.accent} />}
                    </div>
                    <h3 style={{ fontFamily: "'Outfit'", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                      {activeTab === "router" && "Ask anything. We'll route it privately."}
                      {activeTab === "agents" && "Deploy an agent. Zero data footprint."}
                      {activeTab === "sandbox" && "Write & run code. Nothing persists."}
                      {activeTab === "privacy" && "Your privacy dashboard is live."}
                      {activeTab === "integrations" && "Connect your tools. We never see the data."}
                    </h3>
                    <p style={{ color: T.textMuted, fontSize: 13, maxWidth: 380, lineHeight: 1.6 }}>
                      {activeTab === "router" && "100+ models. Intelligent routing. Every query anonymized before it leaves your device."}
                      {activeTab === "agents" && "Multi-step autonomous workflows that execute in ephemeral containers with zero data retention."}
                      {activeTab === "sandbox" && "Full Python/JS execution in isolated containers. Code, output, and environment destroyed after session."}
                      {activeTab === "privacy" && "Real-time visibility into exactly how your data flows — or rather, how it doesn't."}
                      {activeTab === "integrations" && "End-to-end encrypted relay connections. We broker the handshake, never touch the payload."}
                    </p>

                    {(activeTab === "router" || activeTab === "agents" || activeTab === "sandbox") && (
                      <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
                        {(activeTab === "router" ? [
                          "Compare remote work policies across G7",
                          "Summarize this PDF privately",
                          "Draft a board memo",
                        ] : activeTab === "agents" ? [
                          "Research top 5 privacy AI startups",
                          "Analyze my Q3 sales CSV",
                          "Build a competitive analysis deck",
                        ] : [
                          "Build an anomaly detection API",
                          "Scrape and analyze a dataset",
                          "Create a React dashboard component",
                        ]).map((prompt, i) => (
                          <button key={i} onClick={() => setInputText(prompt)} style={{
                            padding: "8px 14px", background: T.card, border: `1px solid ${T.border}`,
                            borderRadius: 10, color: T.textMuted, fontSize: 12, cursor: "pointer",
                            fontFamily: "'DM Sans'", transition: "all 0.2s",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent + "50"; e.currentTarget.style.color = T.text; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {messages.map((msg, i) => (
                  <ChatMsg key={i} role={msg.role} text={msg.text} anim={i === messages.length - 1} />
                ))}

                {isTyping && (
                  <div style={{ display: "flex", gap: 6, padding: "12px 18px" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: "50%", background: T.textDim,
                        animation: `typing 1.4s infinite ${i * 0.2}s`,
                      }} />
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{
                display: "flex", gap: 10, alignItems: "center", padding: 12,
                background: T.card, borderRadius: 14, border: `1px solid ${T.border}`,
              }}>
                <Lock size={14} color={T.privacyGreen} style={{ flexShrink: 0 }} />
                <input
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder={
                    activeTab === "router" ? "Ask anything — privately routed to the best model..." :
                    activeTab === "agents" ? "Describe a task for your agent..." :
                    "Describe what you want to build..."
                  }
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: T.text, fontSize: 14, fontFamily: "'DM Sans'",
                  }}
                />
                <button onClick={sendMessage} style={{
                  width: 38, height: 38, borderRadius: 10, border: "none",
                  background: inputText.trim() ? T.accent : T.surface,
                  cursor: inputText.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  <Send size={16} color={inputText.trim() ? "#fff" : T.textDim} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
