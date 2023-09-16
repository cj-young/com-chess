import { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import Piece from "../utils/Piece";
import Navbar from "../components/Navbar";
import PlayerInfo from "../components/PlayerInfo";
import applyMoves from "../utils/applyMoves";
import generateStartingPosition from "../utils/generateStartingPosition";
import Board from "../components/Board";
import Moves from "../components/Moves";
import generateLegalMoves from "../utils/moveFunctions/generateLegalMoves";
import "../styles/Analyze.scss";
import Loading from "./Loading";

type Move = {
  from: string;
  to: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

type PastGame =
  | {
      type: "live";
      opponent: string;
      minutes: number;
      increment: number;
      whiteUsername: string;
      blackUsername: string;
      color: string;
      readonly _id: string;
      winner: string;
    }
  | {
      type: "bot";
      difficulty: string;
      color: string;
      readonly _id: string;
      winner: string;
    };

type Sideline = {
  startsAt: number;
  moves: Move[];
};

export default function Analyze() {
  const [isLoading, setIsLoading] = useState(true);
  const [moves, setMoves] = useState<Move[]>([]);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [pastGames, setPastGames] = useState<PastGame[]>([]);
  const [sidelines, setSidelines] = useState<{ [key: number]: Sideline[] }>({});
  const [currentSideline, setCurrentSideline] = useState<
    [number, number] | null
  >(null);

  const { gameId } = useParams();

  const navigate = useNavigate();

  const isPastGame = gameId !== undefined;

  const modifiedMoves = useMemo(() => {
    if (!currentSideline) return moves;
    const currentSidelineArr =
      sidelines[currentSideline[0]][currentSideline[1]];
    return [
      ...moves.slice(0, currentSidelineArr.startsAt),
      ...currentSidelineArr.moves,
    ];
  }, [moves, sidelines, currentSideline]);

  const pieces = useMemo(() => {
    return applyMoves(
      generateStartingPosition(),
      modifiedMoves.slice(0, moveIndex + 1)
    );
  }, [moves, moveIndex]);

  const turn = useMemo(() => {
    return moveIndex % 2 === 0 ? "black" : "white";
  }, [moveIndex]);

  const { user } = useAuthContext();

  const canDragCB = useCallback(
    (piece: Piece) => {
      return turn === piece.color;
    },
    [turn]
  );

  function makeMove(move: Move) {
    if (currentSideline) {
      setSidelines((prevSidelines) => {
        const prevPieces = applyMoves(
          generateStartingPosition(),
          modifiedMoves.slice(0, moveIndex + 1)
        );

        // Verify legality
        const movedPiece = pieces.filter(
          (p) => p.square === move.from && p.active
        )[0];
        console.log("log 1");
        if (!movedPiece) return prevSidelines;
        const verifiedLegalMoves = generateLegalMoves(
          prevPieces,
          movedPiece,
          modifiedMoves.slice(0, moveIndex + 1)
        );

        let moveFound;
        for (let legalMove of verifiedLegalMoves) {
          if (legalMove === move.to) {
            moveFound = true;
          }
        }
        console.log("log 2");
        if (!moveFound) return prevSidelines;

        const movesIn =
          moveIndex -
          prevSidelines[currentSideline[0]][currentSideline[1]].startsAt;

        const updatedSideline = {
          startsAt: currentSideline[0],
          moves: [
            ...prevSidelines[currentSideline[0]][
              currentSideline[1]
            ].moves.slice(0, movesIn + 1),
            move,
          ],
        };

        setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);

        console.log("log 3");
        return {
          ...prevSidelines,
          [currentSideline[0]]: [
            ...prevSidelines[currentSideline[0]].slice(0, currentSideline[1]),
            updatedSideline,
            ...prevSidelines[currentSideline[0]].slice(currentSideline[1] + 1),
          ],
        };
      });
    } else {
      if (moveIndex === moves.length - 1) {
        setMoves((prevMoves) => {
          const prevPieces = applyMoves(generateStartingPosition(), prevMoves);

          // Verify legality
          const movedPiece = pieces.filter(
            (p) => p.square === move.from && p.active
          )[0];
          if (!movedPiece) return prevMoves;
          const verifiedLegalMoves = generateLegalMoves(
            prevPieces,
            movedPiece,
            modifiedMoves
          );

          let moveFound;
          for (let legalMove of verifiedLegalMoves) {
            if (legalMove === move.to) {
              moveFound = true;
            }
          }
          if (!moveFound) return prevMoves;
          setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);

          return [...prevMoves, move];
        });
      } else {
        setSidelines((prevSidelines) => {
          if (
            move.to === modifiedMoves[moveIndex + 1].to &&
            move.from === modifiedMoves[moveIndex + 1].from &&
            move.promoteTo === modifiedMoves[moveIndex + 1].promoteTo
          ) {
            // Keep current line if move is the same as next current line move
            setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
            return prevSidelines;
          }

          // Go to sideline if already exists
          if (sidelines[moveIndex + 1]) {
            for (let i = 0; i < sidelines[moveIndex + 1].length; i++) {
              const sideline = sidelines[moveIndex + 1][i];
              if (
                move.to === sideline.moves[0].to &&
                move.from === sideline.moves[0].from &&
                move.promoteTo === sideline.moves[0].promoteTo
              ) {
                setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
                setCurrentSideline([moveIndex + 1, i]);
                return prevSidelines;
              }
            }
          }

          const prevPieces = applyMoves(
            generateStartingPosition(),
            modifiedMoves.slice(0, moveIndex + 1)
          );

          // Verify legality
          const movedPiece = pieces.filter(
            (p) => p.square === move.from && p.active
          )[0];
          if (!movedPiece) return prevSidelines;
          const verifiedLegalMoves = generateLegalMoves(
            prevPieces,
            movedPiece,
            modifiedMoves.slice(0, moveIndex + 1)
          );

          let moveFound;
          for (let legalMove of verifiedLegalMoves) {
            if (legalMove === move.to) {
              moveFound = true;
            }
          }
          if (!moveFound) return prevSidelines;

          const updatedSideline = {
            startsAt: moveIndex + 1,
            moves: [move],
          };

          setCurrentSideline([
            moveIndex + 1,
            prevSidelines[moveIndex + 1]
              ? prevSidelines[moveIndex + 1].length
              : 0,
          ]);

          setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);

          return {
            ...prevSidelines,
            [moveIndex + 1]: [
              ...(prevSidelines[moveIndex + 1]
                ? prevSidelines[moveIndex + 1]
                : []),
              updatedSideline,
            ],
          };
        });
      }
    }
  }

  useEffect(() => {
    (async () => {
      try {
        if (isPastGame) {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/games/${gameId}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            return navigate("/analyze");
          }

          const data = await response.json();
          setIsLoading(false);
          setMoves(data.moves);
          setMoveIndex(data.moves.length - 1);
          console.log(data);
        } else {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/games/list`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          setPastGames(data.games);
          setIsLoading(false);
          console.log(data);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="analyze">
      <Navbar />
      <div className={`analyze__container ${isPastGame ? "" : "show-games"}`}>
        <div className="eval-container">
          <div className="eval"></div>
        </div>
        <div className="player-info-container top">
          <PlayerInfo
            pieces={pieces}
            username={
              isPastGame
                ? "Temp Top"
                : orientation === "white"
                ? "Black"
                : "White"
            }
            orientation={orientation}
            color={orientation === "white" ? "black" : "white"}
          />
        </div>

        <Board
          pieces={pieces}
          moves={modifiedMoves}
          orientation={orientation}
          setOrientation={setOrientation}
          prevMove={() => {
            if (moveIndex >= 0) {
              if (
                currentSideline &&
                sidelines[currentSideline[0]][currentSideline[1]].startsAt >=
                  moveIndex
              ) {
                setCurrentSideline(null);
              }
              setMoveIndex((prevMoveIndex) => prevMoveIndex - 1);
            }
          }}
          nextMove={() => {
            if (moveIndex < modifiedMoves.length - 1) {
              setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
            }
          }}
          moveIndex={moveIndex}
          showControls={true}
          showPieces={true}
          makeMove={makeMove}
          modal={null}
          canDragCB={canDragCB}
        />
        <>
          <div className="player-info-container bottom">
            <PlayerInfo
              pieces={pieces}
              username={
                isPastGame
                  ? "Temp Bottom"
                  : orientation === "white"
                  ? "White"
                  : "Black"
              }
              orientation={orientation}
              color={orientation === "white" ? "white" : "black"}
            />
          </div>
          {!isPastGame && (
            <div className="past-games-container">
              <div className="past-games">
                {pastGames.length > 0 ? (
                  <ul className="past-games-list">
                    {pastGames.map((game, i) => (
                      <li className="past-game" key={i}>
                        <Link
                          to={`/analyze/${game.type === "bot" ? "1" : "0"}${
                            game._id
                          }`}
                        >
                          <span className="name">
                            {game.type === "bot"
                              ? game.difficulty[0].toUpperCase() +
                                game.difficulty.slice(1) +
                                " Bot"
                              : game.color === "white"
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
          )}
          <div className="analyze-moves-container">
            <Moves
              moves={moves}
              moveIndex={moveIndex}
              setMoveIndex={setMoveIndex}
              sidelines={sidelines}
              currentSideline={currentSideline}
              setCurrentSideline={setCurrentSideline}
            />
          </div>
        </>
      </div>
    </div>
  );
}
