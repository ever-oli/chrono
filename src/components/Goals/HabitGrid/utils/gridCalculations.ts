export function calculateIntensity(
  totalSeconds: number,
  maxIntensity: number,
  minOpacity = 0.4,
  maxOpacity = 1
): number {
  if (totalSeconds === 0) return 0;
  const normalizedIntensity = totalSeconds / maxIntensity;
  return minOpacity + (maxOpacity - minOpacity) * normalizedIntensity;
}