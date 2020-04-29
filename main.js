'use strict'

let cfg = {
    'addresses' : [],
    'depot' : 0,
    'num_vehicles' : 0
}

let post_url = "http://localhost:18000/vrpapi"

let sendRequest = function(){
    let req = {
        "cfg":cfg
    };
    let json = JSON.stringify(req);
    console.log(json);
    let xhr = new XMLHttpRequest();
    xhr.open('POST', post_url);
    xhr.send(json);
    
    xhr.onload = function(){
        if(xhr.status != 200)
        {
            console.log(`Error ${xhr.status}: ${xhr.statusText}`);
        }
        else
        {
            let response = JSON.parse(xhr.response);
            console.log(response);
            updateResults(response);
        }       
    }
}

let sampleListElem = document.querySelector('#coordi>li').cloneNode(true);
let listWrapper = document.getElementById('coordi');

let button = document.getElementById('button');
button.onclick = function(event) {
    let newListElem = sampleListElem.cloneNode(true);
    listWrapper.append(newListElem);
}

let submitButton = document.getElementById('submit');
submitButton.onclick = function(event){
    let ls = document.querySelectorAll('#coordi > li > input');
    console.log(ls);
    let addresses = [];
    for(let i=0;i<ls.length/2;i++)
        {
            let address = [ls[2*i].value, ls[2*i+1].value];
            addresses.push(address);
        }
    cfg['addresses'] = addresses;
    cfg['num_vehicles'] = document.getElementById('num_veh').value;
    cfg['depot'] = document.getElementById('depot').value;
    console.log(cfg);
    sendRequest();
    
}

let updateResults = ((response)=>
{
    let resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "";
    let solution = response.solution;
    if(solution)
    {
        let distances = response.distances;
        let max_distance = response.max_distance;
        let routes = response.routes;
        for(let i=0;i<distances.length;i++)
        {
            let div=document.createElement('div');
            let str = `<h5>Vehicle ${i+1}</h5> Distance travelled: ${distances[i]} <br> Route: `;
            for(let j=0;j<routes[i].length-1;j++)
                str += `${routes[i][j]} -> `;
            str += `${routes[i][routes[i].length-1]}<br><br>`;
            div.innerHTML = str;
            resultDiv.append(div);
        }
    }
});