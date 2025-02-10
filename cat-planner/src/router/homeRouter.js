const express = require("express");
const router = express.Router();
const homeController = require("../controller/homeController");

// parse JSON data
router.use(express.json());

router.post("/", homeController.func);

module.exports = router;