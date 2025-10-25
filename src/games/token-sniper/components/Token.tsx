import React from "react";

interface TokenProps {
  token: {
    id: string;
    x: number;
    y: number;
    type: "token1" | "token2" | "token3" | "token4" | "multiplier";
    value: number;
    size: number;
    isMultiplier?: boolean;
  };
}

const TOKEN_IMAGES = ["/token.png", "/token.png", "/token.png", "/token.png"];

export const Token: React.FC<TokenProps> = ({ token }) => {
  const getTokenImageIndex = () => {
    if (token.isMultiplier) return -1; // Special case for multiplier
    switch (token.type) {
      case "token1":
        return 0;
      case "token2":
        return 1;
      case "token3":
        return 2;
      case "token4":
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div
      className="absolute pointer-events-none animate-pulse"
      style={{
        left: `${token.x}px`,
        top: `${token.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative">
        {token.isMultiplier ? (
          /* 2X Multiplier Token */
          <div
            className="flex items-center justify-center bg-yellow-400 border-4 border-yellow-300 rounded-full animate-pulse"
            style={{
              width: `${token.size}px`,
              height: `${token.size}px`,
              boxShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
            }}
          >
            <span
              className="text-black font-bold text-xs"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              2X
            </span>
          </div>
        ) : (
          /* Regular Token Image */
          <img
            src={TOKEN_IMAGES[getTokenImageIndex()]}
            alt={`Token ${token.type}`}
            className="object-contain drop-shadow-lg"
            style={{
              width: `${token.size}px`,
              height: `${token.size}px`,
              filter: "drop-shadow(0 0 10px rgba(131, 232, 63, 0.5))",
            }}
          />
        )}

        {/* Value indicator */}
        {!token.isMultiplier && (
          <div
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold text-green-400 animate-pulse"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            {token.value}
          </div>
        )}

        {/* Glowing effect */}
        <div
          className="absolute inset-0 rounded-full opacity-30 animate-pulse"
          style={{
            background: token.isMultiplier
              ? "radial-gradient(circle, rgba(255, 215, 0, 0.5) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(131, 232, 63, 0.3) 0%, transparent 70%)",
          }}
        ></div>
      </div>
    </div>
  );
};
