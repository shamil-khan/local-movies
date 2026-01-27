export const pluralName = (
  items: unknown[],
  word: string,
  plural: string | undefined = undefined,
): string => (items.length === 1 ? word : plural ? plural : `${word}s`);
