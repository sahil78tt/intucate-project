# Intucate Case Study — AI Prompt Generation API

## Overview

The Node.js backend that fetches a prompt template from MongoDB, populates it with the user’s input, sends it to the AI API (Groq, compatible with OpenAI), and records the request and response in a history collection. Part of the Intucate Full Stack Developer case study project.

## Tech Stack

- **Node.js + Express.js** — server and routing
- **MongoDB + Mongoose** — data storage (prompts and history)
- **Groq API** — AI response generation, called via native `fetch()` (no SDK)

### Why Node.js/Express/MongoDB instead of Python + Flask?

In regards to tech stack, the case study FAQ made it clear that _"There is no strict requirement on the tech stack. Use what you are most comfortable and proficient with."_ This made me select Node.js, Express, and MongoDB as my best tech stack, which helped me concentrate on designing the back end of the application and proper asynchronous processing and coding, which are actually the parameters for evaluation.

## Project Structure

```
Intucate-Project/
  src/
    server.js
    configs/
      db.js
    controllers/
      generate.controllers.js
    models/
      prompts.js
      history.js
    routes/
      generate.routes.js
  .env
  package.json
  README.md
```

## Setup Instructions

1. Clone the repository:

   ```
   git clone https://github.com/sahil78tt/intucate-project.git
   cd intucate-project
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```
   PORT=your_port
   MONGO_URI=your_mongodb_connection_string
   GROQ_API_KEY=your_groq_api_key
   ```

4. Seed the `prompts` collection in MongoDB with the required document:

   ```json
   {
     "_id": "Education Prompt",
     "template": "You are an expert in education domain. Answer the following: {userInput}"
   }
   ```

5. Run the server:

   ```
   npm run dev
   ```

6. Server runs at `http://localhost:4600`

## MongoDB Structure

**Database:** `intucate`

**Collections:**

- `prompts` — stores prompt templates, keyed by `_id` (e.g. `"Education Prompt"`), with a `template` string containing a `{userInput}` placeholder.
- `histories` — stores every request/response pair. Each document has `userInput` and `response` fields, created automatically as requests are processed. (Mongoose pluralizes the `history` model name to `histories` by default.)

## API Endpoints

### 1. Generate Single Response

`POST /generate`

**Request body:**

```json
{
  "userInput": "How much should I score in each subject to pass CA final?"
}
```

**Response:**

```json
{
  "response": "..."
}
```

**Flow:** validates input → fetches the `Education Prompt` template from MongoDB → replaces `{userInput}` with the actual input → calls the Groq API → saves the request/response pair to `history` → returns the response.

### 2. Generate Multiple Responses

`POST /generate/multiple`

**Request body:**

```json
{
  "userInput": ["What is JavaScript?", "What is Node.js?", "What is MongoDB?"]
}
```

**Response:**

```json
{
  "responses": ["...", "...", "..."]
}
```

**Flow:** same as above, but for an array of inputs — each one is processed independently and concurrently.

## Concurrency Explanation (`Promise.all`)

Endpoint 2 uses `userInput.map(async (e) => { ... })` combined with `Promise.all()`.

- `.map()` invokes the async callback for every input immediately, without waiting for the previous one to finish — each call starts its own fetch to the Groq API right away.
- Since none of these calls `await` on each other, they run **concurrently** rather than sequentially, which is significantly faster than a `for` loop with `await` inside it.
- `Promise.all()` waits for every promise to resolve and returns their results in an array that preserves the **original input order**, regardless of which request actually finishes first.

This satisfies the requirement to process inputs asynchronously while still returning results in the same order they were received.

## Error Handling

- Missing or empty `userInput` → `400`
- Prompt template not found in DB → `400`
- Groq API failure → `400` (single) — a failure anywhere in the batch causes `Promise.all()` to reject, which is caught and handled centrally
- Unexpected server errors → `500`

## Notes

- The OpenAI API was not used directly; Groq's OpenAI-compatible endpoint was used instead, as explicitly permitted by the case study FAQ ("a mock implementation, a free alternative... or any other approach you prefer").
- The Groq SDK was intentionally avoided in favor of plain `fetch()` calls, to keep the request/response handling fully visible and explainable.
