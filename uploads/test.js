import express from "express";
import multer from "multer";

const app = express();

// Multer storage configuration (Optional: Customize if saving files)
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle form-data from Postman
app.post("/upload", upload.single("image"), (req, res) => {
  try {
    const { name, description, source_code_link, live_site_link } = req.body;
    const tags = JSON.parse(req.body.tags); // Parse JSON string if sent as text
    const image = req.file ? req.file.buffer.toString("base64") : null; // Convert file to base64 (optional)

    // Log received data
    console.log("Name:", name);
    console.log("Description:", description);
    console.log("Tags:", tags);
    console.log("Source Code Link:", source_code_link);
    console.log("Live Site Link:", live_site_link);
    console.log("Image:", image ? "File received" : "No file");

    res.status(200).json({
      message: "Form-data received successfully",
      data: {
        name,
        description,
        tags,
        source_code_link,
        live_site_link,
        image,
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid form-data" });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
