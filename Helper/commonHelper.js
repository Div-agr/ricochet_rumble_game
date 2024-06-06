function giveKingHighlightIds(id){
    const returnResult=[];
    let alpha= id[0];
    let num=Number(id[1]);

    //forward and backward
    if(num!=8 && num!=1)
    {
        returnResult.push(alpha+(num+1));
        returnResult.push(alpha+(num-1));
    }
    else if(num==8)
        returnResult.push(alpha+(num-1));
    else
        returnResult.push(alpha+(num+1));

    
    function sideways(alpha,num){
        const right = String.fromCharCode(alpha.charCodeAt(0) + 1);
        const left= String.fromCharCode(alpha.charCodeAt(0) - 1);
        if(alpha!="a" &&  alpha!="h")
        {
            returnResult.push(left+num);
            returnResult.push(right+num);
        }
        else if(alpha=="a")
            returnResult.push(right+num);
        else
            returnResult.push(left+num);
    }
    sideways(alpha,num); //left and right
    if(num!=1)
        sideways(alpha,num-1); //bottom left and right
    if(num!=8)
        sideways(alpha,num+1); //top bottom and right
    
    
    return returnResult;
}

function giveCannonHighlightIds(id){
    const returnResult=[];
    const alpha=id[0];
    const num= Number(id[1]);
    let temp=alpha;

    // all left squares
    while(temp!="a"){
        temp=String.fromCharCode(temp.charCodeAt(0) - 1);
        returnResult.push(temp+num);
    }

    temp=alpha;

    // all right squares
    while(temp!="h"){
        temp=String.fromCharCode(temp.charCodeAt(0) + 1);
        returnResult.push(temp+num);
    }
    
    return returnResult;
}

export{ giveCannonHighlightIds, giveKingHighlightIds};
