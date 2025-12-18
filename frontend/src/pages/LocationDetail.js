import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLocationById } from '../services/locationService';
import { addFavorite, removeFavorite, checkIsFavorite } from '../services/favoriteService';
import { addComment } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import './LocationDetail.css';

function LocationDetail() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchLocationDetails();
    if (isLoggedIn) {
      checkFavoriteStatus();
    }
  }, [id, isLoggedIn]);

  const checkFavoriteStatus = async () => {
    try {
      const status = await checkIsFavorite(id);
      setIsFavorite(status);
    } catch (err) {
      console.error('Failed to check favorite status:', err);
    }
  };

  const fetchLocationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocationById(id);
      setLocation(data);
      setEvents(data.events || []);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to fetch location details:', err);
      setError('Failed to load location details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      alert('Please log in to add favorites');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await addFavorite(id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      alert('Failed to update favorite. Please try again.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('Please log in to post comments');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setCommentSubmitting(true);
    try {
      const comment = await addComment(id, newComment.trim());
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="location-detail-container">
        <div className="loading">Loading location details...</div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="location-detail-container">
        <div className="error-message">
          <p>{error || 'Location not found'}</p>
          <Link to="/locations" className="btn-primary">Back to Locations</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="location-detail-container">
      <Link to="/locations" className="back-link">← Back to Locations</Link>
      
      <div className="location-header">
        <div>
          <h1>{location.name}</h1>
          <p className="location-meta">{location.area} • {location.venue}</p>
        </div>
        {isLoggedIn && (
          <button 
            onClick={toggleFavorite}
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? '...' : (isFavorite ? '★' : '☆')} 
            {favoriteLoading ? 'Updating...' : (isFavorite ? 'Favorited' : 'Add to Favorites')}
          </button>
        )}
      </div>

      <div className="location-info">
        <div className="info-grid">
          <div className="info-item">
            <strong>Venue ID:</strong> {location.venue_id}
          </div>
          <div className="info-item">
            <strong>Coordinates:</strong> {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}
          </div>
          <div className="info-item">
            <strong>Total Events:</strong> {location.eventsCount || 0}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="map-section">
        <h2>Location Map</h2>
        <div className="map-container">
          <iframe
            title="Location Map"
            width="100%"
            height="400"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&hl=en&z=15&output=embed`}
            allowFullScreen
          />
        </div>
        <div className="map-links">
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-map-link"
          >
            Open in Google Maps →
          </a>
        </div>
      </section>

      <section className="events-section">
        <h2>Events at this Location ({events.length})</h2>
        
        {loading ? (
          <div className="events-loading">Loading events...</div>
        ) : events.length > 0 ? (
          <div className="events-list">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <h3>{event.title}</h3>
                <div className="event-details">
                  <div className="event-meta">
                    <span><strong>Presenter:</strong> {event.presenter}</span>
                    {event.description !== 'N/A' && (
                      <span><strong>Description:</strong> {event.description}</span>
                    )}
                  </div>
                  <div className="event-dates">
                    <strong>Event Dates:</strong>
                    <div className="dates-grid">
                      {event.dates.slice(0, 6).map((date, index) => (
                        <span key={index} className="date-badge">
                          {new Date(date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      ))}
                      {event.dates.length > 6 && (
                        <span className="date-badge more-dates">
                          +{event.dates.length - 6} more dates
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="events-info">
            <p className="no-items">No events scheduled at this location.</p>
          </div>
        )}
      </section>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        
        {isLoggedIn ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea 
              placeholder="Add a comment..." 
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={commentSubmitting}
              required
            />
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={commentSubmitting || !newComment.trim()}
            >
              {commentSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>Please <Link to="/login">log in</Link> to post comments.</p>
          </div>
        )}
        
        <div className="comments-list">
          {loading ? (
            <div className="comments-loading">Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment._id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{comment.username}</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))
          ) : (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default LocationDetail;
