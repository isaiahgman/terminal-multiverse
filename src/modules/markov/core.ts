export function buildTransitionTable(corpus: string, prefixLen: number = 2): Map<string, string[]> {
  const table = new Map<string, string[]>();
  // Split by whitespace and filter empty words
  const words = corpus.split(/\s+/).filter((w) => w.length > 0);

  if (words.length <= prefixLen) {
    return table;
  }

  for (let i = 0; i < words.length - prefixLen; i++) {
    // Construct key (e.g. "word1 word2")
    const key = words.slice(i, i + prefixLen).join(' ');
    const nextWord = words[i + prefixLen];

    const currentList = table.get(key) || [];
    currentList.push(nextWord);
    table.set(key, currentList);
  }

  return table;
}

export function generateMarkovText(
  table: Map<string, string[]>,
  length: number,
  prefixLen: number = 2,
): string {
  if (table.size === 0) {
    return '';
  }

  // Get keys array
  const keys = Array.from(table.keys());
  // Select a random starting key
  let currentKey = keys[Math.floor(Math.random() * keys.length)];
  const resultWords = currentKey.split(' ');

  for (let i = 0; i < length - prefixLen; i++) {
    const options = table.get(currentKey);
    if (!options || options.length === 0) {
      // Hit a dead end, pick another random key
      const nextKey = keys[Math.floor(Math.random() * keys.length)];
      resultWords.push(...nextKey.split(' '));
      currentKey = nextKey;
      continue;
    }

    const nextWord = options[Math.floor(Math.random() * options.length)];
    resultWords.push(nextWord);

    // Update key: drop the first word, append the new one
    const currentKeyWords = currentKey.split(' ');
    currentKeyWords.shift();
    currentKeyWords.push(nextWord);
    currentKey = currentKeyWords.join(' ');
  }

  return resultWords.join(' ');
}
