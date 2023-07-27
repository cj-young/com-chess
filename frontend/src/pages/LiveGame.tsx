import { useState } from "react";
import Board from "../components/Board";
import Chat from "../components/Chat";
import Clock from "../components/Clock";
import LiveMoves from "../components/LiveMoves";
import Navbar from "../components/Navbar";
import "../styles/LiveGame.scss";

export default function LiveGame() {
  const [currentGame, setCurrentGame] = useState("");

  return (
    <div className="game">
      <Navbar />
      <div className="game__container">
        <Clock player="top" />
        <Board />
        <Clock player="bottom" />
        <LiveMoves />
        <Chat />
      </div>
    </div>
  );
}
