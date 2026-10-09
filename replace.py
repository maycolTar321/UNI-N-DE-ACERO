import sys

with open('app/afiliados/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """      try { 
        const res = await api.actualizarAfiliado(String(selectedAfiliado.id), selectedAfiliado); 
        if (!res.exito) {
          alert(`Error al guardar: ${res.mensaje}`);
          if (original) mutate(original);
        }
      } catch(e) {"""

replacement = """      try { 
        const res = await api.actualizarAfiliado(String(selectedAfiliado.id), selectedAfiliado); 
        if (!res.exito) {
          alert(`Error al guardar: ${res.mensaje}`);
          if (original) mutate(original);
        } else {
          const freshData = await api.getAfiliados();
          mutate(freshData);
        }
      } catch(e) {"""

new_content = content.replace(target, replacement)

with open('app/afiliados/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
