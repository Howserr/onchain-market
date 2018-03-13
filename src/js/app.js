App = {
	web3Provider: null,
	contracts: {},
	accounts: [],
	account: 0,

	init: async function () {
		await App.initWeb3();
		return $.getJSON('Marketplace.json').then(function (data) {
			App.contracts.Marketplace = TruffleContract(data);
			App.contracts.Marketplace.setProvider(App.web3Provider);
			return $.getJSON('EscrowAgent.json')
		}).then(function (data) {
			App.contracts.EscrowAgent = TruffleContract(data);
			App.contracts.EscrowAgent.setProvider(App.web3Provider);

			$("#right-column").load("rightPanel.html", function() {
				web3.eth.getAccounts(function (err, accounts) {
					if (err != null) {
						alert("There was an error fetching your accounts.");
						return
					}

					if (accounts.length === 0) {
						alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
						return
					}

					App.accounts = accounts;
					App.account = accounts[0];

					App.updateEthNetworkInfo()
				})
			});
		})
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

	setStatus: function (message, category) {
		let status = document.getElementById("statusMessage");
		status.innerHTML = message;

		let panel = $("#statusPanel");
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
	}
};

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}