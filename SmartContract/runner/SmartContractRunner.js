var ElectionContract = require("../model/ElectionContract");

class SmartContractRunner {


    static _contracts = []


    constructor() {
        SmartContractRunner._contracts = [];
    }

    startSmartContract(electionCategory,
                       creator,
                       electionName,
                       voters,
                       candidates,
                       description,
                       startDate,
                       endDate) {

        const contract = new ElectionContract(electionCategory,
            creator,
            electionName,
            voters,
            candidates,
            description,
            startDate,
            endDate)

        contract.deploy();
        SmartContractRunner._contracts.push(contract);
        return contract.getContractId();
    }

    getSmartContract(contract_id) {
        const contract =  SmartContractRunner._contracts.find(contract => contract._contractId === contract_id);
        console.log(SmartContractRunner._contracts);
        return contract;
    }

    getAllContracts() {
        return SmartContractRunner._contracts;
    }

    addBlock(id, transaction) {
        const contract =  SmartContractRunner._contracts.find(contract => contract._contractId === id);
        return contract.addBlock(transaction);
    }

    async readResults(id) {
        const contract = SmartContractRunner._contracts.find(contract => contract._contractId === id);
        let f = await contract.readBlock();
        console.log(f);
        return f;
    }


}

const instance = new SmartContractRunner();

module.exports = instance;

