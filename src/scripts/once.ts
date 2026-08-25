/** Wraps `fn` so it runs at most once, no matter how many times the returned function is called. */
export function once(fn: () => void): () => void {
  let called = false;
  return () => {
    if (called) return;
    called = true;
    fn();
  };
}
