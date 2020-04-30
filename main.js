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

let sampleCapacityElement = document.createElement('li');
sampleCapacityElement.innerHTML = '<label for="cap">Capacity:</label><input type="number" value="0">'
let capacityListWrapper = document.getElementById('capacities');

let sampleLocationElement = document.createElement('li');
sampleLocationElement.innerHTML = '<h4> Location <span class="location-no"></span> <span class="coordinates"></span> </h4>\
                                <label for="req">Requirement: </label><input type="number" value="0" class="req-input">\
                                <button type="button" onclick="removeLocation(this.parentNode.id)">Discard location</button>\
                                <button type="button" onclick="markDepot(this.parentNode.id)">Mark as depot</button>'
let locationListWrapper = document.getElementById('locations');

let coordinates = [];
let noOfLocations = 0;

let resetButton = document.getElementById('reset-locations');
resetButton.onclick = function(event){
    locationListWrapper.innerHTML = "";
    coordinates = [];
    noOfLocations = 0;
    depot = -1;
    depotElement.innerHTML = "Not set";
}

let removeLocation = function(id)
{
    let elem = document.getElementById(id);
    elem.parentNode.removeChild(elem);

    let idint = parseInt(id.replace('location-',''));
    coordinates.splice(idint-1, 1);
    noOfLocations -= 1;

    if(idint==depot)
    {
        alert('depot not set!');
        depot = -1;
        depotElement.innerHTML = 'Not set';
    }

    let ls = document.querySelectorAll('#locations > li');
    for(let l of ls)
    {
        let idelem = parseInt(l.id.replace('location-', ''));
        if(idelem > idint)
            {
                l.id = 'location-'+(idelem - 1);
                l.getElementsByClassName('location-no')[0].innerHTML = (idelem - 1);
            }
    }
}

let depot = -1;
let depotElement = document.getElementById('depot-location');

let markDepot = function(id)
{
    let idint = parseInt(id.replace('location-',''));
    if(depot!=idint)
    {
        depotElement.innerHTML = idint;
        alert(`depot marked to ${idint}!`);
        depot = idint;
    }
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
    cfg['addresses'] = coordinates;
    cfg['num_vehicles'] = document.getElementById('num_veh').value;
    cfg['depot'] = depot;

    let ls = document.querySelectorAll('#locations > li > input');
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
            str += `Location ${routes[i][routes[i].length-1]+1} (Load: ${load_details[i][routes.length-1]} )<br><br>`;
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

    coordinates.push(coordinate);
    noOfLocations +=1;
    let newLocationElem = sampleLocationElement.cloneNode(true);
    newLocationElem.id = "location-"+noOfLocations;
    newLocationElem.getElementsByClassName('coordinates')[0].innerHTML = "[" + coordinate.toString() + "]";
    newLocationElem.getElementsByClassName('location-no')[0].innerHTML = noOfLocations;
    locationListWrapper.append(newLocationElem);
    });
  }