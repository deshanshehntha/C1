const express = require("express");
const router = express.Router();

const UserStore = require("./clientDataStore");
const ElectionContractDataStore = require("./electionContractDataStore");

router.get("/", (req, res) => {
    res.send({ response: "I am alive" }).status(200);
});

router.get("/getActiveUsers", (req, res) => {
    res.send({ response:  UserStore.get()}).status(200);
});


router.get("/getContracts", (req, res) => {
    res.send({ response:  ElectionContractDataStore.getAll()}).status(200);
});



router.get("/getCluster", (req, res) => {
    res.send( global.globalString).status(200);
});
module.exports = router;


