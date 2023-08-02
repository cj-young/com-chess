import { useEffect, useRef, useState } from "react";
import Piece from "../utils/Piece";

type Props = {
  piece: Piece;
};

export default function PieceComponent({ piece }: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const rank = piece.numRank;
  const file = piece.numFile;

  const handleMouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null);
  const handleMouseUpRef = useRef<(() => void) | null>(null);

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

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    function handleMouseMove(e: MouseEvent) {
      e.preventDefault();
      const deltaX = e.clientX - startCoords.x;
      const deltaY = e.clientY - startCoords.y;
      setOffset({ x: deltaX, y: deltaY });
    }

    function handleMouseUp() {
      setOffset({ x: 0, y: 0 });

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
        top: `calc((100% / 8) * ${rank})`,
        left: `calc((100% / 8) * ${file})`,
        translate: `${offset.x}px ${offset.y}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <img src={piece.image} alt={`${piece.color} ${piece.type}`} />
    </div>
  );
}
