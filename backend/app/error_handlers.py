from fastapi import Request
from fastapi.responses import JSONResponse
from .exceptions import UserNotFound, EmailAlreadyExists, InvalidCredentials
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
    