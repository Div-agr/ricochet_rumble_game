import {ROOT_DIV} from "../Helper/constants.js"
import { globalState, keySquareMapper } from "../index.js";
import { renderHighlight } from "../Render/main.js";
import { clearHighlight } from "../Render/main.js";
import { globalStateRender } from "../Render/main.js";
import { selfHighlight } from "../Render/main.js";
import { giveKingHighlightIds } from "../Helper/commonHelper.js";
import { giveCannonHighlightIds } from "../Helper/commonHelper.js";
import { endGame } from "./game-over.js";

// hightlighted or not => state
let highlight_state = false;
let inTurn = "white";
let selfHighlightState= null;
let moveState= null;
let whiteCannonId= "h1"; //to track bullet.
let blackCannonId="a8";
let collisionDetected= false;

let rotate=document.getElementById("reflect");
let rotateElement;
let whiteRicoleft2=false;
let whiteRicoleft1=true;
let whiteSemileft2=false;
let whiteSemileft1=true;
let blackRicoleft1=false;
let blackRicoleft2=true;
let blackSemileft1=true;
let blackSemileft2=false;

let upwardBullet= false; //false indicates bullet is going down and viceversa
let leftBullet= false; //false indicates bullet is going right and vice versa
let sideways= false; //true indicates bullet is either going left or right and false indicates bullet is going upward or downward
let delay=0;
let speed= 500; //the value is inversly proportional to speed of the bullet

let timer;
let timeLeft=30;
let toggleSelector= 0;

function startTimer() {
    timer = setInterval(function() {
        if (timeLeft > 0) {
            timeLeft -= 1;
            document.getElementById('timer').textContent = timeLeft;
        } else {
            clearInterval(timer);
            endGame(inTurn=="white"? "black":"white");
        }
    }, 1000);
}


function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('hidden');
    toggleSelector++;
    if(toggleSelector%2==0){
        startTimer();
    }
    else{
        clearInterval(timer);
    }

}


function fireBullet(cannonCellId, targetCellId, duration, delay) {
    const cannon = document.getElementById(cannonCellId);
    const targetCell = document.getElementById(targetCellId);

    if (targetCell) {
        const bullet = document.createElement('div');
        

        // Calculate the position to animate the bullet
        const targetCellRect = targetCell.getBoundingClientRect();
        const cannonRect = cannon.getBoundingClientRect();
        const bulletStartX = cannonRect.left + (cannonRect.width / 2);
        const bulletStartY = cannonRect.top + (cannonRect.height / 2);
        const bulletEndX = targetCellRect.left + (targetCellRect.width / 2);
        const bulletEndY = targetCellRect.top + (targetCellRect.height / 2);

        // Set bullet initial position
        bullet.style.left = bulletStartX + 'px';
        bullet.style.top = bulletStartY + 'px';

        if(inTurn=="black")
            bullet.style.backgroundColor="black";
        else
            bullet.style.backgroundColor="white";

        // Animate bullet to target cell
        setTimeout(() => {
            // Animate bullet to target cell
            bullet.classList.add('bullet');
            document.body.appendChild(bullet);
            const animation=bullet.animate([
                { left: bulletStartX + 'px', top: bulletStartY + 'px' },
                { left: bulletEndX + 'px', top: bulletEndY + 'px' }
            ], {
                duration: duration,  // Adjust speed
                easing: 'linear',
                fill: 'forwards'
            });

            // Remove bullet from DOM after animation completes
            animation.finished.then(() => {
                bullet.remove();
            });
        }, delay);
    }
}

function handleCollision(hitPiece,targetCell){
    if(hitPiece){
        delay=delay+600;
        let character= targetCell.id[0];
        let n= Number(targetCell.id[1]);
        if(hitPiece=="BLACK_TITAN"){
            endGame("white", delay);
            return;
        }
        else if(hitPiece=="WHITE_TITAN"){
            endGame("black", delay);
            return;
        }

        if(hitPiece=="BLACK_RICO1"){
            hitPiece=null;
            let initialPieceId= targetCell.id;
            if((blackRicoleft1 && upwardBullet || !blackRicoleft1 && !upwardBullet) && !sideways){
                while(character!="a"){
                    character=String.fromCharCode(character.charCodeAt(0) - 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name; //jisko abhi hit kiya h
                        targetCell=document.getElementById(character+n); //jisko hit kiya h uski id
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=true;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((blackRicoleft1 && !upwardBullet || !blackRicoleft1 && upwardBullet) && !sideways){
                while(character!="h"){
                    character=String.fromCharCode(character.charCodeAt(0) + 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=false;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }
            
            else if((blackRicoleft1 && !leftBullet || !blackRicoleft1 && leftBullet) && sideways){
                while(n!=1){
                    n=n-1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=false;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((blackRicoleft1 && leftBullet || !blackRicoleft1 && !leftBullet) && sideways){
                while(n!=8){
                    n=n+1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=true;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }
        }

        if(hitPiece=="BLACK_RICO2"){
            hitPiece=null;
            let initialPieceId= targetCell.id;
            if((blackRicoleft2 && upwardBullet || !blackRicoleft2 && !upwardBullet) && !sideways){
                while(character!="a"){
                    character=String.fromCharCode(character.charCodeAt(0) - 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name; //jisko abhi hit kiya h
                        targetCell=document.getElementById(character+n); //jisko hit kiya h uski id
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=true;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((blackRicoleft2 && !upwardBullet || !blackRicoleft2 && upwardBullet) && !sideways){
                while(character!="h"){
                    character=String.fromCharCode(character.charCodeAt(0) + 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=false;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }
            
            else if((blackRicoleft2 && !leftBullet || !blackRicoleft2 && leftBullet) && sideways){
                while(n!=1){
                    n=n-1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=false;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((blackRicoleft2 && leftBullet || !blackRicoleft2 && !leftBullet) && sideways){
                while(n!=8){
                    n=n+1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=true;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }
        }

        else if(hitPiece=="WHITE_RICO1"){
            hitPiece=null;
            let initialPieceId= targetCell.id;
            if((whiteRicoleft1 && upwardBullet || !whiteRicoleft1 && !upwardBullet) && !sideways){
                while(character!="a"){
                    character=String.fromCharCode(character.charCodeAt(0) - 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name; //jisko abhi hit kiya h
                        targetCell=document.getElementById(character+n); //jisko hit kiya h uski id
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=true;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((whiteRicoleft1 && !upwardBullet || !whiteRicoleft1 && upwardBullet) && !sideways){
                while(character!="h"){
                    character=String.fromCharCode(character.charCodeAt(0) + 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=false;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }
            
            else if((whiteRicoleft1 && !leftBullet || !whiteRicoleft1 && leftBullet) && sideways){
                while(n!=1){
                    n=n-1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=false;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((whiteRicoleft1 && leftBullet || !whiteRicoleft1 && !leftBullet) && sideways){
                while(n!=8){
                    n=n+1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=true;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }
        }

        else if(hitPiece=="WHITE_RICO2"){
            hitPiece=null;
            let initialPieceId= targetCell.id;
            if((whiteRicoleft2 && upwardBullet || !whiteRicoleft2 && !upwardBullet) && !sideways){
                while(character!="a"){
                    character=String.fromCharCode(character.charCodeAt(0) - 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name; //jisko abhi hit kiya h
                        targetCell=document.getElementById(character+n); //jisko hit kiya h uski id
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=true;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((whiteRicoleft2 && !upwardBullet || !whiteRicoleft2 && upwardBullet) && !sideways){
                while(character!="h"){
                    character=String.fromCharCode(character.charCodeAt(0) + 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=false;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }
            
            else if((whiteRicoleft2 && !leftBullet || !whiteRicoleft2 && leftBullet) && sideways){
                while(n!=1){
                    n=n-1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=false;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((whiteRicoleft2 && leftBullet || !whiteRicoleft2 && !leftBullet) && sideways){
                while(n!=8){
                    n=n+1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=true;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }
        }

        if(hitPiece=="BLACK_SEMI1"){
            hitPiece=null;
            let initialPieceId= targetCell.id;
            //upwardBullet=false;
            if((blackSemileft1 && upwardBullet) && !sideways){
                while(character!="a"){
                    character=String.fromCharCode(character.charCodeAt(0) - 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name; //jisko abhi hit kiya h
                        targetCell=document.getElementById(character+n); //jisko hit kiya h uski id
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=true;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((!blackSemileft1 && upwardBullet) && !sideways){
                while(character!="h"){
                    character=String.fromCharCode(character.charCodeAt(0) + 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=false;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }
            
            else if((blackSemileft1 && !leftBullet || !blackSemileft1 && leftBullet) && sideways){
                while(n!=1){
                    n=n-1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=false;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }
        }

        if(hitPiece=="BLACK_SEMI2"){
            hitPiece=null;
            let initialPieceId= targetCell.id;
            //upwardBullet=false;
            if((blackSemileft2 && upwardBullet) && !sideways){
                while(character!="a"){
                    character=String.fromCharCode(character.charCodeAt(0) - 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name; //jisko abhi hit kiya h
                        targetCell=document.getElementById(character+n); //jisko hit kiya h uski id
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=true;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((!blackSemileft2 && upwardBullet) && !sideways){
                while(character!="h"){
                    character=String.fromCharCode(character.charCodeAt(0) + 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=false;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }
            
            else if((blackSemileft2 && !leftBullet || !blackSemileft2 && leftBullet) && sideways){
                while(n!=1){
                    n=n-1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=false;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }
        }

        else if(hitPiece=="WHITE_SEMI1"){
            hitPiece=null;
            let initialPieceId= targetCell.id;
            //upwardBullet=false;
            if((whiteSemileft1 && !upwardBullet) && !sideways){
                while(character!="a"){
                    character=String.fromCharCode(character.charCodeAt(0) - 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name; //jisko abhi hit kiya h
                        targetCell=document.getElementById(character+n); //jisko hit kiya h uski id
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=true;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((!whiteSemileft1 && !upwardBullet) && !sideways){
                while(character!="h"){
                    character=String.fromCharCode(character.charCodeAt(0) + 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=false;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }
            
            else if((whiteSemileft1 && !leftBullet || !whiteSemileft1 && leftBullet) && sideways){
                while(n!=8){
                    n=n+1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=true;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }
        }

        else if(hitPiece=="WHITE_SEMI2"){
            hitPiece=null;
            let initialPieceId= targetCell.id;
            //upwardBullet=false;
            if((whiteSemileft2 && !upwardBullet) && !sideways){
                while(character!="a"){
                    character=String.fromCharCode(character.charCodeAt(0) - 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name; //jisko abhi hit kiya h
                        targetCell=document.getElementById(character+n); //jisko hit kiya h uski id
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=true;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }

            else if((!whiteSemileft2 && !upwardBullet) && !sideways){
                while(character!="h"){
                    character=String.fromCharCode(character.charCodeAt(0) + 1);
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                leftBullet=false;
                sideways=true;
                handleCollision(hitPiece,targetCell);
                return;
            }
            
            else if((whiteSemileft2 && !leftBullet || !whiteSemileft2 && leftBullet) && sideways){
                while(n!=8){
                    n=n+1;
                    if(document.getElementById(character+n).innerHTML.includes("img")){
                        hitPiece=keySquareMapper[character+n].piece.piece_name;
                        targetCell=document.getElementById(character+n);
                        break;
                    }
                }
                fireBullet(initialPieceId, character+n, speed, delay);
                upwardBullet=true;
                sideways=false;
                handleCollision(hitPiece,targetCell);
                return;
            }
        }
    }

    return;
}


function handleClick(){
    const ricochet=document.getElementById(rotateElement.id);

    if(rotateElement.piece.piece_name=="WHITE_RICO1"){

        if(whiteRicoleft1){
            ricochet.innerHTML="<img src='Assets/White/Wrightrico.png' class='piece'></img>";
            whiteRicoleft1=false;
            whiteFireBullet(whiteCannonId);    
        }
        else{
            ricochet.innerHTML="<img src='Assets/White/Wleftrico.png' class='piece'></img>";
            whiteRicoleft1=true;
            whiteFireBullet(whiteCannonId);
        }
    }

    else if(rotateElement.piece.piece_name=="WHITE_RICO2"){

        if(whiteRicoleft2){
            ricochet.innerHTML="<img src='Assets/White/Wrightrico.png' class='piece'></img>";
            whiteRicoleft2=false;
            whiteFireBullet(whiteCannonId);    
        }
        else{
            ricochet.innerHTML="<img src='Assets/White/Wleftrico.png' class='piece'></img>";
            whiteRicoleft2=true;
            whiteFireBullet(whiteCannonId);
        }
    }

    else if(rotateElement.piece.piece_name=="BLACK_RICO1"){
        
        if(blackRicoleft1){
            ricochet.innerHTML="<img src='Assets/Black/Brightrico.png' class='piece'></img>";
            blackRicoleft1=false;
            blackFireBullet(blackCannonId);    
        }
        else{
            ricochet.innerHTML="<img src='Assets/Black/Bleftrico.png' class='piece'></img>";
            blackRicoleft1=true;
            blackFireBullet(blackCannonId);
        }
    }

    else if(rotateElement.piece.piece_name=="BLACK_RICO2"){
        
        if(blackRicoleft2){
            ricochet.innerHTML="<img src='Assets/Black/Brightrico.png' class='piece'></img>";
            blackRicoleft2=false;
            blackFireBullet(blackCannonId);    
        }
        else{
            ricochet.innerHTML="<img src='Assets/Black/Bleftrico.png' class='piece'></img>";
            blackRicoleft2=true;
            blackFireBullet(blackCannonId);
        }
    }

    else if(rotateElement.piece.piece_name=="WHITE_SEMI1"){

        if(whiteSemileft1){
            ricochet.innerHTML="<img src='Assets/White/Wrightsemi.png' class='piece'></img>";
            whiteSemileft1=false;
            whiteFireBullet(whiteCannonId);

        }
        else{
            ricochet.innerHTML="<img src='Assets/White/Wleftsemi.png' class='piece'></img>";
            whiteSemileft1=true;
            whiteFireBullet(whiteCannonId);
        }
    }

    else if(rotateElement.piece.piece_name=="WHITE_SEMI2"){

        if(whiteSemileft2){
            ricochet.innerHTML="<img src='Assets/White/Wrightsemi.png' class='piece'></img>";
            whiteSemileft2=false;
            whiteFireBullet(whiteCannonId);

        }
        else{
            ricochet.innerHTML="<img src='Assets/White/Wleftsemi.png' class='piece'></img>";
            whiteSemileft2=true;
            whiteFireBullet(whiteCannonId);
        }
    }

    else if(rotateElement.piece.piece_name=="BLACK_SEMI1"){
        
        if(blackSemileft1){
            ricochet.innerHTML="<img src='Assets/Black/Brightsemi.png' class='piece'></img>";
            blackSemileft1=false;
            blackFireBullet(blackCannonId);    
        }
        else{
            ricochet.innerHTML="<img src='Assets/Black/Bleftsemi.png' class='piece'></img>";
            blackSemileft1=true;
            blackFireBullet(blackCannonId);
        }
    }

    else if(rotateElement.piece.piece_name=="BLACK_SEMI2"){
        
        if(blackSemileft2){
            ricochet.innerHTML="<img src='Assets/Black/Brightsemi.png' class='piece'></img>";
            blackSemileft2=false;
            blackFireBullet(blackCannonId);    
        }
        else{
            ricochet.innerHTML="<img src='Assets/Black/Bleftsemi.png' class='piece'></img>";
            blackSemileft2=true;
            blackFireBullet(blackCannonId);
        }
    }

    clearHighlight();
    clearPreviousSelfHighlight(rotateElement.piece);
    disableButton();
    changeTurn();
}

function disableButton() {
    rotate.classList.add('disabled');
    rotate.disabled = true;
}


function enableButton() {
    rotate.classList.remove('disabled');
    rotate.disabled = false;
}

function changeTurn() {
    clearInterval(timer);
    timeLeft=30;
    document.getElementById('timer').textContent = timeLeft;
    setTimeout(function (){startTimer()}, delay);  
    inTurn = inTurn === "white" ? "black" : "white";
    let turn= document.getElementById("turn");
    turn.innerText=`${inTurn}'s Turn`;
}

function moveElement(piece,id){
    const flatData= globalState.flat();

    if(piece.piece_name=="WHITE_CANNON")
        whiteCannonId=id;
    else if(piece.piece_name=="BLACK_CANNON")
        blackCannonId=id;

    flatData.forEach((el)=> {
        if(el.id==piece.current_position){
            delete el.piece;
        }

        if(el.id == id){
            el.piece= piece;
        }
    });

    clearHighlight();

    const previousPiece = document.getElementById(piece.current_position);
    piece.current_position = null;
    previousPiece?.classList?.remove("highlightYellow");
    const currentPiece = document.getElementById(id);

    currentPiece.innerHTML=previousPiece.innerHTML;
    if(previousPiece) previousPiece.innerHTML = "";

    piece.current_position = id;

    if(inTurn=="white" && piece.piece_name!="WHITE_CANNON")
        whiteFireBullet(whiteCannonId);
    else if(inTurn=="black" && piece.piece_name!="BLACK_CANNON")
        blackFireBullet(blackCannonId);

    changeTurn();   

}

function whiteFireBullet(cannonCellId) {
    let targetCell = document.getElementById(cannonCellId[0]+8);
    collisionDetected=false;

    let cannonSound=document.getElementById("audio");
    cannonSound.play();


    for(let j=2;j<9;j++){
        if(document.getElementById(cannonCellId[0]+j).innerHTML.includes("img")){
            targetCell=document.getElementById(cannonCellId[0]+j);
            collisionDetected=true;
            break;
        }
    }
    delay=0;
    fireBullet(cannonCellId, targetCell.id, speed, 0);
    upwardBullet= true;
    sideways= false;
    cannonSound.currentTime=0;
        
    //collision logic
    if(collisionDetected){

        let hitPiece=keySquareMapper[targetCell.id].piece.piece_name;
        handleCollision(hitPiece, targetCell);
    }
}

function blackFireBullet(cannonCellId) {
    let targetCell = document.getElementById(cannonCellId[0]+1);
    collisionDetected=false;

    let cannonSound=document.getElementById("audio");
    cannonSound.play();


    //to check if any piece is between the bullet's path
    for(let j=7;j>0;j--){
        if(document.getElementById(cannonCellId[0]+j).innerHTML.includes("img")){
            targetCell=document.getElementById(cannonCellId[0]+j);
            collisionDetected=true;
            break;
        }
    }
    delay=0;
    fireBullet(cannonCellId, targetCell.id, speed, 0);
    upwardBullet=false;
    sideways=false;
    cannonSound.currentTime=0;

    //collision logic
    if(collisionDetected){
        const hitPiece=keySquareMapper[targetCell.id].piece.piece_name;
        handleCollision(hitPiece, targetCell);
    }
}


function clearHighlightLocal(){
    clearHighlight();
    highlight_state= false;
}

function whiteTankClick(square){
    const piece = square.piece;

    if(piece== selfHighlightState){
        clearPreviousSelfHighlight(selfHighlightState);
        clearHighlightLocal();
        return;
    }

    //clear all highlights
    clearPreviousSelfHighlight(selfHighlightState);
    clearHighlightLocal();

    //highligthing logic
    selfHighlight(piece);
    highlight_state = true;
    selfHighlightState = piece;

    //add piece as move state
    moveState= piece;


    //initial part
    const current_pos= piece.current_position;
    const flatArray=globalState.flat();

    const highlightSquareIds=giveKingHighlightIds(current_pos);

    //clearHighlight();
    highlightSquareIds.forEach((highlight)=> {
        const element= keySquareMapper[highlight];
        if (!element.piece)
            element.highlight=true;
        //renderHighlight(highlight);
        //highlight_state= true;
    });

    globalStateRender();
}


function whiteCannonClick(square){
    const piece = square.piece;

    if(piece== selfHighlightState){
        clearPreviousSelfHighlight(selfHighlightState);
        clearHighlightLocal();
        return;
    }

    //clear all highlights
    clearPreviousSelfHighlight(selfHighlightState);
    clearHighlightLocal();

    //highligthing logic
    selfHighlight(piece);
    highlight_state = true;
    selfHighlightState = piece;

    //add piece as move state
    moveState= piece;


    //initial part
    const current_pos= piece.current_position;
    const flatArray=globalState.flat();

    const highlightSquareIds=giveCannonHighlightIds(current_pos);

    //clearHighlight();
    highlightSquareIds.forEach((highlight)=> {
        const element= keySquareMapper[highlight];
        if (!element.piece)
            element.highlight=true;
        //renderHighlight(highlight);
        //highlight_state= true;
    });

    globalStateRender();
}

function blackCannonClick(square){
    const piece = square.piece;

    if(piece== selfHighlightState){
        clearPreviousSelfHighlight(selfHighlightState);
        clearHighlightLocal();
        return;
    }

    //clear all highlights
    clearPreviousSelfHighlight(selfHighlightState);
    clearHighlightLocal();

    //highligthing logic
    selfHighlight(piece);
    highlight_state = true;
    selfHighlightState = piece;

    //add piece as move state
    moveState= piece;


    //initial part
    const current_pos= piece.current_position;
    const flatArray=globalState.flat();

    const highlightSquareIds=giveCannonHighlightIds(current_pos);

    //clearHighlight();
    highlightSquareIds.forEach((highlight)=> {
        const element= keySquareMapper[highlight];
        
        if (!element.piece)
            element.highlight=true;
        //renderHighlight(highlight);
        //highlight_state= true;
    });

    globalStateRender();
}

function clearPreviousSelfHighlight(piece) {
    if (piece) {
      document
        .getElementById(piece.current_position)
        .classList.remove("highlightYellow");
      // console.log(piece);
      // selfHighlight = false;
      selfHighlightState = null;
    }
}

function GlobalEvent(){
    ROOT_DIV.addEventListener("click", function (event) {
        disableButton();
        if (event.target.localName === "img"){
            const clickId= event.target.parentNode.id;

            const square= keySquareMapper[clickId];

            if(square.piece.piece_name == "WHITE_TANK" && inTurn== "white"){
                whiteTankClick(square);
            }
            if(square.piece.piece_name == "WHITE_TITAN" && inTurn== "white"){
                whiteTankClick(square);
            }
            if((square.piece.piece_name == "WHITE_RICO1" || square.piece.piece_name == "WHITE_RICO2") && inTurn== "white"){
                whiteTankClick(square);
                enableButton();
                rotateElement=square;
            }

            if((square.piece.piece_name == "WHITE_SEMI1" || square.piece.piece_name == "WHITE_SEMI2") && inTurn== "white"){
                whiteTankClick(square);
                enableButton();
                rotateElement=square;
            }
            if(square.piece.piece_name == "WHITE_CANNON" && inTurn== "white"){
                whiteCannonClick(square);
            }
            if(square.piece.piece_name == "BLACK_TANK" && inTurn== "black"){
                whiteTankClick(square);
            }
            if(square.piece.piece_name == "BLACK_TITAN" && inTurn== "black"){
                whiteTankClick(square);
            }
            if((square.piece.piece_name == "BLACK_RICO1" || square.piece.piece_name == "BLACK_RICO2") && inTurn== "black"){
                whiteTankClick(square);
                enableButton();
                rotateElement=square;
            }
            if((square.piece.piece_name == "BLACK_SEMI1" || square.piece.piece_name == "BLACK_SEMI2") && inTurn== "black"){
                whiteTankClick(square);
                enableButton();
                rotateElement=square;
            }
            if(square.piece.piece_name == "BLACK_CANNON" && inTurn== "black"){
                blackCannonClick(square);
            }
        }
        else {
            

            const childElementsOfclickedEl = Array.from(event.target.childNodes);
      
            if (
              childElementsOfclickedEl.length == 1 ||
              event.target.localName == "span"
            ) {
              if (event.target.localName == "span") {
                clearPreviousSelfHighlight(selfHighlightState);
                const id = event.target.parentNode.id; //id of tapped square
                moveElement(moveState, id);
                moveState = null;
              } else {
                clearPreviousSelfHighlight(selfHighlightState);
                const id = event.target.id;
                moveElement(moveState, id);
                moveState = null;
              }
            } else {
              // clear highlights
              clearHighlightLocal();
              clearPreviousSelfHighlight(selfHighlightState);
            }
          }
    });
}

disableButton();
rotate.addEventListener("click", handleClick);

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        toggleMenu();
    }
    document.getElementById('resumeButton').addEventListener('click', function() {
        toggleMenu();
    });
});

startTimer();



export {GlobalEvent};