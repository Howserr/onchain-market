pragma solidity ^0.4.19;

contract EscrowAgent {

    address owner;
    address arbitrator;

    event Created(bytes32 escrowHash);
    event BuyerApproved(bytes32 escrowHash, address approvedFrom);
    event SellerApproved(bytes32 escrowHash, address approvedFrom);
    event PaidOut(bytes32 escrowHash, address tranferedTo, uint value);
    event Disputed(bytes32 escrowHash, address disputedBy);
    event DisputeResolved(bytes32 escrowHash, address arbitratedBy, address awardedTo);

    struct Escrow {
        bool active;
        address seller;
        address buyer;
        uint balance;
        bool isBuyerApproved;
        bool isSellerApproved;
        bool isDisputed;
    }

    mapping (bytes32 => Escrow) public escrows;

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator);
        _;
    }

    function EscrowAgent() public {
        owner = msg.sender;
        arbitrator = msg.sender;
    }

    function createEscrow(address seller, address buyer) payable external returns (bytes32 escrowHash) {
        escrowHash = keccak256(seller, buyer, msg.value, now);
        require(!escrows[escrowHash].active);
        escrows[escrowHash] = Escrow(true, seller, buyer, msg.value, false, false, false);
        Created(escrowHash);
        return escrowHash;
    }

    function approve(bytes32 escrowHash) public {
        Escrow storage escrow = escrows[escrowHash];
        require(escrow.active);
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller);

        if (msg.sender == escrow.buyer) {
            escrow.isBuyerApproved = true;
            BuyerApproved(escrowHash, msg.sender);
        } else if (msg.sender == escrow.seller) {
            escrow.isSellerApproved = true;
            SellerApproved(escrowHash, msg.sender);
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

    function dispute(bytes32 escrowHash) public {
        Escrow storage escrow = escrows[escrowHash];
        require(escrow.active);
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller);
        escrow.isDisputed = true;
        Disputed(escrowHash, msg.sender);
    }

    function arbitrate(bytes32 escrowHash, address awardedTo) public onlyArbitrator {
        Escrow storage escrow = escrows[escrowHash];
        require(escrow.active);
        require(escrow.isDisputed);
        require(awardedTo == escrow.buyer || awardedTo == escrow.seller);
        awardedTo.transfer(escrow.balance);
        PaidOut(escrowHash, awardedTo, escrow.balance);
        DisputeResolved(escrowHash, msg.sender, awardedTo);
    }

    // TODO: Look at modifer methods to replace the regular require checks
}