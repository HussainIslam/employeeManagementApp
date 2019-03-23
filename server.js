const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const utilities = require('./utilities');
const utilities_db = require('./utilities_employee_database');
const multer = require('multer');
const exphbs = require('express-handlebars');
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

const HTTP_PORT = process.env.PORT || 8080;
app.use(bodyParser.json());

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
    response.render('index');
});
//get information of all employees from postgres
app.get("/getAllEmployees",(request,response)=>{
    utilities_db.getAllEmployees()
    .then(data=> response.render("getAllEmployees", {employees: data}))
    .catch(error=> response.render("getAllEmployees", {errorMessage: error}))
});
//route not yet used
app.get("/employees",(request,response)=>{
    utilities_db.populateMenu()
    .then(data=> response.render('employees',{ employee: data}))
    .catch(error=> response.render('employees', { errorMessage: error}))
});
//route to query one employee by id
app.post("/employees",(request,response)=>{
    utilities_db.getEmployeeById(request.body.id)
    .then(data=> response.json({employee: data}))
    .catch(error=> response.json({errorMessage: error}))
});
//delete one employee from postgres
app.delete("/employees",(request,response)=>{
    utilities_db.deleteEmployee(request.body.id)
    .then(data=> response.json({ message: data}))
    .catch(error=> response.json({errorMessage: error}))
});

app.put("/employees",(request,response)=>{
    response.redirect('/updateemployee');
    response.json({message: "Data updated"});
});

app.get("/updateemployee",(request,response)=>{
    response.render('updateEmployee');
});

app.get("/addemployee",(request,response)=>{
    response.render('addemployee');
});
//post employee data to the employee database
app.post("/addemployee",imageupload.single('employeeimage'),(request,response,next)=>{
    utilities_db.addEmployee(request.body)
    .then(data=> response.redirect('/'))
    .catch(error=> response.render("addEmployee",{errorMessage: error}))
});

app.get("/batchupload",(request,response)=>{
    response.render("batchupload");
});

app.post("/batchupload",bulkupload.single('datafile'),(request,response)=>{
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

app.get("/images",(request,response)=>{
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
.then(app.listen(HTTP_PORT,()=> console.log(`Server is listening to port ${HTTP_PORT}`)))
.catch(error=> console.log(msg))
