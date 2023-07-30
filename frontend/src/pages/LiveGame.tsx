import { useEffect, useState } from "react";
import Board from "../components/Board";
import Chat from "../components/Chat";
import Clock from "../components/Clock";
import LiveMoves from "../components/LiveMoves";
import Navbar from "../components/Navbar";
import "../styles/LiveGame.scss";
import flagIcon from "../assets/flag-solid.svg";
import handshakeIcon from "../assets/handshake-simple-solid.svg";
import { socket } from "../config/socket";

type TGameState =
  | "loading"
  | "creating"
  | "playing"
  | "waitingSender"
  | "waitingReceiver";

export default function LiveGame() {
  const [gameState, setGameState] = useState<TGameState>("waitingSender");

  useEffect(() => {
    socket.emit("joinLive");

    return () => {
      socket.emit("leaveLive");
    };
  }, []);

  return (
    <div className="game">
      <Navbar />
      <div className="game__container">
        {gameState === "playing" && (
          <div className="clock-container top">
            <Clock player="top" time={363} />
          </div>
        )}

        <Board />
        {gameState === "playing" && (
          <>
            <div className="clock-container bottom">
              <Clock player="bottom" time={532} />
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
            <div className="create-game">
              <h2>Create a game</h2>
              <h3>Time Controls</h3>
              <div className="time-controls">
                <div className="time-controls__input">
                  <input
                    type="text"
                    className="time-controls__minutes"
                    name="minutes"
                    inputMode="numeric"
                    placeholder="00"
                  />
                  <label htmlFor="minutes">Minutes</label>
                </div>
                <div className="time-controls__input">
                  <input
                    type="text"
                    className="time-controls__increment"
                    name="increment"
                    inputMode="numeric"
                    placeholder="00"
                  />
                  <label htmlFor="increment">Increment</label>
                </div>
              </div>
              <h3>Opponent</h3>
              <div className="choose-opponent">
                <div className="opponent-choice">
                  <input
                    type="radio"
                    name="opponent"
                    value="Username1"
                    id="Username1"
                  />
                  <label htmlFor="Username1">Username1</label>
                </div>
                <div className="opponent-choice">
                  <input
                    type="radio"
                    name="opponent"
                    value="Username2"
                    id="Username2"
                  />
                  <label htmlFor="Username2">Username2</label>
                </div>
                <div className="opponent-choice">
                  <input
                    type="radio"
                    name="opponent"
                    value="Username3"
                    id="Username3"
                  />
                  <label htmlFor="Username3">Username3</label>
                </div>
                <div className="opponent-choice">
                  <input
                    type="radio"
                    name="opponent"
                    value="Username4"
                    id="Username4"
                  />
                  <label htmlFor="Username4">Username4</label>
                </div>
              </div>
              <button>Create Game</button>
            </div>
          </div>
        )}
        {(gameState === "waitingReceiver" || gameState === "waitingSender") && (
          <div className="waiting-container">
            <div className="waiting">
              <h2>
                Waiting for <b>Username</b>...
              </h2>
              <button>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
