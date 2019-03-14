const MultiSignatureWallet = artifacts.require("MultiSignatureWallet");
const truffleAssert = require('truffle-assertions');
const FINNEY = 1 // 10**15 wei;

contract("MultiSignatureWallet", accounts => {
    
    it("sets an owner", async () => {
        // Arrange
        const [firstAccount, approver1, approver2, beneficiary] = accounts;
        let approvers = [approver1, approver2];
        let minNumberOfApprovers = 2;

        // Act
        let wallet = await MultiSignatureWallet.new(approvers, minNumberOfApprovers, beneficiary);

        // Assert
        assert.equal(await wallet.owner.call(), firstAccount);
    });

    it("approves transfer to beneficiary", async () => {
        // Arrange
        const [firstAccount, approver1, approver2, beneficiary] = accounts;
        let approvers = [firstAccount, approver1, approver2];
        let minNumberOfApprovers = 2;
        let wallet = await MultiSignatureWallet.new(approvers, minNumberOfApprovers, beneficiary);
        await wallet.donate({ from: firstAccount, value: 10 * FINNEY });

        // Act
        // Get all approvers to approve
        await wallet.approve(firstAccount);
        await wallet.approve(approver1);
        await wallet.approve(approver2);

        // Check
        let approvalsCount = await wallet.approvalsCount.call();
        console.log("Approvals count = " + approvalsCount);

        // Assert
        assert.isTrue(approvalsCount >= minNumberOfApprovers, `Number of approvers ${approvalsCount} is less than required number ${minNumberOfApprovers}.`);
    });

    it("transfers funds to beneficiary", async () => {
        // Arrange
        const [firstAccount, approver1, approver2, beneficiary] = accounts;
        let approvers = [firstAccount, approver1, approver2];
        let minNumberOfApprovers = 2;
        let wallet = await MultiSignatureWallet.new(approvers, minNumberOfApprovers, beneficiary);
        await wallet.donate({ from: firstAccount, value: 10 * FINNEY });
        
        // Get all approvers to approve
        await wallet.approve(firstAccount);
        await wallet.approve(approver1);
        await wallet.approve(approver2);
        
        // Act
        let result = await wallet.sendToBeneficiary();

        // Assert
        const expectedAmount = 10;

        truffleAssert.eventEmitted(result, 'Transferred', (ev) => {
            console.log('Event Info');
            console.log('----------');
            console.log('Address = ' + ev.from);
            console.log('Amount = ' + ev.amount);
      
            return ev.amount == expectedAmount;
          }, `Transferred amount should be ${expectedAmount}.`);
    });

    it("reverts transfer of funds to beneficiary due to insufficient approvals", async () => {
        // Arrange
        const [firstAccount, approver1, approver2, beneficiary] = accounts;
        let approvers = [firstAccount, approver1, approver2];
        let minNumberOfApprovers = 3;
        let wallet = await MultiSignatureWallet.new(approvers, minNumberOfApprovers, beneficiary);
        await wallet.donate({ from: firstAccount, value: 10 * FINNEY });
        
        // Get some approvers to approve
        await wallet.approve(approver1);
        await wallet.approve(approver2);
        
        // Act, Assert
        await truffleAssert.reverts(
            wallet.sendToBeneficiary(), 
            "Not approved.");
    });

    it("reverts creation of contract when too few approvers", async () => {
        // Arrange
        const [approver1, beneficiary] = accounts;
        let approvers = [approver1];
        let minNumberOfApprovers = 2;

        // Act, Assert
        await truffleAssert.reverts(
            MultiSignatureWallet.new(approvers, minNumberOfApprovers, beneficiary), 
            "Number of approvers less than required number.");
    });
    
    it("reverts approval when not approver", async () => {
        // Arrange
        const [approver1, somebody, beneficiary] = accounts;
        let approvers = [approver1];
        let minNumberOfApprovers = 1;
        let wallet = await MultiSignatureWallet.new(approvers, minNumberOfApprovers, beneficiary);

        // Act, Assert
        await truffleAssert.reverts(
            wallet.approve(somebody), 
            "Not an approver.");
    });
});