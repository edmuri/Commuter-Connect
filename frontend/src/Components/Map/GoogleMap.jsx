import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from "@vis.gl/react-google-maps";
import React from "react";
import { useState } from "react";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const defaultCenter={ lat: 41.874450, lng: -87.656976 };

const locations = [
  { key: 'operaHouse', name: 'Opera House', address: '1200 W Harrison', location: { lat: -33.8567844, lng: 151.213108 } },
  { key: 'tarongaZoo', location: { lat: -33.8472767, lng: 151.2188164 } },
  { key: 'manlyBeach', location: { lat: -33.8209738, lng: 151.2563253 } },
  { key: 'hyderPark', location: { lat: -33.8690081, lng: 151.2052393 } },
  { key: 'theRocks', location: { lat: -33.8587568, lng: 151.2058246 } },
  { key: 'circularQuay', location: { lat: -33.858761, lng: 151.2055688 } },
  { key: 'harbourBridge', location: { lat: -33.852228, lng: 151.2038374 } },
  { key: 'kingsCross', location: { lat: -33.8737375, lng: 151.222569 } },
  { key: 'botanicGardens', location: { lat: -33.864167, lng: 151.216387 } },
  { key: 'museumOfSydney', location: { lat: -33.8636005, lng: 151.2092542 } },
  { key: 'maritimeMuseum', location: { lat: -33.869395, lng: 151.198648 } },
  { key: 'kingStreetWharf', location: { lat: -33.8665445, lng: 151.1989808 } },
  { key: 'aquarium', location: { lat: -33.869627, lng: 151.202146 } },
  { key: 'darlingHarbour', location: { lat: -33.87488, lng: 151.1987113 } },
  { key: 'barangaroo', location: { lat: -33.8605523, lng: 151.1972205 } },
];

const PoiMarkers = ({ pois }) => {
  const [selectedPoi, setSelectedPoi] = useState(null);
  return (
    <>
      {pois.map((poi) => (
        <AdvancedMarker key={poi.key} position={poi.location} onClick={() => setSelectedPoi(poi)}>
          <Pin background="#FBBC04" glyphColor="#000" borderColor="#000" />
        </AdvancedMarker>
      ))}
      {selectedPoi && (
        <InfoWindow
          position={selectedPoi.location}
          onCloseClick={() => setSelectedPoi(null)}
        >
          <div>
            <h4>{selectedPoi.name}</h4>
            <p>{selectedPoi.address}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

// Component to display route markers (departure and arrival)
const RouteMarkers = ({ departure, arrival }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // If either point is not provided, don't render anything
  if (!departure?.lat || !arrival?.lat) return null;
  
  // Create objects for departure and arrival points
  const departurePoint = {
    key: 'departure',
    name: 'Departure',
    address: 'Starting Point',
    location: { lat: parseFloat(departure.lat), lng: parseFloat(departure.lon || departure.lng || 0) }
  };
  
  const arrivalPoint = {
    key: 'arrival',
    name: 'Arrival',
    address: 'Destination',
    location: { lat: parseFloat(arrival.lat), lng: parseFloat(arrival.lon || arrival.lng || 0) }
  };
  
  return (
    <>
      {/* Departure Marker with green color */}
      <AdvancedMarker
        position={arrivalPoint.location}
      >
        <Pin background="#4CAF50" glyphColor="#FFF" borderColor="#000" />
      </AdvancedMarker>
      
      {/* Arrival Marker with red color */}
      <AdvancedMarker
        position={departurePoint.location}
      >
        <Pin background="#F44336" glyphColor="#FFF" borderColor="#000" />
      </AdvancedMarker>
      
      {/* Info window for selected point */}
      {selectedPoint && (
        <InfoWindow
          position={selectedPoint.location}
        >
          <div>
            <h4>{selectedPoint.name}</h4>
            <p>{selectedPoint.address}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const GoogleMapComponent = ({ center, departureCoords, arrivalCoords, showPois = false }) => {
  const [mapCenter, setMapCenter] = useState(center || defaultCenter);
  
  // Calculate new center point between departure and arrival if both exist
  useEffect(() => {
    if (departureCoords?.lat && arrivalCoords?.lat) {
      try {
        // Parse coordinates to ensure they're numbers
        const depLat = parseFloat(departureCoords.lat);
        const depLng = parseFloat(departureCoords.lon || departureCoords.lng || 0);
        const arrLat = parseFloat(arrivalCoords.lat);
        const arrLng = parseFloat(arrivalCoords.lon || arrivalCoords.lng || 0);
        
        // Calculate center between the two points
        const newCenter = {
          lat: (depLat + arrLat) / 2,
          lng: (depLng + arrLng) / 2
        };
        
        console.log("New map center:", newCenter);
        setMapCenter(newCenter);
      } catch (e) {
        console.error("Error calculating map center:", e);
      }
    } else if (center) {
      setMapCenter(center);
    }
  }, [departureCoords, arrivalCoords, center]);

  return (
    <APIProvider
    apiKey={API_KEY || ""}
    onLoad={() => console.log("Maps API has loaded.")}
  >
    <Map
      style={{ width: "1000px", height: "750px", alignContent: "center", margin: "50px" }}
      defaultZoom={15}
      mapId="1338f5e3b126e04c"
      defaultCenter={center || defaultCenter}
      onCameraChanged={(ev) =>
        console.log(
          "camera changed:",
          ev.detail.center,
          "zoom:",
          ev.detail.zoom
        )
      }
    >
      <PoiMarkers pois={locations} />
    </Map>
  </APIProvider>
  );
};

export default GoogleMapComponent;