import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Lightbulb } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      if (token && user) {
        useAuthStore.getState().setAccessToken(token);
        useAuthStore.getState().setUser(user);
        localStorage.setItem('token', token);
        navigate('/dashboard');
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Image */}
      <div className="hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1535957998253-26ae1ef29506?q=80&w=1080&auto=format&fit=crop"
          alt="Login Illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Area */}
      <div className="relative flex flex-col justify-start items-center bg-[#121212] px-6 py-12 overflow-hidden">
        {/* Top Branding */}
        <div className="text-center mb-10 mt-4">
          <h1 className="text-4xl font-bold text-white">CollabFlow</h1>
          <p className="text-white/70 text-sm mt-2 max-w-xs">
            A workspace with project management and task tracking using a Kanban board.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl w-full max-w-md text-white px-8 py-10 space-y-6 transition-all duration-300 transform hover:scale-105 hover:border-white/30 hover:shadow-white/20">
          <h2 className="text-2xl font-semibold text-center">LOGIN</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or username"
              required
              disabled={loading}
              className="w-full px-4 py-3 text-sm bg-white/10 text-white placeholder-white/70 rounded-xl border border-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40 hover:bg-white/20 transition duration-200"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={loading}
              className="w-full px-4 py-3 text-sm bg-white/10 text-white placeholder-white/70 rounded-xl border border-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40 hover:bg-white/20 transition duration-200"
            />

            {error && <div className="text-sm text-red-400 font-medium">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {/* Tips Box */}
          <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300 w-fit max-w-sm mx-auto">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-yellow-400 mt-1" size={20} />
              <div>
                <p className="text-white font-semibold text-sm mb-1">Tips</p>
                <p className="text-white/80 text-sm">
                  <span className="font-medium">Email:</span> admin@collabflow.com<br />
                  <span className="font-medium">Password:</span> admin123
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
