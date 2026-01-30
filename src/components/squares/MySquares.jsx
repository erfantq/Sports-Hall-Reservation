import { useEffect, useState } from "react";
import Squares from "./Squares";

export default function MySquares() {
  const [k, setK] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setK(x => x + 1), 0); // بعد از layout
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", background: "black", overflow: "hidden" }}>
      <Squares key={k} squareSize={40} speed={0.5} direction="diagonal"
        borderColor="rgb(39,30,55)" hoverFillColor="rgb(34,34,34)"
      />
    </div>
  );
}
