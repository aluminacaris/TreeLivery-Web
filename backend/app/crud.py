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
        restricoes=payload.restricoes,
        disponivel=True
    )
    db.add(prato)
    await db.commit()       # 💡 importante: salva no banco
    await db.refresh(prato) # atualiza com dados do banco (ex: prato_id)
    return prato

async def update_prato(db: AsyncSession, prato_id: UUID, dados: schemas.PratoCreate):
    result = await db.execute(select(models.Prato).where(models.Prato.prato_id == prato_id))
    prato = result.scalar_one_or_none()

    if not prato:
        return None

    prato.nome = dados.nome
    prato.descricao = dados.descricao
    prato.preco = dados.preco
    prato.restricoes = dados.restricoes
    await db.commit()
    await db.refresh(prato)
    return prato

async def delete_prato(db: AsyncSession, prato_id: UUID):
    result = await db.execute(select(models.Prato).where(models.Prato.prato_id == prato_id))
    prato = result.scalar_one_or_none()

    if not prato:
        return False

    await db.delete(prato)
    await db.commit()
    return True

async def create_pedido(db: AsyncSession, pedido_data: schemas.PedidoCreate, usuario_id: UUID):
    from . import models
    
    total = 0
    # calcula o total
    pedido = models.Pedido(
        restaurante_id=pedido_data.restaurante_id,
        usuario_id=usuario_id,  # Associa o pedido ao usuário logado
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
        nome_prato = str(prato.nome)
        total += preco * item.quantidade
        
        novo_item = models.ItemPedido(
            pedido_id=pedido.pedido_id,
            prato_id=item.prato_id,
            nome_prato=nome_prato,
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

async def get_pedidos_restaurante(db: AsyncSession, restaurante_id: UUID):
    from .models import Pedido

    result = await db.execute(
        sa.select(Pedido)
        .options(selectinload(Pedido.itens))
        .where(Pedido.restaurante_id == restaurante_id)
        .order_by(Pedido.data_pedido.desc())
    )
    return result.scalars().all()

async def update_pedido_status(db: AsyncSession, pedido_id: UUID, novo_status: str, restaurante_id: UUID):
    from .models import Pedido

    # Validação de status válidos
    status_validos = ["Recebido", "Em preparo", "Saiu para entrega", "Entregue", "Cancelado"]
    if novo_status not in status_validos:
        raise HTTPException(
            status_code=400, 
            detail=f"Status inválido. Status válidos: {', '.join(status_validos)}"
        )

    pedido = await db.get(Pedido, pedido_id)

    if not pedido:
        return None

    # Valida que o restaurante só pode atualizar seus próprios pedidos
    if pedido.restaurante_id != restaurante_id:
        return None

    pedido.status = novo_status
    await db.commit()
    await db.refresh(pedido)
    return pedido

async def get_pedidos_usuario(db: AsyncSession, usuario_id: UUID):
    from .models import Pedido

    result = await db.execute(
        sa.select(Pedido)
        .options(selectinload(Pedido.itens))
        .where(Pedido.usuario_id == usuario_id)
        .order_by(Pedido.data_pedido.desc())
    )
    return result.scalars().all()

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

# ========== AVALIAÇÕES ==========

async def criar_avaliacao(db: AsyncSession, avaliacao_data: schemas.AvaliacaoCreate, usuario_id: UUID):
    from .models import Avaliacao, Pedido
    
    # Valida nota (1 a 5)
    if avaliacao_data.nota < 1 or avaliacao_data.nota > 5:
        raise HTTPException(status_code=400, detail="A nota deve estar entre 1 e 5")
    
    # Verifica se o pedido existe e pertence ao usuário
    pedido = await db.get(Pedido, avaliacao_data.pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.usuario_id != usuario_id:
        raise HTTPException(status_code=403, detail="Você só pode avaliar seus próprios pedidos")
    
    # Verifica se já existe avaliação para este pedido
    result = await db.execute(
        sa.select(Avaliacao).where(
            Avaliacao.pedido_id == avaliacao_data.pedido_id,
            Avaliacao.usuario_id == usuario_id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Este pedido já foi avaliado")
    
    # Cria a avaliação
    avaliacao = Avaliacao(
        pedido_id=avaliacao_data.pedido_id,
        restaurante_id=pedido.restaurante_id,
        usuario_id=usuario_id,
        nota=avaliacao_data.nota,
        comentario=avaliacao_data.comentario
    )
    
    db.add(avaliacao)
    await db.commit()
    await db.refresh(avaliacao)
    
    # Atualiza a média de avaliações do restaurante
    await atualizar_media_avaliacoes_restaurante(db, pedido.restaurante_id)
    
    return avaliacao

async def get_avaliacoes_restaurante(db: AsyncSession, restaurante_id: UUID):
    from .models import Avaliacao
    
    result = await db.execute(
        sa.select(Avaliacao)
        .where(Avaliacao.restaurante_id == restaurante_id)
        .order_by(Avaliacao.criado_em.desc())
    )
    return result.scalars().all()

async def get_avaliacao_pedido(db: AsyncSession, pedido_id: UUID, usuario_id: UUID):
    from .models import Avaliacao
    
    result = await db.execute(
        sa.select(Avaliacao).where(
            Avaliacao.pedido_id == pedido_id,
            Avaliacao.usuario_id == usuario_id
        )
    )
    return result.scalar_one_or_none()

async def atualizar_media_avaliacoes_restaurante(db: AsyncSession, restaurante_id: UUID):
    from .models import Avaliacao, Restaurante
    
    # Calcula a média das avaliações
    result = await db.execute(
        sa.select(sa.func.avg(Avaliacao.nota))
        .where(Avaliacao.restaurante_id == restaurante_id)
    )
    media = result.scalar()
    
    # Atualiza o restaurante
    restaurante = await db.get(Restaurante, restaurante_id)
    if restaurante:
        restaurante.avaliacao_media = float(media) if media else 0.0
        await db.commit()
        await db.refresh(restaurante)