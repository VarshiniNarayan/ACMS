var message = document.getElementById('message');
var send = document.getElementById('send');
var feedback = document.getElementById('feedback');
var output = document.getElementById("output");
var to = document.getElementById("to");
var socket = io.connect("http://localhost:4000/chat");
var x= document.getElementById("mme");
var f = document.getElementById("imme");
var img = document.getElementById("img");
var imd = null;
var gt = document.getElementById("gt");


// To load the image 
var psych = function(event){
   var file = event.target;
    if(file.files[0]){
       reader = new FileReader();
       reader.onload = function(event){
       gt.innerHTML="<img src='"+event.target.result+"'/>";
       imd=event.target.result;
        };
     reader.readAsDataURL(file.files[0]);
    }
    else{
        imd = null;
        gt.innerHTML="<input type='text' id='message'/>"; 
        message=document.getElementById('message');
    }
};
data='';
socket.emit('joinRoom',{room:f.value});
send.addEventListener("click",function(){
 message=document.getElementById('message');
    if(message!=null && message.value!=''){
        socket.emit('private',{
           from:x.value,
           to:to.value,
           message: message.value,
           room:f.value,
           type:'text'
      
         },function(data){
           console.log(data);
           window.data=data;
     });
     setTimeout(function(){
     console.log("here",message.value);
     if(data){
     output.innerHTML+= "<div id='one'>"+x.value+"<br/>"+message.value+"<br/><span><img src='/delvd.png' height='20px' width='20px'/></span><a href='/delete/?id="+data._id+"&name="+data.to+"&type=each'><img src='/delete.jpg' height='20px' width='20px' id='del'/></a></div>" ;
     //Change data.createdAt
     }
     else{
         output.innerHTML+= "<div id='one'>"+x.value+"<br/>"+message.value+"<br/>undelivered</div>" ;
     }
     message.value='';
     },400);
     
     data='';
    }
    else if(imd!=null){
        socket.emit('private',{
           from:x.value,
           to:to.value,
           message: imd,
           room:f.value,
           type:'img'
      },function(data){
           window.data=data;
     });
    setTimeout(function(){
    if(data){
     output.innerHTML+= "<div id='one'>"+x.value+"<br/><img src='"+imd+"'  id='op'/><span><img src='/delvd.png'id='e'' height='20px' width='20px'/></span><a href='/delete/?id="+data._id+"&name="+data.to+"&type=each'><img src='/delete.jpg' height='20px' width='20px' id='del'/></a></div>";
     }
    else{
         output.innerHTML+= "<div id='one'>"+x.value+"<br/><img src='"+imd+"' height='180px' width='450px'/><br/>undelivered</div>" ;
     }
        
     imd=null;
     img.value=null;
     gt.innerHTML="<input type='text' id='message'/>"; 
     data='';
    },500);
    }
               
});
socket.on('private',function(data){
    feedback.innerHTML='';
    if(data.msgtype=='text'){
    output.innerHTML+= "<div id='two'>"+data.from+"<br/>"+data.body+" "+data.createdAt+" </div>";
    }
    else if(data.msgtype=='img'){
    output.innerHTML+= "<div id='two'>"+data.name+"<br/><img src='"+data.body+"' id='op' height='180px' width='450px'/>"+data.createdAt+"</div>";
    }
   });
message.addEventListener('keypress',function(){
    socket.emit("typing",{
        from:x.value,
        room: f.value
    });
});
socket.on('typing',function(data){
    feedback.innerHTML="<p><em>"+data.from+" is typing a msg..</em></p>"
});
