from flask import Flask,render_template
from flask_cors import CORS
from flask import request,jsonify
import os
import json
from dotenv import load_dotenv
import requests
from requests import get, post, put
import firebase_admin
from firebase_admin import credentials, firestore
import heapq

#set up the flask to recieve requests from front end
app = Flask(__name__)

#to allow CORS from front end

'''
taken from the flask demo from earlier milestone
we are incorporating an external api (Google maps) 
and will need these
'''

CORS(app)


load_dotenv()
CTA_Train_Key = os.getenv('CTA_TRAIN_API_KEY')
CTA_Bus_Key = os.getenv('CTA_BUS_API_KEY')
Firebase_Key = os.getenv('FIREBASE_API_KEY')
Google_Maps_Key = os.getenv('GOOGLE_MAPS_API_KEY')


cred = credentials.Certificate("../firebase.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

'''creating a User node that will be used when the username 
    has been read from the user

    Everything is set to be empty upon initialization this is for future
    implementation
'''
class User:
    def __init__(self)->None:
        self.userName = None
        self.friends = []
        self.email = None
        self.first_name = None
        self.last_name = None
        self.password = None
        self.routes = []
        return  
    def assign_values(self,dictionary)->None:
        # print( "HELLO")
        self.userName = dictionary.get('username')
        self.friends = dictionary.get('friends')
        self.email = dictionary.get('email')
        self.first_name = dictionary.get('first_name')
        self.last_name = dictionary.get('last_name')
        self.password = dictionary.get('password')
        # self.routes = dictionary.get('routes')
        return

class PlaceNode:
    def __init__(self,dist,dict=None,left=None,right=None)->None:
        self.left = left
        self.right = right
        self.dist = dist
        self.map = dict
        return
    def __lt__(self,other):
        return self.dist<other.dist

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


UserStructure = User()
Routes = []
TrieTree = Trie()
PlacesQueue = []

@app.route('/')
def root():
    # place= "41.6288754,-87.6837692"
    # embed_url = f"https://www.google.com/maps/embed/v1/place?key={Google_Maps_Key}&q={place}"
    # return render_template(embed_url = embed_url)
    return ''

#get the user's information from log in
@app.route('/getUserInfo', methods = ['GET'])
def getUserInfo():
    #gets the userID from the request from front end
    userID = request.args.get('userID')
    password = request.args.get('password')

    #just incase the request somehow doesn't have the userID, this will 
    #return no user entered (or if the user pressed log in on an empty field)
    if not userID:
        return jsonify({'Response': 'User not entered'}),400
    if not password:
        return jsonify({'Response': 'Password not entered'}),400


    #accessing the databse for the user
    doc = db.collection('Users').document(userID).get()
    
    #possibly incorporate a try catch
    # print("ALL GOOD")
    if doc.exists:
        doc_dict = doc.to_dict()
        userPassword = doc_dict.get('password',None)
        routes = db.collection('Users').document(userID).collection("routes").stream()
        # return jsonify(doc.to_dict())
        if userPassword == password:
            #print(doc_dict)
            # print(routes.to_dict())

            constructDataStructure(doc_dict)
            # print("ALMOST")
            count = 0
            for day in routes:
                indDay = day.to_dict()
                print(indDay)
                for route in indDay['routes']:
                    # print("INSIDE EMBEDDED")
                    try:
                        ori_lat,ori_lng = getLocationCoordinates(route['departLocation'])
                        dest_lat, dest_lng = getLocationCoordinates(route['arrivalLocation'])
                    except Exception as e:
                        return jsonify({'error': str(e)}), 500
                    
                    duration,distance = getRoute(ori_lat,ori_lng,dest_lat,dest_lng)
                    # print("AFTER INITIAL CALLS")
                    route['arrivalTime'] = calculateArrival(route['departTime'], duration)
                    route['distance'] = convertToMiles(distance)

                    hours, minutes = convert_seconds_to_hours_minutes(duration)
                    route['duration'] = {'hours':hours,'minutes':minutes}
                    route['day'] = indDay['day']
                    addRouteToUser(route)
            # print("STILL OKAY")
            populateRoutesMap()
            buildTrie()
            return jsonify({'Response': 'All good!'}),200
        else:
            return jsonify({'Response':'Wrong Password'}),400
    
    #this will return if the user attempted to log in with a username
    #that does not exist
    else:
        return jsonify({'Response':'User does not exist'}),400
    

def constructDataStructure(dictionary):
     global UserStructure
     UserStructure.assign_values(dictionary)
     return

def addRouteToUser(route_map):
    UserStructure.routes.append(route_map)
    return

def populateRoutesMap():
    global Routes
    if(UserStructure.routes != None):
        for route_name, route_map in UserStructure.routes.items():
    
            if(UserStructure.routes != None):
                for route_map in UserStructure.routes:
                    Routes.append(route_map)
    return
    
@app.route('/getFriends',methods=['GET'])
def getFriendsList():
    return UserStructure.friends

@app.route('/getSavedRoutes',methods=['GET'])
def getSavedRoutes():
    '''
    This returns a map of different routes
        'Commuter
    '''
    return Routes

@app.route('/getFirstName',methods=['GET'])
def getFirstName():
    return {"name":UserStructure.first_name}

@app.route('/getLastName',methods=['GET'])
def getLastName():
    return {"name":UserStructure.last_name}

@app.route('/getEmail',methods=['GET'])
def getEmail():
    return {"email":UserStructure.email}

@app.route('/getUsername',methods=['GET'])
def getUsername():
    return {"user":UserStructure.userName}

@app.route('/createUser',methods=['POST'])
def addUser():
    data = request.json
    #grabs the userID from the request to accuratly create the account
    userID = data.get('username')

    # Check if the user already exists
    user_ref = db.collection("Users").document(userID)
    if user_ref.get().exists:
        return jsonify({'Message': 'Username already exists!'}), 409  # 409 = Conflic

    #saving data in the Users collection
    db.collection("Users").document(userID).set(data)

    # Create an empty 'routes' subcollection by adding a placeholder document
    routes_ref = user_ref.collection('routes')
    routes_ref.document('placeholder').set({'placeholder': True})

    return jsonify({'Message':'Profile successfully sent!'})

@app.route('/addRouteE', methods=['POST'])
def addRouteE():
    userID = UserStructure.userName
    data = request.json
    print(data)
    lat_origin,lon_origin = getLocationCoordinates(data['departLocation'])
    lat_dest,lon_dest = getLocationCoordinates(data['arrivalLocation'])

    commuterBuddies = []
    for user in data['selectedOptions']:
        commuterBuddies.append(user[0])
    geoLocations = {
        'origin':{'address': data['departLocation'],'lat': str(lat_origin), 'lon':str(lon_origin)},
        'dest':{'address':data['arrivalLocation'],'lat':str(lat_dest), 'lon':str(lon_dest)}
    }

    # print(commuterBuddies)
    postString = {
        'Commuter_Buddies': commuterBuddies,
        'Method':'WALK',
        'geoLocations': geoLocations,
        'Title': data['commuteTitle'],
        'Depart':data['departTime']
    }
    routes = UserStructure.routes
    numOfEntries = len(routes)
    name = 'route'+str(numOfEntries)
    routes[name] = postString
    reference = db.collection('Users').document(userID)

    try:
        reference.update({'routes':routes})
        constructDataStructure(db.collection('Users').document(userID).get().to_dict())
        populateRoutesMap()
    except Exception as e:
        print(f"Error! : {e}")
    return jsonify({'Message':'Route successfully sent!'})

@app.route('/SaveUserChanges',methods=['POST'])
def saveUserChanges():
    data = request.json
    # print(data)
    OriginalUserID = request.args.get('userID')
    # print(OriginalUserID)

    tempRoutes = []
    tempRoutes = UserStructure.routes

    newUser = OriginalUserID
    newEmail = UserStructure.email
    newFirst = UserStructure.first_name
    newLast = UserStructure.last_name
    newPass = UserStructure.password

    if(data['username']!='') and (newUser!=data['username']):
        newUser = data['username']

    if(data['email']!='') and (newEmail != data['email']):
        newEmail = data['email']

    if(data['first_name']!='') and (newFirst != data['first_name']):
        newFirst = data['first_name']

    if(data['last_name']!='') and (newLast != data['last_name']):
        newLast = data['last_name']
    
    if(data['password']!='') and (newPass != data['password']):
        newPass = data['password']

    newData = {
        'username': newUser,
        'first_name':newFirst,
        'last_name':newLast,
        'email':newEmail,
        'password':newPass,
        'routes':tempRoutes,
        'friends':UserStructure.friends
    }

    db.collection('Users').document(OriginalUserID).delete()

    db.collection('Users').document(newUser).set(newData)
    constructDataStructure(newData)

    

    return jsonify({'Message':'Data Saved Sucessfully'})

@app.route('/createRoute', methods=['POST'])
def addRoute():
    try:
        data = request.json
        print(f"Received data: {data}")
        
        userID = data.get('username')
        route = data.get('route')
        
        if not userID:
            return jsonify({'Message': 'Username not provided'}), 400
        
        if not route:
            return jsonify({'Message': 'Route data not provided'}), 400
        
        if 'day' not in route:
            return jsonify({'Message': 'Day not specified in route'}), 400
            
        # Ensure route contains all required fields
        route_data = {
            'friends': route.get('friends', []),
            'departTime': route.get('departTime', ''),
            'departLocation': route.get('departLocation', ''),
            'arrivalLocation': route.get('arrivalLocation', ''),
            'commuteTitle': route.get('commuteTitle', '')
        }
        
        # Flatten the array if the 'friends' field is a nested list
        if isinstance(route_data['friends'], list):
            flattened_friends = []
            for friend in route_data['friends']:
                if isinstance(friend, list) and len(friend) > 0:
                    flattened_friends.append(friend[0])
                else:
                    flattened_friends.append(friend)
            route_data['friends'] = flattened_friends
        
        # Reference the user's routes collection and the day of the week
        routes_ref = db.collection("Users").document(userID).collection('routes')
        day_ref = routes_ref.document(route['day'])  # Reference the specific day of the week
        
        # Get the current data for the day (if exists)
        day_doc = day_ref.get()
        
        if day_doc.exists:
            # If the day document exists, we add the new route to the existing routes array
            existing_routes = day_doc.to_dict().get('routes', [])
            existing_routes.append(route_data)
            day_ref.update({'routes': existing_routes})  # Update the day document with the new route
        else:
            # If the day document doesn't exist, create it with the new route
            day_ref.set({
                'day': route['day'],
                'routes': [route_data]
            })

        return jsonify({'Message': 'Route successfully added to the day!'})
    
    except Exception as e:
        print(f"Error in addRoute: {str(e)}")
        return jsonify({'Message': f'Server error: {str(e)}'}), 500

@app.route('/getFriendsAuto',methods=['GET'])
def getFriendsAuto():
    userRequest = request.args.get('userSearch')
    print(userRequest)
    result = TrieTree.search(userRequest)

    if(result != None):
        return jsonify({'Result':result})
    else:
        return jsonify({'Result':'NONE FOUND'})

#gets routes for that single day
@app.route('/getUsersRoutes', methods = ['GET'])
def getUsersRoutes():
    try:
        # Get the userID from the request
        userID = request.args.get('userID')

        # Check if userID was provided
        if not userID:
            return jsonify({'Response': 'User not entered'}), 400
   
        # Get today's day of the week
        from datetime import datetime
        today = datetime.now().strftime('%A')  # This returns the full day name like 'Monday', 'Tuesday', etc.
        
        # Get the specific route document for today
        route_ref = db.collection('Users').document(userID).collection('routes').document(today)
        route_doc = route_ref.get()

        print(route_doc.to_dict())
        print('\n\n')


        #  duration,distance = getRoute(route_map['geoLocations']['origin']['lat'],
        #                                 route_map['geoLocations']['origin']['lon'],
        #                                 route_map['geoLocations']['dest']['lat'],
        #                                 route_map['geoLocations']['dest']['lon'])
            
        #     arrivalTime = calculateArrival(route_map['Depart'], duration)
        #     distance = convertToMiles(distance)

        #     route = {
        #         'Title': route_map['Title'],
        #         'Origin': route_map['geoLocations']['origin']['address'],
        #         'Dest': route_map['geoLocations']['dest']['address'],
        #         'Depart': route_map['Depart'],
        #         'Buddies': route_map['Commuter_Buddies'],
        #         'Arrive':arrivalTime,
        #         'Dist':distance,
        #         'Durr':duration
        #     }

        routes = route_doc.to_dict()
        #for route in routes['routes']:
           # route['arrivalTime']
        
        if route_doc.exists:
            # Return just today's route
            return jsonify({'routes': route_doc.to_dict()})
        else:
            # No route exists for today
            return jsonify({'Response': f'No route found for {today}'}), 404
            
    except Exception as e:
        print(f"Error in getUsersRoutes: {str(e)}")
        return jsonify({'Message': f'Server error: {str(e)}'}), 500
    
    #this will return if the user attempted to log in with a username
    #that does not exist
    else:
        return jsonify({'Response':'User does not exist'}),400
'''
This one might not need a path and would be a helper function depending on 
the implementation (this is before conversing with the rest of the team)
'''
@app.route('/getLocationName', methods = ['GET'])
def getLocationName():

    #baseurl that we will use for the call
    baseURL = 'https://maps.googleapis.com/maps/api/geocode/json?'

    #changes the request into json so that we can access the different components
    data = request.json
    latitude = data.get('LAT')
    longitude = data.get("LON")

    #this builds the second half of api call
    string = f'latlng={latitude},{longitude}&key={Google_Maps_Key}'

    #takes in the response from making the call
    response = requests.get(baseURL+string)

    #TODO --> IMPLEMENT EDGE CASES OF ERROR 404 (Invalid address or coordinates)

    #formats the response for accessing 
    json_results = json.loads(response.content)

    #this will return the first element of the results which will contain the 
    #full address that would be used for a map ie. 78 W Western Ave, Chicago, IL
    return json_results['results'][0]['formatted_address']

# API Call to get the coordinates from an address
@app.route('/getLocationCoordinatesFromAddress', methods=['GET'])
def getLocationCoordinatesFromAddress():
    # For GET requests, use request.args instead of request.json
    locationName = request.args.get('locationName')
    
    if not locationName:
        return jsonify({'error': 'No location name provided'}), 400
    
    try:
        lat, lon = getNewLocationCoordinates(locationName)
        return jsonify({'lat': lat, 'lon': lon})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Function to extract the lat and lon values from the location name from the api call above
def getNewLocationCoordinates(locationName):
    # baseURL take from the website that will allow us to build call
    baseURL = "https://maps.googleapis.com/maps/api/geocode/json?"
    
    # No need to access request.json here as locationName is passed as parameter
    address = locationName
    
    # this will be the address with the special characters replaced with their counterparts for web encoding
    address_string = replaceSpecialCharacters(address)
    
    # building full call
    string = f'address={address_string}&key={Google_Maps_Key}'
    # print(baseURL+string)
    
    # get call and load it in with json
    response = get(baseURL+string)
    json_results = json.loads(response.content)
    # print(json_results)
    
    # Add error handling for empty results
    if not json_results.get('results'):
        raise Exception("No results found for this location")
    
    try:
        # Check if this is the correct path for your API response
        # You might need to adjust this based on the actual Google Maps API response structure
        location_coords = json_results['results'][0]['geometry']['location']
        
        # Google Maps API typically returns lat/lng not latitude/longitude
        latitude = location_coords['lat']
        longitude = location_coords['lng']
        
        return (latitude, longitude)
    except KeyError as e:
        # Better error handling with detailed message
        raise Exception(f"Could not parse location coordinates: {str(e)}, Response: {json_results}")


#@app.route('/getLocationCoordinates',methods = ['GET'])
def getLocationCoordinates(locationName):

    #baseURL take from the website that will allow us to build call
    baseURL = "https://maps.googleapis.com/maps/api/geocode/json?"

    # data = request.json
    address = locationName
    print(address)
    #this will be the address with the special characters replaced with their counterparts for web encoding
    address_string = replaceSpecialCharacters(address)

    #building full call
    string = f'address={address_string}&key={Google_Maps_Key}'
    # print(baseURL+string)
    #get call and load it in with json
    response = get(baseURL+string)
    json_results = json.loads(response.content)
    for result in json_results['results'][0]:
        print(result)
        print(json_results['results'][0][result])
        # for subresult in result:
        #     print(f'          {subresult}')
    #TODO---> IMPLEMENT EMPTY RESPONSE CASE

    '''this parses the response fully so that we get the accurate latitude and longitude
     there are various possible coordinates that are usable so this was to be as specific as possible
     location_coords is a map with two elements now --> {latitude: x.x, longitude: x.x} '''
    location_coords = json_results['results'][0]['geometry']['location']
    print(location_coords)

    latitude = location_coords['lat']
    longitude = location_coords['lng']

    return (latitude,longitude)
    #print(f"{latitude}   {longitude}")

'''This is a helper function that is called from getLocationCoordinates()
    It is meant to replace any special characters explicitly stated by the Google API Documentation
    to prevent errors when calling the API

    Goes through the string character by character, building a new string. 
    Everytime it encounters a special character, it instead adds a specified code in its place
    returns the new string that will be used for the api call
'''
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

# @app.route('/getRoute',methods=['GET'])
def getRoute(lat_origin,lon_origin,lat_dest,lon_dest):
    baseURL = "https://routes.googleapis.com/directions/v2:computeRoutes"
    
    travelMode = "WALK"

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
        "routingPreference":None,
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
    # print(response.status_code)
    json_results = json.loads(response.content)

    duration = json_results['routes'][0]['duration']
    distance = json_results['routes'][0]['distanceMeters']
    return (duration,distance)

def calculateArrival(depart,duration):
    depart = depart.replace("A","")
    depart = depart.replace("P","")
    depart = depart.replace("M","")
    index = depart.find(':')

    hour = int(depart[:index])
    minutes = int(depart[index+1:])

    duration_seconds = int(duration.replace("s", ""))
    duration_minutes = duration_seconds // 60  # integer division

    minutes += duration_minutes

    hour += minutes // 60
    minutes = minutes % 60

    hour = hour % 24

    arrival_time = f"{hour:02}:{minutes:02}"

    return arrival_time

def convert_seconds_to_hours_minutes(secondString):
    seconds = int(secondString.replace('s',""))
    hours = seconds // 3600
    remaining_seconds = seconds % 3600
    minutes = remaining_seconds // 60
    return hours, minutes

def convertToMiles(distance):
    miles = distance / 1609.344
    return miles

@app.route('/buildPQ',methods=['POST'])
def getPlacesPQ():
    # da = request.json()
    PlacesQueue.clear()
    data =  request.get_json()
    locs = data.get('locs')
    print(locs)
    locationsArray = compressArray(locs)
    # print(locationsArray)
    getPlaces(locationsArray)

    return jsonify({'Message':'allGood'})

def compressArray(array):
    tmp = []
    for index in array:
        tmp.append(index)
    return tmp

def collectPlaces(node, places):
    if node is None:
        return

    # Only add if the node is a leaf
    if node.left is None and node.right is None:
        if node.map is not None and node.map != {}:
            places.append(node.map)
    
    collectPlaces(node.left, places)
    collectPlaces(node.right, places)

@app.route('/getPlaces', methods=['GET'])
def getPlacesArray():
    PlacesArray = []
    if PlacesQueue:  # Check if queue is not empty
        root = PlacesQueue[0]  # Get the root node
        collectPlaces(root, PlacesArray)
     # Remove duplicates
    unique_places = []
    seen = set()

    for place in PlacesArray:
        place_key = str(place)  # Or better: place['name'] if possible
        if place_key not in seen:
            unique_places.append(place)
            seen.add(place_key)

    return jsonify({'Places': unique_places})

@app.route('/getPlaces',methods=['GET'])
def getPlacesArray():
    PlacesArray = []
    while(len(PlacesQueue)>0):
        node = heapq.heappop(PlacesQueue)
        PlacesArray.append(node)
    return jsonify({'Places':PlacesArray})

def getPlaces(locationTypes):
    global PlacesQueue
    baseURL = "https://places.googleapis.com/v1/places:searchNearby"

    #fast food  ---> fast_food_restaurant
    #cafe        --> cafe
    #groceries   --> grocery_store
    #library     --> library
    #bus station  -> bus_station
    #train station > train_station

    # : bus, train, groceries, cafe, fast, library
    locations = []

    if locationTypes == None:
        locations = ["cafe","library", "bus_station","train_station","grocery_store","fast_food_restaurant"]
    else:
        for types in locationTypes:
            if types == 'bus':
                locations.append('bus_station')
            elif types == 'cafe':
                locations.append('cafe')
            elif types == 'groceries':
                locations.append('grocery_store')
            elif types == 'fast':
                locations.append('fast_food_restaurant')
            elif types == 'train':
                locations.append('train_station')
            elif types == 'library':
                locations.append('library')

    # if len(locationTypes) == 0:
    #     locations = ["cafe","library", "bus_station","train_station","grocery_store","fast_food_restaurant"]
    # print(locations)
    origin_lat = 41.8719456
    origin_lng = -87.6474381

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": Google_Maps_Key,
        "X-Goog-FieldMask": 'places.displayName,places.formattedAddress,places.location'
    }

    query_string={
        "includedTypes": locations,
        "maxResultCount": 20, #range from 1-20
        # "rankPreference": "DISTANCE",
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": origin_lat,
                    "longitude": origin_lng},
                    "radius": 1600.0
                }
  }
    }
    response = post(baseURL,headers=headers,data=json.dumps(query_string))
    # print(response.status_code)
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

        duration,distance = getRoute(origin_lat,origin_lng,lat,lng)

        address = place['formattedAddress']
        key = displayName.replace(" ", "")

        placeInfo = {  
            'key':key,
            'name':displayName,
            'address':address,
            'location':location
        }

        heapq.heappush(PlacesQueue,PlaceNode(distance*100,placeInfo))
        #print(f"{placeInfo}\n")

    heapq.heapify(PlacesQueue)

    while(len(PlacesQueue)!=1):
        leftNode = heapq.heappop(PlacesQueue)
        rightNode = heapq.heappop(PlacesQueue)
        # print("INSIDE WHILE LOOP")
        parentNode = PlaceNode(leftNode.dist+rightNode.dist)
        parentNode.left = leftNode
        parentNode.right = rightNode

        heapq.heappush(PlacesQueue,parentNode)
    return

def accessUsers():
    docs = db.collection('Users').stream()
    users = []
    for names in docs:
        users.append(names.id)
    return users

def buildTrie():
    global TrieTree

    users = accessUsers()

    for user in users:
        TrieTree.insert(user)

    return

@app.route('/getMap', methods=['GET'])
def getMap():
    baseURL = "https://www.google.com/maps/embed/v1/directions?"

    data = request.json
    lat_origin = data['oLat']
    lon_origin = data['oLon']
    lat_dest = data['dLat']
    lon_dest = data['dLon']

    string = f'key={Google_Maps_Key}&origin={lat_origin},{lon_origin}&destination={lat_dest},{lon_dest}'
    response = request.get(baseURL+string)


    return ''
@app.route('/getSpecificEvent', methods=['GET'])
def getSpecificEvent():
    # Gets the event ID from the request from front end
    event_id = request.args.get('id')
    
    if not event_id:
        return jsonify({'message': 'Missing event ID in request'}), 400

    # Accessing the database for the event
    try:
        doc = db.collection('Events').document(event_id).get()
        
        if doc.exists:
            doc_dict = doc.to_dict()
            return jsonify(doc_dict), 200
        else:
            return jsonify({'message': 'Event does not exist'}), 404
    except Exception as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    
@app.route('/getCommunityEvents', methods=['GET'])
def getCommunityEvents():
    try:
        events_ref = db.collection('Events')
        docs = events_ref.stream()

        events_list = []
        for doc in docs:
            event_data = doc.to_dict()
            # Include the document ID in the returned data
            event_data['id'] = doc.id
            events_list.append(event_data)

        return jsonify(events_list), 200
    except Exception as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500

      
@app.route('/updateSpecificCommunityEvent', methods=['POST'])
def updateSpecificCommunityEvent():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data received'}), 400
            
        event_data = data.get('event')
        event_id = data.get('id')

        if not event_data or not event_id:
            return jsonify({'message': 'Missing event or id in request body'}), 400

        # Check for required event fields
        required_fields = ['Name', 'Date', 'Time', 'Location', 'Description', 'Email', 'Color', 'Type']
        missing_fields = [field for field in required_fields if field not in event_data or not event_data[field]]
        
        if missing_fields:
            return jsonify({'message': f'Missing required event fields: {", ".join(missing_fields)}'}), 400
            
        # Reference the events collection and the specific document
        events_ref = db.collection("Events").document(event_id)
        
        # Check if the event exists before updating
        if not events_ref.get().exists:
            return jsonify({'message': 'Event not found'}), 404
            
        # Update the document
        events_ref.set(event_data)
    
        return jsonify({'message': 'Event successfully updated!', 'id': event_id}), 200

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500


@app.route('/setCommunityEvents', methods=['POST'])
def setCommunityEvents():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data received'}), 400
            
        event_data = data.get('event')
        event_id = data.get('random_id')  # Consider renaming this parameter to 'id' for consistency

        if not event_data or not event_id:
            return jsonify({'message': 'Missing event or id in request body'}), 400
        
        # Check for required event fields
        required_fields = ['Name', 'Date', 'Time', 'Location', 'Description', 'Email', 'Color', 'Type']
        missing_fields = [field for field in required_fields if field not in event_data or not event_data[field]]
        
        if missing_fields:
            return jsonify({'message': f'Missing required event fields: {", ".join(missing_fields)}'}), 400
            
        # Reference the events collection and the specific document
        events_ref = db.collection("Events").document(event_id)
        
        # Create/Set the document
        events_ref.set(event_data)
    
        return jsonify({'message': 'Event successfully created!', 'id': event_id}), 201

    except Exception as e:
            return jsonify({'message': f'An error occurred: {str(e)}'}), 500


@app.route('/deleteSpecificCommunityEvent', methods=['POST'])
def deleteSpecificCommunityEvent():
    try:
        event_id = request.args.get('id')

        if not event_id:
            return jsonify({'message': 'Missing event id in request body'}), 400
            
        # Reference the events collection and the specific document
        event_ref = db.collection("Events").document(event_id)
        
        # Check if the event exists before deleting
        doc = event_ref.get()
        if not doc.exists:
            return jsonify({'message': 'Event not found'}), 404
            
        # Delete the document
        event_ref.delete()
    
        return jsonify({'message': 'Event successfully deleted', 'id': event_id}), 200


    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500


    except Exception as e:
        print(f"Error in addCommunityEvent: {str(e)}")
        return jsonify({'message': f'Server error: {str(e)}'}), 500