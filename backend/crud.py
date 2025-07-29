import sqlalchemy
from sqlalchemy import VARCHAR, Integer, Date, Enum, TIMESTAMP, CHAR, insert, delete, update, select, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from connect_MySQL import engine

# テーブル(model)の定義
class Base(DeclarativeBase):
    pass

class Users(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    email: Mapped[str] = mapped_column(VARCHAR(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    birth_date: Mapped[Date] = mapped_column(Date, nullable=False)
    konkatsu_status: Mapped[str] = mapped_column(Enum('beginner', 'experienced', 'returning'), nullable=False)
    occupation: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    birth_place: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    location: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    hobbies: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
    weekend_activity: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
    created_at: Mapped[TIMESTAMP] = mapped_column(TIMESTAMP, default=sqlalchemy.func.now())
    updated_at: Mapped[TIMESTAMP] = mapped_column(TIMESTAMP, default=sqlalchemy.func.now(), onupdate=sqlalchemy.func.now())

def insert_user(mytable, values):
    Session = sessionmaker(bind=engine)
    session = Session()

    query = insert(mytable).values(values)

    try:
        with session.begin():
            result = session.execute(query)
    except sqlalchemy.exc.IntegrityError:
        print("一意制約違反により、挿入に失敗しました")
    
    session.close()
    return 'item inserted'

def find_user(email, password):
    Session = sessionmaker(bind=engine)
    session = Session()

    query = select(Users.id).where(Users.email == email, Users.password_hash == password)
    
    try:
        with session.begin():
            user_id = session.execute(query).scalars().first()
    except sqlalchemy.exc.IntegrityError:
        print("一意制約違反により、挿入に失敗しました")

    session.close()
    return {"id": user_id} if user_id else None

def get_user_by_id(user_id):
    Session = sessionmaker(bind=engine)
    session = Session()

    query = select(Users).where(Users.id == user_id)

    try:
        with session.begin():
            user_info = session.execute(query).scalar_one_or_none()
    except sqlalchemy.exc.IntegrityError:
        print("一意制約違反により、挿入に失敗しました")

    user_dict = {
        "id": user_info.id,
        "name": user_info.name,
        "email": user_info.email,
        "birth_date": user_info.birth_date.isoformat() if user_info.birth_date else None,
        "konkatsu_status": user_info.konkatsu_status,
        "occupation": user_info.occupation,
        "birth_place": user_info.birth_place,
        "location": user_info.location,
        "hobbies": user_info.hobbies,
        "weekend_activity": user_info.weekend_activity,
        "created_at": user_info.created_at.isoformat(),
        "updated_at": user_info.updated_at.isoformat()
    }
    session.close()
    return user_dict
