import falcon
import json
import json_answer as vrpjson
 
ALLOWED_ORIGINS = ['http://localhost']
 
class CorsMiddleware(object):
    def process_request(self, request, response):
        origin = request.get_header('Origin')
        if origin is not None and origin in ALLOWED_ORIGINS:
            response.set_header('Access-Control-Allow-Origin', origin)
        response.set_header('Access-Control-Allow-Origin', '*')

class VehicleRoutingResource(object):
    def on_get(self, req, resp):
        #Handles GET requests
         
        resp.status = falcon.HTTP_200  # This is the default status
 
        resp.body =  json.dumps({})
 
    def on_post(self, req, resp):
        try:
            body = req.stream.read()
            print("\n\n",body,"\n\n")
            body_json = json.loads(body.decode('utf-8'))
            cfg = body_json["cfg"]
        except KeyError:
            raise falcon.HTTPBadRequest(
            'Missing Config',
            'A config (cfg) must be submitted in the request body.')
 
        resp.status = falcon.HTTP_200
        resp.body = vrpjson.main(cfg)
 
# falcon.API instances are callable WSGI apps
app = application = falcon.API(middleware=[CorsMiddleware()])
 
# Resources are represented by long-lived class instances
vrpapi = VehicleRoutingResource()
 
# ApiTestResource will handle all requests to the '/apitest' URL path
app.add_route('/vrpapi', vrpapi)