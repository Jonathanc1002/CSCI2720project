import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getAllUsers, createUser, updateUser, deleteUser
} from '../api/adminUsers';
import { 
  getAllEvents, createEvent, updateEvent, deleteEvent 
} from '../api/adminEvents';
import { getLocations } from '../api/locations';
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  const { isAdmin: userIsAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Form state
  const [userForm, setUserForm] = useState({ username: '', password: '', isAdmin: false });
  const [eventForm, setEventForm] = useState({ 
    event_id: '', 
    title: '', 
    description: '', 
    presenter: '', 
    venue: '', 
    dates: '' 
  });

  useEffect(() => {
    if (!userIsAdmin) {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchData();
  }, [userIsAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, eventsData, locationsResponse] = await Promise.all([
        getAllUsers(),
        getAllEvents(),
        getLocations()
      ]);
      setUsers(usersData);
      setEvents(eventsData);
      setLocations(locationsResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // User CRUD handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', password: '', isAdmin: false });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({ username: user.username, password: '', isAdmin: user.isAdmin });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(userId);
      alert('User deleted successfully');
      fetchData();
    } catch (error) {
      alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser._id, userForm);
        alert('User updated successfully');
      } else {
        await createUser(userForm);
        alert('User created successfully');
      }
      setShowUserModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save user: ' + (error.response?.data?.message || error.message));
    }
  };

  // Event CRUD handlers
  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ 
      event_id: '', 
      title: '', 
      description: '', 
      presenter: '', 
      venue: '', 
      dates: '' 
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({ 
      event_id: event.event_id || '',
      title: event.title,
      description: event.description || '',
      presenter: event.presenter,
      venue: event.venue?._id || event.venue,
      dates: event.dates.map(d => new Date(d).toISOString().split('T')[0]).join(', ')
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteEvent(eventId);
      alert('Event deleted successfully');
      fetchData();
    } catch (error) {
      alert('Failed to delete event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const datesArray = eventForm.dates.split(',').map(d => new Date(d.trim()).toISOString());
      const eventData = {
        ...eventForm,
        dates: datesArray
      };
      
      if (editingEvent) {
        await updateEvent(editingEvent._id, eventData);
        alert('Event updated successfully');
      } else {
        await createEvent(eventData);
        alert('Event created successfully');
      }
      setShowEventModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save event: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="admin-panel-container">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <h1>Admin Panel</h1>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Management ({users.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events Management ({events.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Users</h2>
            <button className="btn-primary" onClick={handleAddUser}>+ Add New User</button>
          </div>
          
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>
                      <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEditUser(user)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Events</h2>
            <button className="btn-primary" onClick={handleAddEvent}>+ Add New Event</button>
          </div>
          
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Title</th>
                  <th>Presenter</th>
                  <th>Venue</th>
                  <th>Dates Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id}>
                    <td>{event.event_id}</td>
                    <td>{event.title}</td>
                    <td>{event.presenter}</td>
                    <td>
                      {locations.find(l => l._id === event.venue)?.name || 'Unknown'}
                    </td>
                    <td>{event.dates?.length || 0}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEditEvent(event)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleUserSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password {editingUser && '(leave empty to keep current)'}:</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  required={!editingUser}
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={userForm.isAdmin}
                    onChange={(e) => setUserForm({...userForm, isAdmin: e.target.checked})}
                  />
                  Admin User
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleEventSubmit}>
              <div className="form-group">
                <label>Event ID:</label>
                <input
                  type="text"
                  value={eventForm.event_id}
                  onChange={(e) => setEventForm({...eventForm, event_id: e.target.value})}
                  required
                  disabled={editingEvent}
                />
              </div>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Presenter:</label>
                <input
                  type="text"
                  value={eventForm.presenter}
                  onChange={(e) => setEventForm({...eventForm, presenter: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Venue:</label>
                <select
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({...eventForm, venue: e.target.value})}
                  required
                >
                  <option value="">Select a venue</option>
                  {locations.map(location => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Dates (comma-separated YYYY-MM-DD):</label>
                <input
                  type="text"
                  value={eventForm.dates}
                  onChange={(e) => setEventForm({...eventForm, dates: e.target.value})}
                  placeholder="2025-12-20, 2025-12-21, 2025-12-22"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingEvent ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
