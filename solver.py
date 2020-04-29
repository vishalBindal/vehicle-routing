"""Vehicles Routing Problem (VRP)."""

from __future__ import print_function
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import distance_matrix

def create_data_model(cfg):
    """Stores the data for the problem.
    cfg : {
        "addresses":[(x1,y1),(x2,y2),...(xn,yn)],
        "num_vehicles":n,
        "depot":i
    }
    """
    data = {}
    # data['distance_matrix'] = get_distance_matrix(cfg["addresses"])
    data['distance_matrix'] = distance_matrix.main(cfg['addresses'])
    data['num_vehicles'] = cfg["num_vehicles"]
    data['depot'] = cfg["depot"]
    data['demands'] = cfg['demands']
    data['vehicle_capacities'] = cfg['vehicle_capacities']
    return data

def get_solution(data, manager, routing, solution):
    """Prints solution on console."""
    total_distance = 0
    total_load = 0
    max_distance = 0
    vehicle_routes = []
    vehicle_distances = []
    vehicle_loads = []
    vehicle_load_details= []
    for vehicle_id in range(data['num_vehicles']):
        index = routing.Start(vehicle_id)
        route_distance = 0
        route_load = 0
        route_load_details = []
        route = []
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            route_load += data['demands'][node_index]
            route.append(node_index)
            route_load_details.append(route_load)
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(
                previous_index, index, vehicle_id)
        route.append(manager.IndexToNode(index))
        route_load_details.append(route_load)
        route_load_details = [(route_load - l) for l in route_load_details]
        total_distance += route_distance
        total_load += route_load
        if route_distance > max_distance:
            max_distance = route_distance
        vehicle_routes.append(route)
        vehicle_distances.append(route_distance)
        vehicle_loads.append(route_load)
        vehicle_load_details.append(route_load_details)
    result = {
        "solution":True,
        "routes":vehicle_routes,
        "distances":vehicle_distances,
        "max_distance":max_distance,
        "total_distance":total_distance,
        "total_load":total_load,
        "loads":vehicle_loads,
        "load_details":vehicle_load_details
    }
    return result

def main(cfg):
    """Solve the CVRP problem."""
    # Instantiate the data problem.
    data = create_data_model(cfg)
    print(data)

    # Create the routing index manager.
    manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']),
                                           data['num_vehicles'], data['depot'])

    # Create Routing Model.
    routing = pywrapcp.RoutingModel(manager)


    # Create and register a transit callback.
    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        # Convert from routing variable Index to distance matrix NodeIndex.
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    # Define cost of each arc.
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    def demand_callback(from_index):
        """Returns the demand of the node."""
        # Convert from routing variable Index to demands NodeIndex.
        from_node = manager.IndexToNode(from_index)
        return data['demands'][from_node]


    # Add Distance constraint.
    dimension_name = 'Distance'
    routing.AddDimension(
        transit_callback_index,
        0,  # no slack
        7200,  # vehicle maximum travel distance
        True,  # start cumul to zero
        dimension_name)

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        data['vehicle_capacities'],  # vehicle maximum capacities
        True,  # start cumul to zero
        'Capacity')

    # Setting first solution heuristic.
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

    # Solve the problem.
    solution = routing.SolveWithParameters(search_parameters)

    # Return solution dictionary
    if solution:
        return get_solution(data, manager, routing, solution)
    else:
        result = {
            "solution":False
        }
        return result
