import json
import solver as sv
 
def get_json_response(cfg):
    addresses = cfg['addresses']
    cfg['addresses'] = [(float(x), float(y)) for (x,y) in addresses]
    cfg['depot'] = int(cfg['depot'])
    cfg['num_vehicles'] = int(cfg['num_vehicles'])
    demands = cfg['demands']
    cfg['demands'] = list(map(int,cfg['demands']))
    cfg['vehicle_capacities'] = list(map(int, cfg['vehicle_capacities']))
    result = sv.main(cfg)
    json_response = json.dumps(result, sort_keys=True)
    return json_response
 
def main(cfg):
    json_response = get_json_response(cfg)
    print(json_response)
    return json_response