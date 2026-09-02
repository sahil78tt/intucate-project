import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  userInput: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
});

const history = mongoose.model("history", historySchema);

export default history;
