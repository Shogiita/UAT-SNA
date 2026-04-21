import React, { useState, useEffect, useRef } from 'react';
import { Network } from 'vis-network';

const BASE_URL = 'https://backendsna-py-387510652840.asia-southeast2.run.app';

// --- Kumpulan Ikon ---
const IconNetwork = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
    <line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/><line x1="5" y1="19" x2="19" y2="19"/>
  </svg>
);
const IconDatabase = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0018 0V5"/><path d="M3 12a9 3 0 0018 0"/>
  </svg>
);
const IconEye = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconSliders = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
    <circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>
  </svg>
);
const IconCopy = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
const IconCode = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);
const IconLayout = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

// --- Konfigurasi Tab ---
const TABS = [
  { id: 'ss-visualize', label: 'Visualisasi SS',  icon: <IconEye />,      tag: 'HTML' },
  { id: 'ig-visualize', label: 'Visualisasi IG',  icon: <IconEye />,      tag: 'HTML' },
  { id: 'ss-analyze',   label: 'Data SS Graph',   icon: <IconDatabase />, tag: 'DATA' },
  { id: 'ig-analyze',   label: 'Data IG Graph',   icon: <IconDatabase />, tag: 'DATA' },
];

// --- Syntax Highlighting untuk JSON ---
const highlightJSON = (jsonObj) => {
  if (!jsonObj) return '';
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'text-orange-400'; 
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-blue-300'; 
      } else {
        cls = 'text-emerald-400'; 
      }
    } else if (/true|false/.test(match)) {
      cls = 'text-purple-400 font-bold'; 
    } else if (/null/.test(match)) {
      cls = 'text-red-400 font-bold'; 
    }
    return `<span class="${cls}">${match}</span>`;
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState('ss-visualize');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // States untuk kontrol layout & tampilan
  const [inputMode, setInputMode] = useState(2);
  const [inputLimit, setInputLimit] = useState(100);
  const [appliedConfig, setAppliedConfig] = useState({ mode: 2, limit: 100 });
  const [timestamp, setTimestamp] = useState('');
  
  const [dataViewMode, setDataViewMode] = useState('graph'); // 'graph' atau 'json'
  const [graphLayout, setGraphLayout] = useState('force'); // 'force', 'hierarchical-ud', 'hierarchical-lr'
  const networkContainerRef = useRef(null);
  const networkInstanceRef = useRef(null);

  const fetchAnalysisData = async (type, config) => {
    if (type !== 'ss-analyze' && type !== 'ig-analyze') return;
    
    setLoading(true); 
    setError(null); 
    setAnalysisData(null);
    setCopied(false);
    
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
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();
      setAnalysisData(data);
      setTimestamp(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => { 
    setActiveTab(tab); 
    fetchAnalysisData(tab, appliedConfig); 
  };
  
  const handleApplyConfig = () => {
    const config = { mode: Number(inputMode), limit: Number(inputLimit) };
    setAppliedConfig(config);
    fetchAnalysisData(activeTab, config);
  };

  const handleCopyJSON = () => {
    if (analysisData) {
      navigator.clipboard.writeText(JSON.stringify(analysisData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => { 
    fetchAnalysisData(activeTab, appliedConfig); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect untuk merender Graph Vis-Network
  useEffect(() => {
    if (dataViewMode === 'graph' && analysisData && networkContainerRef.current) {
      const rawNodes = analysisData.graph_info?.nodes || analysisData.graph_data?.nodes || [];
      const rawEdges = analysisData.graph_info?.edges || analysisData.graph_data?.edges || [];

      // Mapping Nodes
      const nodes = rawNodes.map(n => {
        const type = n.attributes?.type || 'unknown';
        const degree = n.metrics?.degree || 0.001;
        
        let shape = 'dot';
        if (type.includes('post')) shape = 'square';
        if (type.includes('comment')) shape = 'triangle';
        
        return {
          id: n.id,
          label: n.attributes?.label || n.attributes?.name || n.id,
          group: n.attributes?.community || 0,
          value: degree * 1000 + 10, // Scaling ukuran berdasarkan degree centrality
          title: `<b>ID:</b> ${n.id}<br><b>Type:</b> ${type}<br><b>Community:</b> ${n.attributes?.community || 0}`,
          shape: shape,
        };
      });

      // Mapping Edges
      const edges = rawEdges.map(e => ({
        from: e.source,
        to: e.target,
        title: e.attributes?.relation || 'Interaction',
        arrows: 'to',
      }));

      const data = { nodes, edges };

      // Konfigurasi Layout
      const options = {
        layout: {
          hierarchical: graphLayout !== 'force' ? {
            enabled: true,
            direction: graphLayout === 'hierarchical-ud' ? 'UD' : 'LR',
            sortMethod: 'directed',
            nodeSpacing: 150,
            levelSeparation: 200
          } : false
        },
        physics: {
          enabled: graphLayout === 'force',
          forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springLength: 100,
            springConstant: 0.08,
          },
          solver: 'forceAtlas2Based',
        },
        nodes: {
          scaling: { min: 10, max: 40 },
          font: { size: 12, face: 'Inter, sans-serif' }
        },
        edges: {
          color: { inherit: 'both' },
          smooth: { type: graphLayout === 'force' ? 'continuous' : 'cubicBezier' }
        },
        interaction: { hover: true, tooltipDelay: 200 }
      };

      // Inisialisasi network
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
      }
      networkInstanceRef.current = new Network(networkContainerRef.current, data, options);
    }
    
    return () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
        networkInstanceRef.current = null;
      }
    };
  }, [analysisData, dataViewMode, graphLayout]);

  const isDataTab = activeTab === 'ss-analyze' || activeTab === 'ig-analyze';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .code-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .code-scroll::-webkit-scrollbar-track { background: #0f172a; border-radius: 8px; }
        .code-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; border: 2px solid #0f172a; }
        
        .vis-tooltip {
          background-color: #1e293b !important;
          color: #f8fafc !important;
          border: 1px solid #475569 !important;
          border-radius: 8px !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          font-size: 12px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <IconNetwork />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-tight">Network Analysis</h1>
            <p className="text-xs font-medium text-slate-500">Suara Surabaya Social Network</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 shadow-inner">
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            LIVE
          </div>
          <div className="w-px h-4 bg-slate-300" />
          <span>MODE <span className="text-blue-600 font-bold bg-blue-100 px-1.5 py-0.5 rounded">{appliedConfig.mode}</span></span>
          <div className="w-px h-4 bg-slate-300" />
          <span>LIMIT <span className="text-blue-600 font-bold bg-blue-100 px-1.5 py-0.5 rounded">{appliedConfig.limit.toLocaleString()}</span></span>
          {timestamp && (
            <>
              <div className="w-px h-4 bg-slate-300" />
              <span>UPDATED <span className="text-slate-700">{timestamp}</span></span>
            </>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Control Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-5">
          <div className="flex items-center gap-2 text-slate-600 pr-2">
            <IconSliders />
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Parameter Request</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mode Grafik</label>
            <select 
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-48 p-2.5 outline-none transition-all"
              value={inputMode} onChange={e => setInputMode(e.target.value)}
            >
              <option value={1}>1 — User ke User</option>
              <option value={2}>2 — User ke Post</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Limit Data (Nodes)</label>
            <input
              type="number"
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-32 p-2.5 outline-none transition-all"
              value={inputLimit} onChange={e => setInputLimit(e.target.value)}
            />
          </div>

          <button 
            onClick={handleApplyConfig}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm px-6 py-2.5 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:scale-95"
          >
            Ambil Data
          </button>
        </div>

        {/* Tabs Utama */}
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto custom-scroll">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{tab.icon}</span>
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  tab.tag === 'DATA' ? (isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500') : (isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500')
                }`}>
                  {tab.tag}
                </span>
              </button>
            )
          })}
        </div>

        {/* Area Konten Bawah */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden min-h-[650px] flex flex-col">
          
          {/* TAMPILAN 1: iFrame (Visualisasi Backend Statis) */}
          {activeTab === 'ss-visualize' && (
            <iframe
              key={`ss-${appliedConfig.mode}-${appliedConfig.limit}`}
              src={`${BASE_URL}/snagraph/visualize?mode=${appliedConfig.mode}&limit=${appliedConfig.limit}`}
              className="absolute inset-0 w-full h-full border-0" title="SS Graph"
            />
          )}
          {activeTab === 'ig-visualize' && (
            <iframe
              key={`ig-${appliedConfig.mode}-${appliedConfig.limit}`}
              src={`${BASE_URL}/sna/neo4j/visualize?mode=${appliedConfig.mode}&limit=${appliedConfig.limit}`}
              className="absolute inset-0 w-full h-full border-0" title="IG Graph"
            />
          )}

          {/* TAMPILAN 2: Data View (Visualisasi Interaktif Frontend / Raw JSON) */}
          {isDataTab && (
            <div className="absolute inset-0 overflow-y-auto custom-scroll p-6 md:p-8 bg-slate-50/50 flex flex-col">
              
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-slate-600 mt-4 animate-pulse">Menghitung dan memuat data...</p>
                </div>
              )}

              {error && !loading && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3 shadow-sm mb-6">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h3 className="font-bold text-red-800">Gagal memuat data</h3>
                    <p className="text-sm opacity-90 mt-1 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {analysisData && !loading && (
                <div className="flex flex-col gap-6 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Nodes', value: analysisData.meta?.total_nodes || analysisData.graph_info?.nodes_count || 0, color: 'text-blue-700', border: 'border-blue-200', bg: 'from-blue-100 to-transparent' },
                      { label: 'Total Edges', value: analysisData.meta?.total_edges || analysisData.graph_info?.edges_count || 0, color: 'text-indigo-700', border: 'border-indigo-200', bg: 'from-indigo-100 to-transparent' },
                      { label: 'Mode Aktif', value: appliedConfig.mode, color: 'text-slate-800', border: 'border-slate-200', bg: 'from-slate-100 to-transparent' },
                      { label: 'Data Limit', value: appliedConfig.limit, color: 'text-slate-800', border: 'border-slate-200', bg: 'from-slate-100 to-transparent' },
                    ].map((stat, i) => (
                      <div key={i} className={`bg-white p-5 rounded-xl border ${stat.border} shadow-sm relative overflow-hidden flex flex-col justify-center`}>
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${stat.bg} opacity-50 rounded-bl-full -mr-4 -mt-4`} />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1 z-10">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color} z-10 tracking-tight`}>{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Panel Pengalih Mode (Visualisasi vs JSON) */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm gap-4">
                    <div className="flex p-1 bg-slate-100 rounded-md">
                      <button
                        onClick={() => setDataViewMode('graph')}
                        className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-all ${
                          dataViewMode === 'graph' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <IconLayout /> Visualisasi Lokal
                      </button>
                      <button
                        onClick={() => setDataViewMode('json')}
                        className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-all ${
                          dataViewMode === 'json' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <IconCode /> Raw JSON
                      </button>
                    </div>

                    {/* Jika sedang mode Graph, tampilkan pilihan Algoritma Layout */}
                    {dataViewMode === 'graph' && (
                      <div className="flex items-center gap-3 px-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Layout Model:</span>
                        <select 
                          className="text-sm bg-slate-50 border border-slate-200 rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={graphLayout} 
                          onChange={(e) => setGraphLayout(e.target.value)}
                        >
                          <option value="force">Force Directed (Atlas2)</option>
                          <option value="hierarchical-ud">Hierarchical (Top-Down)</option>
                          <option value="hierarchical-lr">Hierarchical (Left-Right)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* WADAH TAMPILAN UTAMA (Graph atau JSON) */}
                  <div className="flex-1 bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden flex flex-col min-h-[500px]">
                    
                    {/* Mode GRAFIK */}
                    <div className={`${dataViewMode === 'graph' ? 'block' : 'hidden'} flex-1 relative`}>
                      <div ref={networkContainerRef} className="absolute inset-0 outline-none" />
                      
                      {/* Petunjuk Interaksi */}
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-slate-200 px-4 py-3 rounded-lg shadow-lg pointer-events-none">
                        <p className="text-xs font-bold text-slate-700 mb-1">💡 Tips Interaksi:</p>
                        <ul className="text-[11px] text-slate-500 list-disc list-inside">
                          <li>Scroll untuk Zoom In/Out</li>
                          <li>Tarik (Drag) node untuk memindahkan</li>
                          <li>Arahkan cursor ke node/garis untuk detail</li>
                        </ul>
                      </div>
                    </div>

                    {/* Mode RAW JSON (Code Editor Mockup) */}
                    {dataViewMode === 'json' && (
                      <div className="flex-1 flex flex-col h-full">
                        <div className="bg-slate-100 border-b border-slate-300 px-4 py-3 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"></div>
                              <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></div>
                              <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500/20"></div>
                            </div>
                            <span className="text-[13px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {activeTab}.json
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-1 rounded shadow-sm">200 OK</span>
                            <button onClick={handleCopyJSON} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-300 px-2.5 py-1.5 rounded-md shadow-sm transition-all active:scale-95">
                              {copied ? <IconCheck /> : <IconCopy />}
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 bg-[#0f172a] p-5 overflow-auto max-h-[600px] code-scroll relative">
                          <pre className="text-[13px] text-slate-300 font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightJSON(analysisData) }} />
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 flex justify-between items-center text-xs text-slate-400 font-medium mt-auto">
        <span>SNA Dashboard · Sistem Terintegrasi Suara Surabaya</span>
        <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-md text-slate-500 border border-slate-200">{BASE_URL}</span>
      </footer>

    </div>
  );
}