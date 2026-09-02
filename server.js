import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Home Route" });
});

app.listen(PORT, () => {
  console.log(`Server is up and running on https://localhost:${PORT}`);
});
