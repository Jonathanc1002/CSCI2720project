/*
main list + filters + table + map (my main page)

This file alone gives:
- Table of locations
- Search by name
- Filter by area
- Filter by distance (if geolocation allowed)
- Sort by name / distance / eventsCount
- Map with markers
- Clicking marker or row → goes to detail page
*/
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLocations } from "../api/locations";
import { haversineKm } from "../utils/distance";
import LocationsMap from "../components/locations/LocationsMap";

const AREA_OPTIONS = [
  "all",
  "Sha Tin",
  "Yuen Long",
  "Tuen Mun",
  "North District",
  "Tai Po",
  "Hung Hom",
  "Ngau Chi Wan",
  "Tsim Sha Tsui",
  "Central",
  "Sai Wan Ho",
  "Others",
];

export default function LocationList() {
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("all");
  const [maxDistKm, setMaxDistKm] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("name"); // name | distance | events
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  // User location (for distance)
  const [userPos, setUserPos] = useState(null);

  // Load all locations
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await getLocations();
        setLocations(res.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load locations.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Get user geo (optional)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserPos(null)
    );
  }, []);

  // Compute distance + filter + sort
  const viewLocations = useMemo(() => {
    let list = (locations || []).map((loc) => {
      let distanceKm = null;

      if (
        userPos &&
        typeof loc.latitude === "number" &&
        typeof loc.longitude === "number" &&
        !Number.isNaN(loc.latitude) &&
        !Number.isNaN(loc.longitude)
      ) {
        distanceKm = haversineKm(userPos.lat, userPos.lng, loc.latitude, loc.longitude);
      }

      return { ...loc, distanceKm };
    });

    // keyword filter (name)
    const k = keyword.trim().toLowerCase();
    if (k) {
      list = list.filter((l) => String(l.name || "").toLowerCase().includes(k));
    }

    // area filter
    if (area !== "all") {
      list = list.filter((l) => String(l.area || "").trim() === area);
    }

    // distance filter (only if geolocation available)
    if (maxDistKm.trim() && userPos) {
      const max = Number(maxDistKm);
      if (!Number.isNaN(max)) {
        list = list.filter((l) => l.distanceKm != null && l.distanceKm <= max);
      }
    }

    // sorting
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortBy === "name") {
        return dir * String(a.name || "").localeCompare(String(b.name || ""));
      }
      if (sortBy === "events") {
        const ea = Number(a.eventsCount ?? a.eventCount ?? 0);
        const eb = Number(b.eventsCount ?? b.eventCount ?? 0);
        return dir * (ea - eb);
      }
      if (sortBy === "distance") {
        const ad = a.distanceKm;
        const bd = b.distanceKm;
        if (ad == null && bd == null) return 0;
        if (ad == null) return 1;
        if (bd == null) return -1;
        return dir * (ad - bd);
      }
      return 0;
    });

    return list;
  }, [locations, keyword, area, maxDistKm, sortBy, sortDir, userPos]);

  const toggleSort = (field) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const onMarkerClick = (loc) => navigate(`/locations/${loc._id}`);

  if (loading) return <p>Loading locations...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Locations</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Filter by keyword (name)"
        />

        <select value={area} onChange={(e) => setArea(e.target.value)}>
          {AREA_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {a === "all" ? "All areas" : a}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          value={maxDistKm}
          onChange={(e) => setMaxDistKm(e.target.value)}
          placeholder="Within X km"
          style={{ width: "130px" }}
        />

        {!userPos && maxDistKm.trim() !== "" && (
          <span style={{ color: "#b00" }}>Distance filter needs location permission.</span>
        )}
      </div>

      {/* Map */}
      <div style={{ marginBottom: "1rem" }}>
        <LocationsMap locations={viewLocations} onMarkerClick={onMarkerClick} />
      </div>

      {/* Table */}
      <table border="1" cellPadding="6" cellSpacing="0" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th style={{ cursor: "pointer" }} onClick={() => toggleSort("name")}>
              Location Name {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => toggleSort("distance")}>
              Distance (km) {sortBy === "distance" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => toggleSort("events")}>
              # Events {sortBy === "events" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </th>
            <th>Area</th>
          </tr>
        </thead>

        <tbody>
          {viewLocations.map((loc) => (
            <tr key={loc._id}>
              <td>
                <Link to={`/locations/${loc._id}`}>{loc.name}</Link>
              </td>
              <td>{loc.distanceKm != null ? loc.distanceKm.toFixed(1) : "-"}</td>
              <td>{loc.eventsCount ?? loc.eventCount ?? 0}</td>
              <td>{loc.area || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}