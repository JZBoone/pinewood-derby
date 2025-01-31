export function formatRaceTime(timeInMillis: number): string {
  return `${(timeInMillis / 1000).toFixed(3)} seconds`;
}
