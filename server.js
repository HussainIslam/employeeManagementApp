const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const utilities = require('./utilities');
const utilities_db = require('./utilities_employee_database');
const multer = require('multer');
const exphbs = require('express-handlebars');
const clientSessions = require('client-sessions');
const HTTP_PORT = process.env.PORT || 8080;
const HTTPS_PORT = 4433;
//creating certificate
const https_options = {
    key: fs.readFileSync(`${__dirname}/server.key`),
    cert: fs.readFileSync(`${__dirname}/server.cert`)
};


// Setting up client sessions 
app.use(clientSessions({
    cookieName: "session",
    secret: "personalprojectemployeemanagementsystem",
    duration: 5 * 60 * 1000, //duration of the session in milisecond
    activeDuration: 1000 * 60
}));

// testing user object
const userdetails = {
    username: "hussain",
    password: "123",
    authorization: "admin"
}

// middleware to ensure login
const ensureLogin = (request,response,next)=>{
    if(!request.session.sessionUser) response.redirect('/login');
    else{
        app.locals.user = request.session.sessionUser;
        next();
    }
}
//defining multer diskStorage for employee images
const imagestorage = multer.diskStorage({
    destination: "./public/empImages",
    filename: (request,file,cb)=>{
        cb(null,Date.now() + path.extname(file.originalname));
    }
});

//defining multer diskStorage for bulk employee information upload
const bulkstorage = multer.diskStorage({
    destination: "./public/datadirectory",
    filename: (request,file,cb)=>{
        cb(null,Date.now() + path.extname(file.originalname));
    }
});
//mapping the storages for both images and employee information
var bulkupload = multer({storage: bulkstorage});
var imageupload = multer({storage: imagestorage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.engine('.hbs',exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: (url,options)=>{
            return '<a ' +((url == app.locals.activeRoute) ? 'class="nav-item nav-link active"' : 'class= "nav-item nav-link"')
                    +' href="' + url + '">' + options.fn(this) + ((url == app.locals.activeRoute) ? '<span class="sr-only">(current)</span>' : '') 
                    +'</a>';
        },
        asideMenuName: (url, options)=>{
            return (url === app.locals.activeRoute) ? options.fn(this) : "";
        },
    }
}));

app.set('view engine','.hbs');

app.use(express.static('public'));
app.use((request,response,next)=>{
    let route = request.baseUrl +request.path;
    app.locals.activeRoute = (route == '/') ? '/' : route.replace(/\/$/,"");
    next(); 
});

app.get("/",(request,response)=>{
    console.log(request.session.sessionUser);
    response.render('index',{ user: request.session.sessionUser});
});

// get route to send user the login page
app.get('/login',(request,response)=>{
    response.render('login');
});

app.post('/login',(request,response)=>{
    const user = request.body.username;
    const pass = request.body.password;
    //console.log(`Username: ${userdetails.username}, Password: ${userdetails.password}`);
    //console.log(`Username: ${user}, Password: ${pass}`);
    if(user === "" || pass === ""){
        response.render('login', { errorMessage: `Enter both username and password`})
    }
    if(user === userdetails.username && pass === userdetails.password){
        request.session.sessionUser = {
            username: userdetails.username,
            authorization: userdetails.authorization
        };
        response.redirect('/');
    }
    else{
        //console.log(`username or password did not match`);
        response.render('login',{ errorMessage: "Invalid username or password"})
    }
});

app.get("/logout",(request,response)=>{
    request.session.reset();
    response.redirect("/login");
});


//get information of all employees from postgres
app.get("/getAllEmployees",ensureLogin,(request,response)=>{
    utilities_db.getAllEmployees()
    .then(data=> response.render("getAllEmployees", {employees: data}))
    .catch(error=> response.render("getAllEmployees", {errorMessage: error}))
});
//route not yet used
app.get("/employees",ensureLogin,(request,response)=>{
    utilities_db.populateMenu()
    .then(data=> response.render('employees',{ employee: data}))
    .catch(error=> response.render('employees', { errorMessage: error}))
});
//route to query one employee by id
app.post("/employees",ensureLogin,(request,response)=>{
    utilities_db.getEmployeeById(request.body.id)
    .then(data=> response.json({employee: data}))
    .catch(error=> response.json({errorMessage: error}))
});
//delete one employee from postgres
app.delete("/employees",ensureLogin,(request,response)=>{
    utilities_db.deleteEmployee(request.body.id)
    .then(data=> response.json({ message: data}))
    .catch(error=> response.json({errorMessage: error}))
});

app.put("/employees",ensureLogin,(request,response)=>{
    response.redirect('/updateemployee');
    response.json({message: "Data updated"});
});

app.get("/updateemployee",ensureLogin,(request,response)=>{
    response.render('updateEmployee');
});

app.get("/addemployee",ensureLogin,(request,response)=>{
    response.render('addemployee');
});
//post employee data to the employee database
app.post("/addemployee",ensureLogin,imageupload.single('employeeimage'),(request,response,next)=>{
    utilities_db.addEmployee(request.body)
    .then(data=> response.redirect('/'))
    .catch(error=> response.render("addEmployee",{errorMessage: error}))
});

app.get("/batchupload",ensureLogin,(request,response)=>{
    response.render("batchupload");
});

app.post("/batchupload",ensureLogin,bulkupload.single('datafile'),(request,response)=>{
    var successful = 0;
    utilities.fileRead()
    .then(data=>{
        for(let i = 0; i < data.length; i++){
            utilities_db.addEmployee(data[i])
            .then(()=>{
                successful++;
                if( i == data.length -1 ){
                    console.log(`Successfully inserted ${successful} records`);
                    response.redirect('/');
                }
            })
            .catch((error)=>{
                console.log(`Error in bulk data insertion ${error}`);
            })
        }
    })
    .catch((error)=>{
        response.send({message: error});
    })
});

app.get("/images",ensureLogin,(request,response)=>{
    utilities.getAllImages()
    .then((data)=>{
        response.render('images',{
            images: data
        })
    })
    .catch((error)=>{
        console.log("not working");
        response.render('images',{
            error: error
        })
    });
    //response.render('images');
});


utilities_db.initializeDatabase()
.then(()=>{
    http.createServer(app).listen(HTTP_PORT,()=>console.log(`Server is listening to ${HTTP_PORT}`));
    https.createServer(https_options,app).listen(HTTPS_PORT,()=>console.log(`Server is listening to ${HTTPS_PORT}`));
    }
)
.catch(error=>console.log(error));
