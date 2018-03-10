App = {
	web3Provider: null,
	contracts: {},
	accounts: [],
	account: 0,
	listings: [],

	init: async function () {
		await App.initWeb3();
		$.getJSON('Marketplace.json').then(function (data) {
			let MarketplaceArtifact = data;
			App.contracts.Marketplace = TruffleContract(MarketplaceArtifact);

			// Set the provider for our contract
			App.contracts.Marketplace.setProvider(App.web3Provider);

			web3.eth.getAccounts(function (err, accounts) {
				if (err != null) {
					alert("There was an error fetching your accounts.");
					return;
				}
				App.accounts = accounts
				App.account = accounts[0]
			})

			App.updateListings();
		})
		App.bindEvents();
	},

	initWeb3: function () {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider;
		} else {
			// If no injected web3 instance is detected, fall back to Ganache
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
		}
		web3 = new Web3(App.web3Provider);
	},

	bindEvents: function () {
		//$(document).on('click', '.btn-adopt', App.handlePurchase);
	},

	waitAndRefresh: function (count) {
		if (App.listings.length < count) {
			console.log("sleeping");
			setTimeout(App.waitAndRefresh, 500, count)
		} else {
			let listingSection = document.getElementById("userListings")
			let res = "";
			for (let i = 0; i < count; i++) {
				let listing = App.listings[i]
				if(listing[0]) {
					res = res + "<tr>";
					res = res + "<td><a href='listing.html?listingIndex=" + listing[4] + "'>" + listing[2] + "</a></td>";
					res = res + "<td>" + web3.fromWei(listing[3], "ether") + " ETH" + "</td>";
					res = res + "</tr>";
				}
			}
			console.log("Refreshing auctions!");
			listingSection.innerHTML = res;
		}
	},

	getListing: function (listingIndex) {
		let marketplaceInstance;
		console.log("loading: " + listingIndex)
		App.contracts.Marketplace.deployed().then(function (instance) {
			marketplaceInstance = instance;
			return marketplaceInstance.getListingAtIndex.call(listingIndex)
		}).then(function (listingHash) {
			return marketplaceInstance.getListing.call(listingHash)
		}).then(function (listing) {
			console.log(listing)
			App.listings.push(listing)
		})
	},

	updateListings: function () {
		App.contracts.Marketplace.deployed().then(function (instance) {
			return instance.getListingCount.call()
		}).then(function (count) {
			console.log("Contract has this many listings " + count);

			if (count <= 0) {
				console.log("No listings found")
			}

			App.listings = []

			for (let i = 0; i < count; i++) {
				App.getListing(i);
			}

			App.waitAndRefresh(count);
		})
	},

	createListing: function () {
		let listingName = document.getElementById("listingName").value
		let listingPrice = web3.toWei(parseFloat(document.getElementById("listingPrice").value), "ether")
		console.log("Setting name to: " + listingName)
		console.log("Setting price to: " + listingPrice)

		App.contracts.Marketplace.deployed().then(function (instance) {
			return instance.addListing(listingName, listingPrice, {from: App.account})
		}).then(function (result) {
			console.log(result)
		})
	}
}

$(function () {
	$(window).on("load", function () {
		App.init();
	});
});