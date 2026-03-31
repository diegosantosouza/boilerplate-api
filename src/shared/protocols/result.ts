import type { Result } from 'neverthrow';
import type { DomainError } from '@/shared/errors/domain-errors';

export type DomainResult<T> = Result<T, DomainError>;
