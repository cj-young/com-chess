import { useRef, useEffect, useState } from "react";
import "../styles/Board.scss";
import flipIcon from "../assets/repeat-solid.svg";
import leftIcon from "../assets/angle-left-solid.svg";
import rightIcon from "../assets/angle-right-solid.svg";
import PieceComponent from "./PieceComponent";
import { useLiveGameContext } from "../contexts/LiveGameContext";
import SquareHighlight from "./SquareHighlight";
import { letterSquare } from "../utils/squareConverters";
import GameOver from "./GameOver";
import { socket } from "../config/socket";

export default function Board() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [gameOverModal, setGameOverModal] = useState<React.ReactNode>(null);
  const {
    pieces,
    selectedPiece,
    setSelectedPiece,
    orientation,
    setOrientation,
    moves,
    legalMoves,
    makeMove,
    moveIndex,
    setMoveIndex
  } = useLiveGameContext();

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!selectedPiece) return;
    if (boardRef.current) {
      const squareSize = boardRef.current.offsetWidth / 8;
      const boardRect = boardRef.current.getBoundingClientRect();
      let newFile = Math.floor((e.clientX - boardRect.left) / squareSize);
      let newRank = Math.floor((e.clientY - boardRect.top) / squareSize);
      if (orientation === "black") {
        newFile = 7 - newFile;
        newRank = 7 - newRank;
      }
      if (newRank < 8 && newFile < 8 && newRank >= 0 && newFile >= 0) {
        const newSquare = letterSquare(newRank, newFile);
        if (newSquare === selectedPiece.square) return;
        if (legalMoves.includes(newSquare)) {
          makeMove({ to: newSquare, from: selectedPiece.square });
        }
        setSelectedPiece(null);
      }
    }
  }

  function handlePrevMove() {
    if (moveIndex > 0) {
      setMoveIndex((prevMoveIndex) => prevMoveIndex - 1);
    }
  }

  function handleNextMove() {
    if (moveIndex < moves.length - 1) {
      setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
    }
  }

  function handleFlipBoard() {
    setOrientation((prevOrientation) =>
      prevOrientation === "white" ? "black" : "white"
    );
  }

  useEffect(() => {
    socket.on("gameWon", ({ type, id }) => {
      setGameOverModal(
        <GameOver
          type={type}
          gameId={id}
          winStatus="won"
          close={() => setGameOverModal(null)}
        />
      );
    });

    socket.on("gameLost", ({ type, id }) => {
      setGameOverModal(
        <GameOver
          type={type}
          gameId={id}
          winStatus="lost"
          close={() => setGameOverModal(null)}
        />
      );
    });

    socket.on("gameDrawn", ({ type, id }) => {
      setGameOverModal(
        <GameOver
          type={type}
          gameId={id}
          winStatus="drawn"
          close={() => setGameOverModal(null)}
        />
      );
    });

    socket.on("startGame", () => {
      setGameOverModal(null);
    });

    return () => {
      socket.off("gameWon");
      socket.off("gameLost");
      socket.off("gameDrawn");
    };
  }, []);

  return (
    <div className="board-container">
      <div className="board" ref={boardRef} onClick={handleClick}>
        <div className="squares">
          {Array(8)
            .fill(null)
            .map((row, i) => {
              return (
                <div className="row" key={i}>
                  {Array(8)
                    .fill(null)
                    .map((square, j) => (
                      <div className="square" key={j}></div>
                    ))}
                </div>
              );
            })}
        </div>
        <div className="pieces">
          {pieces.map(
            (piece, i) =>
              piece.active && (
                <PieceComponent piece={piece} key={i} boardRef={boardRef} />
              )
          )}
        </div>
        {selectedPiece && (
          <SquareHighlight square={selectedPiece.square} type="selectedPiece" />
        )}
        {moveIndex > 0 && (
          <>
            <SquareHighlight
              square={moves[moveIndex].from}
              type="previousMove"
            />
            <SquareHighlight square={moves[moveIndex].to} type="previousMove" />
          </>
        )}
        {legalMoves.map((legalMove, i) => (
          <SquareHighlight square={legalMove} type="legalMove" key={i} />
        ))}
        {gameOverModal}
      </div>
      <div className="controls">
        <button className="flip-board" onClick={handleFlipBoard}>
          <img src={flipIcon} alt="Flip board" />
        </button>
        <div className="right-buttons">
          <button className="prev-move" onClick={handlePrevMove}>
            <img src={leftIcon} alt="View previous move" />
          </button>
          <button className="next-move" onClick={handleNextMove}>
            <img src={rightIcon} alt="View next move" />
          </button>
        </div>
      </div>
    </div>
  );
}
