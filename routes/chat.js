const express = require("express");
const router = express.Router();
const generateGeminiResponse = require('../utils/gemini');
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
// const { uploadProfile, uploadCompanyLogo, uploadUserResume, uploadChatbotResume } = require('../middleware/multer');
const extractTextFromResume = require('../utils/resumeParser')

const Storage = multer.memoryStorage()

const Filter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.docx'];

    if (allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid resume format'), false);
    }
}

const upload = multer({
    storage: Storage,
    fileFilter: Filter,
    limits: { fileSize: 2 * 1024 * 1024 }
})

router.post("/chat", upload.single("resumechat"), async (req, res, next) => {
    const { prompt, instruction } = req.body;
    const url = req.file?.path || req.file?.secure_url || req.file?.url;

    try {
        let finalPrompt = '';

        if (req.file) {
            const extractedText = await extractTextFromResume(req.file?.path || req.file?.secure_url || req.file?.url);

            finalPrompt = `
You are acting as a personal mentor for the student who uploaded the following file (which could be an assignment, question, resume, or any academic material).
Your role is to:
- Understand the content from the uploaded file
- Analyze the student's query (if provided)
- Provide a clear, constructive response like a real mentor would
- Offer suggestions, guidance, and encouragement

Uploaded Content:
${extractedText}

Student Query: "${prompt || "Please review and guide me like a mentor."}"

Respond like a caring mentor who wants the student to grow in academics and career. Be warm, clear, practical, and supportive.
`
                ;
        } else if (prompt) {
            finalPrompt = `
You are a mentor assistant for EduPortal.

Only respond to queries related to:
- Academics
- Career growth
- Internships
- Personal development
- Resume & interview prep

Kindly decline if the query is unrelated to student growth.

Student's Query: "${prompt}"
            `;
        }
        else {
            return res.status(400).json({ error: "Prompt or resume required" });
        }

        const response = await generateGeminiResponse(finalPrompt, instruction)
        res.json({ response });
    }
    catch (err) {
        console.error("Chat Error:", err.message);
        res.status(500).json({ error: "Failed to handle chat request." });
    } finally {
        if (req.file) {
            fs.unlink(req.file?.path || req.file?.secure_url || req.file?.url
                , () => { }); // optional cleanup
        }
    }
});



module.exports = router;
