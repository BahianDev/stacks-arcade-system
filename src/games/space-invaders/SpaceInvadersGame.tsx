import { useRef, useState } from "react";
import { setSoundEnabled } from "./sound";
import { useSpaceInvaders } from "../../hooks/useSpaceInvaders";
import { QuitConfirmation } from "../shared/components/QuitConfirmation";
import { useNavigate } from "react-router-dom";

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useSpaceInvaders(canvasRef, { autoPlay: true });
  const navigate = useNavigate();

  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);

  const [soundEnabled, setSoundEnabledState] = useState(true);
  const handleBackClick = () => {
    setShowQuitConfirmation(true);
  };

  const toggleSound = () => {
    const newEnabled = !soundEnabled;
    setSoundEnabledState(newEnabled);
    setSoundEnabled(newEnabled);
  };

  const handleQuitConfirm = () => {
    navigate("/");
  };

  const handleQuitCancel = () => {
    setShowQuitConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <QuitConfirmation
        isOpen={showQuitConfirmation}
        onConfirm={handleQuitConfirm}
        onCancel={handleQuitCancel}
      />

      <div>
        <button
          onClick={handleBackClick}
          className="absolute top-4 left-4 z-40 text-xl font-mono font-bold hover:opacity-80 transition-all duration-200 bg-transparent border-none cursor-pointer"
          style={{
            color: "#FFFFFF",
            fontFamily: "'Press Start 2P', monospace",
          }}
        >
          BACK
        </button>
      </div>
      <canvas ref={canvasRef} />
      <button
        onClick={toggleSound}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}
      >
        {soundEnabled ? "Mute" : "Unmute"}
      </button>
    </div>
  );
}
