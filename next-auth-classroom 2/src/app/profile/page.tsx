import { redirect } from "next/navigation"
import { verifyAuth } from "../lib/auth"
import { getUserById } from "../lib/api"
import { handleLogout } from "../lib/actions"

export default async function Profile() {

    const result = await verifyAuth()
    if (!result.user) {
        redirect("/login")
    }

    const user = getUserById(result.user.id)
    return <div className="p-6">
        <h1 className="is-size-1">{user.name} {user.surname}</h1>

        <form action={handleLogout}>
            <button className="button is-danger">Logout</button>
        </form>
    </div>
}