function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        const nestedValue = (value as Record<string, unknown>)[key];
        acc[key] = sortValue(nestedValue);
        return acc;
      }, {});
  }

  return value;
}

export const buildCacheKey = (value: unknown): string =>
  JSON.stringify(sortValue(value));
