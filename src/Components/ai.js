export async function getRecipeFromMistral(ingredientsArr) {
  try {
    if (!Array.isArray(ingredientsArr) || ingredientsArr.length === 0) {
      throw new Error("Ingredients array is empty or invalid");
    }

    const response = await fetch("/.netlify/functions/mistral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: ingredientsArr }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.recipe;
  } catch (err) {
    console.error("Frontend API Error:", err.message);
    return "❌ Error: " + err.message;
  }
}
