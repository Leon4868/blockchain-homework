import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { LOCAL_CHAIN_ID } from "./contract";

const LOCAL_NETWORK = {
  chainId: "0x7a69", // 31337
  chainName: "Hardhat Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["http://127.0.0.1:8545"],
};

export function useWallet() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");
  const hasWallet = typeof window !== "undefined" && Boolean(window.ethereum);

  const sync = useCallback(async () => {
    if (!window.ethereum) return;
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    setAccount(accounts[0] || "");
    const hex = await window.ethereum.request({ method: "eth_chainId" });
    setChainId(BigInt(hex));
  }, []);

  useEffect(() => {
    if (!hasWallet) return undefined;
    sync();
    // MetaMask 切换账户或网络后刷新本地状态，避免用过期的 signer 发交易。
    const onAccounts = (accounts) => setAccount(accounts[0] || "");
    const onChain = (hex) => setChainId(BigInt(hex));
    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged", onChain);
    };
  }, [hasWallet, sync]);

  const connect = useCallback(async () => {
    setError("");
    if (!window.ethereum) {
      setError("未检测到 MetaMask，请先安装浏览器扩展");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await sync();
    } catch (err) {
      setError(err.shortMessage || err.message);
    }
  }, [sync]);

  const switchToLocal = useCallback(async () => {
    setError("");
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: LOCAL_NETWORK.chainId }],
      });
    } catch (err) {
      // 4902：钱包里还没有这条网络，先添加再切换。
      if (err.code === 4902) {
        await window.ethereum.request({ method: "wallet_addEthereumChain", params: [LOCAL_NETWORK] });
      } else {
        setError(err.shortMessage || err.message);
      }
    }
  }, []);

  const getSigner = useCallback(async () => {
    if (!window.ethereum) throw new Error("未检测到钱包");
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner();
  }, []);

  return {
    hasWallet,
    account,
    chainId,
    error,
    isLocalChain: chainId === LOCAL_CHAIN_ID,
    connect,
    switchToLocal,
    getSigner,
  };
}
