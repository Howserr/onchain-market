pragma solidity ^0.4.17;

contract Marketplace {

    address owner;
    address escrowAgent;

    event Created(bytes32 listingHash);
    event ListingPurchased(bytes32 listingHash);

    struct Listing {
        bool active;
        address seller;
        string name;
        uint price;
    }

    mapping (bytes32 => Listing) public listings;

    function Marketplace(address escrowAddress) public {
        owner = msg.sender;
        escrowAgent = escrowAddress;
    }

    function addListing(string name, uint price) public returns (bytes32 listingHash){
        listingHash = keccak256(msg.sender, name, price, now);
        require(!listings[listingHash].active);
        listings[listingHash] = Listing(true, msg.sender, name, price);
        Created(listingHash);
        return listingHash;
    }

    function purchaseListing(bytes32 listingHash) payable public returns (bytes32 escrowHash) {
        Listing storage listing = listings[listingHash];
        require(listing.active);
        require(msg.value == listing.price);
        escrowHash = escrowAgent.createEscrow.value(msg.value)(listing.seller, msg.sender);
        listing.active = false;
        ListingPurchased(listingHash);
        return escrowHash;
    }
}