var EscrowAgent = artifacts.require("./EscrowAgent.sol");
var Marketplace = artifacts.require("./Marketplace.sol");

module.exports = function(deployer) {
    deployer.deploy(EscrowAgent);
    deployer.deploy(Marketplace, EscrowAgent.address);
};