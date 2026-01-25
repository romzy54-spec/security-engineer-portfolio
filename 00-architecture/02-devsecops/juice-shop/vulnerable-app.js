const express = require('express');
const app = express();

// ❌ Hardcoded secret (intentional vulnerability)
// ✅ Added error handling for environment variable with clear fallback
const API_KEY = process.env.API_KEY || "sk_test_123456789";
if (!process.env.API_KEY) {
  console.warn("WARNING: API_KEY not found in environment variables. Using hardcoded fallback (insecure for production).");
}

// Middleware to parse JSON bodies
app.use(express.json());

// ❌ SQL Injection vulnerability
// ✅ Added error handling and input validation
app.get('/user', (req, res) => {
  try {
    const userId = req.query.id;

    // ✅ Validate input exists
    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing required parameter 'id'",
        example: "/user?id=1"
      });
    }

    // ✅ Validate input is not empty
    if (userId.trim() === '') {
      return res.status(400).json({
        error: "Bad Request",
        message: "Parameter 'id' cannot be empty"
      });
    }

    // ⚠️ Still vulnerable to SQL injection (intentional)
    const query = "SELECT * FROM users WHERE id = '" + userId + "'";
    res.send(query);
  } catch (error) {
    console.error("Error in /user route:", error.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred while processing your request",
      details: error.message
    });
  }
});

// ❌ Command injection vulnerability
// ✅ Added error handling for command execution
app.get('/ping', (req, res) => {
  try {
    const host = req.query.host;

    // ✅ Validate input exists
    if (!host) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing required parameter 'host'",
        example: "/ping?host=example.com"
      });
    }

    // ✅ Validate input is not empty
    if (host.trim() === '') {
      return res.status(400).json({
        error: "Bad Request",
        message: "Parameter 'host' cannot be empty"
      });
    }

    // ⚠️ Still vulnerable to command injection (intentional)
    // ✅ Added error handling for command execution
    require('child_process').exec("ping " + host, (error, stdout, stderr) => {
      if (error) {
        console.error("Command execution error:", error.message);
        return res.status(500).json({
          error: "Command Execution Failed",
          message: "Failed to execute ping command",
          details: error.message
        });
      }

      if (stderr) {
        console.warn("Command stderr:", stderr);
      }

      res.json({
        message: "Ping sent successfully",
        output: stdout
      });
    });
  } catch (error) {
    console.error("Error in /ping route:", error.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred while processing ping request",
      details: error.message
    });
  }
});

// ✅ Added health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ Added global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Added 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: ["/user?id=<id>", "/ping?host=<host>", "/health"]
  });
});

// ✅ Added server startup error handling
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use. Please free the port or use a different one.`);
  } else if (error.code === 'EACCES') {
    console.error(`ERROR: Permission denied to bind to port ${PORT}. Try using a port above 1024.`);
  } else {
    console.error(`ERROR: Failed to start server: ${error.message}`);
  }
  process.exit(1);
});

// ✅ Added graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed. Process terminating.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed. Process terminating.');
    process.exit(0);
  });
});
