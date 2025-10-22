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
  return (
    <div className="h-full w-full">
      <LoadScript
        googleMapsApiKey="AIzaSyCwMRuD-I2AIpTBYV3D8G5fyBKQQ-6aQrc"
        libraries={["drawing"]}
      >
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
          {/* Mapa 100% limpio */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
