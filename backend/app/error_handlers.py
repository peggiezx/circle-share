from fastapi import Request
from fastapi.responses import JSONResponse
from .exceptions import AccessDenied, CircleNotFound, InviteAlreadyResponded, InviteAlreadySent, InviteNotFound, PostNotFound, UserAlreadyJoined, UserNotFound, EmailAlreadyExists, InvalidCredentials, UserNotInCircle
from .schemas import ErrorDetail
from datetime import datetime

async def user_not_found_handler(request: Request, exc: UserNotFound):
    error_detail = ErrorDetail(
        type="user_not_found",
        message=exc.detail      
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_detail.model_dump(mode='json')
    )

async def circle_not_found_handler(request: Request, exc: CircleNotFound):
    error_detail = ErrorDetail(
        type="circle_not_found",
        message=exc.detail      
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_detail.model_dump(mode='json')
    )

async def post_not_found_handler(request: Request, exc: PostNotFound):
    error_detail = ErrorDetail(
        type="post_not_found",
        message=exc.detail      
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_detail.model_dump(mode='json')
    )

    
async def access_denied_handler(request: Request, exc: AccessDenied):
    error_detail = ErrorDetail(
        type="access_denied",
        message=exc.detail      
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_detail.model_dump(mode='json')
    )


async def user_already_joined_handler(request: Request, exc:UserAlreadyJoined):
    error_detail = ErrorDetail(
        type="user_already_joined",
        message=exc.detail      
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_detail.model_dump(mode='json')
    )


async def email_already_registered_handler(request: Request, exc: EmailAlreadyExists):
    error_detail = ErrorDetail(
        type="email_already_reistered",
        message=exc.detail
        ) 
    return JSONResponse(
            status_code=exc.status_code,
            content= error_detail.model_dump(mode='json')
    )
    

async def invalid_credentials_handler(request: Request, exc: InvalidCredentials):
    error_detail = ErrorDetail(
        type="invalid_credentials",
        message=exc.detail
    )
        
    return JSONResponse(
            status_code=exc.status_code,
            content= error_detail.model_dump(mode='json')
    )


async def user_not_in_circle_handler(requests: Request, exc: UserNotInCircle):
    error_detail = ErrorDetail(
        type="user_not_in_circle",
        message=exc.detail
    )
    
#invitation related

async def invite_not_found_handler(requests: Request, exc: InviteNotFound):
    error_detail = ErrorDetail(
        type="invite_not_found",
        message=exc.detail
    )

async def invite_already_sent_handler(requests: Request, exc: InviteAlreadySent):
    error_detail = ErrorDetail(
        type="invite_already_sent",
        message=exc.detail
    )

async def invite_already_responded_handler(requests: Request, exc: InviteAlreadyResponded):
    error_detail = ErrorDetail(
        type="invite_already_reponded",
        message=exc.detail
    )