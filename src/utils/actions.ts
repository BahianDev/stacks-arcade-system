import {
  makeContractCall,
  broadcastTransaction,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";

interface ContractCallResult {
  success: boolean;
  txId?: string;
  error?: string;
  confirmation?: any;
}

const CONTRACT_ADDRESS = "STW7VPTCK9TTSZC5PRSPM4H0SFDZ8HB8Z0SW803E";
const CONTRACT_NAME = "contract-161257889786";
const FUNCTION_NAME = "record-actions";

const HIRO_API_BASE = "https://api.testnet.hiro.so";

type StacksTransactionTask = {
  player: string;
  actions: number;
  resolve: (value: ContractCallResult) => void;
  reject: (reason?: any) => void;
};

class StacksTransactionQueue {
  private queue: StacksTransactionTask[] = [];
  private isProcessing = false;

  constructor(
    private confirmBeforeNext = true,
    private pollMs = 1000,
    private timeoutMs = 120_000
  ) {}

  add(
    task: Omit<StacksTransactionTask, "resolve" | "reject">
  ): Promise<ContractCallResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...task, resolve, reject });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const task = this.queue.shift()!;
    try {
      const result = await this.executeTransaction(task.player, task.actions);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) setTimeout(() => this.processNext(), 0);
    }
  }

  private async executeTransaction(
    player: string,
    actions: number
  ): Promise<ContractCallResult> {
    try {
      const storedHotWallet = localStorage.getItem("hotWallet");
      if (!storedHotWallet) throw new Error("Hot wallet não encontrada");
      const hotWallet = JSON.parse(storedHotWallet);

      const functionArgs = [standardPrincipalCV(player), uintCV(actions)];

      const transaction = await makeContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: FUNCTION_NAME,
        functionArgs,
        senderKey: hotWallet.privateKey,
        network: STACKS_TESTNET,
        postConditionMode: PostConditionMode.Allow,
        fee: 1000,
      });

      const result: any = await broadcastTransaction({ transaction });
      if (result?.error) throw new Error(result.error);

      const txId = result?.txid as string;
      console.log(`Execute transaction txid=${txId}`);

      if (this.confirmBeforeNext) {
        const conf = await this.waitForConfirmation(txId);
        return { success: true, txId, confirmation: conf };
      }

      // Só broadcast (sem confirmar)
      return { success: true, txId };
    } catch (error: any) {
      console.error("Erro ao chamar contrato:", error);

      let errorMessage = "Erro ao executar transação";
      const msg = String(error?.message || "").toLowerCase();
      if (msg.includes("err-actions-zero"))
        errorMessage = "Número de ações deve ser maior que zero";
      else if (msg.includes("insufficient balance"))
        errorMessage = "Saldo insuficiente na hot wallet";
      else if (error?.message) errorMessage = error.message;

      return { success: false, error: errorMessage };
    }
  }

  private async waitForConfirmation(txId: string) {
    const deadline = Date.now() + this.timeoutMs;

    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${HIRO_API_BASE}/extended/v1/tx/${txId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          const status = json?.tx_status; // "pending" | "success" | "abort_by_post_condition" | "abort_by_response" | "rejected" ...
          if (status === "success") return json;
          if (
            status === "abort_by_post_condition" ||
            status === "abort_by_response" ||
            status === "rejected"
          ) {
            throw new Error(
              `Stacks tx failed: ${status} ${json?.tx_result?.repr ?? ""}`
            );
          }
        } else {
          // API momentaneamente indisponível – segue tentando
        }
      } catch {
        // falha de rede momentânea – segue tentando
      }
      await new Promise((r) => setTimeout(r, this.pollMs));
    }
    throw new Error("Timeout aguardando confirmação da transação");
  }
}

// Singleton export
export const stacksTxQueue = new StacksTransactionQueue(true, 1000, 120_000);

// Atalhos
export const enqueueRecordActions = (player: string, actions = 1) =>
  stacksTxQueue.add({ player, actions });

export const handleRecordActions = async (userAddress: string) => {
  // mantém a assinatura antiga; agora aguarda confirmação antes da próxima
  return enqueueRecordActions(userAddress, 1);
};
