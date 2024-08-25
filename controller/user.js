const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, email, password, address, phone } = req.body;

        if (!username) {
            return res.status(400).json({
                status: false,
                message: "username is required"
            });
        }


        if (!email) {
            return res.status(400).json({
                status: false,
                message: "email is required"
            });
        }

        if (!password) {
            return res.status(400).json({
                status: false,
                message: "password is required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "Profile image is required"
            });
        }

        if (!address) {
            return res.status(400).json({
                status: false,
                message: "address is required"
            });
        }

        if (!phone) {
            return res.status(400).json({
                status: false,
                message: "phone is required"
            });
        }

        const profile_pic_path = `/upload/${req.file.filename}`;

        const [existingUser] = await db.execute(`select * from users where email=?`, [email]);

        if (existingUser.length) {
            return res.status(409).json({
                status: false,
                message: "User already exist"
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashPassword = await bcrypt.hash(password, salt);

        let sql = `insert into users(username,email,password,profile_pic,address,phone)values(?,?,?,?,?,?)`;

        await db.execute(sql, [username, email, hashPassword, profile_pic_path, address, phone]);

        res.status(201).json({
            status: true,
            message: "User register successfully"
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username) {
            return res.status(400).json({
                status: false,
                message: "username is required"
            });
        }


        if (!email) {
            return res.status(400).json({
                status: false,
                message: "email is required"
            });
        }

        if (!password) {
            return res.status(400).json({
                status: false,
                message: "password is required"
            });
        }


        const [rows] = await db.execute(`select * from users where email=?`, [email]);

        const user = rows[0];

        if (!user || user.length) {
            return res.status(404).json({
                staus: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(404).json({
                status: false,
                message: "Invalid credential"
            });
        }

        const token = await jwt.sign({ id: user.id }, process.env.SECERT_KEY, { expiresIn: '90d' });

        res.cookie("token", token, {
            httpOnly: process.env.NODE_ENV === 'development' ? true : false,
            secure: process.env.NODE_ENV === 'development' ? true : false,
            maxAge: 90 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            status: true,
            message: "Login successfully",
            token,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

const getAllUsers = async (req, res) => {
    try {
        let sql = `select * from users`;

        const [user] = await db.execute(sql);

        if (user.length === 0) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        user[0].password = undefined;

        res.status(200).json({
            status: true,
            total: user.length,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.staus(400).json({
                status: false,
                message: "Id is required"
            });
        }

        let sql = `select * from users where id=?`;

        const [user] = await db.execute(sql, [id]);

        if (user.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Id not found"
            });
        }

        user[0].password = undefined;

        res.status(200).json({
            status: true,
            data: user,
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.staus(400).json({
                status: false,
                message: "Id is required"
            });
        }

        const {username,email,address,phone } = req.body;

        if (!username) {
            return res.status(400).json({
                status: false,
                message: "username is required"
            });
        }


        if (!email) {
            return res.status(400).json({
                status: false,
                message: "email is required"
            });
        }

        if (!address) {
            return res.status(400).json({
                status: false,
                message: "address is required"
            });
        }

        if (!phone) {
            return res.status(400).json({
                status: false,
                message: "phone is required"
            });
        }

        let profile_pic_path;

        if (req.file) {
            profile_pic_path = `/upload/${req.file.filename}`;
        } else {
            //get old image
            const [user] = await db.execute(`select * from user where id=?`, [id]);

            if (user.length == 0) {
                return res.status(404).json({
                    status: false,
                    message: "User not found"
                });
            }

            profile_pic_path = user[0].profile_pic;
        }

        let sql = `update users set username=?, email=?, address=?, phone=?,profile_pic=? where id=?`;

        const [users] = await db.execute(sql, [username, email, address, phone,profile_pic_path, id]);

        if (users.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: "Id not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Updated Successfully"
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

const updatePassword = async(req,res)=>{
    try {
        const { id } = req.params;

        if (!id) {
            return res.staus(400).json({
                status: false,
                message: "Id is required"
            });
        }

        const {oldPasssword,newPassword} = req.body;

        if(!oldPasssword){
            return res.status(400).json({
                message:"old password required"
            });
        }

        if(!newPassword){
            return res.status(400).json({
                message:"new password required"
            });
        }

        const [user] = await db.execute(`select password from users where id=?`,[id]);

        if(user.length===0){
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(oldPasssword,user[0].password);

        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Old password is incorrect"
            });
        }

        const hashPassword = await bcrypt.hash(newPassword,10);

        const [result] = await db.execute(`update users set password=? where id=?`,[hashPassword,id]);

        if(result.affectedRows===0){
            return res.status(404).json({
                status:false,
                message:"id not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

const logOut = async(req,res)=>{
    try {
        res.clearCookie("token");

        res.status(200).json({
            status:true,
            message:"User logout successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

module.exports = {
    register,
    login,
    getAllUsers,
    getUserById,
    updateUser,
    updatePassword,
    logOut
}