// ==UserScript==
// @name         Vocabulary.com Queen Bee
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically answers spelling bee questions. Has 99% success rate.
// @author       GSRHackZ
// @match        https://www.vocabulary.com/*
// @icon         https://i.ibb.co/YyGc2sH/queen-bee-removebg-preview.png
// @grant        none
// ==/UserScript==

let url = window.location.href,list=url.split("/")[4],lists=[],words_defs=[],inProgress=false,lookOut=[];

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
                        localStorage.setItem("words&defs_bee",JSON.stringify(words_defs));
                        lists.push(list);
                        localStorage.setItem("lists_bee",JSON.stringify(lists));
                        grabbed=true;
                    })
                    fake.click();
                }
            }
            if(list.trim().length>0){
                if(grabbed){
                    bee.click();
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
        bot()
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
                if(!defs||!exmps||exmps==undefined){
                    location.href=`/lists/${Math.floor(Math.random()*5000000)+1000000}`
                }
                //console.log(exmp,partsOfList(list,"examples"),partsOfList(list,"words"),defs_)
                if(exmps!==undefined){
                    let div = 2;
                    let rem = Math.floor(Number(document.getElementsByClassName("stats")[1].innerText.split(":\n")[1]/div));
                    if(rem>=100){
                        div=5;
                    }
                    if(surrendered>Math.floor(Number(document.getElementsByClassName("stats")[1].innerText.split(":\n")[1]/div))){
                        location.href=`/lists/${Math.floor(Math.random()*5000000)+1000000}`
                    }
                    let inLookOut = exmps;
                    for(let i=0;i<lookOut.length;i++){
                        if(same(lookOut[i][0],defs)){
                            if(lookOut[i][1]!==null){
                                if(getWord_(lookOut[i][1])!==false){
                                    inLookOut = getWord_(lookOut[i][1]);
                                }
                                else{
                                    location.href=`/lists/${Math.floor(Math.random()*5000000)+1000000}`
                                }
                            }
                            else{
                                location.href=`/lists/${Math.floor(Math.random()*5000000)+1000000}`
                            }
                        }
                    }
                    inp.value = exmps;
                    setTimeout(function(){
                        spell.click();
                    },700)
                    setTimeout(function(){
                        if(surrender.disabled){
                            nxt.click();
                            inProgress = false;
                        }
                        else{
                            surrender.click();
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
                                        lookOut.push([defs,corrSpell,list]);
                                        localStorage.setItem("lookOut",JSON.stringify(lookOut));
                                    }
                                }
                                nxt.click();
                                inProgress = false;
                            },500)
                        }
                    },100)
                }
                else{
                    location.href=`/lists/${Math.floor(Math.random()*5000000)+1000000}`
                }
            }
        }
        else{
            clearInterval(bot);
            console.log("Queen Bee go buzz buzz 😋!");
            setTimeout(function(){
                location.href=`/lists/${Math.floor(Math.random()*5000000)+1000000}`
            },500)
        }
    },1000)

    }

if(location.href.includes("https://www.vocabulary.com/lists/")){
    setTimeout(function(){
        if(document.getElementsByClassName("page_notfound")[0]!==undefined||document.getElementsByClassName("notlearnable limited-width with-header-margin")[0]!==undefined){
            location.href=`/lists/${Math.floor(Math.random()*5000000)+1000000}`
        }
    },1000)
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
            location.href=`/lists/${Math.floor(Math.random()*5000000)+1000000}`
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
                location.href=`/lists/${Math.floor(Math.random()*5000000)+1000000}`
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
