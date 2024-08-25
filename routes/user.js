const express = require('express');
const { register, login, getAllUsers, getUserById, updateUser, updatePassword, logOut } = require('../controller/user');
const fileUploadHandler = require('../middleware/multer');
const router = express.Router();

router.post('/register',fileUploadHandler,register);
router.post('/login',login);
router.get('/get-all',getAllUsers);
router.get('/get/:id',getUserById);
router.put('/update/:id',fileUploadHandler,updateUser);
router.put('/update-password/:id',updatePassword);
router.post('/logout',logOut);


module.exports = router;