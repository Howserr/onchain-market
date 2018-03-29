const Marketplace = artifacts.require('./Marketplace.sol');
const EscrowAgentMock = artifacts.require('./EscrowAgentMock.sol');

contract('given a marketplace contract', function(accounts) {
    let marketplace;

    let seller = accounts[1];
    let buyer = accounts[2];

    beforeEach('setup a new contract', async function() {
        let escrowAgentMock = await EscrowAgentMock.new();
        marketplace = await Marketplace.new(escrowAgentMock.address)
    });

	describe('when a listing is created', async function() {
		let listingHash;

		beforeEach('create a couple of listings', async function() {
			await marketplace.addListing("item1", web3.toWei(0.01, "ether"), {from: seller});

			const transactionHash = await marketplace.addListing("item2", web3.toWei(0.02, "ether"), {from: seller});
			listingHash = transactionHash.logs[0].args.listingHash;
		});

		it('then set the listing mapped to the listing hash to exist', async function() {
			const result = await marketplace.getListing.call(listingHash);

			assert.isTrue(result[0]);
		});

		it('then set the mapped listing seller to the msg sender', async function() {
			const result = await marketplace.getListing.call(listingHash);

			assert.equal(result[1], seller);
		});

		it('then set the mapped listing name to the name specified', async function() {
			const result = await marketplace.getListing.call(listingHash);

			assert.equal(result[2], "item2");
		});

		it('then set the mapped listing price to the price specified', async function() {
			const result = await marketplace.getListing.call(listingHash);

			assert.equal(result[3], web3.toWei(0.02, "ether"));
		});

		it('then set the mapped listing index to the last in the listingIndex', async function() {
			const result = await marketplace.getListing.call(listingHash);

			assert.equal(result[4].toNumber(), 1);
		});

		it('then the escrowHash is set to the default zero address', async function() {
			const result = await marketplace.getListing.call(listingHash);

			assert.equal(result[5], 0x0000000000000000000000000000000000000000000000000000000000000000);
		});

		it('then the delivery information is an empty string', async function() {
			const result = await marketplace.getListing.call(listingHash);

			assert.equal(result[6], "");
		});
	})

	describe('when isListing is called', async function() {
		describe('for a listing that exists', async function() {
			beforeEach('create a listing', async function() {
				const transactionHash = await marketplace.addListing("item2", web3.toWei(0.02, "ether"), {from: seller});
				listingHash = transactionHash.logs[0].args.listingHash;
			});

			it('then return true', async function () {
				const result = await marketplace.isListing.call(listingHash, {from: buyer});

				assert.isTrue(result);
			})
		});

		describe('for a listing that does not exist', async function() {
			it('then return false', async function () {
				const result = await marketplace.isListing.call(listingHash, {from: buyer});

				assert.isFalse(result);
			})
		});
	});


})