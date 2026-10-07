import { useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import { describeViewState, retryLabel, staleBannerText } from '../state/viewState.ts';
import type { ViewCopy, ViewState } from '../state/viewState.ts';

export function Panel({ title, count, actions, children, busy = false }: { title: string; count?: ReactNode; actions?: ReactNode; children: ReactNode; busy?: boolean }) {
  const id = useId();
  return <section className="panel" aria-labelledby={id} aria-busy={busy}><header className="panel-header"><div className="panel-title"><h2 id={id}>{title}</h2>{count !== undefined && <span className="panel-count">{count}</span>}</div>{actions && <div className="panel-tools">{actions}</div>}</header>{children}</section>;
}
export function PanelFootnote({ children }: { children: ReactNode }) { return <div className="panel-footnote">{children}</div>; }
export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'positive' | 'attention'; children: ReactNode }) { return <span className={`badge badge--${tone}`}>{children}</span>; }
export function KeyValue({ label, children }: { label: string; children: ReactNode }) { return <div className="kv"><span className="kv-label">{label}</span><span className="kv-value">{children}</span></div>; }
export function UnavailableValue({ reason }: { reason: string }) { return <span className="unavailable-value" title={reason} aria-label={`Unavailable: ${reason}`}>—</span>; }

export function ResizeHandle({ value, min, max, onChange, label, invert = false }: { value: number; min: number; max: number; onChange: (value: number) => void; label: string; invert?: boolean }) {
  const drag = useRef<{ x: number; value: number } | null>(null);
  const direction = invert ? -1 : 1;
  const clamp = (next: number) => Math.max(min, Math.min(max, Math.round(next)));
  return <div className="resize-handle" role="separator" aria-orientation="vertical" aria-label={label} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} tabIndex={0}
    onPointerDown={event => { if (event.button !== 0) return; drag.current = { x: event.clientX, value }; event.currentTarget.setPointerCapture(event.pointerId); }}
    onPointerMove={event => { if (drag.current) onChange(clamp(drag.current.value + (event.clientX - drag.current.x) * direction)); }}
    onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
    onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
    onKeyDown={event => { if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); onChange(clamp(value + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 48 : 12) * direction)); }} />;
}
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; opener?.focus(); };
  }, []);
  return <dialog ref={ref} className="modal" aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}><header className="modal-header"><span>{title}</span><IconButton label="Close dialog" onClick={onClose}><X size={18} aria-hidden /></IconButton></header><div className="modal-body">{children}</div></dialog>;
}
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export function PrimaryButton({ busy = false, busyLabel = 'Reloading…', children, disabled, type = 'button', ...props }: ButtonProps & { busy?: boolean; busyLabel?: string }) { return <button {...props} type={type} className="btn-primary" disabled={disabled || busy} aria-busy={busy}>{busy ? busyLabel : children}</button>; }
export function TextButton({ type = 'button', ...props }: ButtonProps) { return <button {...props} type={type} className="btn-text" />; }
export function IconButton({ label, type = 'button', children, ...props }: ButtonProps & { label: string }) { return <button {...props} type={type} className="btn-icon" aria-label={label}><span aria-hidden>{children}</span></button>; }
function useRetryClock(retryAt?: number) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    setNow(Date.now());
    if (!retryAt || retryAt <= Date.now()) return;
    const timer = window.setInterval(() => { const next = Date.now(); setNow(next); if (next >= retryAt) window.clearInterval(timer); }, 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);
  return now;
}
export function StatePanel({ state, copy, onRetry, retrying = false }: { state: ViewState; copy: ViewCopy; onRetry?: () => void; retrying?: boolean }) {
  const nowMs = useRetryClock(state.kind === 'rate_limited' ? state.retryAt : undefined);
  const content = describeViewState(state, copy, { retrying, nowMs });
  return <div className="state-panel" aria-busy={state.kind === 'loading'}><div className="state-panel-content">
    {content.badge && <Badge tone="attention">{content.badge}</Badge>}
    <p className="state-heading" role={content.headingRole ?? undefined}>{content.heading}</p>
    {content.body && <p className="state-body">{content.body}</p>}
    {content.action && onRetry && <div className="state-action"><PrimaryButton onClick={onRetry} busy={content.action.busy} disabled={content.action.disabled}>{content.action.label}</PrimaryButton></div>}
    {content.reference && <p className="state-reference">{content.reference}</p>}
  </div></div>;
}
export function StaleBanner({ asOf, onRetry, retrying = false, retryAt }: { asOf: number; onRetry?: () => void; retrying?: boolean; retryAt?: number }) {
  const nowMs = useRetryClock(retryAt);
  const action = retryLabel({ retrying, retryAt, nowMs });
  return <div className="stale-banner" role="status"><span>{staleBannerText(asOf)}</span>{onRetry && <TextButton onClick={onRetry} disabled={action.disabled} aria-busy={action.busy}>{action.label}</TextButton>}</div>;
}
