import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || "dev-secret-not-for-production-please-change-me";

app.use(express.json());

// ============================================================
// In-memory store (swap for a real DB later)
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

// Full contact data — this is what the Elm detail page expects
let contacts = [
  {
    id: "c_1",
    name: "Ada Lovelace",
    email: "ada@analytical.io",
    company: "Analytical Engines",
    title: "Chief Scientist",
    phone: "+44 20 7946 0958",
    location: "London, UK",
    stage: "Customer",
    lastContact: "2026-09-08",
    owner: "Demo User",
    tags: ["VIP", "Technical", "Q4-target"],
    notes: "Met at Q3 conference. Decision maker for technical purchases. Interested in the enterprise tier with SSO and audit logs.",
    createdAt: "2026-01-15",
  },
  {
    id: "c_2",
    name: "Grace Hopper",
    email: "grace@navy.mil",
    company: "US Navy",
    title: "Rear Admiral",
    phone: "+1 202 555 0142",
    location: "Washington, DC",
    stage: "Customer",
    lastContact: "2026-09-05",
    owner: "Demo User",
    tags: ["VIP", "Government"],
    notes: "Long-time customer. Renewed for 3 years.",
    createdAt: "2025-06-02",
  },
  {
    id: "c_3",
    name: "Alan Turing",
    email: "alan@bletchley.uk",
    company: "Bletchley Park",
    title: "Research Lead",
    phone: "+44 1908 640404",
    location: "Milton Keynes, UK",
    stage: "Qualified",
    lastContact: "2026-09-01",
    owner: "Demo User",
    tags: ["Technical", "Research"],
    notes: "Evaluating our cryptography features. Warm lead.",
    createdAt: "2026-08-12",
  },
  {
    id: "c_4",
    name: "Katherine Johnson",
    email: "kj@nasa.gov",
    company: "NASA",
    title: "Research Mathematician",
    phone: "+1 281 483 0121",
    location: "Houston, TX",
    stage: "Proposal",
    lastContact: "2026-08-28",
    owner: "Demo User",
    tags: ["Aerospace", "Q4-target"],
    notes: "Proposal v2 sent. Waiting on procurement review.",
    createdAt: "2026-07-01",
  },
  {
    id: "c_5",
    name: "Linus Torvalds",
    email: "linus@kernel.org",
    company: "Linux Foundation",
    title: "Principal Engineer",
    phone: "+1 415 555 0198",
    location: "Portland, OR",
    stage: "Lead",
    lastContact: "2026-08-22",
    owner: "Demo User",
    tags: ["Open Source"],
    notes: "Inbound from conference talk. Not yet qualified.",
    createdAt: "2026-08-22",
  },
  {
    id: "c_6",
    name: "Margaret Hamilton",
    email: "mh@mit.edu",
    company: "MIT",
    title: "Professor",
    phone: "+1 617 253 1000",
    location: "Cambridge, MA",
    stage: "Customer",
    lastContact: "2026-09-09",
    owner: "Demo User",
    tags: ["Academic", "VIP"],
    notes: "Champion for the department-wide rollout.",
    createdAt: "2025-11-20",
  },
  {
    id: "c_7",
    name: "Donald Knuth",
    email: "knuth@stanford.edu",
    company: "Stanford",
    title: "Professor Emeritus",
    phone: "+1 650 723 2300",
    location: "Stanford, CA",
    stage: "Qualified",
    lastContact: "2026-08-30",
    owner: "Demo User",
    tags: ["Academic"],
    notes: "",
    createdAt: "2026-08-25",
  },
  {
    id: "c_8",
    name: "Barbara Liskov",
    email: "liskov@mit.edu",
    company: "MIT",
    title: "Institute Professor",
    phone: "+1 617 253 1000",
    location: "Cambridge, MA",
    stage: "Proposal",
    lastContact: "2026-08-25",
    owner: "Demo User",
    tags: ["Academic", "Technical"],
    notes: "Interested in the API integrations story.",
    createdAt: "2026-06-14",
  },
];

// ============================================================
// Helpers
// ============================================================

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

const issueToken = (u) =>
  jwt.sign({ sub: u.id, email: u.email }, SECRET, { expiresIn: "24h" });

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization header" });
  }
  try {
    req.claims = jwt.verify(auth.slice(7), SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

const validateContact = (body, excludeId) => {
  const fields = {};
  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const stage = (body.stage || "").trim();

  if (!name) fields.name = "Name is required";
  else if (name.length > 100) fields.name = "Name must be 100 characters or fewer";

  if (!email) {
    fields.email = "Email is required";
  } else if (!email.includes("@") || !email.includes(".")) {
    fields.email = "Please enter a valid email";
  } else {
    const exists = contacts.some(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.id !== excludeId
    );
    if (exists) fields.email = "A contact with this email already exists";
  }

  if (stage && !["Lead", "Qualified", "Proposal", "Customer"].includes(stage)) {
    fields.stage = "Invalid stage";
  }

  return fields;
};

// ============================================================
// Auth endpoints
// ============================================================

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.get(email);

  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ token: issueToken(user), user: publicUser(user) });
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (users.has(email)) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const user = {
    id: `u_${Date.now()}`,
    name,
    email,
    password: await bcrypt.hash(password, 10),
  };
  users.set(email, user);

  res.json({ token: issueToken(user), user: publicUser(user) });
});

app.get("/api/me", (req, res) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization header" });
  }
  try {
    const claims = jwt.verify(auth.slice(7), SECRET);
    const user = users.get(claims.email);
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// ============================================================
// Contacts endpoints
// ============================================================

app.get("/api/contacts", authMiddleware, (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase().trim();
  const filtered = q
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q)
      )
    : contacts;
  res.json({ contacts: filtered, total: filtered.length });
});

app.get("/api/contacts/:id", authMiddleware, (req, res) => {
  const c = contacts.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Contact not found" });
  res.json({ contact: c });
});

app.post("/api/contacts", authMiddleware, (req, res) => {
  const fields = validateContact(req.body || {}, "");
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "Validation failed", fields });
  }

  const b = req.body || {};
  const newContact = {
    id: `c_${Date.now()}`,
    name: (b.name || "").trim(),
    email: (b.email || "").trim(),
    company: (b.company || "").trim(),
    title: (b.title || "").trim(),
    phone: (b.phone || "").trim(),
    location: (b.location || "").trim(),
    stage: b.stage || "Lead",
    lastContact: new Date().toISOString().slice(0, 10),
    owner: "Demo User",
    tags: Array.isArray(b.tags) ? b.tags : [],
    notes: b.notes || "",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  contacts.push(newContact);
  res.status(201).json({ contact: newContact });
});

app.put("/api/contacts/:id", authMiddleware, (req, res) => {
  const idx = contacts.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Contact not found" });

  const fields = validateContact(req.body || {}, req.params.id);
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "Validation failed", fields });
  }

  const b = req.body || {};
  const updated = {
    ...contacts[idx],
    name: (b.name || "").trim(),
    email: (b.email || "").trim(),
    company: (b.company || "").trim(),
    title: (b.title || "").trim(),
    phone: (b.phone || "").trim(),
    location: (b.location || "").trim(),
    stage: b.stage || "Lead",
    tags: Array.isArray(b.tags) ? b.tags : [],
    notes: b.notes || "",
  };

  contacts[idx] = updated;
  res.json({ contact: updated });
});

app.delete("/api/contacts/:id", authMiddleware, (req, res) => {
  const idx = contacts.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Contact not found" });

  contacts.splice(idx, 1);
  res.json({ deleted: req.params.id });
});

// ============================================================
// Static files — serve the project root (../)
// ============================================================

const root = path.join(__dirname, "..");
app.use(express.static(root));

app.get("/", (req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

// ============================================================
// Start
// ============================================================

await seedUsers();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${root}`);
});
