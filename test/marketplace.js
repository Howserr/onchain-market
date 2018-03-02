const Marketplace = artifacts.require('./Marketplace.sol')

contract('given a marketplace contract', function(accounts) {
    let marketplace

    let seller = accounts[1]
    let buyer = accounts[2]

    beforeEach('setup a new contract', async function() {
        marketplace = await Marketplace.new()
    })

    describe('when a listing is created', async function() {
        let listingHash

        beforeEach('create a listing', async function() {
            const transactionHash = await marketplace.addListing("item", 0.01, {from: seller})
            listingHash = transactionHash.logs[0].args.listingHash
        })

        describe('that is valid', async function() {
            it('then emit event with the listing hash', async function() {
                assert.isDefined(listingHash)
            })
        })
    })
})