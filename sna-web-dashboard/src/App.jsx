import React, { useState, useEffect } from 'react';

const BASE_URL = 'https://backendsna-py-387510652840.asia-southeast2.run.app';

// --- Injected Google Fonts & Global Styles ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Syne:wght@700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-deep:    #060a14;
      --bg-card:    #0d1525;
      --bg-card2:   #111c30;
      --border:     rgba(56, 189, 248, 0.12);
      --border-glow:rgba(56, 189, 248, 0.35);
      --cyan:       #38bdf8;
      --cyan-dim:   rgba(56, 189, 248, 0.15);
      --cyan-glow:  rgba(56, 189, 248, 0.08);
      --teal:       #2dd4bf;
      --violet:     #818cf8;
      --text-primary: #e2eaf7;
      --text-muted:   #6b8099;
      --text-accent:  #38bdf8;
      --success:    #34d399;
      --danger:     #f87171;
      --font-head:  'Syne', sans-serif;
      --font-body:  'Space Grotesk', sans-serif;
      --font-mono:  'JetBrains Mono', monospace;
    }

    body { background: var(--bg-deep); color: var(--text-primary); font-family: var(--font-body); }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.25); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.5); }

    /* Animations */
    @keyframes pulse-ring {
      0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56,189,248,0.4); }
      70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(56,189,248,0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56,189,248,0); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes gridPan {
      0%   { background-position: 0 0; }
      100% { background-position: 40px 40px; }
    }
    @keyframes scanline {
      0%   { top: -10%; }
      100% { top: 110%; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: scale(0.8); }
      to   { opacity: 1; transform: scale(1); }
    }

    .fade-slide-up { animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    .fade-slide-up-2 { animation: fadeSlideUp 0.5s 0.08s cubic-bezier(0.22,1,0.36,1) both; }
    .fade-slide-up-3 { animation: fadeSlideUp 0.5s 0.16s cubic-bezier(0.22,1,0.36,1) both; }
    .count-up { animation: countUp 0.4s 0.2s cubic-bezier(0.34,1.56,0.64,1) both; }

    /* Grid background */
    .grid-bg {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      animation: gridPan 8s linear infinite;
    }

    /* Glow blobs */
    .blob-tl {
      position: fixed; top: -200px; left: -200px;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%);
      pointer-events: none; z-index: 0;
    }
    .blob-br {
      position: fixed; bottom: -200px; right: -200px;
      width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%);
      pointer-events: none; z-index: 0;
    }

    /* Scanline effect on iframe */
    .scanline-wrap { position: relative; overflow: hidden; }
    .scanline-wrap::after {
      content: '';
      position: absolute; left: 0; right: 0; height: 80px;
      background: linear-gradient(transparent, rgba(56,189,248,0.04), transparent);
      animation: scanline 5s linear infinite;
      pointer-events: none; z-index: 1;
    }

    /* Card styles */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .card:hover { border-color: var(--border-glow); box-shadow: 0 0 20px rgba(56,189,248,0.06); }

    /* Stat card */
    .stat-card {
      background: var(--bg-card2);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px 24px;
      position: relative; overflow: hidden;
      transition: all 0.25s;
    }
    .stat-card::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--cyan-dim) 0%, transparent 60%);
      opacity: 0; transition: opacity 0.25s;
    }
    .stat-card:hover { border-color: var(--border-glow); transform: translateY(-2px); }
    .stat-card:hover::before { opacity: 1; }

    /* Tab */
    .tab-btn {
      position: relative; padding: 10px 20px;
      background: transparent; border: 1px solid transparent;
      border-radius: 8px; cursor: pointer;
      font-family: var(--font-body); font-size: 13.5px; font-weight: 500;
      color: var(--text-muted); transition: all 0.2s;
      letter-spacing: 0.02em;
    }
    .tab-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }
    .tab-btn.active {
      color: var(--cyan);
      background: rgba(56,189,248,0.08);
      border-color: rgba(56,189,248,0.25);
    }
    .tab-btn.active::after {
      content: ''; position: absolute; bottom: -1px; left: 10%; right: 10%; height: 2px;
      background: var(--cyan); border-radius: 2px;
      box-shadow: 0 0 8px var(--cyan);
    }

    /* Input & Select */
    .ctrl-input, .ctrl-select {
      background: var(--bg-deep);
      border: 1px solid var(--border);
      color: var(--text-primary);
      border-radius: 8px; padding: 9px 14px;
      font-family: var(--font-body); font-size: 14px;
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
      appearance: none; -webkit-appearance: none;
    }
    .ctrl-input:focus, .ctrl-select:focus {
      border-color: var(--cyan);
      box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
    }
    .ctrl-select { padding-right: 36px; cursor: pointer; }
    .select-wrap { position: relative; display: inline-block; }
    .select-wrap::after {
      content: '▾'; position: absolute; right: 12px; top: 50%;
      transform: translateY(-50%); color: var(--cyan); pointer-events: none;
      font-size: 12px;
    }

    /* Apply button */
    .apply-btn {
      background: linear-gradient(135deg, #0ea5e9, #2563eb);
      color: #fff; border: none; border-radius: 8px;
      padding: 10px 22px; font-family: var(--font-body);
      font-size: 14px; font-weight: 600; cursor: pointer;
      letter-spacing: 0.03em; transition: all 0.2s;
      position: relative; overflow: hidden;
      box-shadow: 0 0 20px rgba(14,165,233,0.25);
    }
    .apply-btn::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
      opacity: 0; transition: opacity 0.2s;
    }
    .apply-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 24px rgba(14,165,233,0.4); }
    .apply-btn:hover::before { opacity: 1; }
    .apply-btn:active { transform: translateY(0); }

    /* Loading spinner */
    .spinner {
      width: 36px; height: 36px; border-radius: 50%;
      border: 3px solid var(--bg-card2);
      border-top-color: var(--cyan);
      animation: spin 0.8s linear infinite;
    }

    /* Shimmer loader */
    .shimmer {
      background: linear-gradient(90deg, var(--bg-card2) 25%, rgba(56,189,248,0.07) 50%, var(--bg-card2) 75%);
      background-size: 800px 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }

    /* JSON pre */
    .json-pre {
      background: #030711;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      font-family: var(--font-mono);
      font-size: 12.5px;
      line-height: 1.7;
      color: #7dd3fc;
      overflow-x: auto;
      max-height: 400px;
    }

    /* Badge */
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
      font-family: var(--font-mono);
    }
    .badge-cyan { background: rgba(56,189,248,0.12); color: var(--cyan); border: 1px solid rgba(56,189,248,0.2); }
    .badge-teal { background: rgba(45,212,191,0.12); color: var(--teal); border: 1px solid rgba(45,212,191,0.2); }

    /* Live dot */
    .live-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--success);
      animation: pulse-ring 2s ease-out infinite;
      display: inline-block;
    }

    /* Status bar */
    .status-bar {
      font-family: var(--font-mono); font-size: 11px;
      color: var(--text-muted);
      display: flex; align-items: center; gap: 16px;
    }

    label.ctrl-label {
      display: block; font-size: 11px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--text-muted); margin-bottom: 6px;
    }

    /* Neon border top */
    .neon-top {
      position: relative;
    }
    .neon-top::before {
      content: '';
      position: absolute; top: 0; left: 5%; right: 5%; height: 1px;
      background: linear-gradient(90deg, transparent, var(--cyan), transparent);
      box-shadow: 0 0 10px var(--cyan);
    }
  `}</style>
);

// --- Icon components ---
const IconNetwork = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
    <line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/><line x1="5" y1="19" x2="19" y2="19"/>
  </svg>
);
const IconDatabase = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0018 0V5"/><path d="M3 12a9 3 0 0018 0"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconSliders = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
    <circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// --- Tab configuration ---
const TABS = [
  { id: 'ss-visualize', label: 'Visualisasi SS',  icon: <IconEye />,      tag: 'SS' },
  { id: 'ig-visualize', label: 'Visualisasi IG',  icon: <IconEye />,      tag: 'IG' },
  { id: 'ss-analyze',   label: 'Data SS Graph',   icon: <IconDatabase />, tag: 'JSON' },
  { id: 'ig-analyze',   label: 'Data IG Graph',   icon: <IconDatabase />, tag: 'JSON' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('ss-visualize');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputMode, setInputMode] = useState(2);
  const [inputLimit, setInputLimit] = useState(1000);
  const [appliedConfig, setAppliedConfig] = useState({ mode: 2, limit: 1000 });
  const [timestamp, setTimestamp] = useState('');

  const fetchAnalysisData = async (type, config) => {
    if (type !== 'ss-analyze' && type !== 'ig-analyze') return;
    setLoading(true); setError(null); setAnalysisData(null);
    try {
      let response;
      if (type === 'ss-analyze') {
        response = await fetch(`${BASE_URL}/snagraph`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: Number(config.limit), mode: Number(config.mode) })
        });
      } else {
        response = await fetch(`${BASE_URL}/sna/neo4j/analyze?mode=${config.mode}&limit=${config.limit}`);
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAnalysisData(data);
      setTimestamp(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => { setActiveTab(tab); fetchAnalysisData(tab, appliedConfig); };
  const handleApplyConfig = () => {
    const c = { mode: Number(inputMode), limit: Number(inputLimit) };
    setAppliedConfig(c);
    fetchAnalysisData(activeTab, c);
  };

  useEffect(() => { fetchAnalysisData(activeTab, appliedConfig); }, []);// eslint-disable-line

  const isDataTab = activeTab === 'ss-analyze' || activeTab === 'ig-analyze';

  return (
    <>
      <GlobalStyles />
      <div className="grid-bg" />
      <div className="blob-tl" />
      <div className="blob-br" />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── HEADER ── */}
        <header className="neon-top" style={{
          background: 'rgba(6,10,20,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 32px',
          height: 70,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(14,165,233,0.4)',
            }}>
              <IconNetwork />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                Network Analysis
                <span style={{ color: 'var(--cyan)', marginLeft: 6 }}>Dashboard</span>
              </h1>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>
                Suara Surabaya Social Network
              </p>
            </div>
          </div>

          <div className="status-bar">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="live-dot" />
              <span>LIVE</span>
            </span>
            <span>MODE <span style={{ color: 'var(--cyan)' }}>{appliedConfig.mode}</span></span>
            <span>LIMIT <span style={{ color: 'var(--cyan)' }}>{appliedConfig.limit.toLocaleString()}</span></span>
            {timestamp && <span>UPDATED <span style={{ color: 'var(--teal)' }}>{timestamp}</span></span>}
          </div>
        </header>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Control Panel */}
          <div className="card fade-slide-up" style={{ padding: '18px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
                <span style={{ color: 'var(--cyan)', opacity: 0.7 }}><IconSliders /></span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Parameter</span>
              </div>

              <div>
                <label className="ctrl-label">Mode Grafik</label>
                <div className="select-wrap">
                  <select className="ctrl-select" value={inputMode} onChange={e => setInputMode(e.target.value)} style={{ minWidth: 170 }}>
                    <option value={1}>Mode 1 — User → User</option>
                    <option value={2}>Mode 2 — User → Post</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="ctrl-label">Limit Nodes</label>
                <input
                  type="number"
                  className="ctrl-input"
                  value={inputLimit}
                  onChange={e => setInputLimit(e.target.value)}
                  style={{ width: 120 }}
                />
              </div>

              <button className="apply-btn" onClick={handleApplyConfig} style={{ marginBottom: 1 }}>
                Terapkan <IconChevronRight />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="fade-slide-up-2" style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border)', paddingBottom: 1 }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {tab.icon}
                  {tab.label}
                  <span className={`badge ${tab.tag === 'JSON' ? 'badge-teal' : 'badge-cyan'}`}>{tab.tag}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="card fade-slide-up-3 scanline-wrap" style={{ flex: 1, minHeight: 600, position: 'relative', overflow: 'hidden' }}>

            {/* iFrame views */}
            {activeTab === 'ss-visualize' && (
              <iframe
                key={`ss-${appliedConfig.mode}-${appliedConfig.limit}`}
                src={`${BASE_URL}/snagraph/visualize?mode=${appliedConfig.mode}&limit=${appliedConfig.limit}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                title="SS Graph Visualization"
              />
            )}
            {activeTab === 'ig-visualize' && (
              <iframe
                key={`ig-${appliedConfig.mode}-${appliedConfig.limit}`}
                src={`${BASE_URL}/sna/neo4j/visualize?mode=${appliedConfig.mode}&limit=${appliedConfig.limit}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                title="IG Graph Visualization"
              />
            )}

            {/* JSON / data views */}
            {isDataTab && (
              <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '28px 32px' }}>

                {loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 18 }}>
                    <div className="spinner" />
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                      MEMUAT DATA DARI SERVER...
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '60%', marginTop: 8 }}>
                      {[80, 65, 90].map((w, i) => (
                        <div key={i} className="shimmer" style={{ height: 14, width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                )}

                {error && !loading && (
                  <div style={{
                    background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                    borderRadius: 10, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>⚠</span>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--danger)', fontSize: 13 }}>Koneksi Gagal</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{error}</p>
                    </div>
                  </div>
                )}

                {analysisData && !loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                      {[
                        {
                          label: 'Total Nodes',
                          value: (analysisData.meta?.total_nodes || analysisData.graph_info?.nodes_count || 0).toLocaleString(),
                          color: 'var(--cyan)', icon: '◈',
                        },
                        {
                          label: 'Total Edges',
                          value: (analysisData.meta?.total_edges || analysisData.graph_info?.edges_count || 0).toLocaleString(),
                          color: 'var(--teal)', icon: '⇄',
                        },
                        {
                          label: 'Mode Aktif',
                          value: `Mode ${appliedConfig.mode}`,
                          color: 'var(--violet)', icon: '◎',
                        },
                        {
                          label: 'Data Limit',
                          value: appliedConfig.limit.toLocaleString(),
                          color: '#fb923c', icon: '▦',
                        },
                      ].map((s, i) => (
                        <div key={i} className="stat-card count-up" style={{ animationDelay: `${i * 0.07}s` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                              {s.label}
                            </p>
                            <span style={{ fontSize: 18, color: s.color, opacity: 0.7 }}>{s.icon}</span>
                          </div>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Raw JSON */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                          Raw JSON Response
                        </h3>
                        <span className="badge badge-teal">
                          <span style={{ fontSize: 9 }}>●</span> LIVE DATA
                        </span>
                      </div>
                      <pre className="json-pre">
                        {JSON.stringify(analysisData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: '1px solid var(--border)', padding: '12px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(6,10,20,0.8)', backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            SNA Dashboard · Suara Surabaya
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {BASE_URL.replace('https://', '')}
          </span>
        </footer>

      </div>
    </>
  );
}