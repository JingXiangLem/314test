from app import create_app, db
from app.models.user import User, UserProfile, VolunteerBlacklist, VolunteerShortlist, VolunteerReview
from app.models.request import Category, HelpRequest, VolunteerOffer
from app.models.system import SystemLog, ScheduledReport

app = create_app()

with app.app_context():
    print("Dropping all tables...")
    db.drop_all()
    
    print("Creating all tables...")
    db.create_all()
    
    print("Creating categories...")
    categories = [
        Category(name="Groceries", description="Help with grocery shopping"),
        Category(name="Moving", description="Assistance with moving furniture"),
        Category(name="Tutoring", description="Educational support and tutoring"),
        Category(name="Healthcare", description="Medical appointments and healthcare"),
        Category(name="Technology", description="Tech support and assistance"),
        Category(name="General", description="General help and support")
    ]
    db.session.add_all(categories)
    db.session.commit()
    
    print("Creating users...")
    
    # Admin user
    admin = User(
        email="admin@mockfyp.com",
        username="admin",
        role="admin",
        is_active=True
    )
    admin.set_password("admin123")
    admin.profile = UserProfile(
        full_name="System Administrator",
        phone="123-456-7890"
    )
    db.session.add(admin)
    
    # PIN users
    pin1 = User(
        email="john@mockfyp.com",
        username="john_doe",
        role="pin",
        is_active=True
    )
    pin1.set_password("password123")
    pin1.profile = UserProfile(
        full_name="John Doe",
        phone="555-123-4567",
        address="123 Main St, Downtown"
    )
    db.session.add(pin1)
    
    pin2 = User(
        email="mary@mockfyp.com",
        username="mary_jane",
        role="pin",
        is_active=True
    )
    pin2.set_password("password123")
    pin2.profile = UserProfile(
        full_name="Mary Jane",
        phone="555-234-5678",
        address="456 Oak Ave, Uptown"
    )
    db.session.add(pin2)
    
    # CSR users
    csr1 = User(
        email="volunteer@company.com",
        username="csr_rep",
        role="csr",
        is_active=True
    )
    csr1.set_password("password123")
    csr1.profile = UserProfile(
        full_name="Jane Smith",
        phone="555-987-6543",
        company_name="Tech Corp"
    )
    db.session.add(csr1)
    
    csr2 = User(
        email="helper@business.com",
        username="volunteer_bob",
        role="csr",
        is_active=True
    )
    csr2.set_password("password123")
    csr2.profile = UserProfile(
        full_name="Bob Wilson",
        phone="555-876-5432",
        company_name="Business Solutions Inc"
    )
    db.session.add(csr2)
    
    # Manager user
    manager = User(
        email="manager@mockfyp.com",
        username="platform_manager",
        role="manager",
        is_active=True
    )
    manager.set_password("manager123")
    manager.profile = UserProfile(
        full_name="Platform Manager",
        phone="555-111-2222"
    )
    db.session.add(manager)
    
    db.session.commit()
    
    print("Creating help requests...")
    requests = [
        HelpRequest(
            requester_id=pin1.id,
            title="Need help with groceries",
            description="Looking for someone to help me get groceries this week. I have mobility issues and would appreciate assistance.",
            category_id=categories[0].id,
            location="Downtown",
            urgency="medium",
            status="pending"
        ),
        HelpRequest(
            requester_id=pin1.id,
            title="Moving assistance needed",
            description="Need help moving furniture to new apartment on Saturday morning",
            category_id=categories[1].id,
            location="Uptown",
            urgency="high",
            status="pending"
        ),
        HelpRequest(
            requester_id=pin2.id,
            title="Math tutoring for high school",
            description="Looking for someone to help with algebra and geometry homework",
            category_id=categories[2].id,
            location="Suburbs",
            urgency="low",
            status="pending"
        ),
        HelpRequest(
            requester_id=pin2.id,
            title="Computer setup help",
            description="Need help setting up new laptop and transferring files",
            category_id=categories[4].id,
            location="Downtown",
            urgency="medium",
            status="pending"
        )
    ]
    db.session.add_all(requests)
    db.session.commit()
    
    print("Creating volunteer offers...")
    offers = [
        VolunteerOffer(
            request_id=requests[0].id,
            volunteer_id=csr1.id,
            status="pending",
            message="I'd be happy to help with your groceries!"
        ),
        VolunteerOffer(
            request_id=requests[1].id,
            volunteer_id=csr2.id,
            status="accepted",
            message="I have experience with moving. Count me in!"
        )
    ]
    db.session.add_all(offers)
    db.session.commit()
    
    print("Creating sample reviews...")
    review = VolunteerReview(
        pin_id=pin1.id,
        volunteer_id=csr1.id,
        rating=5,
        comment="Very helpful and patient! Highly recommend."
    )
    db.session.add(review)
    
    # Update volunteer rating
    csr1.profile.rating = 5.0
    csr1.profile.total_reviews = 1
    
    db.session.commit()
    
    print("\n✅ Database initialized successfully!")
    print("\n�� Test Credentials:")
    print("=" * 50)
    print("Admin:    admin@mockfyp.com / admin123")
    print("Manager:  manager@mockfyp.com / manager123")
    print("PIN 1:    john@mockfyp.com / password123")
    print("PIN 2:    mary@mockfyp.com / password123")
    print("CSR 1:    volunteer@company.com / password123")
    print("CSR 2:    helper@business.com / password123")
    print("=" * 50)
