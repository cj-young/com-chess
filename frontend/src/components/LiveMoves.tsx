import { useMemo, useRef, useEffect } from "react";
import { useLiveGameContext } from "../contexts/LiveGameContext";
import "../styles/LiveMoves.scss";
import movesToAlgebraic from "../utils/movesToAlgebraic";

export default function LiveMoves() {
  const { moves } = useLiveGameContext();

  const anchor = useRef<HTMLLIElement | null>(null);

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

  useEffect(() => {
    anchor.current?.scrollIntoView();
  }, [algebraicMoves]);

  return (
    <div className="live-moves">
      <h2>Moves</h2>
      <div className="moves-wrapper">
        <ul>
          {algebraicMoves.map((moveGroup) => (
            <>
              <li className="live-moves__move-group">
                <div className="live-moves__move">{moveGroup[0]}</div>
                {moveGroup.length > 1 && (
                  <div className="live-moves__move">{moveGroup[1]}</div>
                )}
              </li>
            </>
          ))}
          <li ref={anchor}></li>
        </ul>
      </div>
    </div>
  );
}
