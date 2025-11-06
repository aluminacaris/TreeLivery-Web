import { useAuthRestaurante } from "../context/AuthRestauranteContext";
import { useNavigate } from "react-router-dom";

export default function NavbarRestaurante() {
  const { restaurante, logoutRestaurante } = useAuthRestaurante();
  const navigate = useNavigate();

  function handleLogout() {
    logoutRestaurante();
    navigate("/login-restaurante");
  }

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-secundario text-texto shadow-md">
      <h1
        className="font-extrabold text-xl cursor-pointer hover:opacity-80 transition"
        onClick={() => navigate("/")}
      >
        🍽️ Treelivery
      </h1>

      {restaurante ? (
        <div className="flex items-center gap-4">
          <span className="font-medium">
            Olá, <span className="font-semibold">{restaurante.razao_social}</span> 👋
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
          onClick={() => navigate("/login-restaurante")}
          className="px-4 py-1.5 rounded-full bg-primario text-white font-semibold text-sm hover:bg-destaque hover:text-texto transition duration-200 shadow-sm"
        >
          Entrar
        </button>
      )}
    </nav>
  );
}
