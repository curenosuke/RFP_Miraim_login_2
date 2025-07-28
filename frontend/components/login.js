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
    return res.json();
}