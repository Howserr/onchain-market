var EscrowAgent = artifacts.require("./EscrowAgent.sol");

module.exports = function(deployer) {
    deployer.deploy(EscrowAgent);
};