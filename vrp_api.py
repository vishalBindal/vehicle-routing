import falcon
import json
import json_answer as vrpjson
 
ALLOWED_ORIGINS = ['http://localhost','https://vishalbindal.github.io', 'http://vishalbindal.github.io',
'https://vishalbindal.github.io/vehicle-routing', 'http://vishalbindal.github.io/vehicle-routing',
 'https://vishalbindal.github.io/', 'https://vishalbindal.github.io/vehicle-routing/', 
'http://vishalbindal.github.io/vehicle-routing/', 'http://vishalbindal.github.io/']
 
class CorsMiddleware(object):
    def process_request(self, request, response):
        origin = request.get_header('Origin')
        if origin is not None and origin in ALLOWED_ORIGINS:
            response.set_header('Access-Control-Allow-Origin', origin)
        else:
            response.set_header('Access-Control-Allow-Origin', '*')
        response.set_header("Access-Control-Allow-Credentials", "true")
        response.set_header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
        response.set_header("Access-Control-Allow-Headers", 
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")

class VehicleRoutingResource(object):
    def on_get(self, req, resp):
        #Handles GET requests
         
        resp.status = falcon.HTTP_200  # This is the default status
 
        resp.body =  json.dumps({})
 
    def on_post(self, req, resp):
        try:
            body = req.stream.read()
            body_json = json.loads(body.decode('utf-8'))
            cfg = body_json["cfg"]
            resp.status = falcon.HTTP_200
            resp.body = vrpjson.main(cfg)
        except:
            result = {"solution":False, "error-messsage":"Invalid request cfg data"}
            json_body = json.dumps(result, sort_keys=True)
            resp.status = falcon.HTTP_200
            resp.body = json_body
 

app = application = falcon.API(middleware=[CorsMiddleware()])
# Resources are represented by long-lived class instances
vrpapi = VehicleRoutingResource()
 
# ApiTestResource will handle all requests to the '/apitest' URL path
app.add_route('/vrpapi', vrpapi)
