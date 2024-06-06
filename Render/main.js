import * as pieces from "../Data/pieces.js";

import { ROOT_DIV } from "../Helper/constants.js";

import { globalState } from "../index.js";


function globalStateRender(){
  globalState.forEach((row) => {
    row.forEach((element) => {
      if (element.highlight) {
        const hightlightSpan = document.createElement("span");
        hightlightSpan.classList.add("highlight");
        document.getElementById(element.id).appendChild(hightlightSpan);
        // } else if (element.highlight === null) {
      } else {
        const el = document.getElementById(element.id);
        const highlights = Array.from(el.getElementsByTagName("span"));
        highlights.forEach((element) => {
          el.removeChild(element);
        });
        // document.getElementById(element.id).innerHTML = "";
      }
    });
  });
}

function selfHighlight(piece) {
  document
    .getElementById(piece.current_position)
    .classList.add("highlightYellow");
}

function pieceRender(data){
  data.forEach((row)=> {
    row.forEach((square)=> {
      //console.log(square);
      if(square.piece){
        const squareEl=document.getElementById(square.id);
        console.log(square);
        //create piece
        const piece= document.createElement("img");
        piece.src=square.piece.img;
        piece.classList.add("piece");
        //console.log(piece);
  
        //insert piece into square element
        squareEl.appendChild(piece);
      }
    });    
  });
}


function initGameRender(data){
  data.forEach((element)=>{
    const rowE1= document.createElement("div");
    element.forEach((square)=>{
      const squareDiv= document.createElement("div");
      squareDiv.id = square.id;
      squareDiv.classList.add(square.color, "square");
      
      // render black tank
      if(square.id=="b7" || square.id=="g7"){
        square.piece=pieces.BlackTank(square.id);
        
      }
      //render white tank
      if(square.id=="b2" || square.id=="g2"){
        square.piece=pieces.WhiteTank(square.id);
      }

      if(square.id=="d2"){
        square.piece=pieces.WhiteTitan(square.id);
      }

      if(square.id=="e7"){
        square.piece=pieces.BlackTitan(square.id);
      }

      if(square.id=="e1"){
        square.piece=pieces.WhiteRico1(square.id);
      }

      if(square.id=="c1"){
        square.piece=pieces.WhiteRico2(square.id);
      }

      if(square.id=="f8"){
        square.piece=pieces.BlackRico1(square.id);
      }

      if(square.id=="d8"){
        square.piece=pieces.BlackRico2(square.id);
      }

      if(square.id=="f1"){
        square.piece=pieces.WhiteSemi1(square.id);
      }

      if(square.id=="b1"){
        square.piece=pieces.WhiteSemi2(square.id);
      }

      if(square.id=="g8"){
        square.piece=pieces.BlackSemi1(square.id);
      }

      if(square.id=="c8"){
        square.piece=pieces.BlackSemi2(square.id);
      }

      if(square.id=="h1"){
        square.piece=pieces.WhiteCannon(square.id);
      }

      if(square.id=="a8"){
        square.piece=pieces.BlackCannon(square.id);
      }
      
      rowE1.appendChild(squareDiv);
    });
    rowE1.classList.add("squareRow");
    ROOT_DIV.appendChild(rowE1);
  });

  pieceRender(data);
}

function renderHighlight(squareId){
  const highlightSpan= document.createElement("span");
  highlightSpan.classList.add("highlight");
  document.getElementById(squareId).appendChild(highlightSpan);
}

function clearHighlight() {
  const flatData = globalState.flat();

  flatData.forEach((el)=> {
    if(el.highlight){
      el.highlight=null;
    }
    globalStateRender();
  })
}



export { globalStateRender, selfHighlight, initGameRender, renderHighlight, clearHighlight };