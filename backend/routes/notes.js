import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import VoiceNote from "../models/VoiceNote.js";
import { generateTranscript, generateSummary } from "../services/gemini.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ".wav"),
});
const upload = multer({ storage });

// Get all notes
router.get("/", async (req, res) => {
  try {
    const notes = await VoiceNote.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new note (transcribe audio)
router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const { title } = req.body;
    // const audioUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let transcript = "";
    if (req.file) {
      transcript = await generateTranscript(req.file.path);

      //  If transcript generated successfully, delete audio file
      if (transcript && transcript.trim() !== "") {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting audio file:", err);
          else console.log("Audio file deleted successfully.");
        });
       
      }
    } else if (req.body.transcript) {
      transcript = req.body.transcript;
    }

    const voiceNote = new VoiceNote({
      title: title || "Untitled Note",
      // audioUrl,
      transcript,
    });

    await voiceNote.save();
    res.status(201).json(voiceNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Update note
router.put("/:id", async (req, res) => {
  try {
    const { title, transcript } = req.body;
    const note = await VoiceNote.findById(req.params.id);

    if (!note) return res.status(404).json({ error: "Note not found" });

    const isTranscriptChanged = note.transcript !== transcript;

    const updatedNote = await VoiceNote.findByIdAndUpdate(
      req.params.id,
      {
        title,
        transcript,
        summary: isTranscriptChanged ? "" : note.summary,
        hasSummary: isTranscriptChanged ? false : note.hasSummary,
        isEdited: isTranscriptChanged || note.isEdited,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate summary
router.post("/:id/summary", async (req, res) => {
  try {
    const note = await VoiceNote.findById(req.params.id);

    if (!note) return res.status(404).json({ error: "Note not found" });

    if (note.hasSummary && !note.isEdited) {
      return res.json({ summary: note.summary });
    }

    const summary = await generateSummary(note.transcript);

    const updatedNote = await VoiceNote.findByIdAndUpdate(
      req.params.id,
      { summary, hasSummary: true, isEdited: false, updatedAt: new Date() },
      { new: true }
    );

    res.json({ summary: updatedNote.summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete note
router.delete("/:id", async (req, res) => {
  try {
    const note = await VoiceNote.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    // if (note.audioUrl) {
    //   const filePath = path.join(__dirname, "..", note.audioUrl);
    //   if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    // }

    await VoiceNote.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
