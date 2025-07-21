-- Miraim データベーススキーマ
-- MySQL 8.0用

CREATE DATABASE IF NOT EXISTS miraim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE miraim;

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT 'ユーザー名（ニックネーム可）',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'メールアドレス',
    password_hash VARCHAR(255) NOT NULL COMMENT 'ハッシュ化されたパスワード',
    age INT COMMENT '年齢',
    occupation VARCHAR(100) COMMENT '職業',
    konkatsu_status ENUM('beginner', 'experienced', 'returning') COMMENT '婚活状況',
    location VARCHAR(100) COMMENT '居住地域',
    hobbies VARCHAR(500) COMMENT '趣味・興味',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ユーザー情報テーブル';

-- ログインセッションテーブル（オプション）
CREATE TABLE IF NOT EXISTS login_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ログインセッション管理テーブル';

-- ログイン試行履歴テーブル（セキュリティ用）
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email_ip (email, ip_address),
    INDEX idx_attempted_at (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ログイン試行履歴テーブル';

-- サンプルデータ（開発用）
INSERT INTO users (name, email, password_hash, age, occupation, konkatsu_status, location, hobbies) VALUES
('田中太郎', 'tanaka@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/SJx/6tZMu', 28, 'エンジニア', 'beginner', '東京都', 'プログラミング、読書'),
('佐藤花子', 'sato@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/SJx/6tZMu', 25, '営業', 'experienced', '大阪府', '映画鑑賞、料理');