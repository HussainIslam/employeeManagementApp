const mongoose = require('mongoose');
const uri = "mongodb://localhost:27017/restful";
const Schema = mongoose.Schema;
var connection = mongoose.connection;
mongoose.connect(uri,{useNewUrlParser: true})
.then(()=>{ console.log(`Database Connection Established`); })
.catch((error)=>{ console.log(`There was an error while connecting to database: ${error}`); })

var EmployeeDB = new Schema({
    fName: String,
    lName: String,
    email: String,
    designation: String,
    department: String,
    address1: {
        type: String,
        required: true
    },
    address2: String,
    apartment: Number,
    city: String,
    province: String,
    postal: String,
    mangerid: Number,
    dob: Date,
    status: String,
    employeeimage: {
        data: Buffer,
        contentType: String
    }
});

var database = mongoose.model("employeedb",EmployeeDB);
module.exports.database = ()=>{
    return new Promise((resolve,reject)=>{
        mongoose.model("employeedb",employeedb)
        .then(()=>{
            resolve();
        })
        .catch((error)=>{
            reject(`Error while modeling the database: ${error}`);
        })

    })
}


module.exports.connection = ()=>{
    return new Promise((resolve,reject)=>{
        connection.once("open",(error,response)=>{
            if(!error){
                console.log("Database Connection Established");
                resolve();
            }
            else{
                reject(`There was an error while establishing connection : ${error}`);
            }
        })
    })
}

var insertData = (data) =>{
    return new Promise((resolve, reject) => {
        let employeeData = new database(data);
        employeeData.save((error) => {
            if (!error) {
                resolve("Data Successfully Inserted into database");
            }
            else {
                reject(`There was an error inserting data: ${error}`);
            }
        });
    });
}

    
module.exports = EmployeeDB;
module.exports = {
    insertData: insertData
}
