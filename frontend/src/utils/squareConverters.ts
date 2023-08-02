export function numRank(square: string) {
  return 7 - (+square[1] - 1);
}

export function numFile(square: string) {
  return square.charCodeAt(0) - 97;
}

export function letterRank(rank: number) {
  return 8 - rank;
}

export function letterFile(file: number) {
  return "abcdefgh"[file];
}

export function numSquare(square: string) {
  return [numRank(square), numFile(square)];
}

export function letterSquare(rank: number, file: number) {
  return letterFile(file) + letterRank(rank);
}
