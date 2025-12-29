import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterView, setFilterView] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { user, logout, API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  // fetch all events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data);
      setFilteredEvents(res.data);
      setLoading(false);
    } catch (error) {
      setError('failed to load events');
      setLoading(false);
    }
  };


  useEffect(() => {
    let filtered = [...events];

    // view filter
    if (filterView === 'myEvents') {
      filtered = filtered.filter(event => event.createdBy?._id === user?.id);
    } else if (filterView === 'attending') {
      filtered = filtered.filter(event => 
        event.attendees?.some(attendee => attendee._id === user?.id)
      );
    }

    // category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    // date range filter
    if (startDate) {
      filtered = filtered.filter(event => new Date(event.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(event => new Date(event.date) <= new Date(endDate));
    }

    // search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filterView, searchQuery, user, categoryFilter, startDate, endDate]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // rsvp
  const handleRSVP = async (eventId) => {
    try {
      await axios.post(`${API_URL}/rsvp/${eventId}/join`);
      // refresh after rsvp
      fetchEvents();
      alert('successfully joined event!');
    } catch (error) {
      alert(error.response?.data?.message || 'failed to join event');
    }
  };

  // leave 
  const handleLeave = async (eventId) => {
    try {
      await axios.post(`${API_URL}/rsvp/${eventId}/leave`);
      fetchEvents();
      alert('successfully left event');
    } catch (error) {
      alert(error.response?.data?.message || 'failed to leave event');
    }
  };

  
  const isAttending = (event) => {
    return event.attendees?.some(attendee => attendee._id === user?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">Mini Event Platform</a>
        </div>
        <div className="flex-none gap-2">
          <ThemeToggle />
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost">
              {user?.name}
            </label>
            <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
              <li><Link to="/create-event">Create Event</Link></li>
              <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>


      <div className="container mx-auto p-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Events</h1>
            <Link to="/create-event" className="btn btn-primary">
              Create New Event
            </Link>
          </div>

    
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="search events by title, location, or description..."
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">category</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">all categories</option>
                <option value="general">general</option>
                <option value="music">music</option>
                <option value="sports">sports</option>
                <option value="tech">tech</option>
                <option value="food">food</option>
                <option value="art">art</option>
                <option value="business">business</option>
                <option value="education">education</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">from date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">to date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="tabs tabs-boxed">
            <a
              className={`tab ${filterView === 'all' ? 'tab-active' : ''}`}
              onClick={() => setFilterView('all')}
            >
              all events
            </a>
            <a
              className={`tab ${filterView === 'myEvents' ? 'tab-active' : ''}`}
              onClick={() => setFilterView('myEvents')}
            >
              my events
            </a>
            <a
              className={`tab ${filterView === 'attending' ? 'tab-active' : ''}`}
              onClick={() => setFilterView('attending')}
            >
              attending
            </a>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg">no events found. {filterView === 'myEvents' ? 'create your first event!' : filterView === 'attending' ? 'join some events!' : 'be the first to create one!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
            <div key={event._id} className="card bg-base-100 shadow-xl">
              {event.imageUrl && (
                <figure>
                  <img src={event.imageUrl} alt={event.title} className="h-48 w-full object-cover" />
                </figure>
              )}
              <div className="card-body">
                <h2 className="card-title">{event.title}</h2>
                <p className="text-sm">{event.description.substring(0, 100)}...</p>
                
                <div className="text-sm space-y-1 mt-2">
                  <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p>Location: {event.location}</p>
                   <p>Category: {event.category}</p>
                  <p>No of attendes: {event.attendees?.length || 0}/{event.capacity}</p>
                </div>

                <div className="card-actions justify-end mt-4">
                  <Link to={`/event/${event._id}`} className="btn btn-sm btn-ghost">
                    View Details
                  </Link>
                  
                  {isAttending(event) ? (
                    <button 
                      onClick={() => handleLeave(event._id)}
                      className="btn btn-sm btn-error"
                    >
                      Leave
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleRSVP(event._id)}
                      className="btn btn-sm btn-primary"
                      disabled={event.attendees?.length >= event.capacity}
                    >
                      {event.attendees?.length >= event.capacity ? 'Full' : 'RSVP'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}



export default Dashboard;
