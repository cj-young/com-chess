import { useCallback, useRef, useState } from "react";
import Piece from "../utils/Piece";
import Navbar from "../components/Navbar";
import Board from "../components/Board";
import { useBotGameContext } from "../contexts/BotGameContext";
import flagIcon from "../assets/flag-solid.svg";
import "../styles/BotGame.scss";
import ChooseBot from "../components/ChooseBot";
import Moves from "../components/Moves";

export default function BotGame() {
  const [gameOverModal, setGameOverModal] = useState<React.ReactNode>(null);
  const gameOverRef = useRef<boolean>(false);

  const {
    moves,
    pieces,
    setMoveIndex,
    orientation,
    setOrientation,
    makeMove,
    gameState,
    color,
    turn,
    moveIndex,
    gameOver,
  } = useBotGameContext();

  const canDragCB = useCallback(
    (piece: Piece) => {
      return (
        piece.color === color &&
        turn === color &&
        moveIndex === moves.length - 1 &&
        !gameOver
      );
    },
    [color, moveIndex, moves, gameOver]
  );

  gameOverRef.current = gameOver;

  return (
    <div className="bot-game">
      <Navbar />
      <div className="bot-game__container">
        {gameState === "playing" && (
          <div className="clock-container top">
            <div className="clock"></div>
          </div>
        )}

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
          showControls={gameState === "playing"}
          showPieces={gameState === "playing"}
          makeMove={makeMove}
          modal={gameOverModal}
          canDragCB={canDragCB}
        />
        {gameState === "playing" && (
          <>
            <div className="clock-container bottom">
              <div className="clock"></div>
            </div>
            <div className="resign-container">
              <div className="resign">
                <img src={flagIcon} alt="Flag" />
                <span>Resign</span>
              </div>
            </div>
            <div className="bot-moves-container">
              <Moves
                moves={moves}
                moveIndex={moveIndex}
                setMoveIndex={setMoveIndex}
              />
            </div>
          </>
        )}

        {gameState === "creating" && (
          <div className="choose-bot-container">
            <ChooseBot />
          </div>
        )}
      </div>
    </div>
  );
}
