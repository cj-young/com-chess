import { useMemo } from "react";
import movesToAlgebraic from "../utils/movesToAlgebraic";
import "../styles/TopLines.scss";
import getEval from "../utils/getEval";

type Move = {
  from: string;
  to: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

type Line = {
  eval: number;
  moves: Move[];
  leadingMoves: Move[];
  type: "mate" | "cp";
};

type Props = {
  lines: Line[];
  moveIndex: number;
  moves: Move[];
};

export default function TopLines({ lines, moveIndex }: Props) {
  const blackStarts = useMemo(() => moveIndex % 2 === 0, [moveIndex]);

  const algebraicLines = useMemo(() => {
    const res = [];

    for (let line of lines) {
      const subRes: string[][] = [];
      const ungroupedMoves = movesToAlgebraic([
        ...line.leadingMoves,
        ...line.moves,
      ]).slice(moveIndex + 1);
      for (let i = 0; i < ungroupedMoves.length; i++) {
        if (i % 2 === 0) {
          subRes.push([ungroupedMoves[i]]);
        } else {
          subRes[subRes.length - 1].push(ungroupedMoves[i]);
        }
      }

      res.push({ ...line, algMoves: subRes });
    }

    return res;
  }, [lines, blackStarts]);

  return (
    <div className="top-lines">
      <h2>Best Moves</h2>
      <div className="lines">
        {algebraicLines.map((line, i) => (
          <div className="top-lines__line" key={i}>
            <div
              className={`top-lines__line__eval ${
                line.eval < 0 ? "black-adv" : ""
              }`}
            >
              {getEval(line).adv}
            </div>
            <ul className="top-lines__line__moves">
              {line.algMoves.map((moveGroup, i) => (
                <li className="top-lines__line__move-group">
                  <div className="top-lines__line__move-counter">
                    {i === 0 && blackStarts
                      ? `${i + 2 + Math.floor(moveIndex / 2)}...`
                      : `${i + 2 + Math.floor(moveIndex / 2)}.`}
                  </div>
                  <div className="top-lines__line__move">{moveGroup[0]}</div>
                  {moveGroup.length > 1 && (
                    <div className="top-lines__line__move">{moveGroup[1]}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
