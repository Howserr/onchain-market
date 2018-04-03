var EscrowAgent = artifacts.require("./EscrowAgent.sol");
var MarketplaceAgent = artifacts.require("./MarketplaceAgent.sol");

module.exports = function (deployer) {
	deployer.then(function () {
        return deployer.deploy(EscrowAgent);
	}).then(function() {
		return deployer.deploy(MarketplaceAgent, EscrowAgent.address)
	});
};