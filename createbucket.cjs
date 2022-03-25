const AWS = require("aws-sdk")
var express = require('express')
var app = express()
app.use(express.json());

app.post("/create",function(req,res){
  const s3 = new AWS.S3()
/* The following example creates a bucket. */
console.log(req.body.name)
var params = {
    Bucket: req.body.name,
   };
   s3.createBucket(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     res.send(data);           // successful response
     /*
     data = {
      Location: "/examplebucket"
     }
     */
   });
})

app.post("/check",function(req,res){
  res.send("message received")
  console.log(req.body)
})

app.delete("/delete",function (req,res){
  const s3 = new AWS.S3()
  var params = {
    Bucket: req.body.name
   };
   s3.deleteBucket(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     res.send(data);           // successful response
   });
})


app.get("/list",function(req,res){
  const s3 = new AWS.S3()
  var params ={}
   s3.listBuckets(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     res.send(data);           // successful response
   });
})

app.get("/get-bucketlocation",function(req,res){
  const s3 =  new AWS.S3()
  /* The following example returns bucket location. */

 var params = {
  Bucket: req.body.name
 };
 s3.getBucketWebsite(params,  function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   /*
   data = {
    LocationConstraint: "us-west-2"
   }
   */
 });
})

app.listen(3000,()=>{console.log("server listening on port 3000")})