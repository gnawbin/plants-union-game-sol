import { ConnectionType } from "./connection/ConnectionType";
import { MetaMask } from "./connection/MetaMask";
import { ethers } from "ethers";
import PlantsUnionABI from "./abis/PlantsUnion.json";

// TODO: 请将此地址替换为你在Sepolia部署的合约地址
const SEPOLIA_CONTRACT_ADDRESS = '0x64F956EbB112E1120232C7FE1B5589362912C4dd';

const walletDict = {
  [ConnectionType.INJECTED]: new MetaMask(),
};

export const getWallet = (type = ConnectionType.INJECTED) => {
  return walletDict[type];
};

export const getContract = async (address, abi, provider, account) => {
  const ethereum = new ethers.BrowserProvider(provider);
  const signer = await getSigner(ethereum, account)
  return account
    ? new ethers.Contract(address, abi, signer)
    : new ethers.Contract(address, abi, ethereum);
}

export const getSigner = async (provider, account) => {
  return await provider.getSigner(account);
}

export const getPlantsUnionContract = async (provider, account) => {
  return await getContract(SEPOLIA_CONTRACT_ADDRESS, PlantsUnionABI, provider, account);
}
