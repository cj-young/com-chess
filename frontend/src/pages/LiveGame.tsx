import { useEffect, useState, useRef } from "react";
import Board from "../components/Board";
import Chat from "../components/Chat";
import Clock from "../components/Clock";
import LiveMoves from "../components/LiveMoves";
import Navbar from "../components/Navbar";
import "../styles/LiveGame.scss";
import flagIcon from "../assets/flag-solid.svg";
import handshakeIcon from "../assets/handshake-simple-solid.svg";
import { socket } from "../config/socket";
import CreateGame from "../components/CreateGame";
import Loading from "./Loading";
import { useLiveGameContext } from "../contexts/LiveGameContext";

export default function LiveGame() {
  const [waitingUsername, setWaitingUsername] = useState("");

  const {
    setMoves,
    setColor,
    setGameInfo,
    setOrientation,
    setBlackTime,
    setWhiteTime,
    gameState,
    setGameState,
    moveStartTime,
    setJustMoved,
    turn,
    justMoved,
    whiteTime,
    blackTime
  } = useLiveGameContext();

  const turnRef = useRef<string>("white");
  const justMovedRef = useRef<boolean>(false);

  turnRef.current = turn;
  justMovedRef.current = justMoved;

  function cancelGame() {
    socket.emit("gameCancel");
  }

  useEffect(() => {
    socket.emit("joinLive");

    socket.on("liveWaiting", (username) => {
      setGameState("waiting");
      setWaitingUsername(username);
    });

    socket.on("liveCreating", () => {
      setGameState("creating");
    });

    socket.on("startGame", (game) => {
      setMoves(game.moves);
      setColor(game.yourColor);
      setGameInfo(game.info);
      setGameState("playing");
      setOrientation(game.yourColor);
      setWhiteTime(game.info.whiteTime);
      setBlackTime(game.info.blackTime);
      moveStartTime.current = Date.now();

      const turn = game.moves.length % 2 === 0 ? "white" : "black";
      console.log(game);
      const timeElapsedSinceMove = Date.now() - game.lastMoveTime;
      if (turn === "white")
        setWhiteTime((prevWhiteTime) => prevWhiteTime - timeElapsedSinceMove);
      if (turn === "black")
        setBlackTime((prevBlackTime) => prevBlackTime - timeElapsedSinceMove);
    });

    socket.on("gameDeclined", () => {
      setGameState("creating");
    });

    socket.on("move", ({ moves, whiteTime, blackTime }) => {
      moveStartTime.current = Date.now();
      setWhiteTime(whiteTime);
      setBlackTime(blackTime);
      setMoves(moves);
      setJustMoved(false);
    });

    return () => {
      socket.emit("leaveLive");
      socket.off("liveWaiting");
      socket.off("liveCreating");
      socket.off("startGame");
      socket.off("move");
    };
  }, []);

  useEffect(() => {
    const startTime = turn === "white" ? whiteTime : blackTime;

    const timerInterval = setInterval(() => {
      if (turn === "white" && !justMovedRef.current) {
        setWhiteTime(startTime - (Date.now() - moveStartTime.current));
      } else if (turn === "black" && !justMovedRef.current) {
        setBlackTime(startTime - (Date.now() - moveStartTime.current));
      }
    }, 250);

    return () => {
      clearInterval(timerInterval);
    };
  }, [turn]);

  return gameState === "loading" ? (
    <Loading />
  ) : (
    <div className="game">
      <Navbar />
      <div className="game__container">
        {gameState === "playing" && (
          <div className="clock-container top">
            <Clock player="top" />
          </div>
        )}

        <Board />
        {gameState === "playing" && (
          <>
            <div className="clock-container bottom">
              <Clock player="bottom" />
            </div>
            <div className="draw-resign-container">
              <div className="draw-resign">
                <button>
                  <img src={flagIcon} alt="Resign" />
                </button>
                <button>
                  <img src={handshakeIcon} alt="Draw" />
                </button>
              </div>
            </div>
            <div className="live-moves-container">
              <LiveMoves />
            </div>
            <div className="chat-container">
              <Chat />
            </div>
          </>
        )}

        {gameState === "creating" && (
          <div className="create-game-container">
            <CreateGame />{" "}
          </div>
        )}
        {gameState === "waiting" && (
          <div className="waiting-container">
            <div className="waiting">
              <h2>
                Waiting for <b>{waitingUsername}</b>...
              </h2>
              <button onClick={cancelGame}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
