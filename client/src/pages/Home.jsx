import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      {/* navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Event Platform</a>
        </div>
        <div className="flex-none gap-2">
          <ThemeToggle />
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-outline btn-primary">
            Register
          </Link>
        </div>
      </div>

      {/* hero section */}
      <div className="hero min-h-[calc(100vh-64px)]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Event Platform</h1>
            <p className="py-6">
              create and manage events, rsvp to events, upload images, and use ai to enhance event descriptions!
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
