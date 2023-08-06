import { useLiveGameContext } from "../contexts/LiveGameContext";
import { numFile, numRank } from "../utils/squareConverters";
import "../styles/SquareHighlight.scss";

type Props = {
  square: string;
  type: "previousMove" | "selectedPiece" | "legalMove";
};

export default function SquareHighlight({ square, type }: Props) {
  const { orientation } = useLiveGameContext();

  return (
    <div
      className={`square-highlight ${
        type === "selectedPiece"
          ? "selected-piece"
          : type === "previousMove"
          ? "previous-move"
          : "legal-move"
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
