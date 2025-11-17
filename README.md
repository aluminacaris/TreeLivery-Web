# 🌳 TreeLivery

Sistema completo de delivery de comida com foco em personalização alimentar, permitindo que usuários encontrem restaurantes e pratos adequados às suas necessidades dietéticas e restrições alimentares.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Executar](#como-executar)
- [API Endpoints](#api-endpoints)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Funcionalidades Futuras](#funcionalidades-futuras)
- [Contribuição](#contribuição)

## 🎯 Sobre o Projeto

TreeLivery é uma plataforma de delivery que conecta usuários a restaurantes, oferecendo:

- **Personalização alimentar**: Sistema de perfis de usuário com tipos de dieta, restrições alimentares e seletividade
- **Gestão completa**: Interface administrativa para restaurantes gerenciarem seus pratos
- **Sistema de avaliações**: Usuários podem avaliar pedidos e restaurantes
- **Interface moderna**: Design responsivo e intuitivo com React e Tailwind CSS

## 🛠 Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e rápido para Python
- **SQLAlchemy** - ORM para Python com suporte assíncrono
- **PostgreSQL** - Banco de dados relacional
- **asyncpg** - Driver assíncrono para PostgreSQL
- **Pydantic** - Validação de dados
- **python-jose** - Autenticação JWT
- **bcrypt** - Hash de senhas
- **Uvicorn** - Servidor ASGI
- **Gunicorn** - Servidor WSGI para produção

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool e dev server
- **React Router** - Roteamento para aplicações React
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP
- **Framer Motion** - Biblioteca de animações
- **WebSocket** - Comunicação em tempo real para notificações

## 🆕 Funcionalidades Recentes

- **Notificações em Tempo Real**: Restaurantes recebem notificações instantâneas quando novos pedidos são criados via WebSocket
- **Gestão de Perfil**: Usuários e restaurantes podem editar seus perfis e alterar senhas
- **Validações Inteligentes**: Sistema valida e formata automaticamente telefones, CEPs e estados
- **Compatibilidade de Restrições**: Sistema inteligente que compara restrições alimentares de forma precisa, evitando falsos positivos

## ✨ Funcionalidades

### Para Usuários
- ✅ Cadastro e autenticação
- ✅ Perfil personalizado com tipo de dieta, restrições e seletividade
- ✅ **Edição de perfil** (nome, tipo de dieta, restrições, seletividade)
- ✅ **Alteração de senha**
- ✅ Visualização de restaurantes disponíveis
- ✅ Visualização de cardápios e pratos
- ✅ Sistema inteligente de compatibilidade de restrições alimentares
- ✅ Sistema de carrinho de compras
- ✅ Realização de pedidos
- ✅ Acompanhamento de pedidos
- ✅ Sistema de avaliações (nota e comentário) com interface intuitiva
- ✅ Histórico de pedidos

### Para Restaurantes
- ✅ Cadastro e autenticação
- ✅ Dashboard administrativo com estatísticas
- ✅ **Edição de perfil** (nome, descrição, telefone, endereço, tempo de entrega, taxa)
- ✅ **Alteração de senha**
- ✅ CRUD completo de pratos (criar, editar, deletar, listar)
- ✅ Upload de imagens para pratos
- ✅ Upload de foto de perfil
- ✅ Visualização de pedidos recebidos
- ✅ Atualização de status dos pedidos
- ✅ **Notificações em tempo real** para novos pedidos (WebSocket)
- ✅ Visualização de avaliações recebidas
- ✅ Validações de dados (telefone, CEP, estado)

## 📁 Estrutura do Projeto

```
treelivery/
├── backend/
│   ├── app/
│   │   ├── routes/          # Rotas da API
│   │   │   ├── restaurantes.py
│   │   │   ├── pedidos.py
│   │   │   ├── usuarios.py
│   │   │   ├── uploads.py
│   │   │   └── avaliacoes.py
│   │   ├── static/          # Arquivos estáticos (uploads)
│   │   ├── auth.py          # Autenticação de usuários
│   │   ├── auth_restaurante.py  # Autenticação de restaurantes
│   │   ├── crud.py          # Operações de banco de dados
│   │   ├── database.py      # Configuração do banco
│   │   ├── main.py          # Aplicação FastAPI
│   │   ├── models.py        # Modelos SQLAlchemy
│   │   ├── schemas.py       # Schemas Pydantic
│   │   └── websocket_manager.py  # Gerenciador de conexões WebSocket
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React
    │   │   ├── Navbar.jsx
    │   │   ├── NavbarRestaurante.jsx
    │   │   └── Footer.jsx
    │   ├── context/         # Context API
    │   │   ├── AuthContext.jsx
    │   │   ├── AuthRestauranteContext.jsx
    │   │   ├── CartContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── layout/          # Layouts
    │   │   ├── Layout.jsx
    │   │   └── LayoutRestaurante.jsx
    │   ├── pages/           # Páginas da aplicação
    │   │   ├── Home.jsx
    │   │   ├── Restaurantes.jsx
    │   │   ├── Menu.jsx
    │   │   ├── Login.jsx
    │   │   ├── Cadastro.jsx
    │   │   ├── LoginRestaurante.jsx
    │   │   ├── CadastroRestaurante.jsx
    │   │   ├── MeusPedidos.jsx
    │   │   ├── PedidosRestaurante.jsx
    │   │   └── PerfilUsuario.jsx
    │   ├── hooks/            # Custom hooks
    │   │   └── useWebSocket.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Python 3.11+**
- **Node.js 18+** e npm
- **PostgreSQL 14+**
- **Git**

## ⚙️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd treelivery
```

### 2. Configuração do Backend

```bash
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

### 3. Configuração do Banco de Dados

1. Crie um banco de dados PostgreSQL:
```sql
CREATE DATABASE treeliveryfr;
```

2. Configure a string de conexão no arquivo `backend/app/database.py`:
```python
DATABASE_URL = "postgresql+asyncpg://usuario:senha@localhost:5432/treeliveryfr"
```

### 4. Configuração do Frontend

```bash
cd frontend

# Instale as dependências
npm install
```

## 🚀 Como Executar

### Backend

```bash
cd backend

# Ative o ambiente virtual (se ainda não estiver ativo)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Execute o servidor
uvicorn app.main:app --reload
```

O backend estará disponível em `http://localhost:8000`

Documentação interativa da API: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Execute o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 📡 API Endpoints

### Autenticação de Usuários
- `POST /usuarios/` - Cadastro de usuário
- `POST /usuarios/login` - Login de usuário
- `GET /usuarios/me` - Obter dados do usuário logado
- `PUT /usuarios/me` - Atualizar perfil do usuário
- `PUT /usuarios/me/senha` - Alterar senha do usuário

### Autenticação de Restaurantes
- `POST /restaurantes/registro` - Cadastro de restaurante
- `POST /restaurantes/login` - Login de restaurante
- `GET /restaurantes/me` - Obter dados do restaurante logado
- `PUT /restaurantes/me` - Atualizar perfil do restaurante
- `PUT /restaurantes/me/senha` - Alterar senha do restaurante
- `PUT /restaurantes/foto-perfil` - Atualizar foto de perfil

### Restaurantes
- `GET /restaurantes` - Lista todos os restaurantes ativos
- `GET /restaurantes/{id}` - Detalhes de um restaurante
- `GET /restaurantes/{id}/menu` - Cardápio de um restaurante
- `GET /restaurantes/estatisticas` - Estatísticas do restaurante logado (requer autenticação)

### Pratos
- `GET /restaurantes/{id}/menu` - Lista pratos de um restaurante
- `POST /restaurantes/{id}/menu` - Cria um novo prato (requer autenticação)
- `PUT /restaurantes/menu/{prato_id}` - Atualiza um prato (requer autenticação)
- `DELETE /restaurantes/menu/{prato_id}` - Remove um prato (requer autenticação)

### Pedidos
- `POST /pedidos` - Cria um novo pedido (requer autenticação)
- `GET /pedidos/usuario/me` - Lista pedidos do usuário logado (requer autenticação)
- `GET /pedidos/restaurante/{restaurante_id}` - Lista pedidos do restaurante (requer autenticação)
- `PUT /pedidos/{pedido_id}/status` - Atualiza status do pedido (requer autenticação)

### Avaliações
- `POST /avaliacoes/` - Cria uma avaliação (requer autenticação)
- `GET /avaliacoes/restaurante/{restaurante_id}` - Lista avaliações de um restaurante
- `GET /avaliacoes/pedido/{pedido_id}` - Obtém avaliação de um pedido específico

### Uploads
- `POST /uploads/prato/{prato_id}` - Upload de imagem para prato (requer autenticação)

### WebSocket
- `WS /ws/restaurante/{restaurante_id}` - Conexão WebSocket para notificações em tempo real

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **usuarios**: Informações dos usuários (nome, email, tipo de dieta, restrições, seletividade)
- **restaurantes**: Informações dos restaurantes (nome, endereço, avaliação média, etc.)
- **pratos**: Cardápio dos restaurantes (nome, descrição, preço, restrições, imagem)
- **pedidos**: Pedidos realizados (usuário, restaurante, status, total)
- **itens_pedido**: Itens de cada pedido (prato, quantidade, preço unitário)
- **avaliacoes**: Avaliações dos pedidos (nota, comentário, pedido, restaurante, usuário)

## 🔮 Funcionalidades Futuras

- [✅] Finalização completa do sistema de pedidos (backend e frontend)
- [✅] Sistema de notificações em tempo real (WebSocket)
- [✅] Edição de perfil para usuários e restaurantes
- [✅] Alteração de senha para usuários e restaurantes
- [✅] Validações de dados (telefone, CEP, estado)
- [✅] Sistema inteligente de compatibilidade de restrições alimentares
- [ ] Sistema de recomendação automática baseado no perfil do usuário
- [ ] Implementação de IA para recomendações personalizadas
- [ ] Busca automática de CEP (integração com ViaCEP)
- [ ] Filtros avançados para restaurantes (por tipo de dieta, restrições)
- [ ] Sistema de favoritos
- [ ] Integração com serviços de pagamento
- [ ] Sistema de cupons e promoções
- [ ] App mobile (React Native)

Desenvolvido com ❤️ para facilitar a vida de pessoas com necessidades alimentares específicas.
