$(document).ready(function(){
  load("welcome");
});

function load(target){
  $("#main").load("docs/"+target+".html", function() {
    //load回调函数
  });
}