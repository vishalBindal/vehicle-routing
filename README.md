# Vehicle routing!

This is an implementation of the capacitated vehicle routing problem (CVRP), which can be used to determine delivery of groceries given the following data:
- Coordinates (lat/long) of locations, including the depot
- The demand at each location
- The number of available vehicles, and the capacity of each vehicle

For solving the CVRP, Google OR-tools are used, alongwith the google distance matrix API to calculate the (real-world) time taken to traverse between the given locations.

## Instructions to run
Note: python3 and pip should be installed

- Clone the repo and change to the main directory

- Create a file 'key.py' with the contents:
``` 
API_KEY = your_api_key
```
Replace your_api_key with your own API key with google distance matrix API enabled.

- Run:
```
pip install falcon cython gunicorn
gunicorn vrp_api -b :16000 --reload
```
You can replace 16000 with any other port of your choice

- Open index.html in your browser. Enter the values and click on 'generate results'.
