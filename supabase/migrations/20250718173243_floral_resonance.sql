@@ .. @@
--- Miraim データベーススキーマ
--- MySQL 8.0用
-
-CREATE DATABASE IF NOT EXISTS miraim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-USE miraim;
+-- Miraim データベーススキーマ
+-- SQLite用
 
 -- ユーザーテーブル
 CREATE TABLE IF NOT EXISTS users (
@@ .. @@
     password_hash VARCHAR(255) NOT NULL COMMENT 'ハッシュ化されたパスワード',
     age INTEGER COMMENT '年齢',
     occupation VARCHAR(100) COMMENT '職業',
-    konkatsu_status ENUM('beginner', 'experienced', 'returning') COMMENT '婚活状況',
+    konkatsu_status VARCHAR(50) COMMENT '婚活状況',
     location VARCHAR(100) COMMENT '居住地域',
     hobbies VARCHAR(500) COMMENT '趣味・興味',
-    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
-    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
-    
-    INDEX idx_email (email),
-    INDEX idx_created_at (created_at)
-) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ユーザー情報テーブル';
+    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
+    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
+);
+
+CREATE INDEX IF NOT EXISTS idx_email ON users(email);
+CREATE INDEX IF NOT EXISTS idx_created_at ON users(created_at);
 
 -- ログインセッションテーブル（オプション）
 CREATE TABLE IF NOT EXISTS login_sessions (
@@ .. @@
     token_hash VARCHAR(255) NOT NULL,
-    expires_at TIMESTAMP NOT NULL,
-    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-    
-    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
-    INDEX idx_user_id (user_id),
-    INDEX idx_expires_at (expires_at)
-) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ログインセッション管理テーブル';
+    expires_at DATETIME NOT NULL,
+    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
+    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
+);
+
+CREATE INDEX IF NOT EXISTS idx_user_id ON login_sessions(user_id);
+CREATE INDEX IF NOT EXISTS idx_expires_at ON login_sessions(expires_at);
 
 -- ログイン試行履歴テーブル（セキュリティ用）
 CREATE TABLE IF NOT EXISTS login_attempts (
@@ .. @@
     email VARCHAR(255) NOT NULL,
     ip_address VARCHAR(45) NOT NULL,
-    success BOOLEAN NOT NULL DEFAULT FALSE,
-    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-    
-    INDEX idx_email_ip (email, ip_address),
-    INDEX idx_attempted_at (attempted_at)
-) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ログイン試行履歴テーブル';
+    success INTEGER NOT NULL DEFAULT 0,
+    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
+);
+
+CREATE INDEX IF NOT EXISTS idx_email_ip ON login_attempts(email, ip_address);
+CREATE INDEX IF NOT EXISTS idx_attempted_at ON login_attempts(attempted_at);
 
 -- サンプルデータ（開発用）
 INSERT INTO users (name, email, password_hash, age, occupation, konkatsu_status, location, hobbies) VALUES
-('田中太郎', 'tanaka@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/SJx/6tZMu', 28, 'エンジニア', 'beginner', '東京都', 'プログラミング、読書'),
-('佐藤花子', 'sato@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/SJx/6tZMu', 25, '営業', 'experienced', '大阪府', '映画鑑賞、料理');
+('田中太郎', 'tanaka@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/SJx/6tZMu', 28, 'エンジニア', 'beginner', '東京都', 'プログラミング、読書'),
+('佐藤花子', 'sato@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/SJx/6tZMu', 25, '営業', 'experienced', '大阪府', '映画鑑賞、料理');