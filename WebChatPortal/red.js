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

function geor(y,k){
    //completely redundant
    if(k=='msg'){
        data='';
     socket.emit('private',{
           from:x.value,
           to:to.value,
           message: y,
           room:f.value,
           type:'text'
      },function(data){
         window.data=data;
     });
setTimeout(function(){
    console.log(data);
    if(data==''){
     output.innerHTML+= "<li id='one'>"+x.value+"<br/>"+y+"<br/>undelivered <button onclick='geor("+y+",msg)'>retry</button></li>";
    }
   else{
        output.innerHTML+= "<li id='one'>"+x.value+"<br/>"+y+"<br/>delivered "+data.time+"<a href='/delete?id="+data.id+"&name="+data.to+"&type=each'>delete</a></li>";
       
   }
},200);        

  
    }
    else if(k=='img'){
        data='';
        socket.emit('private',{
           from:x.value,
           to:to.value,
           message: y,
           room:f.value,
           type:'img'
      },function(data){
               window.data=data;
     });
setTimeout(function(){
    //console.log(data);
    if(data==''){
     output.innerHTML+= "<li id='one'>"+x.value+"<br/><img src='"+y+"'/><br/>undelivered <button onclick='geor("+imd+",'img')'>retry</button></li>";
  imd=null;

    }
   else{
        output.innerHTML+= "<li id='one'>"+x.value+"<br/><img src='"+y+"'/><br/>delivered "+data.time+"<a href='/delete?id="+data.id+"&name="+data.to+"&type=each'>delete</a></li>";
  
       
   }
},200);      
    }
   
}

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

socket.emit('joinRoom',{room:f.value});
send.addEventListener("click",function(){
    if(message.value!=''){
        data='';
        socket.emit('private',{
           from:x.value,
           to:to.value,
           message: message.value,
           room:f.value,
           type:'text'
      },function(data){
           window.data=data;
     });
setTimeout(function(){
    console.log(data);
    if(data==''){
     jum = 'msg';
     oui = ''+message.value; 
     output.innerHTML+= "<li id='one'>"+x.value+"<br/>"+message.value+"<br/>undelivered <button onclick='geor(oui,jum)'>retry</button></li>";
     message.value='';
    }
   else{
        output.innerHTML+= "<li id='one'>"+x.value+"<br/>"+message.value+"<br/>delivered "+data.time+"<a href='/delete?id="+data.id+"&name="+data.to+"&type=each'>delete</a></li>";
  message.value="";
       
   }
},200);        

  
    }
    else if(imd!=null){
        data='';jum='img';oui=imd;
        gt.innerHTML="<input type='text' id='message'/>"
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
    //console.log(data);
    if(data==''){
     output.innerHTML+= "<li id='one'>"+x.value+"<br/><img src='"+imd+"'/><br/>undelivered <button onclick='geor(oui,jum)'>retry</button></li>";
  imd=null;
  gt.innerHTML="<input type='text' id='message'/>"; 
    }
   else{
        output.innerHTML+= "<li id='one'>"+x.value+"<br/><img src='"+imd+"'/><br/>delivered "+data.time+"<a href='/delete?id="+data.id+"&name="+data.to+"&type=each'>delete</a></li>";
  gt.innerHTML="<input type='text' id='message'/>"; 
       
   }
},200);      
    }
});
socket.on('private',function(data){
    if(data.msgtype=='text'){
    output.innerHTML+= "<li id='two'>"+data.from+"<br/>"+data.body+" "+data.createdAt+" </li>";
    }
    else if(data.msgtype=='img'){
    output.innerHTML+= "<li id='two'>"+data.name+"<br/><img src='"+data.body+"'/>"+data.createdAt+"</li>";
    }
   });
message.addEventListener('keypress',function(){
    socket.emit("typing",{
        from:x.value,
        room: f.value
    });
});
socket.on('typing',function(data){
    console.log("Irt",data.from);
    feedback.innerHTML="<p><em>"+data.from+" is typing a msg..</em></p>"
});
