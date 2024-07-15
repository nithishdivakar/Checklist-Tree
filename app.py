from flask import Flask, jsonify, request, send_from_directory
import json
import os
import time
from datetime import datetime


app = Flask(__name__)

def load_todos():
    if os.path.exists('todos.json'):
        with open('todos.json', 'r') as f:
            return json.load(f)
    return []

def save_todos(todos):
    with open('todos.json', 'w') as f:
        json.dump(todos, f, indent=2)

def get_formatted_timestamp():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

@app.route('/api/todos', methods=['GET'])
def get_todos():
    todos = load_todos()
    return jsonify(todos)

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    print(todo_id)
    todos = load_todos()
    nw = request.json
    
    search_results = [ele for ele in todos if ele['id'] == nw['id']]
    if search_results:
        search_results[0].update(request.json)
    else:
        nw['ts'] = get_formatted_timestamp()
        todos.append(nw)
    save_todos(todos)
    return jsonify({'success': 'Todo added'}), 201

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todos = load_todos()
    todos = [todo for todo in todos if todo['id'] != todo_id]
    save_todos(todos)
    return jsonify({'result': 'Todo deleted'})

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)
