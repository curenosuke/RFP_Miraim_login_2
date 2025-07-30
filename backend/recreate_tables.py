from sqlalchemy import text
from connect_MySQL import engine
from crud import Base

def recreate_tables():
    """テーブルを削除して再作成する"""
    with engine.connect() as conn:
        try:
            # 既存のテーブルを削除
            conn.execute(text("DROP TABLE IF EXISTS users"))
            conn.commit()
            print("既存のテーブルを削除しました")
            
            # 新しいテーブルを作成
            Base.metadata.create_all(engine)
            print("新しいテーブルを作成しました")
            
        except Exception as e:
            print(f"テーブル再作成エラー: {e}")
            conn.rollback()

if __name__ == "__main__":
    recreate_tables() 