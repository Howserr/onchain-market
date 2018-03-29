App.getEscrow = function (escrowHash) {
	return App.contracts.EscrowAgent.deployed().then(function (instance) {
		return instance.getEscrow.call(escrowHash)
	});
};

App.approveEscrow = function () {
	let listingIndex = getParameterByName("listingIndex");
	let escrowHash;
	App.setStatus("Approving escrow, please wait.", "warning");
	App.getListing(listingIndex).then(function (listing) {
		escrowHash = listing[5];
		return App.contracts.EscrowAgent.deployed()
	}).then(function (instance) {
		return instance.approve(escrowHash, {from: App.account})
	}).then(function (result) {
		console.log(result);
		App.setStatus("Escrow approved in transaction: " + result.tx);
	})
};

App.disputeEscrow = function () {
	let listingIndex = getParameterByName("listingIndex");
	let escrowHash;
	App.setStatus("Disputing escrow, please wait.", "warning");
	App.getListing(listingIndex).then(function (listing) {
		escrowHash = listing[5];
		return App.contracts.EscrowAgent.deployed()
	}).then(function (instance) {
		return instance.dispute(escrowHash, {from: App.account})
	}).then(function (result) {
		console.log(result);
		App.setStatus("Escrow disputed in transaction: " + result.tx);
	})
};