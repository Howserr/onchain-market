App = {
	web3Provider: null,
	contracts: {},
	accounts: [],
	account: 0,
	listings: [],
	userListings: [],

	init: async function () {
		await App.initWeb3();
		$.getJSON('Marketplace.json').then(function (data) {
			let MarketplaceArtifact = data;
			App.contracts.Marketplace = TruffleContract(MarketplaceArtifact)
			App.contracts.Marketplace.setProvider(App.web3Provider)

			return $.getJSON('EscrowAgent.json')
		}).then(function (data) {
			let EscrowAgentArtifact = data;
			App.contracts.EscrowAgent = TruffleContract(EscrowAgentArtifact)
			App.contracts.EscrowAgent.setProvider(App.web3Provider)

			$("#right-column").load("rightPanel.html", function() {
				web3.eth.getAccounts(function (err, accounts) {
					if (err != null) {
						alert("There was an error fetching your accounts.")
						return
					}

					if (accounts.length == 0) {
						alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
						return
					}

					App.accounts = accounts
					App.account = accounts[0]

					App.updateEthNetworkInfo()
				})
			})
			App.updateListings()
			App.updateUserListings()
			App.refreshListing()
		})
	},

	initWeb3: function () {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider;
		} else {
			// If no injected web3 instance is detected, fall back to Ganache
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
		}
		web3 = new Web3(App.web3Provider);
	},

	updateEthNetworkInfo: function() {
		let address = document.getElementById("address");
		address.innerHTML = App.account.toString();

		let ethBalance = document.getElementById("ethBalance");
		web3.eth.getBalance(App.account, function(err, bal) {
			ethBalance.innerHTML = web3.fromWei(bal, "ether") + " ETH";
		});


		let network = document.getElementById("network");
		web3.version.getNetwork(function(err, net) {
			let networkDisplay;

			if(net == 1) {
				networkDisplay = "Ethereum MainNet";
			} else if (net == 2) {
				networkDisplay = "Morden TestNet";
			} else if (net == 3) {
				networkDisplay = "Ropsten TestNet";
			} else {
				networkDisplay = net;
			}
			network.innerHTML = networkDisplay;
		});
	},

	waitAndRefresh: function (count) {
		if (App.listings.length < count) {
			console.log("sleeping");
			setTimeout(App.waitAndRefresh, 500, count)
		} else {
			let listingSection = document.getElementById("marketListings")
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
			console.log("Refreshing market listings!");
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
				App.getListing(i)
			}
			App.waitAndRefresh(count);
		})
	},

	waitAndRefreshUser: function (count) {
		if (App.userListings.length < count) {
			console.log("sleeping");
			setTimeout(App.waitAndRefreshUser, 500, count)
		} else {
			let listingSection = document.getElementById("userListings")
			let res = "";
			for (let i = 0; i < count; i++) {
				let listing = App.userListings[i]
				res = res + "<tr>"
				res = res + "<td>" + listing[0] + "</td>"
				res = res + "<td><a href='listing.html?listingIndex=" + listing[4] + "'>" + listing[2] + "</a></td>"
				res = res + "<td>" + web3.fromWei(listing[3], "ether") + " ETH" + "</td>"
				res = res + "</tr>"
			}
			console.log("Refreshing user listings!");
			listingSection.innerHTML = res;
		}
	},

	getUserListing: function (listingIndex) {
		let marketplaceInstance;
		console.log("loading: " + listingIndex)
		App.contracts.Marketplace.deployed().then(function (instance) {
			marketplaceInstance = instance;
			return marketplaceInstance.getListingAtIndex.call(listingIndex)
		}).then(function (listingHash) {
			return marketplaceInstance.getListing.call(listingHash)
		}).then(function (listing) {
			console.log(listing)
			App.userListings.push(listing)
		})
	},

	updateUserListings: function () {
		let marketplaceInstance
		App.contracts.Marketplace.deployed().then(function (instance) {
			marketplaceInstance = instance
			return marketplaceInstance.getUserListingCount.call(App.account)
		}).then(function (count) {
			console.log("User has this many listings " + count);
			if (count <= 0) {
				console.log("No listings found for user")
			}

			App.userListings = []

			for (let i = 0; i < count; i++) {
				marketplaceInstance.getListingIndexForUserByIndex.call(App.account, i).then(function (listingIndex) {
					App.getUserListing(listingIndex)
				})
			}
			App.waitAndRefreshUser(count);
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
	},

	refreshListing: function () {
		let marketplaceInstance
		let listingIndex = getParameterByName("listingIndex")
		let listingHash
		App.contracts.Marketplace.deployed().then(function (instance) {
			marketplaceInstance = instance;
			return marketplaceInstance.getListingAtIndex.call(parseInt(listingIndex))
		}).then(function (returnedListingHash) {
			listingHash = returnedListingHash
			return marketplaceInstance.getListing.call(listingHash)
		}).then(function (listing) {
			console.log(listing)
			$("#listingTitle").text(listing[2])
			let listingDetails = document.getElementById("listingDetails")
			let res = "";
			res = res + "<tr>";
			res = res + "<td>" + listing[0] + "</a></td>"
			res = res + "<td>" + listing[1] + "</a></td>"
			res = res + "<td>" + listing[2] + "</a></td>"
			res = res + "<td>" + web3.fromWei(listing[3], "ether") + " ETH" + "</td>";
			res = res + "</tr>";

			console.log("Refreshing listing");
			listingDetails.innerHTML = res;

			if (!listing[0] || App.account == listing[1]) {
				$("#purchaseListing").hide()
			}

			if (listing[5] != 0x0000000000000000000000000000000000000000000000000000000000000000) {
				App.contracts.EscrowAgent.deployed().then(function (instance) {
					return instance.getEscrow.call(listing[5])
				}).then(function (escrow) {
					console.log(escrow)

					$("#escrowTable").show()
					let escrowDetails = document.getElementById("escrowDetails")
					let res = "";
					res = res + "<tr>";
					res = res + "<td>" + listing[5] + "</a></td>"
					res = res + "<td>" + escrow[0] + "</a></td>"
					res = res + "<td>" + escrow[1] + "</a></td>"
					res = res + "<td>" + escrow[2] + "</a></td>"
					res = res + "<td>" + web3.fromWei(escrow[3], "ether") + " ETH" + "</a></td>"
					res = res + "<td>" + escrow[4] + "</a></td>"
					res = res + "<td>" + escrow[5] + "</a></td>"
					res = res + "<td>" + escrow[6] + "</a></td>"
					res = res + "</tr>";
					escrowDetails.innerHTML = res;

					// if escrow is active
					if (escrow[0]) {
						// if not isBuyerApproved
						if (!escrow[4] && App.account == escrow[2]) {
							$("#approveEscrow").show()
						}
						// if not isSellerApproved
						if (!escrow[5] && App.account == escrow[1]) {
							$("#approveEscrow").show()
						}
						if (!escrow[6]) {
							$("#disputeEscrow").show()
						}
					}
				})
			}
		})
	},

	purchaseListing: function () {
		let marketplaceInstance
		let listingIndex = getParameterByName("listingIndex")
		let listingHash
		App.contracts.Marketplace.deployed().then(function (instance) {
			marketplaceInstance = instance;
			return marketplaceInstance.getListingAtIndex.call(parseInt(listingIndex))
		}).then(function (returnedListingHash) {
			listingHash = returnedListingHash
			return marketplaceInstance.getListing.call(listingHash)
		}).then(function (listing) {
			return marketplaceInstance.purchaseListing(listingHash, {value: listing[3]})
		}).then(function (transactionHash) {
			console.log(transactionHash)
			App.refreshListing()
		})
	},

	approveEscrow: function () {
		let marketplaceInstance
		let listingIndex = getParameterByName("listingIndex")
		let listingHash
		let escrowHash
		App.contracts.Marketplace.deployed().then(function (instance) {
			marketplaceInstance = instance;
			return marketplaceInstance.getListingAtIndex.call(parseInt(listingIndex))
		}).then(function (returnedListingHash) {
			listingHash = returnedListingHash
			return marketplaceInstance.getListing.call(listingHash)
		}).then(function (listing) {
			escrowHash = listing[5]
			return App.contracts.EscrowAgent.deployed()
		}).then(function (instance) {
			instance.approve(escrowHash)
		}).then(function (transactionHash) {
			console.log(transactionHash)
			App.refreshListing()
		})
	},

	disputeEscrow: function () {
		let marketplaceInstance
		let listingIndex = getParameterByName("listingIndex")
		let listingHash
		let escrowHash
		App.contracts.Marketplace.deployed().then(function (instance) {
			marketplaceInstance = instance;
			return marketplaceInstance.getListingAtIndex.call(parseInt(listingIndex))
		}).then(function (returnedListingHash) {
			listingHash = returnedListingHash
			return marketplaceInstance.getListing.call(listingHash)
		}).then(function (listing) {
			escrowHash = listing[5]
			return App.contracts.EscrowAgent.deployed()
		}).then(function (instance) {
			instance.dispute(escrowHash, {from: App.account})
		}).then(function (transactionHash) {
			console.log(transactionHash)
			App.refreshListing()
		})
	},

	setStatus: function (message, category) {
		var status = document.getElementById("statusMessage");
		status.innerHTML = message;

		var panel = $("#statusPanel");
		panel.removeClass("panel-warning");
		panel.removeClass("panel-danger");
		panel.removeClass("panel-success");

		if (category === "warning") {
			panel.addClass("panel-warning");
		} else if (category === "error") {
			panel.addClass("panel-danger");
		} else {
			panel.addClass("panel-success");
		}
	},

	hideSpinner: function () {
		$("#spinner").hide();
	},

	showSpinner: function () {
		$("#spinner").show();
	}


}

$(function () {
	$(window).on("load", function () {
		App.init()
	});
});

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}