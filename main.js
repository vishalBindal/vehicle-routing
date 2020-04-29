'use strict'

let cfg = {
    'addresses' : [],
    'depot' : 0,
    'num_vehicles' : 0,
    'demands' : [],
    'vehicle_capacities' : []
}

let post_url = "http://localhost:16000/vrpapi"

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
            let resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `Error ${xhr.status}: ${xhr.statusText}`;
            window.scrollTo(0,document.body.scrollHeight);
        }
        else
        {
            let response = JSON.parse(xhr.response);
            console.log(response);
            updateResults(response);
            window.scrollTo(0,document.body.scrollHeight);
        }       
    }
}

let sampleCoordinateElement = document.createElement('li');
sampleCoordinateElement.innerHTML = '<label for="x">Latitude:</label><input type="text" value="0.0">\
                                    <label for="y">Longitude:</label><input type="text" value="0.0">'
let coordinateListWrapper = document.getElementById('coordi');

let sampleRequirementElement = document.createElement('li');
sampleRequirementElement.innerHTML = '<label for="req">Requirement: </label><input type="number" value="0">'
let requirementListWrapper = document.getElementById('req');

let sampleCapacityElement = document.createElement('li');
sampleCapacityElement.innerHTML = '<label for="cap">Capacity:</label><input type="number" value="0">'
let capacityListWrapper = document.getElementById('capacities');

let resetButton = document.getElementById('reset-locations');
resetButton.onclick = function(event){
    coordinateListWrapper.innerHTML = "";
    requirementListWrapper.innerHTML = "";
}

let vehicleButton = document.getElementById('confirm-vehicles');
vehicleButton.onclick = function(event) {
    capacityListWrapper.innerHTML="";
    for(let i=0;i<document.getElementById('num_veh').value;i++)
        {
            let newCapacityElem = sampleCapacityElement.cloneNode(true);
            capacityListWrapper.append(newCapacityElem);
        }
}

let submitButton = document.getElementById('submit');
submitButton.onclick = function(event){
    let ls = document.querySelectorAll('#coordi > li > input');
    let addresses = [];
    for(let i=0;i<ls.length/2;i++)
        {
            let address = [ls[2*i].value, ls[2*i+1].value];
            addresses.push(address);
        }
    cfg['addresses'] = addresses;
    cfg['num_vehicles'] = document.getElementById('num_veh').value;
    cfg['depot'] = document.getElementById('depot').value - 1;

    ls = document.querySelectorAll('#req > li > input');
    let requirements = [];
    for (let inp of ls)
        requirements.push(inp.value)
    cfg['demands'] = requirements

    ls = document.querySelectorAll('#capacities > li > input');
    let capacities = [];
    for (let inp of ls)
        capacities.push(inp.value)
    cfg['vehicle_capacities'] = capacities

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
        let loads = response.loads;
        let total_distance = response.total_distance;
        let total_load = response.total_load;
        let load_details = response.load_details;
        for(let i=0;i<distances.length;i++)
        {
            let div=document.createElement('div');
            let str = `<h5>Vehicle ${i+1}</h5>\
                    Round-trip time (minutes): ${(distances[i]/60).toFixed(2)} <br>\
                    Load carried: ${loads[i]} <br>\
                    Route:<br>`;
            for(let j=0;j<routes[i].length-1;j++)
                str += `Location ${routes[i][j]+1} (Load: ${load_details[i][j]}) -> `;
            str += `Location ${routes[i][routes[i].length-1]} (Load: ${load_details[i][routes.length-1]} )<br><br>`;
            div.innerHTML = str;
            resultDiv.append(div);
        }
        let div = document.createElement('div');
        div.innerHTML = `<h4> Statistics </h4> \
                    Maximum round-trip time (minutes): ${(max_distance/60).toFixed(2)} <br>\
                    Total time (cumulative time of all vehicles, in minutes): ${(total_distance/60).toFixed(2)} <br>\
                    Total load : ${total_load} <br>`
        resultDiv.append(div);
    }
    else{
        resultDiv.innerHTML = 'Solution not found :(';
    }
});

function parseTuple(t) {
    return JSON.parse(t.replace(/\(/g, "[").replace(/\)/g, "]"));
}

function initMap() {
    var myLatlng = {lat: 28.548700, lng: 77.183601};

    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 16, center: myLatlng});

    // Create the initial InfoWindow.
    var infoWindow = new google.maps.InfoWindow(
        {content: 'Click the map to get Lat/Lng!', position: myLatlng});
    infoWindow.open(map);

    // Configure the click listener.
    map.addListener('click', function(mapsMouseEvent) {
      // Close the current InfoWindow.
      infoWindow.close();

      // Create a new InfoWindow.
      infoWindow = new google.maps.InfoWindow({position: mapsMouseEvent.latLng});
      infoWindow.setContent(mapsMouseEvent.latLng.toString());
      infoWindow.open(map);

      let coordinate = parseTuple(mapsMouseEvent.latLng.toString());
      console.log(coordinate);

      let newCoordinateElem = sampleCoordinateElement.cloneNode(true);
      let ls = newCoordinateElem.getElementsByTagName('INPUT');
      ls[0].value = coordinate[0];
      ls[1].value = coordinate[1];
      coordinateListWrapper.append(newCoordinateElem);

      let newRequirementElem = sampleRequirementElement.cloneNode(true);
      requirementListWrapper.append(newRequirementElem);
    });
  }