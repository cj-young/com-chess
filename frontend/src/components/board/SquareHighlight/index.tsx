import { useMemo } from "react";
import { Color } from "../../../types";
import Piece from "../../../utils/Piece";
import { numFile, numRank } from "../../../utils/squareConverters";
import "./styles.scss";

type Props = {
  square: string;
  type: "previousMove" | "selectedPiece" | "legalMove" | "hoverSquare";
  orientation: Color;
  pieces: Piece[];
};

export default function SquareHighlight({
  square,
  type,
  orientation,
  pieces
}: Props) {
  const isPiece = useMemo(() => {
    for (let piece of pieces)
      if (piece.square === square && piece.active) return true;
    return false;
  }, [pieces, square]);

  return (
    <div
      className={`square-highlight ${
        type === "selectedPiece"
          ? "selected-piece"
          : type === "previousMove"
          ? "previous-move"
          : type === "hoverSquare"
          ? "hover-square"
          : `legal-move ${isPiece ? "on-piece-square" : ""}`
      }`}
      style={{
        top: `calc((100% / 8) * ${
          orientation === "white" ? numRank(square) : 7 - numRank(square)
        })`,
        left: `calc((100% / 8) * ${
          orientation === "white" ? numFile(square) : 7 - numFile(square)
        })`
      }}
    ></div>
  );
}
