import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";

type RequireWalletProps = {
  redirectTo?: string; // default: "/"
};

export default function RequireWallet({ redirectTo = "/" }: RequireWalletProps) {
  const location = useLocation();
  const { status, isConnected } = useAccount(); 
  // status: "connecting" | "reconnecting" | "connected" | "disconnected"

  if (status === "connecting" || status === "reconnecting") {
    // opcional: retorne um spinner aqui
    return null;
  }

  console.log(status, isConnected)

  if (!isConnected) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Autorizado: libera as rotas-filhas
  return <Outlet />;
}
