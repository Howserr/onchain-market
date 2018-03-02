pragma solidity ^0.4.17;

contract Marketplace {

    address owner;

    event Created(bytes32 listingHash);

    struct Listing {
        bool active;
        address seller;
        string name;
        uint price;
    }

    mapping (bytes32 => Listing) public listings;

    function Marketplace() public {
        owner = msg.sender;
    }

    function addListing(string name, uint price) public returns (bytes32 listingHash){
        listingHash = keccak256(msg.sender, name, price, now);
        require(!listings[listingHash].active);
        listings[listingHash] = Listing(true, msg.sender, name, price);
        Created(listingHash);
        return listingHash;
    }
}