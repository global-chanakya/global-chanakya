/**
 * Escapes characters with special meaning either inside or outside character sets.
 * Prevents Regex Injection and ReDoS attacks when user input is passed to new RegExp().
 */
export function escapeRegExp(string: string): string {
  if (typeof string !== 'string') return '';
  // $& means the whole matched string
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
