import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function EventDetail() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const { user, API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${API_URL}/events/${id}`);
      setEvent(res.data);
      setLoading(false);
    } catch (error) {
      alert('failed to load event');
      navigate('/dashboard');
    }
  };


  const handleDelete = async () => {
    if (!window.confirm('are you sure you want to delete this event?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/events/${id}`);
      alert('event deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      alert('failed to delete event');
    }
  };


  const handleRSVP = async () => {
    try {
      await axios.post(`${API_URL}/rsvp/${id}/join`);
      fetchEvent();
      alert('successfully joined event!');
    } catch (error) {
      alert(error.response?.data?.message || 'failed to join event');
    }
  };


  const handleLeave = async () => {
    try {
      await axios.post(`${API_URL}/rsvp/${id}/leave`);
      fetchEvent();
      alert('successfully left event');
    } catch (error) {
      alert('failed to leave event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!event) return null;

  const isCreator = event.createdBy?._id === user?.id;
  const isAttending = event.attendees?.some(a => a._id === user?.id);
  const isFull = event.attendees?.length >= event.capacity;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">Event Details</a>
        </div>
        <div className="flex-none">
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        <div className="card bg-base-100 shadow-xl">
          {event.imageUrl && (
            <figure>
              <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover" />
            </figure>
          )}
          
          <div className="card-body">
            <h2 className="card-title text-3xl">{event.title}</h2>
            
            <div className="flex gap-2 my-2">
              <div className="badge badge-primary">
                {event.attendees?.length}/{event.capacity} attending
              </div>
              {isFull && <div className="badge badge-error">Full</div>}
            </div>

            <div className="divider"></div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">Description</h3>
                <p className="mt-2">{event.description}</p>
              </div>

              <div>
                <h3 className="font-bold text-lg">Event Details</h3>
                <div className="mt-2 space-y-2">
                  <p>Date: {new Date(event.date).toLocaleString()}</p>
                  <p>Location: {event.location}</p>
                  <p>Created by: {event.createdBy?.name}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg">Attendees ({event.attendees?.length})</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {event.attendees?.map((attendee) => (
                    <div key={attendee._id} className="badge badge-lg">
                      {attendee.name}
                    </div>
                  ))}
                  {event.attendees?.length === 0 && (
                    <p className="text-sm">no attendees yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              {isCreator ? (
                <>
                  <button onClick={() => navigate(`/edit-event/${id}`)} className="btn btn-warning">
                    edit event
                  </button>
                  <button onClick={handleDelete} className="btn btn-error">
                    delete event
                  </button>
                </>
              ) : (
                <>
                  {isAttending ? (
                    <button onClick={handleLeave} className="btn btn-error">
                      leave event
                    </button>
                  ) : (
                    <button
                      onClick={handleRSVP}
                      className="btn btn-primary"
                      disabled={isFull}
                    >
                      {isFull ? 'event full' : 'rsvp now'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
