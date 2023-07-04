import Navbar from "../components/Navbar";
import playImage from "../assets/play-button-01.svg";
import analyzeImage from "../assets/analyze-button-01.svg";
import "../styles/Home.scss";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      <Navbar />
      <div className="home__main">
        <Link to="/play">
          <button className="play" aria-label="play">
            <img src={playImage} alt="Play" />
          </button>
        </Link>
        <Link to="/analyze">
          <button className="analyze" aria-label="analyze">
            <img src={analyzeImage} alt="Analyze" />
          </button>
        </Link>
      </div>
    </div>
  );
}
