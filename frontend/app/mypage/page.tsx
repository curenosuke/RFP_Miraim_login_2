'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import fetchMyPage from './fetchMyPage';

interface MyPageData {
  id: string;
  name: string;
  email: string,
  birth_date: string;
  konkatsu_status: string;
  occupation: string;
  birth_place: string;
  location: string;
  hobbies: string;
  weekend_activity: string;
}

export default function HomePage() {
    const [data, setData] = useState<MyPageData | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchMyPage()
        .then((userData: MyPageData) => {
            setData(userData);
        })
        .catch((err: any) => {
            console.error(err);
            alert('認証に失敗しました。ログインページへ移動します。');
            router.push('/');
        });
    }, [router]);

    if (!data) {
        return <div>読み込み中...</div>;
    }
    return(
        <div>
            <div>マイページ</div>
            <p>ユーザーID：{data.id}</p>
            <p>メールアドレス：{data.email}</p>
            <p>生年月日：{data.birth_date}</p>
            <p>婚活ステータス：{data.konkatsu_status}</p>
            <p>職業：{data.occupation}</p>
            <p>出身地：{data.birth_place}</p>
            <p>現在地：{data.location}</p>
            <p>趣味：{data.hobbies}</p>
            <p>週末の過ごし方：{data.weekend_activity}</p>
        </div>
    );
}