import { useLiveGameContext } from "../contexts/LiveGameContext";
import { numFile, numRank } from "../utils/squareConverters";
import "../styles/SquareHighlight.scss";
import { useMemo } from "react";

type Props = {
  square: string;
  type: "previousMove" | "selectedPiece" | "legalMove";
};

export default function SquareHighlight({ square, type }: Props) {
  const { orientation, pieces } = useLiveGameContext();

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
