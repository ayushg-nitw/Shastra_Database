const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const path= require("path");
const express= require("express");
const app = express();
const methodOverride= require("method-override");
const { v4: uuidv4 } = require("uuid");
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password:'Ayush123!@#'
});

app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));


let getRandomUser = ()=>{
  return [
     faker.string.uuid(),
     faker.internet.userName(),
     faker.internet.email(),
     faker.internet.password(),
      ];
  };

//way 1 (Not used)
// const q=
// `CREATE TABLE user(
//    userId VARCHAR(50) PRIMARY KEY,
//    username VARCHAR(50) UNIQUE,
//    email VARCHAR(50) UNIQUE NOT NULL,
//    password VARCHAR(50) NOT NULL
// );`;   // we can use schema.sql file and write same thing and run in mysql environment.

//Insertion of data's Manually;
// let q="INSERT INTO user (userId,username,email,password) VALUES ?";
// let users=[
//   ["ayush7489","ayushg","ayush@gmail.com","Ayush123!@#"],
//   ["aman8981","amanraj","amanr456@gmail.com","Aman123!@#"],
//   ["heramb412","herambr","heramb@gmail.com","Heramb123!@#"]
//      ];

//main way to enter the data into database

// let q="INSERT INTO user (userId,username,email,password) VALUES ?";
// let data=[];
// for(let i=1;i<50;i++){
//     data.push(getRandomUser());
// }

// try{
// connection.query(q,[data],(err,result)=>{
//   if(err) throw err;
//   console.log(result);
//   });
// }
// catch(err){
//   console.log(err);
// }

//show total users
app.get("/",(req,res)=>{

  let q=`SELECT count(*) FROM user`;
 try{
connection.query(q,(error,result)=>{
  if(error) throw error;
  let count= result[0]["count(*)"];
  res.render("show.ejs",{count});
  });
}
catch(error){
  console.log(error);
 res.send("Error to Load Data");
 }
});

//  show all users details
app.get("/users",(req,res)=>{

  let q=`SELECT * FROM user`;
 try{
connection.query(q,(error,users)=>{
  if(error) throw error;
  res.render("users.ejs",{users});
  });
}
catch(error){
  console.log(error);
 res.send("Error to Load Data");
 }
});

//edit username
app.get("/users/:id/edit",(req,res)=>{
  let {id}=req.params;
  let q=`select * from user where userId="${id}";`;
  try{
    connection.query(q,(error,result)=>{
      if(error) throw error;
      let user=result[0];
      res.render("edit.ejs",{user});
      });
    }
    catch(error){
      console.log(error);
     res.send("Error to Load Data");
     }
});

//  update username patch request
app.patch("/users/:id",(req,res)=>{
  let {id}=req.params;
  let {password:formpass,username:newuser} =req.body;
  let q=`select * from user where userId="${id}";`;
  try{
    connection.query(q,(error,result)=>{
      if(error) throw error;
      let user=result[0];
      if(formpass!=user.password){
        res.send("WRONG password Entered");
    }
      else{
        let q=`UPDATE user SET username='${newuser}' where userId='${id}'; `;
        try{
          connection.query(q,(error,result)=>{
            if(error) throw error;
            res.redirect("/users");
            });
          }
          catch(error){
           res.send(error);
           }
      }
      });
    }
    catch(error){
      console.log(error);
     res.send("Error to Load Data");
     }
});

app.get("/users/:id/delete",(req,res)=>{
  let {id}=req.params;
  let q=`select * from user where userId="${id}";`;
  try{
    connection.query(q,(error,result)=>{
      if(error) throw error;
      let user=result[0];
      res.render("delete.ejs",{user});
      });
    }
    catch(error){
      console.log(error);
     res.send("Error to Load Data");
     }
});

app.patch("/users/:id/remove",(req,res)=>{
  let {id}=req.params;
  let {username:formuser,password:formpass} =req.body;
  let q=`select * from user where userId="${id}";`;
  try{
    connection.query(q,(error,result)=>{
      if(error) throw error;
      let user=result[0];
      if(formpass==user.password && formuser==user.username){
        let q=`DELETE FROM user WHERE userId='${id}'; `;
        try{
          connection.query(q,(error,result)=>{
            if(error) throw error;
           res.render("thanks.ejs",{user});
            });
          }
          catch(error){
            res.send(error);
           }
      }
      else{
        res.send("Wrong details Entered !");
       }
      });
  }
    catch(error){
      console.log(error);
     res.send("Error to Load Data");
     }
});

//new user adding

 app.get("/users/newuser",(req,res)=>{
    res.render("add.ejs");
 });

 app.post("/users/newuser", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO user (userId, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.redirect("/users");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

app.listen(8080,(res,req)=>{
  console.log("Server is Listening to port 8080");
});


