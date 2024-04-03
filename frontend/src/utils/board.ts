import { Color } from "../types";

export function getSquareAt(
  board: HTMLElement,
  x: number,
  y: number,
  orientation: Color
) {
  const squareSize = board.offsetWidth / 8;
  const boardRect = board.getBoundingClientRect();
  let file = Math.floor((x - boardRect.left) / squareSize);
  let rank = Math.floor((y - boardRect.top) / squareSize);
  if (orientation === "black") {
    file = 7 - file;
    rank = 7 - rank;
  }

  return [rank, file];
}
