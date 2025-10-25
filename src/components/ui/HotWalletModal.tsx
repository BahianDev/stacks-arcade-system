import { useState, useEffect } from "react";
import { openSTXTransfer, showConnect, getUserData } from "@stacks/connect";
import { AnchorMode } from "@stacks/transactions";
import { STACKS_TESTNET, TransactionVersion } from "@stacks/network";
import {
  generateSecretKey,
  generateWallet,
  getStxAddress,
} from "@stacks/wallet-sdk";
import toast from "react-hot-toast";

interface HotWalletModalProps {
  open: boolean;
  onClose: () => void;
}

interface HotWalletData {
  address: string;
  privateKey: string;
}

export const HotWalletModal = ({ open, onClose }: HotWalletModalProps) => {
  const [amount, setAmount] = useState("1");
  const [balance, setBalance] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [hotWallet, setHotWallet] = useState<HotWalletData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Funções de conversão
  const stacksToMicro = (stx: number): string => {
    return (stx * 1000000).toString();
  };

  const microToStacks = (microStx: string | number): string => {
    const num = typeof microStx === "string" ? parseInt(microStx) : microStx;
    return (num / 1000000).toFixed(6);
  };

  // Verificar se usuário está autenticado e carregar/criar hot wallet
  useEffect(() => {
    const initialize = async () => {
      // Verificar autenticação
      const data = await getUserData();
      if (data) {
        setUserData(data);
        setIsSignedIn(true);
      }

      // Verificar se hot wallet já existe no localStorage
      const storedHotWallet = localStorage.getItem("hotWallet");

      if (storedHotWallet) {
        // Se existe, carregar
        const hotWalletData = JSON.parse(storedHotWallet);
        setHotWallet(hotWalletData);
        fetchBalance(hotWalletData.address);
        console.log("Hot wallet carregada do localStorage:", hotWalletData);
      } else {
        // Se não existe, criar uma nova
        createHotWallet();
      }

      setIsInitialized(true);
    };

    if (open && !isInitialized) {
      initialize();
    }
  }, [open, isInitialized]);

  // Criar nova hot wallet
  const createHotWallet = async () => {
    try {
      // Gerar chave privada aleatória
      const password = "password-segura-aqui"; // Use uma senha forte
      const mySecretKey = generateSecretKey();

      console.log("Frase mnemônica gerada:", mySecretKey);

      // 2. Usar a frase mnemônica para criar a carteira.
      const wallet = await generateWallet({
        secretKey: mySecretKey, // Passa a frase mnemônica aqui
        password: password,
      });

      const firstAccount = wallet.accounts[0];

      // Deriva o endereço STX a partir do objeto Account e da rede desejada
      const stxAddress = getStxAddress(firstAccount, "testnet");

      const hotWalletData: HotWalletData = {
        address: stxAddress,
        privateKey: firstAccount.stxPrivateKey,
      };

      // Salvar no localStorage
      localStorage.setItem("hotWallet", JSON.stringify(hotWalletData));
      setHotWallet(hotWalletData);

      console.log("Nova hot wallet criada:", hotWalletData);
      return hotWalletData;
    } catch (error) {
      console.error("Erro ao criar hot wallet:", error);
      return null;
    }
  };

  // Buscar saldo
  const fetchBalance = async (address: string) => {
    try {
      const response = await fetch(
        `https://stacks-node-api.testnet.stacks.co/extended/v1/address/${address}/stx`
      );
      const data = await response.json();
      console.log(data);

      setBalance(microToStacks(data.balance));
    } catch (error) {
      console.error("Erro ao buscar saldo:", error);
    }
  };

  // Conectar carteira
  const handleConnect = async () => {
    showConnect({
      appDetails: {
        name: "Seu App",
        icon: window.location.origin + "/logo.png",
      },
      onFinish: async (data: any) => {
        setUserData(data);
        setIsSignedIn(true);

        // Garantir que a hot wallet existe
        if (!hotWallet) {
          const storedHotWallet = localStorage.getItem("hotWallet");
          if (storedHotWallet) {
            const hotWalletData = JSON.parse(storedHotWallet);
            setHotWallet(hotWalletData);
            fetchBalance(hotWalletData.address);
          } else {
            const newHotWallet = await createHotWallet();
            if (newHotWallet) {
              fetchBalance(newHotWallet.address);
            }
          }
        }
      },
      onCancel: () => {
        console.log("Autenticação cancelada");
      },
    });
  };

  const fundHotWallet = async () => {
    if (!userData?.profile?.stxAddress?.mainnet) {
      handleConnect();
      return;
    }

    // Garantir que a hot wallet existe
    let targetHotWallet = hotWallet;
    if (!targetHotWallet) {
      const storedHotWallet = localStorage.getItem("hotWallet");
      if (storedHotWallet) {
        targetHotWallet = JSON.parse(storedHotWallet);
        setHotWallet(targetHotWallet);
      } else {
        targetHotWallet = await createHotWallet();
      }
    }

    if (!targetHotWallet) {
      console.error("Não foi possível criar ou carregar a hot wallet");
      return;
    }

    openSTXTransfer({
      network: STACKS_TESTNET,
      recipient: targetHotWallet.address,
      amount: stacksToMicro(parseFloat(amount)),
      memo: "Funding hot wallet",
      anchorMode: AnchorMode.OnChainOnly,

      onFinish: (response: any) => {
        toast.success("Transaction completed:", response);
        fetchBalance(targetHotWallet!.address);
      },
      onCancel: () => {
        toast.error("Transaction canceled by user");
      },
    });
  };

  if (!open) return null;

  const stxAddress = userData?.profile?.stxAddress?.testnet;
  const formattedBalance =
    balance !== null ? `${balance} STX` : "carregando...";

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center"
      style={{ zIndex: 100 }}
    >
      <div
        className="relative bg-black p-6 w-96 space-y-8"
        style={{
          color: "#FFFFFF",
          border: "2px solid #FFFFFF",
          boxShadow: "0 0 20px #FFFFFF",
        }}
      >
        <button onClick={onClose} className="absolute text-2xl top-2 right-2">
          ✕
        </button>

        <h2 className="text-xl font-bold">Hot Wallet</h2>

        {!isSignedIn ? (
          <div className="text-center">
            <p className="mb-4">Conecte sua carteira para continuar</p>
            <button
              onClick={handleConnect}
              className="w-full bg-[#FFFFFF] text-black font-bold text-lg py-2 rounded-md"
            >
              Conectar Carteira
            </button>
          </div>
        ) : (
          <>
            {/* Informações da Wallet Conectada */}
            <div className="mb-4 p-3 bg-gray-900 rounded">
              <p className="text-sm font-bold mb-2">Wallet Conectada:</p>
              <p className="text-xs break-all">
                <b>Address:</b> {stxAddress}
              </p>
            </div>

            {/* Informações da Hot Wallet */}
            <div className="mb-4 p-3 bg-gray-900 rounded">
              <p className="text-sm font-bold mb-2">Hot Wallet:</p>
              {hotWallet ? (
                <>
                  <p className="text-xs break-all">
                    <b>Address:</b> {hotWallet.address}
                  </p>
                  <p className="text-xs break-all mt-2">
                    <b>Private Key:</b> {hotWallet.privateKey.substring(0, 20)}
                    ...
                  </p>
                  <p className="mt-2">
                    <b>Balance:</b> {formattedBalance}
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm mb-2">Criando hot wallet...</p>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                </div>
              )}
            </div>

            <label className="block">
              Amount para enviar (STX):
              <input
                className="border w-full px-2 py-3 bg-black mt-2"
                style={{
                  color: "#FFFFFF",
                  border: "1px solid #FFFFFF",
                }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                step="0.001"
                placeholder="1.0"
              />
            </label>

            <button
              onClick={fundHotWallet}
              disabled={!hotWallet}
              className={`w-full font-bold text-lg py-2 rounded-md transition-colors ${
                hotWallet
                  ? "bg-[#FFFFFF] text-black hover:bg-gray-200"
                  : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
            >
              {hotWallet ? "Fund Hot Wallet" : "Aguarde..."}
            </button>
          </>
        )}

        <div className="text-sm text-gray-400 mt-4">
          <p>⚠️ Esta ação abrirá sua carteira para confirmar a transação</p>
          <p className="mt-2">
            🔑 A hot wallet é armazenada localmente no seu navegador
          </p>
        </div>
      </div>
    </div>
  );
};
