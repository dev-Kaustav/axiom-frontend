import { useEffect, useRef, useState } from 'react';
import { Activity, Layers3, GitBranch, FlaskConical, ArrowLeftRight, MonitorDot, BookOpen, Database } from 'lucide-react';
import './styles.css';
import { Modal } from './components/primitives';
import { PortfolioView } from './components/PortfolioView';
import { ExposureView } from './components/ExposureView';
import { ScenarioExplorer } from './components/ScenarioExplorer';
import { RelationshipsView } from './components/RelationshipsView';
import { TradeSimulator } from './components/TradeSimulator';
import type { TicketSeed } from './components/NewTradeDialog';
import { TerminalView } from './components/TerminalView';
import { ContractsView, DataView } from './components/ContractsView';
import { ContractInspector } from './components/ContractInspector';
import { Clock } from './components/Clock';
import { PORTFOLIO, POSITIONS, SNAPSHOT, contractView } from './domain/engine';

const PAGES = ['Exposure', 'Portfolio', 'Scenarios', 'Relationships', 'Trade', 'Terminal', 'Contracts', 'Data'] as const;
type Page = (typeof PAGES)[number];
const ICONS = [Activity, Layers3, FlaskConical, GitBranch, ArrowLeftRight, MonitorDot, BookOpen, Database];
const currentPage = () => PAGES.find(p => `#/${p.toLowerCase()}` === window.location.hash) ?? 'Exposure';


export default function App() {
  const workspace = useRef<HTMLElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<Page>(currentPage);
  const [inspecting, setInspecting] = useState<string | null>(null);
  const [scenarioKey, setScenarioKey] = useState<string | null>(null);
  const [hedgeTarget, setHedgeTarget] = useState<number | null>(null);
  // A contract the Terminal handed to Trade; consumed when Trade next mounts from it.
  const [ticketSeed, setTicketSeed] = useState<TicketSeed | null>(null);
  const navigate = (next: Page) => { window.location.hash = `/${next.toLowerCase()}`; setPage(next); };
  useEffect(() => {
    const sync = () => setPage(currentPage());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  useEffect(() => { document.title = `${page} · Rook Workstation`; workspace.current?.scrollTo(0, 0); }, [page]);
  useEffect(() => {
    const area = workspace.current!;
    const field = light.current!;
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference) and (pointer: fine)');
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      field.style.transform = 'translate(0px, 0px)';
    };
    const move = (event: PointerEvent) => {
      if (!motion.matches || event.pointerType !== 'mouse' || event.buttons) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = area.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - .5) * 20;
        const y = ((event.clientY - bounds.top) / bounds.height - .5) * 12;
        field.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    area.addEventListener('pointermove', move);
    area.addEventListener('pointerleave', reset);
    motion.addEventListener('change', reset);
    return () => {
      reset();
      area.removeEventListener('pointermove', move);
      area.removeEventListener('pointerleave', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);
  // A trackpad pinch is a ctrl-wheel event, and the browser answers it by
  // zooming the whole page. This is a fixed desktop layout of panes that carry
  // their own scroll and their own zoom, so page zoom only breaks it. Capture
  // phase and non-passive, which is the only way the default can be refused;
  // the keyboard zoom the browser offers for accessibility is untouched.
  useEffect(() => {
    const block = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) e.preventDefault(); };
    document.addEventListener('wheel', block, { passive: false, capture: true });
    return () => document.removeEventListener('wheel', block, { capture: true });
  }, []);

  const openScenario = (key: string) => {
    setScenarioKey(key);
    navigate('Scenarios');
  };
  const findHedges = (index: number) => { setHedgeTarget(index); setTicketSeed(null); navigate('Trade'); };
  const simulateFromTerminal = (seed: TicketSeed) => { setTicketSeed(seed); navigate('Trade'); };

  return (
    <div className="app">
      <header className="app-bar">
        <div className="brand">
          <span className="logo-mark" aria-hidden="true" />
          <span>rook<span className="brand-period">.</span></span><small>WORKSTATION</small>
        </div>
        <nav aria-label="Views" className="page-nav">
          {PAGES.map((p, index) => {
            const Icon = ICONS[index];
            return (
            <button
              key={p}
              type="button"
              className={p === page ? 'tab active' : 'tab'}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => { setTicketSeed(null); navigate(p); }}
            >
              <Icon size={14} aria-hidden="true" />{p}
            </button>
          ); })}
        </nav>
        <Clock />
      </header>

      <div className="workspace-light" aria-hidden="true"><div className="light-field" ref={light} /></div>
      <main className="workspace" ref={workspace} tabIndex={-1}>
        <div className="workspace-header">
          <h1 className="sr-only">{page === 'Trade' ? 'Trade ideas' : page === 'Data' ? 'Data & sources' : page}</h1>
          <div className="book-label"><span>{PORTFOLIO.name}</span><small><span className="status-dot" /> {POSITIONS.length} positions · {SNAPSHOT.retrieved_at.slice(0, 10)}</small></div>
        </div>

        <div className="view-content">
        {page === 'Exposure' && <ExposureView positions={POSITIONS} onScenario={openScenario} onContract={setInspecting} onHedge={findHedges} />}
        {page === 'Portfolio' && (
          <PortfolioView
            positions={POSITIONS}
            onContract={setInspecting}
          />
        )}
        {page === 'Scenarios' && (
          <ScenarioExplorer
            positions={POSITIONS}
            selectedKey={scenarioKey}
            onSelect={setScenarioKey}
            onContract={setInspecting}
          />
        )}
        {page === 'Relationships' && (
          <RelationshipsView positions={POSITIONS} onContract={setInspecting} onScenario={openScenario} />
        )}
        {page === 'Trade' && <TradeSimulator key={`${hedgeTarget ?? 'book'}:${ticketSeed?.at ?? ''}`} positions={POSITIONS} onContract={setInspecting} targetIndex={hedgeTarget} onClearTarget={() => setHedgeTarget(null)} seed={ticketSeed} />}
        {page === 'Terminal' && <TerminalView positions={POSITIONS} onSimulate={simulateFromTerminal} />}
        {page === 'Contracts' && <ContractsView onContract={setInspecting} />}
        {page === 'Data' && <DataView />}
        </div>
      </main>

      <footer className="app-footer">
        <span><span className="status-dot" /> US RATES · USD</span>
        <span className="footer-separator">·</span>
        <span>Rook Workstation</span>
      </footer>

      {inspecting && (
        <Modal
          title={contractView(inspecting).contract.question}
          onClose={() => setInspecting(null)}
          wide
        >
          <ContractInspector contractId={inspecting} />
        </Modal>
      )}
    </div>
  );
}
