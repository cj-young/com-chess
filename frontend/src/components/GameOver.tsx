import { Link } from "react-router-dom";
import { useRef } from "react";
import "../styles/GameOver.scss";
import exitIcon from "../assets/xmark-solid-light.svg";
import { useLiveGameContext } from "../contexts/LiveGameContext";

type Props =
  | {
      type: "checkmate" | "resignation" | "timeout";
      gameId: string;
      winStatus: "won" | "lost";
      close: () => void;
    }
  | {
      type: "draw" | "stalemate" | "repetition" | "fiftyMove";
      gameId: string;
      winStatus: "drawn";
      close: () => void;
    };

export default function GameOver({ type, gameId, winStatus, close }: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { setGameState, setMoves } = useLiveGameContext();

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === modalRef.current) {
      close();
    }
  }

  let mainMessage;
  switch (type) {
    case "checkmate":
      mainMessage = "Checkmate";
      break;
    case "draw":
      mainMessage = "Draw";
      break;
    case "resignation":
      mainMessage = "Game Over";
      break;
    case "stalemate":
      mainMessage = "Stalemate";
      break;
    case "timeout":
      mainMessage = "Game Over";
      break;
    case "repetition":
      mainMessage = "Draw";
      break;
    case "fiftyMove":
      mainMessage = "Draw";
      break;
  }

  let subMessage;
  switch (type) {
    case "checkmate":
      subMessage = `${
        winStatus === "won" ? "You win" : "Opponent wins"
      } by checkmate`;
      break;
    case "resignation":
      subMessage = `${
        winStatus === "won" ? "You win" : "Opponent wins"
      } by resignation`;
      break;
    case "timeout":
      subMessage = `${
        winStatus === "won" ? "You win" : "Opponent wins"
      } by timeout`;
      break;
    case "repetition":
      subMessage = "Game drawn by repetition";
      break;
    case "fiftyMove":
      subMessage = "Game drawn by 50-move rule";
      break;
  }

  return (
    <div className="game-over" onClick={handleClick} ref={modalRef}>
      <div className="game-over-modal" data-status={winStatus}>
        <button className="exit-modal" onClick={close}>
          <img src={exitIcon} alt="Exit modal" />
        </button>
        <div className="game-over__text">
          <h2 className="main-message">{mainMessage}</h2>
          {subMessage && <p className="sub-message">{subMessage}</p>}
        </div>
        <div className="game-over__buttons">
          <Link to={"/analyze/live/" + gameId} className="analyze">
            Analyze
          </Link>
          <button
            className="new-game"
            onClick={() => {
              close();
              setGameState("creating");
              setMoves([]);
            }}
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
