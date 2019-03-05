const fs = require('fs');
const readline = require('readline');
const path = require('path');
var objArray = [];

function createObj (firstName,lastName,email,designation,department,address1,address2,apartment,city,province,postal,managerid,birth,status){
    var obj = {
        "fName": firstName,
        "lName": lastName,
        "email": email,
        "designation": designation,
        "department": department,
        "address1": address1,
        "address2": address2,
        "apartment": apartment,
        "city": city,
        "province": province,
        "postal": postal,
        "managerid": managerid,
        "dob": birth,
        "status": status
    }
    return obj;
}
var extractFields = (string)=>{
    let data = new createObj ();
    for(var property in data){
        if(string != null){
            if(string.indexOf(',')>=0){
                data[property] = string.substring(0,string.indexOf(','));
            }else{
                //console.log("i am here");
                data[property] = string.substring(0,string.indexOf('\n'));
            }
            string = string.replace(`${data[property]},`,'');
        }
    }
    return data;
}

var readLines = (filename)=>{
    var rl = readline.createInterface({
        input: fs.createReadStream(`./public/datadirectory/${filename}`),
    });
    return new Promise((resolve,reject)=>{
        rl.on('line',(line,error)=>{
            objArray.push(extractFields(line));
        })
        .on('close',()=>{
            resolve(objArray);
        })

    })
}

var removeDataFile = (filename)=>{
    return new Promise((resolve,reject)=>{
        fs.unlink(`./public/datadirectory/${filename}`,(error)=>{
            error ? reject("Couldn't delete file") : resolve("file deletion successful");
        })
    })
}

module.exports.getAllImages = () =>{
    return new Promise((resolve,reject)=>{
        fs.readdir("./public/empImages",(error,data)=>{
            if(error){
                reject("Error reading from the directory");
            }
            else{
                resolve(data);
            }
        })
    })
}

module.exports.fileRead = ()=>{
    var readDirectory = ()=>{
        return new Promise((resolve,reject)=>{
            fs.readdir("./public/datadirectory",(error,data)=>{
                //error ? reject(error) : resolve(data);
                if(error){
                    reject(error);
                } else{
                    //console.log(data);
                    resolve(data);
                }
            });
        })
    }
    return new Promise((resolve,reject)=>{
        readDirectory()
        .then((filename)=>{
            readLines(filename)
            .then((data)=>{
                removeDataFile(filename)
                .then(()=>{
                    resolve(data);
                })
                .catch((error)=>{
                    reject(error);
                })
            })
            .catch((error)=>{
                reject(`Error getting data from file: ${error}`);
            })
        })
        .catch((error)=>{
            reject(`Error reading directory: ${error}`);
        })
    })
};