import os, uuid
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import anthropic
from database import engine, get_db, Base
from models import User, Career, CustomConnection

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Skill-Swap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Seed default careers on startup ──────────────────────────────────────────
DEFAULT_CAREERS = [
    {"slug": "ux-designer",      "label": "UX Designer",       "color": "#7C6FFB", "skills": {"User Research": 0.9, "Wireframing": 0.85, "Figma": 0.8, "Prototyping": 0.75, "CSS": 0.5, "Psychology": 0.6}},
    {"slug": "data-scientist",   "label": "Data Scientist",     "color": "#00C9A7", "skills": {"Python": 0.95, "Statistics": 0.9, "Machine Learning": 0.85, "SQL": 0.75, "Data Visualization": 0.7, "R": 0.6}},
    {"slug": "product-manager",  "label": "Product Manager",    "color": "#F7B731", "skills": {"User Research": 0.8, "Roadmapping": 0.85, "Stakeholder Mgmt": 0.9, "Agile": 0.7, "Data Analysis": 0.65, "Communication": 0.8}},
    {"slug": "gen-artist",       "label": "Generative Artist",  "color": "#FC5185", "skills": {"Python": 0.8, "Creative Coding": 0.9, "Sketching": 0.7, "Color Theory": 0.75, "Math": 0.6, "Three.js": 0.65}},
    {"slug": "ml-engineer",      "label": "ML Engineer",        "color": "#3DC6F4", "skills": {"Python": 0.95, "Machine Learning": 0.95, "PyTorch": 0.85, "Math": 0.8, "SQL": 0.6, "Docker": 0.65}},
    {"slug": "frontend-dev",     "label": "Frontend Developer", "color": "#FF9A3C", "skills": {"JavaScript": 0.95, "CSS": 0.9, "React": 0.85, "HTML": 0.8, "TypeScript": 0.7, "Testing": 0.6}},
    {"slug": "graphic-designer", "label": "Graphic Designer",   "color": "#A55EEA", "skills": {"Figma": 0.9, "Color Theory": 0.9, "Typography": 0.85, "Sketching": 0.8, "Photoshop": 0.85, "Illustrator": 0.8}},
    {"slug": "devops-engineer",  "label": "DevOps Engineer",    "color": "#26DE81", "skills": {"Docker": 0.9, "Kubernetes": 0.85, "Linux": 0.8, "CI/CD": 0.85, "Python": 0.6, "Cloud": 0.8}},
]

@app.on_event("startup")
def seed_careers():
    db = next(get_db())
    for c in DEFAULT_CAREERS:
        if not db.query(Career).filter(Career.slug == c["slug"]).first():
            db.add(Career(**c))
    db.commit()

# ── Schemas ───────────────────────────────────────────────────────────────────
class UserProfile(BaseModel):
    session_id: str
    skills: List[str]

class ConnectionAdd(BaseModel):
    session_id: str
    skill: str
    career_slug: str
    impact: float

class RoadmapRequest(BaseModel):
    career_label: str
    user_skills: List[str]
    gaps: List[str]
    score: int

# ── GNN Algorithm ─────────────────────────────────────────────────────────────
def compute_readiness(user_skills: list, career_skills: dict) -> int:
    total = sum(career_skills.values())
    if total == 0:
        return 0
    matched = sum(w for s, w in career_skills.items() if s in user_skills)
    return round((matched / total) * 100)

def compute_gaps(user_skills: list, career_skills: dict) -> list:
    return sorted(
        [{"skill": s, "impact": round(w * 100)} for s, w in career_skills.items() if s not in user_skills],
        key=lambda x: -x["impact"]
    )

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Skill-Swap API running"}

@app.get("/careers")
def get_careers(db: Session = Depends(get_db)):
    return db.query(Career).all()

@app.post("/profile")
def save_profile(profile: UserProfile, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.session_id == profile.session_id).first()
    if user:
        user.skills = profile.skills
    else:
        user = User(session_id=profile.session_id, skills=profile.skills)
        db.add(user)
    db.commit()
    return {"saved": True}

@app.get("/profile/{session_id}")
def get_profile(session_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.session_id == session_id).first()
    if not user:
        new_id = session_id
        user = User(session_id=new_id, skills=[])
        db.add(user)
        db.commit()
    return {"session_id": user.session_id, "skills": user.skills}

@app.get("/readiness/{session_id}")
def get_readiness(session_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.session_id == session_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    careers = db.query(Career).all()
    custom = db.query(CustomConnection).filter(CustomConnection.user_id == user.id).all()

    # Merge custom connections into careers
    career_list = []
    for c in careers:
        skills = dict(c.skills)
        for conn in custom:
            if conn.career_slug == c.slug:
                skills[conn.skill] = conn.impact
        score = compute_readiness(user.skills, skills)
        gaps = compute_gaps(user.skills, skills)
        career_list.append({
            "slug": c.slug, "label": c.label, "color": c.color,
            "skills": skills, "score": score, "gaps": gaps
        })

    return sorted(career_list, key=lambda x: -x["score"])

@app.post("/connection")
def add_connection(conn: ConnectionAdd, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.session_id == conn.session_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    db.add(CustomConnection(user_id=user.id, skill=conn.skill, career_slug=conn.career_slug, impact=conn.impact))
    db.commit()
    return {"added": True}

@app.post("/roadmap")
async def get_roadmap(req: RoadmapRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {"roadmap": "Add your ANTHROPIC_API_KEY to get AI coaching."}
    client = anthropic.Anthropic(api_key=api_key)
    msg = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content":
            f"I want to become a {req.career_label}. I have: {', '.join(req.user_skills)}. "
            f"Readiness: {req.score}%. Top gaps: {', '.join(req.gaps[:3])}. "
            f"Give me a concise 3-step learning roadmap (max 100 words). Plain text only."
        }]
    )
    return {"roadmap": msg.content[0].text}