import { useMemo, useState } from "react";
import { Color, Move, Sideline } from "../types";
import applyMoves from "../utils/applyMoves";
import generateStartingPosition from "../utils/generateStartingPosition";
import generateLegalMoves from "../utils/move-functions/generateLegalMoves";

type Options = {
  allowSidelines?: boolean;
};

export default function useMoves({ allowSidelines = false }: Options = {}) {
  const [moves, setMoves] = useState<Move[]>([]);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [sidelines, setSidelines] = useState<{ [key: number]: Sideline[] }>({});
  const [currentSideline, setCurrentSideline] = useState<
    [number, number] | null
  >(null);

  const modifiedMoves = useMemo(() => {
    if (!currentSideline || !allowSidelines) return moves;
    const currentSidelineArr =
      sidelines[currentSideline[0]][currentSideline[1]];
    return [
      ...moves.slice(0, currentSidelineArr.startsAt),
      ...currentSidelineArr.moves
    ];
  }, [moves, sidelines, currentSideline]);

  const turn: Color = moveIndex % 2 === 0 ? "black" : "white";

  const pieces = useMemo(() => {
    const { pieces: newPieces, error: moveError } = applyMoves(
      generateStartingPosition(),
      modifiedMoves.slice(0, moveIndex + 1)
    );
    return moveError ? [] : newPieces;
  }, [modifiedMoves, moveIndex]);

  function nextMove() {
    if (moveIndex < modifiedMoves.length - 1) {
      setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
    }
  }

  function prevMove() {
    if (moveIndex >= 0) {
      if (
        currentSideline &&
        allowSidelines &&
        sidelines[currentSideline[0]][currentSideline[1]].startsAt >= moveIndex
      ) {
        setCurrentSideline(null);
      }
      setMoveIndex((prevMoveIndex) => prevMoveIndex - 1);
    }
  }

  function makeMove(move: Move) {
    if (
      moveIndex + 1 < modifiedMoves.length &&
      move.to === modifiedMoves[moveIndex + 1].to &&
      move.from === modifiedMoves[moveIndex + 1].from &&
      move.promoteTo === modifiedMoves[moveIndex + 1].promoteTo
    ) {
      // Keep current line if move is the same as next move on the current line
      setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
      return;
    }

    if (currentSideline && allowSidelines) {
      // Verify legality
      const movedPiece = pieces.filter(
        (p) => p.square === move.from && p.active
      )[0];
      if (!movedPiece) return;
      const verifiedLegalMoves = generateLegalMoves(
        pieces,
        movedPiece,
        modifiedMoves.slice(0, moveIndex + 1)
      );

      const isLegal = verifiedLegalMoves.some(
        (legalMove) => legalMove === move.to
      );
      if (!isLegal) return;

      const movesIn =
        moveIndex - sidelines[currentSideline[0]][currentSideline[1]].startsAt;

      const updatedSideline = {
        startsAt: currentSideline[0],
        moves: [
          ...sidelines[currentSideline[0]][currentSideline[1]].moves.slice(
            0,
            movesIn + 1
          ),
          move
        ]
      };

      setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);

      setSidelines((prevSidelines) => ({
        ...prevSidelines,
        [currentSideline[0]]: [
          ...prevSidelines[currentSideline[0]].slice(0, currentSideline[1]),
          updatedSideline,
          ...prevSidelines[currentSideline[0]].slice(currentSideline[1] + 1)
        ]
      }));
    } else {
      if (moveIndex === moves.length - 1) {
        const { pieces: prevPieces, error: moveError } = applyMoves(
          generateStartingPosition(),
          moves
        );
        if (moveError) return { error: moveError };

        // Verify legality
        const movedPiece = pieces.filter(
          (p) => p.square === move.from && p.active
        )[0];
        if (!movedPiece) return { error: "No piece there" };
        const verifiedLegalMoves = generateLegalMoves(
          prevPieces,
          movedPiece,
          modifiedMoves
        );

        let moveFound;
        for (let legalMove of verifiedLegalMoves) {
          if (legalMove === move.to) {
            moveFound = true;
          }
        }
        if (!moveFound) return { error: "Illegal move attempted" };
        setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);

        setMoves((prevMoves) => [...prevMoves, move]);
      } else if (allowSidelines) {
        // Go to sideline if already exists
        if (sidelines[moveIndex + 1]) {
          for (let i = 0; i < sidelines[moveIndex + 1].length; i++) {
            const sideline = sidelines[moveIndex + 1][i];
            if (
              move.to === sideline.moves[0].to &&
              move.from === sideline.moves[0].from &&
              move.promoteTo === sideline.moves[0].promoteTo
            ) {
              setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
              setCurrentSideline([moveIndex + 1, i]);
              return;
            }
          }
        }

        // Verify legality
        const movedPiece = pieces.filter(
          (p) => p.square === move.from && p.active
        )[0];
        if (!movedPiece) return;
        const verifiedLegalMoves = generateLegalMoves(
          pieces,
          movedPiece,
          modifiedMoves.slice(0, moveIndex + 1)
        );

        let moveFound;
        for (let legalMove of verifiedLegalMoves) {
          if (legalMove === move.to) {
            moveFound = true;
          }
        }
        if (!moveFound) return { error: "Illegal move attempted" };

        const updatedSideline = {
          startsAt: moveIndex + 1,
          moves: [move]
        };

        setCurrentSideline([
          moveIndex + 1,
          sidelines[moveIndex + 1] ? sidelines[moveIndex + 1].length : 0
        ]);

        setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);

        setSidelines((prevSidelines) => ({
          ...prevSidelines,
          [moveIndex + 1]: [
            ...(prevSidelines[moveIndex + 1]
              ? prevSidelines[moveIndex + 1]
              : []),
            updatedSideline
          ]
        }));
      }
    }
  }

  return {
    moves,
    moveIndex,
    sidelines,
    currentSideline,
    modifiedMoves,
    turn,
    pieces,
    nextMove,
    prevMove,
    setMoveIndex,
    setCurrentSideline,
    makeMove,
    setMoves
  };
}
