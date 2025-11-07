# app/routes/uploads.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import models, database
from uuid import UUID
import os
import shutil

router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = os.path.join("app", "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/prato/{prato_id}")
async def upload_imagem_prato(
    prato_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(database.get_db)
):
    prato = await db.get(models.Prato, prato_id)
    if not prato:
        raise HTTPException(status_code=404, detail="Prato não encontrado")

    filename = f"{prato_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    prato.imagem_url = f"/static/uploads/{filename}"
    await db.commit()
    await db.refresh(prato)

    return {"message": "Imagem salva com sucesso!", "imagem_url": prato.imagem_url}
