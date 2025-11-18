from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import re

router = APIRouter(prefix="/cep", tags=["CEP"])

class EnderecoViaCEP(BaseModel):
    cep: str
    logradouro: str
    complemento: str
    bairro: str
    localidade: str
    uf: str
    erro: bool = False

@router.get("/{cep}")
async def buscar_cep(cep: str):
    """
    Busca informações de endereço através do CEP usando a API ViaCEP.
    
    Args:
        cep: CEP no formato XXXXX-XXX ou XXXXXXXX (8 dígitos)
    
    Returns:
        Dicionário com informações do endereço (logradouro, bairro, cidade, estado)
    """
    # Remove caracteres não numéricos
    cep_limpo = re.sub(r'\D', '', cep)
    
    # Valida se tem 8 dígitos
    if len(cep_limpo) != 8:
        raise HTTPException(status_code=400, detail="CEP deve conter 8 dígitos")
    
    try:
        # Faz requisição para a API ViaCEP
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://viacep.com.br/ws/{cep_limpo}/json/",
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()
            
            # Verifica se o CEP foi encontrado
            if "erro" in data and data["erro"]:
                raise HTTPException(status_code=404, detail="CEP não encontrado")
            
            # Retorna os dados formatados
            return {
                "cep": data.get("cep", ""),
                "logradouro": data.get("logradouro", ""),
                "bairro": data.get("bairro", ""),
                "cidade": data.get("localidade", ""),
                "estado": data.get("uf", ""),
                "complemento": data.get("complemento", "")
            }
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout ao buscar CEP. Tente novamente.")
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=404, detail="CEP não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar CEP: {str(e)}")

