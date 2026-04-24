'use client';

import { useState } from 'react';

const SAMPLE_INPUT = `A->B
A->C
B->D
C->E
E->F
X->Y
Y->Z
Z->X
P->Q
Q->R
G->H
G->H
G->I
hello
1->2
A->`;

type HierarchyNode = { [key: string]: HierarchyNode };

interface Hierarchy {
  root: string;
  tree: HierarchyNode;
  depth?: number;
  has_cycle?: boolean;
}

interface ApiResponse {
  user_id: string;
  email_id: string;
  college_roll_number: string;
  hierarchies: Hierarchy[];
  invalid_entries: string[];
  duplicate_edges: string[];
  summary: {
    total_trees: number;
    total_cycles: number;
    largest_tree_root: string | null;
  };
}

function TreeNode({ label, children, depth = 0 }: { label: string; children: HierarchyNode; depth?: number }) {
  const childKeys = Object.keys(children);
  const colors = ['#60a5fa', '#34d399', '#f59e0b', '#a78bfa', '#f472b6', '#38bdf8'];
  const color = colors[depth % colors.length];

  return (
    <div className="tree-node" style={{ paddingLeft: depth === 0 ? 0 : '24px', position: 'relative' }}>
      {depth > 0 && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '16px',
          width: '16px',
          height: '2px',
          background: 'rgba(255,255,255,0.15)',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: `${color}22`,
          border: `1.5px solid ${color}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '700',
          color,
          fontFamily: 'monospace',
          flexShrink: 0,
        }}>
          {label}
        </div>
        {childKeys.length > 0 && (
          <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
        )}
      </div>
      {childKeys.length > 0 && (
        <div style={{
          borderLeft: '1.5px solid rgba(255,255,255,0.08)',
          marginLeft: '13px',
          paddingLeft: '0px',
        }}>
          {childKeys.map(child => (
            <TreeNode key={child} label={child} children={children[child]} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'trees' | 'raw'>('trees');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const data = input.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/bfhl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setResult(json);
      setActiveTab('trees');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0c0c0e;
          color: #e4e4e7;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
        }

        .app-shell {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        .topbar {
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 14px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.02);
        }

        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #60a5fa;
          box-shadow: 0 0 8px #60a5fa88;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .brand-name {
          font-size: 15px;
          font-weight: 600;
          color: #f4f4f5;
          letter-spacing: -0.3px;
        }

        .brand-badge {
          font-size: 11px;
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8;
          padding: 2px 8px;
          border-radius: 99px;
          font-family: 'JetBrains Mono', monospace;
        }

        .main-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          height: calc(100vh - 53px);
          overflow: hidden;
        }

        .sidebar {
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          padding: 20px 20px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .sidebar-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .sidebar-desc {
          font-size: 13px;
          color: #71717a;
          line-height: 1.5;
        }

        .sidebar-desc code {
          font-family: 'JetBrains Mono', monospace;
          color: #a1a1aa;
          font-size: 12px;
          background: rgba(255,255,255,0.06);
          padding: 1px 5px;
          border-radius: 3px;
        }

        textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          padding: 16px 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #d4d4d8;
          line-height: 1.8;
          width: 100%;
        }

        textarea::placeholder { color: #3f3f46; }

        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .submit-btn {
          width: 100%;
          padding: 11px;
          background: #1d4ed8;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s ease, transform 0.1s ease;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.2px;
        }

        .submit-btn:hover:not(:disabled) { background: #2563eb; }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .error-box {
          background: #450a0a;
          border: 1px solid #7f1d1d;
          color: #fca5a5;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
        }

        .content {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 16px;
          color: #3f3f46;
          padding: 40px;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          border: 2px dashed rgba(255,255,255,0.08);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state p { font-size: 14px; text-align: center; }

        .results {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: fadeUp 0.3s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .stat-card {
          background: #111113;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #52525b;
          font-weight: 600;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          font-family: 'JetBrains Mono', monospace;
        }

        .tabs {
          display: flex;
          gap: 2px;
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
          padding: 3px;
          width: fit-content;
        }

        .tab-btn {
          padding: 6px 16px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #71717a;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
        }

        .tab-btn.active {
          background: #1e1e22;
          color: #e4e4e7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .trees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }

        .tree-card {
          background: #111113;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 18px;
          overflow: hidden;
        }

        .tree-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .tree-card-title {
          font-size: 13px;
          font-weight: 600;
          color: #d4d4d8;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .depth-chip {
          font-size: 11px;
          background: rgba(255,255,255,0.06);
          color: #6b7280;
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
        }

        .cycle-badge {
          background: #451a03;
          border: 1px solid #78350f;
          color: #fbbf24;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cycle-body {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border: 1px dashed rgba(251,191,36,0.15);
          border-radius: 8px;
          color: #78350f;
          font-size: 13px;
          gap: 8px;
          color: #d97706;
        }

        .issues-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .issue-card {
          background: #111113;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 14px;
        }

        .issue-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 10px;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 4px 9px;
          border-radius: 4px;
        }

        .tag-red {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          color: #f87171;
        }

        .tag-amber {
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.15);
          color: #fbbf24;
        }

        .raw-view {
          background: #0a0a0c;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #a1a1aa;
          line-height: 1.7;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .meta-footer {
          font-size: 11px;
          color: #3f3f46;
          display: flex;
          gap: 16px;
          font-family: 'JetBrains Mono', monospace;
          padding-top: 4px;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

        @media (max-width: 768px) {
          .main-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
          .sidebar { max-height: 40vh; }
          .issues-row { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-dot" />
          <span className="brand-name">BFHL Explorer</span>
          <span className="brand-badge">POST /bfhl</span>
        </div>
        <div style={{ fontSize: '12px', color: '#3f3f46', fontFamily: 'JetBrains Mono, monospace' }}>
          SRM IST — Full Stack Challenge
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Input Edges</div>
            <div className="sidebar-desc">
              Enter directed edges, one per line. Format: <code>X-&gt;Y</code> where X and Y are single uppercase letters.
            </div>
          </div>

          <form onSubmit={submit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={"A->B\nB->C\n..."}
              spellCheck={false}
            />
            <div className="sidebar-footer">
              {error && <div className="error-box">{error}</div>}
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <><div className="spinner" /> Processing...</> : 'Run Analysis'}
              </button>
            </div>
          </form>
        </aside>

        {/* Main content */}
        <main className="content">
          {!result ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <p>Enter edges on the left and hit<br /><strong style={{ color: '#71717a' }}>Run Analysis</strong> to see your hierarchy</p>
            </div>
          ) : (
            <div className="results">
              {/* Stats */}
              <div className="stats-row">
                <div className="stat-card">
                  <span className="stat-label">Valid Trees</span>
                  <span className="stat-value" style={{ color: '#60a5fa' }}>{result.summary.total_trees}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Cycles</span>
                  <span className="stat-value" style={{ color: '#f59e0b' }}>{result.summary.total_cycles}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Deepest Root</span>
                  <span className="stat-value" style={{ color: '#a78bfa' }}>{result.summary.largest_tree_root ?? '—'}</span>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="tabs">
                  <button className={`tab-btn ${activeTab === 'trees' ? 'active' : ''}`} onClick={() => setActiveTab('trees')}>Hierarchies</button>
                  <button className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`} onClick={() => setActiveTab('raw')}>Raw JSON</button>
                </div>
                <span style={{ fontSize: '12px', color: '#3f3f46' }}>{result.hierarchies.length} group{result.hierarchies.length !== 1 ? 's' : ''} found</span>
              </div>

              {activeTab === 'trees' && (
                <>
                  <div className="trees-grid">
                    {result.hierarchies.map((h, i) => (
                      <div key={i} className="tree-card">
                        <div className="tree-card-head">
                          <div className="tree-card-title">
                            <div className="status-dot" style={{ background: h.has_cycle ? '#f59e0b' : '#34d399', boxShadow: `0 0 6px ${h.has_cycle ? '#f59e0b88' : '#34d39988'}` }} />
                            Root: {h.root}
                          </div>
                          {h.has_cycle
                            ? <span className="cycle-badge">↻ cycle</span>
                            : <span className="depth-chip">d={h.depth}</span>
                          }
                        </div>
                        {h.has_cycle ? (
                          <div className="cycle-body">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Cyclic group — no tree
                          </div>
                        ) : (
                          <TreeNode label={h.root} children={h.tree[h.root] || {}} depth={0} />
                        )}
                      </div>
                    ))}
                  </div>

                  {(result.invalid_entries.length > 0 || result.duplicate_edges.length > 0) && (
                    <div className="issues-row">
                      {result.invalid_entries.length > 0 && (
                        <div className="issue-card">
                          <div className="issue-title" style={{ color: '#6b7280' }}>
                            Invalid ({result.invalid_entries.length})
                          </div>
                          <div className="tag-list">
                            {result.invalid_entries.map((e, i) => (
                              <span key={i} className="tag tag-red">{e || '""'}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.duplicate_edges.length > 0 && (
                        <div className="issue-card">
                          <div className="issue-title" style={{ color: '#6b7280' }}>
                            Duplicates ({result.duplicate_edges.length})
                          </div>
                          <div className="tag-list">
                            {result.duplicate_edges.map((e, i) => (
                              <span key={i} className="tag tag-amber">{e}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="meta-footer">
                    <span>{result.user_id}</span>
                    <span>{result.email_id}</span>
                    <span>{result.college_roll_number}</span>
                  </div>
                </>
              )}

              {activeTab === 'raw' && (
                <div className="raw-view">{JSON.stringify(result, null, 2)}</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
