'use strict'

let cfg = {
    'addresses' : [],
    'depot' : 0,
    'num_vehicles' : 0,
    'demands' : [],
    'vehicle_capacities' : []
}

let post_url = "https://evening-sierra-28829.herokuapp.com/vrpapi"
// If running locally, comment the above url and use the below one
// let post_url = "http://localhost:16000/vrpapi"

let changeDepotInList = function(idint) {
    // clearing all the background colors
    var items = locationListWrapper.getElementsByTagName("li");
    for (var i = 0; i < items.length; ++i) {
        if (i == (idint-1)) {
            items[i].firstChild.classList.add("bg-secondary");
        } else {
            items[i].firstChild.classList.remove("bg-secondary");
        }
    }
}

let sendRequest = function(){
    if (cfg.depot < 0) {
        alert("depot not set");
    } else if(cfg.num_vehicles.length == 0) {
        alert("vehicles not added");
    }else {
        let req = {
            "cfg":cfg
        };
        let json = JSON.stringify(req);
        console.log(json);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', post_url);
        xhr.setRequestHeader('Access-Control-Allow-Origin', 'https://evening-sierra-28829.herokuapp.com/')
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
}

let sampleCapacityElement = document.createElement('li');
sampleCapacityElement.innerHTML = `<div class="input-group" style="display: inline-flex !important;"><label class="input-group-addon addon-sm" for="cap">Capacity:</label><input type="number" value="0" min="0" class="form-input input-sm capacity-input"></div>`;

let capacityListWrapper = document.getElementById('capacities');

let sampleLocationElement = document.createElement('li');
sampleLocationElement.innerHTML = '<div class="card shadowContainer" style="width: 95%;">\
                                <div class="card-body">\
                                <strong> Location <span class="location-no"></span> <span class="coordinates"></span></strong><br>\
                                <label for="req">Requirement: </label><input type="number" value="0" min="0" class="req-input form-input">\
                                </div>\
                                <div class="card-footer">\
                                <button class="btn btn-error btn-sm" type="button" onclick="removeLocation(this.parentNode.parentNode.parentNode.id)">Discard location</button>\
                                <button class="btn btn-success btn-sm" type="button" onclick="markDepot(this.parentNode.parentNode.parentNode.id)">Mark as depot</button>\
                                </div>\
                                </div>';
let locationListWrapper = document.getElementById('locations');

let coordinates = [];
let noOfLocations = 0;

let resetButton = document.getElementById('reset-locations');
resetButton.onclick = function(event){
    locationListWrapper.innerHTML = "";
    coordinates = [];
    noOfLocations = 0;
    depot = -1;
    changeDepotInList(-1);
    depotElement.innerHTML = "Not set";
    for(let m of markers)
        m.setMap(null);
    markers = [];
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
        // alert('depot not set!');
        depot = -1;
        changeDepotInList(-1);
        depotElement.innerHTML = 'Not set';
    }

    for(let m of markers)
    {
        if(parseInt(m.label)==idint)
            m.setMap(null);
        else if(parseInt(m.label) > idint)
            {
                m.set('label',(parseInt(m.label) - 1).toString());
            }
    }

    markers.splice(idint - 1, 1);

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
        changeDepotInList(idint);
        depotElement.innerHTML = idint;
        // alert(`depot marked to ${idint}!`);
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
    cfg['depot'] = depot - 1;

    let ls = document.querySelectorAll('.req-input');
    let requirements = [];
    for (let inp of ls)
        requirements.push(inp.value)
    cfg['demands'] = requirements

    ls = document.querySelectorAll('.capacity-input');
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
            if(routes[i].length==2)
                {
                    let str = `<div class="card shadowContainer"><div class="card-body"><strong>Vehicle ${i+1}</strong>\
                    Unused</div></div>`;
                    div.innerHTML = str;
                    resultDiv.append(div);
                    continue;
                }
            let str = `<div class="card shadowContainer"><div class="card-body"><strong>Vehicle ${i+1}</strong>\
                    Round-trip time: ${(distances[i]/60).toFixed(2)} minutes<br>\
                    Load carried: ${loads[i]} <br>\
                    <a href="${get_directions_url(routes[i])}" target="_blank">Get directions</a><br>\
                    Route:<br>`;
            for(let j=0;j<routes[i].length-1;j++)
                str += `Location ${routes[i][j]+1} -> `;
            str += `Location ${routes[i][routes[i].length-1]+1}</div></div><br>`;
            div.innerHTML = str;
            resultDiv.append(div);
        }
        let div = document.createElement('div');
        div.innerHTML = `<div class="card shadowContainer bg-secondary"><div class="card-body"><strong> Statistics </strong> \
                    Maximum round-trip time: ${(max_distance/60).toFixed(2)} minutes<br>\
                    Total time (cumulative time of all vehicles): ${(total_distance/60).toFixed(2)} minutes<br>\
                    Total load : ${total_load} <br></div></div>`
        resultDiv.append(div);
    }
    else{
        resultDiv.innerHTML = 'Solution not found :(';
    }
});

function parseTuple(t) {
    return JSON.parse(t.replace(/\(/g, "[").replace(/\)/g, "]"));
}

let markers = [];

function initMap() {
    // Create the initial InfoWindow.
    // var infoWindow = new google.maps.InfoWindow(
    //     {content: 'Click the map to get Lat/Lng!', position: myLatlng});
    // infoWindow.open(map);
    let HauzKhasLatlng = {lat: 28.548700, lng: 77.183601};

    let map = new google.maps.Map(
        document.getElementById('map'), {zoom: 16, center: HauzKhasLatlng});

    // Configure the click listener.
    map.addListener('click', function(mapsMouseEvent) {
      // Close the current InfoWindow.
    //   infoWindow.close();

      // Create a new InfoWindow.
    //   infoWindow = new google.maps.InfoWindow({position: mapsMouseEvent.latLng});
    //   infoWindow.setContent(mapsMouseEvent.latLng.toString());
    //   infoWindow.open(map);

      let coordinate = parseTuple(mapsMouseEvent.latLng.toString());
      console.log(coordinate);

    coordinates.push(coordinate);
    noOfLocations +=1;

    addMarker(mapsMouseEvent.latLng, noOfLocations, map);

    let newLocationElem = sampleLocationElement.cloneNode(true);
    newLocationElem.id = "location-"+noOfLocations;
    newLocationElem.getElementsByClassName('coordinates')[0].innerHTML = "[" + coordinate.toString() + "]";
    newLocationElem.getElementsByClassName('location-no')[0].innerHTML = noOfLocations;
    locationListWrapper.append(newLocationElem);
    });
  }

let addMarker = function(position, label, map)
{
    let marker = new google.maps.Marker({
        position: position,
        label: label.toString(),
        map: map
    });
    markers.push(marker);
}


let get_directions_url = function(route)
{
    let url = 'https://www.google.com/maps/dir/';
    for(let location of route)
    {
        let coordinate = coordinates[location];
        let str = coordinate[0].toString() + ','+coordinate[1].toString()+'/';
        url += str;
    }
    return url;
}

let model1 = document.getElementById("modal1-challenge-statement");

document.getElementById("model1-show-button").onclick = function() {model1.classList.add("active");};

document.getElementById("model1-close-button2").onclick = function(){model1.classList.remove("active");};

document.getElementById("model1-close-button").onclick = function(){model1.classList.remove("active");};

