import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Import leaflet styles
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to dynamically pan/zoom map when coordinates change
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ lands = [], center = [6.9271, 79.8612], zoom = 12, height = '400px' }) {
  const mapCenter = lands.length === 1 && lands[0].coordinates 
    ? [lands[0].coordinates.lat, lands[0].coordinates.lng]
    : center;

  const validLands = lands.filter(l => l.coordinates && l.coordinates.lat && l.coordinates.lng);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 z-10" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validLands.map((land) => (
          <Marker 
            key={land._id} 
            position={[land.coordinates.lat, land.coordinates.lng]}
          >
            <Popup>
              <div className="p-1 min-w-[150px]">
                <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{land.title}</h4>
                <p className="text-xs text-green-600 font-extrabold mt-1">
                  Rs. {land.price.toLocaleString()} {land.sizeUnit === 'perch' ? '/ perch' : ''}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">{land.location}</p>
                <Link 
                  to={`/listings/${land._id}`} 
                  className="block text-center mt-2.5 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-semibold transition-colors"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        <ChangeMapView center={mapCenter} zoom={zoom} />
      </MapContainer>
    </div>
  );
}
