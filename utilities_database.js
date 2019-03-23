const mongoose = require('mongoose');
const Sequelize = require('sequelize');
const uri = "mongodb://localhost:27017/restful";
const Schema = mongoose.Schema;
var connection = mongoose.connection;
mongoose.connect(uri,{useNewUrlParser: true})
.then(()=>{ console.log(`Database Connection Established`); })
.catch((error)=>{ console.log(`There was an error while connecting to database: ${error}`); })
//setting up postgres database
const database = 'd448k1e1jhqtme';
const user = 'immoiarwcfrcgb';
const password = '86a026e29a81311609d496e7719cbfd71c3ae905c1b534f06c390f03f42355a5';
const host = 'ec2-54-221-236-144.compute-1.amazonaws.com';
var sequelize = new Sequelize(database, user, password,{
    host: host,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

var Employee = sequelize.define('Employee',{
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fName: Sequelize.STRING,
    lName: Sequelize.STRING,
    email: Sequelize.STRING,
    designation: Sequelize.STRING,
    department: Sequelize.STRING,
    address1: Sequelize.STRING,
    address2: Sequelize.STRING,
    city: Sequelize.STRING,
    province: Sequelize.STRING,
    postal: Sequelize.STRING,
    managerId: Sequelize.INTEGER,
    dob: Sequelize.DATE,
    status: Sequelize.STRING,
    employeeImage: Sequelize.STRING
});
//initialize the postgres database
module.exports.initializeDatabase = ()=>{
    return new Promise((resolve,reject)=>{
        sequelize.sync()
        .then(()=>resolve())
        .catch(error=>reject("Unable to sync with the employee database"));
    })
}

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
