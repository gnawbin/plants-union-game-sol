pragma solidity >=0.8.0 <0.9.0;
contract ProxyContract{
   uint256 public _counter;
  address public _owner;

  constructor(address owner_) {
       require(owner_!= address(0),"Zero address not allowed");

       _owner = owner_;
  }

   function incrementViaDelegateCall() external returns (uint256){
       (bool success, bytes memory data) = _owner.delegatecall(abi.encodeWithSignature("increment()"));
          require(success, "Delegatecall failed");
         return abi.decode(data, (uint256));
    }

  function updateLogicAddress(address owner_) external {
    require(owner_ != address(0), "Zero address not allowed");
     _owner = owner_;
  }
}