App.userOrders = [];

App.waitAndRefreshUser = function (count) {
	if (App.userOrders.length < count) {
		console.log("sleeping");
		setTimeout(App.waitAndRefreshUser, 500, count)
	} else {
		let listingSection = document.getElementById("userOrders");
		let res = "";
		for (let i = 0; i < count; i++) {
			let listing = App.userOrders[i];
			res = res + "<tr>";
			res = res + "<td>" + listing[0] + "</td>";
			res = res + "<td><a href='listing.html?listingIndex=" + listing[4] + "'>" + listing[2] + "</a></td>";
			res = res + "<td>" + web3.fromWei(listing[3], "ether") + " ETH" + "</td>";
			res = res + "</tr>";
		}
		console.log("Refreshing user orders!");
		listingSection.innerHTML = res;
	}
};

App.updateUserOrders = function () {
	let marketplaceInstance;
	App.contracts.Marketplace.deployed().then(function (instance) {
		marketplaceInstance = instance;
		return marketplaceInstance.getUserOrderCount.call(App.account);
	}).then(function (count) {
		console.log("User has this many orders " + count);
		if (count <= 0) {
			console.log("No orders found for user")
		}

		App.userOrders = [];

		for (let i = 0; i < count; i++) {
			marketplaceInstance.getListingIndexForUserOrderByIndex.call(App.account, i).then(function (listingIndex) {
				return App.getListing(listingIndex)
			}).then(function (listing) {
				App.userOrders.push(listing);
			})
		}
		App.waitAndRefreshUser(count);
	})
};

$(function () {
	$(window).on("load", function () {
		App.init().then(function () {
			App.updateUserOrders();
		})
	});
});