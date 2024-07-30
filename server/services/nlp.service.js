import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

async function generateContent(prompt) {
  const url = "https://api.openai.com/v1/completions";

  const data = {
    model: "text-davinci-003", // You can adjust the model as needed
    prompt: prompt,
    max_tokens: 150, // Adjust max_tokens as needed
    temperature: 0.7, // Adjust temperature for creativity
  };

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, data, { headers });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content");
  }
}

const result = async () => {
  const prompt =
    "Write a short story about a person who is struggling with anxiety. The story should be written in the first person and should include details about the character's thoughts, feelings, and actions. The story should be at least 500 words long and should include a clear beginning, middle, and end.";
  const content = await generateContent(prompt);
  console.log(content);
};
result();
export default generateContent;
