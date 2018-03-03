pragma solidity ^0.4.17;

contract Marketplace {

    address owner;
    address escrowAgent;

    event Created(bytes32 listingHash);

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
        // How do we contact the escrow contract?
        // mark listing as inactive
        // create escrow with the funds sent to this method
        // return the created escrow hash
        // broadcast event to inform seller that item has been requested and escrow created/funded
    }
}