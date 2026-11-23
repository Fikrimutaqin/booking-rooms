export const isOverlapError = (e: unknown): boolean => {
  let text = String(e);
  try {
    text += JSON.stringify((e as { meta?: unknown })?.meta ?? {});
  } catch {
    /* ignore */
  }
  return text.includes('no_overlapping_bookings') || text.includes('23P01');
};
