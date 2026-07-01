from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from database.models import Module
from schemas.schemas import ModuleOut

router = APIRouter(prefix="/modules", tags=["modules"])


@router.get("", response_model=List[ModuleOut])
def get_modules(db: Session = Depends(get_db)):
    return db.query(Module).order_by(Module.order).all()


@router.get("/{module_id}", response_model=ModuleOut)
def get_module(module_id: int, db: Session = Depends(get_db)):
    return db.query(Module).filter(Module.id == module_id).first()
