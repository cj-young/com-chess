import { useState } from "react";
import Board from "../components/Board";
import Chat from "../components/Chat";
import Clock from "../components/Clock";
import LiveMoves from "../components/LiveMoves";
import Navbar from "../components/Navbar";
import "../styles/LiveGame.scss";
import flagIcon from "../assets/flag-solid.svg";
import handshakeIcon from "../assets/handshake-simple-solid.svg";

type TGameState =
  | "loading"
  | "creating"
  | "playing"
  | "waitingSender"
  | "waitingReceiver";

export default function LiveGame() {
  const [gameState, setGameState] = useState<TGameState>("loading");

  return (
    <div className="game">
      <Navbar />
      <div className="game__container">
        <div className="top-blank"></div>
        <div className="clock-container top">
          <Clock player="top" time={363} />
        </div>
        <Board />
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
      </div>
    </div>
  );
}
