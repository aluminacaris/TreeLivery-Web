# type: ignore
from fastapi import HTTPException
from sqlalchemy import select
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from . import models, schemas
from uuid import UUID
from .auth import gerar_hash

async def get_restaurants(db: AsyncSession, limit: int = 50):
    q = await db.execute(select(models.Restaurante).where(models.Restaurante.ativo==True).limit(limit))
    return q.scalars().all() #executa e retorna resultados 

async def get_restaurant(db: AsyncSession, restaurante_id: UUID):
    q = await db.execute(select(models.Restaurante).where(models.Restaurante.restaurante_id==restaurante_id))
    return q.scalar_one_or_none() #retorna 1 ou nenhum resultado

async def get_restaurant_by_email(db: AsyncSession, email: str):
    q = await db.execute(select(models.Restaurante).where(models.Restaurante.email == email))
    return q.scalar_one_or_none()

async def create_restaurant(db: AsyncSession, payload: schemas.RestauranteCreate):
    # Verifica se o email já existe
    existing_rest = await get_restaurant_by_email(db, payload.email)
    if existing_rest:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    restaurante = models.Restaurante(
        nome_fantasia=payload.nome_fantasia,
        razao_social=payload.razao_social,
        email=payload.email,
        senha_hash=gerar_hash(payload.senha),
        descricao=payload.descricao,
        telefone=payload.telefone,
        tempo_medio_entrega=payload.tempo_medio_entrega,
        taxa_entrega_base=payload.taxa_entrega_base,
        endereco=payload.endereco.dict(),
        ativo=True,
    )

    db.add(restaurante)
    await db.commit()
    await db.refresh(restaurante)
    return restaurante

async def get_menu(db: AsyncSession, restaurante_id: UUID): #mostra os pratos disponiveis de um restaurante
    q = await db.execute(select(models.Prato).where(models.Prato.restaurante_id==restaurante_id, models.Prato.disponivel==True))
    return q.scalars().all() #mostra todos os pratos disponiveis

async def get_prato(db: AsyncSession, prato_id: UUID): #mostra só um prato pelo id
    q = await db.execute(select(models.Prato).where(models.Prato.prato_id==prato_id))
    return q.scalar_one_or_none()

async def create_prato(db: AsyncSession, restaurante_id: UUID, payload: schemas.PratoCreate):
    from . import models  # evitar import circular
    prato = models.Prato(
        restaurante_id=restaurante_id,
        nome=payload.nome,
        descricao=payload.descricao,
        preco=payload.preco,
        categoria=payload.categoria,
        disponivel=True
    )
    db.add(prato)
    await db.commit()       # 💡 importante: salva no banco
    await db.refresh(prato) # atualiza com dados do banco (ex: prato_id)
    return prato

async def create_pedido(db: AsyncSession, pedido_data: schemas.PedidoCreate):
    from . import models
    
    total = 0
    # calcula o total
    pedido = models.Pedido(
        restaurante_id=pedido_data.restaurante_id,
        total=0  # atualizamos depois
    )    
    db.add(pedido)
    await db.flush() #pra gerar o pedido_id, flush manda pro banco mas n da o commit, entao ele ja gera um ID
    # diferença do flush pro commit é q da pra dar rollback, no commit nao, ele confirma definitivamente as operações
    
    for item in pedido_data.itens:
        result = await db.execute(sa.select(models.Prato).where(models.Prato.prato_id==item.prato_id))
        prato = result.scalar_one_or_none()
        
        if not prato:
            raise Exception(f"Prato {item.prato_id} não encontrado")
        
        preco = float(prato.preco)
        total += preco * item.quantidade
        
        novo_item = models.ItemPedido(
            pedido_id=pedido.pedido_id,
            prato_id=item.prato_id,
            quantidade=item.quantidade,
            preco_unitario=preco #puxa automatico
        )
        db.add(novo_item)
        await db.flush()
    
    pedido.total = total
    await db.flush()
    await db.commit()
    
    result = await db.execute(
    sa.select(models.Pedido)
    .options(selectinload(models.Pedido.itens))
    .where(models.Pedido.pedido_id == pedido.pedido_id)
)
    pedido_com_itens = result.scalar_one()

    return pedido_com_itens

async def criar_usuario(db: AsyncSession, usuario: schemas.UsuarioCreate):
        # Verifica se já existe o email
    result = await db.execute(sa.select(models.Usuario).where(models.Usuario.email == usuario.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    novo_usuario = models.Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha_hash=gerar_hash(usuario.senha),
        tipo_dieta=usuario.tipo_dieta,
        restricoes=usuario.restricoes,
        seletividade=usuario.seletividade
    )
    
    db.add(novo_usuario)
    
    await db.commit()
    await db.refresh(novo_usuario)
    return novo_usuario