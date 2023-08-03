import { useEffect, useRef, useState } from "react";
import Piece from "../utils/Piece";
import { letterSquare } from "../utils/squareConverters";
import { useLiveGameContext } from "../contexts/LiveGameContext";

type Props = {
  piece: Piece;
  boardRef: React.RefObject<HTMLDivElement | null>;
};

export default function PieceComponent({ piece, boardRef }: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const pieceRef = useRef(null);
  const offsetRef = useRef(offset);

  const { makeMove, orientation } = useLiveGameContext();

  offsetRef.current = offset;

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
    e.preventDefault();

    const startCoords = { x: e.clientX, y: e.clientY };
    setOffset({ x: 0, y: 0 });
    setIsDragging(true);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    function handleMouseMove(e: MouseEvent) {
      e.preventDefault();
      const deltaX = e.clientX - startCoords.x;
      const deltaY = e.clientY - startCoords.y;
      setOffset({ x: deltaX, y: deltaY });
    }

    function handleMouseUp(e: MouseEvent) {
      if (pieceRef.current && boardRef.current) {
        const squareSize = boardRef.current.offsetWidth / 8;

        const newRank =
          rank +
          Math.floor((offsetRef.current.y + 0.5 * squareSize) / squareSize);
        const newFile =
          file +
          Math.floor((offsetRef.current.x + 0.5 * squareSize) / squareSize);
        if (newRank < 8 && newFile < 8 && newRank >= 0 && newFile >= 0) {
          const newSquare = letterSquare(newRank, newFile);
          makeMove({ to: newSquare, from: piece.square });
        }
      }

      setOffset({ x: 0, y: 0 });
      setIsDragging(false);

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    handleMouseMoveRef.current = handleMouseMove;
    handleMouseUpRef.current = handleMouseUp;
  }

  return (
    <div
      className="piece"
      style={{
        top: `calc((100% / 8) * ${orientation === "white" ? rank : 7 - rank})`,
        left: `calc((100% / 8) * ${file})`,
        translate: `${offset.x}px ${offset.y}px`,
        zIndex: isDragging ? "1000" : "unset"
      }}
      onMouseDown={handleMouseDown}
      ref={pieceRef}
    >
      <img src={piece.image} alt={`${piece.color} ${piece.type}`} />
    </div>
  );
}
