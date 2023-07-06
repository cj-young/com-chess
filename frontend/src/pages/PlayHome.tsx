import Navbar from "../components/Navbar";
import playBot from "../assets/play-bot-button-01.svg";
import playFriend from "../assets/play-friend-button-01.svg";
import "../styles/PlayHome.scss";

export default function PlayHome() {
  return (
    <div className="play-home">
      <Navbar />
      <div className="play-home__main">
        <button className="play-friend">
          <img src={playFriend} alt="Play friend" />
        </button>
        <button className="play-bot">
          <img src={playBot} alt="Play bot" />
        </button>
      </div>
    </div>
  );
}
