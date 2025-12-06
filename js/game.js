const textOutput = document.getElementById("text-output");
const choicesDiv = document.getElementById("choices");

// TYPEWRITER TEXT SYSTEM -------------------------------
function typeText(text, callback) {
    const box = document.getElementById("text-box");
    const choices = document.getElementById("choices");
    box.innerHTML = "";
    choices.innerHTML = ""; // hide buttons until finished

    let i = 0;
    let speed = 32; // typing delay
    function type() {
        if (i < text.length) {
            box.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) callback();
    }
    type();
}

// Display choices
function showChoices(choices) {
    choicesDiv.innerHTML = "";
    choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.className = "choice-btn";
        btn.onclick = () => choice.action();
        choicesDiv.appendChild(btn);
    });
}

// Scene 1
function scene1() {
    typeText(`The year is 1851. Mexico has just lost the war, and the United States has taken California.
You walk beside your wagon headed for the Sierra Nevada, chasing the smell of gold.

You encounter NPC1, a freedman setting up camp.
NPC1: "Back East, I worked fields I would never own. I was just property.
Here, they say the land is free. You think it'll be free for someone like me?"`);

    showChoices([
        { text: "Of course it's free", action: () => { scene2(); } },
        { text: "Not sure", action: () => { scene2(); } },
        { text: "I don’t care about what others think", action: () => { scene2(); } }
    ]);
}

// Scene 2
function scene2() {
    typeText(`You reach a river valley crowded with tents and rough shacks.
Gold Rush is in full swing.

NPC2, a militia man, approaches.
NPC2: "The name’s NPC2. State paid us per head to keep settlers safe."`);

    showChoices([
        { text: "Approve", action: () => { sceneNPC3(); } },
        { text: "Ask about the villages", action: () => { sceneNPC3(); } },
        { text: "Ask for advice", action: () => { sceneNPC3(); } }
    ]);
}

// Scene NPC3
function sceneNPC3() {
    typeText(`A Maidu woman approaches carrying baskets.
NPC3: "The men who came before you cut down our oaks, drove off our game, and turned the water into mud.
Will you buy something from us?"`);

    showChoices([
        { text: "Buy and listen", action: () => { scene3(); } },
        { text: "Dismiss her", action: () => { scene3(); } },
        { text: "Reassure but don't buy", action: () => { scene3(); } }
    ]);
}

// Scene 3
function scene3() {
    typeText(`You find a place to claim, but your gold search fails. Night falls.
Next morning, you see new notices outside the courthouse about:
- Protection of Indians
- Foreign Miner’s Tax
- Legal restrictions for evidence

Inside, a hearing is underway. The judge rules in favor of the settler.
NPC1 watches, expecting your response.`);

    showChoices([
        { text: "Praise the ruling", action: () => { scene4(); } },
        { text: "Object", action: () => { scene4(); } }
    ]);
}

// Scene 4
function scene4() {
    typeText(`Evening outside the saloon. NPC2 reads a notice about an expedition.
NPC2: "Player. Your standing on land men like us cleared. Are you riding with us?"`);

    showChoices([
        { text: "Join fully", action: () => { sceneBattle(); } },
        { text: "Refuse", action: () => { endGame("You refused the expedition. Nothing changes today."); } },
        { text: "Join but won’t shoot unless needed", action: () => { sceneBattle(); } }
    ]);
}

// Scene Battle
function sceneBattle() {
    typeText(`Dawn. You ride into the hills. Camp found. Firing begins! What do you do?`);

    showChoices([
        { text: "Fire at a fleeing figure", action: () => { endGame("The camp is destroyed. You gain bounty but at moral cost."); } },
        { text: "Fire over their heads", action: () => { endGame("The camp is destroyed. You avoid killing but others die. NPC1 is upset."); } },
        { text: "Shield someone physically", action: () => { endGame("A few are saved. Most still die. NPC1 is angry."); } }
    ]);
}

// End Game
function endGame(message) {
    typeText(`${message}\n\n=== END OF GAME ===`);
    choicesDiv.innerHTML = "";
}

// Start the game
scene1();
