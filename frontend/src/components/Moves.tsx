import React, { useMemo } from "react";
import "../styles/Moves.scss";
import movesToAlgebraic from "../utils/movesToAlgebraic";
import Sideline from "./Sideline";

type Move = {
  from: string;
  to: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

type Sideline = {
  startsAt: number;
  moves: Move[];
};

type Props = {
  moves: Move[];
  moveIndex: number;
  setMoveIndex: React.Dispatch<React.SetStateAction<number>>;
  sidelines?: { [key: number]: Sideline[] };
  currentSideline?: [number, number] | null;
};

export default function Moves({
  moves,
  moveIndex,
  setMoveIndex,
  sidelines,
  currentSideline,
}: Props) {
  const algebraicMoves = useMemo(() => {
    const res: string[][] = [];
    const ungroupedMoves = movesToAlgebraic(moves);
    for (let i = 0; i < ungroupedMoves.length; i++) {
      if (i % 2 === 0) {
        res.push([ungroupedMoves[i]]);
      } else {
        res[res.length - 1].push(ungroupedMoves[i]);
      }
    }
    return res;
  }, [moves]);

  return (
    <div className="live-moves">
      <h2>Moves</h2>
      <div className="moves-wrapper">
        <ul>
          {algebraicMoves.map((moveGroup, i) => (
            <React.Fragment key={i}>
              {sidelines && sidelines[i * 2] ? (
                <>
                  <li className="live-moves__move-group">
                    <div
                      className={`live-moves__move ${
                        i * 2 === moveIndex ? "highlighted" : ""
                      }`}
                      onClick={() => setMoveIndex(i * 2)}
                    >
                      {moveGroup[0]}
                    </div>
                    {moveGroup.length > 1 && (
                      <div className={`live-moves__move`}>...</div>
                    )}
                  </li>
                  {sidelines[i * 2].map((sideline, j) => (
                    <Sideline
                      sideline={sideline}
                      index={j}
                      moves={moves}
                      key={j}
                    />
                  ))}
                  {moveGroup.length > 1 && (
                    <li className="live-moves__move-group">
                      <div className={`live-moves__move`}>...</div>
                      <div
                        className={`live-moves__move ${
                          i * 2 + 1 === moveIndex ? "highlighted" : ""
                        }`}
                        onClick={() => setMoveIndex(i * 2 + 1)}
                      >
                        {moveGroup[1]}
                      </div>
                    </li>
                  )}
                </>
              ) : (
                <li className="live-moves__move-group" key={i}>
                  <div
                    className={`live-moves__move ${
                      i * 2 === moveIndex ? "highlighted" : ""
                    }`}
                    onClick={() => setMoveIndex(i * 2)}
                  >
                    {moveGroup[0]}
                  </div>
                  {moveGroup.length > 1 && (
                    <div
                      className={`live-moves__move ${
                        i * 2 + 1 === moveIndex ? "highlighted" : ""
                      }`}
                      onClick={() => setMoveIndex(i * 2 + 1)}
                    >
                      {moveGroup[1]}
                    </div>
                  )}
                </li>
              )}
              {sidelines &&
                sidelines[i * 2 + 1] &&
                sidelines[i * 2 + 1].map((sideline, j) => (
                  <Sideline
                    sideline={sideline}
                    index={j}
                    moves={moves}
                    key={j}
                  />
                ))}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
