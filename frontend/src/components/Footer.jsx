import React from "react";

export default function Footer() {
  return (
    <footer className="bg-verdeclaro text-esc py-4 mt-6 border-t border-primario">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm px-4">
        <p className="mb-2 sm:mb-0">
          © {new Date().getFullYear()} <span className="font-semibold">Treelivery</span>.  
          Todos os direitos reservados.
        </p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primario transition-colors">Sobre nós</a>
          <a href="#" className="hover:text-primario transition-colors">Contato</a>
          <a href="#" className="hover:text-primario transition-colors">Privacidade</a>
        </div>
      </div>
    </footer>
  );
}
