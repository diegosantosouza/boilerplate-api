import type { Item } from '../entities';

export const ItemEvents = {
  CREATED: 'item.created',
  UPDATED: 'item.updated',
  DELETED: 'item.deleted',
} as const;

export type ItemCreatedPayload = Item;
export type ItemUpdatedPayload = Item;
export type ItemDeletedPayload = { id: string };
