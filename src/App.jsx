import { useState } from "react";
import { Typography, Button, Box, CircularProgress, Paper, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

const API_URL = import.meta.env.PROD 
  ? "https://audiotranslator.onrender.com/api/audio/translate"
  : "/api/audio/translate";

function App() {
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState("Tamil");
  const [englishText, setEnglishText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an audio file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", targetLanguage);

    setLoading(true);
    setEnglishText("");
    setTranslatedText("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error processing the audio file.");
      }

      const result = await response.json();

      setEnglishText(result.original_text);
      setTranslating(true);

      setTimeout(() => {
        setTranslatedText(result.translated_text);
        setTranslating(false);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to upload and process the audio file.");
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
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1f4037, #99f2c8)",
        padding: 3,
      }}
    >
      <Paper elevation={5} sx={{ padding: 5, borderRadius: 4, textAlign: "center", maxWidth: 700, width: "90%" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          🎤 AI-Powered Audio Translator
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Upload an English audio file to transcribe and translate it into Tamil or Malay.
        </Typography>

        <Box mt={3}>
          <input type="file" accept="audio/*" onChange={handleFileChange} style={{ display: "none" }} id="audio-upload" />
          <label htmlFor="audio-upload">
            <Button variant="contained" component="span" sx={{ mb: 2 }}>
              Select Audio File
            </Button>
          </label>
          {file && (
            <Typography variant="body1" color="textSecondary">
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="language-select-label">Translate To</InputLabel>
          <Select
            labelId="language-select-label"
            value={targetLanguage}
            label="Translate To"
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <MenuItem value="Tamil">Tamil</MenuItem>
            <MenuItem value="Malay">Malay</MenuItem>
          </Select>
        </FormControl>

        <Box mt={3}>
          <Button variant="contained" color="primary" onClick={handleUpload} disabled={loading || !file}>
            {loading ? <CircularProgress size={24} /> : "Upload & Translate"}
          </Button>
        </Box>

        <Box mt={4} sx={{ display: "flex", justifyContent: "center" }}>
          <Paper elevation={1} sx={{ p: 3, minHeight: 80, width: "100%", backgroundColor: "#f5f5f5" }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Transcribed English Text:
            </Typography>
            <Typography variant="body1" color="textPrimary">
              {englishText || (loading ? "Transcribing..." : "English transcription will appear here...")}
            </Typography>
          </Paper>
        </Box>

        <Box mt={4} sx={{ display: "flex", justifyContent: "center" }}>
          <Paper elevation={1} sx={{ p: 3, minHeight: 80, width: "100%", backgroundColor: "#f5f5f5" }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Translated {targetLanguage} Text:
            </Typography>
            <Typography variant="body1" color="textPrimary">
              {translating ? "Translating..." : translatedText || `${targetLanguage} translation will appear here...`}
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

export default App;
