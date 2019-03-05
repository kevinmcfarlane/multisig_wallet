const MultiSignatureWallet = artifacts.require("MultiSignatureWallet");
const truffleAssert = require('truffle-assertions');

contract("MultiSignatureWallet", accounts => {

    const [firstAccount, approver1, approver2, beneficiary] = accounts;

    it("sets an owner", async () => {
        let approvers = [approver1, approver2];

        let wallet = await MultiSignatureWallet.new(approvers, 2, beneficiary);
        assert.equal(await wallet.owner.call(), firstAccount);
    });
});