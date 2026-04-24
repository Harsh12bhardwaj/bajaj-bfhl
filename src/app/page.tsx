'use client';
import { useState } from 'react';

const EXAMPLE = `A->B\nA->C\nB->D\nC->E\nE->F\nX->Y\nY->Z\nZ->X\nP->Q\nQ->R\nG->H\nG->H\nG->I\nhello\n1->2\nA->`;

type Tree = { [key: string]: Tree };
interface Hierarchy { root: string; tree: Tree; depth?: number; has_cycle?: boolean; }
interface ApiResponse {
  user_id: string; email_id: string; college_roll_number: string;
  hierarchies: Hierarchy[]; invalid_entries: string[]; duplicate_edges: string[];
  summary: { total_trees: number; total_cycles: number; largest_tree_root: string | null; };
}

const COLORS = [
  { bg: 'rgba(99,102,241,.18)', border: '#6366f1', text: '#a5b4fc' },
  { bg: 'rgba(16,185,129,.18)', border: '#10b981', text: '#6ee7b7' },
  { bg: 'rgba(245,158,11,.18)', border: '#f59e0b', text: '#fcd34d' },
  { bg: 'rgba(236,72,153,.18)', border: '#ec4899', text: '#f9a8d4' },
  { bg: 'rgba(59,130,246,.18)', border: '#3b82f6', text: '#93c5fd' },
  { bg: 'rgba(20,184,166,.18)', border: '#14b8a6', text: '#99f6e4' },
];

function Node({ label, depth }: { label: string; depth: number }) {
  const c = COLORS[depth % COLORS.length];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 34, height: 34, borderRadius: 9,
      background: c.bg, border: `1.5px solid ${c.border}55`,
      color: c.text, fontSize: 13, fontWeight: 700,
      fontFamily: 'JetBrains Mono, monospace',
      boxShadow: `0 0 12px ${c.border}22`, flexShrink: 0,
    }}>{label}</span>
  );
}

function TreeRows({ map, depth = 0 }: { map: Tree; depth?: number }) {
  const keys = Object.keys(map);
  if (!keys.length) return null;
  const lc = COLORS[depth % COLORS.length].border;
  return (
    <div style={{ paddingLeft: depth ? 28 : 0, position: 'relative' }}>
      {keys.map((k, i) => (
        <div key={k} style={{ position: 'relative', marginBottom: 8 }}>
          {depth > 0 && <div style={{ position: 'absolute', left: -20, top: 16, width: 18, height: 1.5, background: `${lc}44` }} />}
          {depth > 0 && i < keys.length - 1 && <div style={{ position: 'absolute', left: -20, top: 16, bottom: -8, width: 1.5, background: `${lc}22` }} />}
          <Node label={k} depth={depth} />
          {Object.keys(map[k]).length > 0 && (
            <div style={{ marginLeft: 4, borderLeft: `1.5px solid ${COLORS[(depth+1)%COLORS.length].border}22`, paddingLeft: 0, marginTop: 4 }}>
              <TreeRows map={map[k]} depth={depth + 1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function JsonView({ data }: { data: object }) {
  const raw = JSON.stringify(data, null, 2)
    .replace(/("[\w_]+")\s*:/g, '<span style="color:#a5b4fc">$1</span>:')
    .replace(/: (".*?")/g, ': <span style="color:#86efac">$1</span>')
    .replace(/: (\d+)/g, ': <span style="color:#7dd3fc">$1</span>')
    .replace(/: (true|false)/g, ': <span style="color:#fcd34d">$1</span>')
    .replace(/: (null)/g, ': <span style="color:#fca5a5">$1</span>');
  return (
    <pre style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.8,
      color: '#64748b', background: '#020617', borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.06)', padding: 20, overflow: 'auto', maxHeight: 520,
    }} dangerouslySetInnerHTML={{ __html: raw }} />
  );
}

export default function Home() {
  const [input, setInput] = useState(EXAMPLE);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'trees' | 'json'>('trees');

  const run = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setResult(null);
    const data = input.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    try {
      const res = await fetch('/api/bfhl', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setResult(json); setTab('trees');
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;background:#030712;color:#e2e8f0;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:9px}
        ::selection{background:rgba(99,102,241,0.3)}
        textarea{outline:none;font-family:'JetBrains Mono',monospace}
        textarea:focus{border-color:rgba(99,102,241,0.45)!important;box-shadow:0 0 0 3px rgba(99,102,241,0.1)!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        .anim{animation:fadeUp .35s cubic-bezier(.16,1,.3,1) both}
        .anim-1{animation:fadeUp .35s .06s cubic-bezier(.16,1,.3,1) both}
        .anim-2{animation:fadeUp .35s .12s cubic-bezier(.16,1,.3,1) both}
        .anim-3{animation:fadeUp .35s .18s cubic-bezier(.16,1,.3,1) both}
        .hcard{background:rgba(8,15,35,.85);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:18px;position:relative;overflow:hidden;transition:border-color .2s}
        .hcard:hover{border-color:rgba(255,255,255,.13)}
        .hcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
        .hcard.tree::before{background:linear-gradient(90deg,#6366f1,#8b5cf6)}
        .hcard.cycle::before{background:linear-gradient(90deg,#f59e0b,#ef4444)}
        .submit{width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .2s,transform .15s;position:relative;z-index:1}
        .submit:hover{opacity:.9}
        .submit:active{transform:scale(.99)}
        .submit:disabled{opacity:.45;cursor:not-allowed}
        .tab{padding:6px 16px;border-radius:7px;border:none;background:transparent;color:#475569;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif}
        .tab.on{background:rgba(99,102,241,.15);color:#a5b4fc;border:1px solid rgba(99,102,241,.25)}
        .tab:not(.on):hover{background:rgba(255,255,255,.04);color:#94a3b8}
        .tag{font-family:'JetBrains Mono',monospace;font-size:11px;padding:3px 9px;border-radius:5px}
      `}</style>

      {/* Background grid + gradient orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(ellipse at 12% 45%, rgba(99,102,241,.07) 0%, transparent 55%),
          radial-gradient(ellipse at 88% 10%, rgba(139,92,246,.05) 0%, transparent 45%),
          linear-gradient(rgba(255,255,255,.014) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.014) 1px, transparent 1px)`,
        backgroundSize: 'auto, auto, 36px 36px, 36px 36px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Topbar */}
        <header style={{
          height: 54, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(3,7,18,.85)', backdropFilter: 'blur(14px)',
          position: 'sticky', top: 0, zIndex: 20, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: -1,
            }}>B</div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-.3px' }}>BFHL Explorer</span>
            <span style={{
              fontSize: 11, color: '#334155', background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.07)', padding: '2px 8px', borderRadius: 99,
              fontFamily: 'JetBrains Mono, monospace',
            }}>POST /bfhl</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 7px #10b981', display: 'inline-block', animation: 'blink 2.5s infinite' }} />
            <span style={{ fontSize: 12, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>API Live</span>
          </div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '370px 1fr', overflow: 'hidden' }}>

          {/* ── LEFT PANEL ── */}
          <aside style={{ borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <form onSubmit={run} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: '#334155', marginBottom: 5 }}>
                  Node Edges
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                  Enter directed edges — one per line or comma-separated.
                  Format: <code style={{ fontFamily: 'JetBrains Mono', color: '#64748b', background: 'rgba(255,255,255,.06)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>X-&gt;Y</code>
                </p>
              </div>

              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={'A->B\nB->C\n...'}
                spellCheck={false}
                style={{
                  flex: 1, resize: 'none', background: 'transparent',
                  border: 'none', padding: '14px 18px',
                  fontSize: 13, color: '#94a3b8', lineHeight: 1.9,
                }}
              />

              <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
                    color: '#fca5a5', padding: '10px 14px', borderRadius: 9, fontSize: 13,
                  }}>{error}</div>
                )}
                <button type="submit" disabled={loading} className="submit">
                  {loading
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff', animation: 'spin .6s linear infinite', display: 'inline-block' }} />
                        Analysing...
                      </span>
                    : 'Run Analysis →'}
                </button>
              </div>
            </form>
          </aside>

          {/* ── RIGHT PANEL ── */}
          <main style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {!result ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: '#1e293b' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, border: '2px dashed rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" fill="none" stroke="#334155" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z" />
                  </svg>
                </div>
                <p style={{ fontSize: 14, color: '#1e293b', textAlign: 'center' }}>
                  Enter your edges and click<br />
                  <strong style={{ color: '#334155' }}>Run Analysis</strong> to see results
                </p>
              </div>
            ) : (
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Stats */}
                <div className="anim" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    { label: 'Valid Trees', value: result.summary.total_trees, color: '#a5b4fc' },
                    { label: 'Cycles Found', value: result.summary.total_cycles, color: '#fcd34d' },
                    { label: 'Deepest Root', value: result.summary.largest_tree_root ?? '—', color: '#6ee7b7' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'rgba(15,23,42,.5)', border: '1px solid rgba(255,255,255,.06)',
                      borderRadius: 12, padding: '18px 20px',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.7px', color: '#334155', marginBottom: 8 }}>{s.label}</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className="anim-1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 9, padding: 3 }}>
                    <button className={`tab ${tab === 'trees' ? 'on' : ''}`} onClick={() => setTab('trees')}>Hierarchies</button>
                    <button className={`tab ${tab === 'json' ? 'on' : ''}`} onClick={() => setTab('json')}>Raw JSON</button>
                  </div>
                  <span style={{ fontSize: 12, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>
                    {result.hierarchies.length} group{result.hierarchies.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {tab === 'trees' && (
                  <>
                    {/* Tree cards */}
                    <div className="anim-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                      {result.hierarchies.map((h, i) => (
                        <div key={i} className={`hcard ${h.has_cycle ? 'cycle' : 'tree'}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                background: h.has_cycle ? '#f59e0b' : '#10b981',
                                boxShadow: `0 0 7px ${h.has_cycle ? '#f59e0b' : '#10b981'}`,
                              }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Root: {h.root}</span>
                            </div>
                            {h.has_cycle
                              ? <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', color: '#fbbf24' }}>↻ cycle</span>
                              : <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', padding: '3px 9px', borderRadius: 5, background: 'rgba(255,255,255,.05)', color: '#475569' }}>depth={h.depth}</span>
                            }
                          </div>
                          {h.has_cycle ? (
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                              padding: '20px 0', color: '#92400e', fontSize: 13,
                              border: '1px dashed rgba(245,158,11,.15)', borderRadius: 9,
                            }}>
                              <svg width="15" height="15" fill="none" stroke="#d97706" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                              </svg>
                              <span style={{ color: '#d97706' }}>Cyclic group detected</span>
                            </div>
                          ) : (
                            <div style={{ overflowX: 'auto' }}>
                              <Node label={h.root} depth={0} />
                              {Object.keys(h.tree[h.root] || {}).length > 0 && (
                                <div style={{ borderLeft: `1.5px solid ${COLORS[1].border}22`, marginLeft: 16, paddingLeft: 0, marginTop: 4 }}>
                                  <TreeRows map={h.tree[h.root]} depth={1} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Issues */}
                    {(result.invalid_entries.length > 0 || result.duplicate_edges.length > 0) && (
                      <div className="anim-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {result.invalid_entries.length > 0 && (
                          <div style={{ background: 'rgba(15,23,42,.5)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: '14px 16px' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.7px', color: '#475569', marginBottom: 10 }}>
                              Invalid ({result.invalid_entries.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {result.invalid_entries.map((e, i) => (
                                <span key={i} className="tag" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.18)', color: '#f87171' }}>{e || '""'}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.duplicate_edges.length > 0 && (
                          <div style={{ background: 'rgba(15,23,42,.5)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: '14px 16px' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.7px', color: '#475569', marginBottom: 10 }}>
                              Duplicates ({result.duplicate_edges.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {result.duplicate_edges.map((e, i) => (
                                <span key={i} className="tag" style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.18)', color: '#fbbf24' }}>{e}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: 20, fontSize: 11, color: '#1e293b', fontFamily: 'JetBrains Mono, monospace', paddingTop: 4 }}>
                      <span>{result.user_id}</span>
                      <span>{result.email_id}</span>
                      <span>{result.college_roll_number}</span>
                    </div>
                  </>
                )}

                {tab === 'json' && <div className="anim"><JsonView data={result} /></div>}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
