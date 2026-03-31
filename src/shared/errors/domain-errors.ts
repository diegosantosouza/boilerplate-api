export type DomainError =
  | { type: 'NOT_FOUND'; message: string; resource?: string }
  | {
      type: 'VALIDATION';
      message: string;
      fields?: Array<{ field: string; message: string }>;
    }
  | { type: 'CONFLICT'; message: string }
  | { type: 'UNAUTHORIZED'; message: string }
  | { type: 'FORBIDDEN'; message: string }
  | { type: 'EXTERNAL_SERVICE'; message: string; service?: string }
  | { type: 'INTERNAL'; message: string };

export function domainErrorToStatus(error: DomainError): number {
  const map: Record<DomainError['type'], number> = {
    NOT_FOUND: 404,
    VALIDATION: 400,
    CONFLICT: 409,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    EXTERNAL_SERVICE: 502,
    INTERNAL: 500,
  };
  return map[error.type];
}
