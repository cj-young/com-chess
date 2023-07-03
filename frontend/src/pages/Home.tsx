import Navbar from "../components/Navbar";
import { useAuthContext } from "../contexts/AuthContext";

export default function Home() {
  const { updateUsername } = useAuthContext();
  return (
    <>
      <Navbar />
      <div className="home">
        <button className="play" aria-label="play"></button>
        <button
          className="analyze"
          aria-label="analyze"
          onClick={() => {
            updateUsername("Thisuser");
          }}
        >
          ANALYZE
        </button>
      </div>
    </>
  );
}
