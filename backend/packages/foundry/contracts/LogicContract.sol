pragma solidity >=0.8.0 <0.9.0;
contract LogicContract{
    uint256 public _counter; //计数
    function  increment() external returns (uint256){
        _counter=_counter+1;
        return _counter;
    }

}