export const pieceTypeList = ["p", "r", "n", "b", "k", "q"] as const;
export type PieceType = (typeof pieceTypeList)[number];
