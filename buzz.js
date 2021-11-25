// ==UserScript==
// @name         Vocabulary.com Queen Bee
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Automatically answers spelling bee questions. Has 99% success rate.
// @author       GSRHackZ
// @match        https://www.vocabulary.com/*
// @icon         https://i.ibb.co/YyGc2sH/queen-bee-removebg-preview.png
// @grant        none
// ==/UserScript==

let wait = randNumb(2000,3000);

function randNumb(min, max) { // generates random time that bot will take to answer question in order to not get flagged and get user banned ;)
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let url = window.location.href,list=url.split("/")[4],lists=[],words_defs=[],inProgress=false,lookOut=[],humanInput=false;

if(localStorage.getItem("lists_bee")!==null){lists = JSON.parse(localStorage.getItem("lists_bee"))}
if(localStorage.getItem("words&defs_bee")!==null){words_defs = JSON.parse(localStorage.getItem("words&defs_bee"))}
if(localStorage.getItem("lookOut")!==null){
    lookOut = JSON.parse(localStorage.getItem("lookOut"));
    let temp=[]
    for(let i=0;i<lookOut.length;i++){
        if(lookOut[i][2]==list){
            temp.push(lookOut[i]);
        }
    }
    lookOut=temp;
}

//console.log(list,lists,partsOfList(list,"words"),partsOfList(list,"defs"))

if(!url.includes("/bee")){
    let grabbed = false;
    setInterval(function(){
        if(document.getElementsByClassName("bee")[0]!==undefined){
            let bee = document.getElementsByClassName("button outline")[1]
            let fake = document.getElementsByClassName("bee")[0].children[0].children[0];
            if(!lists.includes(list)){
                if(document.getElementsByClassName("entry")!==undefined){
                    fake.addEventListener("click",function(){
                        words_defs=[];
                        lists=[];
                        let entries = document.getElementsByClassName("entry");
                        for(let i=0;i<entries.length;i++){
                            let word = entries[i].children[0].innerText;
                            let def = entries[i].children[1].innerText;
                            let exmp;
                            if(entries[i].children[2].children.length>0){
                                exmp = cleanExmp(entries[i].children[2].children[0],"list");
                            }
                            else{
                                exmp=["",""];
                            }
                            words_defs.push({"word":word,"def":def,"example":exmp,"list":list});
                        }
                        if(localStorage.getItem("words&defs_bee")!==null){
                            localStorage.removeItem("words&defs_bee");
                        }
                        if(localStorage.getItem("lists_bee")!==null){
                            localStorage.removeItem("lists_bee");
                        }
                        localStorage.setItem("words&defs_bee",JSON.stringify(words_defs));
                        lists.push(list);
                        localStorage.setItem("lists_bee",JSON.stringify(lists));
                        grabbed=true;
                    })
                    setTimeout(()=>{
                        fake.click();
                    },randNumb(1000,1500))
                }
            }
            if(list.trim().length>0){
                if(grabbed){
                    setTimeout(()=>{
                        bee.click();
                    },randNumb(1000,1500))
                }
            }
        }
    },1000)
}
else if(url.includes("/bee")){
    if(!lists.includes(list)){
        location.href=url.split("/bee")[0];
    }
    else{
        bot();
    }
}

function getWord_(word){
    let result = false;
    let words = partsOfList(list,"words");
    for(let i=0;i<words.length;i++){
        if(word!==null){
            if(words[i].includes(word)||word.includes(words[i])){
                result = words[i];
            }
        }
    }
    return result;
}

function bot(){
    let bot = setInterval(function(){
        window.alert = function(){
            return true;
        }
        window.confirm = function(){
            return true;
        }
        if(document.getElementById("bee_complete")==undefined){
            if(!inProgress&&document.getElementById("bee_card")!==undefined){
                inProgress=true;
                let exmp;
                if(document.getElementsByClassName("example")[0]!==undefined){
                    exmp = cleanExmp(document.getElementsByClassName("example")[0],"bee")
                }
                else{
                    exmp=["",""]
                }
                let defs = getDefs(document.getElementsByClassName("def")),
                    inp = document.getElementById("guessWord"),
                    surrendered = document.getElementsByClassName("stats")[4].innerText.split(":\n")[1],
                    spell = document.getElementById("spellit"),
                    nxt = document.getElementById("nextword"),
                    surrender = document.getElementById("surrender"),
                    defs_ = partsOfList(list,"defs"),
                    exmps = getWord(exmp[1],partsOfList(list,"examples"),defs);
                nxt.addEventListener("click",()=>{
                    humanInput=false;
                })
                if(!defs||!exmps||exmps==undefined){
                    undetected_routing()
                }
                //console.log(exmp,partsOfList(list,"examples"),partsOfList(list,"words"),defs_)
                if(exmps!==undefined){
                    let div = 2;
                    let rem = Math.floor(Number(document.getElementsByClassName("stats")[1].innerText.split(":\n")[1]/div));
                    if(rem>=100){
                        div=5;
                    }
                    if(surrendered>Math.floor(Number(document.getElementsByClassName("stats")[1].innerText.split(":\n")[1]/div))){
                        undetected_routing()
                    }
                    let inLookOut = exmps;
                    for(let i=0;i<lookOut.length;i++){
                        if(same(lookOut[i][0],defs)){
                            if(lookOut[i][1]!==null){
                                if(getWord_(lookOut[i][1])!==false){
                                    inLookOut = getWord_(lookOut[i][1]);
                                }
                                else{
                                    undetected_routing()
                                }
                            }
                            else{
                                undetected_routing()
                            }
                        }
                    }
                    //inp.value = exmps;
                    if(!humanInput){
                        human_Enter(inp,exmps,randNumb(150,250));
                    }
                    let wait = setInterval(()=>{
                        if(humanInput){
                            setTimeout(function(){
                                humanClick(spell)
                            },randNumb(700,1000))
                            setTimeout(function(){
                                if(surrender.disabled){
                                    inProgress = false;
                                    clearInterval(wait)
                                    humanClick(nxt);
                                }
                                else{
                                    humanClick(surrender)
                                    setTimeout(function(){
                                        let inLookOut = false;
                                        if(document.getElementById("correctspelling")!==undefined){
                                            let corrSpell = document.getElementById("correctspelling").innerText.split(": ")[1];
                                            for(let i=0;i<lookOut.length;i++){
                                                if(same(lookOut[i][0],defs)){
                                                    inLookOut = true;
                                                }
                                            }
                                            if(!inLookOut){
                                                if(localStorage.getItem("lookOut")!==null){
                                                    if(localStorage.getItem("lookOut").length>500000){
                                                        lookOut = [];
                                                        localStorage.removeItem("lookOut");
                                                    }
                                                }
                                                lookOut.push([defs,corrSpell,list]);
                                                localStorage.setItem("lookOut",JSON.stringify(lookOut));
                                            }
                                        }
                                        inProgress = false;
                                        clearInterval(wait);
                                        humanClick(nxt)
                                    },500)
                                }
                            },100)
                        }
                    },100)}
                else{
                    undetected_routing()
                }
            }
        }
        else{
            clearInterval(bot);
            console.log("Queen Bee go buzz buzz 😋!");
            setTimeout(function(){
                undetected_routing()
            },500)
        }
    },wait)

    }

if(location.href.includes("https://www.vocabulary.com/lists/")){
    setInterval(function(){
        if(document.getElementsByClassName("page_notfound")[0]!==undefined||document.getElementsByClassName("notlearnable limited-width with-header-margin")[0]!==undefined||document.getElementsByClassName("actions")[0]!==undefined){
            if(document.getElementById("guessWord")==undefined){
                undetected_routing();
            }
        }
    },2000)
}

if(location.href.includes("https://www.vocabulary.com/play/")){
    setInterval(()=>{
        undetected_routing();
    },2000)
}

function same(arr1,arr2){
    if (arr1.length !== arr2.length) return false;
    for(let i=0;i<arr1.length;i++){
        if(arr1[i]!==arr2[i]&&!arr1[i].includes(arr2[i])&&!arr2[i].includes(arr1[i])){
            return false;
        }
    }
    return true;
}

function getWord(exmp,exmps,defs){
    let result = false;
    if(lookOut.length>0){
        for(let i=0;i<lookOut.length;i++){
            if(same(lookOut[i][0],defs)){
                if(lookOut[i][1]!==null){
                    if(getWord_(lookOut[i][1])!==false){
                        return getWord_(lookOut[i][1])
                    }
                }
            }
        }
    }
    for(let i=0;i<exmps.length;i++){
        if(exmps[i][1]==exmp){
            let predict = exmps[i][0];
            let words = partsOfList(list,"words")
            for(let j=0;j<words.length;j++){
                if(words[j].includes(predict)||predict.includes(words[j])){
                    if(exmps[i][1]!==""){
                        result = words[j];
                    }
                }
            }}
        if(!result){
            let defs_ = partsOfList(list,"defs")
            let words = partsOfList(list,"words")
            for(let i=0;i<defs.length;i++){
                for(let j=0;j<defs_.length;j++){
                    if(defs_[j].includes(defs[i])||defs[i].includes(defs_[j])){
                        return words[j];
                    }
                }
            }
            undetected_routing();
        }
        else{
            return result;
        }

    }
}

function cleanExmp(exmp,mode){
    let temp = [],blank,reformExmp;
    let div="*taken*";
    if(mode=="bee"){
        if(exmp.children.length>0){
            blank = exmp.children[0].innerText
        }
        else{
            if(exmp.innerText.split("<b>")[1]!==undefined){
                blank =`<b>${exmp.innerText.split("<b>")[1].split("</b>")[0]}</b>`;
            }
            else{
                undetected_routing();
            }
        }
        reformExmp = exmp.innerText.split(blank).join(div);
    }
    else if(mode=="list"){
        if(exmp.children.length==1){
            blank = exmp.children[0].innerText;
        }
        else if(exmp.children.length>1){
            for(let i=0;i<exmp.children.length;i++){
                if(exmp.children[i].tagName=="STRONG"){
                    blank = exmp.children[i].innerText;
                }
            }
        }
        reformExmp = exmp.innerText.split(blank).join(div)
    }
    temp.push(blank,reformExmp.split(" ").join(""));
    return temp;
}

function getDefs(defs){
    let temp = [];
    for(let i=0;i<defs.length;i++){
        if(defs[i].children.length>0){
            let blank = defs[i].children[0].innerText;
            let arr=defs[i].innerText.split(blank);
            let result = arr.sort(
                function (a, b) {
                    return b.length - a.length;
                }
            )[0];
            temp.push(result);
        }
        else{
            temp.push(defs[i].innerText)
        }
    }
    if(temp.length>0){
        return temp;
    }
    return false;
}

function partsOfList(listId,part){
    let words = [];
    let defs = [];
    let examples = [];
    for(let i=0;i<words_defs.length;i++){
        if(words_defs[i].list==listId){
            if(!words.includes(words_defs[i].word)){
                words.push(words_defs[i].word)
            }
            defs.push(words_defs[i].def)
            if(!examples.includes(words_defs[i].example)){
                examples.push(words_defs[i].example)
            }
        }
        if(words_defs.length-1==i){
            if(part=="words"){
                return words;
            }
            if(part=="defs"){
                return defs;
            }
            if(part=="examples"){
                return examples;
            }
        }
    }
}



function undetected_routing(){
    let logo = document.getElementsByClassName("main")[0].children[0].children[0];
    let lists_ = document.getElementsByClassName("listsTab")[0].children[0];
    if(location.href.includes("/bee")){
        localStorage.setItem("route_bee","lists");
        setTimeout(()=>{
            logo.click();
        },1000)
    }
    if(location.href.includes("/play/")){
        if(localStorage.getItem("route_bee")!==null){
            if(localStorage.getItem("route_bee")=="lists"){
                setTimeout(()=>{
                    lists_.click();
                },1000)
            }
        }
    }
    if(location.href.includes("https://www.vocabulary.com/lists/")){
        if(localStorage.getItem("route_bee")!==null){
            if(localStorage.getItem("route_bee")=="lists"){
                setTimeout(()=>{
                    randList();
                },1000)
            }
        }
    }
}


function randList(){
    let actions = document.getElementsByClassName("actions"),random;
    if(document.getElementsByClassName("button bee")[0]!==undefined){
        let bees = document.getElementsByClassName("button bee");
        random = bees[Math.floor(Math.random() * bees.length)];
    }
    else if(document.getElementsByClassName("bee")[0]!==undefined){
        random = document.getElementsByClassName("bee")[0].children[2].children[0];
    }
    else{
        random = actions[Math.floor(Math.random() * actions.length)].children[0];
    }
    random.click();
}



function human_Enter(elem,word,delay){
    elem.value="";
    //console.log(word);
    let word_ = word.split("");
    for(let i=0;i<word_.length;i++){
        setTimeout(()=>{
            simKey(elem,word_[i]);
            elem.value+=word_[i];
        },delay)
        humanInput = true;
    }
}

function simKey(elem,key){
    elem.dispatchEvent(
        new KeyboardEvent("keyup", {key: key})
    );
}




function simClick(element, eventName, coordX, coordY) {
    element.dispatchEvent(new MouseEvent(eventName, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: coordX,
        clientY: coordY,
        button: 0
    }));
};

function humanClick(elem){
    let cordX = getOffset(elem).left
    let cordY = getOffset(elem).top
    simClick(elem, "mouseover", cordX, cordY);
    simClick(elem, "mousedown", cordX, cordY);
    simClick(elem, "mouseup", cordX, cordY);
    simClick(elem, "click", cordX, cordY);
    simClick(elem, "mouseout", cordX, cordY);
}

function getOffset( el ) {
    let _x = 0,_y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}








