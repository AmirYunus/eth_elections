App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	hasVoted: false,

	init: function() {
		return App.initWeb3();
	},

	initWeb3: async () => {
		if (typeof web3 !== "undefined") {
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
			web3 = new Web3(App.web3Provider);
		}
		await App.loadAccount()
		await App.loadContract()
		await App.render()
	},

	loadAccount: async () => {
		web3.eth.getAccounts(function(error, account) {
			if (error === null) {
				App.account = account[0];
				$("#accountAddress").html("Your Account: " + account[0]);
			}
		});
	},
	loadContract: async () => {
		// Create a JavaScript version of the smart contract
		const election = await $.getJSON("Election.json")
		App.contracts.Election = TruffleContract(election)
		App.contracts.Election.setProvider(App.web3Provider)
	
		// Hydrate the smart contract with values from the blockchain
		App.election = await App.contracts.Election.deployed()
	},

	// Listen for events emitted from the contract
	listenForEvents: function() {
		App.contracts.Election.deployed().then(function(instance) {
			instance.votedEvent({}, {
				fromBlock: 0,
				toBlock: 'latest'
			}).watch(function(error, event) {
				console.log("event triggered", event)
				// Reload when a new vote is recorded
				App.render();
			});
		});
	},

	render: async () => {
		// Prevent double render
		if (App.loading) {
			return
		}

		// Update app loa1ding state
		App.setLoading(true)

		// Render Account
		console.log(App.account)
		$("#accountAddress").html("Your Account: " + App.account)

		// Render Tasks
		await App.renderTasks()

		// Update loading state
		App.setLoading(false)
	},

	renderTasks: function() {
		// Load contract data
		App.contracts.Election.deployed().then(function(instance) {
			electionInstance = instance;
			return electionInstance.candidatesCount();
		}).then(function(candidatesCount) {
			var candidatesResults = $("#candidatesResults");
			candidatesResults.empty();

			var candidatesSelect = $('#candidatesSelect');
			candidatesSelect.empty();

			for (var i = 1; i <= candidatesCount; i++) {
				electionInstance.candidates(i).then(function(candidate) {
					var id = candidate[0];
					var name = candidate[1];
					var voteCount = candidate[2]

					// Render candidate Result
					var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
					candidatesResults.append(candidateTemplate);

					// Render candidate ballot option
					var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
					candidatesSelect.append(candidateOption);
				});
			}
			return electionInstance.voters(App.account);
		}).then(function(hasVoted) {
			// Do not allow a user to vote
			if(hasVoted) {
				$('form').hide();
			}
			App.setLoading(false)
		}).catch(function(error) {
			console.warn(error);
		});
	},
	
	castVote: function() {
		var candidateId = $('#candidatesSelect').val();
		App.contracts.Election.deployed().then(function(instance) {
			console.log(App.account)
			return instance.vote(candidateId, { from: App.account });
		}).then(function(result) {
			// Wait for votes to update
			App.setLoading(true)
		}).catch(function(err) {
			console.error(err);
		});
	},

	setLoading: (boolean) => {
		App.loading = boolean
		const loader = $("#loader")
		const content = $("#content")

		if (boolean) {
			loader.show()
			content.hide()
		} else {
			loader.hide()
			content.show()
		}
	}
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
