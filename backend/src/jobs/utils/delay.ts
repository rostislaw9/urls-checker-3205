export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay(maxSeconds = 10): Promise<void> {
  const ms = Math.floor(Math.random() * maxSeconds * 1000);
  return delay(ms);
}
