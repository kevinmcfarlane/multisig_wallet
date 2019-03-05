pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

contract MultiSignatureWallet {
    uint minNumberOfApprovers;

    address payable beneficiary;
    address payable public owner;

    mapping (address => bool) approvedBy;
    mapping (address => bool) isApprover;
    uint approvalsCount;

    constructor(address[] memory _approvers, uint _minNumberOfApprovers, address payable _beneficiary) public payable {
        require(_minNumberOfApprovers <= _approvers.length, "Number of approvers less than required number.");

        minNumberOfApprovers = _minNumberOfApprovers;
        beneficiary = _beneficiary;
        owner = msg.sender;

        for (uint i = 0; i < _approvers.length; i++) {
            address approver = _approvers[i];
            isApprover[approver] = true;
        }
    }

    function approve() public {
        require(isApprover[msg.sender], "Not an approver.");

        if (!approvedBy[msg.sender]) {
            approvedBy[msg.sender] = true;
            approvalsCount++;
        }

        if (approvalsCount == minNumberOfApprovers) {
            beneficiary.transfer(address(this).balance);
            // Return funds to owner if transfer fails
            selfdestruct(owner);
        }
    }

    function reject() public {
        require(isApprover[msg.sender], "Not an approver.");

        selfdestruct(owner);
    }
}