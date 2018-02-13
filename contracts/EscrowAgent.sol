pragma solidity ^0.4.17;

contract EscrowAgent {

    address owner;
    address arbiter;

    struct Escrow {
        bytes16 tradeID;
        address seller;
        address buyer;
        uint value;
        uint balance;
        bool buyerApproved;
        bool sellerApproved;
    }
    mapping (bytes32 => Escrow) public escrows;

    function EscrowAgent() public {
        owner = msg.sender;
        arbiter = msg.sender;
    }

    function createEscrow(bytes16 tradeID, address seller, address buyer, uint value) public {
        bytes32 tradeHash = keccak256(tradeID, seller, buyer, value);
        escrows[tradeHash] = Escrow(tradeID, buyer, seller, value, 0, false, false);
    }
}