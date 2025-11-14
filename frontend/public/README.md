# 📁 Pasta Public

Esta pasta contém arquivos estáticos que são servidos diretamente na raiz do site.

## 🎯 Favicon

Para adicionar o favicon do TreeLivery:

### Opção 1: Usando a mesma logo (Recomendado)

1. **Copie sua logo** da pasta `src/assets/logo.png` para esta pasta (`public/`)
2. **Renomeie** para `favicon.png` ou `favicon.ico`
3. Se usar PNG, o Vite já está configurado para usar `/favicon.png`
4. Se usar ICO, o Vite também está configurado para usar `/favicon.ico`

### Opção 2: Criar um favicon específico

1. **Crie ou converta** sua logo para um favicon:
   - **PNG**: 32x32px ou 64x64px (recomendado)
   - **ICO**: Formato tradicional (pode conter múltiplos tamanhos)
   - **SVG**: Melhor qualidade em qualquer resolução

2. **Coloque o arquivo** nesta pasta (`public/`) com um dos nomes:
   - `favicon.png`
   - `favicon.ico`
   - `favicon.svg`

3. **Atualize o `index.html`** se necessário (já está configurado para PNG e ICO)

### Formatos Suportados

- **PNG** (32x32px ou 64x64px) - Recomendado
- **ICO** - Formato tradicional
- **SVG** - Melhor qualidade, funciona em qualquer resolução

### Tamanhos Recomendados

- **Favicon padrão**: 32x32px ou 64x64px
- **Apple Touch Icon**: 180x180px (para iOS)
- **Android Chrome**: 192x192px e 512x512px

### Ferramentas Úteis

- [Favicon Generator](https://realfavicongenerator.net/) - Gera todos os tamanhos necessários
- [Favicon.io](https://favicon.io/) - Cria favicons a partir de texto ou imagem
- [ConvertICO](https://convertio.co/pt/png-ico/) - Converte PNG para ICO

## 📝 Nota

Arquivos nesta pasta são servidos diretamente na raiz do site. Por exemplo:
- `public/favicon.png` → acessível em `http://localhost:5173/favicon.png`
- `public/robots.txt` → acessível em `http://localhost:5173/robots.txt`

