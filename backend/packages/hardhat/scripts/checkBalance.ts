import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
  const address = "0x96f0a6e12d6233bD0f89C99D177eed3551dcCBE2";
  const balance = await provider.getBalance(address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 