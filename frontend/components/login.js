export default async function login(email, password){
    console.log(`try to login with ${email} and ${password}`);
    const res = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT+'/login', 
        {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({email, password}),
        }
    );
    
    if (res.ok) {
        const data = await res.json();
        return { success: true, data };
    } else {
        const errorData = await res.json();
        return { 
            success: false, 
            error: errorData.detail || 'ログインに失敗しました'
        };
    }
}