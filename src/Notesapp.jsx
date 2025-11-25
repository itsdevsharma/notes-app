import React, { useState, useEffect } from "react";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  loginUser,
  registerUser,
} from "./api.jsx";
import "./App.css";

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Load notes on page load (only if logged in)
useEffect(() => {
  const loadNotes = async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchNotes();
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err.response || err.message);

      if (err.response && err.response.status === 401) {
        // Token invalid or expired
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        setError("Failed to fetch notes");
      }
    } finally {
      setLoading(false);
    }
  };

  loadNotes();
}, [isLoggedIn]);


  // Login
const handleLogin = async () => {
  try {
    const res = await loginUser({ email, password });

    // Check if server returned a token
    if (res.data && res.data.token) {
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
    } else {
      throw new Error("No token returned from server");
    }
  } catch (err) {
    console.error(
      "Login failed:",
      err.response ? err.response.data : err.message
    );
    alert(
      "Login failed: " +
        (err.response?.data?.message || err.message || "Check credentials")
    );
  }
};

  // Register (optional)
const handleRegister = async () => {
  try {
    await registerUser({
      username: email.split("@")[0],
      email,
      password,
    });

    // Auto-login after successful registration
    const loginRes = await loginUser({ email, password });
    if (loginRes.data?.token) {
      localStorage.setItem("token", loginRes.data.token);
      setIsLoggedIn(true);
    }
  } catch (err) {
    console.error("Register failed:", err.response || err.message);
    alert(
      "Registration failed: " +
        (err.response?.data?.message || err.message || "Check input")
    );
  }
};



  // Add Note
  const handleAddNote = async () => {
    if (!title || !content) return alert("Title and Content required");
    try {
      const res = await createNote({ title, content });
      setNotes([...notes, res.data]);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  // Delete note
  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // Save update
  const handleUpdate = async (id) => {
    try {
      const res = await updateNote(id, {
        title: editTitle,
        content: editContent,
      });
      setNotes(notes.map((note) => (note._id === id ? res.data : note)));
      setEditingNoteId(null);
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setNotes([]);
  };

  return (
    <div className="app">
      <h1>Notes App</h1>

      {!isLoggedIn ? (
        <div className="auth-form">
          <h2>Login / Register</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      ) : (
        <>
          <button className="logout-button" onClick={handleLogout}>Logout</button>

          {/* Add Note Form */}
          <div className="note-input">
            <input
              className="title-input"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <br />
            <textarea
              className="content-input"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <br />
            <button onClick={handleAddNote}>Add Note</button>
          </div>

          {loading && <p>Loading notes...</p>}
          {error && <p className="error">{error}</p>}

          {/* Notes List */}
          <ul className="notes-list">
            {Array.isArray(notes) &&
              notes.map((note) => (
                <li key={note._id}>
                  {editingNoteId === note._id ? (
                    <>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      ></textarea>
                      <button onClick={() => handleUpdate(note._id)}>
                        Save
                      </button>
                      <button onClick={() => setEditingNoteId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>{note.title}</h3>
                      <p>{note.content}</p>
                      <button onClick={() => {
                        setEditingNoteId(note._id);
                        setEditTitle(note.title);
                        setEditContent(note.content);
                      }}>Edit</button>
                      <button onClick={() => handleDelete(note._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default NotesApp;

