import { useRouter } from "next/router";
import { useEffect } from "react";

function Users() {
    const router = useRouter()
    useEffect(()=>{
        router.push("/auth/users/page/1")
    },[])
    return ( <></> );
}

export default Users;