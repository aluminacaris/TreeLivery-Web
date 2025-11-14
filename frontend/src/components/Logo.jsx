import { useNavigate } from "react-router-dom";

// Para adicionar a logo:
// 1. Adicione o arquivo da logo em src/assets/logo.png (ou .svg, .jpg)
// 2. Descomente a linha abaixo:
import logo from "../assets/logo.png";

export default function Logo({ className = "" }) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex items-center gap-3 cursor-pointer hover:opacity-80 transition ${className}`}
      onClick={() => navigate("/")}
    >
      {logo ? (
        <img 
          src={logo} 
          alt="TreeLivery Logo" 
          className="h-10 w-auto object-contain"
        />
      ) : (
        <h1 className="font-extrabold text-xl">
          Treelivery
        </h1>
      )}
    </div>
  );
}

