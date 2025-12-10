import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLocationById } from "../api/locations";
import LocationsMap from "../components/locations/LocationsMap";

export default function LocationDetail() {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const res = await getLocationById(id);
        setLocation(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load location details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  if (loading) return <p>Loading location...</p>;
  if (error) return <p>{error}</p>;
  if (!location) return <p>Location not found.</p>;

  const {
    name,
    area,
    latitude,
    longitude,
    events = [],
    comments = [],
    eventsCount,
  } = location;

  const singleLocArray = [
    {
      _id: location._id,
      name,
      latitude,
      longitude,
    },
  ];

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value; // fallback raw
    return d.toLocaleString();
  };

  return (
    <div>
      <h2>{name}</h2>
      <p>
        <strong>Area:</strong> {area || "-"}
      </p>
      {typeof eventsCount === "number" && (
        <p>
          <strong>Number of events:</strong> {eventsCount}
        </p>
      )}

      {/* Map focused on this location */}
      <div style={{ marginBottom: "1rem" }}>
        {typeof latitude === "number" && typeof longitude === "number" ? (
          <LocationsMap
            locations={singleLocArray}
            center={{ lat: latitude, lng: longitude }}
          />
        ) : (
          <p>No coordinates available for this venue.</p>
        )}
      </div>

      {/* Events at this location */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>Events at this location</h3>
        {events.length > 0 ? (
          <ul>
            {events.map((ev) => (
              <li key={ev.id ?? `${ev.title}-${ev.date}`}>
                <strong>{ev.title}</strong>
                <div>
                  <strong>Date:</strong> {formatDateTime(ev.date)}
                </div>
                <div>
                  <strong>Presenter:</strong> {ev.presenter || "-"}
                </div>
                <div>
                  <strong>Price:</strong> {ev.price || "-"}
                </div>
                {ev.description && ev.description !== "N/A" && (
                  <p>{ev.description}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found for this location.</p>
        )}
      </section>

      {/* Comments */}
      <section>
        <h3>User Comments</h3>
        {comments.length > 0 ? (
          <ul>
            {comments.map((c, index) => (
              <li key={index}>
                <div>
                  <strong>{c.username}</strong>{" "}
                  <span style={{ fontSize: "0.9em", color: "#666" }}>
                    ({formatDateTime(c.date)})
                  </span>
                </div>
                <div>{c.comment}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet for this venue.</p>
        )}

        {/* later you can add a comment form here */}
      </section>

      <p style={{ marginTop: "1rem" }}>
        <Link to="/">← Back to all locations</Link>
      </p>
    </div>
  );
}