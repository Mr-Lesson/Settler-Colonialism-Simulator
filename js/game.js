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

    canvas.width = 800;
    canvas.height = 400;

    let typing = false, skipTyping = false, waitingForEnter = false, nextLineCallback = null;
    let animationFrameId;

    // =========================
    // CLEAR SCENE
    // =========================
    function clearScene() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

    // =========================
    // ANIMATION VARIABLES
    // =========================
    let riverOffset = 0;
    let treeSwing = 0, treeDirection = 1;
    let bobbing = 0, bobDirection = 1;

    // =========================
    // BACKGROUND
    // =========================
    function drawBackground() {
        // Sky gradient
        let sky = ctx.createLinearGradient(0,0,0,canvas.height);
        sky.addColorStop(0,"#87ceeb");
        sky.addColorStop(1,"#b0e0e6");
        ctx.fillStyle = sky;
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // Sun
        ctx.beginPath();
        ctx.arc(700, 80, 50, 0, Math.PI*2);
        ctx.fillStyle = "#FFD700";
        ctx.fill();

        // Distant hills
        ctx.fillStyle = "#556B2F";
        ctx.beginPath();
        ctx.moveTo(0,300);
        ctx.quadraticCurveTo(200,250,400,300);
        ctx.quadraticCurveTo(600,350,800,300);
        ctx.lineTo(800,400); ctx.lineTo(0,400);
        ctx.fill();

        // Middle hills
        ctx.fillStyle = "#228B22";
        ctx.beginPath();
        ctx.moveTo(0,320);
        ctx.quadraticCurveTo(200,270,400,320);
        ctx.quadraticCurveTo(600,370,800,320);
        ctx.lineTo(800,400); ctx.lineTo(0,400);
        ctx.fill();

        // Foreground grass
        ctx.fillStyle = "#32CD32";
        ctx.fillRect(0,350,800,50);

        // Flowing river
        riverOffset += 1;
        if (riverOffset > 100) riverOffset = 0;
        ctx.fillStyle = "#1E90FF";
        ctx.beginPath();
        ctx.moveTo(100 + Math.sin(riverOffset/10)*5, 400);
        ctx.quadraticCurveTo(200 + Math.sin(riverOffset/15)*5, 330, 350 + Math.sin(riverOffset/12)*5, 400);
        ctx.quadraticCurveTo(500 + Math.sin(riverOffset/18)*5, 470, 700 + Math.sin(riverOffset/14)*5, 400);
        ctx.lineTo(700,400);
        ctx.lineTo(100,400);
        ctx.fill();
    }

    // =========================
    // STICK FIGURE
    // =========================
    function drawStick(x, y, color="white", hat=false, tool=false, bag=false, bob=0){
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        // Head
        ctx.beginPath();
        ctx.arc(x, y + bob, 12, 0, Math.PI*2);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(x-4, y+bob-2, 2, 0, Math.PI*2);
        ctx.arc(x+4, y+bob-2, 2, 0, Math.PI*2);
        ctx.fill();

        // Hat
        if(hat){
            ctx.fillStyle="#774422";
            ctx.beginPath();
            ctx.moveTo(x-14, y+bob-12);
            ctx.lineTo(x+14, y+bob-12);
            ctx.lineTo(x, y+bob-25);
            ctx.fill();
        }

        // Body
        ctx.beginPath();
        ctx.moveTo(x, y+12+bob);
        ctx.lineTo(x, y+50+bob);
        ctx.stroke();

        // Arms
        ctx.beginPath();
        ctx.moveTo(x-16, y+25+bob);
        ctx.lineTo(x+16, y+25+bob);
        ctx.stroke();

        if(tool){
            ctx.beginPath();
            ctx.moveTo(x+16, y+25+bob);
            ctx.lineTo(x+24, y+15+bob);
            ctx.stroke();
        }

        if(bag){
            ctx.fillStyle="#AA7744";
            ctx.fillRect(x-8, y+30+bob, 16, 18);
        }

        // Legs
        ctx.beginPath();
        ctx.moveTo(x, y+50+bob);
        ctx.lineTo(x-14, y+70+bob);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y+50+bob);
        ctx.lineTo(x+14, y+70+bob);
        ctx.stroke();
    }

    // =========================
    // BUILDINGS
    // =========================
    function drawHouse(x, y, w, h){
        ctx.fillStyle="#8B4513";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle="#A52A2A";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x+w/2, y-h/2);
        ctx.lineTo(x+w, y);
        ctx.fill();
        // Door
        ctx.fillStyle="#654321";
        ctx.fillRect(x+w/3, y+h/2, w/3, h/2);
    }

    function drawTent(x, y){
        ctx.fillStyle="#FF6347";
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x-25,y+50);
        ctx.lineTo(x+25,y+50);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle="#8B0000";
        ctx.stroke();
    }

    function drawTree(x, y){
        treeSwing += treeDirection*0.2;
        if(treeSwing>3 || treeSwing<-3) treeDirection*=-1;
        ctx.fillStyle="#228B22";
        ctx.beginPath();
        ctx.moveTo(x+treeSwing,y);
        ctx.lineTo(x-20+treeSwing,y+40);
        ctx.lineTo(x+20+treeSwing,y+40);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="#8B4513";
        ctx.fillRect(x-4+treeSwing, y+40, 8, 20);
    }

    // =========================
    // SCENES VISUALS
    // =========================
    const scene1Visual = (bob=0)=>{
        clearScene(); drawBackground();
        drawStick(100,260,"#4AC",true,true,true,bob);
        drawStick(200,260,"#6F4",true,false,true,bob);
        drawHouse(400,280,60,60);
        drawTree(500,260);
    };

    const scene2Visual = (bob=0)=>{
        clearScene(); drawBackground();
        drawStick(90,260,"#4AC",true,true,true,bob);
        drawStick(180,260,"#B85",true,false,true,bob);
        drawHouse(350,280,70,60);
        drawTent(550,300);
        drawTree(250,270);
    };

    const npc3Visual = (bob=0)=>{
        clearScene(); drawBackground();
        drawStick(120,260,"#4AC",true,true,true,bob);
        drawStick(200,260,"#E96",true,false,true,bob);
        drawTree(400,270);
        drawTent(600,300);
    };

    const scene3Visual = (bob=0)=>{
        clearScene(); drawBackground();
        drawStick(150,260,"#4AC",true,true,true,bob);
        drawHouse(400,280,50,50);
        drawTree(550,260);
        drawTent(600,300);
    };

    const saloonVisual = (bob=0)=>{
        clearScene(); drawBackground();
        drawStick(130,260,"#4AC",true,true,true,bob);
        drawStick(210,260,"#B85",true,false,true,bob);
        drawHouse(420,280,60,50);
        drawTree(580,270);
        drawTent(650,300);
    };

    const battleVisual = (bob=0)=>{
        clearScene(); drawBackground();
        drawStick(100,260,"#4AC",true,true,true,bob);
        drawStick(200,260,"#6F4",true,false,true,bob);
        drawHouse(450,280,60,60);
        drawTree(600,270);
        drawTent(650,300);
    };

    const npc4Visual = (bob=0)=>{
        clearScene(); drawBackground();
        drawStick(110,260,"#4AC",true,true,true,bob);
        drawStick(180,260,"#C84",true,false,true,bob);
        drawHouse(400,280,60,60);
        drawTree(550,270);
        drawTent(600,300);
    };

    const finalVisual = (bob=0)=>{
        clearScene(); drawBackground();
        drawStick(150,260,"#4AC",true,true,true,bob);
        drawTree(500,270);
        drawTent(600,300);
    };

    // =========================
    // ANIMATION LOOP
    // =========================
    function animateScene(currentVisual){
        animationFrameId = requestAnimationFrame(()=>animateScene(currentVisual));
        if(bobDirection===1) bobbing+=0.3; else bobbing-=0.3;
        if(bobbing>4||bobbing<-4) bobDirection*=-1;
        currentVisual(bobbing);
    }

    // =========================
    // TYPEWRITER & CHOICES & ENTER KEY
    // =========================
    function typeText(text,onComplete){
        typing=true; skipTyping=false; waitingForEnter=false;
        textBox.innerHTML=""; hideChoices(); showSkipHint();
        let i=0,speed=28;
        function step(){
            if(skipTyping){ textBox.innerHTML=text; finish(); return; }
            if(i<text.length){ textBox.innerHTML+=text.charAt(i); i++; setTimeout(step,speed); }
            else finish();
        }
        function finish(){ typing=false; waitingForEnter=true; nextLineCallback=onComplete; }
        step();
    }

    function showChoices(list){
        choicesDiv.innerHTML=""; hideSkipHint(); waitingForEnter=false;
        list.forEach(c=>{
            const btn=document.createElement("button");
            btn.textContent=c.text;
            btn.onclick=()=>typeText(c.response,()=>c.action());
            choicesDiv.appendChild(btn);
        });
    }

    function hideChoices(){ choicesDiv.innerHTML=""; }

    const skipHint=document.createElement("p");
    skipHint.style.color="#d4aa70";
    skipHint.style.fontSize="13px";
    skipHint.style.marginTop="8px";
    skipHint.innerText="Press ENTER to continue";
    skipHint.style.display="none";
    gameScreen.appendChild(skipHint);
    function showSkipHint(){ skipHint.style.display="block"; }
    function hideSkipHint(){ skipHint.style.display="none"; }

    document.addEventListener("keydown", e=>{
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
    // START BUTTON
    // =========================
    startBtn.addEventListener("click", ()=>{
        titleScreen.style.display="none";
        gameScreen.style.display="block";
        showSkipHint();
        animateScene(scene1Visual);
        scene1();
    });

    // =========================
    // FULL GAME SCENES
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
        let i=0;
        function nextLine(){
            if(i<lines.length){ nextLineCallback=nextLine; typeText(lines[i],nextLine); i++; }
            else showChoices([
                { text:"Of course it's free", response:"NPC1 nods quietly, a small hopeful smile on his face.", action:scene2 },
                { text:"Not sure", response:"NPC1 shrugs, uncertain, but maintains a quiet optimism.", action:scene2 },
                { text:"I don’t care about what others think", response:"NPC1 looks at you, takes a deep breath, but continues with a quiet optimism.", action:scene2 }
            ]);
        }
        nextLine();
    }

    function scene2() {
        scene2Visual();
        const lines=[
            "After some time, you finally reach a river valley crowded with tents and rough shacks...",
            "The hills bear scars where hydraulic hoses and picks have torn the soil...",
            'NPC2: "The name’s NPC2. When I rode in ‘49, this valley was full of camps..."'
        ];
        let i=0;
        function nextLine(){
            if(i<lines.length){ nextLineCallback=nextLine; typeText(lines[i],nextLine); i++; }
            else showChoices([
                { text:"Approve", response:"NPC2 nods approvingly.", action:npc3Scene },
                { text:"Ask about the villages", response:"NPC2 brushes off your question.", action:npc3Scene },
                { text:"Ask for advice", response:"NPC2 advises caution.", action:npc3Scene }
            ]);
        }
        nextLine();
    }

    function npc3Scene(){
        npc3Visual();
        const lines=[
            "As you examine the banks, a small group approaches...",
            'NPC3: "Hello, I am NPC3. The men who came before you cut down our oaks..."'
        ];
        let i=0;
        function nextLine(){
            if(i<lines.length){ nextLineCallback=nextLine; typeText(lines[i],nextLine); i++; }
            else showChoices([
                { text:"Buy and listen", response:"NPC3 thanks you and shares more.", action:scene3 },
                { text:"Dismiss her", response:"NPC3 leaves quietly.", action:scene3 },
                { text:"Reassure but don't buy", response:"NPC3 seems unhappy but nods silently.", action:scene3 }
            ]);
        }
        nextLine();
    }

    function scene3(){
        scene3Visual();
        const lines=[
            "Having finally found a place to claim, you begin trying to find gold...",
            "Next morning, you see new notices being set up outside the courthouse...",
            "Inside, you see a hearing underway...",
            "Judge: 'Your claim lacks the survey and documentation required by the Land Act of 1851...'",
            "NPC1 looks to you, almost expecting you to say something."
        ];
        let i=0;
        function nextLine(){
            if(i<lines.length){ nextLineCallback=nextLine; typeText(lines[i],nextLine); i++; }
            else showChoices([
                { text:"Praise the ruling", response:"NPC1 scoffs and turns away.", action:scene4Normal },
                { text:"Quietly approach the family", response:"NPC1 gives you a more positive look.", action:scene4NPC1Followup },
                { text:"Turn away", response:"NPC1 gives you a strange look.", action:scene4Normal },
                { text:"Object to the trial", response:"NPC2 comes up extremely unhappy and threatens you.", action:scene4NPC1Followup }
            ]);
        }
        nextLine();
    }

    function scene4Normal(){
        saloonVisual();
        const lines=["Evening outside the saloon. NPC2 reads a notice about an expedition."];
        let i=0;
        function nextLine(){
            if(i<lines.length){ nextLineCallback=nextLine; typeText(lines[i],nextLine); i++; }
            else showChoices([
                { text:"Join fully", response:"You join the expedition fully.", action:sceneBattle },
                { text:"Refuse", response:"You refuse. Nothing changes today.", action:()=>endGame("You refused the expedition. Nothing changes today.") },
                { text:"Join but won’t shoot unless needed", response:"You join but promise to avoid killing unless necessary.", action:sceneBattle }
            ]);
        }
        nextLine();
    }

    function scene4NPC1Followup(){
        npc4Visual();
        const lines=["NPC1 approaches you later that day, covered in scratches and bruises."];
        let i=0;
        function nextLine(){
            if(i<lines.length){ nextLineCallback=nextLine; typeText(lines[i],nextLine); i++; }
            else showChoices([
                { text:"Blame him", response:"Distance grows between you and NPC1. NPC1 leaves.", action:scene4Normal },
                { text:"Promise to testify for him", response:"NPC1 thanks you sincerely.", action:scene4Normal },
                { text:"Tell him he should move on", response:"NPC1 gets upset and leaves.", action:scene4Normal }
            ]);
        }
        nextLine();
    }

    function sceneBattle(){
        battleVisual();
        const lines=[
            "At dawn, you ride into the hills with NPC1 and several others. You find the camp filled with small shelters.",
            "Gunfire erupts. People scatter. What will you do?"
        ];
        let i=0;
        function nextLine(){
            if(i<lines.length){ nextLineCallback=nextLine; typeText(lines[i],nextLine); i++; }
            else showChoices([
                { text:"Fire at a fleeing figure", response:"The camp is destroyed and burnt down. NPC1 praises your effort. You win a sizeable bounty.", action:finalScene },
                { text:"Fire and purposefully miss", response:"Same destruction occurs. NPC1 is upset and you receive no reward.", action:finalScene },
                { text:"Shield someone physically", response:"A few are saved. NPC1 is extremely upset and promises punishment.", action:finalScene }
            ]);
        }
        nextLine();
    }

    function finalScene(){
        finalVisual();
        const reflectionLines=[
            "Fast forward to 1855, the gold is all but gone.",
            "You get an opportunity to talk to NPC1 and reflect on the choices you made.",
            'NPC1: "Based on your actions, here’s what I think about how we all navigated these times..."'
        ];
        let i=0;
        function nextReflection(){
            if(i<reflectionLines.length){ nextLineCallback=nextReflection; typeText(reflectionLines[i],nextReflection); i++; }
            else endGame("=== THE END ===");
        }
        nextReflection();
    }

    function endGame(message){
        typeText(message);
        hideChoices();
        clearScene();
        cancelAnimationFrame(animationFrameId);
    }

});
