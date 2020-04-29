# Vehicle routing!

This is an implementation of the capacitated vehicle routing problem (CVRP), which can be used to determine delivery of groceries given the following data:
- Coordinates (lat/long) of locations, including the depot.
- The demand at each location
- The number of available vehicles, and the capacity of each vehicle

For solving the CVRP, Google OR-tools are used, alongwith the google distance matrix API to calculate the (real-world) time taken to traverse between the given locations. For marking the coordinates conveniently, Google Maps Javascript API is used.

## Instructions to run
Note: python3 and pip should be installed

- Clone the repo and change to the main directory

- Create a file 'key.py' with the contents:
``` 
API_KEY = 'your_api_key'
```
Replace your_api_key with your own API key enabled with Google distance matrix API.

- In the file 'index.html', at the bottom of the file
```
<script async defer src="https://maps.googleapis.com/maps/api/js?key=API_KEY&callback=initMap"></script>
```
Replace API_KEY in the string with your own API key enabled with Google maps Javascript API.

- Run:
```
pip install or-tools
pip install falcon cython gunicorn
gunicorn vrp_api -b :16000 --reload
```

- Open index.html in your browser. Click on the desired locations in the map and enter the demand associated with each location. Enter the number of vehicles, the capacity of each vehicle and the depot number. Click on 'generate results', and if everything is set up correctly you should see the results.
