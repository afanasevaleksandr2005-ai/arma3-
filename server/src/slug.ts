export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function isValidSlug(value: string): boolean {
  return value.length > 0 && value.length <= 48 && SLUG_PATTERN.test(value)
}
