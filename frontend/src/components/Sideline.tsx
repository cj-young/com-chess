import { useMemo } from "react";
import movesToAlgebraic from "../utils/movesToAlgebraic";
import "../styles/Sideline.scss";

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
  sideline: Sideline;
  index: number;
  moves: Move[];
};

export default function Sideline({ sideline, index, moves }: Props) {
  const blackStarts = sideline.startsAt % 2 !== 0;

  const pairedMoves = useMemo(() => {
    const res: string[][] = [];
    const ungroupedMoves = movesToAlgebraic([
      ...moves.slice(0, sideline.startsAt),
      ...sideline.moves,
    ]).slice(sideline.startsAt);
    if (blackStarts) res.push([]);
    for (let i = 0; i < ungroupedMoves.length; i++) {
      if (i % 2 === 0 + (blackStarts ? 1 : 0)) {
        res.push([ungroupedMoves[i]]);
      } else {
        res[res.length - 1].push(ungroupedMoves[i]);
      }
    }

    return res;
  }, [moves, sideline]);
  return (
    <li className="sideline">
      <ul>
        {pairedMoves.map((moveGroup, i) => (
          <li className="sideline__move-group" key={i}>
            <div className="sideline__move-counter">
              {i === 0 && blackStarts ? `${i + 1}...` : `${i + 1}.`}
            </div>
            <div className={`sideline__move`}>{moveGroup[0]}</div>
            {moveGroup.length > 1 && (
              <div className={`sideline__move`}>{moveGroup[1]}</div>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}
