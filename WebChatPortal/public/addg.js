var socket = io.connect("http://localhost:4000");
var b = document.getElementById("serc");
var search=document.getElementById("search");
var namer = document.getElementById("grpname"); //grp name

var users = document.getElementById("users");
var friends = document.getElementById("friends");
search.addEventListener("keydown",funcc);
function funcc(){
   socket.emit('search',{
      qtext:search.value 
   });
  }
socket.on('search',function(data){
   b.innerHTML="";
   data.res.forEach(function(i){
       if(i.username!=namer.value){
       if(friends.includes(i.username) && users.includes(i.username) ){q="friends";m="/each/";alr=i.username;}
           else{q="Add";m="/friends/";alr=i.username;}
           }
       b.innerHTML+="<div>"+i.username+"<br/><form action="+m+alr+"><input type='submit' value="+q+"></form></div>";
       }
   });
});
