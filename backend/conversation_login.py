from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, constr
from passlib.context import CryptContext
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from datetime import datetime, timedelta, timezone
from typing import Optional
import os

import crud

class RegisterInfo(BaseModel):
    name: str
    email: str
    password_hash: str
    birth_date: str
    konkatsu_status: str
    occupation: str
    birth_place: str
    location: str
    hobbies: str
    weekend_activity: str

class LoginInfo(BaseModel):
    email: str
    password: str


class LoginInput(BaseModel):
    email: EmailStr
    password: constr(min_length=8)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

JWT_KEY = os.getenv("JWT_KEY")

# パスワードハッシュ設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FastAPIアプリ定義
app = FastAPI(title="Conversation Login API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# レートリミッター
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)


@app.get("/")
def root():
    return {"message": "Hello World"}

@app.post("/register")
def write_one_user(request: RegisterInfo):
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    value = {
        "name": request.name,
        "email": request.email,
        "password_hash": pwd_context.hash(request.password_hash),
        "birth_date": request.birth_date, # 型の変換が必要かも
        "konkatsu_status": request.konkatsu_status,
        "occupation": request.occupation,
        "birth_place": request.birth_place,
        "location": request.location,
        "hobbies": request.hobbies,
        "weekend_activity": request.weekend_activity,
        "created_at": now,
        "updated_at": now
    }
    result = crud.insert_user(crud.Users, value)
    return {"status": "success"}

# ログインエンドポイント
def create_JWT(id: str):
    payload = {
        "user_id": id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60) # JWTの有効期限
    }
    token = jwt.encode(payload, JWT_KEY, algorithm="HS256")
    return token

@app.post("/login")
def login(request: LoginInfo, response: Response):
    user_id = crud.find_user(request.email, request.password)
    if user_id:
        token = create_JWT(user_id["id"])
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            samesite="Lax",
            secure=False,  # 本番環境では True + HTTPS
            max_age=3600,
            path ="/"
        )
        return {"user_id": user_id["id"]}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# # JWT検証
# def verify_token(token: str):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except JWTError:
#         return None

@app.get("/me")
def get_me():
    pass # ユーザー情報の取得

# @app.post("/login", response_model=TokenResponse)
# @limiter.limit("5/minute")
# def login(request: Request, user: LoginInput, response: Response):
#     if user.email != dummy_user["email"] or not pwd_context.verify(user.password, dummy_user["hashed_password"]):
#         raise HTTPException(status_code=401, detail="メールアドレスまたはパスワードが正しくありません")

#     token_data = {
#         "sub": user.email,
#         "nickname": dummy_user["nickname"],
#         "birthdate": dummy_user["birthdate"],
#         "marital_status": dummy_user["marital_status"]
#     }
#     access_token = create_access_token(data=token_data)
#     set_auth_cookie(response, access_token)

#     return {"access_token": access_token, "token_type": "bearer"}

# 認証付きユーザー情報取得
# @app.get("/me")
# def get_me(request: Request):
#     token = request.cookies.get("access_token")
#     if not token:
#         raise HTTPException(status_code=401, detail="認証トークンがありません")

#     payload = verify_token(token)
#     if not payload:
#         raise HTTPException(status_code=401, detail="トークンが無効または期限切れです")

#     return {"user": payload}

# ヘルスチェック
@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.now(timezone.utc)}
