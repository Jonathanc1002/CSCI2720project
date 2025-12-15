//shows full information about a single venue (one location)
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLocationById } from "../api/locations";
import api from "../api";
import LocationsMap from "../components/locations/LocationsMap";

export default function LocationDetail() {
  const { id } = useParams(); // venue Mongo _id

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Adjust this if your app stores username differently
  const username = localStorage.getItem("username") || "";

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      setCommentsError("");
      // backend: GET /api/comments/:venueId
      const res = await api.get(`/api/comments/${id}`);
      setComments(res.data || []);
    } catch (err) {
      console.error(err);
      setCommentsError("Failed to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLocationLoading(true);
        const res = await getLocationById(id);
        setLocation(res.data);
      } catch (err) {
        console.error(err);
        setLocationError("Failed to load location details.");
      } finally {
        setLocationLoading(false);
      }
    };

    fetchLocation();
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!username) {
      alert("Please log in first to comment.");
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      // backend: POST /api/comments
      // CommentSchema expects: username, comment, venue(ObjectId)
      await api.post("/api/comments", {
        username,
        comment: newComment.trim(),
        venue: id,
      });

      setNewComment("");
      await loadComments();
    } catch (err) {
      console.error(err);
      alert("Failed to submit comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (locationLoading) return <p>Loading location...</p>;
  if (locationError) return <p>{locationError}</p>;
  if (!location) return <p>Location not found.</p>;

  const { name, area, latitude, longitude, eventsCount } = location;

  const singleLocArray = [{ _id: id, name, latitude, longitude }];

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

      {/* Single-location map */}
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

      {/* Comments section */}
      <section>
        <h3>User Comments</h3>

        {/* Add comment form */}
        <form onSubmit={handleSubmitComment} style={{ marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <textarea
              rows={3}
              style={{ width: "100%" }}
              placeholder={username ? "Write a comment..." : "Log in to write a comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!username || submitting}
            />
          </div>
          <button type="submit" disabled={!username || submitting || !newComment.trim()}>
            {submitting ? "Submitting..." : "Add Comment"}
          </button>
        </form>

        {/* Comment list */}
        {commentsLoading && <p>Loading comments...</p>}
        {commentsError && <p>{commentsError}</p>}
        {!commentsLoading && !commentsError && (
          comments.length > 0 ? (
            <ul>
              {comments.map((c, idx) => (
                <li key={c._id || idx}>
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
          )
        )}
      </section>

      <p style={{ marginTop: "1rem" }}>
        <Link to="/">← Back to all locations</Link>
      </p>
    </div>
  );
}