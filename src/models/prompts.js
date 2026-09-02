import mongoose from "mongoose";

const promptSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    required: true,
  },
});

const prompt = mongoose.model("prompt", promptSchema);

export default Prompt;
