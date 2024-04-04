import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Board from "../../components/board/Board";
import Moves from "../../components/games/Moves";
import PlayerInfo from "../../components/games/PlayerInfo";
import TopLines from "../../components/games/TopLines";
import { useAuthContext } from "../../contexts/AuthContext";
import useMoves from "../../hooks/useMoves";
import { Color, Line, Move } from "../../types";
import Piece from "../../utils/Piece";
import { getPastGame, getPastGameList } from "../../utils/analysis";
import canMove from "../../utils/canMove";
import getEval from "../../utils/getEval";
import isInCheck from "../../utils/isInCheck";
import moveToUCI from "../../utils/moveToUCI";
import uciToMove from "../../utils/uciToMove";
import Loading from "../Loading";
import "./styles.scss";

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

type Props = {
  setAnalyzeKey: React.Dispatch<React.SetStateAction<string>>;
};

const NUM_TOP_MOVES = 3;

export default function Analyze({ setAnalyzeKey }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const {
    moves,
    moveIndex,
    sidelines,
    currentSideline,
    modifiedMoves,
    turn,
    pieces,
    nextMove,
    prevMove,
    setMoveIndex,
    setCurrentSideline,
    makeMove,
    setMoves
  } = useMoves({
    allowSidelines: true
  });
  const [orientation, setOrientation] = useState<Color>("white");
  const [pastGames, setPastGames] = useState<PastGame[]>([]);
  const [topMoves, setTopMoves] = useState<Line[]>([]);
  // Buffer required to ensure all top moves are received before display
  const [bufferMoves, setBufferMoves] = useState<Line[]>([]);
  const isNewMoves = useRef(false);
  const [sfReady, setSfReady] = useState(false);
  const [didMate, setDidMate] = useState<string | null>(null);
  const [posEval, setPosEval] = useState<{ adv: string; isWinning: string }>({
    adv: "+0.00",
    isWinning: "white"
  });
  const [names, setNames] = useState<{ white: string; black: string } | null>(
    null
  );

  const bufferMovesRef = useRef<Line[]>();
  bufferMovesRef.current = bufferMoves;

  const color = useRef<null | Color>(null);

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
          ...prevBufferMoves.slice(lineRank + 1)
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
      type: parts[8] === "mate" ? "mate" : "cp"
    };
  }

  useEffect(() => {
    (async () => {
      try {
        if (isPastGame) {
          const pastGame = await getPastGame(gameId);
          if (!pastGame) {
            return navigate("/analyze");
          }
          setIsLoading(false);
          setMoves(pastGame.moves);
          setMoveIndex(pastGame.moves.length - 1);
          if (pastGame.type === "live") {
            setNames({
              white: pastGame.whitePlayer,
              black: pastGame.blackPlayer
            });
            if (user?.username === pastGame.blackPlayer)
              setOrientation("black");
          } else {
            const botName =
              pastGame.difficulty[0].toUpperCase() +
              pastGame.difficulty.slice(1) +
              " Bot";
            setNames({
              white: pastGame.color === "white" ? pastGame.user : botName,
              black: pastGame.color === "black" ? pastGame.user : botName
            });
            setOrientation(pastGame.color);
            color.current = pastGame.color;
          }
        } else {
          const pastGames = await getPastGameList();
          if (pastGames) setPastGames(pastGames.games);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

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
                  }%`
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
                      : "var(--clr-neutral-100)"
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
