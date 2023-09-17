import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
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
import TopLines from "../components/TopLines";
import uciToMove from "../utils/uciToMove";
import moveToUCI from "../utils/moveToUCI";
import getEval from "../utils/getEval";
import canMove from "../utils/canMove";
import isInCheck from "../utils/isInCheck";

type Move = {
  from: string;
  to: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

type Line = {
  eval: number;
  moves: Move[];
  leadingMoves: Move[];
  type: "mate" | "cp";
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

type Props = {
  setAnalyzeKey: React.Dispatch<React.SetStateAction<string>>;
};

const NUM_TOP_MOVES = 3;

export default function Analyze({ setAnalyzeKey }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [moves, setMoves] = useState<Move[]>([]);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [pastGames, setPastGames] = useState<PastGame[]>([]);
  const [sidelines, setSidelines] = useState<{ [key: number]: Sideline[] }>({});
  const [currentSideline, setCurrentSideline] = useState<
    [number, number] | null
  >(null);
  const [topMoves, setTopMoves] = useState<Line[]>([]);
  // Buffer required to ensure all top moves are received before display
  const [bufferMoves, setBufferMoves] = useState<Line[]>([]);
  const isNewMoves = useRef(false);
  const [sfReady, setSfReady] = useState(false);
  const [didMate, setDidMate] = useState<string | null>(null);
  const [posEval, setPosEval] = useState<{ adv: string; isWinning: string }>({
    adv: "+0.00",
    isWinning: "white",
  });
  const [names, setNames] = useState<{ white: string; black: string } | null>(
    null
  );

  const bufferMovesRef = useRef<Line[]>();
  bufferMovesRef.current = bufferMoves;

  const color = useRef<null | "white" | "black">(null);

  const sfRef = useRef<Worker>();

  useEffect(() => {
    if (didMate) {
      setPosEval({ adv: "#", isWinning: didMate });
    } else if (topMoves.length > 0) {
      setPosEval(getEval(topMoves[0]));
    }
  }, [topMoves, didMate]);

  const bestMoveArrow: { to: string; from: string } | null = useMemo(() => {
    if (topMoves.length === 0) return null;

    const move = topMoves[0].moves[0];
    return { from: move.from, to: move.to };
  }, [topMoves]);

  const { gameId } = useParams();

  useLayoutEffect(() => {
    setAnalyzeKey(gameId || "");
  }, [gameId]);

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
  }, [modifiedMoves, moveIndex]);

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

  useEffect(() => {
    const stockfish = new Worker("/stockfishtest/stockfish.js");

    const messageCB = (e: MessageEvent) => {
      const response = e.data;
      if (response === "readyok") {
        console.log("stockfish ready");
        setSfReady(true);
      }
    };

    stockfish.addEventListener("message", messageCB);

    stockfish.postMessage("uci");
    stockfish.postMessage("isready");

    sfRef.current = stockfish;

    return () => {
      stockfish.removeEventListener("message", messageCB);
      stockfish.postMessage("quit");
    };
  }, []);

  useEffect(() => {
    if (!sfRef.current || !sfReady) return;

    if (!canMove(pieces, modifiedMoves)) {
      if (
        isInCheck(pieces, modifiedMoves.length % 2 === 0 ? "white" : "black")
      ) {
        setDidMate(modifiedMoves.length % 2 === 0 ? "black" : "white");
        setBufferMoves([]);
        setTopMoves([]);
        return;
      }
    }

    setTopMoves([]);
    setBufferMoves([]);
    setDidMate(null);

    const currentId = Date.now().toString();
    const stockfish = sfRef.current;
    stockfish.postMessage(
      `position startpos move ${modifiedMoves
        .slice(0, moveIndex + 1)
        .map(moveToUCI)
        .join(" ")} id ${currentId}`
    );
    stockfish.postMessage(`setoption name MultiPV value ${NUM_TOP_MOVES}`);
    stockfish.postMessage("go depth 18");
    isNewMoves.current = true;

    const messageCB = (e: MessageEvent) => {
      const response = e.data;
      if (response.startsWith("info")) {
        console.log(response);
        const depth = +response.split(" ")[2];
        if (isNewMoves.current) {
          if (depth !== 1) {
            return;
          } else isNewMoves.current = false;
        }
        if (depth < 4) return;
        const line = infoToLine(
          response,
          modifiedMoves.slice(0, moveIndex + 1)
        );
        const lineRank = +response.split(" ")[6] - 1;

        if (lineRank === 1 && bufferMovesRef.current) {
          setTopMoves([...bufferMovesRef.current]);
        }

        setBufferMoves((prevBufferMoves) => [
          ...prevBufferMoves.slice(0, lineRank),
          line,
          ...prevBufferMoves.slice(lineRank + 1),
        ]);
      }
    };

    stockfish.addEventListener("message", messageCB);

    return () => {
      stockfish.postMessage("stop");
      stockfish.removeEventListener("message", messageCB);
    };
  }, [modifiedMoves, sfRef.current, sfReady, moveIndex]);

  useLayoutEffect(() => {
    setTopMoves([]);
  }, [modifiedMoves]);

  function infoToLine(info: string, leadingMoves: Move[]): Line {
    const parts = info.split(" ");
    const firstMoveIndex = parts.indexOf("pv") + 1;
    const isWhiteTurn = leadingMoves.length % 2 === 0;
    return {
      eval: +parts[9] * (isWhiteTurn ? 1 : -1),
      moves: parts
        .slice(firstMoveIndex, Math.min(firstMoveIndex + 10, parts.length - 2))
        .map(uciToMove),
      leadingMoves,
      type: parts[8] === "mate" ? "mate" : "cp",
    };
  }

  function makeMove(move: Move) {
    if (
      moveIndex + 1 < modifiedMoves.length &&
      move.to === modifiedMoves[moveIndex + 1].to &&
      move.from === modifiedMoves[moveIndex + 1].from &&
      move.promoteTo === modifiedMoves[moveIndex + 1].promoteTo
    ) {
      // Keep current line if move is the same as next current line move
      setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
      return;
    }

    if (currentSideline) {
      // Verify legality
      const movedPiece = pieces.filter(
        (p) => p.square === move.from && p.active
      )[0];
      if (!movedPiece) return;
      const verifiedLegalMoves = generateLegalMoves(
        pieces,
        movedPiece,
        modifiedMoves.slice(0, moveIndex + 1)
      );

      let moveFound;
      for (let legalMove of verifiedLegalMoves) {
        if (legalMove === move.to) {
          moveFound = true;
        }
      }
      if (!moveFound) return;

      const movesIn =
        moveIndex - sidelines[currentSideline[0]][currentSideline[1]].startsAt;

      const updatedSideline = {
        startsAt: currentSideline[0],
        moves: [
          ...sidelines[currentSideline[0]][currentSideline[1]].moves.slice(
            0,
            movesIn + 1
          ),
          move,
        ],
      };

      setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);

      setSidelines((prevSidelines) => ({
        ...prevSidelines,
        [currentSideline[0]]: [
          ...prevSidelines[currentSideline[0]].slice(0, currentSideline[1]),
          updatedSideline,
          ...prevSidelines[currentSideline[0]].slice(currentSideline[1] + 1),
        ],
      }));
    } else {
      if (moveIndex === moves.length - 1) {
        const prevPieces = applyMoves(generateStartingPosition(), moves);

        // Verify legality
        const movedPiece = pieces.filter(
          (p) => p.square === move.from && p.active
        )[0];
        if (!movedPiece) return;
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
        if (!moveFound) return;
        setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);

        setMoves((prevMoves) => [...prevMoves, move]);
      } else {
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
              return;
            }
          }
        }

        // Verify legality
        const movedPiece = pieces.filter(
          (p) => p.square === move.from && p.active
        )[0];
        if (!movedPiece) return;
        const verifiedLegalMoves = generateLegalMoves(
          pieces,
          movedPiece,
          modifiedMoves.slice(0, moveIndex + 1)
        );

        let moveFound;
        for (let legalMove of verifiedLegalMoves) {
          if (legalMove === move.to) {
            moveFound = true;
          }
        }
        if (!moveFound) return;

        const updatedSideline = {
          startsAt: moveIndex + 1,
          moves: [move],
        };

        setCurrentSideline([
          moveIndex + 1,
          sidelines[moveIndex + 1] ? sidelines[moveIndex + 1].length : 0,
        ]);

        setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);

        setSidelines((prevSidelines) => ({
          ...prevSidelines,
          [moveIndex + 1]: [
            ...(prevSidelines[moveIndex + 1]
              ? prevSidelines[moveIndex + 1]
              : []),
            updatedSideline,
          ],
        }));
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
          if (data.type === "live") {
            setNames({ white: data.whitePlayer, black: data.blackPlayer });
            if (user?.username === data.blackPlayer) setOrientation("black");
          } else {
            const botName =
              data.difficulty[0].toUpperCase() +
              data.difficulty.slice(1) +
              " Bot";
            setNames({
              white: data.color === "white" ? data.user : botName,
              black: data.color === "black" ? data.user : botName,
            });
            setOrientation(data.color);
            color.current = data.color;
          }
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

  function nextMove() {
    if (moveIndex < modifiedMoves.length - 1) {
      setMoveIndex((prevMoveIndex) => prevMoveIndex + 1);
    }
  }

  function prevMove() {
    if (moveIndex >= 0) {
      if (
        currentSideline &&
        sidelines[currentSideline[0]][currentSideline[1]].startsAt >= moveIndex
      ) {
        setCurrentSideline(null);
      }
      setMoveIndex((prevMoveIndex) => prevMoveIndex - 1);
    }
  }

  const evalBarOffset = useMemo(() => {
    if (topMoves.length === 0 && posEval.adv[0] !== "#") return;
    return posEval.adv[0] === "M" || posEval.adv[0] === "#"
      ? posEval.isWinning === "white"
        ? -50
        : 50
      : -100 / (1 + Math.E ** -(+posEval.adv / 5)) + 50;
  }, [posEval]);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="analyze">
      <Navbar />
      <div className={`analyze__container ${isPastGame ? "" : "show-games"}`}>
        <div className="eval-container">
          <div className="eval" data-is-winning={posEval.isWinning}>
            <div
              className="white-bar"
              style={
                {
                  "--translate": `${orientation === "white" ? "-" : ""}${
                    (evalBarOffset || 0) + 50
                  }%`,
                } as React.CSSProperties
              }
            ></div>
            <div
              className="eval__number"
              style={
                {
                  "--start":
                    orientation === posEval.isWinning ? "0.5rem" : "unset",
                  "--end":
                    orientation === posEval.isWinning ? "unset" : "0.5rem",
                  color:
                    posEval.isWinning === "white"
                      ? "var(--clr-bg-200)"
                      : "var(--clr-neutral-100)",
                } as React.CSSProperties
              }
            >
              {posEval.adv[0] === "M" || posEval.adv[0] === "#"
                ? posEval.adv
                : Math.abs(+posEval.adv).toFixed(1)}
            </div>
          </div>
        </div>
        <div className="player-info-container top">
          <PlayerInfo
            pieces={pieces}
            username={
              isPastGame && names
                ? orientation === "white"
                  ? names.black
                  : names.white
                : orientation === "white"
                ? "Black"
                : "White"
            }
            isLink={
              isPastGame && (!color.current || color.current !== orientation)
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
          prevMove={prevMove}
          nextMove={nextMove}
          moveIndex={moveIndex}
          showControls={true}
          showPieces={true}
          makeMove={makeMove}
          modal={null}
          canDragCB={canDragCB}
          arrows={bestMoveArrow ? [bestMoveArrow] : undefined}
        />
        <>
          <div className="player-info-container bottom">
            <PlayerInfo
              pieces={pieces}
              username={
                isPastGame && names
                  ? names[orientation]
                  : orientation === "white"
                  ? "White"
                  : "Black"
              }
              orientation={orientation}
              color={orientation === "white" ? "white" : "black"}
              isLink={
                isPastGame && (!color.current || color.current === orientation)
              }
            />
          </div>
          <div className="top-lines-container">
            <TopLines
              lines={topMoves}
              moveIndex={moveIndex}
              moves={modifiedMoves}
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
