App.listings = [];

App.waitAndRefresh = function (count) {
	if (App.listings.length < count) {
		console.log("sleeping");
		setTimeout(App.waitAndRefresh, 500, count);
	} else {
		let listingSection = document.getElementById("marketListings");
		let res = "";
		for (let i = 0; i < count; i++) {
			let listing = App.listings[i];
			if(listing[0]) {
				res = res + "<tr>";
				res = res + "<td><a href='listing.html?listingIndex=" + listing[4] + "'>" + listing[2] + "</a></td>";
				res = res + "<td>" + web3.fromWei(listing[3], "ether") + " ETH" + "</td>";
				res = res + "</tr>";
			}
		}
		console.log("Refreshing market listings!");
		listingSection.innerHTML = res;
	}
};

App.updateListings = function () {
	App.contracts.Marketplace.deployed().then(function (instance) {
		return instance.getListingCount.call();
	}).then(function (count) {
		console.log("Contract has this many listings " + count);
		if (count <= 0) {
			console.log("No listings found");
		}

		App.listings = [];

		for (let i = 0; i < count; i++) {
			App.getListing(i).then(function (listing) {
				App.listings.push(listing);
			})
		}
		App.waitAndRefresh(count);
	})
};

$(function () {
	$(window).on("load", function () {
		App.init().then(function () {
			App.updateListings();
		})
	});
});