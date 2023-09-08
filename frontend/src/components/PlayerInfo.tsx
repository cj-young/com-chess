import { useMemo } from "react";
import Piece, { PieceType, pieceImages, pieceValues } from "../utils/Piece";
import "../styles/PlayerInfo.scss";

type Props = {
  pieces: Piece[];
  username: string;
  orientation: "black" | "white";
  color: "black" | "white";
};

export default function PlayerInfo({
  pieces,
  username,
  orientation,
  color,
}: Props) {
  const capturedPieces = useMemo(() => {
    const capturedCounts = new Map<PieceType, number>();
    const lostCounts = new Map<PieceType, number>();

    const friendlyStartIndex = color === "white" ? 0 : 16;
    const enemyStartIndex = color === "white" ? 16 : 0;

    for (let i = friendlyStartIndex; i < friendlyStartIndex + 16; i++) {
      if (!pieces[i].active) {
        const currCount = lostCounts.get(pieces[i].type) ?? 0;
        lostCounts.set(pieces[i].type, currCount + 1);
      }
    }

    for (let i = enemyStartIndex; i < enemyStartIndex + 16; i++) {
      if (!pieces[i].active) {
        const currCount = capturedCounts.get(pieces[i].type) ?? 0;
        capturedCounts.set(pieces[i].type, currCount + 1);
      }
    }

    for (let [key, value] of capturedCounts) {
      const netCount = Math.max(value - (lostCounts.get(key) ?? 0), 0);
      capturedCounts.set(key, netCount);
    }

    return capturedCounts;
  }, [pieces]);

  function capturedPieceToDiv(type: PieceType, number = 0, reactKey: any) {
    const res = [];
    for (let i = 0; i < number; i++) {
      res.push(
        <img
          className="clock__piece"
          src={pieceImages
            .get(type)
            ?.get(color === "white" ? "black" : "white")}
        />
      );
    }

    return (
      <div className="player-info__piece-group" data-type={type} key={reactKey}>
        {res}
      </div>
    );
  }

  const advantage = useMemo(() => {
    let res = 0;
    for (let piece of pieces) {
      if (piece.active && piece.type !== "king") {
        const value = pieceValues.get(piece.type) ?? 0;
        if (piece.color === color) {
          res += value;
        } else {
          res -= value;
        }
      }
    }
    return res;
  }, [pieces]);

  return (
    <div className={`player-info ${orientation === color ? "bottom" : "top"}`}>
      <div className="player-info__left">
        <div className="player-info__username">{username}</div>
        <div className="player-info__bottom">
          <div className="player-info__pieces">
            {Array.from(capturedPieces).map(([key, value], i) =>
              capturedPieceToDiv(key, value, i)
            )}
          </div>
          {advantage > 0 && <span>+{advantage}</span>}
        </div>
      </div>
    </div>
  );
}
