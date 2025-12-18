import React, { useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const HK_CENTER = { lat: 22.3964, lng: 114.1095 }; // Hong Kong

export default function LocationsMap({ locations = [], onMarkerClick, center }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
  });

  // Only keep locations with valid numeric coords
  const safeLocations = useMemo(() => {
    return (locations || []).filter(
      (loc) =>
        loc &&
        typeof loc.latitude === "number" &&
        typeof loc.longitude === "number" &&
        !Number.isNaN(loc.latitude) &&
        !Number.isNaN(loc.longitude)
    );
  }, [locations]);

  const mapCenter = useMemo(() => {
    if (center) return center;
    if (safeLocations.length > 0) {
      return { lat: safeLocations[0].latitude, lng: safeLocations[0].longitude };
    }
    return HK_CENTER;
  }, [center, safeLocations]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={11}>
      {safeLocations.map((loc) => (
        <Marker
          key={loc._id}
          position={{ lat: loc.latitude, lng: loc.longitude }}
          onClick={() => onMarkerClick && onMarkerClick(loc)}
        />
      ))}
    </GoogleMap>
  );
}
/*
This works for both:
all locations map (list page)
single location map (detail page)

=================================================================

<All Locations Map> --> Used in LocationsList.jsx
Why needed:
1. Helps users visually browse all venues
2. Helps match with the filtering table
3. Required by the project specification

Behavior:
1. Map is centered on Hong Kong
2. Many markers appear (one per venue)
3. Clicking a marker should navigate to /locations/:id.

=================================================================

<Single Location Map> --> Used in LocationDetail.jsx
Why needed:
1. Helps users see where the venue is located
2. Provides detail about that venue (events, comments, favorites)
3. This is a separate detail page required by the project

Behavior:
1. Map is centered on that venue's latitude/longitude
2. Only one marker appears (for that venue)
3. No need to display other venues here.
*/