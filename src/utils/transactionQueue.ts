import { ethers, NonceManager } from "ethers";

const CONTRACT_ADDRESS = "0xD4671fDc9BFb5fb056b13da714b370d6075f24bc";
const CONTRACT_ABI = [
  "function recordActions(uint256 gameId, address player, uint256 actions) external",
];

type TransactionTask = {
  hot: ethers.Wallet;
  mainAddr: string;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

class TransactionQueue {
  private queue: TransactionTask[] = [];
  private isProcessing = false;

  // 🔁 1 provider compartilhado
  private provider = new ethers.JsonRpcProvider(
    "https://rpc.sepolia-api.lisk.com"
  );

  // 🔒 1 NonceManager por wallet
  private signers = new Map<string, NonceManager>();

  constructor(private maxConcurrent = 3) {}

  async add(task: Omit<TransactionTask, "resolve" | "reject">): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...task, resolve, reject });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      const tasksToProcess = this.queue.splice(0, this.maxConcurrent);
      await Promise.all(tasksToProcess.map((task) => this.processTask(task)));
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) setTimeout(() => this.processNext(), 100);
    }
  }

  private async processTask(task: TransactionTask) {
    try {
      const result = await this.executeTransaction(task);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    }
  }

  private getSigner(hot: ethers.Wallet): NonceManager {
    const key = hot.address.toLowerCase();
    let s = this.signers.get(key);
    if (!s) {
      s = new NonceManager(hot.connect(this.provider));
      this.signers.set(key, s);
    }
    return s;
  }

  private async executeTransaction(task: TransactionTask) {
    const signer = this.getSigner(task.hot);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // estimate + pequena folga
    const baseGas = await contract.recordActions.estimateGas(0, task.mainAddr, 1);
    const gasLimit = (baseGas * 101n) / 100n;

    // deixe o provider preencher as fees (ou mantenha sua estratégia, mas SEM nonce)
    const feeData = await this.provider.getFeeData();
    const priorityFee = feeData.maxPriorityFeePerGas ?? 500_000_000n;

    // tentativa + retry se NONCE_EXPIRED
    const send = async () => {
      const tx = await contract.recordActions(0, task.mainAddr, 1, {
        gasLimit,
        maxPriorityFeePerGas: priorityFee,
        maxFeePerGas: feeData.maxFeePerGas ?? (priorityFee * 2n),
      });
      const receipt = await tx.wait(1);
      console.log(`Execute transaction hash=${tx.hash}`);
      return receipt;
    };

    try {
      return await send();
    } catch (e: any) {
      const msg = (e?.info?.error?.message || e?.message || "").toLowerCase();
      if (e?.code === "NONCE_EXPIRED" || msg.includes("nonce too low")) {
        // força recarregar nonce do chain e tenta 1x
        await signer.reset();
        return await send();
      }
      throw e;
    }
  }
}

export const transactionQueue = new TransactionQueue();
