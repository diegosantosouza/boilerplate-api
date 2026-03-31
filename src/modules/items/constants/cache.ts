import { buildCacheKey } from '@/shared/cache';
import type { ItemsListInput } from '../dto';

export const ITEMS_CACHE_NAMESPACE = 'items';

export const buildItemShowCacheKey = (id: string): string => `show:${id}`;

export const buildItemListCacheKey = (input: ItemsListInput): string =>
  `list:${buildCacheKey(input)}`;
