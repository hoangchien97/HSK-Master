/**
 * Serialization utilities for SSR → Client data transfer.
 *
 * Next.js App Router requires props passed from Server Components to Client
 * Components to be serializable (no Date objects, etc.).
 * Instead of JSON.parse(JSON.stringify(data)), we recursively convert
 * Date instances to ISO strings, preserving all other types.
 */

/**
 * Recursively converts Date instances to ISO strings.
 * Handles nested objects, arrays, null, and primitives.
 * Type-safe: returns the same shape with Dates replaced by strings.
 */
export function serializeDates<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj

  if (obj instanceof Date) {
    return obj.toISOString() as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeDates(item)) as unknown as T
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeDates(value)
    }
    return result as T
  }

  return obj
}
