const express = require("express");
const router = express.Router();

const {
  loginAdmin,
} = require("../controllers/adminAuthController");

// Admin registration is disabled.
// Only admin login is available.
router.post("/login", loginAdmin);

module.exports = router;


// const express = require("express");
// const router = express.Router();


// const {
//   registerAdmin,
//   loginAdmin,
// } = require("../controllers/adminAuthController");

// router.post("/register", registerAdmin);
// router.post("/login", loginAdmin);

// module.exports = router;
