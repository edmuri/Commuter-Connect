from requests import post,get,put
import jsonify
import json
#import polyline

Google_Maps_Key = "AIzaSyAQQvBdh32RvEG2Xq86OhatgkozlCAdd8E"

def getLocationName():

    baseURL = 'https://maps.googleapis.com/maps/api/geocode/json?'

    # data = request.json
    # latitude = data.get('LAT')
    # longitude = data.get("LON")
    latitude = 41.6288754
    longitude = -87.6837692
    string = f'latlng={latitude},{longitude}&key={Google_Maps_Key}'

    response = get(baseURL+string)

    json_results = json.loads(response.content)

    #print(json_results)
    print(json_results['results'][0]['formatted_address'])
    
def getLocationCoordinates():
    baseURL = "https://maps.googleapis.com/maps/api/geocode/json?"

    address = "14527 S Palmer Ave, Posen, IL"
    address2 = "750 S Halsted St, Chicago, IL"
    address_string = replaceSpecialCharacters(address2)

    string = f'address={address_string}&key={Google_Maps_Key}'
    
    response = get(baseURL+string)

    json_results = json.loads(response.content)
    # print(json_results)
    location_coords = json_results['results'][0]['geometry']['location']
    #location_coords = json_results['results'][0]['navigation_points'][0]['location']

    latitude = location_coords['lat']
    longitude = location_coords['lng']

    print(f"{latitude}   {longitude}")
    # print(json_results['results'][0]['navigation_points'][0]['location'])


def replaceSpecialCharacters(string):
    newString=""
    for char in string:
        match char:
            case " ":
                newString += "%20"
            case "\"":
                newString += "%22"
            case "<":
                newString += "%3C"
            case ">":
                newString += "%3E"
            case "#":
                newString += "%23"
            case "%":
                newString += "%25"
            case "|":
                newString += "%7C"
            case _:
                newString+=char
    return newString

def getRoute():
    baseURL = "https://routes.googleapis.com/directions/v2:computeRoutes"

    lat_origin = 41.6288754
    lon_origin = -87.6837692
    lat_dest = 41.6402277
    lon_dest = -87.718246
    travelMode = "DRIVE"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": Google_Maps_Key,
        "X-Goog-FieldMask": 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
    }

    query_string = {
        "origin":{
            "location":{
                "latLng":{
                    "latitude": lat_origin,
                    "longitude": lon_origin
                }
            }
        },
        "destination":{
            "location":{
                "latLng":{
                    "latitude": lat_dest,
                    "longitude": lon_dest
                }
            }
        },
        "travelMode": travelMode,
        "routingPreference":"TRAFFIC_AWARE",
        "computeAlternativeRoutes": False,
        "routeModifiers": {
            "avoidTolls": False,
            "avoidHighways": False,
            "avoidFerries": False
        },
        "languageCode": "en-US",
        "units": "IMPERIAL"
    }

    response = post(baseURL,headers=headers,data=json.dumps(query_string))
    print(response.status_code)
    json_results = json.loads(response.content)

    print(json_results)

def createMap():
    return ''

def getPlaces():
    baseURL = "https://places.googleapis.com/v1/places:searchNearby"

    #fast food  ---> fast_food_restaurant
    #cafe        --> cafe
    #groceries   --> grocery_store
    #library     --> library
    #bus station  -> bus_station
    #train station > train_station



    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": Google_Maps_Key,
        "X-Goog-FieldMask": 'places.displayName,places.formattedAddress,places.location'
    }

    query_string={
        "includedTypes": ["cafe","library", "bus_station","train_station","grocery_store","fast_food_restaurant"],
        "maxResultCount": 20, #range from 1-20
        "rankPreference": "DISTANCE",
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": 41.8719456,
                    "longitude": -87.6474381},
                    "radius": 1600.0
                }
  }
    }
    response = post(baseURL,headers=headers,data=json.dumps(query_string))
    print(response.status_code)
    json_results = json.loads(response.content)

    places = json_results['places']

    count=0
    for place in places:
        displayName = place['displayName']['text']
        lat = place['location']['latitude']
        lng = place['location']['longitude']

        location = {
            'lat':lat,
            'lng':lng
        }

        address = place['formattedAddress']
        key = displayName.replace(" ", "")

        placeInfo = {
            
            'key':key,
            'name':displayName,
            'address':address,
            'location':location
        }
        # print(f"{placeInfo}\n")

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.username = None  # Store just the username at end nodes

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, username):
        """
        Inserts a username into the Trie.
        """
        node = self.root
        for char in username.lower():
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.username = username  # Store the original username (preserving case)

    def search(self, prefix):
        """
        Returns a list of usernames matching the prefix for autocomplete.
        """
        node = self.root
        for char in prefix.lower():
            if char not in node.children:
                return []  # Prefix not found
            node = node.children[char]
        
        # Collect all usernames that match the prefix
        results = []
        self._collect_usernames(node, results)
        return results

    def _collect_usernames(self, node, results):
        """
        Recursively collects all usernames from this node downward.
        """
        if node.is_end_of_word and node.username:
            results.append(node.username)
        
        for child in node.children.values():
            self._collect_usernames(child, results)

    def exact_search(self, username):
        """
        Returns True if the exact username exists in the trie.
        """
        node = self.root
        for char in username.lower():
            if char not in node.children:
                return False
            node = node.children[char]
        
        return node.is_end_of_word

# getLocationName()

# getLocationCoordinates()

# getRoute()

# getPlaces()

def getSearch():

    TrieTree = Trie()
    IDs = [
        'Eddie',
        'Edna',
        'Zeel',
        'Flori',
        'Frances',
        'Lorena',
        'He',
        'Jason',
        'Julia',
        'Edd',
        'Basil',
        'Jonathan'
    ]

    for name in IDs:
        TrieTree.insert(name)
    

    return TrieTree.search('E')

print(getSearch())