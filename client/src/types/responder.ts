export interface ResponderLinkRecord {
  emergencyId: string;
  propertyId: string;
  propertyName: string;
  createdAt: number;
  expiresAt: number;
  createdBy: string;
  isRevoked: boolean;
  accessCount: number;
  lastAccessedAt: number | null;
}

export interface ValidatedLink extends ResponderLinkRecord {
  token: string;
}

export type TokenValidationResult = 
  | { valid: true; linkData: ValidatedLink }
  | { valid: false; reason: "expired" | "revoked" | "not_found" };

export interface Hazard {
  id: string;
  type: string;
  location: string;
  floor: number;
  reportedAt: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
