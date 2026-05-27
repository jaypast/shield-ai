import { useState, useEffect, useRef, useCallback } from "react";
import { Shield, Lock, Zap, Bot, Code2, FileText, Plug, ChevronRight, Send, Sparkles, Eye, Brain, Terminal, Check, ArrowRight, MessageSquare, Globe, Search, ChevronDown, ChevronUp, Activity, Database, Workflow, BarChart3, Users, DollarSign, Award, TrendingUp } from "lucide-react";

/* ═══════ DESIGN TOKENS ═══════ */
const T = {
  bg: "#080C14", surface: "#0F1520", card: "#141C2C", cardHover: "#1A2438",
  border: "#1C2840", borderLight: "#253352",
  accent: "#DE5833", accentGlow: "rgba(222,88,51,0.12)", accentSoft: "#E8714F",
  green: "#10B981", greenGlow: "rgba(16,185,129,0.1)", privacyGreen: "#22C55E",
  blue: "#3B82F6", purple: "#8B5CF6", yellow: "#F59E0B", cyan: "#06B6D4",
  text: "#F1F5F9", textMuted: "#94A3B8", textDim: "#64748B",
  ddgOrange: "#DE5833",
};

/* ═══════ FONT INJECTION + ANIMATIONS ═══════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideUp { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
    @keyframes typing { 0%{opacity:.2} 50%{opacity:1} 100%{opacity:.2} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(222,88,51,0.15)} 50%{box-shadow:0 0 40px rgba(222,88,51,0.3)} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    input:focus { outline: none; }
    ::-webkit-scrollbar { width: 0; height: 0; }
  `}</style>
);

/* ═══════ REUSABLE COMPONENTS ═══════ */
const Pill = ({ children, color = T.green, bg, border: brd }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
    letterSpacing: "0.06em", textTransform: "uppercase",
    color, background: bg || color + "14", border: `1px solid ${brd || color + "30"}`,
    fontFamily: "'DM Sans', sans-serif",
  }}>{children}</span>
);

const PrivacyBadge = ({ size = "sm" }) => (
  <Pill color={T.privacyGreen}>
    <Shield size={size === "sm" ? 9 : 11} /> Private
  </Pill>
);

/* ═══════ DATA ═══════ */
const MODELS = [
  { id: "auto", name: "Auto-Route", sub: "Best model per task", color: T.accent, icon: Sparkles },
  { id: "gpt5", name: "GPT-5.5", sub: "OpenAI", color: "#10A37F", privacy: "Anonymized" },
  { id: "claude", name: "Claude 4.6", sub: "Anthropic", color: "#D97706", privacy: "Anonymized" },
  { id: "gemini", name: "Gemini 3.1", sub: "Google", color: "#4285F4", privacy: "Anonymized" },
  { id: "llama", name: "Llama 4", sub: "Meta OSS", color: T.purple, privacy: "Zero Visibility" },
  { id: "mistral", name: "Mistral Large", sub: "Mistral", color: "#F97316", privacy: "Zero Visibility" },
  { id: "deepseek", name: "DeepSeek v4", sub: "DeepSeek", color: T.cyan, privacy: "Anonymized" },
];

const AGENTS = [
  { id: "research", name: "Deep Research", icon: Search, desc: "Multi-source synthesis", color: T.blue },
  { id: "code", name: "Code Engineer", icon: Code2, desc: "Full-stack dev agent", color: T.green },
  { id: "docs", name: "Doc Generator", icon: FileText, desc: "Reports & decks", color: T.purple },
  { id: "data", name: "Data Analyst", icon: BarChart3, desc: "CSV/Excel analysis", color: T.yellow },
  { id: "workflow", name: "Workflow Bot", icon: Workflow, desc: "Task automation", color: T.accent },
  { id: "browser", name: "Web Navigator", icon: Globe, desc: "Private browser agent", color: T.cyan },
];

const INTEGRATIONS = [
  { name: "Slack", cat: "Comms", on: true }, { name: "Google Drive", cat: "Storage", on: true },
  { name: "Gmail", cat: "Email", on: true }, { name: "Notion", cat: "Docs", on: true },
  { name: "GitHub", cat: "Dev", on: true }, { name: "Jira", cat: "PM", on: false },
  { name: "Confluence", cat: "Wiki", on: true }, { name: "Teams", cat: "Comms", on: false },
];

const PRICING = [
  {
    tier: "Shield Free", price: "$0", period: "/mo", color: T.textMuted,
    badge: null, features: [
      "5 free AI models (Haiku, Llama Scout, Mistral Small, GPT-4o mini)",
      "Basic chat with anonymized queries", "No account required",
      "Daily usage limits", "Local chat storage only",
    ],
    cta: "Included with Duck.ai",
  },
  {
    tier: "Shield Plus", price: "$9.99", period: "/mo", color: T.blue,
    badge: "CURRENT DDG TIER", features: [
      "Everything in Free", "Premium models: GPT-5, Claude Sonnet 4, Llama Maverick",
      "Voice chat with encrypted relay", "Image generation + editing",
      "Higher usage limits", "VPN + ID protection bundle",
    ],
    cta: "Existing subscribers",
  },
  {
    tier: "Shield Pro", price: "$19.99", period: "/mo", color: T.purple,
    badge: "CURRENT DDG TIER", features: [
      "Everything in Plus", "Claude Opus + highest-tier reasoning",
      "2x usage limits vs Plus", "Priority model routing",
    ],
    cta: "Existing subscribers",
  },
  {
    tier: "Shield Teams", price: "$29.99", period: "/user/mo", color: T.accent,
    badge: "NEW REVENUE", highlight: true, features: [
      "Everything in Pro", "100+ models with intelligent auto-routing",
      "Autonomous AI agents (research, code, docs, data)",
      "Private code sandbox with ephemeral containers",
      "Enterprise integrations (Slack, Drive, GitHub, Jira)",
      "Team workspaces + admin controls", "SSO / SAML + audit logs",
      "Dedicated privacy compliance dashboard",
    ],
    cta: "The Shield AI product",
  },
  {
    tier: "Shield Enterprise", price: "Custom", period: "", color: T.yellow,
    badge: "NEW REVENUE", highlight: false, features: [
      "Everything in Teams", "On-premise / VPC deployment option",
      "Custom model fine-tuning on private data",
      "Dedicated infrastructure + SLA", "HIPAA / SOC2 / GDPR certified",
      "Custom agent workflows", "Priority support + CSM",
    ],
    cta: "Starting at $5,000/mo",
  },
];



const DEMO_CONVOS = {
  chat: [
    { role: "user", text: "Compare remote work policies across G7 nations since 2023" },
    { role: "system", text: "→ Routed to Claude 4.6 · PII stripped · Zero-log session" },
    { role: "ai", text: "Here's a comparative breakdown across 47 sources:\n\n🇺🇸 US: Remote stabilized at ~28%. GDP from remote-enabled sectors grew 3.2% YoY.\n\n🇩🇪 Germany: Return-to-office mandates reduced remote to ~18%, but manufacturing gains offset the shift.\n\n🇯🇵 Japan: Largest shift — remote went from 8% to 22%, correlated with 14% increase in women's workforce participation.\n\nWant a full report with citations, or want to focus on a specific nation?" },
  ],
  agents: [
    { role: "user", text: "Research top 5 privacy AI startups, build a competitive deck, and email it to my team" },
    { role: "system", text: "→ Agent chain: Research → Doc Gen → Email · ETA: 4 min · All ephemeral" },
    { role: "ai", text: "✅ Step 1/3 — Research complete\n23 companies analyzed, narrowed to top 5 by funding, privacy architecture, and traction.\n\n✅ Step 2/3 — Generating deck\n12-slide competitive analysis with market maps and feature comparison matrices.\n\n⏳ Step 3/3 — Preparing email\nAnonymized relay to team@company.com\n\nNo data retained after session ends." },
  ],
  code: [
    { role: "user", text: "Build a Python anomaly detection API for CSV uploads" },
    { role: "system", text: "→ Code sandbox · Python 3.12 · Isolated container · Nothing persists" },
    { role: "ai", text: "```python\nfrom fastapi import FastAPI, UploadFile\nimport pandas as pd\nfrom sklearn.ensemble import IsolationForest\n\napp = FastAPI()\n\n@app.post(\"/detect\")\nasync def detect(file: UploadFile):\n    df = pd.read_csv(file.file)\n    model = IsolationForest(contamination=0.1)\n    df['anomaly'] = model.fit_predict(\n        df.select_dtypes('number'))\n    return {\"anomalies\": len(df[df.anomaly==-1])}\n```\n\n▶ 3/3 tests passed · 0 data retained · Container destroyed" },
  ],
};

/* ═══════ BOTTOM NAV ═══════ */
const BottomNav = ({ active, setActive }) => {
  const items = [
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "agents", icon: Bot, label: "Agents" },
    { id: "code", icon: Terminal, label: "Code" },
    { id: "pricing", icon: DollarSign, label: "Pricing" },
    { id: "privacy", icon: Shield, label: "Privacy" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
      background: "rgba(8,12,20,0.92)", backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderTop: `1px solid ${T.border}`, padding: "6px 0 env(safe-area-inset-bottom, 8px)",
      display: "flex", justifyContent: "space-around",
    }}>
      {items.map(it => {
        const act = active === it.id;
        return (
          <button key={it.id} onClick={() => setActive(it.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer", padding: "6px 12px",
            minWidth: 56,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: act ? T.accentGlow : "transparent",
              transition: "all 0.2s",
            }}>
              <it.icon size={20} color={act ? T.accent : T.textDim} strokeWidth={act ? 2.5 : 1.8} />
            </div>
            <span style={{
              fontSize: 10, fontWeight: act ? 700 : 500,
              color: act ? T.accent : T.textDim,
              fontFamily: "'DM Sans'",
            }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

/* ═══════ MODEL PICKER (Sheet) ═══════ */
const ModelPicker = ({ selected, setSelected, open, setOpen }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
    }} onClick={() => setOpen(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: T.surface, borderRadius: "20px 20px 0 0",
        padding: "16px 16px env(safe-area-inset-bottom, 16px)",
        maxHeight: "70vh", overflowY: "auto",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 99, background: T.borderLight,
          margin: "0 auto 16px",
        }} />
        <h3 style={{ fontFamily: "'Outfit'", fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 4 }}>
          Select Model
        </h3>
        <p style={{ fontSize: 12, color: T.textDim, marginBottom: 16 }}>
          All queries anonymized before leaving your device
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MODELS.map(m => {
            const act = selected === m.id;
            return (
              <button key={m.id} onClick={() => { setSelected(m.id); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 12, padding: 14,
                background: act ? T.accentGlow : T.card,
                border: act ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                borderRadius: 14, cursor: "pointer", width: "100%",
                fontFamily: "'DM Sans'", textAlign: "left",
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", background: m.color,
                  boxShadow: `0 0 8px ${m.color}40`, flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ color: T.textDim, fontSize: 11 }}>{m.sub}</div>
                </div>
                {m.privacy && <Pill color={T.privacyGreen}><Lock size={8} /> {m.privacy}</Pill>}
                {act && <Check size={16} color={T.accent} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ═══════ CHAT MESSAGE ═══════ */
const ChatMsg = ({ role, text, idx }) => {
  const isUser = role === "user";
  const isSys = role === "system";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10, animation: `fadeUp 0.3s ease ${idx * 0.1}s both`,
      padding: "0 4px",
    }}>
      <div style={{
        maxWidth: isSys ? "100%" : "88%",
        padding: isSys ? "6px 12px" : "12px 16px",
        borderRadius: isSys ? 8 : isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isSys ? "rgba(222,88,51,0.06)" : isUser ? T.accent : T.card,
        border: isSys ? `1px solid rgba(222,88,51,0.15)` : isUser ? "none" : `1px solid ${T.border}`,
        color: isSys ? T.accentSoft : T.text,
        fontSize: isSys ? 11 : 14, lineHeight: 1.6,
        fontFamily: isSys ? "'JetBrains Mono', monospace" : "'DM Sans', sans-serif",
        whiteSpace: "pre-wrap",
      }}>
        {isSys && <Lock size={9} style={{ marginRight: 5, verticalAlign: "middle" }} />}
        {text}
      </div>
    </div>
  );
};

/* ═══════ CHAT VIEW ═══════ */
const ChatView = ({ tab }) => {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [model, setModel] = useState("auto");
  const [pickerOpen, setPickerOpen] = useState(false);
  const endRef = useRef(null);
  const key = tab === "agents" ? "agents" : tab === "code" ? "code" : "chat";

  useEffect(() => { setMsgs([]); setInput(""); }, [tab]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = useCallback(() => {
    if (!input.trim()) return;
    setMsgs(prev => [...prev, { role: "user", text: input }]);
    setInput(""); setTyping(true);
    const demo = DEMO_CONVOS[key];
    setTimeout(() => {
      setMsgs(prev => [...prev, demo[1]]);
      setTimeout(() => { setMsgs(prev => [...prev, demo[2]]); setTyping(false); }, 1200);
    }, 600);
  }, [input, key]);

  const prompts = key === "chat"
    ? ["Compare G7 remote work policies", "Summarize this PDF privately", "Draft a board memo"]
    : key === "agents"
    ? ["Research privacy AI startups", "Analyze my Q3 sales data", "Build a competitive deck"]
    : ["Build anomaly detection API", "Create a React dashboard", "Scrape and visualize dataset"];

  const selModel = MODELS.find(m => m.id === model);

  return (
    <>
      <ModelPicker selected={model} setSelected={setModel} open={pickerOpen} setOpen={setPickerOpen} />

      {/* Model selector bar */}
      <button onClick={() => setPickerOpen(true)} style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        padding: "10px 14px", background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans'", marginBottom: 12,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: selModel?.color }} />
        <span style={{ color: T.text, fontSize: 13, fontWeight: 600, flex: 1, textAlign: "left" }}>
          {selModel?.name}
        </span>
        <Pill color={T.privacyGreen}><Lock size={8} /> Encrypted</Pill>
        <ChevronDown size={14} color={T.textDim} />
      </button>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", paddingBottom: 16,
        minHeight: 0,
      }}>
        {msgs.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
              background: T.accentGlow, border: `1px solid ${T.accent}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {key === "chat" && <Brain size={26} color={T.accent} />}
              {key === "agents" && <Bot size={26} color={T.accent} />}
              {key === "code" && <Terminal size={26} color={T.accent} />}
            </div>
            <h3 style={{ fontFamily: "'Outfit'", fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6 }}>
              {key === "chat" && "Ask anything privately"}
              {key === "agents" && "Deploy an agent"}
              {key === "code" && "Code in a secure sandbox"}
            </h3>
            <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5, marginBottom: 20 }}>
              {key === "chat" && "100+ models · Intelligent routing · Every query anonymized"}
              {key === "agents" && "Multi-step workflows in ephemeral containers"}
              {key === "code" && "Python/JS execution · Container destroyed after session"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {prompts.map((p, i) => (
                <button key={i} onClick={() => setInput(p)} style={{
                  padding: "12px 16px", background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: 12, color: T.textMuted, fontSize: 13, cursor: "pointer",
                  fontFamily: "'DM Sans'", textAlign: "left", display: "flex",
                  alignItems: "center", gap: 8,
                }}>
                  <ArrowRight size={14} color={T.accent} style={{ flexShrink: 0 }} />
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => <ChatMsg key={i} role={m.role} text={m.text} idx={i} />)}

        {typing && (
          <div style={{ display: "flex", gap: 5, padding: 16 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%", background: T.textDim,
                animation: `typing 1.4s infinite ${i * 0.2}s`,
              }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center", padding: 10,
        background: T.card, borderRadius: 14, border: `1px solid ${T.border}`,
      }}>
        <Lock size={13} color={T.privacyGreen} style={{ flexShrink: 0 }} />
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={key === "chat" ? "Message Shield AI..." : key === "agents" ? "Describe a task..." : "What should we build?"}
          style={{
            flex: 1, background: "transparent", border: "none", color: T.text,
            fontSize: 15, fontFamily: "'DM Sans'", padding: "6px 0",
          }}
        />
        <button onClick={send} style={{
          width: 40, height: 40, borderRadius: 12, border: "none",
          background: input.trim() ? T.accent : T.surface,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: input.trim() ? "pointer" : "default",
        }}>
          <Send size={17} color={input.trim() ? "#fff" : T.textDim} />
        </button>
      </div>
    </>
  );
};

/* ═══════ AGENTS VIEW ═══════ */
const AgentsView = ({ onChat }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16 }}>
    <div style={{ marginBottom: 4 }}>
      <h2 style={{ fontFamily: "'Outfit'", fontSize: 22, fontWeight: 800, color: T.text }}>AI Agents</h2>
      <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Autonomous workflows with zero data retention</p>
    </div>
    {AGENTS.map(a => (
      <button key={a.id} onClick={onChat} style={{
        display: "flex", alignItems: "center", gap: 14, padding: 16,
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
        cursor: "pointer", width: "100%", fontFamily: "'DM Sans'", textAlign: "left",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: a.color + "14", border: `1px solid ${a.color}28`,
          flexShrink: 0,
        }}>
          <a.icon size={22} color={a.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: T.text, fontSize: 15, fontWeight: 600 }}>{a.name}</div>
          <div style={{ color: T.textDim, fontSize: 12 }}>{a.desc}</div>
        </div>
        <ChevronRight size={18} color={T.textDim} />
      </button>
    ))}

    {/* Integrations mini-section */}
    <div style={{ marginTop: 8 }}>
      <h3 style={{ fontFamily: "'Outfit'", fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 10 }}>
        Connected Tools
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {INTEGRATIONS.map((int, i) => (
          <div key={i} style={{
            padding: 12, background: T.card, borderRadius: 10,
            border: `1px solid ${T.border}`, display: "flex",
            alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans'" }}>{int.name}</div>
              <div style={{ color: T.textDim, fontSize: 10 }}>{int.cat}</div>
            </div>
            <Pill color={int.on ? T.privacyGreen : T.yellow}>
              {int.on ? "Live" : "Soon"}
            </Pill>
          </div>
        ))}
      </div>
    </div>

    {/* Privacy summary card */}
    <div style={{
      padding: 16, borderRadius: 14, marginTop: 8,
      background: "rgba(34,197,94,0.05)", border: `1px solid rgba(34,197,94,0.12)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Shield size={16} color={T.privacyGreen} />
        <span style={{ fontFamily: "'Outfit'", fontSize: 15, fontWeight: 700, color: T.text }}>Privacy Center</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { l: "Data retained", v: "0 bytes" },
          { l: "PII stripped", v: "100%" },
          { l: "Sessions", v: "Ephemeral" },
          { l: "Privacy overhead", v: "+12ms" },
        ].map((m, i) => (
          <div key={i} style={{
            padding: 10, background: T.surface, borderRadius: 10,
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ color: T.textDim, fontSize: 10, fontFamily: "'DM Sans'" }}>{m.l}</div>
            <div style={{ color: T.privacyGreen, fontSize: 18, fontWeight: 700, fontFamily: "'Outfit'" }}>{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════ PRICING VIEW ═══════ */
const PricingView = () => {
  const [expanded, setExpanded] = useState("Shield Teams");
  return (
    <div style={{ paddingBottom: 16 }}>
      <h2 style={{ fontFamily: "'Outfit'", fontSize: 22, fontWeight: 800, color: T.text }}>
        Pricing Model
      </h2>
      <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 16px", lineHeight: 1.5 }}>
        Extends DuckDuckGo's existing tiers with new enterprise revenue
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PRICING.map((p, i) => {
          const isOpen = expanded === p.tier;
          const isNew = p.badge === "NEW REVENUE";
          return (
            <div key={i} style={{
              background: p.highlight ? "rgba(222,88,51,0.05)" : T.card,
              border: `1px solid ${p.highlight ? T.accent + "40" : T.border}`,
              borderRadius: 16, overflow: "hidden",
              animation: p.highlight ? "glow 3s ease infinite" : undefined,
            }}>
              <button onClick={() => setExpanded(isOpen ? "" : p.tier)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: 16,
                width: "100%", background: "none", border: "none", cursor: "pointer",
                fontFamily: "'DM Sans'", textAlign: "left",
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", background: p.color,
                  boxShadow: `0 0 8px ${p.color}40`, flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>{p.tier}</span>
                    {p.badge && (
                      <Pill color={isNew ? T.accent : T.blue}>{p.badge}</Pill>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginTop: 2 }}>
                    <span style={{ color: T.text, fontSize: 22, fontWeight: 800, fontFamily: "'Outfit'" }}>{p.price}</span>
                    <span style={{ color: T.textDim, fontSize: 12 }}>{p.period}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={18} color={T.textDim} /> : <ChevronDown size={18} color={T.textDim} />}
              </button>

              {isOpen && (
                <div style={{ padding: "0 16px 16px", animation: "fadeUp 0.2s ease" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {p.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <Check size={14} color={p.color} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: 12, padding: 10, borderRadius: 10,
                    background: T.surface, border: `1px solid ${T.border}`,
                    textAlign: "center",
                  }}>
                    <span style={{ color: p.color, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans'" }}>
                      {p.cta}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Revenue projection callout */}
      <div style={{
        marginTop: 16, padding: 16, borderRadius: 14,
        background: T.accentGlow, border: `1px solid ${T.accent}30`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <TrendingUp size={16} color={T.accent} />
          <span style={{ fontFamily: "'Outfit'", fontSize: 15, fontWeight: 700, color: T.text }}>
            Revenue Impact
          </span>
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>
          At 2% conversion of DDG's 80M users to Shield Teams ($29.99/mo): <span style={{ color: T.accent, fontWeight: 700 }}>$653M ARR</span> in new enterprise revenue — 6.5x DDG's current total revenue.
        </p>
      </div>
    </div>
  );
};

/* ═══════ PRIVACY VIEW ═══════ */
const PrivacyView = () => {
  const architecture = [
    { step: "1", title: "You type a query", desc: "Your message stays on-device until encrypted", color: T.blue },
    { step: "2", title: "PII is stripped", desc: "IP address, device IDs, and metadata removed before transmission", color: T.purple },
    { step: "3", title: "Anonymized relay", desc: "Query passes through DDG's encrypted relay — providers never see who you are", color: T.accent },
    { step: "4", title: "Model responds", desc: "Response returned through the same encrypted tunnel", color: T.green },
    { step: "5", title: "Session destroyed", desc: "All data, context, and containers are permanently deleted", color: T.privacyGreen },
  ];

  const guarantees = [
    { label: "Zero data retention", desc: "No conversations, prompts, or outputs are ever stored on any server", icon: Database },
    { label: "Zero user profiles", desc: "No accounts required for free tier. Paid tiers use anonymized billing", icon: Users },
    { label: "Zero training data", desc: "Your conversations are never used to train any AI model, by anyone", icon: Brain },
    { label: "Zero provider visibility", desc: "Model providers cannot identify who sent a query or correlate sessions", icon: Eye },
    { label: "Ephemeral compute", desc: "Code sandboxes and agent containers are destroyed after every session", icon: Terminal },
    { label: "Contractual enforcement", desc: "All model providers are contractually bound to zero-retention terms", icon: FileText },
  ];

  return (
    <div style={{ paddingBottom: 16 }}>
      <h2 style={{ fontFamily: "'Outfit'", fontSize: 22, fontWeight: 800, color: T.text }}>
        Privacy Architecture
      </h2>
      <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 16px", lineHeight: 1.5 }}>
        How every query is protected, end to end
      </p>

      {/* Live metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { l: "Data retained", v: "0 bytes", c: T.privacyGreen },
          { l: "PII stripped", v: "100%", c: T.privacyGreen },
          { l: "Queries processed", v: "2.4M", c: T.text },
          { l: "Privacy overhead", v: "+12ms", c: T.text },
        ].map((m, i) => (
          <div key={i} style={{
            padding: 14, background: T.card, borderRadius: 12,
            border: "1px solid " + T.border,
            animation: "fadeUp 0.3s ease " + (i * 0.06) + "s both",
          }}>
            <div style={{ color: T.textDim, fontSize: 10, fontFamily: "'DM Sans'" }}>{m.l}</div>
            <div style={{ color: m.c, fontSize: 22, fontWeight: 800, fontFamily: "'Outfit'", marginTop: 2 }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Data flow */}
      <div style={{
        padding: 16, background: T.card, borderRadius: 14,
        border: "1px solid " + T.border, marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Lock size={16} color={T.privacyGreen} />
          <span style={{ fontFamily: "'Outfit'", fontSize: 15, fontWeight: 700, color: T.text }}>
            Query Lifecycle
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {architecture.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
              {/* Connector line */}
              {i < architecture.length - 1 && (
                <div style={{
                  position: "absolute", left: 15, top: 32, width: 2, height: "calc(100% - 16px)",
                  background: T.border,
                }} />
              )}
              <div style={{
                width: 32, height: 32, borderRadius: 99, flexShrink: 0,
                background: step.color + "18", border: "1px solid " + step.color + "35",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: step.color, fontSize: 13, fontWeight: 700, fontFamily: "'Outfit'",
                zIndex: 1,
              }}>{step.step}</div>
              <div style={{ paddingBottom: 16, flex: 1 }}>
                <div style={{ color: T.text, fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans'" }}>{step.title}</div>
                <div style={{ color: T.textDim, fontSize: 12, lineHeight: 1.4, marginTop: 2 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guarantees */}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ fontFamily: "'Outfit'", fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 10 }}>
          Privacy Guarantees
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {guarantees.map((g, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: 14,
              background: T.card, borderRadius: 12,
              border: "1px solid " + T.border,
              animation: "fadeUp 0.3s ease " + (i * 0.05) + "s both",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: T.greenGlow, border: "1px solid rgba(34,197,94,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <g.icon size={16} color={T.privacyGreen} />
              </div>
              <div>
                <div style={{ color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans'" }}>{g.label}</div>
                <div style={{ color: T.textDim, fontSize: 12, lineHeight: 1.4, marginTop: 2 }}>{g.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance badges */}
      <div style={{
        padding: 16, borderRadius: 14,
        background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Award size={16} color={T.privacyGreen} />
          <span style={{ fontFamily: "'Outfit'", fontSize: 15, fontWeight: 700, color: T.text }}>
            Compliance Ready
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["GDPR", "CCPA", "HIPAA", "SOC 2", "EU AI Act", "UK ICO"].map((badge, i) => (
            <div key={i} style={{
              padding: "6px 14px", borderRadius: 8,
              background: T.surface, border: "1px solid " + T.border,
              color: T.privacyGreen, fontSize: 12, fontWeight: 700,
              fontFamily: "'DM Sans'", letterSpacing: "0.03em",
            }}>{badge}</div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, marginTop: 12 }}>
          Shield AI is designed from the ground up to meet the strictest regulatory requirements across all major jurisdictions.
        </p>
      </div>
    </div>
  );
};

/* ═══════ SPLASH SCREEN ═══════ */
const Splash = ({ onLaunch }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 100,
    background: T.bg, display: "flex", alignItems: "center",
    justifyContent: "center",
  }}>
    <div style={{ padding: "32px 24px", textAlign: "center", maxWidth: 380, animation: "fadeUp 0.6s ease" }}>
      <div style={{
        width: 72, height: 72, borderRadius: 18, margin: "0 auto 24px",
        background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 8px 40px ${T.accentGlow}`,
        animation: "glow 3s ease infinite",
      }}>
        <Shield size={36} color="#fff" />
      </div>
      <h1 style={{
        fontFamily: "'Outfit'", fontSize: 32, fontWeight: 900,
        letterSpacing: "-0.02em", color: T.text, marginBottom: 4,
      }}>Shield AI</h1>
      <p style={{
        color: T.accent, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", marginBottom: 20,
      }}>by DuckDuckGo</p>
      <p style={{ color: T.textMuted, fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
        Every frontier AI model. Autonomous agents. Code execution. Enterprise integrations.
      </p>
      <p style={{ color: T.privacyGreen, fontSize: 14, fontWeight: 700, marginBottom: 32 }}>
        Zero data retention. Zero tracking. Zero compromise.
      </p>

      <button onClick={onLaunch} style={{
        padding: "14px 0", width: "100%", background: T.accent, color: "#fff",
        border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700,
        cursor: "pointer", fontFamily: "'DM Sans'",
        boxShadow: `0 4px 24px ${T.accentGlow}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        Launch Demo <ArrowRight size={18} />
      </button>

      <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 28 }}>
        {[["100+", "Models"], ["0", "Data Stored"], ["12ms", "Overhead"]].map(([v, l], i) => (
          <div key={i}>
            <div style={{ color: T.text, fontSize: 20, fontWeight: 800, fontFamily: "'Outfit'" }}>{v}</div>
            <div style={{ color: T.textDim, fontSize: 10 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════ MAIN APP ═══════ */
export default function ShieldAIMobile() {
  const [launched, setLaunched] = useState(false);
  const [tab, setTab] = useState("chat");

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      fontFamily: "'DM Sans', sans-serif", maxWidth: 480,
      margin: "0 auto", position: "relative",
    }}>
      <GlobalStyles />

      {!launched && <Splash onLaunch={() => setLaunched(true)} />}

      {launched && (
        <>
          {/* Header */}
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", position: "sticky", top: 0, zIndex: 50,
            background: "rgba(8,12,20,0.9)", backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Shield size={17} color="#fff" />
              </div>
              <div>
                <span style={{ fontFamily: "'Outfit'", fontSize: 16, fontWeight: 700 }}>Shield AI</span>
                <span style={{ color: T.textDim, fontSize: 10, marginLeft: 6 }}>by DDG</span>
              </div>
            </div>
            <PrivacyBadge />
          </header>

          {/* Content */}
          <main style={{
            padding: "12px 16px 100px",
            display: "flex", flexDirection: "column",
            minHeight: "calc(100vh - 120px)",
          }}>
            {(tab === "chat" || tab === "code") && <ChatView tab={tab} />}
            {tab === "agents" && <AgentsView onChat={() => setTab("chat")} />}
            {tab === "pricing" && <PricingView />}
            {tab === "privacy" && <PrivacyView />}
          </main>

          <BottomNav active={tab} setActive={setTab} />
        </>
      )}
    </div>
  );
}
