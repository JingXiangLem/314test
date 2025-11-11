from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.request import Category

bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def require_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.role in ['admin', 'manager']

@bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(is_active=True).all()
    return jsonify([{'id': c.id, 'name': c.name, 'description': c.description} for c in categories]), 200

@bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    if not require_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    category = Category(
        name=data['name'],
        description=data.get('description', '')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({'id': category.id, 'name': category.name}), 201

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    print("Incoming headers: ", request.headers)
    if not require_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    from app.models.request import HelpRequest
    total_requests = HelpRequest.query.count()
    completed_requests = HelpRequest.query.filter_by(status='completed').count()
    
    return jsonify({
        'total_users': total_users,
        'active_users': active_users,
        'total_requests': total_requests,
        'completed_requests': completed_requests
    }), 200
