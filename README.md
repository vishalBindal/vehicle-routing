<img src="src/images/logo.png" alt="CampusBidLogo" height="50px">

Frontend of the website is hosted at https://vishalbindal.github.io/vehicle-routing . **Note:** backend is not working currently thus see Setup Instructions below for deloying on localhost

## Description
This is an implementation of the capacitated vehicle routing problem (CVRP), which can be used to determine delivery of groceries given the following data:
- Coordinates (lat/long) of locations, including the depot.
- The demand at each location
- The number of available vehicles, and the capacity of each vehicle

For solving the CVRP, Google OR-tools are used, alongwith the google distance matrix API to calculate the (real-world) time taken to traverse between the given locations. For marking the coordinates conveniently, Google Maps Javascript API is used.

## Setup Instructions
Note: python3 and pip should be installed

- Clone the repo and change to the main directory

- Create a file 'key.py' with the contents:
``` python
API_KEY = 'your_api_key'
```
Replace your_api_key with your own API key enabled with Google distance matrix API.

- In the file 'index.html', at the bottom of the file
```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=API_KEY&callback=initMap"></script>
```
Replace API_KEY in the string with your own API key enabled with Google maps Javascript API.

- In main.js
```diff
- let post_url = "https://evening-sierra-28829.herokuapp.com/vrpapi"
+ let post_url = "http://localhost:16000/vrpapi"
```
because now you will host your backend at localhost

- Set up python packages

Check python version
```bash
$ python --version
```
**Note:** Make sure you have python 3.7 or less installed as optools is not supported on python 3.8 yet

Make a virtual environment (optional, and required python 3.3 or above)
```bash
$ python -m venv venv
$ source venv/bin/activate
```

Make sure ortools, falcon, cython and gunicorn are installed.
```bash
$ pip install ortools
$ pip install falcon cython gunicorn
```

After using, if using virtual environment, deactivate it
```bash
$ deactivate
```

## Instructions to run
- If packages were installed in virtual environment above, run
```bash
source venv/bin/activate
```
- Run the API at port 16000
```bash
$ gunicorn vrp_api -b :16000 --reload
```
- Open index.html in your browser. Click on the desired locations in the map and enter the demand associated with each location. Enter the number of vehicles, the capacity of each vehicle and the depot number. Click on 'generate results', and if everything is set up correctly you should see the results.
- After use, close the API at port 16000 using CTRL+C. If using virtual environment, deactivate by running
```bash
$ deactivate
```
