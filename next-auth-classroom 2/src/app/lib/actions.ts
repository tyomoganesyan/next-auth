"use server"

import { OptionalUser } from "./types"
import { nanoid } from "nanoid"
import bcrypt from 'bcrypt'
import { addUser, getUserByLogin } from "./api"
import { redirect } from "next/navigation"
import { createAuthSession, destroySession } from "./auth"

export const handleSignup = async (prev: unknown, data: FormData) => {

    if (!data.get('name') || !data.get('surname')) {
        return {
            message: "Please fill all the fields"
        }
    }

    const found = getUserByLogin(data.get('login') as string)
    if (found) {
        return {
            message: "Login is busy!"
        }
    }

    const user: OptionalUser = {
        id: nanoid(),
        name: data.get('name') as string,
        surname: data.get('surname') as string,
        login: data.get('login') as string,
    }

    user.password = await bcrypt.hash(data.get('password') as string, 10)
    console.log(addUser(user))
    redirect("/login")

}
let count = 0
let then: number


export const handleLogin = async (prev: unknown, data: FormData) => {

    if (!data.get('login') || !data.get('password')) {
        return {
            message: "please fill all the fields"
        }
    }
    
    let login = data.get('login') as string
    let password = data.get('password') as string
    let user = getUserByLogin(login)

    if (!user) {
        return {
            message: "the login is incorrect!"
        }
    }

    const now = new Date().getMinutes()
    if(now-then<3) {
            return {
                message:"youre blocked for 3 mins"
            }
    } 

    let match = await bcrypt.compare(password, user.password)
    if (!match) {
        return {
            message: "password is wrong!!"
        }
    }
    if (user?.login == login && !match) {
        count++
    }

    else if (user?.login == login && match && count<3) {
        count = 0
    }
    
    if (count == 3) {
        then = new Date().getMinutes()
        console.log(then, "then")
        count = 0 
        return {
            message: "you are blocked for 3 mins"
        }
    }
    

    await createAuthSession(user.id)
    count = 0
    redirect("/profile")
}

export const handleLogout = async () => {
    await destroySession()
    redirect("/login")
}