import { useState } from "react";
import { Container, Typography, Button, Box, CircularProgress, Paper } from "@mui/material";

const API_URL = import.meta.env.PROD 
  ? "https://audiotranslator.onrender.com/api/audio/translate"
  : "/api/audio/translate";

function App() {
  const [file, setFile] = useState(null);
  const [englishText, setEnglishText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);

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
      setTranslatedText(result.translated_text);
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
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1f4037, #99f2c8)",
        padding: 2,
      }}
    >
      <Paper elevation={5} sx={{ padding: 5, borderRadius: 4, textAlign: "center", maxWidth: 800 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          🎤 AI-Powered Audio Translator
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Upload an English audio file to transcribe and translate it into Tamil.
        </Typography>

        <Box mt={3}>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="audio-upload"
          />
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

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? <CircularProgress size={24} /> : "Upload & Translate"}
          </Button>
        </Box>

        <Box mt={4}>
          <Typography variant="h6" fontWeight="bold">
            Transcribed English Text:
          </Typography>
          <Paper elevation={1} sx={{ p: 2, minHeight: 100, backgroundColor: "#f5f5f5" }}>
            <Typography variant="body1" color="textPrimary">
              {englishText || "English transcription will appear here..."}
            </Typography>
          </Paper>
        </Box>

        <Box mt={4}>
          <Typography variant="h6" fontWeight="bold">
            Translated Tamil Text:
          </Typography>
          <Paper elevation={1} sx={{ p: 2, minHeight: 100, backgroundColor: "#f5f5f5" }}>
            <Typography variant="body1" color="textPrimary">
              {translatedText || "Tamil translation will appear here..."}
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

export default App;
