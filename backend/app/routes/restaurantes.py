# type: ignore
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas, crud, models, auth_restaurante, database
from ..database import get_db
from uuid import UUID
from typing import Optional
import sqlalchemy as sa
from datetime import datetime
import os
import shutil


router = APIRouter(prefix="/restaurantes", tags=["restaurantes"]) #todas as rotas começam com restaurantes
#tags ajudam na organização da documentação automática (Swagger UI) 

UPLOAD_DIR = os.path.join("app", "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 🟢 Rota para pegar restaurante logado
@router.get("/me", response_model=schemas.RestauranteOut)
async def get_me(current_restaurante: models.Restaurante = Depends(auth_restaurante.get_current_restaurante)):
    return current_restaurante

@router.get("/", response_model=list[schemas.RestauranteOut]) 
async def list_restaurantes(db: AsyncSession = Depends(get_db)):
    rests = await crud.get_restaurants(db)
    return rests

#adicionar essa porra no crud depois #adicionei
@router.post("/registro", response_model=schemas.RestauranteOut)
async def registrar_restaurante(
    nome_fantasia: str = Form(...),
    razao_social: str = Form(...),
    email: str = Form(...),
    senha: str = Form(...),
    descricao: Optional[str] = Form(None),
    telefone: Optional[str] = Form(None),
    tempo_medio_entrega: Optional[int] = Form(None),
    taxa_entrega_base: Optional[float] = Form(None),
    cep: str = Form(...),
    logradouro: str = Form(...),
    numero: str = Form(...),
    bairro: str = Form(...),
    cidade: str = Form(...),
    estado: str = Form(...),
    complemento: Optional[str] = Form(None),
    foto_perfil: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Cria o objeto de endereço
        endereco = schemas.Endereco(
            cep=cep,
            logradouro=logradouro,
            numero=numero,
            bairro=bairro,
            cidade=cidade,
            estado=estado,
            complemento=complemento
        )
        
        # Converte tipos numéricos (trata strings vazias)
        tempo_entrega = int(tempo_medio_entrega) if tempo_medio_entrega and str(tempo_medio_entrega).strip() else None
        taxa = float(taxa_entrega_base) if taxa_entrega_base and str(taxa_entrega_base).strip() else None
        
        # Cria o payload do restaurante
        payload = schemas.RestauranteCreate(
            nome_fantasia=nome_fantasia,
            razao_social=razao_social,
            email=email,
            senha=senha,
            descricao=descricao,
            telefone=telefone,
            tempo_medio_entrega=tempo_entrega,
            taxa_entrega_base=taxa,
            endereco=endereco,
            foto_perfil=None
        )
        
        # Cria o restaurante primeiro
        rest = await crud.create_restaurant(db, payload)
        
        # Se houver foto, faz o upload
        if foto_perfil:
            filename = f"{rest.restaurante_id}_{foto_perfil.filename}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(foto_perfil.file, buffer)
            
            rest.foto_perfil = f"/static/uploads/{filename}"
            await db.commit()
            await db.refresh(rest)
        
        return rest
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 🟢 Novo: Login do restaurante
@router.post("/login", response_model=schemas.Token)
async def login_restaurante(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    restaurante = await crud.get_restaurant_by_email(db, form_data.username)
    if not restaurante or not auth_restaurante.verificar_senha(form_data.password, restaurante.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    access_token = auth_restaurante.criar_token({"sub": restaurante.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/{restaurante_id}", response_model=schemas.RestauranteOut)
async def get_restaurante(restaurante_id: UUID, db: AsyncSession = Depends(get_db)):
    rest = await crud.get_restaurant(db, restaurante_id) #busca no banco
    if not rest: #verifica se existe
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")
    return rest #retorna, converte automaticamente para o schema RestauranteOut

@router.get("/{restaurante_id}/menu", response_model=list[schemas.PratoOut])
async def menu(restaurante_id: UUID, db: AsyncSession = Depends(get_db)):
    return await crud.get_menu(db, restaurante_id)

@router.post("/{restaurante_id}/menu", response_model=schemas.PratoOut)
async def criar_prato(restaurante_id: UUID, payload: schemas.PratoCreate, db: AsyncSession = Depends(get_db)):
    rest = await crud.get_restaurant(db, restaurante_id)
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")
    return await crud.create_prato(db, restaurante_id, payload)

@router.put("/menu/{prato_id}", response_model=schemas.PratoOut)
async def atualizar_prato(prato_id: UUID, payload: schemas.PratoCreate, db: AsyncSession = Depends(get_db)):
    prato = await crud.update_prato(db, prato_id, payload)
    if not prato:
        raise HTTPException(status_code=404, detail="Prato não encontrado")
    return prato

@router.delete("/menu/{prato_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_prato(prato_id: UUID, db: AsyncSession = Depends(get_db)):
    sucesso = await crud.delete_prato(db, prato_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Prato não encontrado")
    return {"ok": True}

# Rota para atualizar foto de perfil do restaurante
@router.put("/foto-perfil", response_model=schemas.RestauranteOut)
async def atualizar_foto_perfil(
    foto_perfil: UploadFile = File(...),
    current_restaurante: models.Restaurante = Depends(auth_restaurante.get_current_restaurante),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Remove foto antiga se existir
        if current_restaurante.foto_perfil:
            foto_antiga_path = os.path.join("app", current_restaurante.foto_perfil.lstrip("/"))
            if os.path.exists(foto_antiga_path):
                try:
                    os.remove(foto_antiga_path)
                except Exception:
                    pass  # Ignora erro se não conseguir remover
        
        # Salva nova foto
        filename = f"{current_restaurante.restaurante_id}_{foto_perfil.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(foto_perfil.file, buffer)
        
        current_restaurante.foto_perfil = f"/static/uploads/{filename}"
        await db.commit()
        await db.refresh(current_restaurante)
        
        return current_restaurante
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar foto: {str(e)}")


# @router.post("/upload-imagem")
# async def upload_imagem(file: UploadFile = File(...)):
#     try:
#         os.makedirs(UPLOAD_DIR, exist_ok=True)
#         file_path = os.path.join(UPLOAD_DIR, file.filename)
        
#         with open(file_path, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         return {"url": f"http://localhost:8000/static/uploads/{file.filename}"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erro ao salvar imagem: {e}")