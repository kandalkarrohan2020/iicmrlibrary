import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import FormatPrice from "../FormatPrice";

// Fix default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Map Pin Icon (Green with white center)
const customMapIcon = new L.DivIcon({
  html: `
    <div style="
      width: 30px;
      height: 30px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        width="24" height="24" 
        fill="#2ecc71" 
        stroke="green" 
        stroke-width="1">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 
        0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 
        2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40], // bottom center
  popupAnchor: [0, -35], // popup above
});

// Validate coordinates
function isValidCoords(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

// Auto-fit to property markers
function FitBounds({ properties }) {
  const map = useMap();

  React.useEffect(() => {
    if (!properties || properties.length === 0) return;

    const bounds = [];
    properties.forEach((p) => {
      if (isValidCoords(p.latitude, p.longitude)) {
        bounds.push([p.latitude, p.longitude]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, map]);

  return null;
}

// Fly to city when selectedCity changes
function FlyToCity({ selectedCity }) {
  const map = useMap();
  const geocodeCache = React.useRef({});

  React.useEffect(() => {
    if (!selectedCity) return;

    const query = `${selectedCity}, India`;

    // use cache first
    if (geocodeCache.current[query]) {
      map.flyTo(geocodeCache.current[query], 11, { duration: 2 });
      return;
    }

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          geocodeCache.current[query] = coords;
          map.flyTo(coords, 11, { duration: 2 });
        }
      })
      .catch((err) => console.error("Geocoding error:", err));
  }, [selectedCity, map]);

  return null;
}

export default function LeafletCityMap({ properties, selectedCity }) {
  return (
    <div className="h-[100%] w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={[21.1458, 79.0882]} // fallback center (Nagpur, India)
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='© OpenStreetMap contributors &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains={["a", "b", "c", "d"]}
          maxZoom={20}
        />

        {/* Auto-fit map to markers */}
        <FitBounds properties={properties} />

        {/* Fly to selected city */}
        <FlyToCity selectedCity={selectedCity} />

        {/* Property markers */}
        {properties?.map(
          (property) =>
            isValidCoords(property.latitude, property.longitude) && (
              <Marker
                key={property.propertyid}
                position={[property.latitude, property.longitude]}
                icon={customMapIcon}
              >
                <Popup>
                  <div>
                    <h2
                      onClick={() => {
                        window.open(
                          `https://www.reparv.in/property-info/${property.seoSlug}`,
                          "_blank"
                        );
                      }}
                      className="text-base font-semibold pr-5 text-green-700 cursor-pointer"
                    >
                      {property.propertyName}
                    </h2>

                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-800">
                        {property.propertyCategory} in {property.city}
                      </span>
                    </p>

                    <p className="text-base text-gray-700">
                      <span className="font-semibold text-gray-800 mr-1">
                        Price:
                      </span>
                      <span
                        onClick={() => {
                          window.open(
                            `https://www.reparv.in/property-info/${property.seoSlug}`,
                            "_blank"
                          );
                        }}
                        className="text-green-700 font-semibold cursor-pointer"
                      >
                        <FormatPrice price={property.totalOfferPrice} />
                      </span>
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
    </div>
  );
}