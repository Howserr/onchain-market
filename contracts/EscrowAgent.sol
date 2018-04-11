pragma solidity ^0.4.19;

contract EscrowAgent {

    address owner;
    address arbitrator;

    event CreatedEscrow(bytes32 escrowHash);
    event PaidOut(bytes32 escrowHash, address tranferedTo, uint value);
    event Disputed(bytes32 escrowHash, address disputedBy);

    struct Escrow {
        bool active;
        address seller;
        address buyer;
        uint balance;
        bool isBuyerApproved;
        bool isSellerApproved;
        bool isDisputed;
        uint index;
    }

    mapping (bytes32 => Escrow) private escrows;
    bytes32[] private escrowIndex;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator);
        _;
    }

    function EscrowAgent() public {
        owner = msg.sender;
        arbitrator = msg.sender;
    }

    function getBalance() external view onlyOwner returns (uint balance) {
        return this.balance;
    }

    function isEscrow(bytes32 escrowHash) public view returns (bool isIndeed) {
        if (escrowIndex.length == 0) {
            return false;
        }
        if (escrows[escrowHash].buyer == address(0)) {
            return false;
        }

        return (escrowIndex[escrows[escrowHash].index] == escrowHash);
    }

    function insertEscrow(bytes32 escrowHash, address seller, address buyer, uint balance) private returns (uint index) {
        require(!isEscrow(escrowHash));

        Escrow storage escrow = escrows[escrowHash];
        escrow.active = true;
        escrow.seller = seller;
        escrow.buyer = buyer;
        escrow.balance = balance;
        escrow.isBuyerApproved = false;
        escrow.isSellerApproved = false;
        escrow.isDisputed = false;
        escrow.index = escrowIndex.push(escrowHash) - 1;
        CreatedEscrow(escrowHash);
        return escrowIndex.length - 1;
    }

    function getEscrowAtIndex(uint index) external view returns (bytes32 escrowHash) {
        require(index < escrowIndex.length);
        return escrowIndex[index];
    }

    function getEscrow(bytes32 escrowHash) external view returns (bool active, address seller, address buyer, uint balance, bool isBuyerApproved, bool isSellerApproved, bool isDisputed, uint index) {
        require(isEscrow(escrowHash));
        Escrow storage escrow = escrows[escrowHash];
        return(escrow.active, escrow.seller, escrow.buyer, escrow.balance, escrow.isBuyerApproved, escrow.isSellerApproved, escrow.isDisputed, escrow.index);
    }

    function createEscrow(address seller, address buyer) payable external returns (bytes32 escrowHash) {
        escrowHash = keccak256(seller, buyer, msg.value, now);
        insertEscrow(escrowHash, seller, buyer, msg.value);
        return escrowHash;
    }

    function approve(bytes32 escrowHash) external {
        Escrow storage escrow = escrows[escrowHash];
        require(escrow.active);
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller);

        if (msg.sender == escrow.buyer) {
            escrow.isBuyerApproved = true;
        } else if (msg.sender == escrow.seller) {
            escrow.isSellerApproved = true;
        }

        if (escrow.isBuyerApproved && escrow.isSellerApproved) {
            payout(escrowHash);
        }
    }

    function payout(bytes32 escrowHash) private {
        Escrow storage escrow = escrows[escrowHash];
        require(escrow.active);
        escrow.seller.transfer(escrow.balance);
        PaidOut(escrowHash, escrow.seller, escrow.balance);
        escrow.balance = 0;
        escrow.active = false;
    }

    function dispute(bytes32 escrowHash) external {
        Escrow storage escrow = escrows[escrowHash];
        require(escrow.active);
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller);
        escrow.isDisputed = true;
        Disputed(escrowHash, msg.sender);
    }

    function arbitrate(bytes32 escrowHash, address awardedTo) external onlyArbitrator {
        Escrow storage escrow = escrows[escrowHash];
        require(escrow.active);
        require(escrow.isDisputed);
        require(awardedTo == escrow.buyer || awardedTo == escrow.seller);
        awardedTo.transfer(escrow.balance);
        PaidOut(escrowHash, awardedTo, escrow.balance);
        escrow.active = false;
    }
}