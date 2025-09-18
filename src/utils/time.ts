export function getCurrentTimeMMSS() {
  const now = new Date();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
