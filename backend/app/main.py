from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from .database import get_db, engine, Base
from .schemas import CirclesJoinedResponse, InvitationAction, InvitationResponse, MemberToRemove, PostBase, PostResponse, UserCreate, UserLogin, CircleCreate, CircleResponse, MyCircleResponse, Invitee, UserResponse
from .models import CircleInvitation, Post, User, Circle, CircleMember
from .auth.custom_auth import hash_password, verify_password, create_user_token, get_current_user, SECRET_KEY, ACCESS_TOKEN_MINUTES
from datetime import datetime, timedelta
from .exceptions import CircleNotFound, PostNotFound, UserAlreadyJoined, UserNotFound, InvalidCredentials, EmailAlreadyExists, AccessDenied, UserNotInCircle, InviteAlreadyResponded, InviteNotFound, InviteAlreadySent
from .error_handlers import access_denied_handler, circle_not_found_handler, post_not_found_handler, user_already_joined_handler, user_not_found_handler, email_already_registered_handler, invalid_credentials_handler, user_not_in_circle_handler, invite_already_responded_handler, invite_not_found_handler, invite_already_sent_handler
from .auth.oso_patterns.policy_engine import policy_engine
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(EmailAlreadyExists, email_already_registered_handler)
app.add_exception_handler(UserNotFound, user_not_found_handler)
app.add_exception_handler(InvalidCredentials, invalid_credentials_handler)
app.add_exception_handler(CircleNotFound, circle_not_found_handler)
app.add_exception_handler(AccessDenied, access_denied_handler)
app.add_exception_handler(UserAlreadyJoined, user_already_joined_handler)
app.add_exception_handler(UserNotInCircle, user_not_in_circle_handler)
app.add_exception_handler(PostNotFound, post_not_found_handler)
app.add_exception_handler(InviteNotFound, invite_not_found_handler)
app.add_exception_handler(InviteAlreadyResponded, invite_already_responded_handler)
app.add_exception_handler(InviteAlreadySent, invite_already_sent_handler)


session = Session()


@app.get("/")
async def root():
    return {"message": "Hello World"}


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
    
    new_circle = Circle(
        name = f"{new_user.name}'s Circle",
        creator_id = new_user.id,        
    )
    
    db.add(new_circle)
    db.commit()
    db.refresh(new_circle)
    
    new_circle.members.append(new_user)
    db.commit()

    return {"message": "Account created successfully!", "user_id":new_user.id, "circle_id": new_circle.id}


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

# fastapi testing 
@app.post("/token")
async def token_for_docs(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Reuse your existing login logic, but with OAuth2 form format
    user_info = db.query(User).filter(User.email == form_data.username).first()
    
    if not user_info:
        raise UserNotFound()
    
    if verify_password(form_data.password, user_info.hashed_password):
        data = {
            "sub": user_info.email, 
            "name": user_info.name, 
            "id": user_info.id
        }
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_MINUTES)
        access_token = create_user_token(data, access_token_expires)

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
    
    circle_name = circle.name if circle.name else f"{creator.name} Circle"
    new_circle = Circle(
        name = circle_name,
        creator_id = creator.id
    )
    
    db.add(new_circle)
    db.commit()
    db.refresh(new_circle)
    print(f"New circle ID after refresh: {new_circle.id}")  # Debug

    new_circle.members.append(creator)
    db.commit()
    
    response = CircleResponse(
        id=new_circle.id,
        name=new_circle.name,
        creator_id=new_circle.creator_id,
        member_count=len(new_circle.members)
    )
    print(f"Response object: {response}")
    return response


@app.get("/my-circle", response_model=MyCircleResponse)
async def get_my_circle(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    my_circle = db.query(Circle).filter(Circle.creator_id == current_user.id).first()
    if not my_circle:
        raise CircleNotFound()
    
    return MyCircleResponse(
        id=my_circle.id,
        name=my_circle.name,
        member_count=len(my_circle.memebers)
    )

# invite members to my circle
@app.post("/my-circle/invite", response_model=InvitationResponse)
async def invite_user_to_circle(
    invitee_data: Invitee,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    
):
    curr_circle = db.query(Circle).filter(Circle.creator_id == current_user.id).first()
    if not curr_circle:
        raise CircleNotFound()
    
    if curr_circle.creator_id != current_user.id:
        raise AccessDenied()
    
    # # NEW Oso-inpsired auth
    # try:
    #     policy_engine.require_authorization(current_user, "invite_members", curr_circle)
    #     print(" Both systems agreed: ALLOW")
    # except AccessDenied:
    #     print(" Disagreement: Current = ALLOW, Oso = DENY")
    
    invitee_user = db.query(User).filter(User.email == invitee_data.email).first()
    if not invitee_user:
        raise UserNotFound()
    
    if invitee_user in curr_circle.members:
        raise UserAlreadyJoined()
    
    existing_invite = db.query(CircleInvitation).filter(
        CircleInvitation.from_user_id == current_user.id,
        CircleInvitation.to_user_id == invitee_user.id,
        CircleInvitation.status == "pending"
    ).first()
    
    if existing_invite:
        raise InviteAlreadySent()
    
    new_invite = CircleInvitation(
        from_user_id=current_user.id,
        to_user_id=invitee_user.id,
        status="pending",
    )
    
    db.add(new_invite)
    db.commit()
    db.refresh(new_invite)
    
    return InvitationResponse(
        id=new_invite.id,
        from_user_name=current_user.name,
        from_user_email=current_user.email,
        status='pending',
        created_at=new_invite.created_at
    )


@app.get("/invitations/received", response_model=list[InvitationResponse])
async def get_pending_invites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    circle_invitations = db.query(CircleInvitation).filter(
        CircleInvitation.to_user_id == current_user.id, 
        CircleInvitation.status=='pending'
        ).all()
    
    res = []
    
    for invite in circle_invitations:
        new_invite = InvitationResponse (
            id=invite.id,
            from_user_name=invite.from_user.name,
            from_user_email=invite.from_user.email,
            status='pending',
            created_at=invite.created_at
        )
        res.append(new_invite)
    
    return res
    

@app.post("/invitations/{invitation_id}/respond")
async def respond_to_invites(
    invitation_id: int,
    action: InvitationAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invite = db.query(CircleInvitation).filter(
        CircleInvitation.id == invitation_id,
        CircleInvitation.to_user_id == current_user.id
    ).first()
    
    if not invite:
        raise InviteNotFound()
    
    if invite.status != "pending":
        raise InviteAlreadyResponded()
    
    if action.action == 'accept':
        
        from_user_circle = db.query(Circle).filter(Circle.creator_id == invite.from_user_id).first()
        to_user_circle=db.query(Circle).filter(Circle.creator_id == current_user.id).first()
        
        from_user_circle.members.append(current_user)
        to_user_circle.members.append(invite.from_user)

        db.delete(invite)
        db.commit()
        return {"message": "You've accepted the invitation"}
    
    elif action.action == 'decline':
        db.delete(invite)
        db.commit()
        return {"message": "You've declined the invitation"}

# get all the posts in the circles you joined
@app.get("/their-days", response_model=list[PostResponse])
async def get_their_days(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # user_circles = current_user.circles
    user_circle_ids = [circle.id for circle in current_user.circles]
    
    posts = db.query(Post).filter(
        Post.circle_id.in_(user_circle_ids),
        Post.author_id != current_user.id
    ).options(
        joinedload(Post.author)
    ).order_by(Post.created_at.desc()).all()
    
    return [
        PostResponse(
                post_id=p.post_id,
                circle_id=p.circle_id,
                author_id=p.author_id,
                content=p.content,
                created_at=p.created_at,
                author_name=p.author.name
            )
        for p in posts
    ]
         

# get all my own posts
@app.get("/my-circle/posts", response_model=list[PostResponse])
async def get_my_circle_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = []
    for post in current_user.posts:
        post_response = PostResponse(
            post_id=post.post_id,
            circle_id=post.circle_id,
            author_id=current_user.id,
            content=post.content,
            created_at=post.created_at,
            author_name=current_user.name
        )
        res.append(post_response)
    
    return res

# get all the circle members
@app.get("/my-circle/members", response_model=list[UserResponse])
async def get_my_circle_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    circle = db.query(Circle).options(joinedload(Circle.members)).filter(Circle.creator_id == current_user.id).first()
    members = [member for member in circle.members if member.id != current_user.id]
    
    return members


# remove a member in my circle
@app.delete("/my-circle/members/{member_id}")
async def remove_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"Attempting to remove member {member_id} for user {current_user.id}")  # Debug

    circle = db.query(Circle).filter(Circle.creator_id == current_user.id).first()
    if not circle:
        raise CircleNotFound()
    
    if circle.creator_id != current_user.id:
        raise AccessDenied()
    
    if member_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    
    member_to_remove = db.query(User).filter(User.id == member_id).first()
    if not member_to_remove:
        raise UserNotFound()
    
    if member_to_remove not in circle.members:
        raise UserNotInCircle()
    
    member_to_remove_name = member_to_remove.name

    try:
        circle.members.remove(member_to_remove)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to remove member from circle")
    
    return {"message": f"You have removed {member_to_remove_name} from your circle."}



@app.get("/circles/joined", response_model=CirclesJoinedResponse)
async def get_joined_circles(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
    ):
    members_circles = [circle for circle in current_user.circles if circle.creator_id != current_user.id]
    return CirclesJoinedResponse(
        member_circles=members_circles
    )


# @app.post("/circles/{circle_id}/invite", response_model=InviteeResponse)
# async def invite_user_to_circle(
#     circle_id: int,
#     invitee_data: Invitee,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
    
# ):
#     curr_circle = db.get(Circle, circle_id)
#     if not curr_circle:
#         raise CircleNotFound()
    
#     if curr_circle.creator_id != current_user.id:
#         raise AccessDenied()
    
#     # NEW Oso-inpsired auth
#     try:
#         policy_engine.require_authorization(current_user, "invite_members", curr_circle)
#         print(" Both systems agreed: ALLOW")
#     except AccessDenied:
#         print(" Disagreement: Current = ALLOW, Oso = DENY")
    
#     invitee_user = db.query(User).filter(User.email == invitee_data.email).first()
#     if not invitee_user:
#         raise UserNotFound()
    
#     if invitee_user in curr_circle.members:
#         raise UserAlreadyJoined()
    
#     curr_circle.members.append(invitee_user)
#     db.commit()
    
#     return InviteeResponse(
#         circle_joined=curr_circle.name,
#         circle_owner=current_user.name
#     )
     
     
@app.delete("/circles/{circle_id}/leave")
async def leave_circle(
    circle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
\
    
    circle = db.get(Circle, circle_id)
    if not circle:
        raise CircleNotFound()
    
    print(f"Circle: {circle.name} (creator ID: {circle.creator_id})")
    print(f"Creator check: {circle.creator_id} == {current_user.id} = {circle.creator_id == current_user.id}")
        
    circle = db.get(Circle, circle_id)
    print(f"Found the circle and it's own by {circle.creator_id}, and the current user id is {current_user.id}")
    if not circle:
        raise CircleNotFound()
    
    # New Oso implementation
    
    
    if circle.creator_id == current_user.id:
        print(f"confirming the circle is owned by current user {current_user.id}")
        try:
            policy_engine.require_authorization(current_user, "leave_circle", circle)
            print(" Both systems agreed: ALLOW(delete)")
        except AccessDenied:
            print(" Disagreement: Current = ALLOW, Oso = DENY")
            
        circle_name = circle.name
        db.delete(circle)
        db.commit()
        return {"message": f'{circle_name} has been deleted'}
    
    else:
        try:
            policy_engine.require_authorization(current_user, "leave_circle", circle)
            print(" Both systems agreed: ALLOW(leave)")
        except AccessDenied:
            print(" Disagreement: Current = ALLOW, Oso = DENY")
        
        if current_user not in circle.members:
            raise AccessDenied()

        circle.members.remove(current_user)
        db.commit()
        return {"message": f"You have left '{circle.name}'"}


@app.delete("/circles/{circle_id}/remove")
async def remove_member(
    circle_id: int,
    member_data: MemberToRemove,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    circle = db.get(Circle, circle_id)
    if not circle:
        raise CircleNotFound()
    
    if circle.creator_id != current_user.id:
        raise AccessDenied()
    
    member_to_delete = db.query(User).filter(User.email == member_data.email).first()
    if not member_to_delete:
        raise UserNotFound()
    
    if member_to_delete not in circle.members:
        raise UserNotInCircle()
    
    if member_to_delete.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself from the circle")

    member_to_delete_name = member_to_delete.name

    try:
        circle.members.remove(member_to_delete)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to remove member from circle")
    
    return {"message": f"You have removed {member_to_delete_name} from your circle."}

# create a post
@app.post("/posts/", response_model=PostResponse)
async def create_post(
    post_data: PostBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    circle = db.query(Circle).filter(Circle.creator_id == current_user.id).first()
    if not circle:
        raise CircleNotFound()
    
    if circle.creator_id != current_user.id:
        raise AccessDenied()
    
    new_post = Post(
        circle_id=circle.id,
        author_id=current_user.id,
        content=post_data.content,
        created_at=datetime.now()
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return PostResponse(
        post_id=new_post.post_id,
        circle_id=new_post.circle_id,
        author_id=new_post.author_id,
        content=new_post.content,
        created_at=new_post.created_at,
        author_name=current_user.name
    )
    
    


@app.get("/circles/{circle_id}/posts", response_model=list[PostResponse])
async def get_circle_posts(
    circle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    circle = db.query(Circle).filter(Circle.id == circle_id).first()
    if not circle:
        raise CircleNotFound()
    
    if current_user not in circle.members:
        raise AccessDenied()
    
    res = []
    for post in circle.posts:
        post_response = PostResponse(
            post_id=post.post_id,
            circle_id=post.circle_id,
            author_id=post.author.id,
            content=post.content,
            created_at=post.created_at,
            author_name=post.author.name,
        )
        res.append(post_response)
                
    return res


# remove a single post
@app.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db) 
):
    post_to_delete = db.query(Post).filter(Post.post_id == post_id).first()
    if not post_to_delete:
        raise PostNotFound()
    
    can_delete = (
        post_to_delete.author_id == current_user.id or
        post_to_delete.circle.creator_id == current_user.id
    )
    
    if not can_delete:
        raise AccessDenied()
    
    db.delete(post_to_delete)
    db.commit()
    
    return {"message": f"Your post created at {post_to_delete.created_at} was deleted"}



@app.get("/users")
async def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"users": users, "count": len(users)}


@app.get("/debug/routes")
async def get_routes():
    routes = []
    for route in app.routes:
        if hasattr(route, "methods"):
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": route.name
            })
    return routes