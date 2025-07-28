export default async function fetchMyPage() {
    console.log("This is me ANDPOINT");
    const res = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT+'/me', 
        {
            method: 'GET',
            credentials: 'include',  // Cookie を送信
            headers: {
            'Content-Type': 'application/json',
            },
        }
    );

    if (!res.ok) {
        throw new Error('認証に失敗しました');
    }

  return res.json();
}