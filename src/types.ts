export type IOCType = 'ip' | 'domain' | 'url' | 'hash';
export interface Reference { name: string; url: string }
export interface Indicator { id: string; value: string; type: IOCType; source: string; firstSeen: string | null; lastSeen: string | null; context: string; imported?: boolean }
export interface Entity { id: string; kind: 'actor' | 'technique' | 'campaign'; name: string; description: string; externalId: string; aliases: string[]; tactics: string[]; references: Reference[]; modified: string }
export interface Relation { id: string; source: string; target: string; type: string; description: string; references: Reference[] }
export interface Source { id: string; name: string; url: string; license: string; licenseUrl: string; status: 'ok' | 'stale' | 'unavailable'; fetchedAt: string | null; attemptedAt: string; count: number; error?: string; sha256?: string; upstreamModified?: string | null; limit?: number }
export interface Dataset { schemaVersion: 1; generatedAt: string; indicators: Indicator[]; entities: Entity[]; relationships: Relation[]; tactics: { id: string; name: string; shortname: string; url: string }[]; sources: Source[] }
