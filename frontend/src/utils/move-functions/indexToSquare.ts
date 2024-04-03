export default function indexToSquare(index: bigint): string {
  const file = "abcdefgh"[Number(index) % 8];
  const rank = Math.floor(Number(index) / 8 + 1).toString();

  return file + rank;
}
