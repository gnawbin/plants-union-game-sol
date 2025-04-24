import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "PlantsUnion" using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployPlantsUnion: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("PlantsUnion", {
    from: deployer,
    // No constructor arguments needed as msg.sender is used in the contract
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying
  const plantsUnion = await hre.ethers.getContract<Contract>("PlantsUnion", deployer);
};

export default deployPlantsUnion;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags PlantsUnion
deployPlantsUnion.tags = ["PlantsUnion"]; 