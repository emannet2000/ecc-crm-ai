import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || "dev-secret-not-for-production-please-change-me";

// ============================================================
// Load compiled Elm
// ============================================================

const { Elm } = require("./backend.js");

const app = Elm.Backend.init();

// ============================================================
// In-memory user store (auth only; contacts live in Elm)
// ============================================================

const users = new Map();

const seedUsers = async () => {
  const hash = await bcrypt.hash("Demo1234", 10);
  users.set("demo@northwind.dev", {
    id: "u_1",
    name: "Demo User",
    email: "demo@northwind.dev",
    password: hash,
  });
  console.log("Seeded demo user: demo@northwind.dev / Demo1234");
};

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

// ============================================================
// HTTP server — forwards every request to Elm
// ============================================================

const expressApp = express();

expressApp.use(express.text({ type: "*/*" }));

expressApp.all("/api/*", (req, res) => {
  const bodyString =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});

  app.ports.request.send({
    responseHandler: res,
    method: req.method,
    path: req.path,
    query: req.url.includes("?") ? req.url.split("?")[1] : "",
    body: bodyString,
    headers: Object.fromEntries(Object.entries(req.headers)),
  });
});

// Static files — serve the project root (one level up)
const root = path.join(__dirname, "..");
expressApp.use(express.static(root));

// Elm sends responses here
app.ports.response.subscribe(({ responseHandler, status, contentType, body }) => {
  responseHandler.writeHead(status, {
    "Content-Type": contentType || "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  responseHandler.end(body);
});

// ============================================================
// Crypto port — bcrypt + JWT handled in Node
// ============================================================

app.ports.cryptoRequest.subscribe(async (msg) => {
  const { id, op } = msg;

  try {
    if (op === "login") {
      const user = users.get(msg.email);
      if (!user || !(await bcrypt.compare(msg.password, user.password))) {
        app.ports.cryptoResponse.send({
          id,
          ok: false,
          error: "Invalid email or password",
        });
        return;
      }
      const token = jwt.sign({ sub: user.id, email: user.email }, SECRET, {
        expiresIn: "24h",
      });
      app.ports.cryptoResponse.send({
        id,
        ok: true,
        token,
        user: publicUser(user),
      });
      return;
    }

    if (op === "register") {
      if (!msg.name || !msg.email || !msg.password) {
        app.ports.cryptoResponse.send({
          id,
          ok: false,
          error: "Name, email, and password are required",
        });
        return;
      }
      if (msg.password.length < 8) {
        app.ports.cryptoResponse.send({
          id,
          ok: false,
          error: "Password must be at least 8 characters",
        });
        return;
      }
      if (users.has(msg.email)) {
        app.ports.cryptoResponse.send({
          id,
          ok: false,
          error: "An account with that email already exists",
        });
        return;
      }
      const user = {
        id: `u_${Date.now()}`,
        name: msg.name,
        email: msg.email,
        password: await bcrypt.hash(msg.password, 10),
      };
      users.set(msg.email, user);
      const token = jwt.sign({ sub: user.id, email: user.email }, SECRET, {
        expiresIn: "24h",
      });
      app.ports.cryptoResponse.send({
        id,
        ok: true,
        token,
        user: publicUser(user),
      });
      return;
    }

    if (op === "verify") {
      try {
        const claims = jwt.verify(msg.token, SECRET);
        const user = users.get(claims.email);
        if (!user) {
          app.ports.cryptoResponse.send({ id, ok: false, error: "User not found" });
          return;
        }
        app.ports.cryptoResponse.send({
          id,
          ok: true,
          user: publicUser(user),
        });
      } catch {
        app.ports.cryptoResponse.send({
          id,
          ok: false,
          error: "Invalid or expired token",
        });
      }
      return;
    }

    app.ports.cryptoResponse.send({ id, ok: false, error: "Unknown op" });
  } catch (err) {
    app.ports.cryptoResponse.send({ id, ok: false, error: String(err) });
  }
});

// ============================================================
// Start
// ============================================================

await seedUsers();

expressApp.listen(PORT, () => {
  console.log(`Elm backend listening on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${root}`);
});
