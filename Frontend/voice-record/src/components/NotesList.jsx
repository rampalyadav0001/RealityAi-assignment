import React from 'react';
import NoteItem from './NoteItem';

const NotesList = ({ notes, onNoteUpdated, onNoteDeleted, apiBaseUrl }) => {
  if (notes.length === 0) {
    return (
      <div className="notes-list empty">
        <div className="empty-state">
          <h3>No notes yet</h3>
          <p>Start by recording your first voice note or typing a text note above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-list">
      <h2>Your Notes ({notes.length})</h2>
      <div className="notes-grid">
        {notes.map(note => (
          <NoteItem
            key={note._id}
            note={note}
            onNoteUpdated={onNoteUpdated}
            onNoteDeleted={onNoteDeleted}
            apiBaseUrl={apiBaseUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default NotesList;
