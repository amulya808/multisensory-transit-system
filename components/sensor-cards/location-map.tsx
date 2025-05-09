"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library itself
import { useEffect } from 'react';


L.Icon.Default.mergeOptions({

    iconUrl: '/image/BusMapIcon.svg',
    iconRetinaUrl: '/image/BusMapIcon.svg',
    shadowUrl: '/leaflet/marker-shadow.png',

    iconSize: [40, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});


interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}


function ChangeView({ center, zoom }: { center: L.LatLngExpression, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);  
  return null;
}

function InvalidateSize() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log("Invalidating map size"); 
        }, 100); 

        return () => clearTimeout(timer); 
    }, [map]); 
    return null;
}


export function LocationMap({ latitude, longitude, zoom = 13 }: LocationMapProps) {
    const position: L.LatLngExpression = [latitude, longitude];

if (isNaN(latitude) || isNaN(longitude)) {
    console.error("Invalid coordinates received:", latitude, longitude);
    return <div className="flex items-center justify-center h-full text-destructive">Invalid Coordinates</div>;
}

return (
    <MapContainer
    attributionControl={false}
        center={position}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', outline: 'none' }}
    >
                 <LayersControl position="topright">
                <LayersControl.BaseLayer name="Street Map">
                    <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer checked name="Satellite">
                    <TileLayer
                        attribution='© <a href="https://www.esri.com">Esri</a>'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
      <Marker position={position}>
        <Popup>
          Bus Location: <br /> Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
        </Popup>
      </Marker>

      <ChangeView center={position} zoom={zoom} />
      <InvalidateSize /> 

    </MapContainer>
  );
}
