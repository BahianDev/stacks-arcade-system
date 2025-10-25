import { ConnectButton } from "@rainbow-me/rainbowkit";

export const ConnectWallet = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    className={`top-6 right-28 z-40 flex items-center justify-center group h-12 w-56 p-4 md:p-6 transition-all duration-300 transform hover:scale-105 aspect-square cursor-pointer opacity-75`}
                    style={{
                      background: "transparent",
                      border: "2px solid #FFFFFF",
                      fontFamily: "'Press Start 2P', monospace",
                    }}
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    className={`top-6 right-28 z-40 flex items-center justify-center group h-12 w-56 p-4 md:p-6 transition-all duration-300 transform hover:scale-105 aspect-square cursor-pointer opacity-75`}
                    style={{
                      background: "transparent",
                      border: "2px solid #FFFFFF",
                      fontFamily: "'Press Start 2P', monospace",
                    }}
                    onClick={openChainModal}
                    type="button"
                  >
                    Wrong Network
                  </button>
                );
              }
              return (
                <button
                  className={`top-6 right-28 z-40 flex items-center justify-center group h-12 w-56 p-4 md:p-6 transition-all duration-300 transform hover:scale-105 aspect-square cursor-pointer opacity-75`}
                  style={{
                    background: "transparent",
                    border: "2px solid #FFFFFF",
                    fontFamily: "'Press Start 2P', monospace",
                  }}
                  onClick={openAccountModal}
                  type="button"
                >
                  {account.displayName}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
