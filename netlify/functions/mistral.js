const { InferenceClient } = require("@huggingface/inference");

const hf = new InferenceClient({
  accessToken: process.env.HF_ACCESS_TOKEN,
});

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients and suggests a recipe.
You may include minimal extra ingredients.
Format the response in Markdown.
`;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { ingredients } = body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid ingredients array" }),
      };
    }

    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `I have ${ingredients.join(", ")}. Suggest a recipe!` },
      ],
      max_tokens: 1024,
    });

    // Log response to check structure
    console.log("HF Response:", response);

    // Use correct property depending on HF response
    const recipe = response.choices?.[0]?.message?.content || response.generated_text || "No response";

    return {
      statusCode: 200,
      body: JSON.stringify({ recipe }),
    };
  } catch (err) {
    console.error("Mistral Function Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
