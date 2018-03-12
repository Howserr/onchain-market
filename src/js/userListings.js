App.userListings = [];

App.waitAndRefreshUser = function (count) {
	if (App.userListings.length < count) {
		console.log("sleeping");
		setTimeout(App.waitAndRefreshUser, 500, count)
	} else {
		let listingSection = document.getElementById("userListings");
		let res = "";
		for (let i = 0; i < count; i++) {
			let listing = App.userListings[i];
			res = res + "<tr>";
			res = res + "<td>" + listing[0] + "</td>";
			res = res + "<td><a href='listing.html?listingIndex=" + listing[4] + "'>" + listing[2] + "</a></td>";
			res = res + "<td>" + web3.fromWei(listing[3], "ether") + " ETH" + "</td>";
			res = res + "</tr>";
		}
		console.log("Refreshing user listings!");
		listingSection.innerHTML = res;
	}
};

App.updateUserListings = function () {
	let marketplaceInstance;
	App.contracts.Marketplace.deployed().then(function (instance) {
		marketplaceInstance = instance;
		return marketplaceInstance.getUserListingCount.call(App.account);
	}).then(function (count) {
		console.log("User has this many listings " + count);
		if (count <= 0) {
			console.log("No listings found for user")
		}

		App.userListings = [];

		for (let i = 0; i < count; i++) {
			marketplaceInstance.getListingIndexForUserByIndex.call(App.account, i).then(function (listingIndex) {
				return App.getListing(listingIndex)
			}).then(function (listing) {
				App.userListings.push(listing);
			})
		}
		App.waitAndRefreshUser(count);
	})
};

$(function () {
	$(window).on("load", function () {
		App.init().then(function () {
			App.updateUserListings();
		})
	});
});