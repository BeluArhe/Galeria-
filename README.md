# 🏦 Meridian Financial Group: "El Portal de Desembolsos Fantasma"
### Reto de Ciberseguridad & Auditoría de Vulnerabilidades (Red Team vs Blue Team)

---

## 📋 Resumen del Escenario

| Atributo | Detalle |
| :--- | :--- |
| **Categoría** | **Web Exploitation** |
| **Autor** | **belubell** |
| **Entidad Financiera** | Meridian Financial Group |
| **Entorno Tecnológico** | Híbrido: Cloud (AWS/Azure) + Servidores On-Premises |
| **Aplicación Afectada** | Portal Corporativo de Gestión de Créditos, Préstamos y Desembolsos |
| **Objetivo** | Exfiltrar la bandera de seguridad oculta en la base de datos y descifrarla |
| **URL del Portal** | `http://localhost:5173` |
| **API Backend** | `http://localhost:5000/api/search` |
| **Documento Write-up** | Consulta el [WRITEUP.md](file:///c:/Users/ASUS/Documents/Ciberminds/DevFest/Galeria-/WRITEUP.md) |

---

## 🔍 Contexto del Incidente

Trabajas como analista de seguridad evaluando el nuevo portal corporativo de **Meridian Financial Group**, diseñado para gestionar créditos, préstamos y desembolsos de clientes. La plataforma cuenta con una barra de búsqueda avanzada que supuestamente solo filtra registros legítimos de transacciones comerciales. 

Sin embargo, los reportes de auditoría apuntan a que los campos de entrada no están sanitizando correctamente los caracteres especiales. Un atacante con acceso al portal podría manipular las consultas SQL para extraer información confidencial o registros que jamás deberían estar expuestos a usuarios comunes.

Tu misión como especialista en pruebas de penetración es demostrar el impacto de esta vulnerabilidad realizando una **inyección SQL (SQLi) mediante UNION SELECT**.

---

## 🚀 Despliegue del Laboratorio

Para levantar el entorno con **Docker Compose**:

```bash
# 1. Construir e iniciar los contenedores en segundo plano
docker compose up --build -d --force-recreate

# 2. Verificar estado de los servicios
docker compose ps
```

El portal estará disponible en:
- **Frontend Bancario:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🕵️‍♂️ Misión para el Estudiante (El Hallazgo de la Flag)

1. **Reconocimiento:**
   - Ingresa a la interfaz en `http://localhost:5173`.
   - Localiza la barra de búsqueda de desembolsos comerciales.
   - Comprueba si el campo reacciona ante caracteres de control SQL (como `'`).

2. **Deducción de Estructura:**
   - Determina cuántas columnas devuelve la consulta original de la aplicación para poder alinear una consulta de unión (`UNION SELECT`).
   - Identifica qué tabla contiene las banderas de auditoría (pista: `ctf_flags` con campos `flag_name` y `flag_value`).

3. **Exfiltración:**
   - Inyecta tu payload `UNION SELECT` estructurado para volcar la tabla de auditoría junto a los desembolsos.
   - Observa el registro anómalo devuelto en la interfaz.

4. **Evasión DLP (Data Loss Prevention):**
   - El valor exfiltrado en el campo **Categoría** parece estar protegido bajo una codificación para evadir sistemas DLP.
   - Utiliza tus herramientas de analista (CyberChef, terminal, python, etc.) para descifrar la bandera final.

---

## 🔐 Solución y Guía para Instructores

Consulta el archivo detallado con la solución paso a paso en [**WRITEUP.md**](file:///c:/Users/ASUS/Documents/Ciberminds/DevFest/Galeria-/WRITEUP.md).