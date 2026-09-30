export type DecimalString = string;
export type OpaqueId = string;
export interface HealthOut {
  status: 'ok' | 'not_ready'; snapshot_id: string | null;
  admitted_instruments: number; observables: number; instruments: number; bases: number;
}
