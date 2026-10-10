// ARIO conservative transformations. No VM/anti-tamper implementation is implied.
(function(){
 const keywords=new Set("and break do else elseif end false for function if in local nil not or repeat return then true until while continue export type typeof".split(" "));
 const globals=new Set(("assert collectgarbage dofile error getmetatable ipairs load loadfile next pairs pcall print rawequal rawget rawlen rawset require select setmetatable tonumber tostring type warn xpcall _G _VERSION coroutine debug io math os package string table utf8 bit32 task game workspace script shared Enum Instance Vector2 Vector3 CFrame Color3 UDim UDim2 RaycastParams TweenInfo UserInputService Players RunService ReplicatedStorage").split(" "));
 function randName(n){const a="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";let s="_";for(let i=0;i<n;i++)s+=a[Math.floor(Math.random()*a.length)];return s;}
 function toCharExpression(token,style){
  const q=token[0],body=token.slice(1,-1),codes=[];
  for(let i=0;i<body.length;i++){let c=body[i];if(c==="\\"){const n=body[++i];if(n===undefined)break;
   if(n==="n")codes.push(10);else if(n==="r")codes.push(13);else if(n==="t")codes.push(9);else if(n==="\\")codes.push(92);else if(n===q)codes.push(n.charCodeAt(0));else if(n==='"')codes.push(34);else if(n==="'")codes.push(39);else if(n==="x"&&/^[\da-fA-F]{2}/.test(body.slice(i+1,i+3))){codes.push(parseInt(body.slice(i+1,i+3),16));i+=2;}else if(/[0-9]/.test(n)){let ds=n;while(i+1<body.length&&ds.length<3&&/[0-9]/.test(body[i+1]))ds+=body[++i];codes.push(Number(ds)%256);}else if(n!=="\n")codes.push(n.charCodeAt(0));
  }else codes.push(c.charCodeAt(0));}
  if(style==="concat"&&codes.length>12){const chunks=[];for(let i=0;i<codes.length;i+=12)chunks.push("string.char("+codes.slice(i,i+12).join(",")+")");return "("+chunks.join("..")+")";}
  return "string.char("+codes.join(",")+")";
 }
 function stripComments(tokens){return tokens.filter(t=>t.type!=="comment");}
 function renameLocals(tokens,nameLength){
  // Conservative rename for names declared with local and simple function parameters.
  // Not a full scope resolver: this is intentionally optional and labeled experimental.
  const declared=new Set(),blocked=new Set();
  for(let i=0;i<tokens.length;i++){
   if(tokens[i].type==="id"&&tokens[i].value==="local"){
    let j=i+1;while(tokens[j]?.type==="ws")j++;
    if(tokens[j]?.value==="function")continue;
    if(tokens[j]?.type==="id")declared.add(tokens[j].value);
   }
   if(tokens[i].type==="id"&&tokens[i].value==="function"){
    let j=i+1;while(tokens[j]&&tokens[j].value!=="(")j++;
    if(tokens[j]?.value==="("){j++;while(tokens[j]&&tokens[j].value!==")"){if(tokens[j].type==="id"&&!keywords.has(tokens[j].value))declared.add(tokens[j].value);j++;}}
   }
  }
  for(let i=0;i<tokens.length;i++){if(tokens[i].type==="id"&&((tokens[i-1]?.value===".")||(tokens[i-1]?.value===":")||(tokens[i+1]?.value==="=")))blocked.add(tokens[i].value);}
  const map=new Map();for(const name of declared)if(!keywords.has(name)&&!globals.has(name)&&!blocked.has(name))map.set(name,randName(nameLength));
  return tokens.map((t,i)=>t.type==="id"&&map.has(t.value)&&tokens[i-1]?.value!=="."&&tokens[i-1]?.value!==":"?{...t,value:map.get(t.value)}:t);
 }
 function transform(source,options){
  if(!source.trim())throw new Error("Paste Lua/Luau source code first.");
  let tokens=window.ARIO_Lexer.tokenize(source);
  if(options.comments||options.minify)tokens=stripComments(tokens);
  if(options.strings)tokens=tokens.map(t=>t.type==="string"?{type:"raw",value:toCharExpression(t.value,options.stringStyle)}:t);
  if(options.numbers)tokens=tokens.map(t=>{if(t.type==="number"&&/^\d+$/.test(t.value)){const n=Number(t.value);if(n>=2&&n<=1000000){const a=Math.floor(n/2);return {type:"raw",value:"("+a+"+"+(n-a)+")"};}}return t;});
  if(options.rename)tokens=renameLocals(tokens,options.nameLength);
  let output="",prev=null;
  const word=t=>t&&["id","number","string","longstring","raw"].includes(t.type);
  for(const t of tokens){
   if(t.type==="ws"){if(!options.minify)output+=t.value;continue;}
   if(options.minify&&word(prev)&&word(t))output+=" ";
   if(options.minify&&prev&&prev.value==="-"&&t.value.startsWith("-"))output+=" ";
   output+=t.value;prev=t;
  }
  return output;
 }
 window.ARIO_Transform={transform};
})();