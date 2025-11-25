import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Notes APIs
export const fetchNotes = () => API.get('/notes');
export const createNote = (newNote) => API.post('/notes', newNote);
export const updateNote = (id, updatedNote) => API.put(`/notes/${id}`, updatedNote);
export const deleteNote = (id) => API.delete(`/notes/${id}`);

// Auth APIs
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
