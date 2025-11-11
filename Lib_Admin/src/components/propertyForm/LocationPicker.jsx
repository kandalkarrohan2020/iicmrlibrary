import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../../store/auth";

// Custom Marker Icon
const markerIcon = new L.DivIcon({
  className: "custom-marker",
  html: `
    <div style="
      position: relative;
      width: 30px;
      height: 30px;
      background: #2563eb;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 14px;
        height: 14px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Cache for geocoding results
const geocodeCache = {};

// Smooth map movement
function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 12, { animate: true, duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

// Handles clicks + reverse geocoding
function LocationMarker({ onLocationSelect, URI }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      try {
        const cacheKey = `${lat},${lng}`;
        if (geocodeCache[cacheKey]) {
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            pincode: geocodeCache[cacheKey],
          });
          return;
        }

        // call backend reverse geocode API
        const res = await fetch(`${URI}/api/map/reverse?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const pincode = data?.address?.postcode || "";

        geocodeCache[cacheKey] = pincode;
        onLocationSelect({ latitude: lat, longitude: lng, pincode });
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        onLocationSelect({ latitude: lat, longitude: lng, pincode: "" });
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={markerIcon} />
  );
}

// Main Component
export default function LocationPicker({
  onChange,
  state,
  city,
  pincode,
  latitude,
  longitude,
}) {
  const { URI } = useAuth();
  const [coords, setCoords] = useState(null);
  const isFetching = useRef(false);

  // If lat/lon already present → set as initial marker
  useEffect(() => {
    if (latitude && longitude) {
      setCoords([parseFloat(latitude), parseFloat(longitude)]);
    }
  }, [latitude, longitude]);

  // If no coords, try geocoding from state/city/pincode
  useEffect(() => {
    if (coords || (!city && !state && !pincode)) return;

    const query = `${pincode ? pincode + "," : ""} ${city ? city + "," : ""} ${
      state ? state + "," : ""
    } India`.trim();

    if (geocodeCache[query]) {
      setCoords(geocodeCache[query]);
      return;
    }

    if (isFetching.current) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      isFetching.current = true;

      fetch(`${URI}/api/map/geocode?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const newCoords = [
              parseFloat(data[0].lat),
              parseFloat(data[0].lon),
            ];
            setCoords(newCoords);
            geocodeCache[query] = newCoords;
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Geocoding error:", err);
          }
        })
        .finally(() => {
          isFetching.current = false;
        });
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [city, state, pincode, URI, coords]);

  return (
    <div className="w-full">
      <div className="w-full h-[300px] rounded-lg overflow-hidden border">
        <MapContainer
          center={coords || [20.5937, 78.9629]}
          zoom={coords ? 12 : 5}
          style={{ height: "100%", width: "100%" }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street Map (English)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                subdomains={["a", "b", "c", "d"]}
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite View">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="Buildings (English)">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">Carto + OSM</a>'
                url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png"
                subdomains={["a", "b", "c", "d"]}
              />
            </LayersControl.Overlay>
          </LayersControl>

          {/* Other children */}
          <FlyToLocation coords={coords} />
          {coords && <Marker position={coords} icon={markerIcon} />}
          <LocationMarker onLocationSelect={onChange} URI={URI} />
        </MapContainer>
      </div>
    </div>
  );
}
