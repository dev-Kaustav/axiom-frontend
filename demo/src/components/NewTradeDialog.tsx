import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Modal } from './primitives';
import { clockTime, quote } from './MarketPanels';
import { CONTRACT_VIEWS, contractView, costCents, money, type Position } from '../domain/engine';
import { compareTrade, parseTradeInputs, snapshotPrice } from '../domain/decisionSupport';

/** A contract handed over from the Terminal, priced at the live mid when it was picked. */
export type TicketSeed = { contractId: string; side: Position['side']; priceX4: number; at: number };
export type TradeDraft = { contractId: string; side: Position['side']; quantity: string; priceText: string; source: TicketSeed | null };

const tone = (n: number) => n > 0 ? 'positive' : n < 0 ? 'negative' : 'muted';
const asTrade = (contractId: string, side: Position['side'], quantity: number, priceX4: number): Position =>
  ({ position_id: 'proposed', contract_id: contractId, side, quantity, entry_price_x4: priceX4, entry_price_text: String(priceX4 / 10_000) });

/**
 * A floating new-trade ticket. Pick a contract, side, size and price, then run
 * it as a what-if simulation against the book. No order is sent.
 */
export function NewTradeDialog({ draft, positions, onClose, onSimulate }: {
  draft: TradeDraft; positions: Position[]; onClose: () => void; onSimulate: (trade: Position) => void;
}) {
  const tradeable = useMemo(() => CONTRACT_VIEWS.filter(v => v.authored.claim && !v.degenerate && !v.contract.closed), []);
  const [contractId, setContractId] = useState(draft.contractId);
  const [side, setSide] = useState(draft.side);
  const [quantity, setQuantity] = useState(draft.quantity);
  const [priceText, setPriceText] = useState(draft.priceText);

  const mark = snapshotPrice(contractId, side);
  const parsed = parseTradeInputs(quantity.replace(/[,\s]/g, ''), priceText.trim());
  const trade = parsed && asTrade(contractId, side, parsed.quantity, parsed.priceX4);
  const comparison = trade && compareTrade(positions, trade);
  const worstDelta = comparison && comparison.after.worstCents - comparison.before.worstCents;
  const view = contractView(contractId);

  return <Modal title="New trade · simulation" onClose={onClose} className="trade-dialog">
    <form className="trade-ticket" onSubmit={e => { e.preventDefault(); if (trade) onSimulate(trade); }}>
      {draft.source && <p className="ticket-source">From Terminal · live mid {quote(draft.source.priceX4)} at {clockTime(draft.source.at)} <button type="button" className="text-button" onClick={() => setPriceText(String(draft.source!.priceX4 / 10_000))}>Use as price</button></p>}
      <label className="field-label" htmlFor="trade-contract">Contract</label>
      <select id="trade-contract" value={contractId} onChange={e => setContractId(e.target.value)}>{tradeable.map(v => <option key={v.contract.contract_id} value={v.contract.contract_id}>{v.displayName}</option>)}</select>
      <div className="ticket-grid">
        <div><span className="field-label" id="trade-side-label">Buy</span><div className="side-toggle" role="group" aria-labelledby="trade-side-label">{(['YES', 'NO'] as const).map(s => <button key={s} type="button" className={s.toLowerCase()} aria-pressed={side === s} onClick={() => setSide(s)}>{s}</button>)}</div></div>
        <div><label className="field-label" htmlFor="trade-quantity">Quantity</label><input id="trade-quantity" inputMode="numeric" value={quantity} aria-invalid={!parsed && quantity !== ''} onChange={e => setQuantity(e.target.value)} /></div>
        <div><label className="field-label" htmlFor="trade-price">Price ($)</label><input id="trade-price" inputMode="decimal" value={priceText} aria-invalid={!parsed && priceText !== ''} onChange={e => setPriceText(e.target.value)} /></div>
      </div>
      <div className="ticket-mid"><span>Snapshot mark {mark === null ? '—' : quote(mark)} · {view.displayName}</span>
        <button type="button" className="text-button" disabled={mark === null} onClick={() => mark !== null && setPriceText(String(mark / 10_000))}>Use snapshot mark</button></div>
      {!parsed && <p className="form-hint">Use a whole quantity and a price between $0 and $1, up to four decimal places, with a whole-cent total.</p>}
      <dl className="trade-ticket-summary">
        <div><dt>Cost</dt><dd>{trade ? money(costCents(trade)) : '—'}</dd></div>
        <div><dt>Worst-case change</dt><dd className={worstDelta === null ? 'muted' : tone(worstDelta)}>{worstDelta === null ? '—' : money(worstDelta, true)}</dd></div>
      </dl>
      <div className="trade-ticket-actions">
        <button type="submit" className="primary-button" disabled={!trade}>Simulate trade <ArrowRight size={14} /></button>
      </div>
      <p className="trade-ticket-note">Simulation only. The trade is added to the what-if book at the price you enter; no order is sent.</p>
    </form>
  </Modal>;
}
