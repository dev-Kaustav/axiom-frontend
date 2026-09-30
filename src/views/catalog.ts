import type { ViewCopy } from '../state/viewState.ts';
export interface ViewDescriptor { id: string; path: `/${string}`; label: string; title: string; subtitle: string; panelTitle: string; copy: ViewCopy }
export const VIEWS: readonly ViewDescriptor[] = [{ id: 'exposure', path: '/exposure', label: 'Exposure', title: 'Exposure', subtitle: 'What am I exposed to?', panelTitle: 'Exposure', copy: { noun: 'portfolio exposure', loading: 'Loading exposure…', emptyHeading: 'No exposure to show', emptyBody: 'Exposure appears here once a portfolio has synced.' } }];
