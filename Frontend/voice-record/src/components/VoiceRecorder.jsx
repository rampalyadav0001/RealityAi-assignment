import React, { useState, useRef } from 'react';
import axios from 'axios';

const VoiceRecorder = ({ onNoteCreated, apiBaseUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [manualTranscript, setManualTranscript] = useState('');
  const [mode, setMode] = useState('record'); // 'record' or 'text'
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        uploadAudioNote(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const uploadAudioNote = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('title', title || 'Voice Note');

      const response = await axios.post(`${apiBaseUrl}/notes`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onNoteCreated(response.data);
      setTitle('');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error uploading audio note:', error);
      alert('Failed to create voice note');
      setIsProcessing(false);
    }
  };

  const createTextNote = async () => {
    if (!manualTranscript.trim()) {
      alert('Please enter some text for the note');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await axios.post(`${apiBaseUrl}/notes`, {
        title: title || 'Text Note',
        transcript: manualTranscript.trim()
      });

      onNoteCreated(response.data);
      setTitle('');
      setManualTranscript('');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error creating text note:', error);
      alert('Failed to create text note');
      setIsProcessing(false);
    }
  };

  return (
    <div className="voice-recorder">
      <div className="recorder-header">
        <div className="mode-switcher">
          <button 
            className={mode === 'record' ? 'active' : ''}
            onClick={() => setMode('record')}
          >
            Voice Recording
          </button>
          <button 
            className={mode === 'text' ? 'active' : ''}
            onClick={() => setMode('text')}
          >
            Text Input
          </button>
        </div>
      </div>

      <div className="recorder-form">
        <input
          type="text"
          placeholder="Enter note title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />

        {mode === 'record' ? (
          <div className="recording-controls">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`record-button ${isRecording ? 'recording' : ''}`}
            >
              {isProcessing ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {isRecording && <div className="recording-indicator">🔴 Recording...</div>}
          </div>
        ) : (
          <div className="text-input-controls">
            <textarea
              placeholder="Type your note here..."
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              rows={4}
              className="transcript-input"
            />
            <button
              onClick={createTextNote}
              disabled={isProcessing || !manualTranscript.trim()}
              className="create-note-button"
            >
              {isProcessing ? 'Creating...' : 'Create Note'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
