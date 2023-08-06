import { useEffect, useMemo, useRef, useState } from "react";
import Piece from "../utils/Piece";
import { letterSquare } from "../utils/squareConverters";
import { useLiveGameContext } from "../contexts/LiveGameContext";

type Props = {
  piece: Piece;
  boardRef: React.RefObject<HTMLDivElement | null>;
};

export default function PieceComponent({ piece, boardRef }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  }>();
  const pieceRef = useRef<HTMLDivElement>(null);
  const [pieceTop, pieceLeft] = useMemo(() => {
    if (!pieceRef.current || !boardRef.current || !mousePosition) return [0, 0];
    const width = pieceRef.current.offsetWidth;
    const height = pieceRef.current.offsetHeight;
    const boardRect = boardRef.current.getBoundingClientRect();
    const top = mousePosition.y - height / 2 - boardRect.top;
    const left = mousePosition.x - width / 2 - boardRect.left;

    return [top, left];
  }, [pieceRef.current, mousePosition, isDragging]);

  const {
    makeMove,
    orientation,
    color,
    selectedPiece,
    setSelectedPiece,
    legalMoves
  } = useLiveGameContext();

  const selectedPieceRef = useRef<null | Piece>(null);
  selectedPieceRef.current = selectedPiece;
  const legalMovesRef = useRef<string[]>([]);
  legalMovesRef.current = legalMoves;

  const canDrag = useMemo(() => {
    return piece.color === color;
  }, [piece, color]);

  const rank = piece.numRank;
  const file = piece.numFile;

  const handleMouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null);
  const handleMouseUpRef = useRef<((e: MouseEvent) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (handleMouseMoveRef.current) {
        document.removeEventListener("mousemove", handleMouseMoveRef.current);
      }
      if (handleMouseUpRef.current) {
        document.removeEventListener("mouseup", handleMouseUpRef.current);
      }
    };
  }, []);

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    if (!canDrag) return;
    setIsDragging(true);
    const upWillDeselect = selectedPieceRef.current?.square === piece.square;
    setSelectedPiece(piece);
    setMousePosition({ x: e.clientX, y: e.clientY });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    function handleMouseMove(e: MouseEvent) {
      e.preventDefault();
      setMousePosition({ x: e.clientX, y: e.clientY });
    }

    function handleMouseUp(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (boardRef.current && pieceRef.current && legalMovesRef.current) {
        const squareSize = boardRef.current.offsetWidth / 8;
        const boardRect = boardRef.current.getBoundingClientRect();

        let newFile = Math.floor((e.clientX - boardRect.left) / squareSize);
        let newRank = Math.floor((e.clientY - boardRect.top) / squareSize);

        if (orientation === "black") {
          newFile = 7 - newFile;
          newRank = 7 - newRank;
        }

        if (newRank < 8 && newFile < 8 && newRank >= 0 && newFile >= 0) {
          const newSquare = letterSquare(newRank, newFile);
          if (newSquare === piece.square) {
            if (upWillDeselect) setSelectedPiece(null);
          } else {
            console.log(newSquare, legalMoves);
            if (legalMovesRef.current.includes(newSquare)) {
              makeMove({ to: newSquare, from: piece.square });
            }
            setSelectedPiece(null);
          }
        }
      }
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
  }

  return (
    <div
      className="piece"
      style={{
        top: isDragging
          ? pieceTop
          : `calc((100% / 8) * ${orientation === "white" ? rank : 7 - rank})`,
        left: isDragging
          ? pieceLeft
          : `calc((100% / 8) * ${orientation === "white" ? file : 7 - file})`,
        zIndex: isDragging ? "1000" : "2",
        cursor: isDragging ? "grabbing" : canDrag ? "pointer" : "default"
      }}
      onMouseDown={handleMouseDown}
      ref={pieceRef}
    >
      <img src={piece.image} alt={`${piece.color} ${piece.type}`} />
    </div>
  );
}
