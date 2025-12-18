import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyFavorites, removeFavorite as removeFavoriteAPI } from '../services/favoriteService';
import './Favorites.css';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setError('Failed to load favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (venueId) => {
    try {
      await removeFavoriteAPI(venueId);
      setFavorites(favorites.filter(fav => fav._id !== venueId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      alert('Failed to remove favorite. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading">Loading favorites...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h1>My Favorite Locations</h1>

      {favorites.length > 0 ? (
        <div className="favorites-grid">
          {favorites.map(location => (
            <div key={location._id} className="favorite-card">
              <Link to={`/locations/${location._id}`} className="favorite-info">
                <h3>{location.name}</h3>
                <p className="location-area">{location.area}</p>
                <p className="location-coords">
                  Coordinates: {location.latitude}, {location.longitude}
                </p>
                <p className="location-events">{location.eventsCount || 0} events</p>
              </Link>
              <div className="favorite-actions">
                <Link to={`/locations/${location._id}`} className="btn-view">
                  View Details
                </Link>
                <button 
                  onClick={() => handleRemoveFavorite(location._id)}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-favorites">
          <p>You haven't added any favorite locations yet.</p>
          <Link to="/locations" className="btn-primary">
            Browse Locations
          </Link>
        </div>
      )}
    </div>
  );
}

export default Favorites;
