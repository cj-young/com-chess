import {
  createContext,
  useContext,
  useState,
  useMemo,
  useLayoutEffect,
} from "react";
import applyMoves from "../utils/applyMoves";
import generateStartingPosition from "../utils/generateStartingPosition";
import Piece from "../utils/Piece";
import generateLegalMoves from "../utils/moveFunctions/generateLegalMoves";

type Props = {
  children: React.ReactNode;
};

type Promotable = "knight" | "bishop" | "rook" | "queen";

type Move = {
  from: string;
  to: string;
  promoteTo?: Promotable;
};

type TGameState = "creating" | "playing";

type TBotGameContext = {
  gameState: TGameState;
  setGameState: React.Dispatch<React.SetStateAction<TGameState>>;
  moves: Move[];
  setMoves: React.Dispatch<React.SetStateAction<Move[]>>;
  pieces: Piece[];
  makeMove: (move: Move) => void;
  color: "white" | "black";
  setColor: React.Dispatch<React.SetStateAction<"white" | "black">>;
  orientation: "white" | "black";
  setOrientation: React.Dispatch<React.SetStateAction<"white" | "black">>;
  selectedPiece: Piece | null;
  setSelectedPiece: React.Dispatch<React.SetStateAction<Piece | null>>;
  legalMoves: string[];
  turn: "white" | "black";
  moveIndex: number;
  setMoveIndex: React.Dispatch<React.SetStateAction<number>>;
  resetBotGameContext: () => void;
  gameOver: boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  updateLocalStorage: () => void;
  difficulty: "easy" | "medium" | "hard" | "impossible";
  setDifficulty: React.Dispatch<
    React.SetStateAction<"easy" | "medium" | "hard" | "impossible">
  >;
  startGame: (difficulty: "easy" | "medium" | "hard" | "impossible") => void;
};

const BotGameContext = createContext<TBotGameContext>({} as TBotGameContext);

export function BotGameContextProvider({ children }: Props) {
  const [gameState, setGameState] = useState<TGameState>("creating");
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

  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | "impossible"
  >("impossible");
  const [color, setColor] = useState<"white" | "black">("white");
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [gameOver, setGameOver] = useState(false);

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

  function updateLocalStorage() {
    localStorage.setItem(
      "botGame",
      JSON.stringify({
        color,
        difficulty,
        moves,
      })
    );
  }

  function makeMove(move: Move) {
    setMoves((prevMoves) => [...prevMoves, move]);
    const currentGame = localStorage.getItem("botGame");
    if (currentGame) {
      const data = JSON.parse(currentGame);
      data.moves.push(move);
      localStorage.setItem("botGame", JSON.stringify(data));
    }
  }

  function resetBotGameContext() {
    setMoves([]);
    setGameState("creating");
    setMoveIndex(-1);
    setColor("white");
    setOrientation("white");
    setSelectedPiece(null);
    setGameOver(false);
    setDifficulty("impossible");
  }

  function startGame(difficulty: "easy" | "medium" | "hard" | "impossible") {
    const playerColor = ["white", "black"][Math.floor(Math.random() * 2)] as
      | "white"
      | "black";

    setMoveIndex(-1);
    setMoves([]);
    setGameState("playing");
    setOrientation(playerColor);
    setColor(playerColor);
    setGameOver(false);
    setSelectedPiece(null);
    setDifficulty(difficulty);

    localStorage.setItem(
      "botGame",
      JSON.stringify({
        color: playerColor,
        difficulty,
        moves: [],
      })
    );
  }

  return (
    <BotGameContext.Provider
      value={{
        moves,
        setMoves,
        pieces,
        makeMove,
        color,
        setColor,
        orientation,
        setOrientation,
        selectedPiece,
        setSelectedPiece,
        legalMoves,
        turn,
        gameState,
        setGameState,
        moveIndex,
        setMoveIndex,
        resetBotGameContext,
        gameOver,
        setGameOver,
        updateLocalStorage,
        difficulty,
        setDifficulty,
        startGame,
      }}
    >
      {children}
    </BotGameContext.Provider>
  );
}

export function useBotGameContext() {
  return useContext(BotGameContext);
}
