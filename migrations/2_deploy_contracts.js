var Election = artifacts.require("./Elections.sol");

module.exports = function (deployer) {
  deployer.deploy(Election);
};
