from sqlalchemy import text
from connect_MySQL import engine

def update_schema():
    """データベースのスキーマを更新する"""
    with engine.connect() as conn:
        try:
            # konkatsu_statusカラムの型をVARCHAR(50)に変更
            conn.execute(text("""
                ALTER TABLE users 
                MODIFY COLUMN konkatsu_status VARCHAR(50) NOT NULL
            """))
            conn.commit()
            print("スキーマの更新が完了しました")
        except Exception as e:
            print(f"スキーマ更新エラー: {e}")
            conn.rollback()

if __name__ == "__main__":
    update_schema() 