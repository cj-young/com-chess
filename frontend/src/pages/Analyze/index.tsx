import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import PastGames from "../../components/PastGames";
import Board from "../../components/board/Board";
import Moves from "../../components/games/Moves";
import PlayerInfo from "../../components/games/PlayerInfo";
import TopLines from "../../components/games/TopLines";
import { useAuthContext } from "../../contexts/AuthContext";
import useMoves from "../../hooks/useMoves";
import useStockfish from "../../hooks/useStockfish";
import { Color, PastGame } from "../../types";
import Piece from "../../utils/Piece";
import { getPastGame, getPastGameList } from "../../utils/analysis";
import Loading from "../Loading";
import "./styles.scss";

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
  const { topMoves, posEval } = useStockfish(modifiedMoves, moveIndex, pieces, {
    numTopMoves: NUM_TOP_MOVES
  });
  const [orientation, setOrientation] = useState<Color>("white");
  const [pastGames, setPastGames] = useState<PastGame[]>([]);
  const [names, setNames] = useState<{ white: string; black: string } | null>(
    null
  );
  const color = useRef<null | Color>(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const { gameId } = useParams();
  const isPastGame = gameId !== undefined;

  const bestMoveArrow: { to: string; from: string } | null = useMemo(() => {
    if (topMoves.length === 0) return null;

    const move = topMoves[0].moves[0];
    return { from: move.from, to: move.to };
  }, [topMoves]);

  useLayoutEffect(() => {
    setAnalyzeKey(gameId || "");
  }, [gameId]);

  const canDragCB = useCallback(
    (piece: Piece) => {
      return turn === piece.color;
    },
    [turn]
  );

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
          {!isPastGame && <PastGames games={pastGames} />}
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
