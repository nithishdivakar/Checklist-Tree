from flask import Flask, jsonify, request, send_from_directory
import json
import os
import time
from datetime import datetime
import sys

app = Flask(__name__)
STORE_NAME = 'test.json'


default_values = {
    'id': '',
    'parent_id': -1,
    'text': '',
    'checked': False,
    'archived': False
}

def sanitise_itm(itm):
    new_itm = {}
    for key in default_values:
        new_itm[key] = itm.get(key, default_values[key])
    return new_itm

def load_itms():
    DATA = []
    if os.path.exists(STORE_NAME):
        with open(STORE_NAME, 'r') as f:
            DATA =  json.load(f)
            for itm in DATA:
                itm = sanitise_itm(itm)
    return DATA

def save_itms(itms):
    for idx in range(len(itms)):
        itms[idx] = sanitise_itm(itms[idx])

    with open(STORE_NAME, 'w') as f:
        json.dump(itms, f, indent=2)

def get_formatted_timestamp():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

@app.route('/api/itms', methods=['GET'])
def get_itms():
    itms = load_itms()
    return jsonify(itms)

@app.route('/api/itms/<int:itm_id>', methods=['PUT'])
def update_itm(itm_id):
    itms = load_itms()
    nw = request.json
    print(itm_id, nw)
    search_results = [ele for ele in itms if ele['id'] == nw['id']]
    if search_results:
        search_results[0].update(nw)
    else:
        itms.append(nw)
    save_itms(itms)
    return jsonify({'success': 'Added','itm': nw}), 201

@app.route('/api/itms/<int:itm_id>', methods=['DELETE'])
def delete_itm(itm_id):
    itms = load_itms()
    itms = [itm for itm in itms if itm['id'] != itm_id]
    save_itms(itms)
    return jsonify({'result': 'itm deleted'})

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/test')
def test():
    return send_from_directory('templates', 'test.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, port=sys.argv[1])
