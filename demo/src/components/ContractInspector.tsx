import { Badge, KeyValue, SourceLink } from './primitives';
import { contractView, payoffOf, STATE_COUNT, venueContractUrl, venueEventUrl } from '../domain/engine';

/**
 * The audit trail for one contract: venue identity, the settlement rule as the
 * venue published it, the predicate Rook derived, and how it was derived.
 * Every material claim on any other screen traces back to this.
 */
export function ContractInspector({ contractId }: { contractId: string }) {
  const view = contractView(contractId);
  const { contract, event, authored, degenerate } = view;

  const winningStates = authored.claim
    ? payoffOf(contractId).reduce<number>((total, bit) => total + bit, 0)
    : null;

  return (
    <div className="inspector">
      <div className="coverage-grid">
        <KeyValue label="Venue">{contract.source_url.includes('polymarket') ? 'POLYMARKET' : 'UNKNOWN'}</KeyValue>
        <KeyValue label="Event">{event.title}</KeyValue>
        <KeyValue label="Resolution date">{contract.end_date?.slice(0, 10) ?? 'unstated'}</KeyValue>
        <KeyValue label="Interpretation">
          <Badge tone={authored.status === 'VERIFIED' ? 'teal' : 'amber'}>
            {authored.status.replace(/_/g, ' ')}
          </Badge>
        </KeyValue>
        <KeyValue label="Settled">
          {contract.closed ? (
            <Badge tone="teal">{contract.resolution.resolved_outcome ?? 'closed'}</Badge>
          ) : (
            'open'
          )}
        </KeyValue>
      </div>

      <section className="detail-section">
        <h4 className="inspector-heading">Economic predicate</h4>
        {view.expression ? (
          <>
            <code className="expression">{view.expression}</code>
            <details className="evidence-disclosure"><summary>Interpretation rationale</summary><p className="quiet-copy">{authored.rationale}</p></details>
          </>
        ) : (
          <>
            <Badge tone="amber">no interpretation</Badge>
            <p className="quiet-copy">{authored.rationale}</p>
            <p className="panel-footnote">
              This contract is excluded from every exposure number rather than assumed to be
              irrelevant.
            </p>
          </>
        )}
      </section>

      {winningStates !== null && (
        <section className="detail-section">
          <h4 className="inspector-heading">Reachable outcomes</h4>
          <p>
            Pays in <span className="mono">{winningStates.toLocaleString('en-US')}</span> of{' '}
            <span className="mono">{STATE_COUNT.toLocaleString('en-US')}</span> enumerated worlds.
          </p>
          {degenerate && (
            <p className="quiet-copy">
              <Badge tone="amber">{degenerate.cause.replace(/_/g, ' ')}</Badge> {degenerate.reason}
            </p>
          )}
        </section>
      )}

      <section className="detail-section">
        <h4 className="inspector-heading">Settlement rule, as published</h4>
        {/* Scrollable, so it must be reachable and scrollable by keyboard. */}
        <div className="quiet-copy rule-text" tabIndex={0} role="region" aria-label="Settlement rule text">
          {event.description}
        </div>
        <SourceLink url={venueContractUrl(view)}>Venue contract</SourceLink>{' '}
        <SourceLink url={venueEventUrl(event)}>Venue event</SourceLink>
      </section>

      <details className="evidence-disclosure">
        <summary>Provenance</summary>
        <div className="coverage-grid">
          <KeyValue label="Contract id">{contract.contract_id}</KeyValue>
          <KeyValue label="Condition id">
            <span className="mono truncate">{contract.condition_id}</span>
          </KeyValue>
          <KeyValue label="Rule hash">
            <span className="mono truncate">{contract.rule_hash}</span>
          </KeyValue>
          <KeyValue label="Outcome tokens">
            <ul className="token-list">
              {contract.outcome_tokens.map((t) => (
                <li key={t.token_id}>
                  <span className="muted">{t.outcome}</span>{' '}
                  <span className="mono truncate">{t.token_id}</span>
                </li>
              ))}
            </ul>
          </KeyValue>
        </div>
      </details>
    </div>
  );
}
