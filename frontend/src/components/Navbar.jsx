import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-secundario text-texto shadow-md">
      <h1
        className="font-extrabold text-xl cursor-pointer hover:opacity-80 transition"
        onClick={() => navigate("/")}
      >
        Treelivery
      </h1>

      {usuario ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/meus-pedidos")}
            className="px-4 py-1.5 rounded-full bg-white text-primario font-semibold text-sm hover:bg-primario hover:text-white transition duration-200 shadow-sm border border-primario flex items-center gap-2"
          >
            <span>📦</span>
            <span>Meus Pedidos</span>
          </button>
          <span className="font-medium hidden sm:inline">
            Olá, <span className="font-semibold">{usuario.nome}</span> 👋
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 rounded-full bg-primario text-white font-semibold text-sm hover:bg-destaque hover:text-texto transition duration-200 shadow-sm"
          >
            Sair
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-1.5 rounded-full bg-primario text-white font-semibold text-sm hover:bg-destaque hover:text-texto transition duration-200 shadow-sm"
        >
          Entrar
        </button>
      )}
    </nav>
  );
}
