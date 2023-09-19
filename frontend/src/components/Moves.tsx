import React, { useMemo } from "react";
import "../styles/Moves.scss";
import movesToAlgebraic from "../utils/movesToAlgebraic";
import Sideline from "./Sideline";
import { Move, Sideline as SidelineType } from "../types";

type Props = {
  moves: Move[];
  moveIndex: number;
  setMoveIndex: React.Dispatch<React.SetStateAction<number>>;
  sidelines?: { [key: number]: SidelineType[] };
  currentSideline?: [number, number] | null;
  setCurrentSideline?: React.Dispatch<
    React.SetStateAction<[number, number] | null>
  >;
};

export default function Moves({
  moves,
  moveIndex,
  setMoveIndex,
  sidelines,
  currentSideline,
  setCurrentSideline,
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
              {sidelines && setCurrentSideline && sidelines[i * 2] ? (
                <>
                  <li
                    className="live-moves__move-group"
                    data-move-number={i + 1}
                  >
                    <div
                      className={`live-moves__move ${
                        !currentSideline && i * 2 === moveIndex
                          ? "highlighted"
                          : ""
                      }`}
                      onClick={() => {
                        setMoveIndex(i * 2);
                        if (setCurrentSideline) setCurrentSideline(null);
                      }}
                    >
                      {moveGroup[0]}
                    </div>
                    {moveGroup.length > 1 && (
                      <div
                        className={`live-moves__move`}
                        style={{ cursor: "default" }}
                      >
                        ...
                      </div>
                    )}
                  </li>
                  {sidelines[i * 2].map((sideline, j) => (
                    <Sideline
                      sideline={sideline}
                      index={j}
                      moves={moves}
                      key={j}
                      moveIndex={moveIndex}
                      isCurrent={
                        !!currentSideline &&
                        currentSideline[0] === i * 2 &&
                        currentSideline[1] === j
                      }
                      setCurrentSideline={setCurrentSideline}
                      setMoveIndex={setMoveIndex}
                    />
                  ))}
                  {moveGroup.length > 1 && (
                    <li
                      className="live-moves__move-group"
                      data-move-number={i + 1}
                    >
                      <div
                        className={`live-moves__move`}
                        style={{ cursor: "default" }}
                      >
                        ...
                      </div>
                      <div
                        className={`live-moves__move ${
                          !currentSideline && i * 2 + 1 === moveIndex
                            ? "highlighted"
                            : ""
                        }`}
                        onClick={() => {
                          setMoveIndex(i * 2 + 1);
                          if (setCurrentSideline) setCurrentSideline(null);
                        }}
                      >
                        {moveGroup[1]}
                      </div>
                    </li>
                  )}
                </>
              ) : (
                <li
                  className="live-moves__move-group"
                  data-move-number={i + 1}
                  key={i}
                >
                  <div
                    className={`live-moves__move ${
                      !currentSideline && i * 2 === moveIndex
                        ? "highlighted"
                        : ""
                    }`}
                    onClick={() => {
                      setMoveIndex(i * 2);
                      if (setCurrentSideline) setCurrentSideline(null);
                    }}
                  >
                    {moveGroup[0]}
                  </div>
                  {moveGroup.length > 1 && (
                    <div
                      className={`live-moves__move ${
                        !currentSideline && i * 2 + 1 === moveIndex
                          ? "highlighted"
                          : ""
                      }`}
                      onClick={() => {
                        setMoveIndex(i * 2 + 1);
                        if (setCurrentSideline) setCurrentSideline(null);
                      }}
                    >
                      {moveGroup[1]}
                    </div>
                  )}
                </li>
              )}
              {sidelines &&
                setCurrentSideline &&
                sidelines[i * 2 + 1] &&
                sidelines[i * 2 + 1].map((sideline, j) => (
                  <Sideline
                    sideline={sideline}
                    index={j}
                    moves={moves}
                    key={j}
                    moveIndex={moveIndex}
                    isCurrent={
                      !!currentSideline &&
                      currentSideline[0] === i * 2 + 1 &&
                      currentSideline[1] === j
                    }
                    setCurrentSideline={setCurrentSideline}
                    setMoveIndex={setMoveIndex}
                  />
                ))}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
