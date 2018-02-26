pragma solidity ^0.4.17;

contract EscrowAgent {

    address owner;
    address arbiter;

    event Created(bytes32 escrowHash);
    event BuyerApproved(address approvedFrom);
    event SellerApproved(address approvedFrom);
    event PaidOut(address tranferedTo, uint value);

    struct Escrow {
        bool active;
        address seller;
        address buyer;
        uint balance;
        bool buyerApproved;
        bool sellerApproved;
    }
    mapping (bytes32 => Escrow) public escrows;

    function EscrowAgent() public {
        owner = msg.sender;
        arbiter = msg.sender;
    }

    function createEscrow(address seller, address buyer) payable external returns (bytes32 escrowHash) {
        escrowHash = keccak256(seller, buyer, msg.value, now);
        require(!escrows[escrowHash].active);
        escrows[escrowHash] = Escrow(true, seller, buyer, msg.value, false, false);
        Created(escrowHash);
        return escrowHash;
    }

    function approve(bytes32 escrowHash) public {
        Escrow storage escrow = escrows[escrowHash];
        require(escrow.active);
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller);

        if (msg.sender == escrow.buyer) {
            escrow.buyerApproved = true;
            BuyerApproved(msg.sender);
        } else if (msg.sender == escrow.seller) {
            escrow.sellerApproved = true;
            SellerApproved(msg.sender);
        }

        if (escrow.buyerApproved && escrow.sellerApproved) {
            payout(escrowHash);
        }
    }

    function payout(bytes32 escrowHash) private {
        Escrow storage escrow = escrows[escrowHash];
        require(escrow.active);
        escrow.seller.transfer(escrow.balance);
        PaidOut(escrow.seller, escrow.balance);
        escrow.balance = 0;
        escrow.active = false;
    }
}