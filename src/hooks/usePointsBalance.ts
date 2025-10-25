// hooks/usePointsBalance.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV,
  ClarityValue,
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";

// MOCKS fixos (pode trocar depois se quiser)
const CONTRACT_ADDRESS = "STW7VPTCK9TTSZC5PRSPM4H0SFDZ8HB8Z0SW803E";
const CONTRACT_NAME = "contract-161257889786";

// opcional: use o endpoint público da Hiro testnet

type UsePointsBalanceProps = {
  /** principal (ST...) do player */
  playerAddress?: string;

  /** se quiser sobrescrever os mocks, pode passar */
  contractAddress?: string;
  contractName?: string;

  /** polling opcional em ms (ex.: 5000) */
  pollMs?: number;

  /** habilita/desabilita o hook */
  enabled?: boolean;
};

export function usePointsBalance({
  playerAddress,
  contractAddress = CONTRACT_ADDRESS,
  contractName = CONTRACT_NAME,
  pollMs,
  enabled = true,
}: UsePointsBalanceProps) {
  const [data, setData] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const network = useMemo(() => STACKS_TESTNET, []);

  const fetchBalance = async () => {
    if (!enabled || !playerAddress) return;
    setLoading(true);
    setError(null);
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "get-points-balance",
        functionArgs: [standardPrincipalCV(playerAddress)],
        senderAddress: playerAddress, // qualquer principal válido
        network,
      });

      const json = cvToJSON(result); // { type: "uint", value: "123" }
      const value = BigInt(json.value as string);
      setData(value);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    if (pollMs && pollMs > 0) {
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(fetchBalance, pollMs);
      return () => {
        if (timer.current) clearInterval(timer.current);
      };
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerAddress, contractAddress, contractName, enabled, pollMs]);

  return {
    data,                       // bigint (ex.: 123n)
    asString: data?.toString() ?? null,
    asNumber: data !== null ? Number(data) : null, // cuidado com > MAX_SAFE_INTEGER
    loading,
    error,
    refetch: fetchBalance,
  };
}
