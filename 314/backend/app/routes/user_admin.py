from flask import Blueprint, request, jsonify, Response
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from app import db
from app.models.user import User
from app.models.system import SystemLog
import csv
import io

bp = Blueprint('user_admin', __name__, url_prefix='/api/admin/users')

def require_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.role == 'admin'

def log_action(action, details):
    user_id = get_jwt_identity()
    log = SystemLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

@bp.route('/assign-role/<int:user_id>', methods=['PUT'])
@jwt_required()
def assign_role(user_id):
    if not require_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    user = User.query.get_or_404(user_id)
    old_role = user.role
    user.role = data['role']
    
    db.session.commit()
    
    log_action('ROLE_ASSIGNED', f'Changed user {user.username} role from {old_role} to {user.role}')
    
    return jsonify({
        'message': 'Role assigned successfully',
        'user': user.to_dict()
    }), 200

@bp.route('/export-csv', methods=['GET'])
@jwt_required()
def export_users_csv():
    result = db.session.execute(text("SELECT id, username, email FROM users")).mappings()

    # 2️⃣ Prepare CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Email', 'Username'])  # Header row

    for row in result:
        writer.writerow([row['id'], row['email'], row['username']])

    # 3️⃣ Create downloadable response
    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers["Content-Disposition"] = "attachment; filename=users.csv"
    return response

@bp.route('/deactivate/<int:user_id>', methods=['PUT'])
@jwt_required()
def deactivate_user(user_id):
    if not require_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    user.is_active = False
    db.session.commit()
    
    log_action('USER_DEACTIVATED', f'Deactivated user {user.username}')
    
    return jsonify({'message': 'User deactivated successfully'}), 200
