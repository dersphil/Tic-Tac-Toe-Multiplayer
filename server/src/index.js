import express from "express"
import cors from "cors"
import {StreamChat} from "stream-chat"
import {v4 as uuidv4} from "uuid"
import bcrypt from "bcrypt"
import dotenv from "dotenv"

dotenv.config()

const APIKEY = process.env.APIKEY
const SECRET = process.env.SECRET

const app = express()

app.use(cors())
app.use(express.json())

const serverClient = StreamChat.getInstance(APIKEY,SECRET)


//routes

app.get('/',(req,res)=>{
    res.send('home')
})

app.post('/signup',async (req,res)=>{
    try{
        const {firstName,lastName,username,password} = req.body
        const userId = uuidv4()
        const hashedPassword = await bcrypt.hash(password,10)
        const token = serverClient.createToken(userId)
        await serverClient.upsertUser({
            id: userId,
            name: username, // Assuming username is used as the name in Stream Chat
            firstName,
            lastName,
            hashedPassword // You may not need to store hashedPassword in Stream Chat, it depends on your requirements
            // Additional user data can be provided here
        });
        res.json({token,userId,firstName,lastName,username,hashedPassword})
    }catch(err){
        console.log(err)
        res.json(err)
    }
})

app.post('/login', async (req,res)=>{
    try{
        console.log('APPLE')
        const {username,password} = req.body
        const {users} = await serverClient.queryUsers({})
        console.log(username,password)
        console.log(users)
        if(users.length==0){
            console.log('here')
            return res.json({message:"user not founc"})
        }
        
        const passwordMatch = await bcrypt.compare(password,users[0].hashedPassword)
        //const token = users[0].token
        const token = serverClient.createToken(users[0].id)
        
        if(passwordMatch){
            console.log('correct!')
            res.json({token,firstName:users[0].firstName,lastName:users[0].lastName,userId : users[0].id})
        }
        else{
            console.log('wrong')
            res.json({message:"incorrect password"})
        }
    }catch(err){
        console.log(err)
        res.json({err})
    }
})


app.listen(3001, () =>{
    console.log('Server Running on Port 3001')
})


