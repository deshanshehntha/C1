
class ElectionContractDataStore {

    _contracts = [];

    constructor() {
        this._contracts = [];
    }

    add(contract) {
       this._contracts.push(contract);
    }

    getAll() {
        return this._contracts;
    }

    remove(socketId) {
        this._contracts = [];
    }

    getLength() {
        return this._contracts.length;
    }
}

const instance = new ElectionContractDataStore();

module.exports = instance;
