var Election = artifacts.require("./Election.sol");

contract("Election",(accounts) => {
	before(async () => {
		this.election = await Election.deployed()
	})

	it("initialises with two candidates", async () => {
		const candidatesCount = await this.election.candidatesCount()
		
		assert.equal(candidatesCount.toNumber(), 2)
	})

	it("initialises the candidates with the correct values", async () => {
		const candidate1 = await this.election.candidates(1)
		const candidate2 = await this.election.candidates(2)
		
		assert.equal(candidate1[0], 1, "contains the correct ID")
		assert.equal(candidate1[1], "Candidate 1", "contains the correct name")
		assert.equal(candidate1[2], 0, "contains the correct vote count")

		assert.equal(candidate2[0], 2, "contains the correct ID")
		assert.equal(candidate2[1], "Candidate 2", "contains the correct name")
		assert.equal(candidate2[2], 0, "contains the correct vote count")
	})
});
