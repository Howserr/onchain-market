var EscrowAgent = artifacts.require("./EscrowAgent.sol");
var Marketplace = artifacts.require("./Marketplace.sol");

module.exports = function (deployer) {
	deployer.then(function () {
        return deployer.deploy(EscrowAgent);
	}).then(function() {
		return deployer.deploy(Marketplace, EscrowAgent.address)
	});
};