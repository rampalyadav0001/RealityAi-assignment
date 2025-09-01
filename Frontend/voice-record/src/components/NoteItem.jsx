import React, { useState } from 'react';
import axios from 'axios';

const NoteItem = ({ note, onNoteUpdated, onNoteDeleted, apiBaseUrl }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editTranscript, setEditTranscript] = useState(note.transcript);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async () => {
    try {
      const response = await axios.put(`${apiBaseUrl}/notes/${note._id}`, {
        title: editTitle,
        transcript: editTranscript
      });
      
      onNoteUpdated(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`${apiBaseUrl}/notes/${note._id}`);
      onNoteDeleted(note._id);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
      setIsDeleting(false);
    }
  };

  const generateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const response = await axios.post(`${apiBaseUrl}/notes/${note._id}/summary`);
      
      const updatedNote = {
        ...note,
        summary: response.data.summary,
        hasSummary: true,
        isEdited: false
      };
      
      onNoteUpdated(updatedNote);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const canGenerateSummary = !note.hasSummary || note.isEdited;

  return (
    <div className="note-item">
      <div className="note-header">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-title-input"
          />
        ) : (
          <h3 className="note-title">{note.title}</h3>
        )}
        <div className="note-date">
          {new Date(note.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="note-content">
        {isEditing ? (
          <textarea
            value={editTranscript}
            onChange={(e) => setEditTranscript(e.target.value)}
            rows={4}
            className="edit-transcript-textarea"
          />
        ) : (
          <p className="note-transcript">{note.transcript}</p>
        )}
    

        {note.summary && (
          <div className="note-summary">
            <h4>AI Summary:</h4>
            <p>{note.summary}</p>
          </div>
        )}
      </div>

      <div className="note-actions">
        {isEditing ? (
          <div className="edit-actions">
            <button onClick={handleEdit} className="save-button">
              Save
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditTitle(note.title);
                setEditTranscript(note.transcript);
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="view-actions">
            <button 
              onClick={() => setIsEditing(true)}
              className="edit-button"
            >
              Edit
            </button>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="delete-button"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            
            <button
              onClick={generateSummary}
              disabled={!canGenerateSummary || isGeneratingSummary}
              className="summary-button"
            >
              {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteItem;