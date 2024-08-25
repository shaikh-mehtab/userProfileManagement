const mysql = require('mysql2');

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"user_profile"
});

db.connect((err)=>{
if(err){
    console.log(`Error on Connecting database ${err}`.bgRed);
}else{
    console.log(`connected successfully`.bgGreen);
}
});

module.exports = db.promise();