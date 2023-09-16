import { useMemo } from "react";
import movesToAlgebraic from "../utils/movesToAlgebraic";
import "../styles/TopLines.scss";

type Move = {
  from: string;
  to: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

type Line = {
  eval: number;
  moves: Move[];
};

type Props = {
  lines: Line[];
  moveIndex: number;
};

export default function TopLines({ lines, moveIndex }: Props) {
  const blackStarts = moveIndex % 2 === 0;

  const algebraicLines = useMemo(() => {
    const res: { eval: number; moves: string[][] }[] = [];

    for (let line of lines) {
      const subRes: string[][] = [];
      const ungroupedMoves = movesToAlgebraic(line.moves);
      for (let i = 0; i < ungroupedMoves.length; i++) {
        if (i % 2 === 0) {
          subRes.push([ungroupedMoves[i]]);
        } else {
          subRes[subRes.length - 1].push(ungroupedMoves[i]);
        }
      }

      res.push({ eval: line.eval, moves: subRes });
    }

    return res;
  }, [lines]);

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
              {line.eval > 0 ? "+" + line.eval : line.eval}
            </div>
            <ul className="top-lines__line__moves">
              {line.moves.map((moveGroup, i) => (
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
