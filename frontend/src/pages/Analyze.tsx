import { useState, useCallback, useMemo, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import Piece from "../utils/Piece";
import Navbar from "../components/Navbar";
import PlayerInfo from "../components/PlayerInfo";
import applyMoves from "../utils/applyMoves";
import generateStartingPosition from "../utils/generateStartingPosition";
import Board from "../components/Board";
import Moves from "../components/Moves";
import generateLegalMoves from "../utils/moveFunctions/generateLegalMoves";
import "../styles/Analyze.scss";

type Move = {
  from: string;
  to: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

export default function Analyze() {
  const [isLoading, setIsLoading] = useState(true);
  const [moves, setMoves] = useState<Move[]>([]);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const { gameId } = useParams();

  const isPastGame = gameId !== undefined;

  const pieces = useMemo(() => {
    return applyMoves(
      generateStartingPosition(),
      moves.slice(0, moveIndex + 1)
    );
  }, [moves, moveIndex]);

  const turn = useMemo(() => {
    return moves.length % 2 === 0 ? "white" : "black";
  }, [moves]);

  const { user } = useAuthContext();

  const canDragCB = useCallback(
    (piece: Piece) => {
      return turn === piece.color && moveIndex === moves.length - 1;
    },
    [moveIndex, moves, turn]
  );

  useLayoutEffect(() => {
    setMoveIndex(moves.length - 1);
  }, [moves]);

  function makeMove(move: Move) {
    setMoves((prevMoves) => {
      const prevPieces = applyMoves(generateStartingPosition(), prevMoves);

      // Verify legality
      const movedPiece = pieces.filter(
        (p) => p.square === move.from && p.active
      )[0];
      if (!movedPiece) return prevMoves;
      const verifiedLegalMoves = generateLegalMoves(
        prevPieces,
        movedPiece,
        moves
      );

      let moveFound;
      for (let legalMove of verifiedLegalMoves) {
        if (legalMove === move.to) {
          moveFound = true;
        }
      }
      if (!moveFound) return prevMoves;

      return [...prevMoves, move];
    });
  }

  return (
    <div className="analyze">
      <Navbar />
      <div className={`analyze__container ${isPastGame ? "" : "show-games"}`}>
        <div className="eval-container">
          <div className="eval"></div>
        </div>
        <div className="player-info-container top">
          <PlayerInfo
            pieces={pieces}
            username={
              isPastGame
                ? "Temp Top"
                : orientation === "white"
                ? "Black"
                : "White"
            }
            orientation={orientation}
            color={orientation === "white" ? "black" : "white"}
          />
        </div>

        <Board
          pieces={pieces}
          moves={moves}
          orientation={orientation}
          setOrientation={setOrientation}
          prevMove={() => {
            if (moveIndex >= 0) {
              setMoveIndex((prevMoveIndex) => prevMoveIndex - 1);
            }
          }}
          nextMove={() => {
            if (moveIndex < moves.length - 1) {
              setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
            }
          }}
          moveIndex={moveIndex}
          showControls={true}
          showPieces={true}
          makeMove={makeMove}
          modal={null}
          canDragCB={canDragCB}
        />
        <>
          <div className="player-info-container bottom">
            <PlayerInfo
              pieces={pieces}
              username={
                isPastGame
                  ? "Temp Bottom"
                  : orientation === "white"
                  ? "White"
                  : "Black"
              }
              orientation={orientation}
              color={orientation === "white" ? "black" : "white"}
            />
          </div>
          <div className="past-games-container">
            <div className="past-games"></div>
          </div>
          <div className="analyze-moves-container">
            <Moves
              moves={moves}
              moveIndex={moveIndex}
              setMoveIndex={setMoveIndex}
            />
          </div>
        </>
      </div>
    </div>
  );
}
