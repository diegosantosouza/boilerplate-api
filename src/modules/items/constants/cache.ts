import { ItemsListInput } from '../dto';
import { buildCacheKey } from '@/shared/cache';

export const ITEMS_CACHE_NAMESPACE = 'items';

export const buildItemShowCacheKey = (id: string): string => `show:${id}`;

export const buildItemListCacheKey = (input: ItemsListInput): string =>
  `list:${buildCacheKey(input)}`;
