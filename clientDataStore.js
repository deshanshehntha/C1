class ClientDataStore {

    _data = [];

    constructor() {
        this._data = [];
    }

    add(socketId, id, url, timestamp, cluster) {
        let obj = {
            socketId : socketId,
            id : id,
            url : url,
            timestamp : timestamp,
            cluster : cluster
        }
        this._data.push(obj);
        console.log(this._data)
    }

    getAll() {
        return this._data;
    }

    remove(socketId) {
        this._data = this._data.filter(function (obj) {
            return obj.socketId !== socketId;
        });
        console.log("deleted" + this._data)
    }

    removeAll() {
        this._data = []
    }

    getLength() {
        return this._data.length;
    }
}

const instance = new ClientDataStore();

module.exports = instance;
