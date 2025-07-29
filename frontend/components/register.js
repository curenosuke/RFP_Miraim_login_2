export default async function register(userData){
    const payload = {
        name:             userData.name,
        email:            userData.email,
        password_hash:    userData.password,        // フロントでは `password` なのでここで合わせる
        birth_date:       userData.birthdate,       // camel → snake
        konkatsu_status:  userData.konkatsuStatus,
        occupation:       userData.occupation ?? "",
        birth_place:      userData.birthplace ?? "",
        location:         userData.location ?? "",
        hobbies:          userData.hobbies ?? "",
        weekend_activity: userData.holidayStyle ?? "",    // holidayStyle → weekend_activity
    };
    console.log(`try to register with ${JSON.stringify(payload)}`);
    const res = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT+'/register', 
        {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(payload),
        }
    );
    return res.json();
}