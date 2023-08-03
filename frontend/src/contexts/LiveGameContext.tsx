import { createContext, useContext, useState, useMemo } from "react";
import applyMoves from "../utils/applyMoves";
import generateStartingPosition from "../utils/generateStartingPosition";
import Piece from "../utils/Piece";
import { socket } from "../config/socket";

type Props = {
  children: React.ReactNode;
};

type Promotable = "knight" | "bishop" | "rook" | "queen";

type Move = {
  from: string;
  to: string;
  promoteTo?: Promotable;
};

type GameInfo = {
  blackUsername: string;
  whiteUsername: string;
  minutes: number;
  increment: number;
  blackTime: number;
  whiteTime: number;
};

type TLiveGameContext = {
  moves: Move[];
  setMoves: React.Dispatch<React.SetStateAction<Move[]>>;
  pieces: Piece[];
  makeMove: (move: Move) => void;
  gameInfo: GameInfo;
  setGameInfo: React.Dispatch<React.SetStateAction<GameInfo>>;
  color: "white" | "black";
  setColor: React.Dispatch<React.SetStateAction<"white" | "black">>;
};

const LiveGameContext = createContext<TLiveGameContext>({} as TLiveGameContext);

export function LiveGameContextProvider({ children }: Props) {
  const [moves, setMoves] = useState<Move[]>([]);
  const pieces = useMemo(() => {
    return applyMoves(generateStartingPosition(), moves);
  }, [moves]);
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    blackUsername: "",
    whiteUsername: "",
    minutes: 0,
    increment: 0,
    blackTime: 0,
    whiteTime: 0
  });
  const [color, setColor] = useState<"white" | "black">("white");

  function makeMove(move: Move) {
    setMoves((prevMoves) => [...prevMoves, move]);
    socket.emit("move", move);
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
        setColor
      }}
    >
      {children}
    </LiveGameContext.Provider>
  );
}

export function useLiveGameContext() {
  return useContext(LiveGameContext);
}
