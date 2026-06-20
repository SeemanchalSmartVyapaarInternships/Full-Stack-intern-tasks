const express = require("express");
const { getProfile, getAllUsers, getTeam, updateProfile } = require("../controllers/userController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/rbac");

const router = express.Router();

router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);
router.get("/all", auth, authorize("admin"), getAllUsers);
router.get("/team", auth, authorize("admin", "manager"), getTeam);

module.exports = router;
