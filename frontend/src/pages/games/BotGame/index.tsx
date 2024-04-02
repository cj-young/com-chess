import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import flagIcon from "../../../assets/flag-solid.svg";
import Navbar from "../../../components/Navbar";
import Board from "../../../components/board/Board";
import ChooseBot from "../../../components/games/ChooseBot";
import GameOver from "../../../components/games/GameOver";
import Moves from "../../../components/games/Moves";
import PlayerInfo from "../../../components/games/PlayerInfo";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useBotGameContext } from "../../../contexts/BotGameContext";
import Piece from "../../../utils/Piece";
import canMove from "../../../utils/canMove";
import { isLocalStorageGameValid } from "../../../utils/gameValidators";
import isInCheck from "../../../utils/isInCheck";
import isInsufficientMaterial from "../../../utils/isInsufficientMaterial";
import movesToFEN from "../../../utils/movesToFEN";
import { findBestMove, stockfishLevels } from "../../../utils/stockfish";
import "./styles.scss";

export default function BotGame() {
  const [gameOverModal, setGameOverModal] = useState<React.ReactNode>(null);
  const gameOverRef = useRef<boolean>(false);

  const sfRef = useRef<Worker>();
  const sfReady = useRef(false);

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
    resetBotGameContext,
    setColor,
    setMoves,
    setDifficulty,
    setGameState,
    setSelectedPiece,
    setGameOver,
    difficulty
  } = useBotGameContext();

  const { user } = useAuthContext();

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

  useEffect(() => {
    if (turn !== color) {
      if (sfRef.current) {
        findBestMove(
          moves,
          sfRef.current,
          stockfishLevels.get(difficulty) as number
        ).then((newMove) => {
          makeMove(newMove);
        });
      }
    }
  }, [moves]);

  async function endGame(
    type:
      | "checkmate"
      | "resignation"
      | "stalemate"
      | "repetition"
      | "fiftyMove"
      | "insufficientMaterial",
    winStatus: "won" | "lost" | "drawn"
  ) {
    try {
      if (gameOver) return;
      setGameOver(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/botGameEnd`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ moves, color, difficulty, result: winStatus })
        }
      );
      const data = await response.json();
      setGameOverModal(
        <GameOver
          type={type}
          gameId={data.gameId}
          winStatus={winStatus}
          close={() => setGameOverModal(null)}
          newGame={() => {
            resetBotGameContext();
            setGameState("creating");
          }}
        />
      );
      localStorage.removeItem("botGame");
    } catch (error) {
      console.error(error);
    }
  }

  function resign() {
    endGame("resignation", "lost");
  }

  useLayoutEffect(() => {
    const currentGame = localStorage.getItem("botGame") ?? "{}";
    const data = JSON.parse(currentGame);
    if (currentGame && isLocalStorageGameValid(data)) {
      setColor(data.color);
      setDifficulty(data.difficulty);
      setMoves(data.moves);
      setMoveIndex(data.moves.length - 1);
      setGameState("playing");
      setSelectedPiece(null);
      setGameOver(false);
      setOrientation(data.color);
    } else {
      resetBotGameContext();
    }
  }, []);

  useEffect(() => {
    const stockfish = new Worker("/stockfishtest/stockfish.js");

    const messageCB = (e: MessageEvent) => {
      const response = e.data;
      if (response === "readyok") {
        console.log("stockfish ready");
        sfReady.current = true;
      }
    };

    stockfish.addEventListener("message", messageCB);

    stockfish.postMessage("uci");
    stockfish.postMessage("isready");

    sfRef.current = stockfish;

    return () => {
      stockfish.removeEventListener("message", messageCB);
      stockfish.postMessage("quit");
    };
  }, []);

  useEffect(() => {
    if (!canMove(pieces, moves)) {
      // Check for checkmate and stalemate
      if (isInCheck(pieces, turn === "white" ? "white" : "black")) {
        const winStatus = turn === color ? "lost" : "won";
        endGame("checkmate", winStatus);
      } else {
        endGame("stalemate", "drawn");
      }
    } else {
      // Check for repetition
      const currentFEN = movesToFEN(moves).split(" ").slice(0, -2).join(" ");
      let count = 0;

      for (let i = 0; i < moves.length + 1; i++) {
        const fenPosition = movesToFEN(moves.slice(0, i));
        if (fenPosition.split(" ").slice(0, -2).join(" ") === currentFEN)
          count++;
      }

      if (count >= 3) {
        endGame("repetition", "drawn");
      } else if (+movesToFEN(moves).split(" ")[4] >= 100) {
        endGame("fiftyMove", "drawn");
      } else if (
        isInsufficientMaterial(moves, "white") &&
        isInsufficientMaterial(moves, "black")
      ) {
        endGame("insufficientMaterial", "drawn");
      }
    }
  }, [moves, pieces]);

  return (
    <div className="bot-game">
      <Navbar />
      <div className="bot-game__container">
        {gameState === "playing" && (
          <div className="player-info-container top">
            <PlayerInfo
              pieces={pieces}
              username={
                color === orientation
                  ? `${difficulty[0].toUpperCase() + difficulty.slice(1)} Bot`
                  : user?.username || ""
              }
              orientation={orientation}
              color={orientation === "white" ? "black" : "white"}
              isLink={color !== orientation}
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
                  username={
                    color !== orientation
                      ? `${
                          difficulty[0].toUpperCase() + difficulty.slice(1)
                        } Bot`
                      : user?.username || ""
                  }
                  orientation={orientation}
                  color={orientation === "black" ? "black" : "white"}
                  isLink={color === orientation}
                />
              </div>
            )}
            <div className="resign-container">
              <button className="resign" onClick={resign}>
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
