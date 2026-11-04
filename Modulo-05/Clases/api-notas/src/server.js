'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;
// En Docker, DATA_DIR apunta a /app/data (ahí se monta el volumen).
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- Persistencia (archivo JSON) ----------
function readNotes() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function writeNotes(notes) {
  // Escritura atómica: se escribe a un temporal y luego se renombra,
  // así un corte a mitad de escritura no deja el JSON corrupto.
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(notes, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

// ---------- API ----------
const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'api-notas',
    endpoints: [
      'GET /health',
      'GET /notes',
      'GET /notes/:id',
      'POST /notes  { "title"?: string, "content": string }',
      'DELETE /notes/:id',
    ],
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/notes', (_req, res) => {
  res.json(readNotes());
});

app.get('/notes/:id', (req, res) => {
  const note = readNotes().find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Nota no encontrada' });
  res.json(note);
});

app.post('/notes', (req, res) => {
  const { title = '', content } = req.body ?? {};

  if (typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'El campo "content" es obligatorio' });
  }
  if (content.length > 2000) {
    return res.status(400).json({ error: '"content" no puede superar 2000 caracteres' });
  }
  if (typeof title !== 'string' || title.length > 100) {
    return res.status(400).json({ error: '"title" debe ser texto de hasta 100 caracteres' });
  }

  const note = {
    id: crypto.randomUUID(),
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  const notes = readNotes();
  notes.push(note);
  writeNotes(notes);

  res.status(201).json(note);
});

app.delete('/notes/:id', (req, res) => {
  const notes = readNotes();
  const remaining = notes.filter((n) => n.id !== req.params.id);
  if (remaining.length === notes.length) {
    return res.status(404).json({ error: 'Nota no encontrada' });
  }
  writeNotes(remaining);
  res.status(204).end();
});

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// JSON inválido en el body llega aquí con status 400.
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Error interno' : err.message });
});

const server = app.listen(PORT, () => {
  console.log(`api-notas escuchando en el puerto ${PORT} | datos en ${DATA_FILE}`);
});

// `docker stop` envía SIGTERM: cerramos ordenadamente en vez de esperar el kill.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`${signal} recibido, cerrando...`);
    server.close(() => process.exit(0));
  });
}
