window.addEventListener('load',()=>{
    const makeAJAXRequest = (method,url, data)=>{
        let httpRequest = new XMLHttpRequest();
        httpRequest.open(method, url,true);
        if(data){
            httpRequest.setRequestHeader("Content-Type","application/json");
            //console.log(data);
            httpRequest.send(JSON.stringify(data));
        } else {
            httpRequest.send();
        }
        httpRequest.onreadystatechange = ()=>{
            if(httpRequest.readyState === 4){
                if(httpRequest.status === 200){
                    console.log(JSON.parse(httpRequest.responseText));
                } else{
                    console.log("There was a error in the data");
                }
            }
        }
    }

    var query = document.getElementById('employeeQuery');
    var empDel = document.querySelector("#employeeDelete");
    var empUp = document.querySelector("#employeeUpdate");

    //var position = document.querySelector("#employeeQueryPosition");
    query.addEventListener('click',()=>{
        let select = document.querySelector("#id");
        let option = select.options[select.selectedIndex].value;
        let httpRequest = new XMLHttpRequest();
        httpRequest.open("POST","/employees", true);
        httpRequest.setRequestHeader("Content-Type","application/json");
        httpRequest.send(JSON.stringify({id: option}));
        httpRequest.onreadystatechange = () =>{
            if(httpRequest.readyState === 4){
                if(httpRequest.status === 200){
                    var empData = JSON.parse(httpRequest.responseText).employee[0];
                    document.querySelector("#tableID").innerHTML = empData._id;
                    document.querySelector("#tablefName").innerHTML = empData.fName;
                    document.querySelector("#tablelName").innerHTML = empData.lName;
                    document.querySelector("#tableEmail").innerHTML = empData.email;
                    document.querySelector("#tableDesignation").innerHTML = empData.designation;
                    document.querySelector("#tableDepartment").innerHTML = empData.department;
                    document.querySelector("#tableAddress1").innerHTML = empData.address1;
                    document.querySelector("#tableAddress2").innerHTML = empData.address2;
                    document.querySelector("#tableApartment").innerHTML = empData.apartment;
                    document.querySelector("#tableCity").innerHTML = empData.city;
                    document.querySelector("#tableProvince").innerHTML = empData.province;
                    document.querySelector("#tablePostal").innerHTML = empData.postal;
                    document.querySelector("#tabledob").innerHTML = empData.dob;
                    document.querySelector("#tableStatus").innerHTML = empData.status;
                } else {
                    console.log("There was an error in the data");
                }
            }
        };

    });
    empDel.addEventListener('click',()=>{
        let select = document.querySelector("#id");
        let option = select.options[select.selectedIndex].value;
        const httpRequest = new XMLHttpRequest();
        httpRequest.open("DELETE","/employees",true);
        httpRequest.setRequestHeader("Content-type","application/json");
        httpRequest.send(JSON.stringify({id: option}));
        httpRequest.onreadystatechange = () =>{
            if(httpRequest.readyState == 4){
                if(httpRequest.status == 200){
                    let response = JSON.parse(httpRequest.responseText);
                    alert(response.message);
                    location.reload();
                }
            }
        }
    });

    empUp.addEventListener("click",()=>{
        let select = document.querySelector('#id');
        let option = select.options[select.selectedIndex].value;
        const httpRequest = new XMLHttpRequest();
        httpRequest.open("PUT","/employees",true);
        httpRequest.setRequestHeader("Content-Type","application/json");
        httpRequest.send(JSON.stringify({id: option}));
        httpRequest.onreadystatechange = () =>{
            if(httpRequest.readyState == 4){
                if(httpRequest == 200){
                    console.log("working");
                    let response = JSON.parse(httpRequest.responseText);
                    alert(response.message);
                }
            }
        }
    });
});
