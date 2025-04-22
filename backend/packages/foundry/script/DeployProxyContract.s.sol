pragma solidity >=0.8.0 <0.9.0;
import "./DeployHelpers.s.sol";
import "../contracts/ProxyContract.sol";
import "../contracts/LogicContract.sol";
contract DeployProxyContract is ScaffoldETHDeploy {

      function run() external ScaffoldEthDeployerRunner {
        new LogicContract();
        new ProxyContract(deployer);
    }
}