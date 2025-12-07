// =========================
// ELEMENTS
// =========================
const startBtn = document.getElementById("start-btn");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const textBox = document.getElementById("text-box");
const choicesDiv = document.getElementById("choices");

// =========================
// STATE
// =========================
let typing = false;
let skipTyping = false;
let waitingForEnter = false;
let nextLineCallback = null;

// =========================
// STICK FIGURES
// =========================
const stickFigures = {
    scene1: "   o\n  /|\\\n  / \\\n(You walking)",
    scene2: "   o\n  /|\\\n  / \\\n(NPC2 greeting)",
    sceneNPC3: "   o\n  /|\\\n  / \\\n(NPC3 selling)",
    scene3: "   o\n  /|\\\n  / \\\n(Courthouse)",
    scene4Normal: "   o\n  /|\\\n  / \\\n(Evening saloon)",
    scene4NPC1Followup: "   o\n  /|\\\n  / \\\n(NPC1 bruised)",
    sceneBattle: " o   o\n/|\\ /|\\\n/ \\ / \\\n(Battle)",
    finalScene: "   o\n  /|\\\n  / \\\n(Reflection)"
};

// =========================
// SKIP HINT
// =========================
const skipHint = document.createElement("p");
skipHint.id = "skip-hint";
skipHint.style.fontSize = "14px";
skipHint.style.color = "#d4aa70";
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
    scene1();
});

// =========================
// TYPEWRITER TEXT
// =========================
function typeText(text, stick, callback) {
    typing = true;
    skipTyping = false;
    waitingForEnter = false;

    choicesDiv.innerHTML = ""; // hide choices while typing
    showSkipHint();

    textBox.innerHTML = `<pre style="text-align:center; color:green;">${stick}</pre><div class="text-box-inner"></div>`;
    const innerDiv = textBox.querySelector(".text-box-inner");

    let i = 0;
    function type() {
        if (i < text.length) {
            innerDiv.innerHTML += text.charAt(i);
            i++;
            if (skipTyping) {
                innerDiv.innerHTML = text;
                typing = false;
                waitingForEnter = true;
                nextLineCallback = callback;
                return;
            }
            setTimeout(type, 25);
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
    hideSkipHint();
    waitingForEnter = false;
    choicesDiv.innerHTML = "";
    choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.className = "choice-btn";
        btn.onclick = () => {
            typeText(choice.response, "", () => choice.action());
        };
        choicesDiv.appendChild(btn);
    });
}

// =========================
// ENTER HANDLER
// =========================
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (typing) skipTyping = true;
        else if (waitingForEnter && nextLineCallback) {
            const cb = nextLineCallback;
            nextLineCallback = null;
            waitingForEnter = false;
            cb();
        }
    }
});

// =========================
// SCENES
// =========================
function scene1() {
    const lines = [
        "The year is 1851. Mexico has just lost the war, and the United States has taken California.",
        "You walk beside your wagon headed for the Sierra Nevada, hoping to stake a claim.",
        'NPC1: "Back East, I worked fields I would never own. Here, they say the land is free. Think it’ll be free for me?"'
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], stickFigures.scene1, nextLine);
            i++;
        } else {
            showChoices([
                { text: "Of course it's free", response: "NPC1 nods quietly, a small hopeful smile on his face.", action: scene2 },
                { text: "Not sure", response: "NPC1 shrugs, uncertain, but maintains a quiet optimism.", action: scene2 }
            ]);
        }
    }
    nextLine();
}

function scene2() {
    const lines = [
        "After some time, you reach a river valley crowded with tents and rough shacks.",
        'NPC2: "The name’s NPC2. We took care of things here and got paid per head."'
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], stickFigures.scene2, nextLine);
            i++;
        } else {
            showChoices([
                { text: "Approve", response: "NPC2 nods approvingly.", action: sceneNPC3 },
                { text: "Ask about villages", response: "NPC2 brushes off your question.", action: sceneNPC3 }
            ]);
        }
    }
    nextLine();
}

function sceneNPC3() {
    const lines = [
        "A Maidu woman approaches, carrying woven baskets.",
        'NPC3: "Hello, I am NPC3. Our dead still reside here. Will you buy something from us?"'
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], stickFigures.sceneNPC3, nextLine);
            i++;
        } else {
            showChoices([
                { text: "Buy and listen", response: "NPC3 thanks you and shares more about their story.", action: scene3 },
                { text: "Dismiss her", response: "NPC3 leaves quietly, disappointed.", action: scene3 },
                { text: "Reassure but don't buy", response: "NPC3 seems unhappy but nods silently.", action: scene3 }
            ]);
        }
    }
    nextLine();
}

function scene3() {
    const lines = [
        "Having found a place to claim, you begin trying to find gold, but fail.",
        "Next morning, you see notices outside the courthouse about protection of Indians and legal restrictions.",
        "Inside, a hearing is underway.",
        "Judge: 'Your claim lacks documentation. The present settler demonstrated occupation and improvement; thus, the claim is awarded to him.'",
        "NPC1 looks to you, almost expecting you to say something."
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], stickFigures.scene3, nextLine);
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
    typeText("Evening outside the saloon. NPC2 reads a notice about an expedition.", stickFigures.scene4Normal, () => {
        showChoices([
            { text: "Join fully", response: "You join the expedition fully.", action: sceneBattle },
            { text: "Refuse", response: "You refuse. Nothing changes today.", action: () => endGame("You refused the expedition. Nothing changes today.") },
            { text: "Join but won’t shoot unless needed", response: "You join but promise to avoid killing unless necessary.", action: sceneBattle }
        ]);
    });
}

function scene4NPC1Followup() {
    typeText("NPC1 approaches you later that day, covered in scratches and bruises.", stickFigures.scene4NPC1Followup, () => {
        showChoices([
            { text: "Blame him", response: "Distance grows between you and NPC1. NPC1 leaves.", action: scene4Normal },
            { text: "Promise to testify for him", response: "NPC1 thanks you sincerely.", action: scene4Normal },
            { text: "Tell him he should move on", response: "NPC1 gets upset and leaves.", action: scene4Normal }
        ]);
    });
}

function sceneBattle() {
    const lines = [
        "At dawn, you ride into the hills with NPC1 and several others. You find the camp filled with small shelters.",
        "Gunfire erupts. People scatter. What will you do?"
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], stickFigures.sceneBattle, nextLine);
            i++;
        } else {
            showChoices([
                { text: "Fire at a fleeing figure", response: "The camp is destroyed. NPC1 praises your effort.", action: finalScene },
                { text: "Fire and purposely miss", response: "The camp is destroyed. NPC1 is upset and you receive no reward.", action: finalScene },
                { text: "Shield someone physically", response: "A few are saved. NPC1 is extremely upset and promises punishment.", action: finalScene }
            ]);
        }
    }
    nextLine();
}

function finalScene() {
    const lines = [
        "Fast forward to 1855, the gold is all but gone.",
        "You talk to NPC1 and reflect on the choices you made.",
        'NPC1: "Based on your actions, here’s what I think about how we all navigated these times..."'
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], stickFigures.finalScene, nextLine);
            i++;
        } else {
            endGame("=== THE END ===");
        }
    }
    nextLine();
}

function endGame(message) {
    typeText(message, stickFigures.finalScene);
    hideChoices();
    nextLineCallback = null;
}
