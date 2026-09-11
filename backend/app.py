from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('ctf_challenge.db')
    cursor = conn.cursor()
    
    cursor.execute('DROP TABLE IF EXISTS products')
    cursor.execute('''
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            category TEXT,
            price REAL
        )
    ''')
    cursor.execute("INSERT INTO products VALUES (1, 'Laptop Gaming', 'Tech', 1200.00)")
    cursor.execute("INSERT INTO products VALUES (2, 'Teclado Mecanico', 'Perifericos', 80.00)")
    cursor.execute("INSERT INTO products VALUES (3, 'Mouse Inalambrico', 'Perifericos', 45.00)")
    cursor.execute("INSERT INTO products VALUES (4, 'Monitor 4K', 'Tech', 350.00)")

    cursor.execute('DROP TABLE IF EXISTS ctf_flags')
    cursor.execute('''
        CREATE TABLE ctf_flags (
            id INTEGER PRIMARY KEY,
            flag_name TEXT,
            flag_value TEXT
        )
    ''')
    cursor.execute("INSERT INTO ctf_flags VALUES (1, 'main_flag', 'FLAG{sqlite_union_master_2026}')")

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
        
        # VULNERABILIDAD: Concatenación directa de la entrada del usuario en la consulta SQL
        query = f"SELECT id, name, category, price FROM products WHERE name LIKE '%{search_query}%'"
        
        try:
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                results.append({
                    "id": row[0],
                    "name": row[1],
                    "category": row[2],
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
