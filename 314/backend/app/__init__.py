from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
        
    CORS(app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
                "expose_headers": ["Content-Type", "Authorization"],
                "max_age": 600
            }
        }
    )
   
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # Register all blueprints
    from app.routes import auth, users, requests, volunteers, admin
    from app.routes import user_admin, pin, csr, system, password_recovery
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(requests.bp)
    app.register_blueprint(volunteers.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(user_admin.bp)
    app.register_blueprint(pin.bp)
    app.register_blueprint(csr.bp)
    app.register_blueprint(system.bp)
    app.register_blueprint(password_recovery.bp)
 
    return app
