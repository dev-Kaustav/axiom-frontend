import { useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/config.ts';
import { healthQueryOptions } from '../api/queries.ts';
import { deriveViewState, describeViewState } from '../state/viewState.ts';
import type { ViewDescriptor } from './catalog.ts';
export function ViewPanel({ view }: { view: ViewDescriptor }) {
  const id = useId();
  const query = useQuery({ ...healthQueryOptions(api), enabled: api.origin.configured });
  const state = deriveViewState({ origin: api.origin, readiness: { ...query, hasData: query.data !== undefined }, data: null });
  const content = describeViewState(state, view.copy, { retrying: query.isFetching });
  return <section aria-labelledby={id} aria-busy={state.kind === 'loading'}>
    <h2 id={id}>{view.panelTitle}</h2>
    {content.badge && <span>{content.badge}</span>}
    <p role={content.headingRole ?? undefined}>{content.heading}</p><p>{content.body}</p>
    {content.action && <button onClick={() => void query.refetch()} disabled={content.action.disabled} aria-busy={content.action.busy}>{content.action.label}</button>}
    {content.reference && <p>{content.reference}</p>}
  </section>;
}
