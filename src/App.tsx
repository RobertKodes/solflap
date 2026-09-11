import { Board } from "./components/Board";
import { useBoard } from "./hooks/useBoard";
import "./App.css";

export default function App() {
  const board = useBoard();

  return (
    <div className="hall">
      <Board state={board} onArm={board.arm} onCut={board.cut} />
    </div>
  );
}
