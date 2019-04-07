var express = require("express");
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var app = express();
var server = app.listen(4000);
var socket = require('socket.io');
var io= socket(server);
var nodemailer = require('nodemailer');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var config = require('./config/database');

//Connecting to database
mongoose.connect(config.database)
var db = mongoose.connection;

//check if open
db.once('open',function(){
    console.log('opened');
    
})

//check for errors
db.on('error',function(err){
    console.log(err);
    
})

var Friend = require('./models/friends');
var User = require('./models/user');
var Msg = require('./models/message');
var Room = require('./models/room');

//All ejs(HTML) are here
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'public')));

//session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUnitialized: true,
    
}));
//express messages middleware
app.use(require('connect-flash')());
app.use(function(req,res,next){
   res.locals.messages = require('express-messages')(req,res);
   next();
});

//express-validator
app.use(expressValidator({
    errorformatter: function(param, msg , value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
        while(namespace.length){
            formParam + '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value: value
        };
    }
})); 

//passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.get('*',function(req,res,next){
    res.locals.user = req.user || null;
    next();
})


//Login
app.get("/",ensureNotAuthenticated,function(req, res){
    res.render('login');
});
app.post("/",ensureNotAuthenticated,function(req,res,next){
   passport.authenticate('local',{
       successRedirect: '/home',
       failureRedirect:'/',
       failureFlash: true
   })(req,res,next); 
});

//Register page
//username and email id and phone number must be unique
app.get("/register",ensureNotAuthenticated,function(req, res){
    req.flash('success','Registration Successful');
    res.render('register');
});

app.post("/register",ensureNotAuthenticated,function(req,res){
 var name = req.body.name;
 var username =req.body.username; 
 var phone = req.body.phone;
 var email = req.body.email;
 var password = req.body.password; 
 var password2 = req.body.password2;
    
req.checkBody('name','Name cannot be empty').notEmpty(); 
req.checkBody('username','Username cannot be empty').notEmpty(); 
req.checkBody('phone','Phone cannot be empty').notEmpty(); 
req.checkBody('email','Email cannot be empty').notEmpty();
req.checkBody('password','Password cannot be empty').notEmpty();
req.checkBody('password2','Passwords do not match').equals(req.body.password);
let errors = req.validationErrors();
    if(errors){
        res.render('register',{errors:errors});
        
    }
    
    else{
        let frnd = new Friend({
            friends:[],
            requestTo:[]
        });
        // frnd.save();
        let user = new User({
            name:name,
            username: username,
            email:email,
            phone: phone,
            password:password,
            friends:frnd
            
        });
        User.findOne({username:username},function(err,user1){
            if(user1){
                req.flash('success','Username already exists');
                res.render("register");
            }
            else{
                User.findOne({email:email},function(err,user2){
                  if(user2){
                req.flash('success','Email-id already registered');
                res.render("register");
            }
                  else{
                      User.findOne({phone:phone},function(err,user3){
                          if(user3){
                              req.flash('success','Phone number already registered');
                              res.render("register");
                          }
                          else{
                           frnd.save();
                           user.save(function(err){
                           if(err){
                               console.log(err);
                               return;
                           } 
                           else{
                               req.flash('success','You are now registered and can log in');
                               res.redirect("/");
                           }  }); 
                          }
                      });
            
                  }
                });
            }
      
        });
        
    }
});

//home
app.get("/home",ensureAuthenticated,function(req,res){
    var f= req.user.friends;
    Friend.findOne({_id:f},function(err,frn){
       if(err){
           console.log(err);
       } 
       else{
           res.render("home",{friends:frn,user:req.user});
       }
    });
    
});

//logout
app.get("/logout",ensureAuthenticated,function(req,res){
    req.logout();
    req.flash('success','you are now logged out');
    res.redirect('/');
});

//forgot password
app.get("/forgot",function(req,res){
res.render("forgot");    
});

app.post("/forgot",function(req,res){
    user = req.body.user;
    //get mail id and mail
    User.findOne({username:user},function(err,userr){
      if(!userr){
          console.log("user doesn't exist");
      } 
      else{
          
         mail=userr.email;
         var transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
                    user: 'webchatportal@gmail.com',
                    pass: 'Chat4web*'
                  },
            tls: {
                rejectUnauthorized: false
                 }
         });
        let HelperOptions = {
            from: 'Web Chat Portal <webchatportal@gmail.com>',
            to: mail,
            subject: 'Forgot Password',
            //CHANGE TO LINK HERE
            text: "Your password is " + userr.password
        };

        transporter.sendMail(HelperOptions,function(err,res){
            if(err)
                return console.log('Error');
            else{
               // console.log('Sent');
            }
        });
        }
       
   });
    res.redirect("/");
    
});

//chat page
app.get("/each/:name",ensureAuthenticated,function(req,res){
  //get room name for private   
  query2 = {"$and":[{group:false},{"$and":[{users:req.user.username},{users:req.params.name}]}]}
  Room.findOne(query2,function(err,go){
      if(err) 
          console.log(err);
      else{
         
           //Gets the messages
   query1 = {"$and":[{"$or":[{from:req.user.username} , {from:req.params.name}]},{$or:[{to:req.params.name},{to:req.user.username}]}]};
   Msg.find(query1,function(err,items){
            if(err){
                console.log(err);
                   }
            else{
                res.render('each',{to:req.params.name,me:req.user.username,items:items,user:req.user,roome:go._id});
            }});
      }
  });
   
  
});

//Group chat page
app.get("/groupchat/:name",ensureAuthenticated,function(req,res){
    Msg.find({to:req.params.name},function(err,rest){
       if(err)
           console.log(err);
        else{
            res.render("groupchat",{name:req.params.name,me:req.user.username,items:rest});
        }
    });
    
    
});

app.get("/friends/:name",ensureAuthenticated,function(req,res){
    
    User.findOne({username:req.params.name},function(err,userr){
        if(err){
            console.log(err);
        }
        else{
        mail=userr.email;
        //console.log(mail);
         var transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
                    user: 'webchatportal@gmail.com',
                    pass: 'Chat4web*'

                },
            tls: {
                rejectUnauthorized: false
                }
    });
let HelperOptions = {
	from: 'WebChatPortal <webchatportal@gmail.com>',
	to: mail,
    subject: 'Friend request',
    html: req.user.username +'<p>Sent you a friend request.<a href="http://localhost:4000/accept/?sender='+req.user.username+'&recv='+userr.username+'">Click here to accept it</a><br/><a href="http://localhost:4000/decline/?sender='+req.user.username+'&recv='+userr.username+'">Click here to decline it</a></p>' 
};

transporter.sendMail(HelperOptions,function(err,res){
    if(err)
        return console.log('Error');
    else{
        console.log('Sent');
    }
});
        }
    
});
Friend.findOne({_id:req.user.friends},function(err,upu){
    if(err)
        console.log(err);
    else
        {
            upu.requestTo.push(req.params.name);
            upu.save();
        }
});
    
//console.log(req.params.name);


req.flash('success',"Request has been sent to "+req.params.name);
res.redirect("/home");
});

//friend requests
//accept
app.get("/accept",function(req,res){
   send = req.query.sender;
   recv = req.query.recv;
   //console.log(send,recv);
   User.findOne({username:send},function(err,kop){
      if(err)
          console.log(err);
      else{
          Friend.findByIdAndUpdate(kop.friends,{$addToSet:{friends:recv}},function(err,rd){
              if(err)
                  console.log(err);
    
          });
          Friend.findByIdAndUpdate(kop.friends,{$pull:{requestTo:recv}},function(err,rd){
              if(err)
                  console.log(err);
          })
      
   }});
    User.findOne({username:recv},function(err,kop){
      if(err)
          console.log(err);
      else{
          Friend.findByIdAndUpdate(kop.friends,{$addToSet:{friends:send}},function(err,kpop){
              if(err)
                  console.log(err);
          });
          //ADD CONDITION HERE
             room = new Room({users:[send,recv]},function(err,sup){
       if(err)
           console.log(err);
   });
   room.save();
      }
   });

    
    req.flash('success',"You are now connected to "+send+".Login to continue");
    res.redirect("/");
});

//decline
app.get("/decline",function(req,res){
   send = req.query.sender;
   recv = req.query.recv;
   User.findOne({username:send},function(err,lull){
      if(err)
          console.log(err);
      else{  console.log(lull.friends);
             Friend.findByIdAndUpdate(lull.friends,{$pull:{requestTo:recv}},function(err,kj){
                 if(err)
                     console.log(err);
                 else{
                     //console.log(kj);
                 }
             });
          
            req.flash('success',send+"'s request has been rejected. Login to continue");
            res.redirect("/");
          
      }
   });
 
});
//Inviting friends
app.get("/invite",ensureAuthenticated,function(req,res){
   res.render('invite',{user:req.user.name}); 
});

app.post("/invite",ensureAuthenticated,function(req,res){
    mail=req.body.mail;
    name = req.body.nam;
    //console.log(mail,name);
         var transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
                    user: 'webchatportal@gmail.com',
                    pass: 'Chat4web*'

                },
            tls: {
                rejectUnauthorized: false
                }
    });
let HelperOptions = {
	from: 'WebChatPortal <webchatportal@gmail.com>',
	to: mail,
    subject: 'Invite to Web Chat Portal',
    html: name +'<p>Sent you an invite.<a href="http://localhost:4000/register">Click here to accept it</a></p>' 
};

transporter.sendMail(HelperOptions,function(err,res){
    if(err)
        return console.log('Error');
    else{
        console.log('Sent');
    }
});
res.redirect("/home");      
});

//New group
app.get('/group',ensureAuthenticated,function(req,res){
   Friend.findOne({_id:req.user.friends},function(err,frn){
       if(err){
           console.log(err);
       } 
       else{
           res.render("group",{friends:frn.friends});
       }
    });
  
});

//delete messages
app.get("/delete",ensureAuthenticated,function(req,res){
    console.log(req.query.id,req.query.name,req.query.type);
    Msg.deleteOne({_id:req.query.id},function(err,mes){
       if(err)
           console.log(err);
       else{
           res.redirect("/"+req.query.type+"/"+req.query.name);
       }
    });
});

app.post('/group',ensureAuthenticated,function(req,res){
   // console.log(Array.isArray(req.body.list));
    if(Array.isArray(req.body.list) && req.body.list.length >= 2)
      {
        req.body.list.push(req.user.username); 
        room=new Room({name:req.body.grpname,admin:req.user.username,users:req.body.list,group:true})
       room.save();
        req.user.group.push(req.body.grpname);
        for(i=0;i<req.body.list.length;i++){
           User.findOne({username:req.body.list[i]},function(err,koie){
              if(err)
                  console.log(err);
               else{
                   koie.group.push(req.body.grpname);
                   koie.save();
               }
           });
        }
        req.flash("success","Group "+req.body.grpname+" has been created");
        res.redirect("/home");
    }
    else  {
            req.flash('error','Minimum number of users is 3');
            res.redirect("/group");
        }
   
});
//Exit group
app.get("/exit",ensureAuthenticated,function(req,res){
   grpname=req.query.grp;
   use = req.query.name;
   Room.findOne({name:grpname},function(err,natasha){
       if(err){
           console.log(err);
       }
       else{
           Room.findByIdAndUpdate(natasha._id,{$pull:{users:use}},function(errr,hulk){
            if(errr)console.log(errr);
           });
       }
   });
     User.findOne({username:use},function(err,blackwidow){
       if(err){
           console.log(err);
       }
       else{
           User.findByIdAndUpdate(blackwidow._id,{$pull:{group:grpname}},function(errr,banners){
            if(errr)console.log(errr);
            else{
                res.redirect("/home");
            }
           });
       }
   });
   
   
});

//Access Control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('Please login');
        res.redirect('/');
    }
    }
function ensureNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        req.flash('You are already logged in')
        res.redirect('/home');
    }
    else{
        return next();
    }
    }

//Sockets

io.of('/chat').on('connection',function(socket){ 
       
       socket.on("joinRoom",function(data){
          socket.join(data.room); 
          // console.log("connection made");
       });
       socket.on('private',function(data,fn){
            msf = new Msg();
            msf.from = data.from;
            msf.to = data.to;
            msf.body = data.message;
            msf.msgtype=data.type;
            msf.save(function(err,thanos){
                if(err)
                    console.log(err);
                else{
                    fn(thanos);
             socket.to(data.room).emit('private',{from:thanos.from,body:thanos.body,msgtype:thanos.mstype,createdAt:thanos.createdAt});
                }
            });
            
            
       });
       socket.on('typing',function(data){
           //console.log(data.from);
          socket.to(data.room).emit('typing',{from:data.from}); 
       });
   });

io.of('/group').on('connection',function(socket){ 
       
       socket.on("joinRoom",function(data){
          socket.join(data.room); 
           //console.log("connection made");
       });
       socket.on('private',function(data,luck){
            msf = new Msg();
            msf.from = data.from;
            msf.to = data.room;
            msf.body = data.message;
            msf.msgtype=data.type;
            msf.save(function(err,hawkeye){
                if(err)
                    console.log(err);
                else{
                    console.log(hawkeye);
                    luck(hawkeye);
                    socket.to(data.room).emit('private',{from:hawkeye.from,body:hawkeye.body,msgtype:hawkeye.mstype,createdAt:hawkeye.createdAt});
                }
            });
            
            
       });
       socket.on('typing',function(data){
          socket.to(data.room).emit('typing',{from:data.from}); 
       });
      
   });
    
   
io.on('connection',function(socket){
socket.on('search',function(data){
     // console.log(data.qtext);
      User.find({username:{$regex:data.qtext,$options:"i"}},function(err,ser){
          //console.log(ser);
          socket.emit("search",{res:ser});
      });
    });
    
});
    

