# Com.chess
This is a full-stack chess application built with the MERN stack (MongoDB, Express, React, Node), Socket.io, Passport.js, and Stockfish.

## Features
- User authentication
- Online chess against other users using Socket.IO
- Games against Stockfish bots
- Engine analysis using Stockfish
- Friend system

## Setup

### Installation
1. Clone the repository
2. Add dependencies to backend:
  ```bash
  cd backend
  npm i
  ```
3. Add dependencies to frontend:
  ```bash
  cd frontend
  npm i
  ```

### Environment Variables
Create a .env file in the backend and frontend and add each of the following variables with their respective values:
#### Frontend Variables
- VITE_BACKEND_URL: the base url of your backend server
#### Backend Variables
- DB_URI: the uri of your mongodb cluster
- BACKEND_URL: the base url of your backend server
- SESSION_SECRET: any secure hexidecimal key used for express session storage
- GOOGLE_CLIENT_ID: client id for Google Passport authentication [Learn More](https://www.passportjs.org/tutorials/google/register/)
- GOOGLE_CLIENT_SECRET: clicent secret for Google Passport authentication [Learn More](https://www.passportjs.org/tutorials/google/register/)
- CLIENT_URL: the base url of your frontend server

### Running the servers
1. Start the backend:
  ```bash
  cd backend
  npm run dev
  ```
2. Start the frontend:
  ```bash
  cd frontend
  npm run dev
  ```
