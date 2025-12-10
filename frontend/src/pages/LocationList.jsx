// main list + filters + table + map (my main page)
/*
This file alone gives you:
- Table of locations
- Search by name
- Filter by area
- Filter by distance (if geolocation allowed)
- Sort by name / distance / eventsCount
- Map with markers
- Clicking marker or row → goes to detail page
*/
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLocations } from "../api/locations";
import { haversineKm } from "../utils/distance";
import LocationsMap from "../components/locations/LocationsMap";

export default function LocationsList() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [area, setArea] = useState("all");
  const [maxDist, setMaxDist] = useState(""); // in km
  const [sortBy, setSortBy] = useState("name"); // "name" | "distance" | "events"

  const [userPos, setUserPos] = useState(null);
  const navigate = useNavigate();

  // Fetch locations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getLocations();
        setLocations(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load locations.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get user geolocation (optional)
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        // it's okay, we just won't show distance
      }
    );
  }, []);

  // Build a unique list of areas for dropdown
  const areas = useMemo(() => {
    const set = new Set();
    locations.forEach((loc) => {
      if (loc.area) set.add(loc.area);
    });
    return ["all", ...Array.from(set)];
  }, [locations]);

  // Apply distance, filter, sort
  const processedLocations = useMemo(() => {
    let list = locations.map((loc) => {
      let distanceKm = null;
      if (
        userPos &&
        typeof loc.latitude === "number" &&
        typeof loc.longitude === "number"
      ) {
        distanceKm = haversineKm(
          userPos.lat,
          userPos.lng,
          loc.latitude,
          loc.longitude
        );
      }
      return { ...loc, distanceKm };
    });

    // search filter
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((l) => l.name.toLowerCase().includes(s));
    }

    // area filter
    if (area !== "all") {
      list = list.filter((l) => l.area === area);
    }

    // distance filter
    if (maxDist && userPos) {
      const max = Number(maxDist);
      if (!Number.isNaN(max)) {
        list = list.filter(
          (l) => l.distanceKm != null && l.distanceKm <= max
        );
      }
    }

    // sort
    list.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "events") {
        const ea = a.eventsCount ?? 0;
        const eb = b.eventsCount ?? 0;
        return eb - ea; // descending
      }
      if (sortBy === "distance") {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

    return list;
  }, [locations, search, area, maxDist, sortBy, userPos]);

  const handleRowClick = (loc) => {
    navigate(`/locations/${loc._id}`);
  };

  const handleMarkerClick = (loc) => {
    navigate(`/locations/${loc._id}`);
  };

  if (loading) return <p>Loading locations...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Locations</h2>

      {/* Filters */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />

        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        >
          {areas.map((a) => (
            <option key={a} value={a}>
              {a === "all" ? "All areas" : a}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          placeholder="Max distance (km)"
          value={maxDist}
          onChange={(e) => setMaxDist(e.target.value)}
          style={{ width: "150px" }}
        />
      </div>

      {/* Sort controls */}
      <div style={{ marginBottom: "1rem" }}>
        <span>Sort by: </span>
        <button onClick={() => setSortBy("name")}>Name</button>
        <button onClick={() => setSortBy("distance")}>Distance</button>
        <button onClick={() => setSortBy("events")}>Events</button>
      </div>

      {/* Map */}
      <div style={{ marginBottom: "1rem" }}>
        <LocationsMap
          locations={processedLocations}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* Table */}
      <table border="1" cellPadding="6" cellSpacing="0" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Area</th>
            <th>Events</th>
            <th>Distance (km)</th>
          </tr>
        </thead>
        <tbody>
          {processedLocations.map((loc) => (
            <tr
              key={loc._id}
              onClick={() => handleRowClick(loc)}
              style={{ cursor: "pointer" }}
            >
              <td>{loc.name}</td>
              <td>{loc.area || "-"}</td>
              <td>{loc.eventsCount ?? "-"}</td>
              <td>
                {loc.distanceKm != null ? loc.distanceKm.toFixed(1) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}