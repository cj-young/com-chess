import Piece from "./Piece";

type Promotable = "knight" | "bishop" | "rook" | "queen";

type Move = {
  from: string;
  to: string;
  promoteTo?: Promotable;
};

function getRank(square: string) {
  return 7 - (+square[1] - 1);
}

function getFile(square: string) {
  return square.charCodeAt(0) - 97;
}

export default function applyMoves(pieces: Piece[], moves: Move[]) {
  const board: (null | Piece)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );
  for (let piece of pieces) {
    board[piece.numRank][piece.numFile] = piece;
  }

  let enPassantSquare: string | null = null;

  for (let move of moves) {
    let enPassantWasSet = false;
    const fromRow = getRank(move.from);
    const fromCol = getFile(move.from);
    const toRow = getRank(move.to);
    const toCol = getFile(move.to);

    const piece = board[fromRow][fromCol];
    board[fromRow][fromCol] = null;

    if (!piece) {
      console.error("No piece there");
      continue;
    }

    if (piece.type === "pawn") {
      if (move.from[1] === "2" && move.to[1] === "4") {
        enPassantSquare = move.from[0] + "3";
        enPassantWasSet = true;
      } else if (move.from[1] === "7" && move.to[1] === "5") {
        enPassantSquare = move.from[0] + "6";
        enPassantWasSet = true;
      }

      if (move.to === enPassantSquare) {
        const capturedPiece = board[fromRow][getFile(enPassantSquare)];
        if (capturedPiece) capturedPiece.active = false;
        board[fromRow][getFile(enPassantSquare)] = null;
      }

      if (move.to[1] === "1" || move.to[1] === "8") {
        if (!move.promoteTo) {
          console.error("Pawn didn't promote");
          continue;
        }

        piece.type = move.promoteTo;
      }
    }

    const capturedPiece = board[toRow][toCol];
    if (capturedPiece) {
      capturedPiece.active = false;
    }

    // Castling
    if (piece.type === "king") {
      if (
        move.from[0] === "e" &&
        (move.to[0] === "g" || move.to[0] === "c") &&
        move.from[1] === move.to[1]
      ) {
        const [rookFromFile, rookToFile] =
          move.to[0] === "c" ? ["a", "d"] : ["h", "f"];
        const rook =
          board[getRank(`${rookFromFile}${move.from[1]}`)][
            getFile(`${rookFromFile}${move.from[1]}`)
          ];
        if (rook?.type === "rook") {
          board[getRank(`${rookFromFile}${move.from[1]}`)][
            getFile(`${rookFromFile}${move.from[1]}`)
          ];
          const newPos = `${rookToFile}${move.from[1]}`;
          const [newRow, newCol] = [getRank(newPos), getFile(newPos)];
          const existingPiece = board[newRow][newCol];
          if (existingPiece) {
            existingPiece.active = false;
          }
          board[newRow][newCol] = rook;
          rook.square = newPos;
        }
      }
    }

    board[toRow][toCol] = piece;
    piece.square = move.to;

    if (!enPassantWasSet) enPassantSquare = null;
  }

  return pieces;
}
