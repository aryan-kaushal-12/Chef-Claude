const { InferenceClient } = require("@huggingface/inference");

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients and suggests a recipe.
You may include minimal extra ingredients.
Format the response in Markdown.
`;

exports.handler = async (event) => {
  try {
    // Check if API key is set
    const apiKey = process.env.HF_ACCESS_TOKEN;
    if (!apiKey) {
      console.error("HF_ACCESS_TOKEN is not set");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "HF_ACCESS_TOKEN not set in environment" }),
      };
    }

    // Parse request body
    const body = JSON.parse(event.body || "{}");
    const { ingredients } = body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid ingredients array" }),
      };
    }

    // Initialize Hugging Face client
    const hf = new InferenceClient({ accessToken: apiKey });

    // Call Hugging Face chat completion
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `I have ${ingredients.join(", ")}. Suggest a recipe!` },
      ],
      max_tokens: 1024,
    });

    console.log("HF Response:", response); // Debug: log full response

    // Safely extract recipe text
    const recipe =
      response.choices?.[0]?.message?.content || // latest chatCompletion format
      response.generated_text || // fallback for older versions
      "No recipe returned";

    return {
      statusCode: 200,
      body: JSON.stringify({ recipe }),
    };
  } catch (err) {
    console.error("Mistral Function Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Unknown server error" }),
    };
  }
};
