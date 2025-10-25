// /hooks/useHotWallet.ts
import { useEffect, useState } from "react";
import { Wallet } from "ethers";

const LS_KEY = "hotWalletPK";

export function useHotWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    try {
      // tenta recuperar do localStorage
      let pk =
        typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
      if (!pk) {
        // cria um novo
        const w = Wallet.createRandom();
        pk = w.privateKey;
        localStorage.setItem(LS_KEY, pk);
      }
      setWallet(new Wallet(pk as string));
    } catch (error) {
      console.log(error);
    }
  }, []);

  return wallet; // null enquanto carrega
}
