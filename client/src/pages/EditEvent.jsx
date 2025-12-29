import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

function EditEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [category, setCategory] = useState('general');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [loadingEvent, setLoadingEvent] = useState(true);

  const { API_URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${API_URL}/events/${id}`);
      const event = res.data;
      setTitle(event.title);
      setDescription(event.description);
      
      // format date for datetime-local input
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().slice(0, 16);
      setDate(formattedDate);
      
      setLocation(event.location);
      setCapacity(event.capacity);
      setCategory(event.category || 'general');
      setImageUrl(event.imageUrl || '');
      setLoadingEvent(false);
    } catch (error) {
      setError('failed to load event');
      setLoadingEvent(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const authToken = localStorage.getItem('token');
      
      if (!authToken) {
        setError('please login first');
        setUploading(false);
        navigate('/login');
        return;
      }

      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      });
      setImageUrl(res.data.imageUrl);
      setUploading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'image upload failed');
      setUploading(false);
    }
  };

  const handleEnhance = async () => {
    const trimmedTitle = title?.trim();
    const trimmedDesc = description?.trim();
    
    if (!trimmedTitle || !trimmedDesc) {
      alert('please enter both title and description before enhancing');
      return;
    }

    setEnhancing(true);
    try {
      const res = await axios.post(`${API_URL}/ai/enhance`, {
        title: trimmedTitle,
        description: trimmedDesc
      });
      setDescription(res.data.enhancedDescription);
      if (res.data.message) {
        alert(res.data.message);
      }
      setEnhancing(false);
    } catch (error) {
      alert(error.response?.data?.message || 'ai feature unavailable');
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title || !description || !date || !location || !capacity) {
      setError('please fill all fields');
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${API_URL}/events/${id}`, {
        title,
        description,
        date,
        location,
        capacity: parseInt(capacity),
        category,
        imageUrl
      });
      navigate(`/event/${id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'failed to update event');
      setLoading(false);
    }
  };

  if (loadingEvent) {
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
          <span className="text-xl font-bold">edit event</span>
        </div>
        <div className="flex-none gap-2">
          <ThemeToggle />
          <button onClick={() => navigate(`/event/${id}`)} className="btn btn-ghost">
            cancel
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">edit event details</h2>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">event title</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. summer music festival"
                  className="input input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 w-full"
                  placeholder="describe your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
                <button
                  type="button"
                  onClick={handleEnhance}
                  className="btn btn-sm btn-outline mt-2"
                  disabled={enhancing}
                >
                  {enhancing ? 'enhancing...' : 'enhance with ai'}
                </button>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">date & time</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">location</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. central park, nyc"
                  className="input input-bordered w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">capacity</span>
                </label>
                <input
                  type="number"
                  placeholder="max attendees"
                  className="input input-bordered w-full"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">category</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
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

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">event image</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="text-sm">uploading image...</span>
                  </div>
                )}
                {imageUrl && (
                  <div className="mt-3">
                    <img 
                      src={imageUrl} 
                      alt="preview" 
                      className="w-full h-48 object-cover rounded-lg" 
                    />
                  </div>
                )}
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      updating...
                    </>
                  ) : (
                    'update event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditEvent;
