import prompt from "../models/prompts.js";
import history from "../models/history.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export const generate = async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput || userInput === "") {
      return res.status(400).json({ message: "User input not found" });
    }

    const existingPrompt = await prompt.findById("Education Prompt");

    if (!existingPrompt) {
      return res.status(400).json({ message: "Prompt not found" });
    }

    const updatedPrompt = existingPrompt.template.replace(
      "{userInput}",
      userInput,
    );

    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: updatedPrompt }],
      }),
    });

    if (!groqResponse.ok) {
      return res.status(400).json({ message: "Error fetching API" });
    }

    const data = await groqResponse.json();
    const response = data.choices[0]?.message?.content;

    await new history({
      userInput: userInput,
      response: response,
    }).save();

    res.status(200).json({ response });
  } catch (error) {
    console.log(`error in generate controller : ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const generateMultiple = async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!Array.isArray(userInput) || userInput.length === 0) {
      return res.status(400).json({ message: "User input must be array" });
    }

    const result = await Promise.all(
      userInput.map(async (e) => {
        const existingPrompt = await prompt.findById("Education Prompt");

        if (!existingPrompt) {
          throw new Error("Prompt not found");
        }
        const updatedPrompt = existingPrompt.template.replace("{userInput}", e);

        const groqResponse = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [{ role: "user", content: updatedPrompt }],
          }),
        });

        if (!groqResponse.ok) {
          throw new Error("Error fetching API");
        }

        const data = await groqResponse.json();
        const response = data.choices[0]?.message?.content;

        await new history({
          userInput: e,
          response: response,
        }).save();

        return response;
      }),
    );

    res.status(200).json({ responses: result });
  } catch (error) {
    console.log(`Error handling mutiple response : ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
