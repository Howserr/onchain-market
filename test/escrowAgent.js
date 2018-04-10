const EscrowAgent = artifacts.require('./EscrowAgent.sol');

contract('given an escrow agent contract', function (accounts) {
	let escrowAgent;

	let arbitrator = accounts[0];
	let seller = accounts[1];
	let buyer = accounts[2];

	beforeEach('setup a new contract', async function () {
		escrowAgent = await EscrowAgent.new();
	});

	describe('when an escrow is created', async function () {
		let escrowHash;

		beforeEach('create an escrow', async function () {
			await escrowAgent.createEscrow(seller, buyer, {
				from: buyer,
				value: web3.toWei(0.02, "ether")
			});

			const transactionHash = await escrowAgent.createEscrow(seller, buyer, {
				from: buyer,
				value: web3.toWei(0.01, "ether")
			});
			escrowHash = transactionHash.logs[0].args.escrowHash;
		});

		it('then emit event with the escrow hash', async function () {
			assert.isDefined(escrowHash);
		});

		it('then set the escrow mapped to the escrow hash to exist', async function () {
			const result = await escrowAgent.getEscrow.call(escrowHash);

			assert.isTrue(result[0]);
		});

		it('then set the mapped escrow balance to the value sent', async function () {
			const result = await escrowAgent.getEscrow.call(escrowHash);

			assert.equal(result[3], web3.toWei(0.01, "ether"));
		});

		it('then set the mapped escrow seller to the seller specified', async function () {
			const result = await escrowAgent.getEscrow.call(escrowHash);

			assert.equal(result[1], seller);
		});

		it('then set the mapped escrow buyer to the buyer specified', async function () {
			const result = await escrowAgent.getEscrow.call(escrowHash);

			assert.equal(result[2], buyer);
		});

		it('then set the mapped escrow buyerApproved and sellerApproved to false', async function () {
			const result = await escrowAgent.getEscrow.call(escrowHash);

			assert.isFalse(result[4]);
			assert.isFalse(result[5]);
		});

		it('then set the mapped escrow isDisputed to false', async function () {
			const result = await escrowAgent.getEscrow.call(escrowHash);

			assert.isFalse(result[6]);
		});

		it('then set the mapped escrow index correctly', async function () {
			const result = await escrowAgent.getEscrow.call(escrowHash);

			assert.equal(result[7].toNumber(), 1);
		});
	});

	describe('when isEscrow is called', async function () {
		describe('for an escrow that does not exist', async function () {
			beforeEach('create an escrow', async function () {
				const transactionHash = await escrowAgent.createEscrow(seller, buyer, {
					from: buyer,
					value: web3.toWei(0.01, "ether")
				});
				escrowHash = transactionHash.logs[0].args.escrowHash;
			});

			it('then return false', async function () {
				const result = await escrowAgent.isEscrow.call(0, {from: buyer});

				assert.isFalse(result);
			})
		});

		describe('for an escrow that exists', async function () {
			let escrowHash;

			beforeEach('create an escrow', async function () {
				const transactionHash = await escrowAgent.createEscrow(seller, buyer, {
					from: buyer,
					value: web3.toWei(0.01, "ether")
				});
				escrowHash = transactionHash.logs[0].args.escrowHash;
			});

			it('then return true', async function () {
				const result = await escrowAgent.isEscrow.call(escrowHash, {from: buyer});

				assert.isTrue(result);
			})
		});
	});

	describe('when an escrow is approved', function () {
		describe('that does not exist', function () {
			it('then it should throw', async function () {
				try {
					await escrowAgent.approve(0x0000000000000000000000000000000000000000000000000000000000000000, {from: accounts[5]})
				} catch (error) {
					assert.equal(error.name, "StatusError")
				}
			})
		});

		describe('that exists', function () {
			let escrowHash;

			beforeEach('create an escrow', async function () {
				const transactionHash = await escrowAgent.createEscrow(seller, buyer, {
					from: buyer,
					value: web3.toWei(0.01, "ether")
				})
				escrowHash = transactionHash.logs[0].args.escrowHash
			})

			describe('by the buyer', function () {
				it('then set buyerApproved to true', async function () {
					escrowAgent.approve(escrowHash, {from: buyer})
					const result = await escrowAgent.getEscrow.call(escrowHash)

					assert.isTrue(result[4])
				})

				it('then emit BuyerApproved event', async function () {
					let transactionHash = await escrowAgent.approve(escrowHash, {from: buyer})

					assert.equal(transactionHash.logs[0].event, "BuyerApproved")
				})

				it('then emit BuyerApproved event with the escrow hash', async function () {
					let transactionHash = await escrowAgent.approve(escrowHash, {from: buyer})

					assert.equal(escrowHash, transactionHash.logs[0].args.escrowHash)
				})

				it('then emit BuyerApproved event with the buyers address', async function () {
					let transactionHash = await escrowAgent.approve(escrowHash, {from: buyer})
					let approvalAddress = transactionHash.logs[0].args.approvedFrom

					const escrow = await escrowAgent.getEscrow.call(escrowHash)
					assert.equal(approvalAddress, escrow[2])
				})
			})

			describe('by the seller', function () {
				it('then set sellerApproved to true', async function () {
					escrowAgent.approve(escrowHash, {from: seller})
					const result = await escrowAgent.getEscrow.call(escrowHash)

					assert.isTrue(result[5])
				})

				it('then emit SellerApproved event', async function () {
					let transactionHash = await escrowAgent.approve(escrowHash, {from: seller})

					assert.equal(transactionHash.logs[0].event, "SellerApproved")
				})

				it('then emit SellerApproved event with the escrow hash', async function () {
					let transactionHash = await escrowAgent.approve(escrowHash, {from: seller})

					assert.equal(escrowHash, transactionHash.logs[0].args.escrowHash)
				})

				it('then emit SellerApproved event with the sellers address', async function () {
					let transactionHash = await escrowAgent.approve(escrowHash, {from: seller})
					let approvalAddress = transactionHash.logs[0].args.approvedFrom

					const escrow = await escrowAgent.getEscrow.call(escrowHash)
					assert.equal(approvalAddress, escrow[1])
				})
			})

			describe('by an invalid address', function () {
				it('then it should throw', async function () {
					try {
						await escrowAgent.approve(escrowHash, {from: accounts[3]})
					} catch (error) {
						assert.equal(error.name, "StatusError")
					}
				})

				it('then approval states should be unchanged', async function () {
					const escrow = await escrowAgent.getEscrow.call(escrowHash)
					try {
						await escrowAgent.approve(escrowHash, {from: accounts[3]})
					} catch (error) {
					}

					const result = await escrowAgent.getEscrow.call(escrowHash)
					assert.equal(result[4], escrow[4])
					assert.equal(result[5], escrow[5])
				})
			})

			describe('and both buyer and seller have now approved', function () {
				beforeEach('approve from both buyer and seller', async function () {
					await escrowAgent.approve(escrowHash, {from: seller})
					await escrowAgent.approve(escrowHash, {from: buyer})
				})

				it('then the escrow should be paid out to the seller', async function () {
					let result
					return escrowAgent.allEvents().get(function (err, events) {
						result = events.filter(entry => entry.event == "PaidOut")
						assert.equal(result[0].args.tranferedTo, seller)
					})
				})

				it('then the balance of the contract should be paid out', async function () {
					let result
					return escrowAgent.allEvents().get(function (err, events) {
						result = events.filter(entry => entry.event == "PaidOut")
						assert.equal(result[0].args.value, web3.toWei(0.01, "ether"))
					})
				})
			})
		});
	});

	describe('when an escrow is disputed', function () {
		describe('that does not exist', function () {
			let escrowHash;

			beforeEach('create an escrow', async function () {
				const transactionHash = await escrowAgent.createEscrow(seller, buyer, {
					from: buyer,
					value: web3.toWei(0.01, "ether")
				})
				escrowHash = transactionHash.logs[0].args.escrowHash
			});

			it('then it should throw', async function () {
				try {
					await escrowAgent.dispute(0x0000000000000000000000000000000000000000000000000000000000000000, {from: accounts[5]})
				} catch (error) {
					assert.equal(error.name, "StatusError")
				}
			})
		})

		describe('that exists', function () {
			let escrowHash;

			beforeEach('create an escrow', async function () {
				const transactionHash = await escrowAgent.createEscrow(seller, buyer, {
					from: buyer,
					value: web3.toWei(0.01, "ether")
				})
				escrowHash = transactionHash.logs[0].args.escrowHash
			});

			describe('by the buyer or seller', function () {
				it('then emit event with the escrow hash', async function () {
					let transactionHash = await escrowAgent.dispute(escrowHash, {from: buyer})

					assert.equal(transactionHash.logs[0].args.escrowHash, escrowHash)
				})

				it('then emit event with the address of the disputer', async function () {
					let transactionHash = await escrowAgent.dispute(escrowHash, {from: buyer})

					assert.equal(transactionHash.logs[0].args.disputedBy, buyer)
				})

				it('then set isDisputed to true', async function () {
					await escrowAgent.dispute(escrowHash, {from: buyer})

					const escrow = await escrowAgent.getEscrow.call(escrowHash)
					assert.isTrue(escrow[6])
				})
			});

			describe('by an unauthorized address', function () {
				it('then it should error', async function () {
					try {
						await escrowAgent.dispute(escrowHash, {from: accounts[5]})
					} catch (error) {
						assert.equal(error.name, "StatusError")
					}
				})

				it('then isDisputed should still be false', async function () {
					try {
						await escrowAgent.dispute(escrowHash, {from: accounts[5]})
					} catch (error) {
					}

					const escrow = await escrowAgent.getEscrow.call(escrowHash)
					assert.isFalse(escrow[6])
				})
			})
		})
	});

	describe('when getEscrowAtIndex is called', async function () {

		it('then it throws if the index is higher than the length of the index', async function () {
			try {
				await escrowAgent.getEscrowAtIndex.call(0);
			} catch (error) {
				assert.equal(error.name, "Error")
			}
		})

		it('then it returns the escrow hash for a valid index', async function () {
			let escrowHash;

			const transactionHash = await escrowAgent.createEscrow(seller, buyer, {
				from: buyer,
				value: web3.toWei(0.01, "ether")
			})
			escrowHash = transactionHash.logs[0].args.escrowHash

			const result = await escrowAgent.getEscrowAtIndex.call(0);

			assert.equal(result, escrowHash);
		})
	});

	describe('when getEscrow is called', async function () {
		describe('for an escrow hash that does not exist', async function () {
			it('then it should throw', async function () {
				try {
					await escrowAgent.getEscrow.call(0x0000000000000000000000000000000000000000000000000000000000000000);
				} catch (error) {
					assert.equal(error.name, "Error")
				}
			})
		});

		describe('for an escrow that exists', async function () {
			let escrowHash;

			beforeEach('create an escrow', async function () {
				await escrowAgent.createEscrow(seller, buyer, {
					from: buyer,
					value: web3.toWei(0.02, "ether")
				});

				const transactionHash = await escrowAgent.createEscrow(seller, buyer, {
					from: buyer,
					value: web3.toWei(0.01, "ether")
				});
				escrowHash = transactionHash.logs[0].args.escrowHash;
			});

			it('then it returns the correct active status', async function () {
				const result = await escrowAgent.getEscrow.call(escrowHash);

				assert.isTrue(result[0])
			});

			it('then it returns the correct seller', async function () {
				const result = await escrowAgent.getEscrow.call(escrowHash);

				assert.equal(result[1], seller);
			});

			it('then it returns the correct buyer', async function () {
				const result = await escrowAgent.getEscrow.call(escrowHash);

				assert.equal(result[2], buyer);
			});

			it('then it returns the correct balance', async function () {
				const result = await escrowAgent.getEscrow.call(escrowHash);

				assert.equal(result[3].toNumber(), web3.toWei(0.01, "ether"));
			});

			it('then it returns the correct buyer approved status', async function () {
				const result = await escrowAgent.getEscrow.call(escrowHash);

				assert.isFalse(result[4]);
			})

			it('then it returns the correct seller approved status', async function () {
				const result = await escrowAgent.getEscrow.call(escrowHash);

				assert.isFalse(result[5]);
			})

			it('then it returns the correct disputed status', async function () {
				const result = await escrowAgent.getEscrow.call(escrowHash);

				assert.isFalse(result[6]);
			})

			it('then it returns the correct index', async function () {
				const result = await escrowAgent.getEscrow.call(escrowHash);

				assert.equal(result[7].toNumber(), 1);
			})
		});
	});

	describe('when an escrow is arbitrated', async function () {
		describe('that does not exist', async function () {
			it('then it should throw', async function () {
				try {
					await escrowAgent.arbitrate(0x0000000000000000000000000000000000000000000000000000000000000000, seller, {from: accounts[0]});
				} catch (error) {
					assert.equal(error.name, "StatusError")
				}
			})
		});

		describe('that exists', async function () {
			let escrowHash;

			beforeEach('create an escrow', async function () {
				const transactionHash = await escrowAgent.createEscrow(seller, buyer, {
					from: buyer,
					value: web3.toWei(0.01, "ether")
				});
				escrowHash = transactionHash.logs[0].args.escrowHash
			});

			describe('but it is not disputed', async function () {
				it('then it should throw', async function () {
					try {
						await escrowAgent.arbitrate(escrowHash, seller, {from: arbitrator});
					} catch (error) {
						assert.equal(error.name, "StatusError")
					}
				})
			});

			describe('that is disputed', async function () {
				beforeEach('dispute the escrow', async function () {
					await escrowAgent.dispute(escrowHash, {from: seller});
				});

				describe('with a invalid awardedTo address', async function () {
					it('then it should throw', async function () {
						try {
							await escrowAgent.arbitrate(escrowHash, accounts[5], {from: arbitrator});
						} catch (error) {
							assert.equal(error.name, "StatusError")
						}
					})
				})

				describe('with a valid awardedTo address', async function () {
					it('then it is paid out from the contract balance', async function () {
						let initialBalance = await escrowAgent.getBalance.call({from: accounts[0]});

						await escrowAgent.arbitrate(escrowHash, seller, {from: arbitrator});

						const result = await escrowAgent.getEscrow.call(escrowHash);

						let finalBalance = await escrowAgent.getBalance.call({from: accounts[0]});

						assert.equal(finalBalance.toNumber(), initialBalance.toNumber() - web3.toWei(0.01, "ether"));
					});

					it('then is paid out to the correct address', async function () {
						let initialBalance = await web3.fromWei(web3.eth.getBalance(seller));

						await escrowAgent.arbitrate(escrowHash, seller, {from: arbitrator});

						const result = await escrowAgent.getEscrow.call(escrowHash);

						let finalBalance = await web3.fromWei(web3.eth.getBalance(seller));

						let expectedBalance = initialBalance.toNumber() + 0.01;

						assert.equal(finalBalance.toNumber().toFixed(2), expectedBalance.toFixed(2));
					});

					it('then a PaidOut event is emitted', async function () {
						let transactionHash = await escrowAgent.arbitrate(escrowHash, seller, {from: arbitrator})

						assert.equal(transactionHash.logs[0].event, "PaidOut")
					});

					it('then a DisputeResolved event is emitted', async function () {
						let transactionHash = await escrowAgent.arbitrate(escrowHash, seller, {from: arbitrator})

						assert.equal(transactionHash.logs[1].event, "DisputeResolved")
					});
				});
			})
		})
	})
})