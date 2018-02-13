pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/EscrowAgent.sol";

contract TestEscrowAgent {
    EscrowAgent escrowAgent = EscrowAgent(DeployedAddresses.EscrowAgent());

    function testEscrowIsMappedToTradeHash() public {
        bytes16 tradeID = 0x00000000000000000000000000000001;
        address seller = 0x9E50C1e69457AA96737552FceC6df300B00e759f;
        address buyer = 0xB6E791da14a75770695e05f9EBeC36cb55432885;
        uint value = 10;
        bytes32 tradeHash = keccak256(tradeID, seller, buyer, value);

        escrowAgent.createEscrow(tradeID, seller, buyer, value);
        var (returnedTradeID, returnedBuyer, returnedSeller, returnedValue, returnedBalance, returnedBuyerApproved, returnedSellerApproved) = escrowAgent.escrows(tradeHash);

        Assert.equal(returnedTradeID, tradeID, "tradeID should be 0x00000000000000000000000000000001");
        Assert.equal(returnedSeller, seller, "seller should be 0x9e50c1e69457aa96737552fcec6df300b00e759f");
        Assert.equal(returnedBuyer, buyer, "buyer should be 0xb6e791da14a75770695e05f9ebec36cb55432885");
        Assert.equal(returnedValue, value, "value should be 10");
        Assert.equal(returnedBalance, 0, "balance should be 0");
        Assert.equal(returnedBuyerApproved, false, "buyerApproved should be false");
        Assert.equal(returnedSellerApproved, false, "sellerApproved should be false");

    }
}