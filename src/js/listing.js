App.listing = {};

App.refreshListing = function () {
	let listingIndex = getParameterByName("listingIndex");

	App.getListing(listingIndex).then(function (listing) {
		App.listing = listing;
		console.log(listing);
		$("#listingTitle").text(listing[2]);
		let listingDetails = document.getElementById("listingDetails");
		let res = "";
		res = res + "<tr>";
		res = res + "<td>" + listing[0] + "</a></td>";
		res = res + "<td>" + listing[1] + "</a></td>";
		res = res + "<td>" + listing[2] + "</a></td>";
		res = res + "<td>" + web3.fromWei(listing[3], "ether") + " ETH" + "</td>";
		res = res + "</tr>";

		console.log("Refreshing listing");
		listingDetails.innerHTML = res;

		if (!listing[0] || App.account == listing[1]) {
			$("#beginPurchase").hide()
		}

		if (listing[5] != 0x0000000000000000000000000000000000000000000000000000000000000000) {
			App.contracts.EscrowAgent.deployed().then(function (instance) {
				return instance.getEscrow.call(listing[5])
			}).then(function (escrow) {
				console.log(escrow)

				$("#escrowTable").show();
				let escrowDetails = document.getElementById("escrowDetails");
				let res = "";
				res = res + "<tr>";
				res = res + "<td>" + listing[5] + "</a></td>";
				res = res + "<td>" + escrow[0] + "</a></td>";
				res = res + "<td>" + escrow[1] + "</a></td>";
				res = res + "<td>" + escrow[2] + "</a></td>";
				res = res + "<td>" + web3.fromWei(escrow[3], "ether") + " ETH" + "</a></td>";
				res = res + "<td>" + escrow[4] + "</a></td>";
				res = res + "<td>" + escrow[5] + "</a></td>";
				res = res + "<td>" + escrow[6] + "</a></td>";
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
};

App.beginPurchase = function () {
	$("#deliveryInfo").show();
};

$(function () {
	$(window).on("load", function () {
		App.init().then(function () {
			App.refreshListing();
		})
	});
});