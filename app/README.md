# SQL Query Web App

A simple web application that executes your SQL Server query and displays results in a browser.

## Files Created

- **server.js** - Node.js/Express server that handles the SQL query execution
- **package.json** - Dependencies (express, mssql, cors)
- **public/index.html** - Web UI with button to fetch and display data
- **Dockerfile** - Docker configuration to containerize the app

## Local Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the server:
   ```
   npm start
   ```
   or
   ```
   node server.js
   ```

3. Open browser to `http://localhost:3000`

4. Click the "Execute Query" button to run the SQL query and see results

## Docker Setup

### Build the image:
```
docker build -t sql-query-app:1.0 .
```

### Run the container:
```
docker run -p 3000:3000 sql-query-app:1.0
```

Then open `http://localhost:3000` in your browser.

## How it works

- **Frontend** (public/index.html): Beautiful UI with a button to trigger the query
- **Backend** (server.js): 
  - Connects to your SQL Server at `10.100.102.94:1433`
  - Executes `SELECT TOP 5 * FROM amitai`
  - Returns JSON data to the frontend
  - Displays results in a formatted HTML table

## Features

- Simple, clean UI
- Error handling with user-friendly messages
- Loading spinner during query execution
- Automatically formats table with column headers
- Responsive design
