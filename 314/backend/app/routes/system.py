from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.system import SystemLog, ScheduledReport
from datetime import datetime, timedelta
import secrets
import csv
from io import StringIO

bp = Blueprint('system', __name__, url_prefix='/api/system')

def require_admin_or_manager():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.role in ['admin', 'manager', 'sysadmin']

@bp.route('/logs', methods=['GET'])
@jwt_required()
def get_system_logs():
    if not require_admin_or_manager():
        return jsonify({'error': 'Unauthorized'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    action_filter = request.args.get('action')
    
    query = SystemLog.query
    
    if action_filter:
        query = query.filter_by(action=action_filter)
    
    logs = query.order_by(SystemLog.timestamp.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'logs': [log.to_dict() for log in logs.items],
        'total': logs.total,
        'pages': logs.pages,
        'current_page': page
    }), 200

@bp.route('/audit-trail/<int:user_id>', methods=['GET'])
@jwt_required()
def get_audit_trail(user_id):
    if not require_admin_or_manager():
        return jsonify({'error': 'Unauthorized'}), 403
    
    logs = SystemLog.query.filter_by(user_id=user_id).order_by(
        SystemLog.timestamp.desc()
    ).limit(100).all()
    
    return jsonify([log.to_dict() for log in logs]), 200

@bp.route('/export-csv', methods=['GET'])
@jwt_required()
def export_audit_csv():
    logs = SystemLog.query.order_by(SystemLog.timestamp.desc()).all()

    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(['Timestamp', 'User', 'Action', 'Details', 'IP Address'])

    for log in logs:
        writer.writerow([
            log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            getattr(log, 'username', None) or f"User #{log.user_id}",
            log.action,
            log.details or '',
            log.ip_address or ''
        ])

    output = Response(si.getvalue(), mimetype='text/csv')
    output.headers['Content-Disposition'] = 'attachment; filename=audit_logs.csv'
    return output

@bp.route('/scheduled-reports', methods=['GET'])
@jwt_required()
def get_scheduled_reports():
    if not require_admin_or_manager():
        return jsonify({'error': 'Unauthorized'}), 403
    
    reports = ScheduledReport.query.all()
    
    result = []
    for report in reports:
        result.append({
            'id': report.id,
            'name': report.name,
            'report_type': report.report_type,
            'frequency': report.frequency,
            'is_active': report.is_active,
            'last_run': report.last_run.isoformat() if report.last_run else None,
            'next_run': report.next_run.isoformat() if report.next_run else None
        })
    
    return jsonify(result), 200

@bp.route('/scheduled-reports', methods=['POST'])
@jwt_required()
def create_scheduled_report():
    if not require_admin_or_manager():
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    report = ScheduledReport(
        name=data['name'],
        report_type=data['report_type'],
        frequency=data['frequency'],
        recipients=data.get('recipients', ''),
        next_run=datetime.utcnow() + timedelta(days=1)
    )
    
    db.session.add(report)
    db.session.commit()
    
    return jsonify({'message': 'Scheduled report created successfully'}), 201
