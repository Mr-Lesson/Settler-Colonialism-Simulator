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
// CANVAS SETUP
// =========================
canvas.width = 800;
canvas.height = 400;
ctx.fillStyle = "#000"; // default black lines
ctx.strokeStyle = "#000";
ctx.lineWidth = 2;

// Clear canvas function
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// =========================
// SKIP HINT
// =========================
const skipHint = document.createElement("p");
skipHint.id = "skip-hint";
skipHint.style.fontSize = "14px";
skipHint.style.color = "#d4aa70";
skipHint.style.marginTop = "5px";
skipHint.innerText = "Press Enter to skip/continue";
skipHint.style.display = "none";
gameScreen.appendChild(skipHint);

function showSkipHint() { skipHint.style.display = "block"; }
function hideSkipHint() { skipHint.style.display = "none"; }

// =========================
// START GAME
// =========================
    startBtn.addEventListener("click", () => {
        titleScreen.style.display = "none";
        gameScreen.style.display = "block";
        clearCanvas(); // clear canvas for first scene
        showSkipHint();
        scene1(); // Start your first scene
    });

// =========================
// TYPEWRITER TEXT
// =========================
function typeText(text, callback) {
    typing = true;
    skipTyping = false;
    waitingForEnter = false;
    textBox.innerHTML = "";

    hideChoices(); // hide choices while typing
    showSkipHint();

    let i = 0;
    const speed = 25;

    function type() {
        if (i < text.length) {
            textBox.innerHTML += text.charAt(i);
            i++;
            if (skipTyping) {
                textBox.innerHTML = text;
                typing = false;
                waitingForEnter = true;
                nextLineCallback = callback;
                return;
            }
            setTimeout(type, speed);
        } else {
            typing = false;
            waitingForEnter = true;
            nextLineCallback = callback;
        }
    }

    type();
}

// =========================
// CHOICES
// =========================
function showChoices(choices) {
    hideSkipHint(); // hide hint during choices
    waitingForEnter = false;
    choicesDiv.innerHTML = "";

    choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.className = "choice-btn";
        btn.onclick = () => {
            typeText(choice.response, () => choice.action());
        };
        choicesDiv.appendChild(btn);
    });
}

function hideChoices() { choicesDiv.innerHTML = ""; }

// =========================
// ENTER KEY HANDLER
// =========================
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (typing) {
            skipTyping = true; // skip current text
        } else if (waitingForEnter && nextLineCallback) {
            const cb = nextLineCallback;
            nextLineCallback = null;
            waitingForEnter = false;
            cb(); // go to next line
        }
    }
});


// =========================
// CANVAS DRAWING
// =========================
function clearScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawStickFigure(x, y, color="black") {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Head
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI*2);
    ctx.stroke();

    // Body
    ctx.moveTo(x, y+10);
    ctx.lineTo(x, y+40);
    ctx.stroke();

    // Arms
    ctx.moveTo(x-15, y+20);
    ctx.lineTo(x+15, y+20);
    ctx.stroke();

    // Legs
    ctx.moveTo(x, y+40);
    ctx.lineTo(x-15, y+60);
    ctx.moveTo(x, y+40);
    ctx.lineTo(x+15, y+60);
    ctx.stroke();
}

function drawHouse(x, y, w, h, color="brown") {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w/2, y - h/2);
    ctx.lineTo(x+w, y);
    ctx.closePath();
    ctx.fillStyle="red";
    ctx.fill();
}

function drawValley() {
    ctx.fillStyle="green";
    ctx.fillRect(0, canvas.height-50, canvas.width, 50);
}

// =========================
// SCENE VISUALS
// =========================
function scene1Visuals() {
    clearScene();
    drawValley();
    drawStickFigure(100, 250, "blue"); // player
    drawStickFigure(150, 250, "green"); // NPC1
    drawHouse(300, 270, 50, 50); // shack
}

function scene2Visuals() {
    clearScene();
    drawValley();
    drawStickFigure(120, 250, "blue"); // player
    drawStickFigure(180, 250, "brown"); // NPC2
    drawHouse(250, 270, 60, 60);
    drawHouse(350, 270, 40, 40);
}

function sceneNPC3Visuals() {
    clearScene();
    drawValley();
    drawStickFigure(100, 250, "blue"); // player
    drawStickFigure(150, 250, "orange"); // NPC3
}

function scene3Visuals() {
    clearScene();
    drawValley();
    drawStickFigure(120, 250, "blue"); // player
    drawHouse(300, 270, 50, 50); // settlement
}

function scene4Visuals() {
    clearScene();
    drawValley();
    drawStickFigure(100, 250, "blue");
    drawStickFigure(150, 250, "brown");
}

function sceneBattleVisuals() {
    clearScene();
    drawValley();
    drawStickFigure(100, 250, "blue");
    drawStickFigure(150, 250, "green");
    drawHouse(300, 270, 50, 50);
    drawHouse(350, 270, 40, 40);
}

function finalSceneVisuals() {
    clearScene();
    drawValley();
    drawStickFigure(100, 250, "blue");
    drawStickFigure(150, 250, "green");
    drawHouse(300, 270, 50, 50);
}

// =========================
// SCENES
// =========================
function scene1() {
    scene1Visuals();
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
    scene2Visuals();
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
    sceneNPC3Visuals();
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
    scene3Visuals();
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
    scene4Visuals();
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
    scene4Visuals();
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
    sceneBattleVisuals();
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
    finalSceneVisuals();
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
