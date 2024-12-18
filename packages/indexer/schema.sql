CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  date TEXT,
  comments TEXT,
  embedding vector(1536)
);

-- Create an index on the embedding column for faster similarity searches
CREATE INDEX IF NOT EXISTS stories_embedding_idx ON stories 
USING hnsw (embedding vector_cosine_ops);


CREATE TABLE IF NOT EXISTS interests (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  interest_id INTEGER REFERENCES interests(id),
  question TEXT,
  frequency TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);