// v4.1 - GAMIFIED 11+ QUEST | FIXED AUTH | EXPANDED | ANIMATIONS | SOUND
import { useState, useEffect, useRef } from "react";
import { UserProgress, QuizSession, VisitorCount } from "../api/entities";
import { useAppContext } from "../api/app-context";

// ─── INJECT ANIMATIONS ────────────────────────────────────────────────────────
const CSS=`
@keyframes popIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
@keyframes slideUp{0%{transform:translateY(24px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(252,211,77,0.3)}50%{box-shadow:0 0 24px rgba(252,211,77,0.8)}}
@keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-60px);opacity:0}}
@keyframes starBurst{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
@keyframes bossGlow{0%,100%{box-shadow:0 0 12px rgba(220,38,38,0.3)}50%{box-shadow:0 0 40px rgba(220,38,38,0.8)}}
@keyframes worldFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes flashGreen{0%,100%{background:transparent}30%{background:rgba(5,150,105,0.18)}}
@keyframes flashRed{0%,100%{background:transparent}30%{background:rgba(220,38,38,0.18)}}
`;
if(!document.getElementById("q11css")){const s=document.createElement("style");s.id="q11css";s.textContent=CSS;document.head.appendChild(s);}

// ─── SOUND ENGINE ─────────────────────────────────────────────────────────────
const SFX={
  correct:()=>{try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.setValueAtTime(523,a.currentTime);o.frequency.setValueAtTime(659,a.currentTime+0.1);o.frequency.setValueAtTime(784,a.currentTime+0.2);g.gain.setValueAtTime(0.25,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.5);o.start();o.stop(a.currentTime+0.5);}catch{}},
  wrong:()=>{try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.type="sawtooth";o.connect(g);g.connect(a.destination);o.frequency.setValueAtTime(200,a.currentTime);o.frequency.setValueAtTime(140,a.currentTime+0.15);g.gain.setValueAtTime(0.2,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.35);o.start();o.stop(a.currentTime+0.35);}catch{}},
  levelup:()=>{try{const a=new(window.AudioContext||window.webkitAudioContext)();[523,659,784,1047].forEach((f,i)=>{const o=a.createOscillator();const g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=f;g.gain.setValueAtTime(0.25,a.currentTime+i*0.12);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+i*0.12+0.3);o.start(a.currentTime+i*0.12);o.stop(a.currentTime+i*0.12+0.3);});}catch{}},
  unlock:()=>{try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.setValueAtTime(400,a.currentTime);o.frequency.exponentialRampToValueAtTime(900,a.currentTime+0.3);g.gain.setValueAtTime(0.25,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.4);o.start();o.stop(a.currentTime+0.4);}catch{}},
  click:()=>{try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.frequency.value=800;g.gain.setValueAtTime(0.08,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.05);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.05);}catch{}},
};

// ─── RANKS ────────────────────────────────────────────────────────────────────
const RANKS=[
  {minLevel:1, title:"Explorer",      icon:"🌱",colour:"#6B7280"},
  {minLevel:3, title:"Apprentice",    icon:"📖",colour:"#059669"},
  {minLevel:5, title:"Scholar",       icon:"🎓",colour:"#2563EB"},
  {minLevel:8, title:"Logic Warrior", icon:"⚔️",colour:"#7C3AED"},
  {minLevel:12,title:"Champion",      icon:"🏆",colour:"#D97706"},
  {minLevel:16,title:"11+ Master",    icon:"👑",colour:"#DC2626"},
  {minLevel:20,title:"Legend",        icon:"🌟",colour:"#0EA5E9"},
];
function getRank(l){let r=RANKS[0];for(const x of RANKS)if(l>=x.minLevel)r=x;return r;}
function xpForLevel(l){return l*120;}
function calcLevel(xp){let l=1,x=xp;while(x>=xpForLevel(l)){x-=xpForLevel(l);l++;}return{level:l,xpInLevel:x,xpNeeded:xpForLevel(l)};}

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
const QBANK={
  maths:{
    "Times Tables":[
      {q:"6 × 7 = ?",options:["36","42","48","54"],answer:"42",explanation:"6×7=42. Tip: 5×7=35, +7=42."},
      {q:"9 × 3 = ?",options:["21","24","27","30"],answer:"27",explanation:"10×3=30, minus 3=27."},
      {q:"8 × 6 = ?",options:["42","46","48","52"],answer:"48",explanation:"8×5=40, +8=48."},
      {q:"7 × 8 = ?",options:["54","56","63","48"],answer:"56",explanation:"Remember: 5,6,7,8 → 56=7×8!"},
      {q:"9 × 12 = ?",options:["99","108","116","98"],answer:"108",explanation:"10×12=120, subtract 12=108."},
      {q:"12 × 11 = ?",options:["121","122","132","142"],answer:"132",explanation:"12×11=110+22=132."},
      {q:"7 × 7 = ?",options:["42","47","49","56"],answer:"49",explanation:"7²=49."},
      {q:"8 × 8 = ?",options:["56","62","64","72"],answer:"64",explanation:"8²=64."},
      {q:"9 × 9 = ?",options:["72","81","84","90"],answer:"81",explanation:"9²=81. Finger trick: fold 9 → 8 left, 1 right!"},
      {q:"12 × 12 = ?",options:["120","132","140","144"],answer:"144",explanation:"12×12=144."},
      {q:"6 × 8 = ?",options:["42","48","54","56"],answer:"48",explanation:"6×8=48."},
      {q:"11 × 7 = ?",options:["70","77","78","84"],answer:"77",explanation:"11×7: repeat the digit → 77."},
    ],
    "Fractions":[
      {q:"½ of 40?",options:["10","15","20","25"],answer:"20",explanation:"40÷2=20."},
      {q:"¼ of 20?",options:["4","5","8","10"],answer:"5",explanation:"20÷4=5."},
      {q:"¾ of 40?",options:["20","25","30","35"],answer:"30",explanation:"¼=10, so ¾=30."},
      {q:"Simplify 8/12.",options:["4/8","2/3","3/4","1/2"],answer:"2/3",explanation:"HCF=4. 8÷4=2, 12÷4=3 → 2/3."},
      {q:"¾ of a number = 36. Number?",options:["24","27","48","54"],answer:"48",explanation:"¼=12, whole=48."},
      {q:"⅔ of 18?",options:["6","9","12","15"],answer:"12",explanation:"18÷3=6 (⅓). ×2=12."},
      {q:"½ + ¼ = ?",options:["1/6","2/6","3/4","2/4"],answer:"3/4",explanation:"2/4+1/4=3/4."},
      {q:"⅗ of 25?",options:["10","12","15","20"],answer:"15",explanation:"25÷5=5. 5×3=15."},
      {q:"Simplify 15/20.",options:["3/5","5/6","3/4","4/5"],answer:"3/4",explanation:"HCF=5. 15÷5=3, 20÷5=4."},
      {q:"2/3 + 1/6?",options:["3/9","1/2","5/6","4/6"],answer:"5/6",explanation:"4/6+1/6=5/6."},
      {q:"1⅓ as improper fraction?",options:["3/4","4/3","2/3","5/3"],answer:"4/3",explanation:"1×3+1=4 → 4/3."},
      {q:"½ × ¼ = ?",options:["1/2","1/4","1/6","1/8"],answer:"1/8",explanation:"Multiply tops and bottoms: 1×1=1, 2×4=8."},
    ],
    "Percentages":[
      {q:"10% of 80?",options:["4","8","10","16"],answer:"8",explanation:"80÷10=8."},
      {q:"25% of 80?",options:["16","20","25","40"],answer:"20",explanation:"25%=¼. 80÷4=20."},
      {q:"10% of 350?",options:["3.5","25","35","50"],answer:"35",explanation:"350÷10=35."},
      {q:"35% off £80?",options:["£44","£48","£52","£56"],answer:"£52",explanation:"35% of £80=£28. £80-£28=£52."},
      {q:"£40→£50. % increase?",options:["10%","20%","25%","30%"],answer:"25%",explanation:"(10÷40)×100=25%."},
      {q:"15% of 60?",options:["6","9","12","15"],answer:"9",explanation:"10%=6, 5%=3. 6+3=9."},
      {q:"VAT 20% on £40?",options:["£4","£6","£8","£10"],answer:"£8",explanation:"20% of £40=£8."},
      {q:"50% of 126?",options:["53","63","73","126"],answer:"63",explanation:"126÷2=63."},
      {q:"£60→£75. % increase?",options:["15%","20%","25%","30%"],answer:"25%",explanation:"(15÷60)×100=25%."},
      {q:"30% of 90?",options:["18","27","30","36"],answer:"27",explanation:"10%=9, 30%=27."},
    ],
    "Ratio & Proportion":[
      {q:"Ratio 2:3 of £30. Larger?",options:["£10","£12","£15","£18"],answer:"£18",explanation:"5 parts, £6 each. 3×£6=£18."},
      {q:"OJ:lemon=2:5. 350ml total. Lemon?",options:["100ml","150ml","200ml","250ml"],answer:"250ml",explanation:"7 parts, 50ml each. 5×50=250ml."},
      {q:"Share £40 in 3:5. Smaller?",options:["£10","£12","£15","£20"],answer:"£15",explanation:"8 parts, £5 each. 3×£5=£15."},
      {q:"Ratio 1:4. Total=25. Larger?",options:["5","10","15","20"],answer:"20",explanation:"5 parts. 25÷5=5. 4×5=20."},
      {q:"Recipe for 4: 200g flour. For 6?",options:["250g","300g","350g","400g"],answer:"300g",explanation:"200÷4=50g/person. 6×50=300g."},
      {q:"Map 1:50000. 3cm = ?",options:["1.5km","1km","2km","3km"],answer:"1.5km",explanation:"3×50000=150000cm=1.5km."},
    ],
    "Algebra":[
      {q:"x + 5 = 12. x = ?",options:["5","6","7","8"],answer:"7",explanation:"x=12-5=7."},
      {q:"3 consecutive = 63. Smallest?",options:["19","20","21","22"],answer:"20",explanation:"3n+3=63 → n=20."},
      {q:"nth term 5,8,11,14?",options:["n+4","2n+3","3n+2","4n+1"],answer:"3n+2",explanation:"Diff=3. 3(1)+2=5 ✓"},
      {q:"2x - 3 = 7. x = ?",options:["2","5","7","8"],answer:"5",explanation:"2x=10 → x=5."},
      {q:"3x + 4 = 19. x = ?",options:["3","4","5","6"],answer:"5",explanation:"3x=15 → x=5."},
      {q:"y=2x+1. x=4, y=?",options:["7","8","9","10"],answer:"9",explanation:"2×4+1=9."},
      {q:"Expand 3(x+4)",options:["3x+4","3x+7","3x+12","x+12"],answer:"3x+12",explanation:"3×x=3x, 3×4=12."},
      {q:"Solve x/3=4",options:["1.3","7","12","16"],answer:"12",explanation:"x=4×3=12."},
      {q:"Factorise 2x+6",options:["x+3","2(x+3)","2x(3)","x(2+3)"],answer:"2(x+3)",explanation:"HCF=2."},
      {q:"nth term n²+1: n=3?",options:["7","8","9","10"],answer:"10",explanation:"3²+1=10."},
    ],
    "Geometry":[
      {q:"Perimeter of 5×3cm?",options:["8cm","13cm","15cm","16cm"],answer:"16cm",explanation:"2×(5+3)=16cm."},
      {q:"Area of 8×5cm?",options:["13cm²","26cm²","40cm²","80cm²"],answer:"40cm²",explanation:"8×5=40cm²."},
      {q:"Area of triangle base=6, h=4?",options:["10cm²","12cm²","24cm²","48cm²"],answer:"12cm²",explanation:"½×6×4=12cm²."},
      {q:"Angles in triangle sum to?",options:["90°","180°","270°","360°"],answer:"180°",explanation:"Always 180°."},
      {q:"Volume of cuboid 4×3×2?",options:["9","18","24","48"],answer:"24",explanation:"4×3×2=24cm³."},
      {q:"Circumference r=7 (π≈3.14)?",options:["21.98","43.96","22","44"],answer:"43.96",explanation:"2πr=2×3.14×7=43.96."},
      {q:"Area of circle r=5 (π≈3.14)?",options:["31.4","78.5","15.7","25"],answer:"78.5",explanation:"πr²=3.14×25=78.5."},
      {q:"Interior angle of regular hexagon?",options:["108°","120°","135°","150°"],answer:"120°",explanation:"(6-2)×180÷6=120°."},
      {q:"Triangle angles 60° and 70°. Third?",options:["40°","50°","60°","70°"],answer:"50°",explanation:"180-60-70=50°."},
      {q:"Pythagoras: a=3, b=4. Hyp?",options:["5","6","7","8"],answer:"5",explanation:"√(9+16)=√25=5."},
    ],
    "Statistics":[
      {q:"Mean of 3,5,7,9,1?",options:["4","5","6","7"],answer:"5",explanation:"Sum=25. 25÷5=5."},
      {q:"Median of 2,5,1,8,4?",options:["2","4","5","8"],answer:"4",explanation:"Ordered: 1,2,4,5,8. Middle=4."},
      {q:"Mode of 3,5,3,7,3,5?",options:["3","5","7","3 and 5"],answer:"3",explanation:"3 appears 3 times (most)."},
      {q:"Range of 4,11,2,9,6?",options:["5","7","9","11"],answer:"9",explanation:"11-2=9."},
      {q:"Mean of 10,20,30?",options:["15","20","25","30"],answer:"20",explanation:"60÷3=20."},
      {q:"Mean=6, values: 3,7,?,9. Missing?",options:["3","4","5","6"],answer:"5",explanation:"Total=24. 3+7+9=19. Missing=5."},
    ],
    "Number Properties":[
      {q:"Primes less than 20? Count them.",options:["6","7","8","9"],answer:"8",explanation:"2,3,5,7,11,13,17,19 = 8 primes."},
      {q:"Factors of 24?",options:["6","8","10","12"],answer:"8",explanation:"1,2,3,4,6,8,12,24 = 8 factors."},
      {q:"LCM of 4 and 6?",options:["8","10","12","24"],answer:"12",explanation:"4,8,12 and 6,12 → LCM=12."},
      {q:"HCF of 12 and 18?",options:["3","4","6","9"],answer:"6",explanation:"Common factors: 1,2,3,6 → HCF=6."},
      {q:"Is 91 prime?",options:["Yes","No — 7×13","No — 9×10","No — 11×8"],answer:"No — 7×13",explanation:"91=7×13. Always test to √n."},
      {q:"3³ = ?",options:["6","9","18","27"],answer:"27",explanation:"3×3×3=27."},
      {q:"√144 = ?",options:["11","12","13","14"],answer:"12",explanation:"12²=144."},
      {q:"2⁵ = ?",options:["10","16","32","64"],answer:"32",explanation:"2×2×2×2×2=32."},
    ],
    "BOSS":[
      {q:"7 × 8 = ?",options:["54","56","63","48"],answer:"56",explanation:"56=7×8!"},
      {q:"25% of 80?",options:["16","20","25","40"],answer:"20",explanation:"80÷4=20."},
      {q:"nth term 5,8,11,14?",options:["n+4","2n+3","3n+2","4n+1"],answer:"3n+2",explanation:"3n+2."},
      {q:"35% off £80?",options:["£44","£48","£52","£56"],answer:"£52",explanation:"£80-£28=£52."},
      {q:"Area triangle base=10, h=6?",options:["30cm²","60cm²","16cm²","20cm²"],answer:"30cm²",explanation:"½×10×6=30."},
      {q:"Mean of 4,8,12,16?",options:["8","10","12","14"],answer:"10",explanation:"40÷4=10."},
      {q:"3x+4=19. x=?",options:["3","4","5","6"],answer:"5",explanation:"3x=15, x=5."},
      {q:"LCM of 4 and 6?",options:["8","10","12","24"],answer:"12",explanation:"LCM=12."},
      {q:"Pythagoras: 3,4. Hyp?",options:["5","6","7","8"],answer:"5",explanation:"√25=5."},
      {q:"¾ of a number=36. Number?",options:["24","27","48","54"],answer:"48",explanation:"¼=12, ×4=48."},
    ],
  },
  english:{
    "Grammar":[
      {q:"Type of word: 'quickly'?",options:["Noun","Verb","Adjective","Adverb"],answer:"Adverb",explanation:"Adverbs describe HOW something is done."},
      {q:"Which is a noun?",options:["Run","Beautiful","Happiness","Quickly"],answer:"Happiness",explanation:"Nouns are naming words — things, feelings, places."},
      {q:"'He and I went' or 'Me and him went'?",options:["He and I went","Me and him went","Him and I went","Me and he went"],answer:"He and I went",explanation:"Subject pronouns: he, I (not me, him)."},
      {q:"'Which was broken' is what clause?",options:["Main","Subordinate","Noun","Adverbial"],answer:"Subordinate",explanation:"Cannot stand alone — needs a main clause."},
      {q:"'The cake was eaten.' Active or passive?",options:["Active","Passive","Neither","Both"],answer:"Passive",explanation:"'Was eaten' = passive voice — subject receives action."},
      {q:"What is a conjunction?",options:["Naming word","Joining word","Describing word","Doing word"],answer:"Joining word",explanation:"Conjunctions join clauses: and, but, because, although."},
      {q:"Which is an adjective?",options:["Swim","Gently","Enormous","Under"],answer:"Enormous",explanation:"Adjectives describe nouns. 'Enormous' = describing size."},
      {q:"Verb in: 'The bird sang beautifully'?",options:["bird","sang","beautifully","The"],answer:"sang",explanation:"Verbs = doing/being words. 'Sang' is the action."},
    ],
    "Punctuation":[
      {q:"'Its raining' or 'It's raining'?",options:["Its raining","It's raining","Its' raining","Its, raining"],answer:"It's raining",explanation:"It's = it is. Apostrophe shows missing letter."},
      {q:"One dog's lead — correct?",options:["dogs' lead","dog's lead","dogs's lead","dogs lead"],answer:"dog's lead",explanation:"One dog = dog's. Apostrophe before the s."},
      {q:"Several boys' coats — correct?",options:["boy's coats","boys' coats","boys's coats","boys coats"],answer:"boys' coats",explanation:"Plural already has s → apostrophe after."},
      {q:"Correct colon use?",options:["I need: to go","I need: milk, eggs","I: need milk","I need milk:"],answer:"I need: milk, eggs",explanation:"Colon introduces a list or explanation."},
      {q:"Where does comma go: 'Although she was tired she kept going'?",options:["After tired","After she","After was","No comma"],answer:"After tired",explanation:"Comma after the subordinate clause."},
      {q:"Correct speech marks?",options:["He said 'stop'","He said, 'Stop.'","He said 'Stop','","He said Stop."],answer:"He said, 'Stop.'",explanation:"Comma before speech, full stop inside marks."},
    ],
    "Vocabulary":[
      {q:"Prefix 'un-' means?",options:["Again","Not","Before","After"],answer:"Not",explanation:"Un- = not. Unhappy = not happy."},
      {q:"'Ambiguous' means?",options:["Clear","Open to more than one meaning","Difficult","Very long"],answer:"Open to more than one meaning",explanation:"Ambiguous = could be interpreted multiple ways."},
      {q:"Root word of 'transportation'?",options:["Trans","Port","Ation","Sport"],answer:"Port",explanation:"Port = carry (Latin: portare)."},
      {q:"'Pedantic' means?",options:["Rude","Overly focused on minor details","Creative","Lazy"],answer:"Overly focused on minor details",explanation:"Pedantic = obsessive about small rules."},
      {q:"Synonym of 'brave'?",options:["Cowardly","Fearful","Courageous","Timid"],answer:"Courageous",explanation:"Courageous = brave. Same meaning."},
      {q:"Prefix 'bi-' means?",options:["One","Two","Three","Half"],answer:"Two",explanation:"Bi- = two. Bicycle = two wheels."},
      {q:"'Benevolent' means?",options:["Evil","Kind/generous","Clever","Lazy"],answer:"Kind/generous",explanation:"Bene = good. Benevolent = well-meaning."},
      {q:"Suffix '-ology' means?",options:["Fear of","Study of","Lack of","Full of"],answer:"Study of",explanation:"Biology = study of life. Geology = study of earth."},
    ],
    "Literary Devices":[
      {q:"What is a simile?",options:["Describing word","Comparison using like/as","Sound like its meaning","Verb type"],answer:"Comparison using like/as",explanation:"'Fast as lightning' = simile."},
      {q:"'The thunder roared.' Which device?",options:["Simile","Metaphor","Personification","Alliteration"],answer:"Personification",explanation:"Thunder given human quality = personification."},
      {q:"What is an oxymoron?",options:["Contradictory terms","A poem type","Homophone","Verb form"],answer:"Contradictory terms",explanation:"'Deafening silence' = oxymoron."},
      {q:"'Soldier like a lion.' This is?",options:["Metaphor","Simile","Hyperbole","Personification"],answer:"Simile",explanation:"Uses 'like' = simile."},
      {q:"Tone of 'The empty street echoed with silence'?",options:["Joyful","Mysterious/melancholic","Angry","Humorous"],answer:"Mysterious/melancholic",explanation:"'Empty', 'echoed', 'silence' = lonely atmosphere."},
      {q:"'Peter Piper picked a peck...' is?",options:["Assonance","Alliteration","Onomatopoeia","Metaphor"],answer:"Alliteration",explanation:"Repeated 'p' sound = alliteration."},
      {q:"'The wind whispered.' This is?",options:["Simile","Metaphor","Personification","Hyperbole"],answer:"Personification",explanation:"Wind given human action (whispered)."},
      {q:"'I've told you a million times!' is?",options:["Fact","Simile","Metaphor","Hyperbole"],answer:"Hyperbole",explanation:"Exaggeration for effect = hyperbole."},
    ],
    "BOSS":[
      {q:"Which is a noun?",options:["Run","Quickly","Happiness","Beautiful"],answer:"Happiness",explanation:"Nouns = naming words."},
      {q:"'It's raining' apostrophe means?",options:["Possession","Contraction","Plural","Emphasis"],answer:"Contraction",explanation:"It's = it is."},
      {q:"'The thunder roared.' Device?",options:["Simile","Metaphor","Personification","Alliteration"],answer:"Personification",explanation:"Human action given to thunder."},
      {q:"Root of 'transportation'?",options:["Trans","Port","Ation","Sport"],answer:"Port",explanation:"Port = carry."},
      {q:"'He and I went' — correct?",options:["Yes","No, say 'Me and him'","No, say 'Him and I'","No, say 'I and him'"],answer:"Yes",explanation:"He and I = subject pronouns ✓"},
      {q:"'Peter Piper picked...' is?",options:["Assonance","Alliteration","Onomatopoeia","Simile"],answer:"Alliteration",explanation:"Repeated p sound."},
      {q:"'I've told you a million times!' is?",options:["Fact","Simile","Metaphor","Hyperbole"],answer:"Hyperbole",explanation:"Exaggeration for effect."},
      {q:"Which clause can stand alone?",options:["Because she ran","When it rained","The dog barked","Although tired"],answer:"The dog barked",explanation:"Main clause = stands alone."},
    ],
  },
  verbal:{
    "Synonyms & Antonyms":[
      {q:"Synonym of HAPPY?",options:["Sad","Joyful","Angry","Tired"],answer:"Joyful",explanation:"Joyful = very happy."},
      {q:"Synonym of ENORMOUS?",options:["Tiny","Average","Huge","Narrow"],answer:"Huge",explanation:"Enormous = huge."},
      {q:"Most similar to METICULOUS?",options:["Careless","Precise","Hasty","Vague"],answer:"Precise",explanation:"Meticulous = very careful."},
      {q:"Antonym of BENEVOLENT?",options:["Kind","Generous","Malevolent","Brave"],answer:"Malevolent",explanation:"Benevolent=kind. Malevolent=evil."},
      {q:"Antonym of ANCIENT?",options:["Old","Historic","Modern","Aged"],answer:"Modern",explanation:"Ancient=old. Opposite=modern."},
      {q:"Antonym of TRANSPARENT?",options:["Clear","Bright","Opaque","Shiny"],answer:"Opaque",explanation:"Transparent↔Opaque."},
      {q:"Synonym of COURAGEOUS?",options:["Timid","Valiant","Fearful","Weak"],answer:"Valiant",explanation:"Valiant = brave/courageous."},
      {q:"Antonym of SUMMIT?",options:["Top","Peak","Valley","Hill"],answer:"Valley",explanation:"Summit=top. Opposite=valley."},
      {q:"Synonym of MELANCHOLY?",options:["Joyful","Cheerful","Sorrowful","Energetic"],answer:"Sorrowful",explanation:"Melancholy = deep sadness."},
      {q:"Antonym of TURBULENT?",options:["Stormy","Chaotic","Calm","Violent"],answer:"Calm",explanation:"Turbulent=rough. Opposite=calm."},
    ],
    "Analogies":[
      {q:"Dog : Puppy :: Cat : ?",options:["Kitten","Cub","Foal","Lamb"],answer:"Kitten",explanation:"Puppy=baby dog. Kitten=baby cat."},
      {q:"Book : Library :: Painting : ?",options:["School","Gallery","Museum","Theatre"],answer:"Gallery",explanation:"Books live in library. Paintings in gallery."},
      {q:"Scalpel : Surgeon :: Gavel : ?",options:["Builder","Judge","Teacher","Artist"],answer:"Judge",explanation:"Tool of the profession."},
      {q:"Bird : Flock :: Fish : ?",options:["Pack","Swarm","Shoal","Herd"],answer:"Shoal",explanation:"Group of fish = shoal."},
      {q:"Hot : Cold :: Light : ?",options:["Sun","Bright","Heavy","Dark"],answer:"Heavy",explanation:"Hot↔Cold. Light↔Heavy."},
      {q:"King : Queen :: Prince : ?",options:["King","Duke","Princess","Duchess"],answer:"Princess",explanation:"Male→Female equivalent."},
      {q:"Pen : Write :: Knife : ?",options:["Cook","Cut","Eat","Sharp"],answer:"Cut",explanation:"A pen writes. A knife cuts."},
      {q:"Glove : Hand :: Boot : ?",options:["Leg","Foot","Shoe","Sock"],answer:"Foot",explanation:"Glove covers hand. Boot covers foot."},
    ],
    "Codes & Ciphers":[
      {q:"If CAT=DBU, what is DOG?",options:["CPH","EPH","ENH","EPI"],answer:"EPH",explanation:"+1 each letter: D→E, O→P, G→H."},
      {q:"A=1, B=2... 2-5-4 spells?",options:["BED","CAT","ACE","BAD"],answer:"BED",explanation:"B=2, E=5, D=4."},
      {q:"If FISH=GJTI, what is CAT?",options:["DBU","CBT","DAV","EBU"],answer:"DBU",explanation:"+1 each: C→D, A→B, T→U."},
      {q:"Mirror code A=Z, B=Y... D=?",options:["W","X","Y","V"],answer:"W",explanation:"D is 4th. From end: Z,Y,X,W → D=W."},
      {q:"If BIG=AHF, what is CAT?",options:["BZS","BAT","BZU","DZS"],answer:"BZS",explanation:"-1 each: C→B, A→Z, T→S."},
    ],
    "Sequences":[
      {q:"Next: A, C, E, G, ?",options:["H","I","J","K"],answer:"I",explanation:"Skip one letter each time."},
      {q:"Next: Z, X, V, T, ?",options:["P","Q","R","S"],answer:"R",explanation:"Backwards, skip one."},
      {q:"Next: A, D, G, J, ?",options:["K","L","M","N"],answer:"M",explanation:"+3 letters each time."},
      {q:"Odd one out: Triangle, Circle, Square, Pyramid?",options:["Triangle","Circle","Square","Pyramid"],answer:"Pyramid",explanation:"Only 3D shape."},
      {q:"Odd one out: Robin, Sparrow, Penguin, Eagle?",options:["Robin","Sparrow","Penguin","Eagle"],answer:"Penguin",explanation:"Only one that can't fly."},
      {q:"Next: 2, 6, 18, 54, ?",options:["108","162","81","72"],answer:"162",explanation:"×3 each time. 54×3=162."},
      {q:"Next: AZ, BY, CX, ?",options:["DV","DW","EW","EV"],answer:"DW",explanation:"Forward A→D + Backward Z→W."},
    ],
    "BOSS":[
      {q:"Dog : Puppy :: Cat : ?",options:["Kitten","Cub","Foal","Lamb"],answer:"Kitten",explanation:"Baby cat = kitten."},
      {q:"Antonym of BENEVOLENT?",options:["Kind","Generous","Malevolent","Brave"],answer:"Malevolent",explanation:"Benevolent=kind, Malevolent=evil."},
      {q:"If CAT=DBU, what is DOG?",options:["CPH","EPH","ENH","EPI"],answer:"EPH",explanation:"+1 each letter."},
      {q:"Next: A, D, G, J, ?",options:["K","L","M","N"],answer:"M",explanation:"+3 each time."},
      {q:"Synonym of ENORMOUS?",options:["Tiny","Average","Huge","Narrow"],answer:"Huge",explanation:"Enormous=huge."},
      {q:"Odd one out: Triangle, Circle, Square, Pyramid?",options:["Triangle","Circle","Square","Pyramid"],answer:"Pyramid",explanation:"Only 3D."},
      {q:"Scalpel : Surgeon :: Gavel : ?",options:["Builder","Judge","Teacher","Artist"],answer:"Judge",explanation:"Tool of profession."},
      {q:"Antonym of TRANSPARENT?",options:["Clear","Bright","Opaque","Shiny"],answer:"Opaque",explanation:"Transparent↔Opaque."},
    ],
  },
  nvr:{
    "2D Shapes":[
      {q:"Sides on a hexagon?",options:["5","6","7","8"],answer:"6",explanation:"Hex=6."},
      {q:"Lines of symmetry in a square?",options:["2","3","4","8"],answer:"4",explanation:"2 straight + 2 diagonal = 4."},
      {q:"Rotational order of a square?",options:["2","4","6","8"],answer:"4",explanation:"Looks same at 90°, 180°, 270°, 360°."},
      {q:"Lines of symmetry in equilateral triangle?",options:["0","1","2","3"],answer:"3",explanation:"3 equal sides = 3 lines."},
      {q:"Sides on octagon?",options:["6","7","8","9"],answer:"8",explanation:"Octa=8."},
      {q:"Interior angle of equilateral triangle?",options:["45°","60°","90°","120°"],answer:"60°",explanation:"180°÷3=60°."},
      {q:"Interior angle of square?",options:["45°","60°","90°","120°"],answer:"90°",explanation:"All corners = right angles."},
      {q:"Diagonals of a pentagon?",options:["4","5","6","7"],answer:"5",explanation:"Pentagon has 5 diagonals."},
    ],
    "Symmetry & Reflection":[
      {q:"Circle lines of symmetry?",options:["0","1","4","Infinite"],answer:"Infinite",explanation:"Any line through centre = line of symmetry."},
      {q:"Arrow points RIGHT, reflected vertically. Now points?",options:["Right","Left","Up","Down"],answer:"Left",explanation:"Vertical reflection flips left↔right."},
      {q:"Rectangle lines of symmetry?",options:["1","2","4","0"],answer:"2",explanation:"Across and down — not diagonals."},
      {q:"Point 3 squares left of mirror. Reflection?",options:["3 left","3 right","3 up","3 down"],answer:"3 right",explanation:"Equal distance, opposite side."},
      {q:"Rotational order of equilateral triangle?",options:["1","2","3","6"],answer:"3",explanation:"Looks same 3× in 360°."},
      {q:"Shape with rotational order 6?",options:["Square","Pentagon","Hexagon","Octagon"],answer:"Hexagon",explanation:"Regular hexagon: same every 60°."},
    ],
    "Patterns & Matrices":[
      {q:"2, 4, 8, 16, ?",options:["18","20","32","24"],answer:"32",explanation:"Doubles each time."},
      {q:"R1:△○□ R2:○□△ R3:□△○ R4:?",options:["△○□","○□△","□△○","△□○"],answer:"△○□",explanation:"Rotates left each row, cycles every 3."},
      {q:"Pattern: ●○●○●○ Next?",options:["●","○","●○","○●"],answer:"●",explanation:"Alternating: next is ●."},
      {q:"1, 4, 9, 16, ?",options:["20","25","36","30"],answer:"25",explanation:"Square numbers: 5²=25."},
      {q:"Triangle 1 has 3 small ▲. 3 Triangles have?",options:["6","7","8","9"],answer:"9",explanation:"3×3=9."},
      {q:"Triangle numbers: 1,3,6,10,?",options:["13","14","15","16"],answer:"15",explanation:"Add 5 to 10 = 15."},
    ],
    "3D Shapes":[
      {q:"Faces on a cube?",options:["4","5","6","8"],answer:"6",explanation:"Top,bottom,front,back,left,right=6."},
      {q:"Edges on a cuboid?",options:["8","10","12","14"],answer:"12",explanation:"4+4+4=12."},
      {q:"Euler: F+V-E = ?",options:["1","2","3","4"],answer:"2",explanation:"Always 2 for convex polyhedra."},
      {q:"Faces on a dodecahedron?",options:["10","12","20","24"],answer:"12",explanation:"Dodeca=12."},
      {q:"5 faces, 8 edges, 5 vertices. Shape?",options:["Cube","Cylinder","Square pyramid","Triangular prism"],answer:"Square pyramid",explanation:"Square base + 4 triangles = 5 faces."},
      {q:"Vertices of a triangular prism?",options:["4","5","6","8"],answer:"6",explanation:"2 triangular ends × 3 = 6 vertices."},
    ],
    "BOSS":[
      {q:"Lines of symmetry in a square?",options:["2","3","4","8"],answer:"4",explanation:"4 lines."},
      {q:"Faces on a cube?",options:["4","5","6","8"],answer:"6",explanation:"6 faces."},
      {q:"2,4,8,16,?",options:["18","20","32","24"],answer:"32",explanation:"×2 each time."},
      {q:"Circle lines of symmetry?",options:["0","1","4","Infinite"],answer:"Infinite",explanation:"Infinite."},
      {q:"Euler: F+V-E=?",options:["1","2","3","4"],answer:"2",explanation:"Always 2."},
      {q:"R1:△○□ R4:?",options:["△○□","○□△","□△○","△□○"],answer:"△○□",explanation:"Cycles every 3 rows."},
      {q:"Edges on a cuboid?",options:["8","10","12","14"],answer:"12",explanation:"12."},
      {q:"5 faces, 8 edges, 5 vertices. Shape?",options:["Cube","Cylinder","Square pyramid","Triangular prism"],answer:"Square pyramid",explanation:"Square pyramid."},
    ],
  },
};

// ─── WORLDS ───────────────────────────────────────────────────────────────────
const WORLDS=[
  {id:"maths",  name:"Math Mountain",      icon:"⛰️",colour:"#4F46E5",gradient:"linear-gradient(135deg,#4F46E5,#7C3AED)",desc:"Master numbers, algebra & beyond",       unlockLevel:1,
   missions:[
    {id:"m_tables",name:"Times Tables",     icon:"✖️",topic:"Times Tables",       xp:60, coins:12,questions:6, trick:"t_nine"},
    {id:"m_fracs", name:"Fraction Forest",  icon:"½", topic:"Fractions",          xp:60, coins:12,questions:6, trick:"t_fracs"},
    {id:"m_pct",   name:"Percent Peak",     icon:"％",topic:"Percentages",        xp:80, coins:15,questions:6, trick:"t_pct"},
    {id:"m_ratio", name:"Ratio Ridge",      icon:"⚖️",topic:"Ratio & Proportion", xp:80, coins:15,questions:6, trick:"t_ratio"},
    {id:"m_alg",   name:"Algebra Alps",     icon:"🔣",topic:"Algebra",            xp:100,coins:18,questions:6, trick:"t_alg"},
    {id:"m_geo",   name:"Geometry Gorge",   icon:"📐",topic:"Geometry",           xp:100,coins:18,questions:6},
    {id:"m_stats", name:"Stats Summit",     icon:"📊",topic:"Statistics",         xp:100,coins:18,questions:6},
    {id:"m_num",   name:"Number Nexus",     icon:"🔢",topic:"Number Properties",  xp:100,coins:18,questions:6},
    {id:"m_boss",  name:"⚔️ Summit Boss",   icon:"👹",topic:"BOSS",               xp:250,coins:60,questions:10,isBoss:true},
   ]},
  {id:"english",name:"English Forest",     icon:"🌲",colour:"#059669",gradient:"linear-gradient(135deg,#059669,#047857)",desc:"Conquer grammar, vocabulary & writing",unlockLevel:3,
   missions:[
    {id:"e_gram",  name:"Grammar Grove",    icon:"📝",topic:"Grammar",            xp:60, coins:12,questions:6, trick:"t_gram"},
    {id:"e_punct", name:"Punctuation Path", icon:"✏️",topic:"Punctuation",        xp:60, coins:12,questions:6, trick:"t_apos"},
    {id:"e_vocab", name:"Vocab Valley",     icon:"📚",topic:"Vocabulary",         xp:80, coins:15,questions:6, trick:"t_roots"},
    {id:"e_lit",   name:"Literary Lake",    icon:"🖊️",topic:"Literary Devices",   xp:80, coins:15,questions:6},
    {id:"e_boss",  name:"⚔️ Forest Boss",   icon:"🐉",topic:"BOSS",               xp:250,coins:60,questions:8, isBoss:true},
   ]},
  {id:"verbal", name:"Word Wizard Tower",  icon:"🗼",colour:"#D97706",gradient:"linear-gradient(135deg,#D97706,#B45309)",desc:"Decode language and master reasoning",unlockLevel:5,
   missions:[
    {id:"v_syn",   name:"Synonym Spire",    icon:"🔄",topic:"Synonyms & Antonyms",xp:60, coins:12,questions:6, trick:"t_syns"},
    {id:"v_ana",   name:"Analogy Arena",    icon:"🔗",topic:"Analogies",          xp:80, coins:15,questions:6, trick:"t_ana"},
    {id:"v_codes", name:"Code Cavern",      icon:"🔐",topic:"Codes & Ciphers",    xp:80, coins:15,questions:5, trick:"t_codes"},
    {id:"v_seq",   name:"Sequence Stairs",  icon:"🔢",topic:"Sequences",          xp:100,coins:18,questions:6, trick:"t_seq"},
    {id:"v_boss",  name:"⚔️ Wizard Boss",   icon:"🧙",topic:"BOSS",               xp:250,coins:60,questions:8, isBoss:true},
   ]},
  {id:"nvr",    name:"Logic Lab",          icon:"🔬",colour:"#DC2626",gradient:"linear-gradient(135deg,#DC2626,#991B1B)",desc:"See patterns others can't even imagine",unlockLevel:8,
   missions:[
    {id:"n_2d",    name:"Shape Station",    icon:"🔷",topic:"2D Shapes",           xp:60, coins:12,questions:6},
    {id:"n_sym",   name:"Symmetry Sanctum", icon:"🔄",topic:"Symmetry & Reflection",xp:80,coins:15,questions:6, trick:"t_sym"},
    {id:"n_pat",   name:"Pattern Plains",   icon:"🔲",topic:"Patterns & Matrices", xp:80, coins:15,questions:6, trick:"t_pats"},
    {id:"n_3d",    name:"3D Dimension",     icon:"🧊",topic:"3D Shapes",           xp:100,coins:18,questions:6, trick:"t_euler"},
    {id:"n_boss",  name:"⚔️ Lab Boss",      icon:"🤖",topic:"BOSS",               xp:250,coins:60,questions:8, isBoss:true},
   ]},
];

// ─── TRICKS ───────────────────────────────────────────────────────────────────
const TRICKS={
  t_nine: {icon:"🖐",title:"The 9× Finger Trick",      subject:"maths",  body:"Hold 10 fingers up. For 9×N, fold down finger N.\nLeft side = tens. Right side = units.\n\n9×7 → fold finger 7 → 6 left, 3 right → 63 ✓"},
  t_fracs:{icon:"½", title:"Fractions in 2 Steps",      subject:"maths",  body:"1. DIVIDE by the bottom number\n2. MULTIPLY by the top number\n\n¾ of 40:\n→ 40÷4=10 (one quarter)\n→ 10×3=30 (three quarters) ✓"},
  t_pct:  {icon:"％",title:"Percentage Building Blocks",subject:"maths",  body:"10%=÷10 · 5%=half of 10% · 25%=÷4 · 50%=÷2\n\nBuild any %:\n• 15% = 10% + 5%\n• 35% = 25% + 10%\n• 75% = 50% + 25%"},
  t_ratio:{icon:"⚖️",title:"Ratio in 3 Steps",          subject:"maths",  body:"1. Add parts → total parts\n2. Total ÷ parts → 1 part value\n3. Multiply each number\n\n2:3, £30 → 5 parts → £6 each → £12 and £18"},
  t_alg:  {icon:"⚖️",title:"Balance the Algebra Scale", subject:"maths",  body:"Do the SAME to BOTH sides.\n\nx+7=15 → subtract 7 both → x=8\n3x=21 → divide both by 3 → x=7"},
  t_gram: {icon:"📝",title:"Subject vs Object Pronouns", subject:"english",body:"SUBJECT: I, he, she, we, they\nOBJECT: me, him, her, us, them\n\n'He and I went' ✓\n'Me and him went' ✗\n\nTip: remove the other person and test alone!"},
  t_apos: {icon:"✏️",title:"Apostrophe Rules",           subject:"english",body:"CONTRACTION (missing letters):\nit is → it's · do not → don't\n\nPOSSESSION (belonging):\ndog's lead (1 dog) · dogs' leads (many dogs)\n\n❌ NEVER for plurals: 'Apple's' = WRONG"},
  t_roots:{icon:"🌱",title:"Word Roots Unlock Meaning",  subject:"english",body:"port=carry · aud=hear · vis=see\nbene=good · mal=bad · scrib=write\ndic=say · rupt=break · flex=bend\n\nLearn roots = decode any unknown word!"},
  t_syns: {icon:"🔄",title:"Word Families",              subject:"verbal", body:"😊 Happy: joyful, elated, gleeful, blissful\n😢 Sad: mournful, melancholy, sorrowful\n💪 Brave: courageous, valiant, intrepid\n😠 Angry: furious, irate, livid, incensed"},
  t_ana:  {icon:"🔗",title:"Analogy Formula",            subject:"verbal", body:"State the relationship first:\n'A is the YOUNG OF B'\n'A is the TOOL OF B'\n'A is the OPPOSITE OF B'\n\nDog:Puppy → 'Puppy = young of Dog'\n→ Cat:? → Kitten ✓"},
  t_codes:{icon:"🔐",title:"Code Cracking Method",       subject:"verbal", body:"Before ANY code question:\n1. Write out A B C D E...\n2. Write shifted alphabet below\n3. Map letter by letter — never in your head!\n\nMost common: +1, +2, -1, mirror (A=Z)"},
  t_seq:  {icon:"🔢",title:"Sequence Rule Finding",      subject:"verbal", body:"1. Find gap between terms\n2. Is it +, -, ×, ÷?\n3. Letters: count positions (+2, +3, skip)\n4. May be TWO alternating rules!\n\n2,6,18,54 → ×3 each → 162"},
  t_sym:  {icon:"🔄",title:"Reflection Rules",           subject:"nvr",    body:"• Equal distance either side of mirror\n• Same size and shape, FLIPPED not rotated\n• Vertical mirror: left↔right swap\n• Horizontal mirror: top↔bottom swap"},
  t_pats: {icon:"🔲",title:"Matrix Pattern Method",      subject:"nvr",    body:"1. Check ROWS: what changes left→right?\n2. Check COLUMNS: what changes top→bottom?\n3. Rule is ALWAYS consistent in both\n\nCommon: rotation, add shape, change size"},
  t_euler:{icon:"🧊",title:"Euler's Formula",            subject:"nvr",    body:"F + V - E = 2\n(Faces + Vertices - Edges = 2)\n\nCube: 6+8-12=2 ✓\nSquare pyramid: 5+5-8=2 ✓\n\nUse to find any missing value!"},
};

const DAILY=[
  {name:"Sunday Sprint",   icon:"🏃",desc:"Complete any 2 missions",       xpBonus:50, coins:20},
  {name:"Maths Monday",    icon:"🔢",desc:"Score 80%+ on a Maths mission",  xpBonus:60, coins:25},
  {name:"Combo Tuesday",   icon:"🌀",desc:"Complete missions in 2 worlds",  xpBonus:70, coins:30},
  {name:"Midweek Mastery", icon:"💪",desc:"Answer 15 questions correctly",  xpBonus:80, coins:35},
  {name:"English Edge",    icon:"📖",desc:"Score 80%+ on English mission",  xpBonus:60, coins:25},
  {name:"Friday Fire 🔥",  icon:"🔥",desc:"Complete 3 missions today",      xpBonus:100,coins:40},
  {name:"Weekend Warrior", icon:"⚔️",desc:"Beat any Boss Battle",          xpBonus:150,coins:60},
];

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({onClose}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPass]=useState("");
  const [name,setName]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const {login,signup}=useAppContext();

  async function handleSubmit(e){
    e.preventDefault(); setError(""); setLoading(true);
    try{
      if(mode==="login") await login(email,password);
      else await signup(email,password,name);
      // Force redirect to /Home — bypasses platform's /login redirect loop
      window.location.replace("https://11-quest-uk.base44.app/Home");
    } catch(err){
      setError(err.message||"Something went wrong. Please try again.");
    } finally{setLoading(false);}
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:380,boxShadow:"0 24px 80px rgba(0,0,0,0.5)",animation:"popIn 0.3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 style={{margin:0,fontSize:20,fontWeight:900,color:"#1e1b4b"}}>{mode==="login"?"Welcome back! 🎮":"Join the Quest! 🎓"}</h2>
            <p style={{margin:"4px 0 0",fontSize:12,color:"#6b7280"}}>{mode==="login"?"Continue your adventure":"Create your free account"}</p>
          </div>
          <button onClick={onClose} style={{background:"#f3f4f6",border:"none",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode==="register"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required style={{width:"100%",padding:"13px",borderRadius:12,border:"2px solid #e5e7eb",fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" required style={{width:"100%",padding:"13px",borderRadius:12,border:"2px solid #e5e7eb",fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>
          <input value={password} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" required style={{width:"100%",padding:"13px",borderRadius:12,border:"2px solid #e5e7eb",fontSize:14,marginBottom:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
          {error&&<div style={{background:"#FEF2F2",borderRadius:10,padding:"10px 12px",marginBottom:12,color:"#DC2626",fontSize:13,fontWeight:600}}>{error}</div>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",opacity:loading?0.7:1}}>
            {loading?"⏳ Signing in...":(mode==="login"?"Sign In →":"Create Account →")}
          </button>
        </form>
        <p style={{textAlign:"center",fontSize:13,color:"#6b7280",marginTop:14,marginBottom:0}}>
          {mode==="login"?"New here? ":"Have an account? "}
          <span onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} style={{color:"#4F46E5",fontWeight:700,cursor:"pointer"}}>
            {mode==="login"?"Register free 🚀":"Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── XP BAR ───────────────────────────────────────────────────────────────────
function XPBar({xp,style={}}){
  const {level,xpInLevel,xpNeeded}=calcLevel(xp||0);
  const rank=getRank(level);
  const pct=Math.round((xpInLevel/xpNeeded)*100);
  return(
    <div style={style}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
        <span style={{fontSize:11,fontWeight:800,color:"white"}}>{rank.icon} {rank.title} · Lv.{level}</span>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.55)"}}>{xpInLevel}/{xpNeeded} XP</span>
      </div>
      <div style={{height:7,background:"rgba(255,255,255,0.18)",borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#FCD34D,#F59E0B)",borderRadius:4,transition:"width 0.8s ease"}}/>
      </div>
    </div>
  );
}

// ─── BADGE POP ────────────────────────────────────────────────────────────────
function BadgePop({badge,onClose}){
  useEffect(()=>{SFX.unlock();const t=setTimeout(onClose,5000);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:"rgba(0,0,0,0.65)"}}>
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#4F46E5)",borderRadius:24,padding:"32px",textAlign:"center",maxWidth:300,animation:"popIn 0.5s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
        <div style={{fontSize:72,marginBottom:8,animation:"starBurst 0.6s ease"}}>{badge.icon}</div>
        <div style={{color:"#FCD34D",fontWeight:900,fontSize:11,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>🎉 Badge Unlocked!</div>
        <div style={{color:"white",fontWeight:900,fontSize:22,marginBottom:6}}>{badge.name}</div>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:13,marginBottom:16}}>{badge.desc}</div>
        <button onClick={onClose} style={{background:"#FCD34D",color:"#1e1b4b",border:"none",borderRadius:12,padding:"12px 28px",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Awesome! 🚀</button>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({screen,goTo}){
  const tabs=[{id:"home",icon:"🗺",label:"Map"},{id:"tricks",icon:"🔑",label:"Tricks"},{id:"leaderboard",icon:"🏆",label:"Ranks"},{id:"progress",icon:"📊",label:"Stats"}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(15,12,41,0.98)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(255,255,255,0.08)",padding:"8px 0 6px",zIndex:200}}>
      <div style={{maxWidth:520,margin:"0 auto",display:"flex"}}>
        {tabs.map(n=>(
          <button key={n.id} onClick={()=>goTo(n.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"6px 4px",borderTop:screen===n.id?"2px solid #FCD34D":"2px solid transparent"}}>
            <span style={{fontSize:20}}>{n.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:screen===n.id?"#FCD34D":"rgba(255,255,255,0.35)"}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MISSION COMPLETE ─────────────────────────────────────────────────────────
function MissionComplete({mission,score,total,xpEarned,coinsEarned,newTrick,onContinue,onRetry}){
  const pct=Math.round((score/total)*100);
  const passed=pct>=70;
  const stars=pct===100?3:pct>=80?2:pct>=70?1:0;
  useEffect(()=>{if(passed)SFX.levelup();},[]);
  return(
    <div style={{minHeight:"100vh",background:passed?"linear-gradient(135deg,#064E3B,#065F46)":"linear-gradient(135deg,#7F1D1D,#991B1B)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <div style={{animation:"popIn 0.5s ease",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"center",gap:6,fontSize:38,marginBottom:8}}>
          {[0,1,2].map(i=><span key={i} style={{filter:i<stars?"none":"grayscale(1) opacity(0.3)",animation:i<stars?`starBurst ${0.3+i*0.2}s ease`:"none"}}>⭐</span>)}
        </div>
        <div style={{fontSize:52,marginBottom:8}}>{pct===100?"🏆":pct>=80?"🎖️":pct>=70?"✅":"💪"}</div>
        <h1 style={{color:"white",fontWeight:900,fontSize:28,margin:"0 0 4px"}}>{pct===100?"PERFECT!":pct>=80?"Excellent!":pct>=70?"Mission Clear!":"Keep Training!"}</h1>
        <p style={{color:"rgba(255,255,255,0.7)",fontSize:16,margin:"0 0 20px"}}>{score}/{total} correct · {pct}%</p>
      </div>
      {passed&&(
        <div style={{display:"flex",gap:12,marginBottom:20,animation:"slideUp 0.4s ease"}}>
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:16,padding:"14px 22px"}}>
            <div style={{color:"#FCD34D",fontWeight:900,fontSize:24}}>+{xpEarned}</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>XP ⚡</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:16,padding:"14px 22px"}}>
            <div style={{color:"#FCD34D",fontWeight:900,fontSize:24}}>+{coinsEarned}</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>Coins 🪙</div>
          </div>
        </div>
      )}
      {newTrick&&passed&&(
        <div style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(252,211,77,0.4)",borderRadius:16,padding:"14px 18px",marginBottom:20,maxWidth:320,textAlign:"left",animation:"slideUp 0.6s ease"}}>
          <div style={{color:"#FCD34D",fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>🔑 Trick Unlocked!</div>
          <div style={{color:"white",fontWeight:800,fontSize:15,marginBottom:4}}>{newTrick.icon} {newTrick.title}</div>
          <div style={{color:"rgba(255,255,255,0.7)",fontSize:12}}>{newTrick.body.split("\n")[0]}</div>
        </div>
      )}
      {!passed&&<p style={{color:"rgba(255,255,255,0.6)",fontSize:14,marginBottom:20}}>Need 70%+ to pass. You've got this!</p>}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
        {!passed&&<button onClick={onRetry} style={{padding:"14px 28px",borderRadius:14,border:"none",background:"white",color:"#991B1B",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>Try Again 🔄</button>}
        <button onClick={onContinue} style={{padding:"14px 28px",borderRadius:14,border:"none",background:passed?"#FCD34D":"rgba(255,255,255,0.2)",color:passed?"#1e1b4b":"white",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
          {passed?"Continue →":"Back to Map"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const {user,logout}=useAppContext();
  const [screen,setScreen]=useState("home");
  const [showAuth,setShowAuth]=useState(false);
  const [activeWorld,setActiveWorld]=useState(null);
  const [popBadge,setPopBadge]=useState(null);
  const [floatMsg,setFloatMsg]=useState(null);

  // Mission state
  const [activeMission,setActiveMission]=useState(null);
  const [missionQs,setMissionQs]=useState([]);
  const [qIdx,setQIdx]=useState(0);
  const [selected,setSelected]=useState(null);
  const [missionScore,setMissionScore]=useState(0);
  const [missionDone,setMissionDone]=useState(false);
  const [newTrick,setNewTrick]=useState(null);
  const [timeLeft,setTimeLeft]=useState(null);
  const [timerActive,setTimerActive]=useState(false);
  const [flashAnim,setFlashAnim]=useState(null);
  const timerRef=useRef(null);

  // Player
  const [player,setPlayer]=useState({xp:0,coins:0,streak:0,last_practice:"",completed_missions:[],badges:[],daily_missions_done:0,daily_date:""});
  const [visitorCount,setVisitorCount]=useState(null);
  const [leaderboard,setLeaderboard]=useState([]);

  const today=new Date().toISOString().split("T")[0];
  const {level:curLevel}=calcLevel(player.xp);
  const curRank=getRank(curLevel);
  const dailyChallenge=DAILY[new Date().getDay()];

  useEffect(()=>{
    (async()=>{try{const r=await VisitorCount.list();if(r.length===0){const v=await VisitorCount.create({count:1});setVisitorCount(v.count);}else{const v=await VisitorCount.update(r[0].id,{count:(r[0].count||0)+1});setVisitorCount(v.count);}}catch{}})();
  },[]);

  useEffect(()=>{
    if(!user)return;
    (async()=>{
      try{
        const recs=await UserProgress.filter({user_id:user.id});
        if(recs.length>0){const d=recs[0];setPlayer({xp:d.xp||0,coins:d.coins||0,streak:d.streak_days||0,last_practice:d.last_practice_date||"",completed_missions:d.completed_missions||[],badges:d.badges||[],daily_missions_done:d.daily_missions_done||0,daily_date:d.daily_date||""});}
        const lb=await UserProgress.list();
        setLeaderboard(lb.sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,20));
      }catch{}
    })();
  },[user]);

  useEffect(()=>{
    if(timerActive&&timeLeft>0){timerRef.current=setTimeout(()=>setTimeLeft(t=>t-1),1000);}
    else if(timerActive&&timeLeft===0){setTimerActive(false);setMissionDone(true);}
    return()=>clearTimeout(timerRef.current);
  },[timerActive,timeLeft]);

  function isMissionUnlocked(world,mission){
    if(curLevel<world.unlockLevel)return false;
    const idx=world.missions.indexOf(mission);
    if(idx===0)return true;
    return player.completed_missions.includes(world.missions[idx-1].id);
  }
  function isCompleted(id){return player.completed_missions.includes(id);}

  function startMission(mission,worldId){
    SFX.click();
    const pool=[...(QBANK[worldId]?.[mission.topic]||[])].sort(()=>Math.random()-0.5).slice(0,mission.questions);
    if(!pool.length)return;
    setActiveMission({...mission,_worldId:worldId});
    setMissionQs(pool);setQIdx(0);setSelected(null);setMissionScore(0);setMissionDone(false);setNewTrick(null);setFlashAnim(null);
    if(mission.isBoss){setTimeLeft(mission.questions*25);setTimerActive(true);}else{setTimeLeft(null);setTimerActive(false);}
    setScreen("mission");
  }

  function handleAnswer(opt){
    if(selected!==null)return;
    setSelected(opt);
    const correct=opt===missionQs[qIdx].answer;
    if(correct){SFX.correct();setMissionScore(s=>s+1);setFlashAnim("correct");setFloatMsg({txt:"+✅",col:"#059669"});}
    else{SFX.wrong();setFlashAnim("wrong");setFloatMsg({txt:"❌",col:"#DC2626"});}
    setTimeout(()=>{setFlashAnim(null);setFloatMsg(null);},1200);
  }

  async function nextQ(){
    if(qIdx+1>=missionQs.length){setTimerActive(false);setMissionDone(true);if(user)await saveResult();}
    else{setQIdx(i=>i+1);setSelected(null);}
  }

  async function saveResult(){
    const pct=Math.round((missionScore/missionQs.length)*100);
    if(pct<70)return;
    try{
      const existing=await UserProgress.filter({user_id:user.id});
      const prev=existing[0]||{};
      const newXP=(prev.xp||0)+activeMission.xp;
      const newCoins=(prev.coins||0)+activeMission.coins;
      const prevCompleted=prev.completed_missions||[];
      const newCompleted=prevCompleted.includes(activeMission.id)?prevCompleted:[...prevCompleted,activeMission.id];
      let streak=prev.streak_days||0;
      const yesterday=new Date(Date.now()-86400000).toISOString().split("T")[0];
      if(prev.last_practice_date===today){}else if(prev.last_practice_date===yesterday)streak++;else streak=1;
      let dd=prev.daily_missions_done||0,ddate=prev.daily_date||"";
      if(ddate!==today){dd=0;ddate=today;}dd++;
      if(activeMission.trick)setNewTrick(TRICKS[activeMission.trick]||null);
      const pb=[...(prev.badges||[])],badges=[...pb];
      const nl=calcLevel(newXP).level;
      if(!badges.includes("first_quest"))badges.push("first_quest");
      if(streak>=3&&!badges.includes("streak_3"))badges.push("streak_3");
      if(streak>=7&&!badges.includes("streak_7"))badges.push("streak_7");
      if(pct===100&&!badges.includes("perfect"))badges.push("perfect");
      if(activeMission.isBoss&&!badges.includes("boss_slayer"))badges.push("boss_slayer");
      if(nl>=5&&!badges.includes("level_5"))badges.push("level_5");
      if(nl>=10&&!badges.includes("level_10"))badges.push("level_10");
      if(newCompleted.length>=10&&!badges.includes("ten_missions"))badges.push("ten_missions");
      const earned=badges.filter(b=>!pb.includes(b));
      const BDEFS={first_quest:{icon:"🎯",name:"First Quest",desc:"Complete your first mission"},streak_3:{icon:"🔥",name:"On Fire",desc:"3-day streak"},streak_7:{icon:"💎",name:"Diamond",desc:"7-day streak"},perfect:{icon:"⭐",name:"Flawless",desc:"100% score"},boss_slayer:{icon:"👹",name:"Boss Slayer",desc:"Defeat a Boss"},level_5:{icon:"🚀",name:"Rising Star",desc:"Reach Level 5"},level_10:{icon:"👑",name:"Champion",desc:"Reach Level 10"},ten_missions:{icon:"💯",name:"Veteran",desc:"Complete 10 missions"}};
      if(earned.length>0){const b=BDEFS[earned[0]];if(b)setTimeout(()=>setPopBadge(b),2800);}
      const data={user_id:user.id,xp:newXP,coins:newCoins,level:nl,streak_days:streak,last_practice_date:today,completed_missions:newCompleted,badges,daily_missions_done:dd,daily_date:ddate};
      if(existing[0])await UserProgress.update(existing[0].id,data);
      else await UserProgress.create(data);
      setPlayer(p=>({...p,xp:newXP,coins:newCoins,streak,last_practice:today,completed_missions:newCompleted,badges,daily_missions_done:dd,daily_date:ddate}));
      if(nl>curLevel)setTimeout(()=>SFX.levelup(),600);
    }catch(e){console.error(e);}
  }

  function goTo(s){SFX.click();setScreen(s);}

  // ── MISSION SCREEN ─────────────────────────────────────────────────────────
  if(screen==="mission"&&!missionDone&&missionQs[qIdx]){
    const q=missionQs[qIdx];
    const isBoss=activeMission?.isBoss;
    const tPct=isBoss?(timeLeft/(activeMission.questions*25))*100:100;
    return(
      <div style={{minHeight:"100vh",background:isBoss?"linear-gradient(135deg,#3B0000,#7F1D1D)":"linear-gradient(135deg,#1e1b4b,#312e81)",animation:flashAnim==="wrong"?"shake 0.4s ease":undefined}}>
        {floatMsg&&<div style={{position:"fixed",top:"28%",right:20,zIndex:500,animation:"floatUp 1.2s ease forwards",pointerEvents:"none",background:floatMsg.col,color:"white",fontWeight:900,fontSize:18,borderRadius:12,padding:"8px 16px"}}>{floatMsg.txt}</div>}
        {flashAnim&&<div style={{position:"fixed",inset:0,zIndex:50,pointerEvents:"none",animation:flashAnim==="correct"?"flashGreen 0.6s ease":"flashRed 0.6s ease"}}/>}
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 80px"}}>
          <div style={{padding:"14px 0 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={()=>{setTimerActive(false);setScreen("map");SFX.click();}} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer"}}>✕ Quit</button>
            <div style={{textAlign:"center"}}>
              <div style={{color:isBoss?"#EF4444":"#FCD34D",fontWeight:800,fontSize:13}}>{isBoss?"⚔️ BOSS BATTLE":"⚡ Mission"}</div>
              <div style={{color:"rgba(255,255,255,0.55)",fontSize:11}}>{activeMission?.name}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#FCD34D",fontWeight:800,fontSize:13}}>+{activeMission?.xp}XP</div>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{missionScore}/{qIdx} ✓</div>
            </div>
          </div>
          <div style={{height:8,background:"rgba(255,255,255,0.14)",borderRadius:4,marginBottom:10,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${((qIdx+1)/missionQs.length)*100}%`,background:isBoss?"linear-gradient(90deg,#EF4444,#F97316)":"linear-gradient(90deg,#FCD34D,#A78BFA)",borderRadius:4,transition:"width 0.4s ease"}}/>
          </div>
          {isBoss&&(
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{color:"rgba(255,255,255,0.55)",fontSize:11}}>⏱ Time</span>
                <span style={{color:timeLeft<30?"#EF4444":"#FCD34D",fontWeight:800,fontSize:14,animation:timeLeft<10?"pulse 0.5s infinite":undefined}}>{timeLeft}s</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.14)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${tPct}%`,background:timeLeft<30?"#EF4444":"#FCD34D",borderRadius:2,transition:"width 1s linear"}}/>
              </div>
            </div>
          )}
          <div style={{background:"white",borderRadius:22,padding:"22px 18px",marginBottom:12,boxShadow:isBoss?"0 8px 40px rgba(220,38,38,0.3)":"0 8px 30px rgba(0,0,0,0.25)",animation:"slideUp 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"1px"}}>{q.topic||activeMission?.name}</span>
              <span style={{fontSize:12,color:"#9ca3af"}}>{qIdx+1} / {missionQs.length}</span>
            </div>
            <p style={{fontWeight:800,fontSize:18,color:"#111827",margin:"0 0 20px",lineHeight:1.4}}>{q.q}</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {q.options.map(opt=>{
                const isSel=selected===opt,isAns=opt===q.answer;
                let bg="white",border="2px solid #E5E7EB",col="#374151",shadow="none";
                if(selected){
                  if(isAns){bg="#ECFDF5";border="2px solid #059669";col="#065F46";shadow="0 0 0 3px rgba(5,150,105,0.15)";}
                  else if(isSel){bg="#FEF2F2";border="2px solid #DC2626";col="#991B1B";shadow="0 0 0 3px rgba(220,38,38,0.15)";}
                  else{bg="#F9FAFB";col="#9CA3AF";}
                }
                return(
                  <button key={opt} onClick={()=>handleAnswer(opt)}
                    style={{padding:"14px 16px",borderRadius:14,border,background:bg,color:col,fontWeight:700,fontSize:14,cursor:selected?"default":"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.2s",boxShadow:shadow}}>
                    <span>{opt}</span>
                    {selected&&isAns&&<span style={{animation:"starBurst 0.4s ease"}}>✅</span>}
                    {selected&&isSel&&!isAns&&<span>❌</span>}
                  </button>
                );
              })}
            </div>
            {selected&&(
              <div style={{background:"#EEF2FF",borderRadius:12,padding:"12px 14px",marginTop:12,animation:"slideUp 0.3s ease"}}>
                <p style={{fontWeight:700,fontSize:13,color:"#312e81",margin:"0 0 2px"}}>💡 Explanation</p>
                <p style={{fontSize:13,color:"#4338ca",margin:0,lineHeight:1.5}}>{missionQs[qIdx].explanation}</p>
              </div>
            )}
          </div>
          {selected&&(
            <button onClick={nextQ} style={{width:"100%",padding:"16px",borderRadius:16,border:"none",background:isBoss?"linear-gradient(135deg,#DC2626,#991B1B)":"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",animation:"slideUp 0.3s ease",fontFamily:"inherit"}}>
              {qIdx+1>=missionQs.length?"Finish Mission ⚡":"Next →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if(screen==="mission"&&missionDone)return(
    <>
      {popBadge&&<BadgePop badge={popBadge} onClose={()=>setPopBadge(null)}/>}
      <MissionComplete mission={activeMission} score={missionScore} total={missionQs.length}
        xpEarned={Math.round((missionScore/missionQs.length)*100)>=70?activeMission?.xp:0}
        coinsEarned={Math.round((missionScore/missionQs.length)*100)>=70?activeMission?.coins:0}
        newTrick={newTrick} onContinue={()=>setScreen("map")} onRetry={()=>startMission(activeMission,activeMission._worldId)}/>
    </>
  );

  // ── WORLD DETAIL ───────────────────────────────────────────────────────────
  if(screen==="map"&&activeWorld){
    const world=activeWorld;
    const locked=curLevel<world.unlockLevel;
    return(
      <div style={{minHeight:"100vh",background:`linear-gradient(180deg,${world.colour}cc 0%,#0f0c29 100%)`}}>
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
          <div style={{padding:"14px 0",display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>{SFX.click();setActiveWorld(null);setScreen("home");}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 14px",cursor:"pointer"}}>← Map</button>
            <div>
              <div style={{color:"white",fontWeight:900,fontSize:20}}>{world.icon} {world.name}</div>
              <div style={{color:"rgba(255,255,255,0.55)",fontSize:12}}>{world.desc}</div>
            </div>
          </div>
          {locked&&<div style={{background:"rgba(0,0,0,0.4)",borderRadius:18,padding:"24px",textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:48,marginBottom:8}}>🔒</div>
            <div style={{color:"white",fontWeight:800,fontSize:17}}>Unlocks at Level {world.unlockLevel}</div>
            <div style={{color:"rgba(255,255,255,0.55)",fontSize:13,marginTop:4}}>You're Level {curLevel} — keep going!</div>
          </div>}
          {world.missions.map((mission,idx)=>{
            const unlocked=!locked&&isMissionUnlocked(world,mission);
            const completed=isCompleted(mission.id);
            const trickObj=mission.trick?TRICKS[mission.trick]:null;
            const trickUnlocked=trickObj&&player.completed_missions.includes(mission.id);
            return(
              <div key={mission.id} style={{display:"flex",gap:12,marginBottom:10,animation:`slideUp ${0.1+idx*0.07}s ease`}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:52,flexShrink:0}}>
                  {idx>0&&<div style={{width:2,height:14,background:"rgba(255,255,255,0.18)",marginBottom:4}}/>}
                  <button onClick={()=>unlocked&&startMission(mission,world.id)} disabled={!unlocked}
                    style={{width:52,height:52,borderRadius:"50%",border:completed?"3px solid #FCD34D":unlocked?(mission.isBoss?"3px solid #EF4444":"3px solid rgba(255,255,255,0.4)"):"3px solid rgba(255,255,255,0.1)",background:completed?"#FCD34D":unlocked?(mission.isBoss?"rgba(220,38,38,0.35)":"rgba(255,255,255,0.12)"):"rgba(0,0,0,0.3)",cursor:unlocked?"pointer":"not-allowed",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",animation:completed?"glow 2s infinite":unlocked&&mission.isBoss?"bossGlow 2s infinite":undefined}}>
                    {completed?"⭐":unlocked?mission.icon:"🔒"}
                  </button>
                  {idx<world.missions.length-1&&<div style={{width:2,height:14,background:"rgba(255,255,255,0.18)",marginTop:4}}/>}
                </div>
                <div onClick={()=>unlocked&&startMission(mission,world.id)}
                  style={{flex:1,background:completed?"rgba(252,211,77,0.12)":unlocked?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.22)",borderRadius:18,padding:"14px 16px",cursor:unlocked?"pointer":"default",border:completed?"1px solid rgba(252,211,77,0.35)":mission.isBoss?"1px solid rgba(239,68,68,0.35)":"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{color:completed?"#FCD34D":unlocked?"white":"rgba(255,255,255,0.28)",fontWeight:800,fontSize:15,marginBottom:3}}>{mission.name}</div>
                      <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{mission.isBoss?"⏱ TIMED · ":""}{mission.questions}q · +{mission.xp}XP · 🪙{mission.coins}</div>
                    </div>
                    {unlocked&&!completed&&<span style={{color:mission.isBoss?"#EF4444":"#FCD34D",fontSize:20}}>▶</span>}
                    {completed&&<span>✅</span>}
                    {!unlocked&&<span style={{fontSize:14}}>🔒</span>}
                  </div>
                  {trickObj&&<div style={{marginTop:8,background:"rgba(0,0,0,0.18)",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:13}}>{trickObj.icon}</span>
                    <span style={{color:trickUnlocked?"#FCD34D":"rgba(255,255,255,0.28)",fontSize:11,fontWeight:700}}>{trickUnlocked?`🔑 ${trickObj.title}`:`🔒 Complete to unlock trick`}</span>
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
        <BottomNav screen={screen} goTo={goTo}/>
      </div>
    );
  }

  // ── LEADERBOARD ────────────────────────────────────────────────────────────
  if(screen==="leaderboard")return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63)"}}>
      <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
        <div style={{padding:"14px 0 8px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>goTo("home")} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer"}}>← Back</button>
          <h2 style={{color:"white",fontWeight:900,fontSize:20,margin:0}}>🏆 Leaderboard</h2>
        </div>
        {leaderboard.length>=3&&(
          <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:6,marginBottom:16}}>
            {[leaderboard[1],leaderboard[0],leaderboard[2]].map((e,i)=>{
              if(!e)return null;
              const medals=["🥈","🥇","🥉"];const hs=["70px","90px","58px"];
              const pos=[2,1,3][i];const isMe=user&&e.user_id===user.id;
              const rank=getRank(calcLevel(e.xp||0).level);
              return <div key={pos} style={{textAlign:"center",flex:1}}>
                <div style={{fontSize:22,marginBottom:4}}>{medals[i]}</div>
                <div style={{background:isMe?"rgba(79,70,229,0.4)":"rgba(255,255,255,0.08)",borderRadius:"12px 12px 0 0",height:hs[i],display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"8px 4px",border:isMe?"2px solid #7C3AED":"none"}}>
                  <div style={{fontSize:10,fontWeight:800,color:"white"}}>{isMe?"⭐ You":`#${pos}`}</div>
                  <div style={{fontSize:11,color:"#FCD34D",fontWeight:700}}>{e.xp||0}XP</div>
                  <div style={{fontSize:13}}>{rank.icon}</div>
                </div>
              </div>;
            })}
          </div>
        )}
        <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,overflow:"hidden"}}>
          {leaderboard.map((e,i)=>{
            const isMe=user&&e.user_id===user.id;
            const rank=getRank(calcLevel(e.xp||0).level);
            const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;
            return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:isMe?"rgba(79,70,229,0.22)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{width:26,fontWeight:900,fontSize:14,color:i<3?"#FCD34D":"rgba(255,255,255,0.35)"}}>{medal}</div>
              <div style={{width:34,height:34,borderRadius:"50%",background:rank.colour,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{rank.icon}</div>
              <div style={{flex:1}}>
                <div style={{color:"white",fontWeight:700,fontSize:14}}>{isMe?`⭐ ${user.full_name||"You"}`:`Player ${i+1}`}</div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>{rank.title} · 🔥{e.streak_days||0}</div>
              </div>
              <div style={{fontWeight:800,fontSize:14,color:"#FCD34D"}}>{e.xp||0} XP</div>
            </div>;
          })}
          {!user&&<div style={{padding:16,textAlign:"center"}}>
            <button onClick={()=>setShowAuth(true)} style={{padding:"12px 24px",borderRadius:12,background:"white",color:"#3730a3",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In to Compete →</button>
          </div>}
        </div>
      </div>
      <BottomNav screen={screen} goTo={goTo}/>
    </div>
  );

  // ── TRICKS ─────────────────────────────────────────────────────────────────
  if(screen==="tricks")return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63)"}}>
      <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
        <div style={{padding:"14px 0 8px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>goTo("home")} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer"}}>← Back</button>
          <div>
            <h2 style={{color:"white",fontWeight:900,fontSize:20,margin:0}}>🔑 Tricks & Hacks</h2>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>Earn by completing missions</div>
          </div>
        </div>
        {Object.entries(TRICKS).map(([id,trick],i)=>{
          const missionId=WORLDS.flatMap(w=>w.missions).find(m=>m.trick===id)?.id;
          const unlocked=missionId?player.completed_missions.includes(missionId):false;
          const world=WORLDS.find(w=>w.id===trick.subject);
          return(
            <div key={id} style={{background:unlocked?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.28)",borderRadius:18,padding:"16px",marginBottom:10,border:unlocked?"1px solid rgba(252,211,77,0.22)":"1px solid rgba(255,255,255,0.05)",animation:`slideUp ${0.05+i*0.04}s ease`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:unlocked?10:0}}>
                <div style={{width:46,height:46,borderRadius:14,background:unlocked?(world?.colour||"#4F46E5"):"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,filter:unlocked?"none":"grayscale(1) opacity(0.3)"}}>
                  {trick.icon}
                </div>
                <div>
                  <div style={{color:unlocked?"white":"rgba(255,255,255,0.28)",fontWeight:800,fontSize:15}}>{unlocked?trick.title:`🔒 ${trick.title}`}</div>
                  <div style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>{world?.name}</div>
                </div>
              </div>
              {unlocked&&<div style={{background:"rgba(0,0,0,0.22)",borderRadius:12,padding:"12px 14px",whiteSpace:"pre-wrap",color:"rgba(255,255,255,0.85)",fontSize:13,lineHeight:1.65}}>{trick.body}</div>}
            </div>
          );
        })}
      </div>
      <BottomNav screen={screen} goTo={goTo}/>
    </div>
  );

  // ── PROGRESS ───────────────────────────────────────────────────────────────
  if(screen==="progress")return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63)"}}>
      <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
        <div style={{padding:"14px 0 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>goTo("home")} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer"}}>← Back</button>
            <h2 style={{color:"white",fontWeight:900,fontSize:20,margin:0}}>📊 Progress</h2>
          </div>
          {user&&<button onClick={()=>{logout();setPlayer({xp:0,coins:0,streak:0,last_practice:"",completed_missions:[],badges:[],daily_missions_done:0,daily_date:""});}} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.5)",fontSize:12,borderRadius:10,padding:"6px 12px",cursor:"pointer",fontFamily:"inherit"}}>Sign out</button>}
        </div>
        {!user?<div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{fontSize:56,marginBottom:12}}>🔒</div>
          <p style={{color:"white",fontWeight:800,fontSize:18}}>Sign in to track progress</p>
          <button onClick={()=>setShowAuth(true)} style={{marginTop:12,padding:"12px 24px",borderRadius:12,background:"white",color:"#3730a3",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In →</button>
        </div>:(
          <>
            <div style={{background:"linear-gradient(135deg,rgba(79,70,229,0.3),rgba(124,58,237,0.2))",border:"1px solid rgba(255,255,255,0.12)",borderRadius:22,padding:"20px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{color:"rgba(255,255,255,0.45)",fontSize:11,textTransform:"uppercase",letterSpacing:"1px"}}>Rank</div>
                  <div style={{color:"white",fontWeight:900,fontSize:22}}>{curRank.icon} {curRank.title}</div>
                  <div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>Level {curLevel} · {user.full_name||user.email}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#FCD34D",fontWeight:900,fontSize:17}}>🪙 {player.coins}</div>
                  <div style={{color:"#F97316",fontSize:13,fontWeight:700,marginTop:2}}>🔥 {player.streak} streak</div>
                </div>
              </div>
              <XPBar xp={player.xp}/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:14}}>
                {[{v:player.completed_missions.length,l:"Missions",c:"#FCD34D"},{v:player.xp,l:"Total XP",c:"#60A5FA"},{v:(player.badges||[]).length,l:"Badges",c:"#A78BFA"},{v:player.streak,l:"Streak 🔥",c:"#F97316"}].map((s,i)=>(
                  <div key={i} style={{textAlign:"center",background:"rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 4px"}}>
                    <div style={{fontSize:16,fontWeight:900,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:20,padding:"16px",marginBottom:14,border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{color:"white",fontWeight:800,fontSize:15,marginBottom:14}}>🗺 Skill Tree</div>
              {WORLDS.map(world=>{
                const done=world.missions.filter(m=>isCompleted(m.id)).length;
                const total=world.missions.length;
                const pct=Math.round((done/total)*100);
                const locked=curLevel<world.unlockLevel;
                return <div key={world.id} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>{world.icon}</span>
                      <span style={{color:locked?"rgba(255,255,255,0.28)":"white",fontWeight:700,fontSize:14}}>{world.name}</span>
                      {locked&&<span style={{color:"rgba(255,255,255,0.28)",fontSize:10}}>🔒 Lv.{world.unlockLevel}</span>}
                    </div>
                    <span style={{color:world.colour,fontWeight:800,fontSize:12}}>{done}/{total}</span>
                  </div>
                  <div style={{height:7,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden",marginBottom:6}}>
                    <div style={{height:"100%",width:`${pct}%`,background:world.colour,borderRadius:4,transition:"width 1.2s"}}/>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {world.missions.map(m=>(
                      <div key={m.id} title={m.name} style={{width:30,height:30,borderRadius:"50%",background:isCompleted(m.id)?"#FCD34D":isMissionUnlocked(world,m)?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,border:isCompleted(m.id)?"2px solid #F59E0B":"1px solid rgba(255,255,255,0.08)"}}>
                        {isCompleted(m.id)?"✅":m.icon}
                      </div>
                    ))}
                  </div>
                </div>;
              })}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:20,padding:"16px",border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{color:"white",fontWeight:800,fontSize:15,marginBottom:12}}>🏅 Badges ({(player.badges||[]).length})</div>
              {(player.badges||[]).length===0&&<p style={{color:"rgba(255,255,255,0.3)",fontSize:13,textAlign:"center"}}>Complete missions to earn badges!</p>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {(player.badges||[]).map((bid,i)=>{
                  const defs={first_quest:{icon:"🎯",name:"First Quest"},streak_3:{icon:"🔥",name:"On Fire"},streak_7:{icon:"💎",name:"Diamond"},perfect:{icon:"⭐",name:"Flawless"},boss_slayer:{icon:"👹",name:"Boss Slayer"},level_5:{icon:"🚀",name:"Lv.5"},level_10:{icon:"👑",name:"Lv.10"},ten_missions:{icon:"💯",name:"Veteran"}};
                  const b=defs[bid]||{icon:"🏅",name:bid};
                  return <div key={i} style={{background:"rgba(252,211,77,0.09)",borderRadius:12,padding:"10px 4px",textAlign:"center",border:"1px solid rgba(252,211,77,0.2)"}}>
                    <div style={{fontSize:22}}>{b.icon}</div>
                    <div style={{fontSize:10,fontWeight:700,color:"#FCD34D",marginTop:3}}>{b.name}</div>
                  </div>;
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <BottomNav screen={screen} goTo={goTo}/>
    </div>
  );

  // ── HOME ───────────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29 0%,#1a1560 45%,#0f0c29 100%)"}}>
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)}/>}
      {popBadge&&<BadgePop badge={popBadge} onClose={()=>setPopBadge(null)}/>}

      {/* Top bar */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(15,12,41,0.96)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"10px 16px"}}>
        <div style={{maxWidth:520,margin:"0 auto",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🎓</span>
          <div style={{flex:1}}><XPBar xp={player.xp}/></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{background:"rgba(252,211,77,0.1)",border:"1px solid rgba(252,211,77,0.28)",borderRadius:10,padding:"4px 9px",fontSize:12,fontWeight:800,color:"#FCD34D"}}>🪙{player.coins}</div>
            <div style={{background:"rgba(249,115,22,0.12)",border:"1px solid rgba(249,115,22,0.28)",borderRadius:10,padding:"4px 9px",fontSize:12,fontWeight:800,color:"#F97316"}}>🔥{player.streak}</div>
            {user?(
              <div onClick={()=>goTo("progress")} title="My Progress" style={{width:33,height:33,borderRadius:"50%",background:curRank.colour,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,border:"2px solid rgba(255,255,255,0.25)"}}>{curRank.icon}</div>
            ):(
              <button onClick={()=>setShowAuth(true)} style={{padding:"7px 12px",borderRadius:10,background:"#4F46E5",color:"white",fontWeight:700,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In</button>
            )}
          </div>
        </div>
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"14px 16px 100px"}}>
        {/* Welcome */}
        <div style={{textAlign:"center",marginBottom:14}}>
          {user&&<p style={{color:"white",fontWeight:800,fontSize:17,margin:"0 0 6px"}}>👋 Hey, {user.full_name?.split(" ")[0]||"Explorer"}!</p>}
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",borderRadius:20,padding:"7px 16px"}}>
            <span style={{color:"rgba(255,255,255,0.55)",fontSize:12}}>👥 {visitorCount??"..."} explorers · {curRank.icon} {curRank.title}</span>
          </div>
        </div>

        {/* Daily challenge */}
        <div style={{background:"linear-gradient(135deg,rgba(245,158,11,0.14),rgba(239,68,68,0.14))",border:"1px solid rgba(245,158,11,0.28)",borderRadius:18,padding:"14px 16px",marginBottom:16,animation:"pulse 3s infinite"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:"#FCD34D",fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>⚡ Daily Challenge</div>
              <div style={{color:"white",fontWeight:800,fontSize:15}}>{dailyChallenge.icon} {dailyChallenge.name}</div>
              <div style={{color:"rgba(255,255,255,0.55)",fontSize:12,marginTop:2}}>{dailyChallenge.desc}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
              <div style={{color:"#FCD34D",fontWeight:900,fontSize:15}}>+{dailyChallenge.xpBonus}XP</div>
              <div style={{color:"#FCD34D",fontSize:12}}>🪙{dailyChallenge.coins}</div>
              {player.daily_date===today&&<div style={{color:"#4ADE80",fontSize:11,fontWeight:700,marginTop:2}}>✅ Done!</div>}
            </div>
          </div>
        </div>

        {/* Map label */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{color:"white",fontWeight:900,fontSize:18}}>🗺 Adventure Map</div>
          {!user&&<button onClick={()=>setShowAuth(true)} style={{padding:"5px 12px",borderRadius:16,background:"rgba(79,70,229,0.5)",border:"1px solid rgba(99,102,241,0.4)",color:"white",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Sign in to save →</button>}
        </div>

        {/* Worlds */}
        {WORLDS.map((world,i)=>{
          const locked=curLevel<world.unlockLevel;
          const done=world.missions.filter(m=>isCompleted(m.id)).length;
          const total=world.missions.length;
          const pct=Math.round((done/total)*100);
          const next=world.missions.find(m=>!isCompleted(m.id)&&isMissionUnlocked(world,m));
          return(
            <div key={world.id} onClick={()=>{SFX.click();setActiveWorld(world);setScreen("map");}}
              style={{background:locked?"rgba(0,0,0,0.32)":world.gradient,borderRadius:22,padding:"20px",marginBottom:14,cursor:"pointer",boxShadow:locked?"none":"0 10px 40px rgba(0,0,0,0.4)",opacity:locked?0.55:1,animation:`slideUp ${0.15+i*0.08}s ease`}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{fontSize:46,lineHeight:1,flexShrink:0,animation:locked?"none":"worldFloat 4s infinite"}}>{world.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{color:"white",fontWeight:900,fontSize:18,marginBottom:2}}>{world.name}</div>
                      <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginBottom:locked?0:8}}>{world.desc}</div>
                    </div>
                    {locked&&<div style={{background:"rgba(0,0,0,0.38)",borderRadius:10,padding:"4px 10px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.45)",flexShrink:0,marginLeft:8}}>🔒 Lv.{world.unlockLevel}</div>}
                    {!locked&&done===total&&<div style={{color:"#FCD34D",fontSize:12,fontWeight:800,flexShrink:0,marginLeft:8}}>⭐ DONE!</div>}
                  </div>
                  {!locked&&(
                    <>
                      <div style={{height:6,background:"rgba(255,255,255,0.2)",borderRadius:3,overflow:"hidden",marginBottom:5}}>
                        <div style={{height:"100%",width:`${pct}%`,background:"rgba(255,255,255,0.85)",borderRadius:3,transition:"width 1.2s"}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:"rgba(255,255,255,0.6)",fontSize:11}}>{done}/{total} missions</span>
                        {next&&<span style={{background:"rgba(0,0,0,0.2)",color:"white",fontWeight:700,fontSize:11,borderRadius:8,padding:"3px 8px"}}>▶ {next.name}</span>}
                        {done===total&&!locked&&<span style={{color:"#FCD34D",fontSize:12,fontWeight:800}}>Boss slain ⚔️</span>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav screen={screen} goTo={goTo}/>
    </div>
  );
}
