import Navbar from "../components/Navbar";
import playBot from "../assets/play-bot-button-01.svg";
import playFriend from "../assets/play-friend-button-01.svg";
import "../styles/Play.scss";
import { Link } from "react-router-dom";

export default function Play() {
  return (
    <div className="play-home">
      <Navbar />
      <div className="play-home__main">
        <Link to="/play/live" className="play-friend">
          <img src={playFriend} alt="Play friend" />
        </Link>
        <Link to="/play/bot" className="play-bot">
          <img src={playBot} alt="Play bot" />
        </Link>
      </div>
    </div>
  );
}
