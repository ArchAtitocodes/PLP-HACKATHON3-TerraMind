import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker } from 'react-map-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN; // Needs to be added to .env

export default function MapView() {
  return (
    <div className="h-96 w-full rounded-lg shadow-md overflow-hidden">
      <Map
        initialViewState={{
          latitude: 37.7749,
          longitude: -122.4194,
          zoom: 10,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {/* Example marker */}
        <Marker longitude={-122.4194} latitude={37.7749} color="red" />
      </Map>
    </div>
  );
}