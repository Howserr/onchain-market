pragma solidity ^0.4.19;

import "./EscrowAgent.sol";

contract MarketplaceAgent {

    address owner;
    address escrowAgentAddress;

    event CreatedListing(bytes32 listingHash);
    event ListingPurchased(bytes32 listingHash, string deliveryInformation);

    struct Listing {
        bool available;
        address seller;
        string name;
        uint price;
        uint index;
        bytes32 escrowHash;
        string deliveryInformation;
    }

    mapping (bytes32 => Listing) private listings;
    bytes32[] private listingIndex;

    mapping(address => uint[]) private listingsByUser;
    mapping(address => uint[]) private ordersByUser;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function MarketplaceAgent(address escrowAddress) public {
        owner = msg.sender;
        escrowAgentAddress = escrowAddress;
    }

    function setEscrowAgentAddress(address escrowAddress) public onlyOwner {
        escrowAgentAddress = escrowAddress;
    }

    function isListing(bytes32 listingHash) public view returns (bool) {
        if (listingIndex.length == 0) {
            return false;
        }

        if (listings[listingHash].seller == address(0)) {
            return false;
        }

        return (listingIndex[listings[listingHash].index] == listingHash);
    }

    function insertListing(bytes32 listingHash, address seller, string name, uint price) private returns (uint index) {
        require(!isListing(listingHash));

        Listing storage listing = listings[listingHash];
        listing.available = true;
        listing.seller = seller;
        listing.name = name;
        listing.price = price;
        listing.index = listingIndex.push(listingHash) - 1;
        CreatedListing(listingHash);

        listingsByUser[seller].push(listing.index);

        return listingIndex.length - 1;
    }

    function getListingAtIndex(uint index) public view returns (bytes32 listingHash) {
        require(index < listingIndex.length);
        return listingIndex[index];
    }

    function getListing(bytes32 listingHash) public view returns (bool, address, string, uint, uint, bytes32, string) {
        require(isListing(listingHash));
        Listing storage listing = listings[listingHash];
        return(listing.available, listing.seller, listing.name, listing.price, listing.index, listing.escrowHash, listing.deliveryInformation);
    }

    function getListingCount() public view returns (uint) {
        return listingIndex.length;
    }

    function getUserListingCount(address user) public view returns (uint) {
        return listingsByUser[user].length;
    }

    function getListingIndexForUserByIndex(address user, uint index) public view returns (uint) {
        require(index < listingsByUser[user].length);
        return listingsByUser[user][index];
    }

    function getUserOrderCount(address user) public view returns (uint) {
        return ordersByUser[user].length;
    }

    function getListingIndexForUserOrderByIndex(address user, uint index) public view returns (uint) {
        require(index < ordersByUser[user].length);
        return ordersByUser[user][index];
    }

    function addListing(string name, uint price) public returns (bytes32 listingHash){
        listingHash = keccak256(msg.sender, name, price, now);
        insertListing(listingHash, msg.sender, name, price);
        return listingHash;
    }

    function purchaseListing(bytes32 listingHash, string deliveryInformation) payable public returns (bytes32 escrowHash) {
        require(isListing(listingHash));
        Listing storage listing = listings[listingHash];
        require(msg.value == listing.price);
        EscrowAgent escrowAgent = EscrowAgent(escrowAgentAddress);
        escrowHash = escrowAgent.createEscrow.value(msg.value)(listing.seller, msg.sender);
        listing.escrowHash = escrowHash;
        listing.deliveryInformation = deliveryInformation;
        listing.available = false;
        ListingPurchased(listingHash, deliveryInformation);
        ordersByUser[msg.sender].push(listing.index);
        return escrowHash;
    }
}