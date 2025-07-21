from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, constr
from passlib.context import CryptContext
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from datetime import datetime, timedelta
from typing import Optional
import os

# セキュリティ設定
SECRET_KEY = os.getenv("SECRET_KEY", "insecure-dev-key-change-later")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# パスワードハッシュ設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FastAPIアプリ定義
app = FastAPI(title="Conversation Login API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# レートリミッター
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

# ダミーユーザー（将来DBに置き換え予定）
dummy_user = {
    "email": "test@example.com",
    "hashed_password": pwd_context.hash("Test1234"),
    "nickname": "ミツキさん",
    "birthdate": "1990-01-01",
    "marital_status": "single"
}

# Pydanticスキーマ
class LoginInput(BaseModel):
    email: EmailStr
    password: constr(min_length=8)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# JWT発行
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# JWT検証
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# クッキーにトークンをセット
def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="Lax",
        secure=False,  # 本番環境では True + HTTPS
        max_age=3600
    )

@app.get("/")
def root():
    return {"message": "Hello World"}

# ログインエンドポイント
@app.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, user: LoginInput, response: Response):
    if user.email != dummy_user["email"] or not pwd_context.verify(user.password, dummy_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="メールアドレスまたはパスワードが正しくありません")

    token_data = {
        "sub": user.email,
        "nickname": dummy_user["nickname"],
        "birthdate": dummy_user["birthdate"],
        "marital_status": dummy_user["marital_status"]
    }
    access_token = create_access_token(data=token_data)
    set_auth_cookie(response, access_token)

    return {"access_token": access_token, "token_type": "bearer"}

# 認証付きユーザー情報取得
@app.get("/me")
def get_me(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="認証トークンがありません")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="トークンが無効または期限切れです")

    return {"user": payload}

# ヘルスチェック
@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow()}
