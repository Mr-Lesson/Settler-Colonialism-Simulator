// =========================
// ELEMENTS
// =========================
const startBtn = document.getElementById("start-btn");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const textBox = document.getElementById("text-box");
const choicesDiv = document.getElementById("choices");

let typing = false;
let skipTyping = false;
let waitingForEnter = false;
let nextLineCallback = null;

// =========================
// START GAME
// =========================
startBtn.addEventListener("click", () => {
    titleScreen.style.display = "none";
    gameScreen.style.display = "block";
    scene1();
});

// =========================
// SKIP HINT
// =========================
const skipHint = document.createElement("p");
skipHint.id = "skip-hint";
skipHint.style.fontSize = "14px";
skipHint.style.color = "#d4aa70";
skipHint.style.marginTop = "10px";
skipHint.innerText = "Press Enter to continue or skip";
gameScreen.appendChild(skipHint);

function showSkipHint() {
    skipHint.style.display = "block";
}
function typeText(text, callback) {
    typing = true;
    waitingForEnter = false;
    skipTyping = false;
    textBox.innerHTML = "";
    hideChoices();

    showSkipHint(); // always show hint

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

// ENTER handler
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (typing) {
            skipTyping = true;
        } else if (waitingForEnter && nextLineCallback) {
            const cb = nextLineCallback;
            nextLineCallback = null;
            waitingForEnter = false;
            cb();
        }
    }
});


function showChoices(choices) {
    choicesDiv.innerHTML = "";
    choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.className = "choice-btn";
        btn.onclick = () => {
            typeText(choice.response, () => {
                choice.action();
            });
        };
        choicesDiv.appendChild(btn);
    });
    showSkipHint(); // keep hint visible with choices
}

function hideChoices() {
    choicesDiv.innerHTML = "";
}

// =========================
// ENTER KEY HANDLER
// =========================
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (typing) {
            skipTyping = true;
        } else if (waitingForEnter && nextLineCallback) {
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

// Scene 1
function scene1() {
    const lines = [
        "The year is 1851. Mexico has just lost the war, and the United States has taken California. Settlers flock west, chasing the smell of gold.",
        "As you walk, you breathe a smile of relief: after months of grueling travel, you were almost at California.",
        "The people you’ve met traveling the California Trail all said the same thing: This is the place of opportunity.",
        "You give yourself a small smile. This may be the place where your dreams can come true. A place of equal opportunity, where every man could have a shot at getting rich.",
        'As you walk, you encounter NPC1, a freedman you’ve seen many times on your way. Setting up camp, you decide to do the same.',
        'After finishing, you begin chatting with NPC1 about the land ahead.',
        'NPC1: "Back East, I worked fields I would never own. I was just property. Here, they say the land is free. Think it’ll be free for someone like me?"'
    ];

    let i = 0;

    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i]);
            nextLineCallback = nextLine;
            i++;
        } else {
            showChoices([
                { text: "Of course it's free", response: "NPC1 nods quietly, hopeful.", action: scene2 },
                { text: "Not sure", response: "NPC1 shrugs, uncertain but maintains optimism.", action: scene2 },
                { text: "I don’t care", response: "NPC1 looks at you but continues with quiet optimism.", action: scene2 }
            ]);
        }
    }

    nextLine();
}

// Scene 2
function scene2() {
    const lines = [
        "After some time, you reach a river valley crowded with tents and rough shacks.",
        "Gold Rush is in full swing: Americans, Europeans, Chileans, Sonorans, Kankakas, and Chinese laborers work the banks.",
        "The hills bear scars where hydraulic hoses and picks have torn the soil. Remnants of native villages lie burnt to ashes.",
        'A broad-shouldered man with a faded militia jacket walks up to you.',
        'NPC2: "The name’s NPC2. Governor said they wanted to make it safe for settlers. We took care of that. State paid us per head."'
    ];

    let i = 0;

    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i]);
            nextLineCallback = nextLine;
            i++;
        } else {
            showChoices([
                { text: "Approve", response: "NPC2 nods approvingly and remembers your stance.", action: sceneNPC3 },
                { text: "Ask about the villages", response: "NPC2 brushes off your question, uninterested.", action: sceneNPC3 },
                { text: "Ask for advice", response: "NPC2 advises caution: avoid areas with other settlers staking claims.", action: sceneNPC3 }
            ]);
        }
    }

    nextLine();
}

// Scene NPC3
function sceneNPC3() {
    const lines = [
        "As you examine the banks, a small group approaches. At their head walks a Maidu woman carrying woven baskets.",
        "You see those behind her carrying items foraged from around the river.",
        'NPC3: "Hello, I am NPC3. The men who came before you cut down our oaks, drove off our game, and turned our water into mud. Our dead still reside here. Whatever we can find, we bring here to sell. Please, will you buy something from us?"'
    ];

    let i = 0;

    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i]);
            nextLineCallback = nextLine;
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

// Scene 3
function scene3() {
    const lines = [
        "Having finally found a place to claim, you begin trying to find gold, but fail.",
        "As night falls, you head to the small settlement put together for those searching for gold. You eat and fall asleep, thinking about NPC3.",
        "Next morning, you see new notices being set up outside the courthouse about protection of Indians, Foreign Miner’s Tax, and legal restrictions for evidence.",
        "Inside, a hearing is underway. A Californio man waves land-grants written in Spanish while a white man argues the grant is void.",
        "Judge: 'Your claim lacks the survey and documentation required by the Land Act of 1851. The present settler has demonstrated occupation and improvement under U.S. standards, thus the claim is awarded to him.'",
        "NPC1 looks to you, almost expecting you to say something."
    ];

    let i = 0;

    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i]);
            nextLineCallback = nextLine;
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

// Scene 4 normal path
function scene4Normal() {
    typeText("Evening outside the saloon. NPC2 reads a notice about an expedition.");
    nextLineCallback = () => {
        showChoices([
            { text: "Join fully", response: "You join the expedition fully.", action: sceneBattle },
            { text: "Refuse", response: "You refuse. Nothing changes today.", action: () => endGame("You refused the expedition. Nothing changes today.") },
            { text: "Join but won’t shoot unless needed", response: "You join but promise to avoid killing unless necessary.", action: sceneBattle }
        ]);
    };
}

// Scene 4 NPC1 follow-up path
function scene4NPC1Followup() {
    typeText("NPC1 approaches you later that day, covered in scratches and bruises.");
    nextLineCallback = () => {
        showChoices([
            { text: "Blame him", response: "Distance grows between you and NPC1. NPC1 leaves.", action: scene4Normal },
            { text: "Promise to testify for him", response: "NPC1 thanks you sincerely.", action: scene4Normal },
            { text: "Tell him he should move on", response: "NPC1 gets upset and leaves.", action: scene4Normal }
        ]);
    };
}

// Scene Battle
function sceneBattle() {
    const lines = [
        "At dawn, you ride into the hills with NPC1 and several others. You find the camp filled with small shelters.",
        "Gunfire erupts. People scatter. What will you do?"
    ];

    let i = 0;

    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i]);
            nextLineCallback = nextLine;
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

// Final Scene / Reflection
function finalScene() {
    const lines = [
        "Fast forward to 1855, the gold is all but gone.",
        "You get an opportunity to talk to NPC1 and reflect on the choices you made.",
        'NPC1: "Based on your actions, here’s what I think about how we all navigated these times..."'
    ];

    let i = 0;

    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i]);
            nextLineCallback = nextLine;
            i++;
        } else {
            endGame("=== THE END ===");
        }
    }

    nextLine();
}

// End Game
function endGame(msg) {
    typeText(msg);
    hideChoices();
    nextLineCallback = null;
}
