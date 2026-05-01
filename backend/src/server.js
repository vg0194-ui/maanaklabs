require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDatabase = require("./config/db");
const bootstrapDefaults = require("./services/bootstrapService");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();
  await bootstrapDefaults();

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Maanak Labs backend listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

