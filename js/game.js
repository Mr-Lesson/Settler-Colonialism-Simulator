document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");
    const titleScreen = document.getElementById("title-screen");
    const gameScreen = document.getElementById("game-screen");
    const textBox = document.getElementById("text-box");
    const choicesDiv = document.getElementById("choices");
    const canvas = document.getElementById("scene-canvas");
    const ctx = canvas.getContext("2d");

    let typing = false, skipTyping = false, waitingForEnter = false, nextLineCallback = null;
    let gold = 0, morality = 0, choicesLog = [];

    const CHAR_SIZE = 16;
    const GROUND_Y = 360;
    const HUD = {x:10,y:10,width:180,height:50,padding:8,bgColor:"rgba(0,0,0,0.5)",borderColor:"#d4aa70",borderWidth:2,textColor:"#fff",font:"16px monospace"};

    function drawHUD(){
        ctx.fillStyle = HUD.bgColor;
        ctx.fillRect(HUD.x, HUD.y, HUD.width, HUD.height);
        ctx.strokeStyle = HUD.borderColor;
        ctx.lineWidth = HUD.borderWidth;
        ctx.strokeRect(HUD.x, HUD.y, HUD.width, HUD.height);
        ctx.fillStyle = HUD.textColor;
        ctx.font = HUD.font;
        ctx.textBaseline = "top";
        ctx.fillText(`Gold: ${gold}`, HUD.x+HUD.padding, HUD.y+HUD.padding);
        ctx.fillText(`Morality: ${morality}`, HUD.x+HUD.padding, HUD.y+HUD.padding+20);
    }

    function updateHUD(){ drawHUD(); }
    function clearScene(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

    // ---------------- Choices ----------------
    function showChoices(list) {
        choicesDiv.innerHTML = "";
        hideSkipHint();
        waitingForEnter = false;

        choicesDiv.style.display = "flex";
        choicesDiv.style.justifyContent = "center";
        choicesDiv.style.flexWrap = "wrap";
        choicesDiv.style.marginTop = "10px";
        choicesDiv.style.gap = "10px";
        choicesDiv.style.zIndex = 1000;
        choicesDiv.style.position = "relative";

        list.forEach(choice => {
            const btn = document.createElement("button");
            btn.textContent = choice.text;
            btn.style.opacity = 0;
            btn.style.transition = "opacity 0.4s ease";
            btn.addEventListener("click", () => {
                hideChoices();
                if(choice.action) choice.action();
            });
            choicesDiv.appendChild(btn);
            requestAnimationFrame(() => { btn.style.opacity = 1; });
        });
    }

    function hideChoices() { choicesDiv.innerHTML = ""; }

    // ---------------- Background / Scene ----------------
    function drawBackground(){
        clearScene();
        const g = ctx.createLinearGradient(0,0,0,canvas.height);
        g.addColorStop(0,"#a8d8ff");
        g.addColorStop(0.6,"#cfeefc");
        g.addColorStop(1,"#e8f7ee");
        ctx.fillStyle = g;
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // Sun
        ctx.fillStyle = "#ffd24d";
        ctx.beginPath();
        ctx.arc(700,70,28,0,Math.PI*2);
        ctx.fill();

        // Hills
        ctx.fillStyle="#6a8a3f";
        ctx.beginPath();
        ctx.moveTo(0,260);
        ctx.bezierCurveTo(200,200,380,260,800,260);
        ctx.lineTo(800,400); ctx.lineTo(0,400); ctx.fill();
        ctx.fillStyle="#3a7b2f";
        ctx.beginPath();
        ctx.moveTo(0,300);
        ctx.bezierCurveTo(180,250,360,300,800,300);
        ctx.lineTo(800,400); ctx.lineTo(0,400); ctx.fill();

        // Paths
        ctx.fillStyle="#d6b98a";
        ctx.beginPath();
        ctx.moveTo(40,360);
        ctx.quadraticCurveTo(200,320,360,360);
        ctx.quadraticCurveTo(520,400,760,360);
        ctx.lineTo(760,390);
        ctx.quadraticCurveTo(520,410,360,390);
        ctx.quadraticCurveTo(200,370,40,390);
        ctx.closePath();
        ctx.fill();

        drawHUD();
    }

    function getGroundY(x, layer="foreground") {
        let y = 360;
        if(layer === "hills") {
            if(x <= 380){ const t = (x-0)/380; y=(1-t)*(1-t)*260+2*(1-t)*t*200+t*t*260; }
            else if(x <= 520){ const t = (x-380)/(520-380); y=(1-t)*260+t*300; }
            else{ const t = (x-520)/(800-520); y=(1-t)*300+t*260; }
        } else if(layer === "foreground"){
            if(x<=40) y=390; else if(x<=200){ const t=(x-40)/(200-40); y=(1-t)*390+t*370; }
            else if(x<=360){ const t=(x-200)/(360-200); y=(1-t)*370+t*390; }
            else if(x<=520){ const t=(x-360)/(520-360); y=(1-t)*390+t*410; }
            else if(x<=760){ const t=(x-520)/(760-520); y=(1-t)*410+t*390; }
            else y=390;
        } else if(layer==="river"){
            if(x<=220){ const t=(x-120)/(220-120); y=(1-t)*360+t*280; }
            else if(x<=360){ const t=(x-220)/(360-220); y=(1-t)*280+t*320; }
            else if(x<=500){ const t=(x-360)/(500-360); y=(1-t)*320+t*360; }
            else if(x<=680){ const t=(x-500)/(680-500); y=(1-t)*360+t*320; }
            else y=320;
        }
        return y;
    }

    // ---------------- Objects ----------------
    function drawTree(x,s=22,layer="foreground"){
        const y = getGroundY(x, layer)-s;
        ctx.fillStyle="#2f7b2a";
        ctx.beginPath();
        ctx.moveTo(x,y-s);
        ctx.lineTo(x-s/1.5,y+s/2);
        ctx.lineTo(x+s/1.5,y+s/2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="#6b3e1f";
        ctx.fillRect(x-Math.round(s/6),y+s/2,Math.round(s/3),Math.round(s/1.5));
    }

    function drawHouse(x,w=50,h=40,layer="foreground"){
        const y=getGroundY(x,layer)-h;
        ctx.fillStyle="#7a4a22"; ctx.fillRect(x,y,w,h);
        ctx.fillStyle="#9b2b2b";
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+w/2,y-h/2);
        ctx.lineTo(x+w,y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="#4a2a1f"; ctx.fillRect(x+w/3, y+h/2, w/3, h/2);
    }

    function drawTent(x,w=45,h=35,layer="foreground"){
        const y=getGroundY(x,layer)-h;
        ctx.fillStyle="#ff6b4b";
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x-w/2,y+h);
        ctx.lineTo(x+w/2,y+h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="#a2412a";
        ctx.fillRect(x-2, y+h-8, 4, 8);
    }

    function drawCharacter(x,skin="#f1d1bb",clothes="#4a9",hat=false,tool=false,bag=false,scale=1,layer="foreground"){
        const s=Math.round(CHAR_SIZE*scale);
        const y=getGroundY(x,layer)-Math.round(s*2.8);
        ctx.fillStyle=skin; ctx.fillRect(x,y,s,s);
        ctx.fillStyle=clothes;
        ctx.fillRect(x,y+s,s,Math.round(s*1.6));
        ctx.fillRect(x-Math.round(s/2),y+s,Math.round(s/2),Math.round(s*1.2));
        ctx.fillRect(x+s,y+s,Math.round(s/2),Math.round(s*1.2));
        ctx.fillRect(x,y+Math.round(s*2.6),Math.round(s/2),Math.round(s*1.4));
        ctx.fillRect(x+Math.round(s/2),y+Math.round(s*2.6),Math.round(s/2),Math.round(s*1.4));
        if(hat){ctx.fillStyle="#7a4a22";ctx.fillRect(x-Math.round(s/6),y-Math.round(s/4),Math.round(s*1.3),Math.round(s/4))}
        if(tool){ctx.fillStyle="#8a8a8a";ctx.fillRect(x+s,y+s,Math.max(3,Math.round(s*0.3)),Math.round(s*1.0))}
        if(bag){ctx.fillStyle="#8a6b42";ctx.fillRect(x-Math.round(s/2),y+s,Math.round(s/2),Math.round(s*0.8))}
    }

    function drawJosiah(x, layer="foreground", scale=1) { drawCharacter(x, "#4a2f20", "#2b8a3e", true, false, true, scale, layer); }
    function drawSolomon(x, layer="foreground", scale=1) { drawCharacter(x, "#3a1f16", "#4a2b6b", false, true, false, scale, layer); }

    // ---------------- Courthouse Interior ----------------
function drawCourthouseInterior(){
    clearScene();
    ctx.fillStyle="#2b2317"; ctx.fillRect(0,0,canvas.width,canvas.height);

    // Columns with shadows
    ctx.fillStyle="rgba(255,255,220,0.08)";
    ctx.fillRect(60,40,120,300); ctx.fillRect(620,40,120,300);

    // Judge podium with gradient
    const podiumGrad = ctx.createLinearGradient(260,40,540,80);
    podiumGrad.addColorStop(0,"#3b2d20"); podiumGrad.addColorStop(1,"#5a452d");
    ctx.fillStyle=podiumGrad; ctx.fillRect(260,40,280,40);
    ctx.fillStyle="#cfa06d"; ctx.fillRect(260,80,280,10);

    // Vertical benches (replacing horizontal ones)
    for(let c=0;c<4;c++){
        ctx.fillStyle=`rgba(59,45,32,${0.8 - c*0.15})`;
        ctx.fillRect(100+c*150,120,18,180); // x, y, width, height
    }

    // Ceiling light gradient
    const g=ctx.createRadialGradient(400,70,10,400,70,220);
    g.addColorStop(0,"rgba(255,255,220,0.35)"); g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height);

    drawHUD();
}

    // ---------------- Scene Visuals ----------------

    function scene1Visual(){
        drawBackground();
        drawJosiah(140,"foreground");
        drawCharacter(260,"#f1d1bb","#4a9",false,false,false,1,"foreground");
        drawTent(200,45,35,"foreground");
        drawHouse(520,50,40,"foreground");
        drawTree(680,22,"hills");
        drawTree(100,22,"hills");
    }

    function scene2Visual(){
        drawBackground();
        drawCharacter(130,"#f1d1bb","#4a9",false,false,false,1,"foreground");
        drawCharacter(310,"#f1d1bb","#4a9",false,false,false,1,"foreground");
        drawHouse(470,50,40,"foreground");
        drawTent(610,45,35,"river");
        drawTree(370,20,"hills");
        drawTree(730,18,"hills");
        drawTent(200,40,30,"river");
        drawTent(500,40,35,"river");
    }

    function npc3Visual(){
        drawBackground();
        drawCharacter(150,"#f1d1bb","#4a9",false,false,false,1,"foreground");
        drawCharacter(290,"#f1d1bb","#4a9",false,false,false,1,"foreground");
        drawTent(610,45,35,"river");
        drawTree(430,20,"hills");
        drawTree(730,18,"hills");
        // Extra NPCs behind Aiyana
        drawCharacter(580,"#f1d1bb","#e5a",false,false,false,0.8,"foreground");
        drawCharacter(640,"#f1d1bb","#e5a",false,false,false,0.8,"foreground");
    }


    function courthouseVisual(){
        drawCourthouseInterior();
        drawJosiah(200,"foreground");
        drawSolomon(400,"foreground");
        drawCharacter(600,"#f1d1bb","#4a9",false,false,false,1,"foreground");
    }

    function josiahAndSolomonVisual(){
        drawBackground();
        drawJosiah(150,"foreground");
        drawSolomon(200,"foreground");
        drawCharacter(250,"#f1d1bb","#4a9",false,false,false,1,"foreground");
        drawCharacter(300,"#f1d1bb","#4a9",false,false,false,1,"foreground");
    }

    function saloonVisual(){
        clearScene();
        ctx.fillStyle="#8b5e3c"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#5a3a21"; ctx.fillRect(50,GROUND_Y-60,700,80);
        drawCharacter(150,"#f1d1bb","#4a9",false,false,false,1,"foreground");
        drawCharacter(350,"#f1d1bb","#4a9",false,false,false,1,"foreground");
        drawCharacter(550,"#f1d1bb","#4a9",false,false,false,1,"foreground");
    }
    function battleVisual() {
        clearScene();

        // Dark, ominous sky
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Red glow on ground for danger / fire
        ctx.fillStyle = "rgba(150,0,0,0.5)";
        ctx.fillRect(0, GROUND_Y, canvas.width, 100);

        // Hills in background
        drawTree(50, 18, "hills");
        drawTree(750, 20, "hills");
        drawTree(400, 22, "hills");

        // Village tents and shacks
        drawTent(150, 40, 30, "river");
        drawTent(220, 35, 25, "river");
        drawTent(300, 45, 35, "river");
        drawHouse(500, 50, 40, "foreground");
        drawHouse(600, 48, 36, "foreground");
        drawTent(650, 40, 30, "river");

        // Smoke rising from tents
        for (let i = 0; i < 5; i++) {
            const sx = 150 + i * 100;
            const sy = GROUND_Y - 40 - Math.random() * 20;
            ctx.fillStyle = `rgba(80,80,80,${0.2 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 15 + Math.random() * 10, 30 + Math.random() * 10, Math.random() * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // NPCs fleeing or panicking
        drawCharacter(180, "#f1d1bb", "#e96", false, false, false, 0.8); // fleeing
        drawCharacter(210, "#f1d1bb", "#b85", false, false, false, 0.8);
        drawCharacter(260, "#f1d1bb", "#4ac", false, false, false, 0.8);
        drawCharacter(320, "#f1d1bb", "#e96", false, false, false, 0.8);
        drawCharacter(480, "#f1d1bb", "#b85", false, false, false, 0.8);

        // Player and allies (foreground)
        drawCharacter(200, "#f1d1bb", "#4a9", false, false, false, 1, "foreground"); // player
        drawJosiah(500, "foreground");
        drawCharacter(550, "#f1d1bb", "#4a9", false, false, false, 1, "foreground"); // ally

        // Add fire at some tents
        ctx.fillStyle = "rgba(255,100,0,0.6)";
        ctx.fillRect(150, GROUND_Y - 35, 20, 35);
        ctx.fillRect(300, GROUND_Y - 40, 25, 40);

        // Optional: small flying debris / chaos
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = "rgba(200,150,100,0.5)";
            ctx.beginPath();
            ctx.arc(150 + Math.random()*600, GROUND_Y - 10 - Math.random()*20, 3 + Math.random()*2, 0, Math.PI*2);
            ctx.fill();
        }

        // Draw HUD last
        drawHUD();
    }

        function drawFinalCampfireVisual() {
        clearScene();
        ctx.fillStyle = "#050c1a"; ctx.fillRect(0,0,canvas.width,canvas.height); // darker night sky

        // Hills
        ctx.fillStyle = "#0f1f14";
        ctx.beginPath();
        ctx.moveTo(0,300); ctx.quadraticCurveTo(200,260,400,300); ctx.quadraticCurveTo(600,340,800,300);
        ctx.lineTo(800,400); ctx.lineTo(0,400); ctx.fill();

        // Ground
        ctx.fillStyle="#12220f"; ctx.fillRect(0,320,canvas.width,80);

        // Fire glow
        const fx = 380, fy = 280;
        for (let r = 80; r > 0; r -= 20) {
            const alpha = (80 - r)/120;
            ctx.fillStyle = `rgba(255, ${120 + r}, 50, ${0.08 + alpha})`;
            ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI*2); ctx.fill();
        }

        // Logs
        ctx.fillStyle="#5b3a24"; ctx.fillRect(360,300,60,12); ctx.fillRect(342,310,12,60);

        // NPCs
        drawJosiah(340,"foreground",0.8);
        drawSolomon(380,"foreground",0.8);
        drawCharacter(420,305,"#f1d1bb","#e96",false,false,false,0.75);
        drawCharacter(460,300,"#f1d1bb","#b85",false,false,false,0.75);
    }

    // ---------------- Skip Hint ----------------
    const skipHint = document.createElement("p");
    skipHint.style.cssText = `color:#d4aa70;font-size:14px;margin-top:8px;font-family:'Kalam',cursive;text-align:center;`;
    skipHint.innerText = "Press ENTER to continue";
    skipHint.style.display = "none";

    function showSkipHint(){ skipHint.style.display = "block"; if(!gameScreen.contains(skipHint)) gameScreen.appendChild(skipHint);}
    function hideSkipHint(){ skipHint.style.display = "none"; }

    // ---------------- Typing ----------------
    function typeText(text,onComplete){
        typing=true; skipTyping=false; waitingForEnter=false; textBox.innerHTML=""; hideChoices(); showSkipHint();
        let i=0; const speed=26; textBox.style.color="#f2e6c9";
        function step(){
            if(skipTyping){ textBox.innerHTML=text; finish(); return; }
            if(i<text.length){ textBox.innerHTML+=text.charAt(i); i++; updateHUD(); setTimeout(step,speed); }
            else finish();
        }
        function finish(){ typing=false; waitingForEnter=true; nextLineCallback=onComplete; updateHUD(); }
        step();
    }

    document.addEventListener("keydown", e => {
        if(e.key==="Enter"){
            if(typing) skipTyping=true;
            else if(waitingForEnter && nextLineCallback){ const fn=nextLineCallback; nextLineCallback=null; waitingForEnter=false; fn(); }
        }
    });

    // ---------------- Start ----------------
    const bgMusic = new Audio("audio/a-beautiful-morning-174653.mp3");
    bgMusic.volume = 0.2; bgMusic.loop = true;

    startBtn.addEventListener("click", () => {
        titleScreen.style.display="none";
        gameScreen.style.display="block";
        bgMusic.play().catch(e=>console.log("Music play prevented:",e));
        scene1();
    });



    // =========================
    // NAMES MAPPING
    // =========================
    // Josiah replaces NPC1
    // Elias replaces NPC2
    // Aiyana replaces NPC3
    // Solomon is the Black arrivant

    // =========================
    // SCENES WITH FULL ORIGINAL DIALOGUE + EXTENSIONS
    // =========================

function scene1() {
    bgMusic.volume = 0.2
    scene1Visual();
    const lines = [
        "The year is 1851. Mexico has just lost the war, and the United States has taken California. Settlers from all over now flock west, chasing the smell of gold. You walk beside your wagon headed for the Sierra Nevada, hoping for a chance to stake a claim to find some gold.",
        "As you walk, you breathe a smile of relief: after months of grueling travel, you were almost at California.",
        "The people you’ve met traveling the California Trail all said the same thing: This is the place of opportunity. This is where you will have the chance to make the money you need to make you and your family rich.",
        "You give yourself a small smile. This may be the place where your dreams can come true. A place of equal opportunity: where every man could have an equal shot at getting rich. But you must remain vigilant: despite all that those have said to you, you have no idea what you’re getting into.",
        "As you walk, you encounter Josiah, a freedman you’ve encountered many times on your way to California, setting up camp. As it’s getting late, you decide to do the same.",
        "After you finish, you begin chatting with Josiah about the land ahead.",
        'Josiah: "Back East, I worked fields I would never own. I was just property. Here, they say the land is free. You think it’ll be free for someone like me?"'
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Of course it is free", response: "Josiah nods quietly, a small hopeful smile on his face.", action: () => {
                    choicesLog.push("scene1_answer_A");
                    scene1AfterChoice("A");
                } },
                { text: "Not sure", response: "Josiah shrugs, uncertain, but maintains a quiet optimism.", action: () => {
                    choicesLog.push("scene1_answer_B");
                    scene1AfterChoice("B");
                } },
                { text: "I do not care about what others think", response: "Josiah looks at you, takes a deep breath, but continues with a quiet optimism.", action: () => {
                    choicesLog.push("scene1_answer_C");
                    morality -= 1;
                    scene1AfterChoice("C");
                } }
            ]);
        }
    }
    nextLine();
}

function scene1AfterChoice(choiceKey) {
    bgMusic.volume = 0.2
    if (choiceKey === "A") {
        typeText("Josiah: 'I hope you’re right. It would mean the world.'", () => {
            scene2();
        });
    } else if (choiceKey === "B") {
        typeText("Josiah: 'No one really knows till we are there. But hope keeps folks moving.'", () => {
            scene2();
        });
    } else {
        typeText("Josiah: 'If you only care for yourself, you will find out how lonely this land is.' He pulls his coat tight and looks away.", () => {
            scene2();
        });
    }
}

function scene2() {
    bgMusic.volume = 0.2
    scene2Visual();
    const lines = [
        "After some time, you finally reach a river valley crowded with tents and rough shacks. As you look around, you see the Gold Rush is in full swing: Americans like you from the East, European fortune seekers, Chilean and Sonoran miners, Kanakas from the Pacific, and growing numbers of Chinese laborers work the banks.",
        "The hills bear scars where hydraulic hoses and picks have torn the soil. You see the remnants of what appear to be native villages along the river burnt to ashes.",
        'A broad shouldered man with a faded militia jacket walks up to you.',
        'Elias: "The name’s Elias. When I rode in 49, this valley was full of camps. Governor said they wanted to make it safe for you settlers. We took care of that. State paid us per head."'
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Approve", response: "Elias will remember this.", action: () => {
                    gold += 20;
                    morality -= 1;
                    choicesLog.push("scene2_approve");
                    typeText("Elias: 'Good. Folks with a clear mind get rewarded.' (He claps you on the shoulder)", () => {
                        npc3Scene();
                    });
                } },
                { text: "Ask about the villages", response: "Elias brushes you off.", action: () => {
                    choicesLog.push("scene2_ask_villages");
                    typeText("Elias: 'You worry too much. Keep your head down and stake your claim.'", () => {
                        npc3Scene();
                    });
                } },
                { text: "Ask for advice", response: "Elias advises you to avoid areas with other white men staking a claim.", action: () => {
                    choicesLog.push("scene2_ask_advice");
                    typeText("Elias: 'Find water and stay near it. If you can, keep your claim where others won't bother you.'", () => {
                        npc3Scene();
                    });
                } }
            ]);
        }
    }
    nextLine();
}

function npc3Scene() {
    bgMusic.volume = 0.2
    npc3Visual();
    const lines = [
        "As you examine the banks, a small group approaches. At their head walks Aiyana, a Maidu woman, carrying woven baskets. You see those behind her carrying items foraged from around the river.",
        'Aiyana: "Hello, I am Aiyana. The men who came before you cut down our oaks, drove off our game, and turned our water into mud. Our dead still reside here. Whatever we can find, we bring here to sell. Please, will you buy something from us?"'
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Buy and listen", response: "Aiyana thanks you and tells you more about their story.", action: () => {
                    gold -= 5;
                    morality += 2;
                    choicesLog.push("npc3_buy");
                    typeText("Aiyana: 'Thank you. We remember those who treat us with care.' She offers you a small woven bead in thanks.", () => {
                        scene3();
                    });
                } },
                { text: "Dismiss her", response: "Aiyana leaves quietly.", action: () => {
                    choicesLog.push("npc3_dismiss");
                    morality -= 1;
                    typeText("Aiyana leaves without another word. You hear the murmur of the crowd.", () => {
                        scene3();
                    });
                } },
                { text: "Reassure her but do not buy", response: "Aiyana didn’t seem to appreciate that.", action: () => {
                    choicesLog.push("npc3_reassure_no_buy");
                    typeText("Aiyana: 'Words are lighter than deeds.' She folds her hands and walks on.", () => {
                        scene3();
                    });
                } }
            ]);
        }
    }
    nextLine();
}

function scene3() {
    bgMusic.volume = 0.2
    courthouseVisual();
    const lines = [
        "Having finally found a place to claim, you begin trying to find gold, but fail. As night falls, you head to the small settlement put together for those searching for gold. You eat and fall asleep, thinking about Aiyana.",
        "As you wake up, you see some new notices being set up outside the courthouse.",
        "You walk towards them, reading the following:",
        'Act for the Government and Protection of Indians: By order of the State of California, settlers are authorized to employ indigenous persons under binding contracts and to assume custody of Indian minors as necessary for their care and protection. All such arrangements must be registered within the county.',
        'Section 14 of the Criminal Proceedings Act: No Indian or Black person shall be permitted to give evidence in any case involving a white citizen.',
        "Foreign Miner’s Tax: Effective immediately, all foreign miners are required to pay a monthly fee of $20 dollars to mine. Persons originating from China, Mexico, Chile, or other foreign countries must present proof of payment on request or vacate their claims.",
        "Inside, you see a hearing underway. A Californio man waves land grants written in Spanish while a white man argues that under American law, that grant is void.",
        'Judge: "Under the treaty of Guadalupe Hidalgo, valid Mexican grants may be recognized only when proven under the procedure of the United States. This court follows American law, and that law requires proper documentation in English."',
        'Californio through interpreter: "This land fed our family before either flag flew above it. We hold a grant signed by the Mexican Governor. Our cattle grazed here long before the Americans arrived. Must our home disappear because our papers are different?"',
        'Judge: "Your claim lacks the survey and documentation required by the Land Act of 1851. Your grant is not sufficient for recognition in this court. The present settler has demonstrated occupation and improvement under U.S. standards, thus the claim is awarded to him."',
        "You step back into the crowd and see Josiah, alongside the family of the Mexican and some white settlers, watching the trial. Josiah looks to you, almost expecting you to say something."
    ];

    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], nextLine);
            i++;
        } else {
            sceneCourthouse();
        }
    }
    nextLine();
}

function sceneCoercion() {
    bgMusic.volume = 0
    drawBackground();
    ctx.fillStyle = "rgba(0,0,0,0.5)"; // darker overlay for tension
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Main characters
    drawCharacter(520, "#f1d1bb", "#b85", true, false, false, 0.95); // settler
    drawCharacter(460, "#f1d1bb", "#4ac", false, false, false, 0.95); // Josiah
    drawCharacter(400, "#4a3426", "#2b2b2b", false, false, false, 0.95); // Solomon


    // Additional crowd
    drawCharacter(360, "#f1d1bb", "#e96", false, false, false, 0.8); 
    drawCharacter(380, "#f1d1bb", "#b85", false, false, false, 0.8); 
    drawCharacter(400, "#f1d1bb", "#4ac", false, false, false, 0.8); 
    drawCharacter(440, "#f1d1bb", "#e96", false, false, false, 0.8); 
    drawCharacter(500, "#f1d1bb", "#b85", false, false, false, 0.8); 


    const lines = [
        "After the courthouse, you notice the settler who won the case speaking quietly to Josiah in a low voice.",
        "The settler's tone hardens and you hear him insist Josiah accompany him to work as a hired hand — or else.",
        "Josiah looks shaken; you realize the settler is coercing him into labor despite the court's earlier decision.",
        'Settler: "You saw how the law works. You will work this claim or you will be turned out to the road. That is the choice."',
        'Josiah: "I have no papers to fight with. I will do what I must to survive."',
        "Solomon stands nearby, silent and watchful."
    ];
    let i = 0;
    function nextLine() {
        if (i < lines.length) {
            typeText(lines[i], nextLine);
            i++;
        } else {
            showChoices([
                { text: "Confront the settler", response: "You step forward and challenge him. He laughs but for a moment looks uncertain.", action: () => {
                    choicesLog.push("confront_settler");
                    morality += 4;
                    gold -= 15;
                    typeText("You: 'You cannot treat a man that way.' The settler glares but loosens his grip. Josiah gives a look of gratitude.", () => {
                        sceneJosiahAndArrivant();
                    });
                } },
                { text: "Offer Josiah a chance to work with you instead", response: "You offer Josiah paid work with better terms. He nods slowly.", action: () => {
                    choicesLog.push("offer_work_to_josiah");
                    morality += 3;
                    gold -= 8;
                    typeText("You: 'Work with me — I will pay.' Josiah: 'I would be thankful.' Aiyana watches approvingly.", () => {
                        sceneJosiahAndArrivant();
                    });
                } },
                { text: "Say nothing and walk away", response: "You keep your head down and walk away. Josiah's fate is decided without your help.", action: () => {
                    choicesLog.push("walk_away_coercion");
                    morality -= 3; // harsher penalty
                    typeText("You: (You walk away silently, convincing yourself survival requires caution.)", () => {
                        sceneJosiahAndArrivant();
                    });
                } }
            ]);
        }
    }
    nextLine();
}

    function sceneCourthouse() {
        bgMusic.volume = 0.2
        courthouseVisual();
        const lines = [
            "The judge continues and the crowd murmurs. At the edge of the courthouse a white settler stands with a man who looks worn and watchful.",
            'Solomon: "I am called Solomon. I am to accompany this settler."',
            "Solomon is a Black arrivant who had been brought along to work. He stands quietly, watching the proceedings and the exchanges.",
            "Josiah looks over to you, his expression a mixture of fatigue and resolve. Aiyana watches from the edge of the crowd, holding a small basket.",
            "Solomon is now part of the party that will be moving on. Josiah speaks quietly to you and to Solomon before you all move away from the courthouse."
        ];
        let i = 0;
        function nextLine() {
            if (i < lines.length) {
                typeText(lines[i], nextLine);
                i++;
            } else {
                sceneCoercion();
            }
        }
        nextLine();
    }


    function sceneJosiahAndArrivant() {
        bgMusic.volume = 0.2
        josiahAndSolomonVisual();
        const lines = [
            'Josiah: "We have come a long way and things are changing fast. I will keep an eye out for you."',
            'Solomon: "I will do what I must, but I wish freedom had come sooner."',
            "Aiyana approaches with a small woven basket and offers some food. The three of you share a quiet moment before deciding what to do next.",
            "Together, you plan your next steps in this unsettled land."
        ];
        let i = 0;
        function nextLine() {
            if (i < lines.length) {
                typeText(lines[i], nextLine);
                i++;
            } else {
                showChoices([
                    { text: "Continue to the settlement", response: "You all head toward the small settlement to find your claims and prepare for the work ahead.", action: () => {
                        choicesLog.push("josiah_group_continue");
                        scene4Normal();
                    } },
                    { text: "Offer to help Solomon find work", response: "Solomon looks grateful but cautious.", action: () => {
                        choicesLog.push("josiah_help_solomon");
                        morality += 2;
                        gold -= 2; // some cost
                        typeText("Solomon: 'Thank you. I will try and see what I can do. Careful, not all men here have honor.'", () => {
                            scene4Normal();
                        });
                    } },
                    { text: "Part ways for now", response: "Josiah nods and you each take your own route for now.", action: () => {
                        choicesLog.push("josiah_part_ways");
                        scene4Normal();
                    } }
                ]);
            }
        }
        nextLine();
    }

    function scene4Normal() {
        bgMusic.volume = 0.2
        saloonVisual();
        const lines = [
            "One evening, miners and townspeople gather outside a saloon. Elias sits on a crate, reading a notice.",
            'Elias: "County Supervisors have authorized funds for a new expedition. A band in the hills has been accused of stock theft and threatening settlers. The state will reimburse expenses and those who bring in hostiles."',
            'Elias: "Player, your standing on land men like us cleared. Are you riding with us?"'
        ];
        let i = 0;
        function nextLine() {
            if (i < lines.length) {
                typeText(lines[i], nextLine);
                i++;
            } else {
                showChoices([
                    { text: "Join fully", response: "You agree to join the expedition fully.", action: () => {
                        // join fully = align with settlers -> more gold if violence happens
                        choicesLog.push("joined_fully");
                        morality -= 1;
                        gold += 30;
                        typeText("You swear to ride with them at dawn, accepting their terms.", () => {
                            sceneBattle();
                        });
                    } },
                    { text: "Refuse", response: "You refuse. Nothing changes today.", action: () => {
                        choicesLog.push("refused_expedition");
                        morality += 1;
                        typeText("You step back and refuse. Some men sneer, others nod in quiet respect.", () => {
                            endGame("You refused the expedition. Nothing changes today.");
                        });
                    } },
                    { text: "Join but will not shoot unless needed", response: "You join but promise to avoid killing unless necessary.", action: () => {
                        choicesLog.push("joined_reluctant");
                        morality += 0; // ambiguous
                        gold += 15; // smaller payout
                        typeText("You join the expedition but promise to avoid killing when possible.", () => {
                            sceneBattle();
                        });
                    } }
                ]);
            }
        }
        nextLine();
    }


    function sceneBattle() {
        bgMusic.volume = 0
        battleVisual();
        const lines = [
            "At dawn, you ride into the hills with Josiah and several others. You find the camp filled with small shelters.",
            "Gunfire erupts. People scatter. What will you do?"
        ];
        let i = 0;
        function nextLine() {
            if (i < lines.length) {
                typeText(lines[i], nextLine);
                i++;
            } else {
                // choices differ depending on earlier choice (but available here)
                showChoices([
                    { text: "Fire at a fleeing figure", response: "The camp is destroyed and burnt down. Josiah praises your effort. You win a sizeable bounty.", action: () => {
                        choicesLog.push("battle_fire_kill");
                        morality -= 3;
                        gold += 60;
                        // extended immediate aftermath
                        typeText("Smoke and screaming fill your ears as the settlement burns. You ride back to the men; Josiah clasps your shoulder with a savage grimace.", () => {
                            finalScene();
                        });
                    } },
                    { text: "Fire and purposefully miss", response: "Same destruction occurs. Josiah is upset and you do not receive any reward.", action: () => {
                        choicesLog.push("battle_fire_miss");
                        morality -= 1;
                        gold -= 10; // punished (no reward and cost)
                        typeText("You pull the trigger but deliberately miss. Chaos remains. Men scowl — they were expecting profit, not mercy.", () => {
                            finalScene();
                        });
                    } },
                    { text: "Shield someone physically", response: "A few are saved. Josiah is extremely upset and promises punishment.", action: () => {
                        choicesLog.push("battle_shield");
                        morality += 3;
                        gold -= 30; // you miss out on rewards, possibly lose supplies
                        typeText("You leap between a fleeing woman and a shooter. The bullet grazes your arm. A few escape because of you.", () => {
                            finalScene();
                        });
                    } }
                ]);
            }
        }
        nextLine();
    }

    function finalScene() {
        drawFinalCampfireVisual();

        const goldScore = gold;
        const moralScore = morality;

        // Determine ending type based on choices
        let endingType = "mixed"; 
        if (choicesLog.includes("joined_fully") || choicesLog.includes("battle_fire_kill")) {
            endingType = "good"; // player helped settlers
        } else if (choicesLog.includes("confront_settler") || choicesLog.includes("npc3_buy") || choicesLog.includes("battle_shield")) {
            endingType = "bad"; // player helped others
        }

        const reflectionIntro = [
            "Years have passed. The Gold Rush has ended, leaving memories, consequences, and fortunes made or lost.",
            `During your time here, you accumulated ${gold} gold.`,
            `Your actions have left their mark: morality score ${morality}.`
        ];

        let idx = 0;
        function nextReflection() {
            if (idx < reflectionIntro.length) {
                nextLineCallback = nextReflection;
                typeText(reflectionIntro[idx], nextReflection);
                idx++;
                return;
            }

            drawFinalCampfireVisual();

            let linesEnd = [];

            if (endingType === "good") {
                linesEnd.push(
                    "Around the campfire, you sit with Josiah, Aiyana, Solomon, and a few others. Your pockets are full, and your claim secured.",
                    'Josiah: "You prospered, but some of us paid the price for it."',
                    'Aiyana: "The land is safer now, but the stories of loss linger."',
                    "Ironically, your choices ensured your own success, while communities you could have helped remain scarred.",
                    "You spend your days managing your claim and wealth, occasionally glancing at those who were left behind. The valley knows your name — respected, feared, and remembered for your pragmatism."
                );

                if (choicesLog.includes("joined_fully")) {
                    linesEnd.push("Your full participation in the settlers' expeditions brought gold, and secured your standing, but cost lives and goodwill.");
                }
                if (choicesLog.includes("battle_fire_kill")) {
                    linesEnd.push("The settlement you attacked lies in ashes, a reminder that prosperity often comes at the expense of others.");
                }

            } else if (endingType === "bad") {
                linesEnd.push(
                    "The campfire flickers as you sit among Josiah, Aiyana, and Solomon, faces tired but grateful.",
                    'Josiah: "You stood with us, even when it meant risk and loss."',
                    'Aiyana: "The land is harder for us still, but your actions gave some hope."',
                    "You sacrificed gold, comfort, and safety to protect others, and the valley still bears the scars of what you tried to prevent.",
                    "Though hardships abound, you know that your conscience is intact. Some doors closed to you, but you left the mark of compassion behind."
                );

                if (choicesLog.includes("confront_settler")) {
                    linesEnd.push("Standing up to the settler saved Josiah from forced labor, though it cost you opportunities and safety.");
                }
                if (choicesLog.includes("npc3_buy")) {
                    linesEnd.push("Buying from Aiyana helped her community survive, even if it reduced your own gains.");
                }
                if (choicesLog.includes("battle_shield")) {
                    linesEnd.push("Shielding the fleeing villagers cost you materially, but some lives were saved thanks to your courage.");
                }

            } else { // mixed endings
                // Determine type of mixed ending based on specific combination of actions
                if (choicesLog.includes("joined_reluctant") || choicesLog.includes("battle_fire_miss")) {
                    // Player acted cautiously / ambiguously
                    linesEnd.push(
                        "The campfire crackles as you sit with Josiah, Aiyana, and Solomon, and the other settlers you rode with.",
                        'Josiah: "You sometimes helped, sometimes stayed back. Your heart was torn."',
                        'Aiyana: "You did not fully stand with us, yet spared more than you took."',
                        "You gained some wealth and security, but the consequences of your choices linger in the shadows.",
                        "Some lives were saved, some claims earned, but the valley remembers both your mercy and your compromises."
                    );
                } else if (choicesLog.includes("offer_work_to_josiah") || choicesLog.includes("josiah_help_solomon")) {
                    // Player helped some individuals, but not the wider community
                    linesEnd.push(
                        "You sit by the fire with Josiah and Solomon, exchanging quiet smiles and small stories.",
                        'Josiah: "You helped a few of us. That counts for something."',
                        'Solomon: "Your choices were selective, but some good came of it."',
                        "You did not gain all the wealth you might have, nor did you prevent every injustice, but your actions left pockets of hope.",
                        "The valley remembers you inconsistently — a friend to some, indifferent to others."
                    );
                } else {
                    // Neutral mixed ending for miscellaneous choices
                    linesEnd.push(
                        "Around the campfire, everyone looks at you with a mixture of gratitude and disappointment.",
                        'Josiah: "You acted when you could, but not always."',
                        'Aiyana: "Gold and conscience rarely walk hand in hand."',
                        "You leave the valley with some wealth, some goodwill, and some regrets.",
                        "History will remember you as a complicated figure — neither hero nor villain, just human."
                    );
                }
            }

            playReflectionLines(linesEnd);

            function playReflectionLines(lines) {
                let j = 0;
                function step() {
                    if (j < lines.length) {
                        nextLineCallback = step;
                        typeText(lines[j], step);
                        j++;
                    } else {
                        nextLineCallback = null;
                        waitingForEnter = false;
                        setTimeout(() => {
                            const wrap = `=== THE END ===\nYour final gold: ${gold}. Morality: ${morality}. Choices: ${choicesLog.join(", ")}`;
                            endGame(wrap);
                        }, 600);
                    }
                }
                step();
            }
        }

        nextReflection();
    }
    function endGame(wrapText) {
        hideChoices();
        textBox.innerHTML = wrapText;

        // Add Return to Start button
        const restartBtn = document.createElement("button");
        restartBtn.textContent = "Return to Start";
        restartBtn.style.marginTop = "15px";
        restartBtn.addEventListener("click", () => location.reload());
        choicesDiv.appendChild(restartBtn);
    }
});
