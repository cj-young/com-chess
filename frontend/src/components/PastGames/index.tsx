import { Link } from "react-router-dom";
import { PastGame } from "../../types";

type Props = {
  games: PastGame[];
};

export default function PastGames({ games }: Props) {
  return (
    <div className="past-games-container">
      <div className="past-games">
        {games.length > 0 ? (
          <ul className="past-games-list">
            {games.map((game, i) => (
              <li className="past-game" key={i}>
                <Link
                  to={`/analyze/${game.type === "bot" ? "1" : "0"}${game._id}`}
                >
                  <span className="name">
                    {game.type === "bot"
                      ? game.difficulty[0].toUpperCase() +
                        game.difficulty.slice(1) +
                        " Bot"
                      : game.color === "black"
                      ? game.whiteUsername
                      : game.blackUsername}
                  </span>
                  <span
                    className={`${
                      game.winner === null
                        ? "draw"
                        : game.winner === game.color
                        ? "win"
                        : "loss"
                    }`}
                  >
                    {game.winner === null
                      ? "Draw"
                      : game.winner === game.color
                      ? "Win"
                      : "Loss"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-games">Past games will appear here</div>
        )}
      </div>
    </div>
  );
}
