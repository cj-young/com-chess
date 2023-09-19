import generatePseudoLegalBishopMoves from "./bishop";
import generatePseudoLegalRookMoves from "./rook";
import { Position } from "../../../types";

export default function generatePseudoLegalQueenMoves(
  position: Position,
  square: bigint,
  turn: "white" | "black"
): bigint[] {
  const bishopMoves = generatePseudoLegalBishopMoves(position, square, turn);
  const rookMoves = generatePseudoLegalRookMoves(position, square, turn);

  const combinedMoves = new Set<bigint>([...bishopMoves, ...rookMoves]);

  return [...combinedMoves];
}
