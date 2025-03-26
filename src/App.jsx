import { useState } from "react";
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";

const API_URL = import.meta.env.PROD
  ? "https://audiotranslator.onrender.com/api/audio/translate"
  : "/api/audio/translate";

const TARGET_LANGUAGES = ["Tamil", "Malay", "Mandarin", "Cantonese", "Japanese"];
const AUDIO_LANGUAGES = [...TARGET_LANGUAGES]; // For "Translate to English"

function App() {
  const [mode, setMode] = useState(""); // "from" or "to"
  const [file, setFile] = useState(null);
  const [audioLanguage, setAudioLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");
  const [englishText, setEnglishText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const resetState = () => {
    setFile(null);
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
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Error processing the audio file.");

      const result = await response.json();
      setEnglishText(result.original_text);
      setTranslating(true);

      setTimeout(() => {
        setTranslatedText(result.translated_text);
        setTranslating(false);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process the audio.");
    } finally {
      setLoading(false);
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
        padding: 3
      }}
    >
      <Paper elevation={5} sx={{ padding: 5, borderRadius: 4, textAlign: "center", maxWidth: 700, width: "100%" }}>
        {/* Initial Mode Selection View */}
        {!mode && (
          <>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              What would you like to do?
            </Typography>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel>Select Mode</InputLabel>
              <Select
                value=""
                label="Select Mode"
                onChange={(e) => {
                  setMode(e.target.value);
                  resetState();
                  if (e.target.value === "from") {
                    setAudioLanguage("English");
                    setTargetLanguage("Tamil");
                  } else {
                    setAudioLanguage("Tamil");
                    setTargetLanguage("English");
                  }
                }}
              >
                <MenuItem value="from">Translate from English</MenuItem>
                <MenuItem value="to">Translate to English</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body1" color="textSecondary">
              Please choose a mode above to start transcribing and translating your audio.
            </Typography>
          </>
        )}

        {/* English ➝ Target Language */}
        {mode === "from" && (
          <>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              🎤 Translate English Audio To Another Language
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Translate To</InputLabel>
              <Select value={targetLanguage} label="Translate To" onChange={(e) => setTargetLanguage(e.target.value)}>
                {TARGET_LANGUAGES.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        {/* Any Language ➝ English */}
        {mode === "to" && (
          <>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              🎤 Translate Audio From Another Language to English
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Audio Language</InputLabel>
              <Select value={audioLanguage} label="Audio Language" onChange={(e) => setAudioLanguage(e.target.value)}>
                {AUDIO_LANGUAGES.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        {/* File Upload */}
        {mode && (
          <>
            <Box mt={2}>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "none" }}
                id="audio-upload"
              />
              <label htmlFor="audio-upload">
                <Button variant="contained" component="span" sx={{ mb: 2 }}>
                  Select Audio File
                </Button>
              </label>
              {file && <Typography>Selected: {file.name}</Typography>}
            </Box>

            <Button variant="contained" color="primary" onClick={handleUpload} disabled={loading || !file}>
              {loading ? <CircularProgress size={24} /> : "Upload & Translate"}
            </Button>

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
      </Paper>
    </Box>
  );
}

export default App;
