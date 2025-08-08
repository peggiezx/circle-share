from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import get_db, engine, Base
from .schemas import JournalEntry, UserCreate, UserLogin, CircleCreate, CircleResponse, MyCirclesResponse, Invitee, InviteeResponse
from .models import User, Circle, CircleMember
from .auth.custom_auth import hash_password, verify_password, create_user_token, get_current_user, SECRET_KEY, ACCESS_TOKEN_MINUTES
from datetime import datetime, timedelta
from .exceptions import CircleNotFound, UserAlreadyJoined, UserNotFound, InvalidCredentials, EmailAlreadyExists, AccessDenied
from .error_handlers import access_denied_handler, circle_not_found_handler, user_already_joined_handler, user_not_found_handler, email_already_registered_handler, invalid_credentials_handler

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_exception_handler(EmailAlreadyExists, email_already_registered_handler)
app.add_exception_handler(UserNotFound, user_not_found_handler)
app.add_exception_handler(InvalidCredentials, invalid_credentials_handler)
app.add_exception_handler(CircleNotFound, circle_not_found_handler)
app.add_exception_handler(AccessDenied, access_denied_handler)
app.add_exception_handler(UserAlreadyJoined, user_already_joined_handler)

session = Session()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/create-entry")
async def create_journal_entry(entry: JournalEntry):
    return {
        "message": "Journal entry created!",
        "entry": {
            "title": entry.title,
            "date": entry.date,
            "content": entry.content,
        }
    }


# user registration endpoint
@app.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise EmailAlreadyExists
        
    new_user = User(
        name=user_data.name,
        email = user_data.email,
        hashed_password = hash_password(user_data.password),
        first_access=datetime.now()
    )
    
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Account created successfully!", "user_id":new_user.id}


# user authentication and authorization
@app.post("/login")
async def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    print(f"Login attempt for {credentials.email}")
    
    user_info = db.query(User).filter(User.email == credentials.email).first()
    print(f"User found: {user_info is not None}")  # Debug line

    if not user_info:
        raise UserNotFound()
    
    # print("Verifying password...")  # Debug line
    if verify_password(credentials.password, user_info.hashed_password):
        # print("Password verified, creating token...")
    
        data = {
            "sub": user_info.email, 
            "name": user_info.name, 
            "id": user_info.id}
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_MINUTES)
        access_token = create_user_token(data, access_token_expires)
        print(f"Token created: {access_token[:20]}...") 

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    raise InvalidCredentials()


@app.get("/profile")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "message": f"Welcome {current_user}",
        "user_id": current_user.id,
        "email": current_user.email,
        "member_since": current_user.first_access
    }

@app.post("/circles", response_model=CircleResponse)
async def create_circle(
    circle: CircleCreate, 
    creator: User = Depends(get_current_user), 
    db: Session = Depends(get_db)):
    
    new_circle = Circle(
        name = circle.name,
        creator_id = creator.id
    )
    
    db.add(new_circle)
    db.commit()
    db.refresh(new_circle)
    
    new_circle.members.append(creator)
    db.commit()
    
    
    return CircleResponse(
        id=new_circle.id,
        name=new_circle.name,
        creator_id=new_circle.creator_id,
        member_count=len(new_circle.members)
    )

@app.get("/circles/my", response_model=MyCirclesResponse)
async def view_circle_members(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
    ):
    my_circle = db.query(Circle).filter(Circle.creator_id == current_user.id).all()
    members_circles = [circle for circle in current_user.circles if circle.creator_id != current_user.id]
    return MyCirclesResponse(
        created_circles=my_circle,
        member_circles=members_circles
    )


@app.post("/circles/{circle_id}/invite", response_model=InviteeResponse)
async def invite_user_to_circle(
    circle_id: int,
    invitee_data: Invitee,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    
):
    curr_circle = db.get(Circle, circle_id)
    if not curr_circle:
        raise CircleNotFound()
    
    if curr_circle.creator_id != current_user.id:
        raise AccessDenied()
    
    invitee_user = db.query(User).filter(User.email == invitee_data.email).first()
    if not invitee_user:
        raise UserNotFound()
    
    if invitee_user in curr_circle.members:
        raise UserAlreadyJoined()
    
    curr_circle.members.append(invitee_user)
    db.commit()
    
    return InviteeResponse(
        circle_joined=curr_circle.name,
        circle_owner=current_user.name
    )
     
     
@app.delete("/circles/{circle_id}/leave")
async def leave_circle(
    circle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"=== LEAVE CIRCLE DEBUG ===")
    print(f"Circle ID: {circle_id}")
    print(f"Current user: {current_user.name} (ID: {current_user.id})")
    
    circle = db.get(Circle, circle_id)
    if not circle:
        raise CircleNotFound()
    
    print(f"Circle: {circle.name} (creator ID: {circle.creator_id})")
    print(f"Creator check: {circle.creator_id} == {current_user.id} = {circle.creator_id == current_user.id}")
    
    circle = db.get(Circle, circle_id)
    print(f"Found the circle and it's own by {circle.creator_id}, and the current user id is {current_user.id}")
    if not circle:
        raise CircleNotFound()
    
    if circle.creator_id == current_user.id:
        print(f"confirming the circle is owned by current user {current_user.id}")
        circle_name = circle.name
        db.delete(circle)
        db.commit()
        return {"message": f'{circle_name} has been deleted'}
    
    if current_user not in circle.members:
        raise AccessDenied()

    circle.members.remove(current_user)
    db.commit()
    return {"message": f"You have left '{circle.name}'"}


@app.get("/users")
async def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"users": users, "count": len(users)}


