import mongoose from "mongoose";

const voiceNoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // audioUrl: { type: String },
  transcript: { type: String, required: true },
  summary: { type: String, default: "" },
  hasSummary: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const VoiceNote = mongoose.model("VoiceNote", voiceNoteSchema);
export default VoiceNote;
