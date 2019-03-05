const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uri = "mongodb://localhost:27017/restful";
var connection = mongoose.connection;
module.exports.connect = ()=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(uri,{useNewUrlParser: true})
        .then(()=>{
            resolve();
        })
        .catch((error)=>{
            reject("Error while connecting");
        })
    })
}

module.exports.employeedb = new Schema({
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

module.exports.insertData = (data)=>{
    return new Promise ((resolve,reject)=>{
        let employeeData = new database(data);
        employeeData.save((error)=>{
            if(!error){
                resolve("Data Successfully Inserted into database");
            } else {
                reject(`There was an error inserting data: ${error}`);
            }
        });
    })
}

    



