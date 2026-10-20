import { useEffect, useMemo, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import type { Core } from 'cytoscape';
import { Minus, Plus, Maximize2, Network } from 'lucide-react';
import type { Dataset, Entity, Indicator, Relation } from './types';
type Node = Entity | Indicator;
export default function Graph({ data, indicators, open, compact = false }: { data: Dataset; indicators: Indicator[]; open: (n: Node | Relation) => void; compact?: boolean }) {
  const actors = useMemo(() => data.entities.filter(e => e.kind === 'actor').sort((a,b) => a.name.localeCompare(b.name)), [data]);
  const [focus, setFocus] = useState(''); const [kind, setKind] = useState('all');
  const container = useRef<HTMLDivElement>(null); const cy = useRef<Core | null>(null);
  const selected = focus || actors.find(a => a.name === 'APT29')?.id || actors[0]?.id || '';
  const elements = useMemo(() => {
    if (kind === 'indicator') return indicators.slice(0, compact ? 12 : 40).map(i => ({ data: { id: i.id, label: i.value, kind: 'indicator' } }));
    const edges = data.relationships.filter(r => r.source === selected || r.target === selected);
    const filtered = edges.filter(r => kind === 'all' || [r.source,r.target].some(id => data.entities.find(e => e.id === id)?.kind === kind));
    const visibleEdges = filtered.slice(0, compact ? 12 : 60);
    const ids = new Set([selected, ...visibleEdges.flatMap(r => [r.source, r.target])]);
    return [...data.entities.filter(e => ids.has(e.id)).map(e => ({ data: { id: e.id, label: e.kind === 'technique' ? compact ? e.externalId : `${e.externalId}\n${e.name}` : e.name, kind: e.kind } })), ...visibleEdges.map(r => ({ data: { id: r.id, source: r.source, target: r.target, label: r.type } }))];
  }, [data, selected, kind, indicators, compact]);
  useEffect(() => {
    if (!container.current) return;
    const graph = cytoscape({ container: container.current, elements, wheelSensitivity: .2, minZoom: .15, maxZoom: 3, style: [
      { selector: 'node', style: { 'background-color': '#102733', 'border-color': '#2baebd', 'border-width': 1.5, label: 'data(label)', color: '#b9c9db', 'font-size': compact ? 9 : 10, 'text-wrap': 'wrap', 'text-max-width': '110px', 'text-valign': 'bottom', 'text-margin-y': 10, width: compact ? 22 : 34, height: compact ? 22 : 34 } },
      { selector: 'node[kind="actor"]', style: { 'background-color': '#31244b', 'border-color': '#ab8aef', width: 48, height: 48, shape: 'hexagon', color: '#e4d7ff' } },
      { selector: 'node[kind="campaign"]', style: { 'background-color': '#3d2f1f', 'border-color': '#e4b35f', shape: 'diamond' } },
      { selector: 'node[kind="indicator"]', style: { 'background-color': '#143b30', 'border-color': '#4ccea7', shape: 'round-rectangle' } },
      { selector: 'edge', style: { width: 1, 'line-color': '#294054', 'target-arrow-color': '#405d77', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'arrow-scale': .6 } },
      { selector: ':selected', style: { 'border-width': 3, 'border-color': '#fff', 'line-color': '#8c79ef' } }
    ], layout: { name: 'concentric', concentric: n => n.id() === selected ? 10 : 1, levelWidth: () => 1, padding: 45, minNodeSpacing: compact ? 20 : 35, animate: false } });
    cy.current = graph;
    graph.on('tap', 'node', ev => { const id = ev.target.id(); const node = data.entities.find(e => e.id === id) || indicators.find(i => i.id === id); if (node) open(node); });
    graph.on('tap', 'edge', ev => { const relation = data.relationships.find(r => r.id === ev.target.id()); if (relation) open(relation); });
    const observer = new ResizeObserver(() => { graph.resize(); graph.fit(undefined, 40); }); observer.observe(container.current);
    return () => { observer.disconnect(); graph.destroy(); cy.current = null; };
  }, [elements, data, indicators, selected, open, compact]);
  return <div className="graph-wrap">
    {!compact && <div className="filters"><label>Aktör odağı<select value={selected} onChange={e => setFocus(e.target.value)}>{actors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label><label>Düğüm türü<select value={kind} onChange={e => setKind(e.target.value)}><option value="all">Tüm ilişkili varlıklar</option><option value="technique">MITRE Tekniği</option><option value="campaign">Kampanya</option><option value="indicator">IOC • bağımsız</option></select></label><span className="muted">En fazla 60 kaynak ilişkisi · {kind === 'indicator' ? 'İlk 40 IOC; ilişki atfı yok' : 'Ok yönü: kaynak → hedef'}</span></div>}
    <div ref={container} className={compact ? 'graph compact' : 'graph'} role="img" aria-label="Kaynak kayıtlarından oluşturulmuş interaktif tehdit grafiği" />
    {!elements.length && <div className="empty"><Network />Bu seçim için kaynakta kayıt yok.</div>}
    <div className="graph-controls"><button aria-label="Grafiği yakınlaştır" onClick={() => cy.current?.zoom(cy.current.zoom() * 1.25)}><Plus size={16}/></button><button aria-label="Grafiği uzaklaştır" onClick={() => cy.current?.zoom(cy.current.zoom() / 1.25)}><Minus size={16}/></button><button aria-label="Grafiği sığdır" onClick={() => cy.current?.fit(undefined, 40)}><Maximize2 size={16}/></button></div>
    <div className="graph-legend"><span><i className="dot purple"/>Tehdit Aktörü</span><span><i className="dot cyan"/>Teknik</span><span><i className="dot amber"/>Kampanya</span>{!compact && <span><i className="dot green"/>IOC</span>}</div>
  </div>;
}

