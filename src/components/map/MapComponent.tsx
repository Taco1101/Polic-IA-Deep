import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 42.23,
  lng: -8.71,
};

const MapComponent: React.FC = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-full w-full bg-yellow-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow border border-yellow-200">
          <div className="text-2xl mb-2">🔑</div>
          <h3 className="font-bold text-yellow-700">Configuración Requerida</h3>
          <p className="text-sm text-yellow-600 mt-2">
            Agrega tu API Key de Google Maps en el archivo .env
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <LoadScript googleMapsApiKey={apiKey} libraries={["drawing"]}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
          {/* Mapa 100% limpio - sin interfaces obstructivas */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
