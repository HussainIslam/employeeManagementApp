//setting up postgres database
const Sequelize = require('sequelize');
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
    id: {
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
        .then(()=>{
            console.log("Connected to postgres database");
            resolve();
        })
        .catch(error=>reject("Unable to sync with the employee database"));
    })
}

//fetch all employee information from postgres
module.exports.getAllEmployees =()=>{
    return new Promise((resolve,reject)=>{
        Employee.findAll()
        .then(data=>resolve(data))
        .catch(error=>reject(`Unable to fetch all employees from database. Error: ${error}`))
    })
}

// fetch one employee by id from postgres
module.exports.getEmployeeById = idNumber=>{
    return new Promise((resolve,reject)=>{
        Employee.findAll({ where: { id: idNumber }})
        .then(data=>resolve(data[0]))
        .catch(error=>reject(`No results found for employee number: ${idNumber}. Error: ${error}`))
    })
}

// add new employee to postgres
module.exports.addEmployee = employeeData =>{
    return new Promise((resolve,reject)=>{
        Employee.create(employeeData)
        .then(()=> resolve(`Employee successfully added to database`))
        .catch(error=> reject(`Unable to create new employee. Error: ${error}`))
    })
}

// delete one employee based on id from postgres
module.exports.deleteEmployee = idNumber=>{
    return new Promise((resolve,reject)=>{
        Employee.destroy({ where: { id: idNumber}})
        .then(()=>resolve(`Successfully deleted information of employee number: ${idNumber}`))
        .catch(error=> reject(`Unable to delete information of employee number: ${idNumber}. Error: ${error}`))
    })
}

// query employee id, fName, lName for menu in employees.hbs from porstgres
module.exports.populateMenu = ()=>{
    return new Promise((resolve,reject)=>{
        Employee.findAll({ attributes: ['id','fName','lName'] })
        .then(data=> resolve(data))
        .catch(error=> reject(`Unable to query all employee data to populate menu. Error: ${error}`))
    })
}

// legacy mongodb section
/*
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

*/
