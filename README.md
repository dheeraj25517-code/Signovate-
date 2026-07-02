# Signovate

> A gamified web platform for learning Indian Sign Language (ISL) — built for teachers, parents, and anyone who wants to bridge the communication gap with the deaf community.

---

## What is Signovate?

India has an estimated 63 million people who are deaf or hard of hearing, yet fewer than 2% know sign language and certified interpreters are extremely scarce. The people around deaf individuals — parents, teachers, frontline workers — were never taught the language needed to communicate with them.

Signovate fixes that. It's a Duolingo-style web app that teaches Indian Sign Language through short video lessons, quizzes, streaks, and progress tracking — free, no login required, works on any device.

Sign demonstrations are sourced from the Government of India's official **ISLRTC dictionary**, explicitly licensed for teaching and ISL-related technology development.

---

## Features

- **Video lessons** — watch each sign demonstrated, loop and replay as needed
- **Multiple choice quizzes** — test yourself after every group of signs
- **Retry system** — signs you get wrong come back until you answer correctly twice
- **Progress tracking** — per-module completion, signs learned, modules finished
- **Streak calendar** — daily learning streaks with a visual calendar
- **Diamonds & trophies** — earned through quiz performance
- **Gamified chapters** — structured learning path across chapters and modules
- **Responsive design** — works on desktop and mobile browsers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| Database | SQLite via SQLAlchemy |
| Video Serving | FastAPI streaming endpoint |
| Content | ISLRTC Government ISL Dictionary |

---

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Git

### 1. Clone the repository

```bash
git clone https://github.com/dheeraj25517-code/Signovate-.git
cd Signovate-
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
```

**Activate the virtual environment:**

Windows:
```bash
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

Mac/Linux:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Add video assets

Video files are not included in this repository due to file size. You will need to:

- Download ISL sign videos from the [official ISLRTC dictionary](https://islrtc.nic.in/) or their [YouTube channel](https://www.youtube.com/@ISLRTC)
- Place them in `frontend/assets/greetings/` and `frontend/assets/emergency/`
- File naming follows the pattern: `Hello.mp4`, `Thank_You.mp4`, etc.

### 4. Seed the database

```bash
.\venv\Scripts\python.exe -m database.seed
```

### 5. Run the backend server

```bash
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```

The app will be available at **http://localhost:8000**

> Keep this terminal open while using the app — closing it stops the server.

---

## Project Structure

```
Signovate-/
├── frontend/
│   ├── index.html          # Home page
│   ├── chapters.html       # Chapter selection
│   ├── modules.html        # Module list per chapter
│   ├── lesson.html         # Video lesson screen
│   ├── quiz.html           # Quiz screen
│   ├── completion.html     # Module completion screen
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js          # All backend fetch calls
│   │   ├── data.js         # Module data + backend loader
│   │   ├── lesson.js       # Lesson screen logic
│   │   ├── quiz.js         # Quiz logic + retry system
│   │   ├── streak.js       # Streak calendar
│   │   ├── stats.js        # Diamonds + trophies
│   │   ├── modules.js      # Module card rendering
│   │   ├── completion.js   # Completion screen
│   │   └── menu.js         # Hamburger menu
│   └── assets/
│       ├── greetings/      # Greetings module videos
│       └── emergency/      # Emergency module videos
└── backend/
    ├── main.py             # FastAPI app + video streaming
    ├── requirements.txt
    ├── database/
    │   ├── db.py
    │   ├── models.py
    │   └── seed.py
    ├── routers/
    │   ├── modules.py
    │   ├── lessons.py
    │   ├── quiz.py
    │   ├── progress.py
    │   └── streak.py
    └── schemas/
        └── schemas.py
```

---

## Content Source

All sign language videos are sourced from the **Indian Sign Language Research and Training Centre (ISLRTC)**, Government of India. ISLRTC's dictionary is explicitly licensed for teaching and ISL-related technology development.

- Website: https://islrtc.nic.in/
- YouTube: https://www.youtube.com/@ISLRTC

---


## Team

Built by sDheeraj Kumar Thota & Srivaishnavi Paramatmuni