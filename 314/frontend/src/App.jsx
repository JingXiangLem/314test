import { useState, createContext, useContext, useEffect } from 'react';
import { Heart, Search, Plus, User, LogOut, FileText, Users, Bell, Star, Shield, Download, Ban, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

const LoginPage = ({ onSwitch }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-pink-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">MockFYP Platform</h1>
          <p className="text-gray-300">Connect helpers with those in need</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-300 mt-6">
          Don't have an account?{' '}
          <button onClick={onSwitch} className="text-pink-400 hover:text-pink-300 font-semibold">
            Register
          </button>
        </p>

        <div className="mt-6 p-4 bg-white/5 rounded-lg text-sm text-gray-300">
          <p className="font-semibold mb-2">Test Accounts:</p>
          <p>Admin: admin@mockfyp.com / admin123</p>
          <p>PIN: john@mockfyp.com / password123</p>
          <p>CSR: volunteer@company.com / password123</p>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = ({ onSwitch }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'pin',
    full_name: '',
    company_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-pink-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-300">Join our community today</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">I am a...</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="pin" className="bg-gray-800">Person in Need</option>
              <option value="csr" className="bg-gray-800">CSR Representative</option>
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {formData.role === 'csr' && (
            <div>
              <label className="block text-white mb-2">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-300 mt-6">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-pink-400 hover:text-pink-300 font-semibold">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [volunteerTab, setVolunteerTab] = useState('shortlist');
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [shortlist, setShortlist] = useState([]); // Add this
  const [volunteerReviews, setVolunteerReviews] = useState([]); // Add this
  const [volunteerAction, setVolunteerAction] = useState({ volunteer_id: null });
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [stats, setStats] = useState(null);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', urgency: 'medium', location: '' });
  const [review, setReview] = useState({ volunteer_id: null, request_id: 1, rating: 5, comment: '' });
  const [showReportModal, setShowReportModal] = useState(false);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [newReport, setNewReport] = useState({name: '', report_type: 'user_activity', frequency: 'daily', recipients: ''});
  const [systemLogs, setSystemLogs] = useState([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  useEffect(() => {
    loadRequests();
    if (user.role === 'pin') {
      loadMyRequests();
      loadBlacklist();
      loadShortlist();
    }
    if (user.role === 'csr') {
      loadAcceptedTasks();
    }
    if (user.role === 'admin') {
      loadUsers();
      loadStats();
    }
    if (user.role === 'manager') {
      loadSystemLogs();
      loadScheduledReports();
      loadStats();
    }
  }, [user.role]);

    const loadSystemLogs = async () => {
    try {
      const res = await api.get('/system/logs');
      setSystemLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load system logs', err);
    }
  };

  const loadScheduledReports = async () => {
    try {
      const res = await api.get('/system/scheduled-reports');
      setScheduledReports(res.data);
    } catch (err) {
      console.error('Failed to load scheduled reports', err);
    }
  };

  const handleCreateScheduledReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/system/scheduled-reports', newReport);
      alert('Scheduled report created successfully!');
      setShowReportModal(false);
      setNewReport({ name: '', report_type: 'user_activity', frequency: 'daily', recipients: '' });
      loadScheduledReports();
    } catch (err) {
      alert('Failed to create scheduled report');
    }
  };

  const loadShortlist = async () => {
    try {
      const res = await api.get('/pin/shortlist');
      setShortlist(res.data);
    } catch (err) {
      console.error('Failed to load shortlist', err);
    }
  };

  const handleAddToShortlist = async (volunteerId) => {
    if (!volunteerId) return;
    try {
      await api.post('/pin/shortlist', { volunteer_id: volunteerId });
      alert('Volunteer added to shortlist!');
      loadShortlist();
      setVolunteerAction({ volunteer_id: null });
    } catch (err) {
      alert('Failed to add to shortlist');
    }
  };

  const handleRemoveFromShortlist = async (shortlistId) => {
    try {
      await api.delete(`/pin/shortlist/${shortlistId}`);
      alert('Removed from shortlist');
      loadShortlist();
    } catch (err) {
      alert('Failed to remove from shortlist');
    }
  };

  const handleRemoveFromBlacklist = async (volunteerId) => {
    try {
      await api.delete(`/pin/blacklist/${volunteerId}`);
      alert('Removed from blacklist');
      loadBlacklist();
    } catch (err) {
      alert('Failed to remove from blacklist');
    }
  };

  const handleBlacklistVolunteer = async (volunteerId, reason) => {
    if (!volunteerId || !reason) return;
    try {
      await api.post('/pin/blacklist', { volunteer_id: volunteerId, reason });
      alert('Volunteer blacklisted');
      loadBlacklist();
      setVolunteerAction({ volunteer_id: null });
    } catch (err) {
      alert('Failed to blacklist volunteer');
    }
  };

  const loadVolunteerReviews = async (volunteerId) => {
    if (!volunteerId) return;
    try {
      const res = await api.get(`/pin/reviews/${volunteerId}`);
      setVolunteerReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews', err);
      setVolunteerReviews([]);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load requests', err);
    }
  };

  const loadMyRequests = async () => {
    try {
      const res = await api.get('/requests/my-requests');
      setMyRequests(res.data);
    } catch (err) {
      console.error('Failed to load my requests', err);
    }
  };

  const loadAcceptedTasks = async () => {
    try {
      const res = await api.get('/csr/accepted-tasks');
      setAcceptedTasks(res.data);
    } catch (err) {
      console.error('Failed to load accepted tasks', err);
    }
  };

  const loadUsers = async () => {
    console.log('Token in storage:', localStorage.getItem('token'));
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
      console.error('Status:', err.response?.status);
      console.error('Error data:', err.response?.data);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", localStorage.getItem("token"));
      console.log("Token before request:", token);

      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const loadBlacklist = async () => {
    try {
      const res = await api.get('/pin/blacklist');
      setBlacklist(res.data);
    } catch (err) {
      console.error('Failed to load blacklist', err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', newRequest);
      setNewRequest({ title: '', description: '', urgency: 'medium', location: '' });
      setShowNewRequest(false);
      loadRequests();
      loadMyRequests();
    } catch (err) {
      alert('Failed to create request');
    }
  };

  const handleOfferHelp = async (requestId) => {
    try {
      await api.post('/volunteers/offers', { request_id: requestId, message: 'I would like to help!' });
      alert('Offer submitted successfully!');
    } catch (err) {
      alert('Failed to submit offer');
    }
  };

  const handleCompleteTask = async (offerId) => {
    try {
      await api.put(`/csr/complete-task/${offerId}`);
      alert('Task marked as completed!');
      loadAcceptedTasks();
    } catch (err) {
      alert('Failed to complete task');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pin/review', review);
      alert('Review submitted successfully!');
      setShowReviewModal(false);
      setReview({ volunteer_id: null, rating: 5, comment: '' });
    } catch (err) {
      alert('Failed to submit review');
    }
  };

  const handleExportCSV = async () => {
    try {
      // Tell axios to expect a blob/text response, not JSON
      const res = await api.get('/admin/users/export-csv', {
        responseType: 'blob' // Important!
      });
      
      // Create blob directly from response data
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv'; // Set filename here
      document.body.appendChild(a); // Required for Firefox
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('CSV exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export CSV');
    }
  };

  const handleAssignRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/assign-role/${userId}`, { role: newRole });
      alert('Role assigned successfully!');
      loadUsers();
    } catch (err) {
      alert('Failed to assign role');
    }
  };

  const urgencyColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-slate-900/95 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-pink-400" />
              <span className="ml-2 text-2xl font-bold text-white">MockFYP</span>
            </div>

            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-300 hover:text-white cursor-pointer" />
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-gray-300" />
                <span className="text-white">{user.username}</span>
                <span className="text-xs bg-purple-600 px-2 py-1 rounded">{user.role.toUpperCase()}</span>
              </div>
              <button onClick={logout} className="text-gray-300 hover:text-white">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'browse' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <Search className="inline h-5 w-5 mr-2" />
            Browse Requests
          </button>

          {user.role === 'pin' && (
            <>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'my-requests' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="inline h-5 w-5 mr-2" />
              My Requests
            </button>
            <button
              onClick={() => setActiveTab('rate-volunteer')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'rate-volunteer' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <Star className="inline h-5 w-5 mr-2" />
              Rate Volunteers
            </button>
          </>
          )}

          {user.role === 'csr' && (
            <button
              onClick={() => setActiveTab('accepted-tasks')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'accepted-tasks' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle className="inline h-5 w-5 mr-2" />
              My Tasks
            </button>
          )}
          
          {user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <Shield className="inline h-5 w-5 mr-2" />
              Admin Panel
            </button>
          )}
          {user.role === 'manager' && (
            <button
              onClick={() => setActiveTab('manager')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'manager' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <Shield className="inline h-5 w-5 mr-2" />
              Manager Panel
            </button>
          )}
        </div>
          
        {activeTab === 'browse' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Help Requests</h2>
              {user.role === 'pin' && (
                <button
                  onClick={() => setShowNewRequest(true)}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Request
                </button>
              )}
            </div>

            {showNewRequest && (
              <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Create New Request</h3>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Location"
                      value={newRequest.location}
                      onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                      className="px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={newRequest.urgency}
                      onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                      className="px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low Urgency</option>
                      <option value="medium">Medium Urgency</option>
                      <option value="high">High Urgency</option>
                    </select>
                  </div>
                  <div className="flex space-x-4">
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                      Submit Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewRequest(false)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid gap-6">
              {requests.map((req) => (
                <div key={req.id} className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{req.title}</h3>
                      <p className="text-gray-300">{req.description}</p>
                    </div>
                    <span className={`${urgencyColors[req.urgency]} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                      {req.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4 text-sm text-gray-400">
                      <span>📍 {req.location}</span>
                      <span>👁️ {req.view_count} views</span>
                      <span className="text-yellow-400">⭐ Status: {req.status}</span>
                    </div>
                    {user.role === 'csr' && req.status === 'pending' && (
                      <button
                        onClick={() => handleOfferHelp(req.id)}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                      >
                        Offer Help
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'my-requests' && user.role === 'pin' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">My Requests</h2>
            <div className="grid gap-6">
              {myRequests.map((req) => (
                <div key={req.id} className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{req.title}</h3>
                      <p className="text-gray-300 mb-4">{req.description}</p>
                      <div className="flex space-x-4 text-sm text-gray-400">
                        <span>📍 {req.location}</span>
                        <span className={`${urgencyColors[req.urgency]} text-white px-2 py-1 rounded`}>
                          {req.urgency}
                        </span>
                        <span>Status: {req.status}</span>
                        <span>👁️ {req.view_count} views</span>
                      </div>
                    </div>
                    <span className={`${urgencyColors[req.urgency]} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                      {req.urgency.toUpperCase()}
                    </span>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* Edit request logic */}}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {/* Delete request logic */}}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  {req.status === 'accepted' && (
                    <button
                      onClick={() => {/* Mark as completed and trigger review */}}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
              {myRequests.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>You haven't created any requests yet</p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Create Your First Request
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'rate-volunteer' && user.role === 'pin' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Rate & Manage Volunteers</h2>
            
            {/* Tab selector for Shortlist/Blacklist/Reviews */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setVolunteerTab('shortlist')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  volunteerTab === 'shortlist' ? 'bg-green-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                ⭐ Shortlist
              </button>
              <button
                onClick={() => setVolunteerTab('blacklist')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  volunteerTab === 'blacklist' ? 'bg-red-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                🚫 Blacklist
              </button>
              <button
                onClick={() => setVolunteerTab('add')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  volunteerTab === 'add' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                ➕ Add Volunteer
              </button>
            </div>

            {/* Shortlist View */}
            {volunteerTab === 'shortlist' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">My Shortlisted Volunteers</h3>
                </div>
                <div className="grid gap-4">
                  {shortlist.map((item) => (
                    <div key={item.id} className="bg-slate-800/50 rounded-xl p-6 border border-green-500/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2">{item.volunteer_name}</h4>
                          <p className="text-gray-400 text-sm">Volunteer ID: {item.volunteer_id}</p>
                          <p className="text-gray-400 text-sm">Added: {new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setReview({ ...review, volunteer_id: item.volunteer_id });
                              setShowReviewModal(true);
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                          >
                            ⭐ Review
                          </button>
                          <button
                            onClick={() => handleRemoveFromShortlist(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {shortlist.length === 0 && (
                    <div className="text-center text-gray-400 py-12 bg-slate-800/30 rounded-xl">
                      <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No volunteers in your shortlist yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Blacklist View */}
            {volunteerTab === 'blacklist' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Blacklisted Volunteers</h3>
                </div>
                <div className="grid gap-4">
                  {blacklist.map((item) => (
                    <div key={item.id} className="bg-slate-800/50 rounded-xl p-6 border border-red-500/20">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-2">{item.volunteer_name}</h4>
                          <p className="text-gray-400 text-sm mb-2">Volunteer ID: {item.volunteer_id}</p>
                          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mb-2">
                            <p className="text-red-300 text-sm font-semibold mb-1">Reason:</p>
                            <p className="text-gray-300 text-sm">{item.reason}</p>
                          </div>
                          <p className="text-gray-400 text-sm">Blacklisted: {new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromBlacklist(item.volunteer_id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {blacklist.length === 0 && (
                    <div className="text-center text-gray-400 py-12 bg-slate-800/30 rounded-xl">
                      <Ban className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No blacklisted volunteers</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Volunteer (Shortlist/Blacklist/Review) */}
            {volunteerTab === 'add' && (
              <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-6">Manage Volunteer</h3>
                
                <div className="space-y-6">
                  {/* Volunteer ID Input */}
                  <div>
                    <label className="block text-white mb-2">Volunteer ID</label>
                    <input
                      type="number"
                      value={volunteerAction.volunteer_id || ''}
                      onChange={(e) => setVolunteerAction({ ...volunteerAction, volunteer_id: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter volunteer ID"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => handleAddToShortlist(volunteerAction.volunteer_id)}
                      disabled={!volunteerAction.volunteer_id}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⭐ Add to Shortlist
                    </button>
                    
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for blacklisting:');
                        if (reason) {
                          handleBlacklistVolunteer(volunteerAction.volunteer_id, reason);
                        }
                      }}
                      disabled={!volunteerAction.volunteer_id}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🚫 Blacklist
                    </button>
                    
                    <button
                      onClick={() => {
                        setReview({ ...review, volunteer_id: volunteerAction.volunteer_id });
                        setShowReviewModal(true);
                      }}
                      disabled={!volunteerAction.volunteer_id}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⭐ Write Review
                    </button>
                  </div>

                  {/* View Past Reviews */}
                  <div className="border-t border-slate-700 pt-6">
                    <button
                      onClick={() => loadVolunteerReviews(volunteerAction.volunteer_id)}
                      disabled={!volunteerAction.volunteer_id}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📋 View All Reviews for This Volunteer
                    </button>
                    
                    {volunteerReviews.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-white font-semibold">Reviews:</h4>
                        {volunteerReviews.map((rev) => (
                          <div key={rev.id} className="bg-slate-700 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-white font-semibold">{rev.pin_name}</span>
                              <span className="text-yellow-400">{'⭐'.repeat(rev.rating)}</span>
                            </div>
                            <p className="text-gray-300 text-sm mb-1">{rev.comment}</p>
                            <p className="text-gray-500 text-xs">{new Date(rev.created_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'accepted-tasks' && user.role === 'csr' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">My Accepted Tasks</h2>
            <div className="grid gap-6">
              {acceptedTasks.map((task) => (
                <div key={task.id} className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                      <p className="text-gray-300 mb-4">{task.description}</p>
                      <div className="flex space-x-4 text-sm text-gray-400">
                        <span>📍 {task.location}</span>
                        <span className={`${urgencyColors[task.urgency]} text-white px-2 py-1 rounded`}>
                          {task.urgency}
                        </span>
                        <span>Status: {task.status}</span>
                      </div>
                    </div>
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {acceptedTasks.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No accepted tasks yet. Browse requests to offer help!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admin' && user.role === 'admin' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
              <button
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Users CSV
              </button>
            </div>

            {stats && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Total Users</p>
                      <p className="text-4xl font-bold text-white">{stats.total_users}</p>
                    </div>
                    <Users className="h-12 w-12 text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Active Users</p>
                      <p className="text-4xl font-bold text-white">{stats.active_users}</p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Total Requests</p>
                      <p className="text-4xl font-bold text-white">{stats.total_requests}</p>
                    </div>
                    <FileText className="h-12 w-12 text-purple-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-200 text-sm">Completed</p>
                      <p className="text-4xl font-bold text-white">{stats.completed_requests}</p>
                    </div>
                    <Star className="h-12 w-12 text-pink-200" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-6">User Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-white py-3 px-4">Username</th>
                      <th className="text-left text-white py-3 px-4">Email</th>
                      <th className="text-left text-white py-3 px-4">Role</th>
                      <th className="text-left text-white py-3 px-4">Status</th>
                      <th className="text-left text-white py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-4 text-white">{u.username}</td>
                        <td className="py-3 px-4 text-gray-300">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`${u.is_active ? 'bg-green-600' : 'bg-red-600'} text-white px-3 py-1 rounded-full text-sm`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleAssignRole(u.id, e.target.value)}
                            className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="pin">PIN</option>
                            <option value="csr">CSR</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">Submit Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Volunteer ID</label>
                <input
                  type="number"
                  value={review.volunteer_id || ''}
                  onChange={(e) => setReview({ ...review, volunteer_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Rating (1-5)</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReview({ ...review, rating: star })}
                      className={`text-3xl ${star <= review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Comment</label>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  onClick={() => setReview({ ...review, request_id: 1})}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'manager' && user.role === 'manager' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Manager Dashboard</h2>
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Schedule Report
              </button>
            </div>

            {stats && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Total Users</p>
                      <p className="text-4xl font-bold text-white">{stats.total_users}</p>
                    </div>
                    <Users className="h-12 w-12 text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Active Users</p>
                      <p className="text-4xl font-bold text-white">{stats.active_users}</p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Total Requests</p>
                      <p className="text-4xl font-bold text-white">{stats.total_requests}</p>
                    </div>
                    <FileText className="h-12 w-12 text-purple-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-200 text-sm">Completed</p>
                      <p className="text-4xl font-bold text-white">{stats.completed_requests}</p>
                    </div>
                    <Star className="h-12 w-12 text-pink-200" />
                  </div>
                </div>
              </div>
            )}

            {/* Scheduled Reports Section */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20 mb-6">
              <h3 className="text-2xl font-bold text-white mb-6">Scheduled Reports</h3>
              <div className="space-y-4">
                {scheduledReports.map((report) => (
                  <div key={report.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">{report.name}</h4>
                        <div className="flex space-x-4 text-sm text-gray-400">
                          <span>Type: {report.report_type}</span>
                          <span>Frequency: {report.frequency}</span>
                          <span className={`px-2 py-1 rounded ${report.is_active ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                            {report.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {report.last_run && (
                          <p className="text-gray-400 text-sm mt-2">Last run: {new Date(report.last_run).toLocaleString()}</p>
                        )}
                        {report.next_run && (
                          <p className="text-gray-400 text-sm">Next run: {new Date(report.next_run).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {scheduledReports.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No scheduled reports yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* System Logs Section */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
              <button
                onClick={() => setShowAuditTrail(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center transition"
              >
                <FileText className="h-5 w-5 mr-2" />
                Audit
              </button>
            </div>

            <div className="space-y-3">
              {systemLogs.length > 0 ? (
                systemLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex justify-between items-center bg-slate-700/40 rounded-lg px-4 py-3">
                    <p className="text-gray-200 text-sm">{log.action}</p>
                    <span className="text-gray-500 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-6">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">Schedule New Report</h3>
            <form onSubmit={handleCreateScheduledReport} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Report Name</label>
                <input
                  type="text"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Monthly User Activity Report"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Report Type</label>
                <select
                  value={newReport.report_type}
                  onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="user_activity">User Activity</option>
                  <option value="request_stats">Request Statistics</option>
                  <option value="volunteer_performance">Volunteer Performance</option>
                  <option value="system_health">System Health</option>
                </select>
              </div>
              <div>
                <label className="block text-white mb-2">Frequency</label>
                <select
                  value={newReport.frequency}
                  onChange={(e) => setNewReport({ ...newReport, frequency: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="block text-white mb-2">Recipients (comma-separated emails)</label>
                <input
                  type="text"
                  value={newReport.recipients}
                  onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="admin@mockfyp.com, manager@mockfyp.com"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Create Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthProvider>
      <AppContent showRegister={showRegister} setShowRegister={setShowRegister} />
    </AuthProvider>
  );
}

function AppContent({ showRegister, setShowRegister }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegisterPage onSwitch={() => setShowRegister(false)} />
    ) : (
      <LoginPage onSwitch={() => setShowRegister(true)} />
    );
  }

  return <Dashboard />;
}