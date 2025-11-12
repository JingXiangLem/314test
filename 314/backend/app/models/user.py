from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    help_requests = db.relationship('HelpRequest', backref='requester', lazy='dynamic', cascade='all, delete-orphan')
    volunteer_offers = db.relationship('VolunteerOffer', backref='volunteer_user', lazy='dynamic', foreign_keys='VolunteerOffer.volunteer_id')
    blacklisted_by = db.relationship('VolunteerBlacklist', backref='volunteer', foreign_keys='VolunteerBlacklist.volunteer_id')
    reviews_received = db.relationship('VolunteerReview', backref='volunteer', foreign_keys='VolunteerReview.volunteer_id')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    full_name = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    company_name = db.Column(db.String(200))
    bio = db.Column(db.Text)
    avatar_url = db.Column(db.String(500))
    rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    completed_tasks = db.Column(db.Integer, default=0)

class VolunteerBlacklist(db.Model):
    __tablename__ = 'volunteer_blacklist'
    
    id = db.Column(db.Integer, primary_key=True)
    pin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    pin = db.relationship('User', foreign_keys=[pin_id])

class VolunteerShortlist(db.Model):
    __tablename__ = 'volunteer_shortlist'
    
    id = db.Column(db.Integer, primary_key=True)
    pin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    pin = db.relationship('User', foreign_keys=[pin_id])
    volunteer = db.relationship('User', foreign_keys=[volunteer_id])

class VolunteerReview(db.Model):
    __tablename__ = 'volunteer_reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    pin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    request_id = db.Column(db.Integer, db.ForeignKey('help_requests.id'), nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    pin = db.relationship('User', foreign_keys=[pin_id])
    request = db.relationship('HelpRequest')
