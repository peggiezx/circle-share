def is_creator(user, circle):
    return circle.creator_id == user.id

def is_member(user, circle):
    return user in circle.members

def is_member_but_not_creator(user, circle):
    return is_member(user, circle) and not is_creator(user, circle)