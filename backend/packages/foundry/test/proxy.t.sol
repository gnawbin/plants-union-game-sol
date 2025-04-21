pragma solidity >=0.8.0 <0.9.0;
import "forge-std/Test.sol";
import "../contracts/LogicContract.sol";
import "../contracts/ProxyContract.sol";
contract ProxyTest is Test{
    LogicContract logicContract;
    ProxyContract proxyContract;
    function setUp() public{
        //部署逻辑合约
        logicContract=new LogicContract();
        //部署代理合约并传入逻辑合约地址
        proxyContract=new ProxyContract(address(logicContract));
    }
    function testIncrementViaDelegateCall() public{
        //初始状态检查
        assertEq(proxyContract._counter(),0,"Proxy counter should start at 0");
        assertEq(logicContract._counter(),0,"Logic counter should start at 0");
        //通过代理合约调用 increment
        uint256 newValue=proxyContract.incrementViaDelegateCall();
        //验证返回值
        assertEq(newValue,1,"Return value should start at 0");
        //验证代理合约状态更新
        assertEq(proxyContract._counter(),1,"Proxy counter should bebe 1");
        //验证逻辑合约状态未变
         assertEq(logicContract._counter(),0,"Proxy counter should still be 0");
         //再次调用并验证
         newValue=proxyContract.incrementViaDelegateCall();
         assertEq(newValue,2,"Return value should  be 2");
         assertEq(proxyContract._counter(),2,"Proxy counter should  be 2");

         assertEq(logicContract._counter(),0,"Proxy counter should still be 0");
    }
    function testUpdateLogicAddress() public{
        //部署一个新的逻辑合约
        LogicContract newLogicContract=new LogicContract();
        address newLogicAddress=address(newLogicContract);
        //更新逻辑合约地址
        proxyContract.updateLogicAddress(newLogicAddress);
        //验证地址已更新
        assertEq(proxyContract._owner(),newLogicAddress,"Logic address should be updated");
        //调用increment 并验证仍能正常工作
        uint256 newValue=proxyContract.incrementViaDelegateCall();
        assertEq(newValue,1,"Return value should be 1 after address update");
        assertEq(proxyContract._counter(),1,"Proxy counter should be 1");
        
    }
    function testRevertWhenDelegateCallToZeroAddress() public{
        //设置零地址
        vm.expectRevert("Zero address not allowed");
        proxyContract.updateLogicAddress(address(0));
        proxyContract.incrementViaDelegateCall();
    }
    function test_RevertWhen_UpdateToZeroAddress() public {
     vm.expectRevert("Zero address not allowed");
   proxyContract.updateLogicAddress(address(0));
 }
    function testRevertWhenDeployWithZeroAddress() public{
        vm.expectRevert("Zero address not allowed");
        new ProxyContract(address(0));
    }
}