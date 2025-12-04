import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Tabs, Tab, Grid } from "@mui/material";

export default function App() {
  const [tab, setTab] = useState(0);
  const [keywords, setKeywords] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [designs, setDesigns] = useState([]); // <-- store fetched images
  const DESIGNS_API =
    "https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/getAllAIDesigns";

  // -------------------------------
  // FETCH ALL AI DESIGNS FROM API
  // -------------------------------
  const fetchDesigns = async () => {
    try {
      const res = await fetch(DESIGNS_API);
      const data = await res.json();

      // Expecting an array of image URLs in `data.designs`
      setDesigns(data.data || []);
    } catch (err) {
      console.error("Error fetching designs:", err);
    }
  };

  // Fetch on tab switch OR first load
  useEffect(() => {
    if (tab === 1) {
      fetchDesigns();
    }
  }, [tab]);

  // ---------------------------------
  // GENERATE IMAGE (backend API call)
  // ---------------------------------
  const handleGenerate = async () => {
    if (!keywords.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/generateImage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: keywords }),
        }
      );

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
    } catch (err) {
      console.error("Error generating image:", err);
    }

    setIsLoading(false);
  };

  const handleRefresh = () => {
    setGeneratedImage(null);
    setKeywords("");
  };

  return (
    <Box display="flex" height="100vh">
      {/* LEFT SIDEBAR */}
      <Box
        width="300px"
        borderRight="1px solid #ccc"
        p={2}
        display="flex"
        flexDirection="column"
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          orientation="vertical"
          sx={{
            alignItems: "flex-start",

            // ensures the label text aligns left
            "& .MuiTab-root": {
              alignItems: "flex-start",
              justifyContent: "flex-start",
              textAlign: "left",
            },
          }}
        >
          <Tab label="Generate Designs" />
          <Tab label="My Designs" />
        </Tabs>
      </Box>

      {/* MAIN CONTENT */}
      <Box flex={1} p={3} overflow="auto">
        {/* TAB 1 */}
        {tab === 0 && (
          <Box>
            <h2>Welcome to AI Generate Designs</h2>

            <TextField
              fullWidth
              placeholder="Enter the design keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              onClick={handleGenerate}
              variant="contained"
              disabled={isLoading}
              sx={{
                backgroundColor: "#F9D342",
                color: "#000",
                "&:hover": { backgroundColor: "#e6c435" },
              }}
            >
              {isLoading ? "Generating..." : "Generate Image"}
            </Button>

            {generatedImage && (
              <Box mt={3}>
                <img
                  src={generatedImage}
                  alt="Generated"
                  style={{ width: "60%", borderRadius: "8px" }}
                />

                <Box mt={2} display="flex" justifyContent="flex-start">
                  <Button variant="outlined" onClick={handleRefresh}>
                    Refresh
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* TAB 2 - SHOW AI DESIGNS */}
        {console.log(designs)}
        {tab === 1 && (
          <Grid container spacing={2}>
            {designs.map((img, idx) => (
              <Grid item xs={4} key={idx}>
                <img
                  src={img.imageUrl}
                  alt="AI design"
                  style={{
                    width: "100%",
                    height: "33vh",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
