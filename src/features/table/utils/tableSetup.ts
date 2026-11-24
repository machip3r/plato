export function randomTableSize(previous?: number) {
  const choices = [2, 3, 4, 5, 6, 7, 8].filter(count => count !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}
