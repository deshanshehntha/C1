
const Blockchain = require('izigma-blockchain');


class SmartContractInterface {

    _contractId = '';
    _creator = '';
    _startTime = '';
    _chain = new Blockchain();

    constructor(creator) {
        this._contractId = Date.now();
        this._creator = creator;
        this._startTime = Date.now();
        this.initiateBlockchain().then(r => {
            console.log("initialized the blockchain in the interface")
        })
    }

    deploy() {
        this._startTime = Date.now() ;
    }

    async initiateBlockchain() {
        this._chain = new Blockchain();
        let check = await this._chain.isBlockchainExsist();

        if (!check) {
            await this._chain.addGenesisBlock()
        }
    }

    async addBlock(transaction) {
        const block = await this._chain.addBlock(transaction);
        return block;
    }

    async readBlock() {
        let blockchain = [];

        blockchain = await this._chain.getChain()
        return blockchain;
    }



}
module.exports = SmartContractInterface;
