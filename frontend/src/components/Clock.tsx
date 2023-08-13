import { useMemo } from "react";
import "../styles/Clock.scss";
import { useLiveGameContext } from "../contexts/LiveGameContext";
import { PieceType, pieceImages, pieceValues } from "../utils/Piece";

type Props = {
  player: "top" | "bottom";
};

export default function Clock({ player }: Props) {
  const {
    orientation,
    gameInfo,
    blackTime,
    whiteTime,
    pieces,
    maxWhiteTime,
    maxBlackTime,
    justMoved,
    turn,
    gameOver
  } = useLiveGameContext();

  const clockColor = useMemo(() => {
    if (player === "bottom") return orientation;
    return orientation === "white" ? "black" : "white";
  }, [player, orientation]);

  const time = useMemo(() => {
    const time = clockColor === "white" ? whiteTime : blackTime;
    const totalSeconds = Math.max(Math.floor(time / 1000), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      minutes,
      seconds
    };
  }, [blackTime, whiteTime, clockColor]);

  const capturedPieces = useMemo(() => {
    const capturedCounts = new Map<PieceType, number>();
    const lostCounts = new Map<PieceType, number>();

    const friendlyStartIndex = clockColor === "white" ? 0 : 16;
    const enemyStartIndex = clockColor === "white" ? 16 : 0;

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

  const timePercent = useMemo(() => {
    if (clockColor === "white") {
      return whiteTime / maxWhiteTime;
    } else {
      return blackTime / maxBlackTime;
    }
  }, [clockColor, whiteTime, blackTime, maxWhiteTime, maxBlackTime]);

  function capturedPieceToDiv(type: PieceType, number = 0, reactKey: any) {
    const res = [];
    for (let i = 0; i < number; i++) {
      res.push(
        <img
          className="clock__piece"
          src={pieceImages
            .get(type)
            ?.get(clockColor === "white" ? "black" : "white")}
        />
      );
    }

    return (
      <div className="clock__piece-group" data-type={type} key={reactKey}>
        {res}
      </div>
    );
  }

  const advantage = useMemo(() => {
    let res = 0;
    for (let piece of pieces) {
      if (piece.active && piece.type !== "king") {
        const value = pieceValues.get(piece.type) ?? 0;
        if (piece.color === clockColor) {
          res += value;
        } else {
          res -= value;
        }
      }
    }
    return res;
  }, [pieces]);

  return (
    <div
      className={`clock ${player} ${
        turn === clockColor && !justMoved && !gameOver ? "active" : ""
      }`}
      style={{ "--time-percent": timePercent } as React.CSSProperties}
    >
      <div className="clock__left">
        <div className="clock__username">
          {clockColor === "white"
            ? gameInfo.blackUsername
            : gameInfo.whiteUsername}
        </div>

        <div className="clock__bottom">
          <div className="clock__pieces">
            {Array.from(capturedPieces).map(([key, value], i) =>
              capturedPieceToDiv(key, value, i)
            )}
          </div>
          {advantage > 0 && <span>+{advantage}</span>}
        </div>
      </div>
      <div className="clock__time">
        <div className="clock__time__minutes">{time.minutes}</div>
        <div className="clock__time__separator">:</div>
        <div className="clock__time__seconds">
          {time.seconds < 10 ? "0" + time.seconds : time.seconds}
        </div>
      </div>
    </div>
  );
}
