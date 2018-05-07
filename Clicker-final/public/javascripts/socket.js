$('#info').hide();
$('#chat').hide();
$('.upgrade').hide();
var tur=10;
var debit=10;
var socket = io();//connect to the socket
var exist= false;
var payd = 50;
var price=0;
var nombre = 0;
var test = 0;
var tops = 10;
var bugs =[];
var icone =[];
var setup = true;

$(function () {
    $('#chat-form').submit(function(){
      socket.emit('message-send', $('#user-message').val());
      $('#user-message').val('');
      return false;
    });
    
     socket.on('message-formated', function(data){
      $('#messages').append($('<li>').text(data));
    });
});

socket.on('click_count',function(data){
    nombre = Math.round(data.nombre*100)/100;
    $('#counter').html(nombre);//Set new count value
    $('#level').html(data.niveau);
    //Set new count value
    
    if(setup) 
    {
        eolienne(data.niveau);
        setup = false;
    }

    if((parseInt(data.nombre)% 20)==0){
        debit += 8;
    }
    niveau = data.niveau;

    if(data.nombre >= (niveau * payd) && !exist){
        price = niveau * payd;
        niveau+=1;
        exist=true;
        $('.upgrade').show();
        $('.upgrade').html("<div class='title'><h2> Mise à jour débloqué</h2><button><h2>X</h2></button></div><div class='contains'>Windobs à détécté une mise à jours.<br><br>Afin d'avoir plus de bug et plein d'autres désavantages payez notre mise à jours "+price+"Bugs.<br><br><details><summary>Details</summary>click : +0.25<br>level : +1</details> <button id='oay' class='pay' value="+price+">INSTALLER</button></div>");
        $('.upgrade').animate({"bottom": "60px"},1000);
    }
    
    var i=0;
    var leve = parseInt(data.nombre);
    var diff = leve - test;
    if(diff != 0){
        test = leve;
        var num = leve - diff;
        for(i=0;i<diff;i++){
           num++;
            var mot =rantest() ;
            $('.level').append("<div class='bug'><div class='title'><h2>"+ mot +"</h2><button><h2>X</h2></button></div><div class='contains'>ERROR</div></div>");

            if(tops > $('body').height() - 150){
                tops = 10;
            }
            tops = tops + 10;
            var text = tops + "px";
            $('.bug:nth-child(0n+'+num+')').css({"top":text});
        }
    }
});

function rantest(){
    var selector = Math.floor(Math.random() * Math.floor(4));

    var sentences=['Critical Error','Systeme Error','MS PAINT ERROR','THIS IS NOT AN ERROR'];
    return sentences[selector];
}
//Says to server that the button has been clicked
$('.eolienne').click(function()
                     {
    rotate();
    socket.emit('clicked',debit/200);//Emitting user click

});
var pri ;
var level;

$('.upgrade').on('click','#oay',function(){
    pri= $(this).val();
    
    socket.emit('count',pri);
    debit=10;
    exist=false;
    level=$('#level').text() ;
    level++;

    for(i=test;i>(test - pri);i--){
        $('.bug:nth-child(0n+'+i+')').remove();
    }
    test -= pri ;
    var position = $('.bug:nth-child(0n+'+test+')').position();
    tops =  (position)?position.top:10;
    console.log(tops);
    $('.upgrade').animate({"bottom": "-250px"},1000);
    eolienne(level);
});

function eolienne(up){
    switch(up){
        case 2:$('.img').remove();
            $('.eolienne').html("<img src='images/helice"+up+".png' width='100%' class='img'>");
            break;
        case 3:$('.img').remove();
            $('.eolienne').html("<img src='images/helice"+up+".png' width='100%' class='img'>");
            break;
        case 4:$('.img').remove();
            $('.eolienne').html("<img src='images/helice"+up+".png' width='100%' class='img'>");
            break;


             }
}

function rotate(){
    $('.img').css({"transform":"rotate("+tur+"deg)"});
    tur+=debit;

}

function openit(id){
    $('#'+id).show();
    $('.footer').append("<a class='rac' id='rac"+id+"' onclick=\"visible('"+id+"');\"></a>");
    $('#rac'+id).css({"background":"url('/images/icone"+id+".png')center no-repeat,rgba(0, 0, 0, 0)"})
}

function closeit(id){
    $('#'+id).hide();
    $('#rac'+id).remove();
}

function visible(id){
    if($('#'+id).css('display') == 'none'){
         $('#'+id).show();
    }
    else {  
         $('#'+id).hide();
    }
}

window.onload=function() {
  horloge('div_horloge');
};
 
function horloge(el) {
  if(typeof el=="string") { el = document.getElementById(el); }
  function actualiser() {
    var date = new Date();
    var str = date.getHours();
    str += ':'+(date.getMinutes()<10?'0':'')+date.getMinutes();
    el.innerHTML = str;
  }
  actualiser();
  setInterval(actualiser,1000);
}