from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your_jwt_secret_key')
jwt = JWTManager(app)

# MongoDB Setup
client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
db = client['task_manager']
users_collection = db['users']
tasks_collection = db['tasks']

# Routes

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if users_collection.find_one({'email': data['email']}):
        return jsonify({"message": "User already exists"}), 409
    hashed_password = generate_password_hash(data['password'])
    users_collection.insert_one({
        'email': data['email'],
        'password': hashed_password
    })
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = users_collection.find_one({'email': data['email']})
    if user and check_password_hash(user['password'], data['password']):
        access_token = create_access_token(identity={'email': user['email']})
        return jsonify(access_token=access_token), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/tasks', methods=['GET', 'POST'])
@jwt_required()
def manage_tasks():
    current_user = get_jwt_identity()
    if request.method == 'POST':
        data = request.get_json()
        tasks_collection.insert_one({
            'user_email': current_user['email'],
            'title': data['title'],
            'description': data.get('description', ''),
            'status': 'incomplete'
        })
        return jsonify({"message": "Task created"}), 201
    else:
        tasks = list(tasks_collection.find({'user_email': current_user['email']}))
        for task in tasks:
            task['_id'] = str(task['_id'])
        return jsonify(tasks), 200

@app.route('/tasks/<task_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_delete_task(task_id):
    current_user = get_jwt_identity()
    task = tasks_collection.find_one({'_id': pymongo.ObjectId(task_id), 'user_email': current_user['email']})
    if not task:
        return jsonify({"message": "Task not found"}), 404
    if request.method == 'PUT':
        data = request.get_json()
        tasks_collection.update_one({'_id': pymongo.ObjectId(task_id)}, {'$set': data})
        return jsonify({"message": "Task updated"}), 200
    elif request.method == 'DELETE':
        tasks_collection.delete_one({'_id': pymongo.ObjectId(task_id)})
        return jsonify({"message": "Task deleted"}), 200

if __name__ == '__main__':
    app.run(debug=True)
