import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin
} from "@vis.gl/react-google-maps";
import React from "react";
import { useState, useEffect } from "react";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const defaultCenter = { lat: 41.874450, lng: -87.656976 };

// Component to display individual position markers
const PoiMarkers = ({ pois }) => {
  const [selectedPoi, setSelectedPoi] = useState(null);
  return (
    <>
      {pois.map((poi) => (
        <AdvancedMarker 
          key={poi.key} 
          position={poi.location} 
        >
          <Pin background="#FBBC04" glyphColor="#000" borderColor="#000" />
        </AdvancedMarker>
      ))}
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
        <Pin background="#7D91B8" glyphColor="#FFF" borderColor="#000" />
      </AdvancedMarker>
      
      {/* Arrival Marker with red color */}
      <AdvancedMarker
        position={departurePoint.location}
      >
        <Pin background="#5D576A" glyphColor="#FFF" borderColor="#000" />
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
        defaultZoom={13}
        mapId="1338f5e3b126e04c"
        center={mapCenter}
        defaultCenter={defaultCenter}
        onCameraChanged={(ev) =>
          console.log(
            "camera changed:",
            ev.detail.center,
            "zoom:",
            ev.detail.zoom
          )
        }
      >
      <RouteMarkers departure={departureCoords} arrival={arrivalCoords} />
      </Map>
    </APIProvider>
  );
};

export default GoogleMapComponent;