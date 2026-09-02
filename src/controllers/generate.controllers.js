import prompt from "../models/prompts.js";

export const generate = async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput || userInput === "") {
      return res.status(400).json({ message: "User input not found" });
    }

    const currentPrompt = await prompt.findById("Education Prompt");

    if (!currentPrompt) {
      return res.status(400).json({ message: "Prompt not found" });
    }

    const newPrompt = currentPrompt.template.replace("{userInput}", userInput);

    res
      .status(200)
      .json({ message: "Prompt generated successfully", prompt: newPrompt });
  } catch (error) {
    console.log(`error in generate controller : ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
