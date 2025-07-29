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
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
    # 1) メールアドレスでユーザー情報を取得
    user = crud.get_user_by_email(request.email)
    if not user:
        # メールアドレスが存在しない
        raise HTTPException(status_code=401, detail="メールアドレスまたはパスワードが正しくありません")

    # 2) ハッシュと平文パスワードを照合
    if not pwd_context.verify(request.password, user.password_hash):
        # パスワード不一致
        raise HTTPException(status_code=401, detail="メールアドレスまたはパスワードが正しくありません")

    # 3) OK なら JWT を作ってクッキーにセット
    token = create_JWT(user.id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="Lax",
        secure=False,  # 本番は True + HTTPS
        max_age=3600,
        path="/"
    )
    return {"user_id": user.id}

# @app.post("/login")
# def login(request: LoginInfo, response: Response):
#     user_id = crud.find_user(request.email, request.password)
#     if user_id:
#         token = create_JWT(user_id["id"])
#         response.set_cookie(
#             key="access_token",
#             value=token,
#             httponly=True,
#             samesite="Lax",
#             secure=False,  # 本番環境では True + HTTPS
#             max_age=3600,
#             path ="/"
#         )
#         return {"user_id": user["id"]}
#     else:
#         raise HTTPException(status_code=401, detail="Invalid credentials")

def decode_JWT(request: Request):
    # cookie上のuser_idからユーザー情報を取得
    token = request.cookies.get("access_token")
    if not token:
        print("no token")
        raise HTTPException(status_code=401, detail="認証トークンがありません")

    try:
        print("now decoding")
        payload = jwt.decode(token, JWT_KEY, algorithms=["HS256"])
        print("decoded")
        id_payload = payload["user_id"]
    except JWTError:
        print("JWTError")
        raise HTTPException(status_code=401, detail="トークンが無効または期限切れです")
    
    user_info = crud.get_user_by_id(id_payload)
    if not user_info:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    return user_info

@app.get("/me")
def get_myInfo(user: dict = Depends(decode_JWT)):
    print(user["location"])
    return user

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
