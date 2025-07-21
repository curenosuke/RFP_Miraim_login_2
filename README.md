# Miraim - 婚活男性向け内面スタイリングアプリ

会話形式で親しみやすい認証体験を提供する婚活サポートアプリ

## プロジェクト構成

```
miraim/
├── frontend/              # Next.js フロントエンド
│   ├── app/              # Next.js App Router
│   ├── components/       # Reactコンポーネント
│   ├── types/           # TypeScript型定義
│   ├── utils/           # ユーティリティ関数
│   └── README.md        # フロントエンド詳細
├── backend/             # FastAPI バックエンド
│   ├── main.py         # メインアプリケーション
│   ├── tests/          # テストファイル
│   └── README.md       # バックエンド詳細
└── README.md           # このファイル
```

## 🚀 クイックスタート

### フロントエンド起動

```bash
cd frontend
npm install
npm run dev
```

### バックエンド起動

```bash
cd backend
pip install -r requirements.txt
python main.py
```

## 🎯 主な機能

### 会話フロー型ログイン
- チャット風UIでの新規登録・ログイン
- ステップバイステップの情報収集
- リアルタイムバリデーション
- 音声入力対応

### セキュリティ
- JWT認証
- bcryptパスワードハッシュ化
- 入力値検証
- CORS対策

### デザイン
- オレンジ系グラデーション
- LINEのような親しみやすいUI
- レスポンシブデザイン
- スムーズなアニメーション

## 🛠️ 技術スタック

### フロントエンド
- Next.js 13.5.1
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### バックエンド
- FastAPI
- SQLite (開発用)
- SQLAlchemy
- JWT
- bcrypt

## 📋 開発要件

- Node.js 18+
- Python 3.8+
- npm または yarn

## 🔧 環境設定

### バックエンド環境変数

```bash
cd backend
cp .env.example .env
# .envファイルを編集
```

## 📚 API ドキュメント

バックエンド起動後、以下でAPI仕様を確認できます：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🧪 テスト

### バックエンドテスト

```bash
cd backend
pytest
```

## 📝 開発ガイドライン

### コミット規約
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: スタイル変更
- refactor: リファクタリング
- test: テスト追加・修正

### ブランチ戦略
- main: 本番環境
- develop: 開発環境
- feature/*: 機能開発
- hotfix/*: 緊急修正

## 🚀 デプロイ

### フロントエンド
- Vercel推奨
- 静的エクスポート対応

### バックエンド
- Azure Container Apps対応
- Docker化可能

## 📞 サポート

開発に関する質問や問題がある場合は、Issueを作成してください。

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。