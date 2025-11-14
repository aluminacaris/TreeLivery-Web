# 📁 Pasta de Assets

Esta pasta contém os arquivos de mídia e imagens do projeto TreeLivery.

## 🖼️ Como Adicionar a Logo

Para adicionar a logo do TreeLivery na navbar:

1. **Adicione o arquivo da logo** nesta pasta (`src/assets/`) com o nome `logo.png` (ou `logo.svg`, `logo.jpg`)

2. **Abra o arquivo** `src/components/Logo.jsx`

3. **Descomente a linha de import** (linha 6):
   ```jsx
   import logo from "../assets/logo.png";
   ```

4. **Descomente o código da imagem** (linhas 17-23):
   ```jsx
   {logo && (
     <img 
       src={logo} 
       alt="TreeLivery Logo" 
       className="h-10 w-auto object-contain"
     />
   )}
   ```

5. **Pronto!** A logo aparecerá ao lado do texto "Treelivery" na navbar.

## 📐 Formatos Suportados

- **PNG** (recomendado para logos com transparência)
- **SVG** (recomendado para escalabilidade - melhor qualidade em qualquer resolução)
- **JPG/JPEG**

## 💡 Dicas

- A logo será exibida com altura de 40px (`h-10`) e largura automática proporcional
- O Vite processa automaticamente os imports de imagens
- Para ajustar o tamanho, modifique a classe `h-10` no componente Logo.jsx (ex: `h-12` para 48px, `h-8` para 32px)
- Se quiser que a logo substitua completamente o texto, remova o `<h1>Treelivery</h1>` do componente
- A logo funciona em qualquer resolução graças ao `object-contain` que mantém as proporções

