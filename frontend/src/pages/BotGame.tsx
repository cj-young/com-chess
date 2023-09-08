import { useCallback, useRef, useState } from "react";
import Piece from "../utils/Piece";
import Navbar from "../components/Navbar";
import Board from "../components/Board";
import { useBotGameContext } from "../contexts/BotGameContext";
import flagIcon from "../assets/flag-solid.svg";
import "../styles/BotGame.scss";
import ChooseBot from "../components/ChooseBot";
import Moves from "../components/Moves";
import PlayerInfo from "../components/PlayerInfo";

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
          <div className="player-info-container top">
            <PlayerInfo
              pieces={pieces}
              username="Testerasfdas"
              orientation="white"
              color="white"
            />
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
            {gameState === "playing" && (
              <div className="player-info-container bottom">
                <PlayerInfo
                  pieces={pieces}
                  username="second"
                  orientation="white"
                  color="black"
                />
              </div>
            )}
            <div className="resign-container">
              <button className="resign">
                <img src={flagIcon} alt="Flag" />
                <span>Resign</span>
              </button>
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
