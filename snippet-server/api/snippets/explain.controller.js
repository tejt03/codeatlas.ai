const axios = require("axios");
require("dotenv").config();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

// Minimal sanitizer to remove common markdown artifacts from model output
const stripMarkdown = (text) => {
  if (!text) return "";
  return text
    // bold/italic markers
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    // inline code/backticks
    .replace(/`{1,3}/g, "")
    // headings
    .replace(/^#{1,6}\s+/gm, "")
    // blockquote markers
    .replace(/^>\s?/gm, "")
    // excessive blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const explainSnippet = async (req, res) => {
  const codeRaw = req.body?.code;
  const code = typeof codeRaw === "string" ? codeRaw.trim() : "";

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY is not configured" });
  }

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You explain code for beginners. Output plain text only. Do not use markdown, bullets with **, backticks, or headings. Keep it concise.",
          },
          {
            role: "user",
            content:
              "Explain this code in plain English.\n" +
              "Format exactly like this (plain text, no markdown):\n" +
              "What it does: ...\n" +
              "Key logic: ...\n" +
              "Inputs: ...\n" +
              "Output: ...\n\n" +
              `CODE:\n${code}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 250,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    let explanation = response.data?.choices?.[0]?.message?.content || "";
    explanation = stripMarkdown(explanation);

    if (!explanation) {
      return res.status(502).json({ error: "No explanation returned from Groq" });
    }

    return res.json({ explanation });
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Keep these logs (useful for diagnosing production issues)
    console.error("Groq error status:", status);
    console.error("Groq error body:", data);
    console.error("Groq error message:", error.message);

    return res.status(status || 500).json({
      error:
        data?.error?.message ||
        (status === 401 ? "Invalid Groq API key" : "Failed to generate explanation"),
    });
  }
};

module.exports = { explainSnippet };
