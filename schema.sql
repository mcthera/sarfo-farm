-- Run in pgAdmin: Query Tool on your database (e.g. sarfo_farm)
CREATE TABLE IF NOT EXISTS animals (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  category    VARCHAR(40)  NOT NULL,   -- Dog, Cattle, Rabbit, Pig, Turkey
  breed       VARCHAR(120),
  price       NUMERIC(10,2),
  description TEXT,
  image       VARCHAR(255),
  available   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS inquiries (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  phone      VARCHAR(40)  NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
