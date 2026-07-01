const express = require("express");
const { getProfile, getAllUsers, getTeam, getManagers, getEmployees, updateProfile, updateUserRole, uploadProfileImage } = require("../controllers/userController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/rbac");
const { upload } = require("../utils/uploadService");

const router = express.Router();

router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);
router.post("/profile-image", auth, upload.single("avatar"), uploadProfileImage);
router.get("/all", auth, authorize("admin"), getAllUsers);
router.get("/team", auth, authorize("admin", "manager"), getTeam);
router.get("/managers", auth, getManagers);
router.get("/employees", auth, authorize("admin", "manager"), getEmployees);
router.patch("/:id/role", auth, authorize("admin"), updateUserRole);

module.exports = router;
