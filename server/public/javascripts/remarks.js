/**
 * Created by Надежда on 30.03.2016.
 */

var newRemark = document.querySelector('.new-remark');

//нажали на кнопку создания новой заметки
newRemark.addEventListener('click', function (event){
    event.preventDefault();
    document.querySelector('.creating').setAttribute('style', 'display: block;');
    newRemark.setAttribute('style', 'display: none;');
});

//отмена создания
document.querySelector('.redo-form_cancel').addEventListener('click', function (event) {
    event.preventDefault();
    document.querySelector('.creating').setAttribute('style', 'display: none;');
    newRemark.setAttribute('style', 'display: block;');
});

//а что дальше! слабонервным не смотреть
//отправка заметки и ее сохрание
document.querySelector('.redo-form_send').addEventListener('click', function (event) {
    event.preventDefault();
    var text = document.querySelector('textarea.redo-form_text').value;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/remarks/new', true);
    xhr.onreadystatechange = function() { // (3)
        if (xhr.readyState != 4) return;

        if (xhr.status != 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
        } else {
            var main = document.querySelector('.main');
            var card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = text;
            var id = JSON.parse(xhr.responseText).id;
            card.setAttribute('server_id', id);
            main.querySelector('.creating').setAttribute('style', 'display: none;');
            main.removeChild(newRemark);
            newRemark.setAttribute('style', 'display: block;');
            main.appendChild(card);
            main.appendChild(newRemark);
        }
    };
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('text=' + encodeURIComponent(text));
});


function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

//tap - редактирование
var allCards = document.querySelectorAll('.card');
allCards = Array.prototype.slice.call(allCards);

//swipe
var startPoint={};
var nowPoint;
var startTime;
var lastElementInLeft;
allCards.map(function(elem, index, array) {
    elem.addEventListener('touchstart', function(event) {
        //event.preventDefault();
        //event.stopPropagation();
        if (lastElementInLeft != undefined) {
            lastElementInLeft.setAttribute('style', 'transform: translateX(0px)')
        }
        startPoint.x = event.changedTouches[0].pageX;
        startPoint.y = event.changedTouches[0].pageY;
        startTime = new Date();
    }, false);
    elem.addEventListener('touchmove', function(event) {
        //event.preventDefault();
        //event.stopPropagation();
        nowPoint = event.changedTouches[0];
        var dif = nowPoint.pageX-startPoint.x;

        if(Math.abs(dif) > 200){
            lastElementInLeft = elem;
            event.preventDefault();
            event.stopPropagation();
            var but = document.querySelector('.delButton');
            elem.setAttribute('style', 'transform: translateX(' + dif + 'px)');
            /*if(dif < 0) {
                var but = document.querySelector('.delButton');
                document.querySelector('.index').removeChild(but);
                insertAfter(but, elem);
                but.setAttribute('style', 'display: inline');
                elem.setAttribute('style', 'transform: translateX(' + dif + 'px)');
            } else {
                var but = document.querySelector('.delButton');
                but.setAttribute('style', 'display: none');
                elem.setAttribute('style', 'transform: translateX(' + 0 + 'px)');
            }*/
            startPoint={x:nowPoint.pageX,y:nowPoint.pageY};
        }
    }, false);

    elem.addEventListener('touchend', function (event) {
        var endTime = new Date();
        nowPoint = event.changedTouches[0];
        var xAbs = Math.abs(startPoint.x - nowPoint.pageX);
        var yAbs = Math.abs(startPoint.y - nowPoint.pageY);
        //swipes
        if ((xAbs > 10 || yAbs > 10) && (endTime.getTime()-startTime.getTime())>200) {
            //по горизонтали
            if (xAbs > yAbs) {
                event.preventDefault();
                event.stopPropagation();
                if (startPoint.x < nowPoint.pageX) {
                    elem.setAttribute('style', 'transform: translateX(0)');
                } else {
                    elem.setAttribute('style', 'transform: translateX(-10%);');
                }
                //вертикаль
            } else {
                /*if (startPoint.y < nowPoint.pageY) {
                    console.log('here');
                }*/
            }
        }  else {
            //tap
            if ((endTime.getTime() - startTime.getTime()) < 200) {
                event.preventDefault();
                event.stopPropagation();
                var styleCurrentCard = elem.getAttribute('style') || '';
                if (styleCurrentCard.match(/margin-left: -50px/)) {
                    return;
                }
                newRemark.setAttribute('style', 'display: none;');
                var myclick = event.targetTouches[0];
                var card = elem;
                var main = document.querySelector('.main');
                card.setAttribute('style', 'display:none;');
                var redo = document.querySelector('.redo');
                main.removeChild(redo);
                redo.setAttribute('style', 'display:block;');
                redo.querySelector('.redo_text').innerHTML = card.innerHTML;
                insertAfter(redo, card);
                //отмена
                document.querySelector('.redo_cancel').addEventListener('click', function (event) {
                    event.preventDefault();
                    document.querySelector('.redo').setAttribute('style', 'display: none;');
                    card.setAttribute('style', 'display:block;');
                    newRemark.setAttribute('style', 'display: block;');
                });
                //отправка изменения
                document.querySelector('.redo_send').addEventListener('click', function (event) {
                    event.preventDefault();
                    var text = document.querySelector('textarea.redo_text').value;
                    console.log(text);
                var xhr = new XMLHttpRequest();
                xhr.open('PUT', '/remarks/' + index, true);
                xhr.onreadystatechange = function () { // (3)
                    if (xhr.readyState != 4) return;
                        if (xhr.status != 200) {
                            console.log(xhr.status + ': ' + xhr.statusText);
                        } else {
                            var main = document.querySelector('.main');
                            card.innerHTML = text;
                            card.setAttribute('style', 'display:block;');
                            main.querySelector('.redo').setAttribute('style', 'display: none;');
                            newRemark.setAttribute('style', 'display: block;');
                        }
                    };
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    xhr.send('text=' + encodeURIComponent(text));
                });
            } else {
                //long tap
            }
        }
    }, false);
});

//для Pull to Refresh
var startPointDoc = {};
var startTimeDoc;
document.addEventListener('touchstart', function (event) {
    startTimeDoc = new Date();
    startPointDoc.x = event.pageX;
    startPointDoc.y = event.pageY;
});

document.addEventListener('touchmove', function (event) {

});

document.addEventListener('touchend', function (event) {

    var nowPoint = event.changedTouches[0];
    var xAbs = Math.abs(startPointDoc.x - nowPoint.pageX);
    var yAbs = Math.abs(startPointDoc.y - nowPoint.pageY);
    var endTime = new Date();
    console.log(xAbs, yAbs);
    if ((yAbs > 10) && (endTime.getTime()-startTimeDoc.getTime()) > 200) {
        if (nowPoint.pageY > startPointDoc.y) {
            console.log('refresh');
            event.preventDefault();
            event.stopPropagation();
        }
    }
});