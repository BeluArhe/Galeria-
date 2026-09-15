from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('ctf_challenge.db')
    cursor = conn.cursor()
    
    # Tabla principal de desembolsos bancarios corporativos
    cursor.execute('DROP TABLE IF EXISTS disbursements')
    cursor.execute('''
        CREATE TABLE disbursements (
            id INTEGER PRIMARY KEY,
            name TEXT,
            category TEXT,
            amount REAL
        )
    ''')
    cursor.execute("INSERT INTO disbursements VALUES (1, 'DES-8921 | Corporación Inversiones Andina', 'Crédito Corporativo', 1500000.00)")
    cursor.execute("INSERT INTO disbursements VALUES (2, 'DES-8922 | Constructora Horizonte Pacífico S.A.', 'Línea de Liquidez Comercial', 850000.00)")
    cursor.execute("INSERT INTO disbursements VALUES (3, 'DES-8923 | Agroexportadora San Fernando', 'Desembolso Agrícola Preferencial', 420000.00)")
    cursor.execute("INSERT INTO disbursements VALUES (4, 'DES-8924 | Transportes & Flotas Globales', 'Leasing Operativo Financiero', 670000.00)")
    cursor.execute("INSERT INTO disbursements VALUES (5, 'DES-8925 | Soluciones Cloud & Fintech LATAM', 'Capital de Trabajo', 310000.00)")
    cursor.execute("INSERT INTO disbursements VALUES (6, 'DES-8926 | Grupo Farmacéutico Continental', 'Línea de Crédito Rotativo', 940000.00)")

    # Tabla de productos mantenida por retrocompatibilidad
    cursor.execute('DROP TABLE IF EXISTS products')
    cursor.execute('''
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            category TEXT,
            price REAL
        )
    ''')
    cursor.execute("INSERT INTO products VALUES (1, 'DES-8921 | Corporación Inversiones Andina', 'Crédito Corporativo', 1500000.00)")
    cursor.execute("INSERT INTO products VALUES (2, 'DES-8922 | Constructora Horizonte Pacífico S.A.', 'Línea de Liquidez Comercial', 850000.00)")
    cursor.execute("INSERT INTO products VALUES (3, 'DES-8923 | Agroexportadora San Fernando', 'Desembolso Agrícola Preferencial', 420000.00)")
    cursor.execute("INSERT INTO products VALUES (4, 'DES-8924 | Transportes & Flotas Globales', 'Leasing Operativo Financiero', 670000.00)")
    cursor.execute("INSERT INTO products VALUES (5, 'DES-8925 | Soluciones Cloud & Fintech LATAM', 'Capital de Trabajo', 310000.00)")
    cursor.execute("INSERT INTO products VALUES (6, 'DES-8926 | Grupo Farmacéutico Continental', 'Línea de Crédito Rotativo', 940000.00)")

    # Tabla oculta de banderas de auditoría de seguridad (CTF Flags)
    cursor.execute('DROP TABLE IF EXISTS ctf_flags')
    cursor.execute('''
        CREATE TABLE ctf_flags (
            id INTEGER PRIMARY KEY,
            flag_name TEXT,
            flag_value TEXT
        )
    ''')
    cursor.execute("INSERT INTO ctf_flags VALUES (1, 'FLAG_AUDIT_EXFIL', 'UFdO{UzBMaTczX1UzSTBOX000UzczUl8yMDI2}')")

    conn.commit()
    conn.close()

@app.route('/api/search', methods=['GET'])
def search():
    search_query = request.args.get('search', '')
    results = []
    error_msg = ""

    if search_query:
        conn = sqlite3.connect('ctf_challenge.db')
        cursor = conn.cursor()
        
        # VULNERABILIDAD INTENCIONAL PARA SIMULACIÓN DE AUDITORÍA:
        # Concatenación directa de la entrada del usuario en la consulta SQL sin sanitizar
        query = f"SELECT id, name, category, amount FROM disbursements WHERE name LIKE '%{search_query}%'"
        
        try:
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                results.append({
                    "id": row[0],
                    "name": row[1],
                    "beneficiary": row[1],
                    "category": row[2],
                    "amount": row[3],
                    "price": row[3]
                })
        except sqlite3.Error as e:
            error_msg = f"Database Error: {e}"
        finally:
            conn.close()

    return jsonify({
        "results": results,
        "error": error_msg
    })

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
