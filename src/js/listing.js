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
				console.log(escrow);

				if (App.account == listing[1] || App.account == escrow[2]) {
					$("#purchaseListing").hide();
					$("#deliveryInfo").show();
					document.getElementById("deliveryInfoText").value = listing[6];
					document.getElementById("deliveryInfoText").readonly = true;
				}

				$("#escrowForm").show();
				document.getElementById("escrowHash").value = listing[5];
				document.getElementById("escrowActive").value = escrow[0];
				document.getElementById("listingSeller").value = escrow[1];
				document.getElementById("listingBuyer").value = escrow[2];
				document.getElementById("escrowBalance").value = web3.fromWei(escrow[3], "ether") + " ETH";
				document.getElementById("buyerApproved").value = escrow[4];
				document.getElementById("sellerApproved").value = escrow[5];
				document.getElementById("escrowDisputed").value = escrow[6];

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
	$("#beginPurchase").hide();
};

$(function () {
	$(window).on("load", function () {
		App.init().then(function () {
			App.refreshListing();
		})
	});
});