export type DecimalString = string;
export type OpaqueId = string;
export interface HealthOut {
  status: 'ok' | 'not_ready'; snapshot_id: string | null;
  admitted_instruments: number; observables: number; instruments: number; bases: number;
}
export function isDecimalString(value: unknown): value is DecimalString {
  return typeof value === 'string' && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value);
}
export interface ListingOut { venue: string; market_id: OpaqueId; outcome_id: OpaqueId; side: string; admission_status: string }
export interface InstrumentOut {
  instrument_id: OpaqueId; version: number; question: string; claim: Record<string, unknown> | null;
  observables: OpaqueId[]; listings: ListingOut[]; admission_status: string;
  settlement_overrides: Record<string, unknown>[]; provenance: Record<string, unknown> | null;
}
export interface ResolveOut extends ListingOut { instrument_id: OpaqueId; version: number; observables: OpaqueId[] }
export interface BasisMemberOut { instrument_id: OpaqueId; payoff_vector: (number | DecimalString)[] }
export interface BasisOut {
  admission_status: string; payout_currency: string; basis_id: OpaqueId; version: number;
  observables: OpaqueId[]; state_count: number; state_keys: string[]; members: BasisMemberOut[];
  excluded_state_count: number; assumptions: Record<string, unknown>[]; implies: Record<string, unknown>[]; exactness_note: string;
}
export interface PositionIn { venue: string; market_id: OpaqueId; outcome_id: OpaqueId; quantity: DecimalString; currency?: string }
export interface ExposureRequest { positions: PositionIn[] }
export interface BasisExposureOut {
  payout_currency: string; basis_id: OpaqueId; state_count: number; state_keys: string[];
  net_payoff_by_state: DecimalString[]; cash_constant: DecimalString; min_terminal_payoff: DecimalString; max_terminal_payoff: DecimalString;
  contributions: Record<string, unknown>[]; aggregated: Record<string, unknown>[]; settlement_differences: Record<string, unknown>[]; versions: Record<string, unknown>;
}
export interface ExposureResponse {
  snapshot_id: string | null; bases: BasisExposureOut[];
  unresolved: { venue: string; market_id: OpaqueId; outcome_id: OpaqueId; quantity: DecimalString; reason: string; detail: string }[];
  reconciliation: Record<string, unknown>; meaning: string;
}
