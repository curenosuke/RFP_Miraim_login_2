import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db, Base
import os

# テスト用データベース
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# テスト用データベーステーブル作成
Base.metadata.create_all(bind=engine)

client = TestClient(app)

class TestAuth:
    def test_register_success(self):
        """正常な新規登録テスト"""
        response = client.post(
            "/api/auth/register",
            json={
                "name": "テストユーザー",
                "email": "test@example.com",
                "password": "testpass123",
                "age": 25,
                "occupation": "エンジニア",
                "konkatsu_status": "beginner"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["name"] == "テストユーザー"

    def test_register_duplicate_email(self):
        """重複メールアドレス登録テスト"""
        # 最初の登録
        client.post(
            "/api/auth/register",
            json={
                "name": "ユーザー1",
                "email": "duplicate@example.com",
                "password": "testpass123"
            }
        )
        
        # 重複登録
        response = client.post(
            "/api/auth/register",
            json={
                "name": "ユーザー2",
                "email": "duplicate@example.com",
                "password": "testpass456"
            }
        )
        assert response.status_code == 400
        assert "既に登録されています" in response.json()["message"]

    def test_register_invalid_password(self):
        """無効なパスワードでの登録テスト"""
        response = client.post(
            "/api/auth/register",
            json={
                "name": "テストユーザー",
                "email": "invalid@example.com",
                "password": "123"  # 短すぎる
            }
        )
        assert response.status_code == 400

    def test_login_success(self):
        """正常なログインテスト"""
        # ユーザー登録
        client.post(
            "/api/auth/register",
            json={
                "name": "ログインテスト",
                "email": "login@example.com",
                "password": "loginpass123"
            }
        )
        
        # ログイン
        response = client.post(
            "/api/auth/login",
            json={
                "email": "login@example.com",
                "password": "loginpass123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "login@example.com"

    def test_login_invalid_credentials(self):
        """無効な認証情報でのログインテスト"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpass"
            }
        )
        assert response.status_code == 401

    def test_get_current_user(self):
        """現在のユーザー情報取得テスト"""
        # ユーザー登録
        register_response = client.post(
            "/api/auth/register",
            json={
                "name": "現在ユーザー",
                "email": "current@example.com",
                "password": "currentpass123"
            }
        )
        token = register_response.json()["access_token"]
        
        # ユーザー情報取得
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "current@example.com"

    def test_check_email_exists(self):
        """メールアドレス存在チェックテスト"""
        # ユーザー登録
        client.post(
            "/api/auth/register",
            json={
                "name": "チェックユーザー",
                "email": "check@example.com",
                "password": "checkpass123"
            }
        )
        
        # 存在するメールアドレス
        response = client.get("/api/auth/check-email/check@example.com")
        assert response.status_code == 200
        assert response.json()["exists"] == True
        
        # 存在しないメールアドレス
        response = client.get("/api/auth/check-email/notexist@example.com")
        assert response.status_code == 200
        assert response.json()["exists"] == False

    def test_health_check(self):
        """ヘルスチェックテスト"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

# テスト実行後のクリーンアップ
def teardown_module():
    if os.path.exists("./test.db"):
        os.unlink("./test.db")