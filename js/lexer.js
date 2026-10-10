// ARIO lexer: conservative tokenizer for common Lua syntax. Not a complete Luau parser.
(function(){
 const isStart=c=>!!c&&/[A-Za-z_]/.test(c), isPart=c=>!!c&&/[A-Za-z0-9_]/.test(c);
 window.ARIO_Lexer={
  tokenize(source){
   const out=[];let i=0;
   while(i<source.length){
    const start=i,c=source[i];
    if(/\s/.test(c)){i++;while(i<source.length&&/\s/.test(source[i]))i++;out.push({type:"ws",value:source.slice(start,i)});continue;}
    if(source.startsWith("--",i)){
     i+=2;let m=source.slice(i).match(/^\[(=*)\[/);
     if(m){const close="]"+m[1]+"]";i+=m[0].length;const e=source.indexOf(close,i);i=e<0?source.length:e+close.length;}
     else {while(i<source.length&&source[i]!=="\n")i++;}
     out.push({type:"comment",value:source.slice(start,i)});continue;
    }
    if(c==="'"||c==='"'){
     const q=c;i++;
     while(i<source.length){if(source[i]==="\\"){i=Math.min(source.length,i+2);continue;}if(source[i]===q){i++;break;}i++;}
     out.push({type:"string",value:source.slice(start,i)});continue;
    }
    if(c==="["){const m=source.slice(i).match(/^\[(=*)\[/);if(m){const close="]"+m[1]+"]";i+=m[0].length;const e=source.indexOf(close,i);i=e<0?source.length:e+close.length;out.push({type:"longstring",value:source.slice(start,i)});continue;}}
    if(isStart(c)){i++;while(i<source.length&&isPart(source[i]))i++;out.push({type:"id",value:source.slice(start,i)});continue;}
    if(/[0-9]/.test(c)){i++;while(i<source.length&&/[A-Za-z0-9_.]/.test(source[i]))i++;out.push({type:"number",value:source.slice(start,i)});continue;}
    const op=["...","..","==","~=","<=",">=","::","//","<<",">>","+=","-=","*=","/=","%=","^="].find(x=>source.startsWith(x,i));
    if(op){i+=op.length;out.push({type:"symbol",value:op});}else{out.push({type:"symbol",value:source[i++]});}
   }
   return out;
  }
 };
})();