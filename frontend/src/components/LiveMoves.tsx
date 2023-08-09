import { useMemo } from "react";
import { useLiveGameContext } from "../contexts/LiveGameContext";
import "../styles/LiveMoves.scss";
import movesToAlgebraic from "../utils/movesToAlgebraic";

export default function LiveMoves() {
  const { moves, moveIndex, setMoveIndex } = useLiveGameContext();

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
          ))}
        </ul>
      </div>
    </div>
  );
}
