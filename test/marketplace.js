const Marketplace = artifacts.require('./Marketplace.sol')
const EscrowAgentMock = artifacts.require('./EscrowAgentMock.sol')

contract('given a marketplace contract', function(accounts) {
    let marketplace

    let seller = accounts[1]
    let buyer = accounts[2]

    beforeEach('setup a new contract', async function() {
        let escrowAgentMock = await EscrowAgentMock.new()
        marketplace = await Marketplace.new(escrowAgentMock.address)
    })

    describe('whdqwh', function() {
        it('gasd', async function() {
            const result = await marketplace.getListingCount.call()

            assert.equal(result, 100)
        })
    })

    // describe('when a listing is created', async function() {
    //     let listingHash
    //
    //     beforeEach('create a listing', async function() {
    //         const transactionHash = await marketplace.addListing("item", web3.toWei(0.01, "ether"), {from: seller})
    //         listingHash = transactionHash.logs[0].args.listingHash
    //     })
    //
    //     describe('that is valid', async function() {
    //         it('then emit event with the listing hash', async function() {
    //             assert.isDefined(listingHash)
    //         })
    //
    //         it('then set the listing mapped to the listing hash to exist', async function() {
    //             const result = await marketplace.listings.call(listingHash)
    //
    //             assert.isTrue(result[0])
    //         })
    //
    //         it('then set the mapped listing seller to the msg sender', async function() {
    //             const result = await marketplace.listings.call(listingHash)
    //
    //             assert.equal(result[1], seller)
    //         })
    //
    //         it('then set the mapped listing name to the name specified', async function() {
    //             const result = await marketplace.listings.call(listingHash)
    //
    //             assert.equal(result[2], "item")
    //         })
    //
    //         it('then set the mapped listing price to the price specified', async function() {
    //             const result = await marketplace.listings.call(listingHash)
    //
    //             assert.equal(result[3], web3.toWei(0.01, "ether"))
    //         })
    //     })
    // })
})