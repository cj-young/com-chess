import generatePseudoLegalBishopMoves from "./bishop";
import generatePseudoLegalRookMoves from "./rook";
import { Color, Position } from "../../../types";

export default function generatePseudoLegalQueenMoves(
  position: Position,
  square: bigint,
  turn: Color
): bigint[] {
  const bishopMoves = generatePseudoLegalBishopMoves(position, square, turn);
  const rookMoves = generatePseudoLegalRookMoves(position, square, turn);

  const combinedMoves = new Set<bigint>([...bishopMoves, ...rookMoves]);

  return [...combinedMoves];
}
