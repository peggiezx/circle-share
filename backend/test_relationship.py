from app.database import get_db, engine, Base
from app.models import User, Circle, CircleMember
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, inspect


SQLALCHEMY_DATABASE_URL = "sqlite:///.circle_share.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

Base.metadata.create_all(bind=engine)
inspector = inspect(engine)
existing_tables = inspector.get_table_names()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_relationship():
    session = SessionLocal()
    
    try:
        
        alice = User(name="Alice", email="alice@test.com",hashed_password="hashed123")
        bob = User(name="Bob", email="bob@test.com", hashed_password="hash456")
        charlie = User(name="Charlie", email="charlie@test.com", hashed_password="hash789")
        
        session.add_all([alice, bob, charlie])
        session.commit()
        print("Created users: ", alice.name, bob.name, charlie.name)
        
        family_circle = Circle(name="Alice's Family", creator_id=alice.id)
        session.add(family_circle)
        session.commit()
        print("Alice created circle: ", family_circle.name)
        
        print("Alice's created circle: ", [c.name for c in alice.created_circles])
        print("Family circle created by: ", family_circle.creator.name)
        
        family_circle.members.append(alice)
        family_circle.members.append(bob)
        session.commit()
        print("Added members to family circle: ", [c.name for c in family_circle.members])
        
        memberships = session.query(CircleMember).all()
        for membership in memberships:
            user = session.get(User, membership.user_id)
            circle = session.get(Circle, membership.circle_id)
            print(f"    {user.name} joined {circle.name} at {membership.joined_at}")
    
    except Exception as e:
        print("Error:", e)
        session.rollback()
    finally:
        session.close()
    
    
if __name__ == "__main__":
    test_relationship()