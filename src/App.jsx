import { useState, useRef } from "react";
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const API_UPLOAD_URL = import.meta.env.PROD
  ? "https://audiotranslator.onrender.com/api/audio/translate"
  : "/api/audio/translate";

const API_MIC_URL = import.meta.env.PROD
  ? "https://audiotranslator.onrender.com/api/audio/mic-translate"
  : "/api/audio/mic-translate";

const TRIGGER_ONEDRIVE_SYNC_URL = "https://api.github.com/repos/KamizCoding/verve-audio-middleware/actions/workflows/middleware-job.yml/dispatches";


const TARGET_LANGUAGES = ["Tamil", "Malay", "Mandarin", "Cantonese", "Japanese"];
const AUDIO_LANGUAGES = [...TARGET_LANGUAGES];

function App() {
  const [mode, setMode] = useState("");
  const [subMode, setSubMode] = useState("");
  const [file, setFile] = useState(null);
  const [audioLanguage, setAudioLanguage] = useState("Tamil");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [englishText, setEnglishText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const resetState = () => {
    setFile(null);
    setSubMode("");
    setEnglishText("");
    setTranslatedText("");
    setLoading(false);
    setTranslating(false);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an audio file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("audioLanguage", audioLanguage);
    formData.append("language", targetLanguage);

    setLoading(true);
    setEnglishText("");
    setTranslatedText("");

    try {
      const response = await fetch(API_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setEnglishText(result.original_text);
      setTranslating(true);

      setTimeout(() => {
        setTranslatedText(result.translated_text);
        setTranslating(false);
      }, 500);
    } catch (err) {
      alert("Failed to process the audio.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    recordedChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = handleStopRecording;
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const handleStopRecording = async () => {
    setRecording(false);
    const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("audioLanguage", audioLanguage);

    setLoading(true);
    setEnglishText("");
    setTranslatedText("");

    try {
      const response = await fetch(API_MIC_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setEnglishText(result.original_text);
      setTranslating(true);

      setTimeout(() => {
        setTranslatedText(result.translated_text);
        setTranslating(false);
      }, 500);
    } catch (err) {
      alert("Mic processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const triggerOneDriveSync = async () => {
    try {
      const res = await fetch(TRIGGER_ONEDRIVE_SYNC_URL, {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_PAT}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ ref: "main" }),
      });

      if (res.ok) {
        alert("OneDrive sync job triggered successfully via GitHub Actions!");
      } else {
        alert("Failed to trigger GitHub Action. Please check token or repo.");
      }
    } catch (error) {
      alert("Error triggering GitHub Action: " + error.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1f4037, #99f2c8)",
        padding: 3,
      }}
    >
      <Paper elevation={5} sx={{ p: 5, borderRadius: 4, textAlign: "center", maxWidth: 700, width: "100%" }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          🎤 Verve AI Audio Translator
        </Typography>

        {!mode && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              What would you like to do?
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Mode</InputLabel>
              <Select
                value=""
                onChange={(e) => {
                  setMode(e.target.value);
                  resetState();
                  if (e.target.value === "from") {
                    setAudioLanguage("English");
                    setTargetLanguage("Tamil");
                  } else if (e.target.value === "to") {
                    setAudioLanguage("Tamil");
                    setTargetLanguage("English");
                  }
                }}
              >
                <MenuItem value="from">Translate from English</MenuItem>
                <MenuItem value="to">Translate to English</MenuItem>
                <MenuItem value="onedrive">Trigger OneDrive Audio Fetch</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {mode === "to" && !subMode && (
          <>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>
              Choose Input Method for Translation to English
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Input Type</InputLabel>
              <Select value="" onChange={(e) => setSubMode(e.target.value)}>
                <MenuItem value="upload">Upload Audio File</MenuItem>
                <MenuItem value="mic">Speak & Translate</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {mode === "from" && (
          <>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>
              🎧 Translate English Audio to Another Language
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Translate To</InputLabel>
              <Select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
                {TARGET_LANGUAGES.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <input type="file" accept="audio/*" id="file-upload" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
            <label htmlFor="file-upload">
              <Button variant="contained" component="span" sx={{ mb: 2 }}>
                Select Audio File
              </Button>
            </label>
            {file && <Typography>{file.name}</Typography>}

            <Button variant="contained" onClick={handleUpload} disabled={loading || !file}>
              {loading ? <CircularProgress size={24} /> : "Upload & Translate"}
            </Button>
          </>
        )}

        {mode === "to" && subMode === "upload" && (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Audio Language</InputLabel>
              <Select value={audioLanguage} onChange={(e) => setAudioLanguage(e.target.value)}>
                {AUDIO_LANGUAGES.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <input type="file" accept="audio/*" id="file-upload" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
            <label htmlFor="file-upload">
              <Button variant="contained" component="span" sx={{ mb: 2 }}>
                Select Audio File
              </Button>
            </label>
            {file && <Typography>{file.name}</Typography>}

            <Button variant="contained" onClick={handleUpload} disabled={loading || !file}>
              {loading ? <CircularProgress size={24} /> : "Upload & Translate"}
            </Button>
          </>
        )}

        {mode === "to" && subMode === "mic" && (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Audio Language</InputLabel>
              <Select value={audioLanguage} onChange={(e) => setAudioLanguage(e.target.value)}>
                {AUDIO_LANGUAGES.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color={recording ? "error" : "success"}
              onClick={() => {
                if (recording) mediaRecorderRef.current.stop();
                else handleStartRecording();
              }}
            >
              {recording ? "Stop Recording" : "Start Recording"}
            </Button>
          </>
        )}

        {mode && (
          <>
            <Box mt={4}>
              <Paper elevation={1} sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Transcribed Text:
                </Typography>
                <Typography>{englishText || (loading ? "Transcribing..." : "Will appear here...")}</Typography>
              </Paper>
            </Box>

            <Box mt={4}>
              <Paper elevation={1} sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Translated Text:
                </Typography>
                <Typography>{translating ? "Translating..." : translatedText || "Will appear here..."}</Typography>
              </Paper>
            </Box>

            <Button onClick={() => setMode("")} sx={{ mt: 3 }}>
              🔙 Back to Mode Selection
            </Button>
          </>
        )}


        {mode === "onedrive" && (
          <>
            <Typography sx={{ mb: 2 }}>
              This will trigger GitHub Actions to fetch and process OneDrive audio files.
            </Typography>
            <Button variant="contained" onClick={triggerOneDriveSync}>
              🔁 Trigger OneDrive Sync
            </Button>
            <Button onClick={() => setMode("")} sx={{ mt: 3 }}>
              🔙 Back to Mode Selection
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default App;
