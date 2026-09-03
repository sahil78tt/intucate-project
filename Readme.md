<h1 align="center">Intucate Case Study</h1>

<p align="center">
AI-powered prompt generation API - single and batch modes.
</p>

<p align="center">
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Groq-LLM-F55036?style=for-the-badge" />
</p>

---

## What is this?

A backend API built for the IntuCATE Full Stack Developer case study. It fetches a stored prompt template from MongoDB, injects user input into it, sends it to Groq (OpenAI-compatible) for a response, and logs every request/response pair to a history collection — with a batch endpoint that processes multiple inputs concurrently.

---

## Tech Stack

**Backend** — Node.js, Express, MongoDB (Mongoose), Groq API via native `fetch()`

### Why Node.js/Express/MongoDB instead of Python + Flask?

The case study FAQ allows flexibility: _"There is no strict requirement on the tech stack. Use what you are most comfortable and proficient with."_ I chose my strongest stack to focus on backend design, async handling, and code clarity — the stated evaluation criteria — instead of working in an unfamiliar language under time pressure.

---

## Project Structure

```
intucate-Project/
├── src/
│   ├── server.js
│   ├── configs/
│   │   └── db.js
│   ├── controllers/
│   │   └── generate.controllers.js
│   ├── models/
│   │   ├── prompts.js
│   │   └── history.js
│   └── routes/
│       └── generate.routes.js
├── .env
├── package.json
└── README.md
```

---

## API Reference

| Method | Endpoint           | Description                                           |
| ------ | ------------------ | ----------------------------------------------------- |
| POST   | /generate          | Generate a single AI response                         |
| POST   | /generate/multiple | Generate responses for a batch of inputs (concurrent) |

### `POST /generate`

**Request:**

```json
{ "userInput": "How much should I score in each subject to pass CA final?" }
```

**Response:**

```json
{ "response": "..." }
```

### `POST /generate/multiple`

**Request:**

```json
{ "userInput": ["What is JavaScript?", "What is Node.js?", "What is MongoDB?"] }
```

**Response:**

```json
{ "responses": ["...", "...", "..."] }
```

---

## Concurrency — `Promise.all()`

`.map()` fires the async callback for every input immediately, without waiting for the previous one to finish — each Groq call starts right away. Since none of these calls await on each other, they run **concurrently** instead of sequentially. `Promise.all()` waits for all of them and returns results in the **original input order**, regardless of which one resolves first.

---

## MongoDB

**Database:** `intucate`

| Collection  | Purpose                                                            |
| ----------- | ------------------------------------------------------------------ |
| `prompts`   | Stores templates, keyed by `_id`, with a `{userInput}` placeholder |
| `histories` | Every request/response pair, auto-created per call                 |

---

## Installation

```bash
git clone https://github.com/sahil78tt/intucate-project.git
cd intucate-project
npm install
```

**`.env`**

```
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

```bash
npm run dev
```

Server runs at `http://localhost:4600`

---

## Error Handling

- Missing/empty `userInput` → `400`
- Invalid items in batch array (non-string / empty) → `400`
- Prompt template not found → `400`
- Groq API failure → `400` (single) / batch fails together via `Promise.all`
- Unexpected errors → `500`

---

## Notes

- Used Groq's OpenAI-compatible endpoint instead of OpenAI directly — permitted by the FAQ ("a mock implementation, a free alternative... or any other approach you prefer").
- Used plain `fetch()` instead of the Groq SDK to keep every request/response step visible and explainable.

---

<p align="center">
Built by <a href="https://github.com/sahil78tt">Sahil Vishwakarma</a>
</p>
