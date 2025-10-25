import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Lock } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { audioManager } from "../utils/audio";
import { HotWalletModal } from "../components/ui/HotWalletModal";
import toast from "react-hot-toast";
import { handleRecordActions } from "../utils/actions";

const games = [
  {
    id: "token-sniper",
    title: "", // Remove title for Token Sniper
    description: "Aim, shoot, collect",
    icon: Rocket,
    status: "available", // Changed to available
    route: "/token-sniper", // Added route
    searchName: "TokenSniper", // Add searchable name
  },
  {
    id: "block-buster",
    title: "",
    description: "Grow Your Chain",
    icon: Rocket,
    status: "available",
    route: "/block-chain",
    searchName: "Blockchain", // Add searchable name
  },
  {
    id: "asteroids",
    title: "",
    description: "shoot meteors",
    icon: Rocket,
    status: "available",
    route: "/asteroids",
    searchName: "Asteroids", // Add searchable name
  },
  {
    id: "tetris",
    title: "",
    description: "shoot meteors",
    icon: Rocket,
    status: "available",
    route: "/tetris",
    searchName: "Tetris", // Add searchable name
  },
  {
    id: "shield-master",
    title: "",
    description: "",
    icon: Lock,
    status: "classified",
    searchName: "Shield Master", // Add searchable name
  },
];

export const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Initialize homepage music when component mounts
  useEffect(() => {
    audioManager.initializeHomepageMusic().then((success) => {
      console.log(
        "Homepage music initialization:",
        success ? "successful" : "failed"
      );
    });

    // Cleanup when component unmounts
    return () => {
      audioManager.stopHomepageMusic();
    };
  }, []);

  const filteredGames = games.filter(
    (game) =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.searchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGameClick = (game: (typeof games)[0]) => {
    if (game.status === "available" && game.route) {
      // Play enter sound when clicking on available games
      audioManager.playEnterSound();

      // Stop homepage music when navigating to game
      audioManager.stopHomepageMusic();

      // Navigate after a short delay to let the sound play
      setTimeout(() => {
        navigate(game.route!);
      }, 200);
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-black font-mono relative overflow-x-hidden"
        style={{ color: "#FFFFFF" }}
      >
        {/* Header */}
        <Header title="STACKS ARCADE" />
        <button onClick={() => setShowModal(true)}>show</button>

        {/* Main Content - Properly scrollable */}
        <main className="relative z-10 container mx-auto px-4 py-8">
          {/* Featured Section */}
          <div className="mb-6 flex ">
            <h2
              className="text-xl md:text-2xl font-bold mb-2 tracking-wider"
              style={{
                color: "#FFFFFF",
                textShadow: "0 0 5px #FFFFFF",
              }}
            >
              ▓▓▓ FEATURED GAMES ▓▓▓
            </h2>
          </div>

          {/* Games Grid - 3 columns, 2 rows layout */}
          <div className="grid grid-cols-3 gap-6 md:gap-8 lg:gap-10 mb-16">
            {filteredGames.map((game) => {
              const IconComponent = game.icon;
              return (
                <div
                  key={game.id}
                  onClick={() => handleGameClick(game)}
                  className={`
                  relative group p-4 md:p-6 
                  transition-all duration-300 transform hover:scale-105 aspect-square
                  ${
                    game.status === "available"
                      ? "cursor-pointer"
                      : game.status === "classified"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-not-allowed opacity-75"
                  }
                `}
                  style={{
                    background: "transparent",
                    border: "2px solid #FFFFFF",
                    ...(game.status === "available" && {
                      ":hover": {
                        borderColor: "#FFFFFF",
                        boxShadow: "0 0 20px #FFFFFF",
                      },
                    }),
                  }}
                >
                  {/* Game Card Content */}
                  <div className="text-center space-y-2 md:space-y-4 h-full flex flex-col justify-between">
                    {/* Icon/Logo - Special handling for games with logos and classified games */}
                    {game.id === "token-sniper" ||
                    game.id === "block-buster" ||
                    game.id === "word-up" ||
                    game.id === "asteroids" ||
                    game.id === "space-invaders" ||
                    game.id === "tetris" ? (
                      // Games with logos: Use provided logos
                      <div className="flex-1 flex items-center justify-center">
                        <img
                          src={
                            game.id === "token-sniper"
                              ? "/token_sniper.png"
                              : game.id === "block-buster"
                              ? "/block_chain.png"
                              : game.id === "word-up"
                              ? "/word_up.png"
                              : game.id === "asteroids"
                              ? "/asteroids.png"
                              : game.id === "space-invaders"
                              ? "/space_invaders.png"
                              : game.id === "tetris"
                              ? "/tetris.png"
                              : ""
                          }
                          alt={`${game.id} Logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : game.status === "classified" ? (
                      // Classified games: Padlock icon with CLASSIFIED text
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="relative mx-auto w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                          <Lock
                            className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 transition-colors duration-200 animate-pulse"
                            style={{ color: "#FFFFFF" }}
                          />
                          <div
                            className="absolute inset-0 opacity-10 animate-pulse rounded"
                            style={{ backgroundColor: "#FFFFFF" }}
                          ></div>
                        </div>
                        <div
                          className="text-lg md:text-xl lg:text-2xl font-bold tracking-wider font-mono animate-pulse"
                          style={{
                            color: "#FFFFFF",
                            fontFamily: "'Press Start 2P', monospace",
                            textShadow: "0 0 5px #FFFFFF",
                          }}
                        >
                          CLASSIFIED
                        </div>
                      </div>
                    ) : (
                      // Other games: Regular icon layout
                      <div className="relative mx-auto w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center">
                        <IconComponent
                          className="w-6 h-6 md:w-10 md:h-10 lg:w-12 lg:h-12 transition-colors duration-200"
                          style={{ color: "#FFFFFF" }}
                        />
                        {game.status === "available" && (
                          <div
                            className="absolute inset-0 opacity-10 animate-pulse rounded"
                            style={{ backgroundColor: "#FFFFFF" }}
                          ></div>
                        )}
                      </div>
                    )}

                    {/* Title - Only show for games that have titles */}
                    {game.title && game.id !== "word-up" && (
                      <h3
                        className="text-xs md:text-sm lg:text-lg font-bold tracking-wider transition-colors duration-200 leading-tight font-mono"
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "'Press Start 2P', monospace",
                        }}
                      >
                        {game.title}
                      </h3>
                    )}

                    {/* Description - Special handling for games with logos, hide for classified */}
                    {game.status !== "classified" &&
                      (game.id === "token-sniper" ||
                      game.id === "block-buster" ||
                      game.id === "word-up" ? (
                        // Games with logos: Show description on all screen sizes, moved up
                        <p
                          className="text-xs lg:text-sm tracking-wide leading-relaxed font-mono -mt-2"
                          style={{
                            color: "#FFFFFF",
                            fontFamily: "'Press Start 2P', monospace",
                          }}
                        >
                          {game.description}
                        </p>
                      ) : (
                        // Other games: Hidden on small screens, using pixel font
                        <p
                          className="hidden md:block text-xs lg:text-sm tracking-wide leading-relaxed font-mono"
                          style={{
                            color: "#FFFFFF",
                            fontFamily: "'Press Start 2P', monospace",
                          }}
                        >
                          {game.description}
                        </p>
                      ))}

                    {/* Status Badge - Using pixel font - Moved up for games with logos, hide for classified */}
                    {game.status !== "classified" && (
                      <div
                        className={`pt-1 md:pt-2 ${
                          game.id === "token-sniper" ||
                          game.id === "block-buster" ||
                          game.id === "word-up"
                            ? "-mt-2"
                            : ""
                        }`}
                      >
                        {game.status === "available" ? (
                          <div
                            className="inline-block px-2 md:px-3 py-1 text-black text-xs font-bold tracking-wider font-mono"
                            style={{
                              backgroundColor: "#FFFFFF",
                              fontFamily: "'Press Start 2P', monospace",
                            }}
                          >
                            ▶ PLAY
                          </div>
                        ) : (
                          <div
                            className="inline-block px-2 md:px-3 py-1 border text-xs font-bold tracking-wider font-mono"
                            style={{
                              borderColor: "#4FA83F",
                              color: "#4FA83F",
                              fontFamily: "'Press Start 2P', monospace",
                            }}
                          >
                            SOON
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hover Glow Effect */}
                  {game.status === "available" && (
                    <div
                      className="absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        borderColor: "#FFFFFF",
                        boxShadow: "0 0 30px #FFFFFF",
                      }}
                    ></div>
                  )}

                  {/* Classified Glow Effect */}
                  {game.status === "classified" && (
                    <div
                      className="absolute inset-0 border-2 opacity-30 animate-pulse pointer-events-none"
                      style={{
                        borderColor: "#4FA83F",
                        boxShadow: "0 0 15px #4FA83F",
                      }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredGames.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👾</div>
              <h3
                className="text-xl font-bold mb-2 font-mono"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Press Start 2P', monospace",
                }}
              >
                NO GAMES FOUND
              </h3>
              <p
                className="font-mono"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Press Start 2P', monospace",
                }}
              >
                Try a different search term
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showSearch={true}
        />
      </div>
      <HotWalletModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
