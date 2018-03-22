App.getListing = function (listingIndex) {
	let marketplaceInstance;
	return App.contracts.Marketplace.deployed().then(function (instance) {
		marketplaceInstance = instance;
		return marketplaceInstance.getListingAtIndex.call(listingIndex)
	}).then(function (listingHash) {
		return marketplaceInstance.getListing.call(listingHash)
	})
};

App.purchaseListing = function () {
	let marketplaceInstance;
	let listingIndex = getParameterByName("listingIndex");
	let listingHash;
	let addressInfo = document.getElementById("deliveryInfoText").value
	console.log(addressInfo);
	App.setStatus("Purchasing listing, please wait.", "warning");
	App.contracts.Marketplace.deployed().then(function (instance) {
		marketplaceInstance = instance;
		return marketplaceInstance.getListingAtIndex.call(parseInt(listingIndex));
	}).then(function (returnedListingHash) {
		listingHash = returnedListingHash;
		return marketplaceInstance.getListing.call(listingHash);
	}).then(function (listing) {
		return marketplaceInstance.purchaseListing(listingHash, addressInfo, {value: listing[3]});
	}).then(function (result) {
		console.log(result);
		App.setStatus("Listing purchased in transaction: " + result.tx);
	})
};

App.createListing = function () {
	let listingName = document.getElementById("listingName").value;
	let listingPrice = web3.toWei(parseFloat(document.getElementById("listingPrice").value), "ether");
	console.log("Setting name to: " + listingName);
	console.log("Setting price to: " + listingPrice);
	App.setStatus("Creating listing, please wait.", "warning");
	App.contracts.Marketplace.deployed().then(function (instance) {
		return instance.addListing(listingName, listingPrice, {from: App.account});
	}).then(function (result) {
		console.log(result);
		App.setStatus("Listing created in transaction: " + result.tx);
	})
};