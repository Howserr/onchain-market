App.getEscrow = function (escrowHash) {
	return App.contracts.EscrowAgent.deployed().then(function (instance) {
		return instance.getEscrow.call(escrowHash)
	});
};

App.approveEscrow = function () {
	let listingIndex = getParameterByName("listingIndex");
	let escrowHash;

	App.getListing(listingIndex).then(function (listing) {
		escrowHash = listing[5];
		return App.contracts.EscrowAgent.deployed()
	}).then(function (instance) {
		instance.approve(escrowHash)
	}).then(function (transactionHash) {
		console.log(transactionHash)
	})
};

App.disputeEscrow = function () {
	let listingIndex = getParameterByName("listingIndex");
	let escrowHash;

	App.getListing(listingIndex).then(function (listing) {
		escrowHash = listing[5];
		return App.contracts.EscrowAgent.deployed()
	}).then(function (instance) {
		instance.dispute(escrowHash, {from: App.account})
	}).then(function (transactionHash) {
		console.log(transactionHash)
	})
};