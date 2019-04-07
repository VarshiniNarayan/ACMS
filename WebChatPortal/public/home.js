var socket = io.connect("http://localhost:4000");
var b = document.getElementById("serc");
var search=document.getElementById("search");
var namer = document.getElementById("dont");
console.log(namer.value);

search.addEventListener("keydown",funcc);
function funcc(){
   socket.emit('search',{
      qtext:search.value 
   });
  }
var friends = document.getElementsByClassName("fr");
var req = document.getElementById("donn").value;
console.log(req);
set = [];
[].forEach.call(friends,function(el){
   set.push(el.innerHTML); 
});

socket.on('search',function(data){
   b.innerHTML="";
   data.res.forEach(function(i){
       if(i.username!=namer.value){
       if(set.includes(i.username)){q="friends";m="/each/";alr=i.username;}
       else{if(req.includes(i.username)){
           q="requested";m="";alr='';
           }
           else{q="Add";m="/friends/";alr=i.username;}
           }
       b.innerHTML+="<div>"+i.username+"<br/><form action="+m+alr+"><input type='submit' value="+q+"></form></div>";
       }
   });
});