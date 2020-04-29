import json
import solver as sv
 
def get_json_response(cfg):
    addresses = cfg['addresses']
    cfg['addresses'] = [(int(x), int(y)) for (x,y) in addresses]
    cfg['depot'] = int(cfg['depot'])
    cfg['num_vehicles'] = int(cfg['num_vehicles'])
    result = sv.main(cfg)
    json_response = json.dumps(result, sort_keys=True)
    return json_response
 
def main(cfg):
    json_response = get_json_response(cfg)
    print(json_response)
    return json_response