document.addEventListener("DOMContentLoaded", () => {

// =========================
// ELEMENTS
// =========================
const startBtn = document.getElementById("start-btn");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const textBox = document.getElementById("text-box");
const choicesDiv = document.getElementById("choices");
const canvas = document.getElementById("scene-canvas");
const ctx = canvas.getContext("2d");

// =========================
// STATE
// =========================
let typing = false;
let skipTyping = false;
let waitingForEnter = false;
let nextLineCallback = null;

// =========================
// CANVAS
// =========================
canvas.width = 800;
canvas.height = 400;

function clearScene() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

// =========================
// SKIP HINT
// =========================
const skipHint = document.createElement("p");
skipHint.style.color="#d4aa70";
skipHint.style.fontSize="13px";
skipHint.style.marginTop="8px";
skipHint.innerText="Press ENTER to continue";
skipHint.style.display="none";
gameScreen.appendChild(skipHint);

function showSkipHint(){ skipHint.style.display="block"; }
function hideSkipHint(){ skipHint.style.display="none"; }

// =========================
// START BUTTON
// =========================
startBtn.addEventListener("click", () => {
    titleScreen.style.display="none";
    gameScreen.style.display="block";
    showSkipHint();
    scene1();
});

// =========================
// TYPEWRITER SYSTEM
// =========================
function typeText(text, onComplete){
    typing=true;
    skipTyping=false;
    waitingForEnter=false;
    textBox.innerHTML="";
    hideChoices();
    showSkipHint();

    let i=0, speed=28;

    function step(){
        if(skipTyping){
            textBox.innerHTML=text;
            finish();
            return;
        }
        if(i<text.length){
            textBox.innerHTML+=text.charAt(i);
            i++;
            setTimeout(step,speed);
        } else finish();
    }
    function finish(){
        typing=false;
        waitingForEnter=true;
        nextLineCallback=onComplete;
    }
    step();
}

// =========================
// CHOICES
// =========================
function showChoices(list){
    choicesDiv.innerHTML="";
    hideSkipHint();
    waitingForEnter=false;

    list.forEach(c=>{
        const btn=document.createElement("button");
        btn.textContent=c.text;
        btn.onclick=()=>typeText(c.response,()=>c.action());
        choicesDiv.appendChild(btn);
    });
}

function hideChoices(){ choicesDiv.innerHTML=""; }

// =========================
// ENTER KEY
// =========================
document.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
        if(typing) skipTyping=true;
        else if(waitingForEnter && nextLineCallback){
            let fn=nextLineCallback;
            nextLineCallback=null;
            waitingForEnter=false;
            fn();
        }
    }
});

// =========================
// DRAW
// =========================
function drawStick(x,y,color="white"){
    ctx.strokeStyle=color;
    ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.stroke();
    ctx.moveTo(x,y+10); ctx.lineTo(x,y+40); ctx.stroke();
    ctx.moveTo(x-12,y+20); ctx.lineTo(x+12,y+20); ctx.stroke();
    ctx.moveTo(x,y+40); ctx.lineTo(x-12,y+60); ctx.stroke();
    ctx.moveTo(x,y+40); ctx.lineTo(x+12,y+60); ctx.stroke();
}
function drawHouse(x,y,w,h){
    ctx.fillStyle="#653";
    ctx.fillRect(x,y,w,h);
    ctx.beginPath();
    ctx.moveTo(x,y); ctx.lineTo(x+w/2,y-h/2); ctx.lineTo(x+w,y);
    ctx.fillStyle="#922"; ctx.fill();
}
function valley(){ ctx.fillStyle="#083"; ctx.fillRect(0,350,800,50); }

// =========================
// VISUAL SCENES
// =========================
const scene1Visual=()=>{clearScene();valley();drawStick(90,260,"#4ac");drawStick(150,260,"#6f4");drawHouse(300,290,60,60);}
const scene2Visual=()=>{clearScene();valley();drawStick(90,260,"#4ac");drawStick(160,260,"#b85");drawHouse(260,285,70,60);}
const npc3Visual  =()=>{clearScene();valley();drawStick(90,260,"#4ac");drawStick(150,260,"#e96");}
const scene3Visual=()=>{clearScene();valley();drawStick(120,260,"#4ac");drawHouse(310,290,50,50);}
const saloonVisual=()=>{clearScene();valley();drawStick(110,260,"#4ac");drawStick(180,260,"#b85");}
const battleVisual=()=>{clearScene();valley();drawStick(90,260,"#4ac");drawStick(170,260,"#6f4");drawHouse(320,285,60,60);}
const npc4Visual = () => {clearScene();valley();drawStick(90,260,"#4ac");drawStick(150,260,"#c84");drawHouse(300,290,60,60); };
const finalVisual =()=>{clearScene();valley();drawStick(120,260,"#4ac");}

// =========================
// GAME SCENES
// =========================

function scene1() {
    scene1Visual();
    const lines = [
        "The year is 1851. Mexico has just lost the war, and the United States has taken California...",
        "As you walk, you breathe a smile of relief...",
        "The people you’ve met traveling the California Trail all said the same thing...",
        "You give yourself a small smile. This may be the place where your dreams can come true...",
        "As you walk, you encounter NPC1, a freedman you’ve encountered many times on your way to California...",
        "After you finish, you begin chatting with NPC1 about the land ahead.",
        'NPC1: "Back East, I worked fields I would never own... Here, they say the land is free..."'
    ];
    let i = 0;
    function nextLine() {
        if (i<lines.length) {
            nextLineCallback = nextLine;
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Of course it's free", response: "NPC1 nods quietly, a small hopeful smile on his face.", action: scene2 },
                { text: "Not sure", response: "NPC1 shrugs, uncertain, but maintains a quiet optimism.", action: scene2 },
                { text: "I don’t care about what others think", response: "NPC1 looks at you, takes a deep breath, but continues with a quiet optimism.", action: scene2 }
            ]);
        }
    }
    nextLine();
}

function scene2() {
    scene2Visual();
    const lines = [
        "After some time, you finally reach a river valley crowded with tents and rough shacks...",
        "The hills bear scars where hydraulic hoses and picks have torn the soil...",
        'NPC2: "The name’s NPC2. When I rode in ‘49, this valley was full of camps..."'
    ];
    let i=0;
    function nextLine() {
        if (i<lines.length) {
            nextLineCallback = nextLine;
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Approve", response: "NPC2 nods approvingly.", action: sceneNPC3 },
                { text: "Ask about the villages", response: "NPC2 brushes off your question.", action: sceneNPC3 },
                { text: "Ask for advice", response: "NPC2 advises caution.", action: sceneNPC3 }
            ]);
        }
    }
    nextLine();
}

function sceneNPC3() {
    npc3Visual();
    const lines = [
        "As you examine the banks, a small group approaches...",
        'NPC3: "Hello, I am NPC3. The men who came before you cut down our oaks..."'
    ];
    let i=0;
    function nextLine() {
        if(i<lines.length){
            nextLineCallback = nextLine;
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Buy and listen", response: "NPC3 thanks you and shares more.", action: scene3 },
                { text: "Dismiss her", response: "NPC3 leaves quietly.", action: scene3 },
                { text: "Reassure but don't buy", response: "NPC3 seems unhappy but nods silently.", action: scene3 }
            ]);
        }
    }
    nextLine();
}

function scene3() {
    scene3Visual();
    const lines = [
        "Having finally found a place to claim, you begin trying to find gold...",
        "Next morning, you see new notices being set up outside the courthouse...",
        "Inside, you see a hearing underway...",
        "Judge: 'Your claim lacks the survey and documentation required by the Land Act of 1851...'",
        "NPC1 looks to you, almost expecting you to say something."
    ];
    let i=0;
    function nextLine() {
        if(i<lines.length){
            nextLineCallback = nextLine;
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Praise the ruling", response: "NPC1 scoffs and turns away.", action: scene4Normal },
                { text: "Quietly approach the family", response: "NPC1 gives you a more positive look.", action: scene4NPC1Followup },
                { text: "Turn away", response: "NPC1 gives you a strange look.", action: scene4Normal },
                { text: "Object to the trial", response: "NPC2 comes up extremely unhappy and threatens you.", action: scene4NPC1Followup }
            ]);
        }
    }
    nextLine();
}
function scene4Normal() {
    saloonVisual();
    const lines = [
        "Evening outside the saloon. NPC2 reads a notice about an expedition."
    ];
    let i = 0;
    function nextLine() {
        if(i<lines.length){
            nextLineCallback = nextLine;
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Join fully", response: "You join the expedition fully.", action: sceneBattle },
                { text: "Refuse", response: "You refuse. Nothing changes today.", action: () => endGame("You refused the expedition. Nothing changes today.") },
                { text: "Join but won’t shoot unless needed", response: "You join but promise to avoid killing unless necessary.", action: sceneBattle }
            ]);
        }
    }
    nextLine();
}

// =========================
// SCENE 4 NPC1 FOLLOW-UP PATH
// =========================
function scene4NPC1Followup() {
    npc4Visual();
    const lines = [
        "NPC1 approaches you later that day, covered in scratches and bruises."
    ];
    let i = 0;
    function nextLine() {
        if(i<lines.length){
            nextLineCallback = nextLine;
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Blame him", response: "Distance grows between you and NPC1. NPC1 leaves.", action: scene4Normal },
                { text: "Promise to testify for him", response: "NPC1 thanks you sincerely.", action: scene4Normal },
                { text: "Tell him he should move on", response: "NPC1 gets upset and leaves.", action: scene4Normal }
            ]);
        }
    }
    nextLine();
}

// =========================
// SCENE BATTLE
// =========================
function sceneBattle() {
    battleVisual();
    const lines = [
        "At dawn, you ride into the hills with NPC1 and several others. You find the camp filled with small shelters.",
        "Gunfire erupts. People scatter. What will you do?"
    ];
    let i = 0;
    function nextLine() {
        if(i<lines.length){
            nextLineCallback = nextLine;
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Fire at a fleeing figure", response: "The camp is destroyed and burnt down. NPC1 praises your effort. You win a sizeable bounty.", action: finalScene },
                { text: "Fire and purposefully miss", response: "Same destruction occurs. NPC1 is upset and you receive no reward.", action: finalScene },
                { text: "Shield someone physically", response: "A few are saved. NPC1 is extremely upset and promises punishment.", action: finalScene }
            ]);
        }
    }
    nextLine();
}

// =========================
// FINAL SCENE / REFLECTION
// =========================
function finalScene() {
    finalVisual();
    const reflectionLines = [
        "Fast forward to 1855, the gold is all but gone.",
        "You get an opportunity to talk to NPC1 and reflect on the choices you made.",
        'NPC1: "Based on your actions, here’s what I think about how we all navigated these times..."'
    ];
    let i = 0;
    function nextReflection() {
        if(i<reflectionLines.length){
            nextLineCallback = nextReflection;
            typeText(reflectionLines[i], nextReflection);
            i++;
        } else {
            endGame("=== THE END ===");
        }
    }
    nextReflection();
}

// =========================
// END GAME
// =========================
function endGame(message){
    typeText(message);
    hideChoices();
    clearScene();
}
});