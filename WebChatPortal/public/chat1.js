var message = document.getElementById('message');
var send = document.getElementById('send');
var feedback = document.getElementById('feedback');
var output = document.getElementById("output");
var to = document.getElementById("to");


send.addEventListener("click",function(){
   socket.emit('chat',{
      to:to.value,
      message: message.value 
   }); 
});