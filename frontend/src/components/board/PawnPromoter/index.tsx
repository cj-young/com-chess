import { Color, Move } from "../../../types";
import { pieceImages } from "../../../utils/Piece";
import { numFile } from "../../../utils/squareConverters";
import "./styles.scss";

type Props = {
  from: string;
  to: string;
  color: Color;
  close: () => void;
  makeMove: (move: Move) => void;
  orientation: Color;
};

export default function PawnPromoter({
  from,
  to,
  color,
  close,
  makeMove,
  orientation
}: Props) {
  function handlePromote(newPiece: "queen" | "rook" | "bishop" | "knight") {
    makeMove({ from, to, promoteTo: newPiece });
    close();
  }

  const style =
    (orientation === "white" && to[1] === "8") ||
    (orientation === "black" && to[1] === "1")
      ? {
          top: 0,
          left:
            orientation === "white"
              ? `calc(${numFile(to)} * 100% / 8)`
              : `calc(${7 - numFile(to)} * 100% / 8)`,
          flexDirection: "column" as "column"
        }
      : {
          bottom: 0,
          left:
            orientation === "white"
              ? `calc(${numFile(to)} * 100% / 8)`
              : `calc(${7 - numFile(to)} * 100% / 8)`,
          flexDirection: "column-reverse" as "column-reverse"
        };

  return (
    <div className="pawn-promoter" style={style}>
      <div
        className="pawn-promoter__queen"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          handlePromote("queen");
        }}
      >
        <img src={pieceImages.get("queen")?.get(color)} alt="Queen icon" />
      </div>
      <div
        className="pawn-promoter__rook"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          handlePromote("rook");
        }}
      >
        <img src={pieceImages.get("rook")?.get(color)} alt="Rook icon" />
      </div>
      <div
        className="pawn-promoter__bishop"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          handlePromote("bishop");
        }}
      >
        <img src={pieceImages.get("bishop")?.get(color)} alt="Bishop icon" />
      </div>
      <div
        className="pawn-promoter__knight"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          handlePromote("knight");
        }}
      >
        <img src={pieceImages.get("knight")?.get(color)} alt="Knight icon" />
      </div>
    </div>
  );
}
