const express = require("express");
const router = express.Router();

const UserStore = require("./clientDataStore");


router.get("/", (req, res) => {
    res.send({ response: "I am alive" }).status(200);
});

router.get("/getActiveUsers", (req, res) => {
    res.send({ response:  UserStore.get()}).status(200);
});



module.exports = router;


