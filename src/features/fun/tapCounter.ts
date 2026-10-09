/** Counts quick taps in a row; the returned function reports true on the tap that reaches `needed`. */
export function createTapCounter(needed: number, windowMs: number): () => boolean {
  let count = 0
  let last = 0
  return () => {
    const now = Date.now()
    count = now - last < windowMs ? count + 1 : 1
    last = now
    if (count >= needed) {
      count = 0
      return true
    }
    return false
  }
}
