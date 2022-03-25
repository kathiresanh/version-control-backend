var express = require('express')
var app = express()
app.use(express.json());
var ObjectId = require('mongodb').ObjectId; 
var cors = require('cors')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = "abcfghk79685";
let options = {
    origin:"*",
    credentials: true,
}

app.use(cors(options))

const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
require('dotenv').config({ path: './secure.env' })
const URL = process.env.URL;



let authenticate = function(req,res,next){
   
    if(req.headers.authorization){
        try {
            let result = jwt.verify(req.headers.authorization,secret)
            if(result){
                next()
            }else{
                res.status(401).json({messae:"token invalid"})
            }
          
        } catch (error) {
            res.status(401).json({message:"token invalid"})
       
        }
     }else{
         res.status(401).json({message:"not authorized"})
     }
 }


app.post("/add-data", async function (req, res) {
    req.body.date = (new Date().toLocaleString())
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("versioncontrol");
        let user = await db.collection("projects").insertOne({ reponame:req.body.reponame,version :[{comment:req.body.comment,content:req.body.content,time:req.body.date,username:req.body.username,email:req.body.email}]})
        connection.close();
        res.json({ message: "created" })
    } catch (error) {
        console.log(error)
    }

})

app.get("/get-data",authenticate,async function (req,res){
       
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("versioncontrol");
        let id = ObjectId(req.body._id)
        let user = await db.collection("projects").find({}).toArray()
        connection.close();
        res.send(user)
    } catch (error) {
        console.log(error)
    }
})

app.get("/load-single-data/:id",authenticate, async function (req,res){
 
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("versioncontrol");
        let id = ObjectId(req.params.id)
        let user = await db.collection("projects").findOne({_id:id})
        connection.close();
       res.send(user)
    } catch (error) {
        console.log(error)
    }
})

app.put("/insert-data/:id",async function(req,res){
   
    let date  = (new Date().toLocaleString())
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("versioncontrol");
        let id = ObjectId(req.params.id)
        let user = await db.collection("projects").findOneAndUpdate({_id:id},{ $push: { version : {comment:req.body.comment,content : req.body.content,time: date,username:req.body.username,email:req.body.email}} })
        connection.close();
        res.send("updated")
      
    } catch (error) {
        console.log(error)
    }
})

app.delete("/delete-repo/:id",authenticate,async function(req,res){
   
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("versioncontrol");
        let id = ObjectId(req.params.id)
        let user = await db.collection("projects").deleteOne({_id:id})
        connection.close();
        res.send("deleted")
      
    } catch (error) {
        console.log(error)
    }
})



// register new customer
app.post("/register",async function(req,res){
    try {
        let salt = await bcrypt.genSalt(10);
        let hash =await bcrypt.hash(req.body.password,salt);
        req.body.password=hash;
        let connection = await mongoClient.connect(URL);
        let db = connection.db("versioncontrol");
        let user = await db.collection("users").findOne({email:req.body.email}) 
        if(user){
           res.status(401).json({message:"no user present"}) 
        }else {
           await db.collection("users").insertOne(req.body);
           res.json({message:"sucessfully registered"})
        } 
       
        connection.close();
      
    } catch (error) {
        console.log(error)
    }
   })


   // login for customer

app.post("/login",async function(req,res){

    try {
        let connection =  await mongoClient.connect(URL);
        let db = connection.db("versioncontrol");
        let user = await db.collection("users").findOne({email:req.body.email})
        if(user){
            let passwordresult = await bcrypt.compare(req.body.password,user.password)
          
            if(passwordresult){
                let token = jwt.sign({userid:user._id},secret,{expiresIn: "1h"})
               
                user.tokens=token;
                res.json(user)
              
            }else{
              
                res.status(401).json({message:"user id or password invalid"})
            }
        }else{
            res.status(401).json({message:"no user present"})
        }
    } catch (error) {
        console.log(error)
    }
})

app.put("/forgot-password",async function(req,res){
    
    try {
        let salt = await bcrypt.genSalt(10);
        let hash =await bcrypt.hash(req.body.password,salt);
        req.body.password=hash;
        let connection =  await mongoClient.connect(URL);
        let db = connection.db("versioncontrol");
        let user = await db.collection("users").findOne({email:req.body.email});
        if(user){
            let user = await db.collection("users").findOneAndUpdate({email:req.body.email},{$set: {password: hash}});
            res.send("password updated")
        }else{
            res.send("No user exists")
        }
       
        connection.close()
      
    } catch (error) {
        console.log(error)
    }

})

app.listen(process.env.PORT || 3003)
