import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VoiceRecorder from './components/VoiceRecorder';
import NotesList from './components/NotesList';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API Base URL:", API_BASE_URL);

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notes`);
      setNotes(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteCreated = (newNote) => {
    setNotes(prev => [newNote, ...prev]);
  };

  const handleNoteUpdated = (updatedNote) => {
    setNotes(prev => prev.map(note => 
      note._id === updatedNote._id ? updatedNote : note
    ));
  };

  const handleNoteDeleted = (noteId) => {
    setNotes(prev => prev.filter(note => note._id !== noteId));
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Voice Notes</h1>
        <p>Record, transcribe, and summarize your voice notes</p>
      </header>

      <main className="app-main">
        <VoiceRecorder 
          onNoteCreated={handleNoteCreated}
          apiBaseUrl={API_BASE_URL}
        />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Loading notes...</div>
        ) : (
          <NotesList 
            notes={notes}
            onNoteUpdated={handleNoteUpdated}
            onNoteDeleted={handleNoteDeleted}
            apiBaseUrl={API_BASE_URL}
          />
        )}
      </main>
    </div>
  );
}

export default App;