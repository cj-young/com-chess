import {
  createContext,
  useContext,
  useState,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import applyMoves from "../utils/applyMoves";
import generateStartingPosition from "../utils/generateStartingPosition";
import Piece from "../utils/Piece";
import { socket } from "../config/socket";
import generateLegalMoves from "../utils/moveFunctions/generateLegalMoves";
import { Move } from "../types";

type Props = {
  children: React.ReactNode;
};

type GameInfo = {
  blackUsername: string;
  whiteUsername: string;
  minutes: number;
  increment: number;
  blackTime: number;
  whiteTime: number;
};

type TGameState = "loading" | "creating" | "playing" | "waiting";

type TLiveGameContext = {
  gameState: TGameState;
  setGameState: React.Dispatch<React.SetStateAction<TGameState>>;
  moves: Move[];
  setMoves: React.Dispatch<React.SetStateAction<Move[]>>;
  pieces: Piece[];
  makeMove: (move: Move) => void;
  gameInfo: GameInfo;
  setGameInfo: React.Dispatch<React.SetStateAction<GameInfo>>;
  color: "white" | "black";
  setColor: React.Dispatch<React.SetStateAction<"white" | "black">>;
  orientation: "white" | "black";
  setOrientation: React.Dispatch<React.SetStateAction<"white" | "black">>;
  whiteTime: number;
  setWhiteTime: React.Dispatch<React.SetStateAction<number>>;
  blackTime: number;
  setBlackTime: React.Dispatch<React.SetStateAction<number>>;
  selectedPiece: Piece | null;
  setSelectedPiece: React.Dispatch<React.SetStateAction<Piece | null>>;
  legalMoves: string[];
  turn: "white" | "black";
  moveIndex: number;
  setMoveIndex: React.Dispatch<React.SetStateAction<number>>;
  moveStartTime: React.MutableRefObject<number>;
  resetLiveGameContext: () => void;
  justMoved: boolean;
  setJustMoved: React.Dispatch<React.SetStateAction<boolean>>;
  gameOver: boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  maxWhiteTime: number;
  setMaxWhiteTime: React.Dispatch<React.SetStateAction<number>>;
  maxBlackTime: number;
  setMaxBlackTime: React.Dispatch<React.SetStateAction<number>>;
};

const LiveGameContext = createContext<TLiveGameContext>({} as TLiveGameContext);

export function LiveGameContextProvider({ children }: Props) {
  const [gameState, setGameState] = useState<TGameState>("loading");
  const [moves, setMoves] = useState<Move[]>([]);
  const [moveIndex, setMoveIndex] = useState(-1);
  useLayoutEffect(() => {
    setMoveIndex(moves.length - 1);
  }, [moves]);
  const pieces = useMemo(() => {
    return applyMoves(
      generateStartingPosition(),
      moves.slice(0, moveIndex + 1)
    );
  }, [moves, moveIndex]);

  const [gameInfo, setGameInfo] = useState<GameInfo>({
    blackUsername: "",
    whiteUsername: "",
    minutes: 0,
    increment: 0,
    blackTime: 0,
    whiteTime: 0,
  });
  const [color, setColor] = useState<"white" | "black">("white");
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [justMoved, setJustMoved] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [maxWhiteTime, setMaxWhiteTime] = useState(0);
  const [maxBlackTime, setMaxBlackTime] = useState(0);

  useLayoutEffect(() => {
    if (whiteTime > maxWhiteTime) {
      setMaxWhiteTime(whiteTime);
    }
  }, [whiteTime]);
  useLayoutEffect(() => {
    if (blackTime > maxBlackTime) {
      setMaxBlackTime(blackTime);
    }
  }, [blackTime]);

  const moveStartTime = useRef<number>(0);

  const legalMoves = useMemo(() => {
    if (selectedPiece) {
      return generateLegalMoves(pieces, selectedPiece, moves);
    } else {
      return [];
    }
  }, [selectedPiece]);

  const turn = useMemo(() => {
    return moves.length % 2 === 0 ? "white" : "black";
  }, [moves]);

  function makeMove(move: Move) {
    setMoves((prevMoves) => [...prevMoves, move]);
    if (color === "white") {
      setWhiteTime(
        (prevWhiteTime) => prevWhiteTime + gameInfo.increment * 1000
      );
    } else {
      setBlackTime(
        (prevBlackTime) => prevBlackTime + gameInfo.increment * 1000
      );
    }
    const timeSpent = Date.now() - moveStartTime.current;
    socket.emit("move", { move, timeSpent });
    setJustMoved(true);
  }

  function resetLiveGameContext() {
    setMoves([]);
    setGameState("loading");
    setMoveIndex(-1);
    setColor("white");
    setGameInfo({
      blackUsername: "",
      whiteUsername: "",
      minutes: 0,
      increment: 0,
      blackTime: 0,
      whiteTime: 0,
    });
    setOrientation("white");
    setWhiteTime(0);
    setBlackTime(0);
    setSelectedPiece(null);
    setJustMoved(false);
    setGameOver(false);
    setMaxBlackTime(0);
    setMaxWhiteTime(0);
    moveStartTime.current = 0;
  }

  return (
    <LiveGameContext.Provider
      value={{
        moves,
        setMoves,
        pieces,
        makeMove,
        gameInfo,
        setGameInfo,
        color,
        setColor,
        orientation,
        setOrientation,
        whiteTime,
        setWhiteTime,
        blackTime,
        setBlackTime,
        selectedPiece,
        setSelectedPiece,
        legalMoves,
        turn,
        gameState,
        setGameState,
        moveIndex,
        setMoveIndex,
        moveStartTime,
        resetLiveGameContext,
        justMoved,
        setJustMoved,
        gameOver,
        setGameOver,
        maxWhiteTime,
        maxBlackTime,
        setMaxWhiteTime,
        setMaxBlackTime,
      }}
    >
      {children}
    </LiveGameContext.Provider>
  );
}

export function useLiveGameContext() {
  return useContext(LiveGameContext);
}
