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
    scene1: `
   o
  /|\\
  / \\
 (You walking)
    `,
    scene2: `
   o
  /|\\
  / \\
 (NPC2 greeting)
    `,
    sceneNPC3: `
   o
  /|\\
  / \\
 (NPC3 selling)
    `,
    scene3: `
   o
  /|\\
  / \\
 (Courthouse)
    `,
    scene4Normal: `
   o
  /|\\
  / \\
 (Evening saloon)
    `,
    scene4NPC1Followup: `
   o
  /|\\
  / \\
 (NPC1 bruised)
    `,
    sceneBattle: `
 o   o
/|\\ /|\\
/ \\ / \\
(Battle)
    `,
    finalScene: `
   o
  /|\\
  / \\
 (Reflection)
    `
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
    textBox.innerHTML = "";

    hideChoices();
    showSkipHint();

    textBox.innerHTML = `<pre style="color: green; text-align:center;">${stick}</pre>\n<div class="text-box-inner">${text}</div>`;

    let i = 0;
    const speed = 25;
    const innerDiv = textBox.querySelector(".text-box-inner");
    const fullText = text;

    innerDiv.innerHTML = "";

    function type() {
        if (i < fullText.length) {
            innerDiv.innerHTML += fullText.charAt(i);
            i++;
            if (skipTyping) {
                innerDiv.innerHTML = fullText;
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

function hideChoices() { choicesDiv.innerHTML = ""; }

// =========================
// ENTER HANDLER
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
function scene1() {
    const lines = [
        "The year is 1851. Mexico has just lost the war, and the United States has taken California. Settlers from all over now flock west, chasing the smell of gold. You walk beside your wagon headed for the Sierra Nevada, hoping for a chance to stake a claim to find some gold.",
        "As you walk, you breathe a smile of relief: after months of grueling travel, you were almost at California.",
        "The people you’ve met traveling the California Trail all said the same thing: This is the place of opportunity. This is where you will have the chance to make the money you need to make you and your family rich.",
        "You give yourself a small smile. This may be the place where your dreams can come true. A place of equal opportunity: where every man could have an equal shot at getting rich. But you must remain vigilant: despite all that those have said to you, you have no idea what you’re getting into.",
        "As you walk, you encounter NPC1, a freedman you’ve encountered many times on your way to California, setting up camp. As it’s getting late, you decide to do the same.",
        "After you finish, you begin chatting with NPC1 about the land ahead.",
        'NPC1: "Back East, I worked fields I would never own. I was just property. Here, they say the land is free. You think it’ll be free for someone like me?"'
    ];

    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], stickFigures.scene1, nextLine);
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
    const lines = [
        "After some time, you finally reach a river valley crowded with tents and rough shacks. You see the Gold Rush in full swing: Americans from the East, European fortune seekers, Chilean and Sonoran miners, Kankakas from the Pacific, and Chinese laborers work the banks.",
        "The hills bear scars where hydraulic hoses and picks have torn the soil. You see remnants of what appear to be native villages burnt to ashes.",
        "A broad-shouldered man with a faded militia jacket walks up to you.",
        'NPC2: "The name’s NPC2. When I rode in ‘49, this valley was full of camps. Governor said they wanted to make it safe for settlers. We took care of that. State paid us per head."'
    ];

    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], stickFigures.scene2, nextLine);
            i++;
        } else {
            showChoices([
                { text: "Approve", response: "NPC2 nods approvingly and remembers your stance.", action: sceneNPC3 },
                { text: "Ask about the villages", response: "NPC2 brushes off your question, uninterested.", action: sceneNPC3 },
                { text: "Ask for advice", response: "NPC2 advises caution: avoid areas with other white men staking a claim.", action: sceneNPC3 }
            ]);
        }
    }
    nextLine();
}

function sceneNPC3() {
    const lines = [
        "As you examine the banks, a small group approaches. At their head walks a Maidu woman, carrying woven baskets. You see those behind her carrying items from around the river.",
        'NPC3: "Hello, I am NPC3. The men who came before you cut down our oaks, drove off our game, and turned our water into mud. Our dead still reside here. Whatever we can find, we bring here to sell. Please, will you buy something from us?"'
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
        "Having finally found a place to claim, you begin trying to find gold, but fail. As night falls, you head to the small settlement put together for those searching for gold. You eat and fall asleep, thinking about NPC3.",
        "Next morning, you see new notices being set up outside the courthouse about protection of Indians, Foreign Miner’s Tax, and legal restrictions for evidence.",
        "Inside, you see a hearing underway. A Californio man waves land-grants written in Spanish while a white man argues that under American law, that grant is void.",
        "Judge: 'Your claim lacks the survey and documentation required by the Land Act of 1851. The present settler has demonstrated occupation and improvement under U.S. standards, thus the claim is awarded to him.'",
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
                { text: "Fire at a fleeing figure", response: "The camp is destroyed and burnt down. NPC1 praises your effort. You win a sizeable bounty.", action: finalScene },
                { text: "Fire and purposefully miss", response: "Same destruction occurs. NPC1 is upset and you receive no reward.", action: finalScene },
                { text: "Shield someone physically", response: "A few are saved. NPC1 is extremely upset and promises punishment.", action: finalScene }
            ]);
        }
    }
    nextLine();
}

function finalScene() {
    const reflectionLines = [
        "Fast forward to 1855, the gold is all but gone.",
        "You get an opportunity to talk to NPC1 and reflect on the choices you made.",
        'NPC1: "Based on your actions, here’s what I think about how we all navigated these times..."'
    ];

    let i = 0;
    function nextReflection() {
        if (i < reflectionLines.length) {
            typeText(reflectionLines[i], stickFigures.finalScene, nextReflection);
            i++;
        } else {
            endGame("=== THE END ===");
        }
    }
    nextReflection();
}

function endGame(message) {
    typeText(message, stickFigures.finalScene);
    hideChoices();
    nextLineCallback = null;
}
