# Miraim Backend API

婚活男性向け内面スタイリングアプリ「Miraim」のバックエンドAPI

## 技術スタック

- **FastAPI**: 高性能なPython Webフレームワーク
- **SQLite**: 軽量データベース（開発用）
- **JWT**: 認証トークン
- **bcrypt**: パスワードハッシュ化
- **SQLAlchemy**: ORM
- **Pydantic**: データバリデーション

## セキュリティ機能

- パスワードのbcryptハッシュ化
- JWT認証
- CORS設定
- 入力値バリデーション
- SQLインジェクション対策

## セットアップ

### 1. 依存関係インストール

```bash
cd backend
pip install -r requirements.txt
```

### 2. 環境変数設定

```bash
cp .env.example .env
# .envファイルを編集して適切な値を設定
```

### 3. データベース初期化

```bash
# SQLiteデータベースは自動作成されます
# 必要に応じてdatabase.sqlの内容を参考にしてください
```

### 4. アプリケーション起動

```bash
python main.py
# または
uvicorn main:app --reload
```

## API エンドポイント

### 認証

- `POST /api/auth/register` - 新規ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得
- `POST /api/auth/refresh` - トークンリフレッシュ
- `GET /api/auth/check-email/{email}` - メールアドレス重複チェック

### ヘルスチェック

- `GET /health` - サーバーステータス確認

## API仕様

### 新規ユーザー登録

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "password": "securePassword123",
  "age": 28,
  "occupation": "エンジニア",
  "konkatsu_status": "beginner",
  "location": "東京都",
  "hobbies": "プログラミング、読書"
}
```

### ログイン

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "tanaka@example.com",
  "password": "securePassword123"
}
```

### レスポンス例

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "age": 28,
    "occupation": "エンジニア",
    "konkatsu_status": "beginner",
    "location": "東京都",
    "hobbies": "プログラミング、読書",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

## 開発ツール

- **API ドキュメント**: http://localhost:8000/docs
- **SQLite Browser**: 任意のSQLiteブラウザでmiraim.dbを確認

## データベーススキーマ

### users テーブル

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | INT | 主キー |
| name | VARCHAR(100) | ユーザー名 |
| email | VARCHAR(255) | メールアドレス（ユニーク） |
| password_hash | VARCHAR(255) | ハッシュ化パスワード |
| age | INT | 年齢 |
| occupation | VARCHAR(100) | 職業 |
| konkatsu_status | VARCHAR(50) | 婚活状況 |
| location | VARCHAR(100) | 居住地域 |
| hobbies | VARCHAR(500) | 趣味・興味 |
| created_at | DATETIME | 作成日時 |
| updated_at | DATETIME | 更新日時 |

## セキュリティ考慮事項

1. **パスワード**: bcryptでハッシュ化、8文字以上、英数字必須
2. **JWT**: 30分で期限切れ
3. **CORS**: 許可されたオリジンのみ
4. **入力検証**: Pydanticによる厳密なバリデーション

## 本番環境での注意事項

1. `SECRET_KEY`を強力なランダム文字列に変更
2. SQLiteから本格的なデータベース（PostgreSQL/MySQL）への移行
3. HTTPS必須
4. ログ監視の設定
5. バックアップ戦略の実装