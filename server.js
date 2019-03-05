const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const utilities = require('./utilities');
const utilities_db = require('./utilities_database');
const multer = require('multer');
const exphbs = require('express-handlebars');
const imagestorage = multer.diskStorage({
    destination: "./public/empImages",
    filename: (request,file,cb)=>{
        cb(null,Date.now() + path.extname(file.originalname));
    }
});
const bulkstorage = multer.diskStorage({
    destination: "./public/datadirectory",
    filename: (request,file,cb)=>{
        cb(null,Date.now() + path.extname(file.originalname));
    }
});
var bulkupload = multer({storage: bulkstorage});
var imageupload = multer({storage: imagestorage });

mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;
const HTTP_PORT = process.env.PORT || 8080;
app.use(bodyParser.json());
var database = mongoose.model("employeedb",utilities_db.employeedb);

app.engine('.hbs',exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: (url,options)=>{
            return '<a ' +((url == app.locals.activeRoute) ? 'class="nav-item nav-link active"' : 'class= "nav-item nav-link"')
                    +' href="' + url + '">' + options.fn(this) + ((url == app.locals.activeRoute) ? '<span class="sr-only">(current)</span>' : '') 
                    +'</a>';
        }
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

app.get("/employees",(request,response)=>{
    database.find({})
    .exec()
    .then((data)=>{
        response.render('employees',{
            employee: data
        });
    })
    .catch((error)=>{
        response.send(error);
    });
});

app.post("/employees",(request,response)=>{
    database.find({_id: request.body.id})
    .exec()
    .then((data)=>{
        response.json({ employee: data });
    })
    .catch((error)=>{
        response.json({ message: error });
    });
});

app.delete("/employees",(request,response)=>{
    database.deleteOne({_id: request.body.id})
    .exec()
    .then((data)=>{
        response.json({message: "Data deleted"});
    })
    .catch((error)=>{
        response.json({error: "There was an error"});
    })
});

app.put("/employees",(request,response)=>{
    console.log("The first one is working");
    response.redirect('/updateemployee');
    response.json({message: "Data updated"});
});

app.get("/updateemployee",(request,response)=>{
    console.log("the second one is also working");
    //response.json({message: "data updated"});
    response.render('updateEmployee');
});

app.get("/addemployee",(request,response)=>{
    response.render('addemployee');
});

app.post("/addemployee",imageupload.single('employeeimage'),(request,response,next)=>{
    utilities_db.insertData(request.body)
    .then((data)=>{
        console.log(data);
        response.redirect('/');
    })
    .catch((error)=>{
        response.json({error: error});
    })
});

app.get("/batchupload",(request,response)=>{
    //utilities.fileRead();
    response.render("batchupload");
});

app.post("/batchupload",bulkupload.single('datafile'),(request,response)=>{
    var successful = 0;
    utilities.fileRead()
    .then((data)=>{
        for(let i = 0; i < data.length; i++){
            utilities_db.insertData(data[i])
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
        //console.log(data);
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

app.listen(HTTP_PORT,()=>{
    console.log(`Server is listening to port ${HTTP_PORT}`);
});