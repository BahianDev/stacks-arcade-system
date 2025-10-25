import React, { useState, useEffect } from "react";
import { MusicControl } from "../ui/MusicControl";
import { audioManager } from "../../utils/audio";
import { showConnect } from "@stacks/connect";
import { UserSession, AppConfig } from "@stacks/auth";
import { usePointsBalance } from "../../hooks/usePointsBalance";

interface HeaderProps {
  title: string;
  onOpenBalance?: () => void;
}

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export const Header: React.FC<HeaderProps> = ({ title, onOpenBalance }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");

  const { asString } = usePointsBalance({
    playerAddress: userAddress,
    pollMs: 0,
  });

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setIsConnected(true);
      setUserAddress(userData.profile.stxAddress.testnet);
    }
  }, []);

  const handleConnectWallet = () => {
    showConnect({
      userSession,
      appDetails: {
        name: "IndiG",
        icon: window.location.origin + "/logo.svg",
      },
      onFinish: () => {
        console.log("Connected!");
        const userData = userSession.loadUserData();
        setIsConnected(true);
        setUserAddress(userData.profile.stxAddress.testnet);
      },
      onCancel: () => {
        console.log("Wallet connection cancelled");
      },
    });
  };

  const handleDisconnectWallet = () => {
    userSession.signUserOut();
    setIsConnected(false);
    setUserAddress("");
    console.log("Wallet disconnected");
  };

  const handleBalanceClick = () => {
    if (onOpenBalance) {
      onOpenBalance();
    }
  };

  const toggleMusic = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        await audioManager.startHomepageMusic();
      }

      const isPlaying = audioManager.toggleHomepageMusic();
      setIsMusicPlaying(isPlaying);
      console.log("Homepage music toggled:", isPlaying ? "playing" : "muted");
    } catch (error) {
      console.warn("Failed to toggle homepage music:", error);
    }
  };

  // Função para formatar o endereço da wallet (ex: SP1234...5678)
  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const balanceButton = (
    <button
      onClick={handleBalanceClick}
      className={`flex items-center justify-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-wider transition-transform duration-300 transform hover:scale-105 border-2 ${
        onOpenBalance ? "opacity-100" : "opacity-60 cursor-not-allowed"
      }`}
      style={{
        borderColor: "#FFFFFF",
        fontFamily: "'Press Start 2P', monospace",
      }}
      disabled={!onOpenBalance}
    >
      <span>Balance</span>
    </button>
  );

  return (
    <header
      className="relative z-10 border-b-2"
      style={{ borderColor: "#FFFFFF", background: "transparent" }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo and Title - Left side */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1
                className="pixel-header text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-wider"
                style={{ color: "#FFFFFF" }}
              >
                {title}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            {isConnected ? (
              <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
                <span
                  className="flex items-center justify-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-wider transition-transform duration-300 transform hover:scale-105 border-2"
                  style={{
                    borderColor: "#FFFFFF",
                    fontFamily: "'Press Start 2P', monospace",
                  }}
                  title={userAddress}
                >
                  {formatAddress(userAddress)} ({asString} POINTS) 
                </span>
                {balanceButton}
                <button
                  onClick={handleDisconnectWallet}
                  className="flex items-center justify-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-wider transition-transform duration-300 transform hover:scale-105 border-2"
                  style={{
                    borderColor: "#FFFFFF",
                    fontFamily: "'Press Start 2P', monospace",
                  }}
                >
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleConnectWallet}
                  className="flex items-center justify-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-wider transition-transform duration-300 transform hover:scale-105 border-2"
                  style={{
                    borderColor: "#FFFFFF",
                    fontFamily: "'Press Start 2P', monospace",
                  }}
                >
                  <span>Connect Wallet</span>
                </button>
                {isConnected && balanceButton}
              </div>
            )}
            <div className="relative">
              <MusicControl
                isMusicPlaying={isMusicPlaying}
                onToggle={toggleMusic}
                position="top-right"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
