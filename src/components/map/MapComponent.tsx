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

  // Si no hay API Key, mostrar mensaje amigable
  if (!apiKey) {
    return (
      <div className="h-full w-full bg-yellow-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-yellow-300">
          <div className="text-3xl mb-3">🔑</div>
          <h3 className="text-xl font-bold text-yellow-700 mb-2">
            Configuración Requerida
          </h3>
          <p className="text-yellow-600">
            Por favor, configura tu API Key en el archivo .env
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
