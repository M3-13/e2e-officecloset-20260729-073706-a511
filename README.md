# Glamour Closet

Eine Web-Anwendung im eleganten Hollywood-/Red-Carpet-Stil zum Verwalten einer persönlichen Kleidergarderobe und Erstellen von Outfits.

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite
- **Auth**: Session-basiert mit bcrypt-gehashten Passwörtern
- **Storage**: Lokaler Datei-Speicher für Bild-Uploads
- **Frontend**: Vite + React, react-router-dom

## Projektstruktur

```
├── backend/
│   ├── main.py              # FastAPI-App, Router-Bindung, CORS, Session-Middleware
│   ├── database.py          # SQLAlchemy-Engine, SessionLocal, get_db, init_db
│   ├── models.py            # ORM-Modelle (User, ClothingItem, Outfit)
│   ├── schemas.py           # Pydantic-Schemas (Requests/Responses)
│   ├── auth.py              # Passwort-Hashing, Session-Tokens, get_current_user
│   ├── storage.py           # Datei-Upload-Validierung und -Speicherung
│   ├── routers/             # Router-Stubs für Feature-Tickets
│   │   ├── auth_router.py
│   │   ├── clothing_router.py
│   │   ├── outfit_router.py
│   │   └── image_router.py
│   ├── tests/               # Tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── main.jsx         # React-Einstieg
│   │   ├── App.jsx          # App-Shell mit Routing
│   │   ├── api/client.js    # Fetch-Wrapper mit credentials: 'include'
│   │   └── views/           # View-Platzhalter
│   ├── package.json
│   ├── vite.config.js       # Vite-Konfiguration mit API-Proxy
│   └── index.html
├── RUN.json                 # Start-Konfiguration für Tessa
└── README.md
```

## Installation und Start

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

Der Server startet auf http://localhost:8000. Die Health-Route ist unter `GET /api/health` erreichbar.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Das Frontend startet auf http://localhost:5173 und proxied API-Anfragen an `/api` an das Backend.

## Umgebungsvariablen

| Variable | Default | Beschreibung |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./dev.db` | SQLAlchemy-Datenbank-URL |
| `UPLOAD_DIR` | `./uploads` | Verzeichnis für hochgeladene Bilder |
| `SESSION_SECRET` | (generiert) | Geheimer Schlüssel für Session-Cookies |

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/health` | Health-Check (Returns `{"status": "ok"}`) |

Weitere Endpunkte werden in nachfolgenden Sprints implementiert:
- `POST /auth/register` – Registrierung
- `POST /auth/login` – Login
- `POST /auth/logout` – Logout
- `GET/POST /api/clothing` – Kleidungsstücke auflisten/anlegen
- `PUT/DELETE /api/clothing/{id}` – Kleidungsstück bearbeiten/löschen
- `GET/POST /api/outfits` – Outfits auflisten/anlegen
- `GET/DELETE /api/outfits/{id}` – Outfit-Detail/löschen
- `POST /api/images/upload` – Bild hochladen
- `GET /api/images/{filename}` – Bild abrufen

## Features

- **Red-Carpet-Design**: Elegantes, dunkles UI mit Champagner-Gold-Akzenten
- **Session-basierte Authentifizierung**: HttpOnly/Secure/SameSite-Cookies
- **Benutzer-Isolation**: Jeder Nutzer sieht nur seine eigenen Kleidungsstücke und Outfits
- **Sicherheit**: bcrypt-Passwort-Hashing, serverseitige Datei-Validierung, IDOR-Schutz
