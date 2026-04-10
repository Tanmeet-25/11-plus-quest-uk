// v8.0 - ONBOARDING + AGE GROUPS 3-4, 4-7 + ROLE-BASED FLOW + FRIENDLY HOME SCREEN
import { useState, useEffect, useRef, useCallback } from "react";
import { User, UserProgress } from "@/api/entities";

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
const LS = {
  get: (k, def=null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

// ─── PROGRESS HELPERS (Base44 DB + localStorage fallback) ─────────────────────
const Progress = {
  getLocal: (uid) => LS.get(`q11_progress_${uid}`, {xp:0,coins:0,streak_days:0,last_practice_date:"",completed_missions:[],badges:[],daily_missions_done:0,daily_date:""}),
  saveLocal: (uid, data) => LS.set(`q11_progress_${uid}`, data),
};

// ─── ONBOARDING PROFILE HELPERS ───────────────────────────────────────────────
const Profile = {
  get: ()   => LS.get('q11_profile', null),
  save: (p) => LS.set('q11_profile', p),
  clear: ()  => LS.del('q11_profile'),
};
// role: "student" | "parent" | "teacher" | "tutor"
// ageGroup: "toddler"|"early"|"junior"|"core"|"advanced" (resolved from answers)
// yearGroup: for teachers/tutors
// childAge: for parents
// studentAge: for students
const YEAR_GROUP_TO_AGE_GROUP = {
  "Reception":"toddler", "Year 1":"toddler", "Year 2":"early",
  "Year 3":"early","Year 4":"junior","Year 5":"core","Year 6":"core",
  "Year 7":"advanced","Year 8":"advanced","Year 9":"advanced",
};
function resolveAgeGroup(role, answers){
  if(role==="student"){
    const a=parseInt(answers.age||0);
    if(a<=3)  return "toddler";
    if(a<=6)  return "early";
    if(a<=8)  return "junior";
    if(a<=10) return "core";
    return "advanced";
  }
  if(role==="parent"){
    const a=parseInt(answers.childAge||0);
    if(a<=3)  return "toddler";
    if(a<=6)  return "early";
    if(a<=8)  return "junior";
    if(a<=10) return "core";
    return "advanced";
  }
  if(role==="teacher"||role==="tutor"){
    return YEAR_GROUP_TO_AGE_GROUP[answers.yearGroup]||"core";
  }
  return "core";
}


// ─── VISITOR COUNTER (fully local) ────────────────────────────────────────────
function trackVisitorCount() {
  const c = (LS.get("q11_visitors", 0) || 0) + 1;
  LS.set("q11_visitors", c);
  return c;
}

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

  // ── TODDLER QUESTIONS (friendly, visual emoji-based) ──────────────────────
  toddler:{
    "Toddler Shapes":[
      {q:"🔵 What shape is this?",vis:"🔵",options:["Circle","Square","Triangle","Star"],answer:"Circle",explanation:"A circle is round like a ball! ⚽"},
      {q:"🟥 What shape is this?",vis:"🟥",options:["Triangle","Rectangle","Circle","Star"],answer:"Rectangle",explanation:"A rectangle has 4 sides! 📦"},
      {q:"🔺 What shape is this?",vis:"🔺",options:["Circle","Square","Triangle","Heart"],answer:"Triangle",explanation:"A triangle has 3 sides! 🍕"},
      {q:"🟨 What shape is this?",vis:"🟨",options:["Circle","Square","Triangle","Diamond"],answer:"Square",explanation:"A square has 4 equal sides! 🎁"},
      {q:"Which shape has NO corners?",vis:"🔵 🟥 🔺",options:["Circle","Square","Triangle","Rectangle"],answer:"Circle",explanation:"Circles are smooth — no corners! 😊"},
    ],
    "Toddler Colours":[
      {q:"🍎 What colour is an apple?",vis:"🍎",options:["Blue","Red","Yellow","Green"],answer:"Red",explanation:"Apples are red! 🍎❤️"},
      {q:"🌞 What colour is the sun?",vis:"🌞",options:["Blue","Purple","Yellow","Green"],answer:"Yellow",explanation:"The sun is yellow and bright! ☀️"},
      {q:"🌊 What colour is the sea?",vis:"🌊",options:["Red","Yellow","Orange","Blue"],answer:"Blue",explanation:"The sea is blue! 🐬"},
      {q:"🍀 What colour is grass?",vis:"🍀",options:["Pink","Green","Brown","White"],answer:"Green",explanation:"Grass is green! 🌿"},
      {q:"🐘 What colour is an elephant?",vis:"🐘",options:["Purple","Blue","Grey","Yellow"],answer:"Grey",explanation:"Elephants are grey! 🐘"},
    ],
    "Toddler Counting":[
      {q:"🐶🐶 How many dogs?",vis:"🐶🐶",options:["1","2","3","4"],answer:"2",explanation:"Count: 🐶 one, 🐶 two! = 2 dogs"},
      {q:"⭐⭐⭐ How many stars?",vis:"⭐⭐⭐",options:["2","3","4","5"],answer:"3",explanation:"Count: 1, 2, 3 stars! ⭐⭐⭐"},
      {q:"🍎🍎🍎🍎 How many apples?",vis:"🍎🍎🍎🍎",options:["3","4","5","6"],answer:"4",explanation:"Count: 1, 2, 3, 4 apples! 🍎"},
      {q:"What comes after 4?",vis:"1 → 2 → 3 → 4 → ?",options:["3","5","6","7"],answer:"5",explanation:"After 4 comes 5! Count on your fingers 🖐"},
      {q:"🦆🦆🦆🦆🦆 How many ducks?",vis:"🦆🦆🦆🦆🦆",options:["4","5","6","7"],answer:"5",explanation:"5 ducks! Quack quack! 🦆"},
    ],
    "Toddler Animals":[
      {q:"🐶 What sound does a dog make?",vis:"🐶",options:["Moo","Woof","Meow","Quack"],answer:"Woof",explanation:"Dogs say WOOF! 🐾"},
      {q:"🐱 What sound does a cat make?",vis:"🐱",options:["Woof","Moo","Meow","Oink"],answer:"Meow",explanation:"Cats say MEOW! 🐾"},
      {q:"🐄 What sound does a cow make?",vis:"🐄",options:["Quack","Woof","Baa","Moo"],answer:"Moo",explanation:"Cows say MOO! 🥛"},
      {q:"🐑 What sound does a sheep make?",vis:"🐑",options:["Moo","Woof","Baa","Oink"],answer:"Baa",explanation:"Sheep say BAA! 🌿"},
      {q:"Which animal can fly? 🐦🐶🐄🐟",vis:"🐦 🐶 🐄 🐟",options:["Dog","Bird","Cow","Fish"],answer:"Bird",explanation:"Birds have wings and can fly! 🐦✈️"},
    ],
    "Toddler Patterns":[
      {q:"🔴🔵🔴🔵🔴? What comes next?",vis:"🔴🔵🔴🔵🔴 ❓",options:["🔴","🔵","🟡","🟢"],answer:"🔵",explanation:"Red Blue Red Blue... next is Blue! 🔵"},
      {q:"⭐🌙⭐🌙⭐? What comes next?",vis:"⭐🌙⭐🌙⭐ ❓",options:["⭐","🌙","☀️","🌟"],answer:"🌙",explanation:"Star Moon Star Moon... next is Moon! 🌙"},
      {q:"🐶🐱🐶🐱? What comes next?",vis:"🐶🐱🐶🐱 ❓",options:["🐶","🐱","🐄","🐸"],answer:"🐶",explanation:"Dog Cat Dog Cat... next is Dog! 🐶"},
      {q:"🔵🔵🔴🔵🔵? What comes next?",vis:"🔵🔵🔴🔵🔵 ❓",options:["🔵","🔴","🟡","🟢"],answer:"🔴",explanation:"Blue Blue Red... then Blue Blue Red again! 🔴"},
      {q:"1 2 3 1 2 3 1? What comes next?",vis:"1 2 3 1 2 3 1 ❓",options:["1","2","3","4"],answer:"2",explanation:"The pattern is 1 2 3 repeating — next is 2!"},
    ],
    "Toddler Size":[
      {q:"🐘🐭 Which is BIGGER?",vis:"🐘 vs 🐭",options:["Elephant","Mouse","Same","Neither"],answer:"Elephant",explanation:"The elephant is much bigger than the mouse! 🐘"},
      {q:"🌳🌱 Which is TALLER?",vis:"🌳 vs 🌱",options:["Tree","Seedling","Same","Neither"],answer:"Tree",explanation:"The big tree is taller! 🌳"},
      {q:"🍉🍇 Which is SMALLER?",vis:"🍉 vs 🍇",options:["Watermelon","Grapes","Same","Neither"],answer:"Grapes",explanation:"Grapes are tiny compared to a watermelon! 🍇"},
      {q:"5 apples or 2 apples — which is MORE?",vis:"🍎🍎🍎🍎🍎 vs 🍎🍎",options:["5 apples","2 apples","Same","Neither"],answer:"5 apples",explanation:"5 is more than 2! Count them! 🍎"},
      {q:"Which number is BIGGER: 7 or 3?",vis:"7 vs 3",options:["7","3","Same","Neither"],answer:"7",explanation:"7 is bigger than 3! ✨"},
    ],
    "Early BOSS":[
      {q:"🔵🟥🔺 Which is a TRIANGLE?",vis:"🔵 🟥 🔺",options:["Circle","Rectangle","Triangle","Square"],answer:"Triangle",explanation:"🔺 has 3 sides — that's a triangle!"},
      {q:"🌞 What colour is the sun?",vis:"🌞",options:["Blue","Red","Yellow","Green"],answer:"Yellow",explanation:"Yellow! ☀️"},
      {q:"🐶🐶🐶 How many dogs?",vis:"🐶🐶🐶",options:["2","3","4","5"],answer:"3",explanation:"Count: 1, 2, 3! 🐶"},
      {q:"🔴🔵🔴🔵? What comes next?",vis:"🔴🔵🔴🔵 ❓",options:["🔴","🔵","🟡","🟢"],answer:"🔴",explanation:"Red Blue Red Blue → Red! 🔴"},
      {q:"🐘🐭 Which is bigger?",vis:"🐘 vs 🐭",options:["Elephant","Mouse","Same","Neither"],answer:"Elephant",explanation:"Elephant is the biggest! 🐘"},
    ],
  },
  // ── EARLY YEARS QUESTIONS (age 4–7, visual, simple) ──────────────────────
  early:{
    "Early Counting":[
      {q:"Count the 🍎: 🍎🍎🍎🍎🍎🍎",vis:"🍎🍎🍎🍎🍎🍎",options:["5","6","7","8"],answer:"6",explanation:"Count carefully: 1,2,3,4,5,6! Six apples! 🍎"},
      {q:"What is 10 + 5?",vis:"🔟 ➕ 5️⃣",options:["13","14","15","16"],answer:"15",explanation:"10 + 5 = 15. Count on from 10! 🖐"},
      {q:"What comes after 19?",vis:"17 → 18 → 19 → ❓",options:["18","20","21","22"],answer:"20",explanation:"After 19 comes 20! 🎉"},
      {q:"How many tens are in 30?",vis:"10 + 10 + 10 = 30",options:["1","2","3","4"],answer:"3",explanation:"30 = 3 groups of 10! ✋✋✋"},
      {q:"Which number is between 5 and 7?",vis:"5 ❓ 7",options:["4","6","8","9"],answer:"6",explanation:"5, 6, 7 — six is in the middle!"},
    ],
    "Early Addition":[
      {q:"3 + 4 = ?",vis:"🍎🍎🍎 + 🍎🍎🍎🍎",options:["5","6","7","8"],answer:"7",explanation:"Count all the apples: 3 + 4 = 7! 🍎"},
      {q:"5 + 5 = ?",vis:"🖐 + 🖐",options:["8","9","10","11"],answer:"10",explanation:"Both hands have 5 fingers — 10 altogether! 🖐🖐"},
      {q:"6 + 3 = ?",vis:"🔵🔵🔵🔵🔵🔵 + 🔵🔵🔵",options:["7","8","9","10"],answer:"9",explanation:"Start at 6, count on 3: 7, 8, 9! 🔵"},
      {q:"8 + 2 = ?",vis:"8️⃣ ➕ 2️⃣",options:["8","9","10","11"],answer:"10",explanation:"8 + 2 makes a perfect 10! ✨"},
      {q:"4 + 4 = ?",vis:"🐣🐣🐣🐣 + 🐣🐣🐣🐣",options:["6","7","8","9"],answer:"8",explanation:"Double 4 = 8. Two groups of 4 chicks! 🐣"},
    ],
    "Early Subtraction":[
      {q:"7 - 3 = ?",vis:"🍎🍎🍎🍎🍎🍎🍎 ➖ 🍎🍎🍎",options:["3","4","5","6"],answer:"4",explanation:"Start at 7, count back 3: 6, 5, 4! 🍎"},
      {q:"10 - 4 = ?",vis:"🔟 ➖ 4️⃣",options:["4","5","6","7"],answer:"6",explanation:"10 take away 4 = 6! 🎈"},
      {q:"8 - 5 = ?",vis:"🌟🌟🌟🌟🌟🌟🌟🌟 ➖ 🌟🌟🌟🌟🌟",options:["2","3","4","5"],answer:"3",explanation:"8 take away 5 = 3 stars left! ⭐⭐⭐"},
      {q:"6 - 2 = ?",vis:"🐣🐣🐣🐣🐣🐣 ➖ 🐣🐣",options:["3","4","5","6"],answer:"4",explanation:"6 chicks, 2 fly away, 4 left! 🐣🐣🐣🐣"},
      {q:"5 - 0 = ?",vis:"5️⃣ ➖ 0️⃣",options:["0","4","5","6"],answer:"5",explanation:"Taking away nothing leaves the same! 😊"},
    ],
    "Early Phonics":[
      {q:"🐱 What sound does CAT start with?",vis:"🐱 = C-A-T",options:["S","B","C","D"],answer:"C",explanation:"Cat starts with the /k/ sound — letter C! 🐱"},
      {q:"🐝 What sound does BEE start with?",vis:"🐝 = B-E-E",options:["D","B","P","G"],answer:"B",explanation:"Bee starts with /b/ — letter B! 🐝"},
      {q:"🌞 SUN — what letter does it end with?",vis:"S-U-N 🌞",options:["S","U","N","M"],answer:"N",explanation:"S-U-N, the last sound is /n/! ☀️"},
      {q:"Which word rhymes with CAT? 🐱",vis:"🐱 CAT rhymes with ___",options:["Dog","Bat","Cup","Run"],answer:"Bat",explanation:"Cat, Bat — they both end in -AT! 🦇🐱"},
      {q:"🐸 FROG — how many sounds (phonemes)?",vis:"F-R-O-G 🐸",options:["2","3","4","5"],answer:"4",explanation:"F-R-O-G has 4 sounds! Say each one. 🐸"},
    ],
    "Early Words":[
      {q:"Which is a NAMING word (noun)? 🐶",vis:"🐶 run happy dog",options:["Run","Happy","Dog","Quick"],answer:"Dog",explanation:"A noun is a naming word. Dog is a thing! 🐶"},
      {q:"🏃 Which is a DOING word (verb)?",vis:"run big apple blue",options:["Big","Apple","Blue","Run"],answer:"Run",explanation:"A verb is a doing word. Run is an action! 🏃"},
      {q:"Which word describes how something looks (adjective)?",vis:"jump fluffy cat quickly",options:["Jump","Cat","Quickly","Fluffy"],answer:"Fluffy",explanation:"Fluffy describes what the cat is like! 🐱"},
      {q:"Opposite of BIG?",vis:"BIG ↔ ?",options:["Tall","Small","Long","Heavy"],answer:"Small",explanation:"Big and small are opposites! 🐘🐭"},
      {q:"Which word completes: The dog ___ in the park.",vis:"The dog ___ in the park 🐶",options:["Big","Ran","Apple","Blue"],answer:"Ran",explanation:"Ran is the doing word (verb) that fits! 🐶🏃"},
    ],
    "Early Spelling":[
      {q:"🐱 How do you spell CAT?",vis:"🐱 = _ A T",options:["BAT","CAT","HAT","FAT"],answer:"CAT",explanation:"C-A-T. The /k/ sound is the letter C! 🐱"},
      {q:"🐕 How do you spell DOG?",vis:"🐕 = D O _",options:["DOG","COG","LOG","HOG"],answer:"DOG",explanation:"D-O-G. The /g/ at the end! 🐕"},
      {q:"Choose the correct spelling:",vis:"🌞 the s_n",options:["SAN","SIN","SUN","SON"],answer:"SUN",explanation:"The sun in the sky is S-U-N! ☀️"},
      {q:"🐠 F_SH — missing letter?",vis:"🐠 F _ S H",options:["A","E","I","O"],answer:"I",explanation:"FISH — F-I-S-H! 🐠"},
      {q:"Which is spelt correctly?",vis:"🌳 a tall ___",options:["TREA","TREE","TRIE","TROE"],answer:"TREE",explanation:"T-R-E-E! Trees are tall! 🌳"},
    ],
    "Early Shapes":[
      {q:"How many sides does a triangle have?",vis:"🔺",options:["2","3","4","5"],answer:"3",explanation:"🔺 A triangle always has 3 sides! Count them!"},
      {q:"How many corners does a square have?",vis:"🟥",options:["2","3","4","5"],answer:"4",explanation:"A square has 4 corners and 4 equal sides! 🟥"},
      {q:"🔵 What shape has NO sides?",vis:"🔵 🔺 🟥 🔷",options:["Triangle","Square","Circle","Rectangle"],answer:"Circle",explanation:"Circles are curved with no sides or corners! 🔵"},
      {q:"A shape with 6 sides is called a?",vis:"⬡",options:["Pentagon","Hexagon","Octagon","Heptagon"],answer:"Hexagon",explanation:"Hex = 6! A hexagon has 6 sides. Like a honeycomb! 🍯"},
      {q:"How many sides does a rectangle have?",vis:"▬",options:["3","4","5","6"],answer:"4",explanation:"A rectangle has 4 sides — 2 long and 2 short! ▬"},
    ],
    "Early Measurement":[
      {q:"🌡️ Which unit measures temperature?",vis:"🌡️ Cold ❄️ → Hot 🔥",options:["Metres","Kilograms","Degrees","Litres"],answer:"Degrees",explanation:"We measure temperature in degrees! 🌡️"},
      {q:"Which is HEAVIER? 🐘 or 🐦",vis:"🐘 vs 🐦",options:["Elephant","Bird","Same","Neither"],answer:"Elephant",explanation:"Elephants weigh thousands of kilograms! 🐘"},
      {q:"We measure length in?",vis:"📏 How long is it?",options:["Litres","Degrees","Metres","Seconds"],answer:"Metres",explanation:"Length is measured in metres (or cm)! 📏"},
      {q:"1 minute = how many seconds?",vis:"⏱️ 1 minute = __ seconds",options:["10","30","60","100"],answer:"60",explanation:"1 minute = 60 seconds! Tick tock! ⏰"},
      {q:"Which holds MORE liquid? 🪣 or 🥄",vis:"🪣 bucket vs 🥄 spoon",options:["Bucket","Spoon","Same","Neither"],answer:"Bucket",explanation:"A bucket holds much more than a spoon! 🪣"},
    ],
    "Early BOSS":[
      {q:"5 + 6 = ?",vis:"5️⃣ ➕ 6️⃣",options:["9","10","11","12"],answer:"11",explanation:"Count on from 5: 6,7,8,9,10,11!"},
      {q:"🐱 CAT starts with?",vis:"🐱 C-A-T",options:["A","B","C","D"],answer:"C",explanation:"Cat starts with C!"},
      {q:"How many sides on a triangle?",vis:"🔺",options:["2","3","4","5"],answer:"3",explanation:"3 sides on a triangle!"},
      {q:"9 - 4 = ?",vis:"9️⃣ ➖ 4️⃣",options:["3","4","5","6"],answer:"5",explanation:"9 take away 4 = 5!"},
      {q:"Which word rhymes with DOG?",vis:"DOG 🐶 rhymes with ___",options:["Cat","Log","Run","Big"],answer:"Log",explanation:"Dog, Log — both end in -OG! 🪵🐶"},
      {q:"How many corners does a square have?",vis:"🟥",options:["2","3","4","5"],answer:"4",explanation:"4 corners! 🟥"},
    ],
  },
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
,
  j_numbers:{
    "Addition":[
      {q:"23 + 45 = ?",options:["58","67","68","78"],answer:"68",explanation:"20+40=60, 3+5=8. Total=68."},
      {q:"56 + 37 = ?",options:["83","93","84","73"],answer:"93",explanation:"50+30=80, 6+7=13. 80+13=93."},
      {q:"100 - 37 = ?",options:["53","63","73","67"],answer:"63",explanation:"100-37: 100-40=60, +3=63."},
      {q:"48 + 52 = ?",options:["90","100","110","95"],answer:"100",explanation:"48+52=100. Number bond!"},
      {q:"67 + 28 = ?",options:["85","95","94","96"],answer:"95",explanation:"67+30=97, -2=95."},
      {q:"144 + 36 = ?",options:["170","180","174","190"],answer:"180",explanation:"144+36: 4+6=10, 140+40=180."},
    ],
    "Subtraction":[
      {q:"75 - 28 = ?",options:["43","47","53","57"],answer:"47",explanation:"75-30=45, +2=47."},
      {q:"100 - 64 = ?",options:["26","34","36","46"],answer:"36",explanation:"100-64=36. Add on: 64+6=70, 70+30=100. Total=36."},
      {q:"83 - 47 = ?",options:["26","34","36","46"],answer:"36",explanation:"83-47: 83-50=33, +3=36."},
      {q:"200 - 156 = ?",options:["34","44","54","64"],answer:"44",explanation:"156+44=200. Count on!"},
      {q:"91 - 38 = ?",options:["43","53","47","63"],answer:"53",explanation:"91-40=51, +2=53."},
      {q:"130 - 75 = ?",options:["45","55","65","75"],answer:"55",explanation:"130-75: 130-80=50, +5=55."},
    ],
    "Multiplication":[
      {q:"3 × 4 = ?",options:["10","12","14","16"],answer:"12",explanation:"3+3+3+3=12."},
      {q:"5 × 6 = ?",options:["25","30","35","36"],answer:"30",explanation:"Count in 5s: 5,10,15,20,25,30."},
      {q:"4 × 7 = ?",options:["24","28","32","36"],answer:"28",explanation:"4×7=28. Double 4×7: 2×7=14, ×2=28."},
      {q:"6 × 6 = ?",options:["30","32","36","42"],answer:"36",explanation:"6²=36."},
      {q:"8 × 3 = ?",options:["21","22","24","26"],answer:"24",explanation:"8+8+8=24."},
      {q:"9 × 4 = ?",options:["32","36","38","40"],answer:"36",explanation:"10×4=40, -4=36."},
    ],
    "Division":[
      {q:"24 ÷ 6 = ?",options:["3","4","5","6"],answer:"4",explanation:"6×4=24."},
      {q:"35 ÷ 5 = ?",options:["5","6","7","8"],answer:"7",explanation:"5×7=35."},
      {q:"48 ÷ 8 = ?",options:["4","5","6","7"],answer:"6",explanation:"8×6=48."},
      {q:"36 ÷ 4 = ?",options:["7","8","9","10"],answer:"9",explanation:"4×9=36."},
      {q:"63 ÷ 9 = ?",options:["6","7","8","9"],answer:"7",explanation:"9×7=63."},
      {q:"56 ÷ 7 = ?",options:["6","7","8","9"],answer:"8",explanation:"7×8=56."},
    ],
    "BOSS":[
      {q:"45 + 37 = ?",options:["72","82","83","92"],answer:"82",explanation:"45+37=82."},
      {q:"100 - 47 = ?",options:["43","53","63","73"],answer:"53",explanation:"100-47=53."},
      {q:"6 × 7 = ?",options:["36","42","48","54"],answer:"42",explanation:"6×7=42."},
      {q:"48 ÷ 6 = ?",options:["6","7","8","9"],answer:"8",explanation:"6×8=48."},
      {q:"25 + 76 = ?",options:["91","101","100","111"],answer:"101",explanation:"25+76=101."},
      {q:"90 - 34 = ?",options:["46","56","66","54"],answer:"56",explanation:"90-34=56."},
      {q:"9 × 7 = ?",options:["54","56","63","72"],answer:"63",explanation:"9×7=63."},
      {q:"72 ÷ 8 = ?",options:["7","8","9","10"],answer:"9",explanation:"8×9=72."},
    ],
  },
  j_shapes:{
    "2D Shapes":[
      {q:"How many sides does a hexagon have?",options:["5","6","7","8"],answer:"6",explanation:"Hexa = 6. Hexagon has 6 sides."},
      {q:"What shape has 4 equal sides and 4 right angles?",options:["Rectangle","Rhombus","Square","Kite"],answer:"Square",explanation:"A square has 4 equal sides and all angles are 90°."},
      {q:"A triangle with all sides equal is called?",options:["Scalene","Isosceles","Equilateral","Right-angled"],answer:"Equilateral",explanation:"Equilateral = all three sides equal, all angles 60°."},
      {q:"How many sides does a pentagon have?",options:["4","5","6","7"],answer:"5",explanation:"Penta = 5. Pentagon has 5 sides."},
      {q:"Angles in a triangle sum to?",options:["90°","180°","270°","360°"],answer:"180°",explanation:"Always 180° in any triangle."},
      {q:"What is the name of a 4-sided shape?",options:["Triangle","Quadrilateral","Pentagon","Hexagon"],answer:"Quadrilateral",explanation:"Quad = 4. Any 4-sided shape is a quadrilateral."},
    ],
    "Symmetry & Reflection":[
      {q:"How many lines of symmetry does a square have?",options:["1","2","3","4"],answer:"4",explanation:"Square has 4: 2 through corners, 2 through midpoints."},
      {q:"How many lines of symmetry does a rectangle have?",options:["1","2","3","4"],answer:"2",explanation:"Rectangle: one horizontal, one vertical line."},
      {q:"An equilateral triangle has how many lines of symmetry?",options:["1","2","3","4"],answer:"3",explanation:"One from each vertex to midpoint of opposite side."},
      {q:"Which shape has NO lines of symmetry?",options:["Square","Circle","Scalene triangle","Equilateral triangle"],answer:"Scalene triangle",explanation:"Scalene triangle has no equal sides, so no lines of symmetry."},
      {q:"A regular hexagon has how many lines of symmetry?",options:["3","4","6","8"],answer:"6",explanation:"Regular hexagon: 3 through vertices, 3 through edge midpoints."},
      {q:"What does a line of symmetry do to a shape?",options:["Rotates it","Enlarges it","Divides it into two identical halves","Translates it"],answer:"Divides it into two identical halves",explanation:"A line of symmetry (mirror line) splits a shape into two equal mirror images."},
    ],
    "Measurement":[
      {q:"How many cm in 1 metre?",options:["10","100","1000","50"],answer:"100",explanation:"1 metre = 100 centimetres."},
      {q:"How many mm in 1 cm?",options:["5","10","100","1000"],answer:"10",explanation:"1 cm = 10 mm."},
      {q:"How many minutes in an hour?",options:["30","50","60","100"],answer:"60",explanation:"1 hour = 60 minutes."},
      {q:"How many seconds in a minute?",options:["30","60","100","120"],answer:"60",explanation:"1 minute = 60 seconds."},
      {q:"1 km = ? metres",options:["10","100","500","1000"],answer:"1000",explanation:"1 kilometre = 1000 metres."},
      {q:"A rectangle is 5cm wide and 3cm tall. Perimeter?",options:["8cm","15cm","16cm","30cm"],answer:"16cm",explanation:"Perimeter = 2×(5+3) = 2×8 = 16cm."},
    ],
    "BOSS":[
      {q:"How many sides does a hexagon have?",options:["5","6","7","8"],answer:"6",explanation:"Hexa = 6."},
      {q:"Angles in a triangle = ?",options:["90°","180°","270°","360°"],answer:"180°",explanation:"All triangles = 180°."},
      {q:"Lines of symmetry in a square?",options:["2","3","4","6"],answer:"4",explanation:"4 lines of symmetry."},
      {q:"1 metre = ? cm",options:["10","100","1000","10000"],answer:"100",explanation:"100 cm in 1 metre."},
      {q:"Perimeter of 4×4 square?",options:["8","12","16","20"],answer:"16",explanation:"4×4=16."},
      {q:"Which has NO lines of symmetry?",options:["Square","Equilateral triangle","Scalene triangle","Circle"],answer:"Scalene triangle",explanation:"No equal sides = no symmetry."},
      {q:"Pentagon has how many sides?",options:["4","5","6","7"],answer:"5",explanation:"Penta=5."},
      {q:"1 km = ? metres",options:["100","500","1000","10000"],answer:"1000",explanation:"1 km = 1000 m."},
    ],
  },
  j_english:{
    "Spelling":[
      {q:"Which is spelled correctly?",options:["Freind","Frend","Friend","Fiend"],answer:"Friend",explanation:"Friend — remember: 'fri END'."},
      {q:"Which is spelled correctly?",options:["Beleive","Believe","Belive","Believ"],answer:"Believe",explanation:"Believe — 'I before E except after C'."},
      {q:"Opposite of 'ancient' is?",options:["Old","Modern","Ancient","Past"],answer:"Modern",explanation:"Ancient = very old. Opposite = modern."},
      {q:"Which word means 'very happy'?",options:["Sad","Gloomy","Elated","Weary"],answer:"Elated",explanation:"Elated = extremely happy."},
      {q:"Which is spelled correctly?",options:["Recieve","Recive","Receive","Receve"],answer:"Receive",explanation:"Receive — E before I after C."},
      {q:"'Necessary' has how many Cs?",options:["0","1","2","3"],answer:"1",explanation:"Necessary = 1 C, 2 Ss. Remember: 1 Collar, 2 Socks!"},
    ],
    "Grammar":[
      {q:"'The dog runs fast.' 'Dog' is a?",options:["Verb","Adjective","Noun","Adverb"],answer:"Noun",explanation:"Dog is a naming word — a noun."},
      {q:"'She ran quickly.' 'Quickly' is a?",options:["Noun","Verb","Adjective","Adverb"],answer:"Adverb",explanation:"Quickly describes HOW she ran — it's an adverb."},
      {q:"Which sentence is correct?",options:["Me and Jake went","Jake and I went","Jake and me went","I and Jake went"],answer:"Jake and I went",explanation:"Use subject pronoun 'I' (not me) when YOU are doing the action."},
      {q:"'Beautiful' is a?",options:["Noun","Verb","Adjective","Adverb"],answer:"Adjective",explanation:"Beautiful describes a noun — it's an adjective."},
      {q:"What does a verb do?",options:["Names a person","Describes a noun","Shows an action or state","Joins words"],answer:"Shows an action or state",explanation:"Verbs are doing/being words: run, jump, is, think."},
      {q:"Which word is a conjunction?",options:["Apple","Quickly","Because","Running"],answer:"Because",explanation:"Conjunctions join clauses: because, and, but, although."},
    ],
    "Literary Devices":[
      {q:"'The stars danced in the sky.' This is?",options:["Simile","Metaphor","Personification","Alliteration"],answer:"Personification",explanation:"Stars can't dance — giving human qualities to non-human things = personification."},
      {q:"'As brave as a lion.' This is?",options:["Metaphor","Simile","Personification","Hyperbole"],answer:"Simile",explanation:"Similes compare using 'as' or 'like'."},
      {q:"'She is a shining star.' This is?",options:["Simile","Metaphor","Onomatopoeia","Alliteration"],answer:"Metaphor",explanation:"Saying she IS a star (not like one) = metaphor."},
      {q:"'The bee buzzed by.' This is?",options:["Simile","Metaphor","Alliteration","Onomatopoeia"],answer:"Onomatopoeia",explanation:"'Buzzed' sounds like the thing it describes = onomatopoeia."},
      {q:"'Peter Piper picked a peck.' This is?",options:["Simile","Metaphor","Alliteration","Personification"],answer:"Alliteration",explanation:"Repeated P sound at the start of words = alliteration."},
      {q:"'I've told you a million times!' This is?",options:["Simile","Metaphor","Personification","Hyperbole"],answer:"Hyperbole",explanation:"Deliberate exaggeration = hyperbole."},
    ],
    "BOSS":[
      {q:"'Dog' in 'The dog runs fast' is a?",options:["Verb","Noun","Adjective","Adverb"],answer:"Noun",explanation:"Naming word = noun."},
      {q:"'Quickly' in 'She ran quickly' is a?",options:["Noun","Verb","Adjective","Adverb"],answer:"Adverb",explanation:"Describes the verb = adverb."},
      {q:"'As brave as a lion' is a?",options:["Metaphor","Simile","Personification","Hyperbole"],answer:"Simile",explanation:"Comparing with 'as' = simile."},
      {q:"Which is correct?",options:["Me and Tom went","Tom and I went","Tom and me went","I and Tom went"],answer:"Tom and I went",explanation:"Subject pronoun = I."},
      {q:"Onomatopoeia example?",options:["A shining star","Buzz","Peter Piper","Run fast"],answer:"Buzz",explanation:"Buzz sounds like what it means."},
      {q:"Which is spelled correctly?",options:["Recieve","Believe","Freind","Necesary"],answer:"Believe",explanation:"Believe = correct spelling."},
      {q:"'Beautiful' is a?",options:["Noun","Verb","Adjective","Adverb"],answer:"Adjective",explanation:"Describes = adjective."},
      {q:"Repeated start sounds in a sentence is?",options:["Simile","Alliteration","Metaphor","Hyperbole"],answer:"Alliteration",explanation:"Same start sounds = alliteration."},
    ],
  }
};

// ─── WORLDS — age-categorised, all subjects ──────────────────────────────────
// Each world: { id, name, icon, colour, gradient, desc, ageGroup, free?, missions[] }
// ageGroup: "junior" (7–9) | "core" (9–11) | "advanced" (11–13)
// free: true → all missions playable without account; false → need account (still no paywall)

const AGE_GROUPS = [
  {id:"toddler", label:"Ages 2–3",   icon:"🐣", desc:"Shapes, colours & counting — totally free!", free:true, friendlyMode:true},
  {id:"early",   label:"Ages 3–6",   icon:"🌈", desc:"Numbers, phonics & first words",             friendlyMode:true},
  {id:"junior",  label:"Ages 6–8",   icon:"🌱", desc:"Foundation skills — build confidence"},
  {id:"core",    label:"Ages 8–10",  icon:"⭐", desc:"11+ core content — exam ready"},
  {id:"advanced",label:"Ages 10–12", icon:"🚀", desc:"Beyond 11+ — challenge yourself"},
  {id:"shadow",  label:"Shadow Realm",icon:"💀", desc:"Unlocked after completing all worlds — ×2 XP", isShadow:true},
];

const WORLDS=[
  // ───────────────── TODDLER (3–4) — ALL FREE ─────────────────
  {id:"t_shapes",   ageGroup:"toddler", free:true,
   name:"Shape Garden",      icon:"🌸",colour:"#F472B6",gradient:"linear-gradient(135deg,#F472B6,#EC4899)",
   desc:"Learn about circles, squares and triangles!",
   missions:[
    {id:"tg_shapes",name:"Shape Fun",      icon:"🔵",topic:"Toddler Shapes",   xp:20,coins:5,questions:5,friendly:true},
    {id:"tg_col",   name:"Colour World",   icon:"🎨",topic:"Toddler Colours",  xp:20,coins:5,questions:5,friendly:true},
    {id:"tg_count", name:"Count with Me",  icon:"🔢",topic:"Toddler Counting", xp:25,coins:6,questions:5,friendly:true},
   ]},
  {id:"t_animals",  ageGroup:"toddler", free:true,
   name:"Animal Farm",       icon:"🐄",colour:"#34D399",gradient:"linear-gradient(135deg,#34D399,#10B981)",
   desc:"Learn animals, sounds and patterns!",
   missions:[
    {id:"ta_anim",  name:"Animal Friends", icon:"🐶",topic:"Toddler Animals",  xp:20,coins:5,questions:5,friendly:true},
    {id:"ta_pat",   name:"Pattern Play",   icon:"🔄",topic:"Toddler Patterns", xp:25,coins:6,questions:5,friendly:true},
    {id:"ta_size",  name:"Big & Small",    icon:"📏",topic:"Toddler Size",     xp:20,coins:5,questions:5,friendly:true},
   ]},

  // ───────────────── EARLY (4–7) ─────────────────
  {id:"e_numbers",  ageGroup:"early",
   name:"Number Jungle",     icon:"🌴",colour:"#FBBF24",gradient:"linear-gradient(135deg,#FBBF24,#F59E0B)",
   desc:"Counting, adding and simple sums!",
   missions:[
    {id:"en_count", name:"Count to 20",    icon:"🔢",topic:"Early Counting",   xp:30,coins:7,questions:5,friendly:true},
    {id:"en_add",   name:"Adding Fun",     icon:"➕",topic:"Early Addition",   xp:35,coins:8,questions:5,friendly:true},
    {id:"en_sub",   name:"Take Away!",     icon:"➖",topic:"Early Subtraction",xp:35,coins:8,questions:5,friendly:true},
    {id:"en_boss",  name:"⭐ Jungle Star",  icon:"🦁",topic:"Early BOSS",       xp:100,coins:25,questions:6,isBoss:true,friendly:true},
   ]},
  {id:"e_letters",  ageGroup:"early",
   name:"Letter Land",       icon:"🔤",colour:"#818CF8",gradient:"linear-gradient(135deg,#818CF8,#6366F1)",
   desc:"Phonics, letters and first words!",
   missions:[
    {id:"el_phon",  name:"Phonics Play",   icon:"🎵",topic:"Early Phonics",   xp:30,coins:7,questions:5,friendly:true},
    {id:"el_words", name:"First Words",    icon:"📖",topic:"Early Words",     xp:35,coins:8,questions:5,friendly:true},
    {id:"el_spell", name:"Spell It!",      icon:"✍️",topic:"Early Spelling",  xp:35,coins:8,questions:5,friendly:true},
    {id:"el_boss",  name:"⭐ Letter Star",  icon:"🦋",topic:"Early BOSS",      xp:100,coins:25,questions:6,isBoss:true,friendly:true},
   ]},
  {id:"e_shapes2",  ageGroup:"early",
   name:"Shape Castle",      icon:"🏰",colour:"#F87171",gradient:"linear-gradient(135deg,#F87171,#EF4444)",
   desc:"2D shapes, patterns and measurements!",
   missions:[
    {id:"es_shape", name:"Shape Spotters",  icon:"🔷",topic:"Early Shapes",   xp:30,coins:7,questions:5,friendly:true},
    {id:"es_meas",  name:"Long or Short?",  icon:"📏",topic:"Early Measurement",xp:35,coins:8,questions:5,friendly:true},
    {id:"es_boss",  name:"⭐ Castle Star",   icon:"👑",topic:"Early BOSS",     xp:100,coins:25,questions:6,isBoss:true,friendly:true},
   ]},

  // ───────────────── JUNIOR (7–9) ─────────────────
  {id:"j_numbers",  ageGroup:"junior",
   name:"Number Island",      icon:"🏝️",colour:"#0EA5E9",gradient:"linear-gradient(135deg,#0EA5E9,#0284C7)",
   desc:"Counting, addition, subtraction & place value",
   missions:[
    {id:"jn_add",  name:"Addition Cove",    icon:"➕",topic:"Addition",         xp:40,coins:8, questions:6},
    {id:"jn_sub",  name:"Subtract Stream",  icon:"➖",topic:"Subtraction",      xp:40,coins:8, questions:6},
    {id:"jn_mult", name:"Multiply Marsh",   icon:"✖️",topic:"Multiplication",   xp:50,coins:10,questions:6},
    {id:"jn_div",  name:"Division Dell",    icon:"➗",topic:"Division",         xp:50,coins:10,questions:6},
    {id:"jn_boss", name:"⚔️ Island Boss",   icon:"🦁",topic:"BOSS",             xp:150,coins:40,questions:8,isBoss:true},
   ]},
  {id:"j_shapes",   ageGroup:"junior",
   name:"Shape Kingdom",      icon:"🔷",colour:"#8B5CF6",gradient:"linear-gradient(135deg,#8B5CF6,#6D28D9)",
   desc:"2D shapes, symmetry and measurement",
   missions:[
    {id:"js_2d",   name:"Shape Safari",     icon:"🔺",topic:"2D Shapes",        xp:40,coins:8, questions:6},
    {id:"js_sym",  name:"Mirror Meadow",    icon:"🔄",topic:"Symmetry & Reflection",xp:50,coins:10,questions:6},
    {id:"js_meas", name:"Measure Mountains",icon:"📏",topic:"Measurement",      xp:50,coins:10,questions:6},
    {id:"js_boss", name:"⚔️ Kingdom Boss",  icon:"🐲",topic:"BOSS",             xp:150,coins:40,questions:8,isBoss:true},
   ]},
  {id:"j_english",  ageGroup:"junior",
   name:"Story Forest",       icon:"📖",colour:"#10B981",gradient:"linear-gradient(135deg,#10B981,#047857)",
   desc:"Spelling, basic grammar and reading",
   missions:[
    {id:"je_spell", name:"Spell Springs",   icon:"✍️",topic:"Spelling",         xp:40,coins:8, questions:6},
    {id:"je_gram",  name:"Grammar Glade",   icon:"📝",topic:"Grammar",          xp:50,coins:10,questions:6,trick:"t_gram"},
    {id:"je_read",  name:"Reading Ravine",  icon:"👁️",topic:"Literary Devices", xp:50,coins:10,questions:6},
    {id:"je_boss",  name:"⚔️ Forest Boss",  icon:"🐉",topic:"BOSS",             xp:150,coins:40,questions:8,isBoss:true},
   ]},

  // ───────────────── CORE 11+ (9–11) ──────────────
  {id:"maths",      ageGroup:"core",
   name:"Math Mountain",      icon:"⛰️",colour:"#4F46E5",gradient:"linear-gradient(135deg,#4F46E5,#7C3AED)",
   desc:"Fractions, percentages, algebra & more",
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
  {id:"english",    ageGroup:"core",
   name:"English Forest",     icon:"🌲",colour:"#059669",gradient:"linear-gradient(135deg,#059669,#047857)",
   desc:"Grammar, punctuation, vocabulary & comprehension",
   missions:[
    {id:"e_gram",  name:"Grammar Grove",    icon:"📝",topic:"Grammar",            xp:60, coins:12,questions:6, trick:"t_gram"},
    {id:"e_punct", name:"Punctuation Path", icon:"✏️",topic:"Punctuation",        xp:60, coins:12,questions:6, trick:"t_apos"},
    {id:"e_vocab", name:"Vocab Valley",     icon:"📚",topic:"Vocabulary",         xp:80, coins:15,questions:6, trick:"t_roots"},
    {id:"e_lit",   name:"Literary Lake",    icon:"🖊️",topic:"Literary Devices",   xp:80, coins:15,questions:6},
    {id:"e_boss",  name:"⚔️ Forest Boss",   icon:"🐉",topic:"BOSS",               xp:250,coins:60,questions:8, isBoss:true},
   ]},
  {id:"verbal",     ageGroup:"core",
   name:"Word Wizard Tower",  icon:"🗼",colour:"#D97706",gradient:"linear-gradient(135deg,#D97706,#B45309)",
   desc:"Synonyms, analogies, codes & sequences",
   missions:[
    {id:"v_syn",   name:"Synonym Spire",    icon:"🔄",topic:"Synonyms & Antonyms",xp:60, coins:12,questions:6, trick:"t_syns"},
    {id:"v_ana",   name:"Analogy Arena",    icon:"🔗",topic:"Analogies",          xp:80, coins:15,questions:6, trick:"t_ana"},
    {id:"v_codes", name:"Code Cavern",      icon:"🔐",topic:"Codes & Ciphers",    xp:80, coins:15,questions:5, trick:"t_codes"},
    {id:"v_seq",   name:"Sequence Stairs",  icon:"🔢",topic:"Sequences",          xp:100,coins:18,questions:6, trick:"t_seq"},
    {id:"v_boss",  name:"⚔️ Wizard Boss",   icon:"🧙",topic:"BOSS",               xp:250,coins:60,questions:8, isBoss:true},
   ]},
  {id:"nvr",        ageGroup:"core",
   name:"Logic Lab",          icon:"🔬",colour:"#DC2626",gradient:"linear-gradient(135deg,#DC2626,#991B1B)",
   desc:"Patterns, matrices, 3D shapes & reflection",
   missions:[
    {id:"n_2d",    name:"Shape Station",    icon:"🔷",topic:"2D Shapes",           xp:60, coins:12,questions:6},
    {id:"n_sym",   name:"Symmetry Sanctum", icon:"🔄",topic:"Symmetry & Reflection",xp:80,coins:15,questions:6, trick:"t_sym"},
    {id:"n_pat",   name:"Pattern Plains",   icon:"🔲",topic:"Patterns & Matrices", xp:80, coins:15,questions:6, trick:"t_pats"},
    {id:"n_3d",    name:"3D Dimension",     icon:"🧊",topic:"3D Shapes",           xp:100,coins:18,questions:6, trick:"t_euler"},
    {id:"n_boss",  name:"⚔️ Lab Boss",      icon:"🤖",topic:"BOSS",               xp:250,coins:60,questions:8, isBoss:true},
   ]},

  // ───────────────── ADVANCED (11–13) ─────────────
  {id:"adv_maths",  ageGroup:"advanced",
   name:"Advanced Algebra Citadel",icon:"🏰",colour:"#1D4ED8",gradient:"linear-gradient(135deg,#1D4ED8,#1E40AF)",
   desc:"Simultaneous equations, quadratics & harder algebra",
   missions:[
    {id:"am_sim",  name:"Simultaneous Stronghold",icon:"🔀",topic:"Algebra",      xp:120,coins:22,questions:6},
    {id:"am_quad", name:"Quadratic Quest",        icon:"📈",topic:"Algebra",      xp:140,coins:26,questions:6},
    {id:"am_seq",  name:"Advanced Sequences",     icon:"🔢",topic:"Algebra",      xp:140,coins:26,questions:6},
    {id:"am_boss", name:"⚔️ Citadel Boss",        icon:"🦅",topic:"BOSS",         xp:350,coins:80,questions:10,isBoss:true},
   ]},
  {id:"adv_stats",  ageGroup:"advanced",
   name:"Data Observatory",   icon:"🔭",colour:"#0F766E",gradient:"linear-gradient(135deg,#0F766E,#134E4A)",
   desc:"Advanced statistics, probability & data analysis",
   missions:[
    {id:"as_prob", name:"Probability Plains",     icon:"🎲",topic:"Statistics",   xp:120,coins:22,questions:6},
    {id:"as_data", name:"Data Dunes",             icon:"📊",topic:"Statistics",   xp:140,coins:26,questions:6},
    {id:"as_boss", name:"⚔️ Observatory Boss",    icon:"🌌",topic:"BOSS",         xp:350,coins:80,questions:8, isBoss:true},
   ]},
  {id:"adv_geo",    ageGroup:"advanced",
   name:"Geometry Fortress",  icon:"🏯",colour:"#92400E",gradient:"linear-gradient(135deg,#92400E,#78350F)",
   desc:"Pythagoras, circles, transformations & vectors",
   missions:[
    {id:"ag_pyth", name:"Pythagoras Peak",        icon:"📐",topic:"Geometry",     xp:120,coins:22,questions:6},
    {id:"ag_circ", name:"Circle City",            icon:"⭕",topic:"Geometry",     xp:140,coins:26,questions:6},
    {id:"ag_trans",name:"Transformation Tower",   icon:"🔄",topic:"Geometry",     xp:140,coins:26,questions:6},
    {id:"ag_boss", name:"⚔️ Fortress Boss",       icon:"🛡️",topic:"BOSS",         xp:350,coins:80,questions:10,isBoss:true},
   ]},
  {id:"adv_verbal", ageGroup:"advanced",
   name:"Reasoning Realm",    icon:"🧠",colour:"#7C3AED",gradient:"linear-gradient(135deg,#7C3AED,#6D28D9)",
   desc:"Advanced verbal reasoning, logic & critical thinking",
   missions:[
    {id:"av_log",  name:"Logic Labyrinth",        icon:"🔍",topic:"Analogies",   xp:120,coins:22,questions:6},
    {id:"av_crit", name:"Critical Catacombs",     icon:"💭",topic:"Synonyms & Antonyms",xp:140,coins:26,questions:6},
    {id:"av_code", name:"Cipher Sanctum",         icon:"🔐",topic:"Codes & Ciphers",xp:140,coins:26,questions:6},
    {id:"av_boss", name:"⚔️ Realm Boss",          icon:"🧿",topic:"BOSS",         xp:350,coins:80,questions:8, isBoss:true},
   ]},
];
// WORLDS + SHADOW_WORLDS merged at runtime — see getAllWorlds()
// ─── MASTERY SYSTEM ───────────────────────────────────────────────────────────
// Each mission can be completed at Bronze→Silver→Gold→Platinum
// Bronze: ≥70% | Silver: ≥80% + first time | Gold: 100% | Platinum: 100% + second run
const MASTERY_LEVELS = [
  {id:"none",    label:"",         icon:"",   colour:"transparent", minPct:0,  xpMult:1},
  {id:"bronze",  label:"Bronze",   icon:"🥉", colour:"#CD7F32",     minPct:70, xpMult:1},
  {id:"silver",  label:"Silver",   icon:"🥈", colour:"#9CA3AF",     minPct:80, xpMult:1.25},
  {id:"gold",    label:"Gold",     icon:"🥇", colour:"#F59E0B",     minPct:100,xpMult:1.5},
  {id:"platinum",label:"Platinum", icon:"💎", colour:"#60A5FA",     minPct:100,xpMult:2},
];
function getMasteryLevel(missionId, masteryData){
  const m = (masteryData||{})[missionId];
  if(!m) return MASTERY_LEVELS[0];
  if(m.platinum) return MASTERY_LEVELS[4];
  if(m.gold)     return MASTERY_LEVELS[3];
  if(m.silver)   return MASTERY_LEVELS[2];
  if(m.bronze)   return MASTERY_LEVELS[1];
  return MASTERY_LEVELS[0];
}
function nextMasteryLevel(missionId, masteryData){
  const cur = getMasteryLevel(missionId, masteryData);
  const idx = MASTERY_LEVELS.indexOf(cur);
  return idx < MASTERY_LEVELS.length-1 ? MASTERY_LEVELS[idx+1] : null;
}

// ─── SHADOW WORLDS (unlocked after completing ALL 10 worlds) ─────────────────
const SHADOW_WORLDS=[
  {id:"shadow_maths",    ageGroup:"shadow", isShadow:true,
   name:"Shadow Maths",       icon:"💀",colour:"#4C1D95",gradient:"linear-gradient(135deg,#1e003d,#4C1D95)",
   desc:"Harder versions of every maths concept. ×2 XP reward.",
   missions:[
    {id:"sh_m1",name:"Dark Fractions",    icon:"💀",topic:"Fractions",           xp:200,coins:50,questions:8},
    {id:"sh_m2",name:"Shadow Algebra",    icon:"💀",topic:"Algebra",             xp:200,coins:50,questions:8},
    {id:"sh_m3",name:"Cursed Percentages",icon:"💀",topic:"Percentages",        xp:220,coins:55,questions:8},
    {id:"sh_m4",name:"Phantom Geometry",  icon:"💀",topic:"Geometry",           xp:220,coins:55,questions:8},
    {id:"sh_mb",name:"⚔️ Shadow Titan",   icon:"💀",topic:"BOSS",               xp:600,coins:150,questions:12,isBoss:true},
   ]},
  {id:"shadow_english",  ageGroup:"shadow", isShadow:true,
   name:"Shadow English",     icon:"🌑",colour:"#1F2937",gradient:"linear-gradient(135deg,#0a0a0a,#1F2937)",
   desc:"Advanced comprehension and grammar. ×2 XP reward.",
   missions:[
    {id:"sh_e1",name:"Dark Grammar",      icon:"🌑",topic:"Grammar",             xp:200,coins:50,questions:8},
    {id:"sh_e2",name:"Shadow Vocab",      icon:"🌑",topic:"Vocabulary",          xp:200,coins:50,questions:8},
    {id:"sh_e3",name:"Cursed Punctuation",icon:"🌑",topic:"Punctuation",         xp:220,coins:55,questions:8},
    {id:"sh_eb",name:"⚔️ Darkness Boss",  icon:"🌑",topic:"BOSS",               xp:600,coins:150,questions:10,isBoss:true},
   ]},
  {id:"shadow_verbal",   ageGroup:"shadow", isShadow:true,
   name:"Shadow Verbal",      icon:"🔮",colour:"#4A1942",gradient:"linear-gradient(135deg,#1a0020,#4A1942)",
   desc:"Twisted analogies, codes and sequences. ×2 XP reward.",
   missions:[
    {id:"sh_v1",name:"Dark Analogies",    icon:"🔮",topic:"Analogies",           xp:200,coins:50,questions:8},
    {id:"sh_v2",name:"Shadow Codes",      icon:"🔮",topic:"Codes & Ciphers",     xp:200,coins:50,questions:8},
    {id:"sh_v3",name:"Cursed Sequences",  icon:"🔮",topic:"Sequences",           xp:220,coins:55,questions:8},
    {id:"sh_vb",name:"⚔️ Phantom Boss",   icon:"🔮",topic:"BOSS",               xp:600,coins:150,questions:10,isBoss:true},
   ]},
];

function getAllWorlds(player){ 
  const allCompleted = player?.completed_missions||[];
  const regularDone = WORLDS.every(w=>w.missions.every(m=>allCompleted.includes(m.id)));
  return [...WORLDS, ...(regularDone ? SHADOW_WORLDS : [])];
}

// ─── PRESTIGE SYSTEM ─────────────────────────────────────────────────────────
const PRESTIGE_MULTIPLIERS=[1,1.5,2,2.5,3,4,5];
function getPrestigeMultiplier(prestigeCount){
  return PRESTIGE_MULTIPLIERS[Math.min(prestigeCount||0, PRESTIGE_MULTIPLIERS.length-1)];
}
const PRESTIGE_BADGES=[
  {id:"prestige_1",icon:"🔁",name:"Prestige I",    desc:"First rebirth — brave soul!"},
  {id:"prestige_2",icon:"⚡",name:"Prestige II",   desc:"Second rebirth — relentless!"},
  {id:"prestige_3",icon:"🌀",name:"Prestige III",  desc:"Third rebirth — unstoppable!"},
  {id:"prestige_5",icon:"🌟",name:"Prestige V",    desc:"Fifth rebirth — LEGEND!"},
];

// ─── WEEKLY CHALLENGES ────────────────────────────────────────────────────────
function getWeeklyChallenge(){
  const weekNum = Math.floor(Date.now()/(7*24*60*60*1000));
  const challenges=[
    {id:"wc_perfect3",  icon:"⭐",name:"Triple Flawless",        desc:"Score 100% on 3 missions this week",            xpBonus:500,coins:100,target:3,  type:"perfect"},
    {id:"wc_boss2",     icon:"⚔️",name:"Boss Hunter",             desc:"Defeat 2 boss battles this week",               xpBonus:400,coins:80, target:2,  type:"boss"},
    {id:"wc_streak5",   icon:"🔥",name:"Streaker",                desc:"Complete missions 5 days in a row",             xpBonus:600,coins:120,target:5,  type:"streak"},
    {id:"wc_missions7", icon:"🗺",name:"World Explorer",          desc:"Complete 7 missions this week",                 xpBonus:350,coins:70, target:7,  type:"missions"},
    {id:"wc_mastery",   icon:"💎",name:"Mastery Seeker",          desc:"Earn a Gold or Platinum star this week",        xpBonus:450,coins:90, target:1,  type:"mastery"},
    {id:"wc_shadow",    icon:"💀",name:"Shadow Runner",           desc:"Complete 2 Shadow World missions",              xpBonus:700,coins:140,target:2,  type:"shadow"},
    {id:"wc_all_sub",   icon:"🎓",name:"All-Rounder",             desc:"Complete a mission in each subject this week",  xpBonus:500,coins:100,target:4,  type:"all_sub"},
  ];
  return challenges[weekNum % challenges.length];
}

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

// ─── SUBSCRIPTION HELPERS ────────────────────────────────────────────────────
const PROMO_CODE = "ifyouknowthecodeyouhavetoknowjay";

async function loadSubStatus(userId) {
  try {
    const records = await UserProgress.filter({ user_id: userId });
    if (records && records.length > 0) return records[0];
    return null;
  } catch(e) { console.error(e); return null; }
}

function isSubActive(subRecord) {
  if (!subRecord) return false;
  const status = subRecord.subscription;
  if (!status || status === "none" || status === "cancelled") return false;
  if (subRecord.subscription_end) {
    const end = new Date(subRecord.subscription_end);
    if (end < new Date()) return false;
  }
  return true;
}

async function activateSubscription(userId, plan, promoUsed=false) {
  const now = new Date();
  let endDate = new Date(now);
  if (plan === "trial" || plan === "monthly" || plan === "promo") endDate.setMonth(endDate.getMonth() + 1);
  else if (plan === "annual") endDate.setFullYear(endDate.getFullYear() + 1);
  const data = {
    user_id: userId,
    subscription: plan,
    subscription_start: now.toISOString(),
    subscription_end: endDate.toISOString(),
    subscription_plan: plan,
    promo_used: promoUsed,
  };
  try {
    const existing = await UserProgress.filter({ user_id: userId });
    if (existing && existing.length > 0) {
      await UserProgress.update(existing[0].id, data);
    } else {
      await UserProgress.create({ ...data, xp:0, coins:0, streak_days:0, completed_missions:[], badges:[] });
    }
    return true;
  } catch(e) { console.error(e); return false; }
}

// ─── PAYWALL / SUBSCRIPTION SCREEN ───────────────────────────────────────────
function SubscriptionScreen({ user, subRecord, onActivated, onLogout }) {
  const [tab, setTab] = useState("plans");
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [activating, setActivating] = useState(null);

  const trialUsed = subRecord && subRecord.subscription && subRecord.subscription !== "none" && subRecord.subscription !== "cancelled";

  async function handlePromo(e) {
    e.preventDefault();
    setPromoError("");
    setPromoLoading(true);
    if (promoCode.trim().toLowerCase() === PROMO_CODE.toLowerCase()) {
      const ok = await activateSubscription(user.id, "promo", true);
      if (ok) { setPromoSuccess(true); setTimeout(() => onActivated(), 1500); }
      else setPromoError("Something went wrong. Please try again.");
    } else {
      setPromoError("❌ Invalid promo code. Try again!");
    }
    setPromoLoading(false);
  }

  async function handlePlan(plan) {
    setActivating(plan);
    const ok = await activateSubscription(user.id, plan, false);
    if (ok) setTimeout(() => onActivated(), 800);
    else setActivating(null);
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 16px"}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,marginBottom:4}}>🎓</div>
          <div style={{color:"#FCD34D",fontWeight:900,fontSize:28,letterSpacing:"-0.5px"}}>11+ Quest</div>
          <div style={{color:"rgba(255,255,255,0.55)",fontSize:13,marginTop:4}}>Unlock your full adventure</div>
        </div>
        <div style={{display:"flex",background:"rgba(255,255,255,0.07)",borderRadius:16,padding:4,marginBottom:20,gap:4}}>
          <button onClick={()=>{setTab("plans");setPromoError("");}} style={{flex:1,padding:"10px 0",borderRadius:12,border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",background:tab==="plans"?"white":"transparent",color:tab==="plans"?"#1e1b4b":"rgba(255,255,255,0.6)",transition:"all 0.2s"}}>💳 Plans</button>
          <button onClick={()=>{setTab("promo");setPromoError("");}} style={{flex:1,padding:"10px 0",borderRadius:12,border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",background:tab==="promo"?"#FCD34D":"transparent",color:tab==="promo"?"#1e1b4b":"rgba(255,255,255,0.6)",transition:"all 0.2s"}}>🎟 Promo Code</button>
        </div>
        {tab === "plans" && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            {!trialUsed && (
              <div style={{background:"linear-gradient(135deg,rgba(5,150,105,0.25),rgba(16,185,129,0.15))",border:"2px solid rgba(5,150,105,0.5)",borderRadius:20,padding:"20px 18px",marginBottom:14,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:12,right:14,background:"#059669",color:"white",fontWeight:800,fontSize:10,borderRadius:20,padding:"3px 10px",textTransform:"uppercase",letterSpacing:"1px"}}>FREE</div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <span style={{fontSize:32}}>🆓</span>
                  <div>
                    <div style={{color:"white",fontWeight:900,fontSize:17}}>1 Month Free Trial</div>
                    <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>Full access — no card needed</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginBottom:14}}>Access all 10 worlds, boss battles, and challenges</div>
                <button onClick={()=>handlePlan("trial")} disabled={!!activating} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#059669,#10B981)",color:"white",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",opacity:activating?"0.7":"1"}}>
                  {activating==="trial"?"⏳ Activating...":"Start Free Trial 🚀"}
                </button>
              </div>
            )}
            <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"20px 18px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:28}}>📅</span>
                  <div>
                    <div style={{color:"white",fontWeight:900,fontSize:16}}>Monthly</div>
                    <div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>Cancel anytime</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#FCD34D",fontWeight:900,fontSize:22}}>£1.99</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>/month</div>
                </div>
              </div>
              <button onClick={()=>handlePlan("monthly")} disabled={!!activating} style={{width:"100%",padding:"13px",borderRadius:12,border:"2px solid rgba(252,211,77,0.5)",background:"transparent",color:"#FCD34D",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",opacity:activating?"0.7":"1"}}>
                {activating==="monthly"?"⏳ Activating...":"Subscribe Monthly →"}
              </button>
            </div>
            <div style={{background:"linear-gradient(135deg,rgba(79,70,229,0.25),rgba(124,58,237,0.2))",border:"2px solid rgba(99,102,241,0.5)",borderRadius:20,padding:"20px 18px",marginBottom:20,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:12,right:14,background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:10,borderRadius:20,padding:"3px 10px",textTransform:"uppercase",letterSpacing:"1px"}}>BEST VALUE</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:28}}>🏆</span>
                  <div>
                    <div style={{color:"white",fontWeight:900,fontSize:16}}>Annual</div>
                    <div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>Save ~16% vs monthly</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#A78BFA",fontWeight:900,fontSize:22}}>£19.99</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>/year</div>
                </div>
              </div>
              <button onClick={()=>handlePlan("annual")} disabled={!!activating} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",opacity:activating?"0.7":"1"}}>
                {activating==="annual"?"⏳ Activating...":"Get Annual Access →"}
              </button>
            </div>
            <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:11,marginBottom:16}}>
              By subscribing you agree to our terms. Cancel anytime.
            </div>
          </div>
        )}
        {tab === "promo" && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"24px 20px",marginBottom:16}}>
              <div style={{textAlign:"center",marginBottom:18}}>
                <div style={{fontSize:40,marginBottom:8}}>🎟</div>
                <div style={{color:"white",fontWeight:900,fontSize:17,marginBottom:4}}>Have a promo code?</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>Enter it below to unlock 1 month free</div>
              </div>
              {promoSuccess ? (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{fontSize:52,marginBottom:8,animation:"starBurst 0.6s ease"}}>🎉</div>
                  <div style={{color:"#4ADE80",fontWeight:900,fontSize:18}}>Code accepted!</div>
                  <div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginTop:4}}>1 month free access unlocked ✨</div>
                </div>
              ) : (
                <form onSubmit={handlePromo}>
                  <input value={promoCode} onChange={e=>setPromoCode(e.target.value)} placeholder="Enter promo code..." style={{width:"100%",padding:"14px",borderRadius:12,border:"2px solid rgba(255,255,255,0.2)",fontSize:14,background:"rgba(255,255,255,0.08)",color:"white",boxSizing:"border-box",fontFamily:"inherit",marginBottom:10,outline:"none",textAlign:"center",letterSpacing:"1px"}}/>
                  {promoError && <div style={{background:"rgba(220,38,38,0.15)",borderRadius:10,padding:"10px 12px",marginBottom:10,color:"#FCA5A5",fontSize:13,fontWeight:600,textAlign:"center"}}>{promoError}</div>}
                  <button type="submit" disabled={promoLoading||!promoCode.trim()} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#FCD34D,#F59E0B)",color:"#1e1b4b",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",opacity:(promoLoading||!promoCode.trim())?"0.6":"1"}}>
                    {promoLoading?"⏳ Checking...":"Redeem Code 🎁"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
        <div style={{textAlign:"center"}}>
          <button onClick={onLogout} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({onClose, onAuthSuccess, canClose=true}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPass]=useState("");
  const [name,setName]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function handleSubmit(e){
    e.preventDefault(); setError(""); setLoading(true);
    try{
      if(mode==="login"){
        await User.login(email, password);
      } else {
        await User.register(email, password, {full_name: name||email.split("@")[0]});
      }
      const me = await User.me();
      onAuthSuccess(me);
      if(canClose) onClose();
    } catch(err){
      setError(err?.response?.data?.detail || err?.message || "Something went wrong. Please try again.");
    } finally{setLoading(false);}
  }

  async function handleGoogle(){
    setLoading(true);
    try{
      await User.loginWithGoogle();
    } catch(err){
      setError(err?.message||"Google sign-in failed.");
      setLoading(false);
    }
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:380,boxShadow:"0 24px 80px rgba(0,0,0,0.5)",animation:"popIn 0.3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 style={{margin:0,fontSize:20,fontWeight:900,color:"#1e1b4b"}}>{mode==="login"?"Welcome back! 🎮":"Join the Quest! 🎓"}</h2>
            <p style={{margin:"4px 0 0",fontSize:12,color:"#6b7280"}}>{mode==="login"?"Continue your adventure":"Create your free account"}</p>
          </div>
          {canClose&&<button onClick={onClose} style={{background:"#f3f4f6",border:"none",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
        </div>
        <button onClick={handleGoogle} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:12,border:"2px solid #e5e7eb",fontSize:14,marginBottom:14,cursor:"pointer",fontFamily:"inherit",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"white"}}>
          <img src="https://www.google.com/favicon.ico" width={16} height={16} alt="G"/>
          Continue with Google
        </button>
        <div style={{textAlign:"center",color:"#9ca3af",fontSize:12,marginBottom:14}}>— or —</div>
        <form onSubmit={handleSubmit}>
          {mode==="register"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{width:"100%",padding:"13px",borderRadius:12,border:"2px solid #e5e7eb",fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" required style={{width:"100%",padding:"13px",borderRadius:12,border:"2px solid #e5e7eb",fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>
          <input value={password} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" required style={{width:"100%",padding:"13px",borderRadius:12,border:"2px solid #e5e7eb",fontSize:14,marginBottom:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
          {error&&<div style={{background:"#FEF2F2",borderRadius:10,padding:"10px 12px",marginBottom:12,color:"#DC2626",fontSize:13,fontWeight:600}}>{error}</div>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",opacity:loading?0.7:1}}>
            {loading?"⏳ Please wait...":(mode==="login"?"Sign In →":"Create Account →")}
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


// ─── SCHOOLS SCREEN ──────────────────────────────────────────────────────────
function SchoolsScreen({goTo}) {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");

  const regions = ["All", ...new Set(UK_GRAMMAR_SCHOOLS.map(s => {
    const parts = s.area.split(",");
    return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
  }))].sort((a,b) => a==="All"?-1:a.localeCompare(b));

  const filtered = UK_GRAMMAR_SCHOOLS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.area.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === "All" || s.area.includes(regionFilter);
    const matchType = typeFilter === "All" || s.type === typeFilter;
    const matchGender = genderFilter === "All" || s.gender === genderFilter;
    return matchSearch && matchRegion && matchType && matchGender;
  });

  const typeColours = { GL:"#4F46E5", CEM:"#059669", ISEB:"#D97706" };
  const typeDesc = { GL:"GL Assessment", CEM:"CEM 11+", ISEB:"ISEB" };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#1a1042)"}}>
      <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
        {/* Header */}
        <div style={{padding:"14px 0 10px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>goTo("home")} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
          <div>
            <h2 style={{color:"white",fontWeight:900,fontSize:20,margin:0}}>🏫 UK Grammar Schools</h2>
            <p style={{color:"rgba(255,255,255,0.45)",fontSize:11,margin:0}}>{filtered.length} of {UK_GRAMMAR_SCHOOLS.length} schools</p>
          </div>
        </div>

        {/* Type key */}
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          {Object.entries(typeColours).map(([t,c])=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.06)",borderRadius:8,padding:"5px 10px"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:c}}/>
              <span style={{color:"rgba(255,255,255,0.55)",fontSize:11,fontWeight:600}}>{typeDesc[t]}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search school or area..."
          style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.07)",color:"white",fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>

        {/* Filters */}
        <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
            style={{padding:"8px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.1)",color:"white",fontSize:12,fontFamily:"inherit",cursor:"pointer",flexShrink:0}}>
            <option value="All">All Types</option>
            <option value="GL">GL Assessment</option>
            <option value="CEM">CEM 11+</option>
            <option value="ISEB">ISEB</option>
          </select>
          <select value={genderFilter} onChange={e=>setGenderFilter(e.target.value)}
            style={{padding:"8px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.1)",color:"white",fontSize:12,fontFamily:"inherit",cursor:"pointer",flexShrink:0}}>
            <option value="All">All Genders</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
            <option value="Mixed">Mixed</option>
          </select>
          <select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)}
            style={{padding:"8px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.1)",color:"white",fontSize:12,fontFamily:"inherit",cursor:"pointer",flexShrink:0}}>
            {regions.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* School cards */}
        {filtered.length === 0 && (
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:48,marginBottom:12}}>🔍</div>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:15}}>No schools found. Try different filters.</p>
          </div>
        )}
        {filtered.map((school,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:"14px 16px",marginBottom:8,border:"1px solid rgba(255,255,255,0.07)",animation:`slideUp ${0.05+Math.min(i,10)*0.03}s ease`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:"white",fontWeight:800,fontSize:14,marginBottom:3,lineHeight:1.3}}>{school.name}</div>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>{school.area}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                <span style={{background:typeColours[school.type]||"#6B7280",color:"white",fontSize:10,fontWeight:800,borderRadius:6,padding:"3px 7px"}}>{school.type}</span>
                <span style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",fontSize:10,fontWeight:600,borderRadius:6,padding:"3px 7px"}}>
                  {school.gender==="Boys"?"👦":school.gender==="Girls"?"👧":"👨‍👩‍👧‍👦"} {school.gender}
                </span>
              </div>
            </div>
            {school.url && (
              <a href={school.url} target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:8,color:"#818CF8",fontSize:12,fontWeight:600,textDecoration:"none"}}>
                🌐 Visit website →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BottomNav({screen,goTo}){
  const tabs=[{id:"home",icon:"🗺",label:"Map"},{id:"learn",icon:"🤖",label:"Learn"},{id:"tricks",icon:"🔑",label:"Tricks"},{id:"schools",icon:"🏫",label:"Schools"},{id:"account",icon:"👤",label:"Account"}];
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

// ─── LEARN DATA (lessons + AI tutor) ──────────────────────────────────────────
const LESSONS = {
  maths: {
    icon:"⛰️", colour:"#4F46E5",
    topics:[
      {id:"fractions", title:"Fractions", icon:"½", content:`WHAT IS A FRACTION?
A fraction shows part of a whole. The bottom number (denominator) is how many equal parts the whole is split into. The top number (numerator) is how many parts you have.

🔑 KEY RULE: To find a fraction of a number:
  DIVIDE by the bottom → MULTIPLY by the top

EXAMPLES:
• ¾ of 40  → 40÷4=10 → 10×3=30 ✓
• ⅔ of 18  → 18÷3=6  → 6×2=12  ✓
• ⅖ of 25  → 25÷5=5  → 5×2=10  ✓

SIMPLIFYING: Divide top AND bottom by their HCF.
  8/12 → HCF=4 → 2/3 ✓

ADDING: Make denominators the same first.
  ½ + ¼ → 2/4 + 1/4 = 3/4 ✓`},
      {id:"percentages", title:"Percentages", icon:"％", content:`PERCENTAGES = PARTS PER 100

🔑 BUILDING BLOCKS (memorise these!):
  10% = ÷10
  5%  = half of 10%
  25% = ÷4
  50% = ÷2
  1%  = ÷100

BUILD ANY %:
  15% = 10% + 5%
  35% = 25% + 10%
  75% = 50% + 25%

EXAMPLE: 35% of £80
  10% = £8 → 25% = £20 → 35% = £28
  Or: 35% off → £80 − £28 = £52 ✓

% CHANGE: (Change ÷ Original) × 100
  £40 → £50: change=10, 10÷40×100 = 25% increase ✓`},
      {id:"algebra", title:"Algebra", icon:"🔣", content:`ALGEBRA — think of the letter as a mystery box.

🔑 GOLDEN RULE: Do the SAME thing to BOTH sides.

SOLVING EQUATIONS:
  x + 7 = 15  → subtract 7 both sides → x = 8
  3x = 21     → divide both by 3      → x = 7
  2x − 3 = 7  → +3 both → 2x=10 → ÷2 → x = 5

NTH TERM (sequences):
  5, 8, 11, 14... gap = +3 → rule is 3n + ?
  When n=1: 3×1=3, but answer is 5 → +2
  nth term = 3n + 2 ✓

EXPAND: 3(x+4) = 3x + 12
FACTORISE: 2x+6 = 2(x+3)  (take out the HCF)`},
      {id:"ratio", title:"Ratio", icon:"⚖️", content:`RATIO — sharing in given parts.

🔑 3-STEP METHOD:
  1. Add the parts to get TOTAL PARTS
  2. Divide the total value by total parts → 1 PART
  3. Multiply each ratio number by 1 part

EXAMPLE: Share £30 in ratio 2:3
  Total parts = 2+3 = 5
  1 part = £30÷5 = £6
  2 parts = £12, 3 parts = £18 ✓

SCALING UP:
  Recipe for 4 uses 200g flour. For 6?
  Per person: 200÷4 = 50g
  For 6: 50×6 = 300g ✓`},
      {id:"geometry", title:"Geometry", icon:"📐", content:`KEY FORMULAS:

📏 PERIMETER = add all sides
   Rectangle: 2×(length + width)

📦 AREA:
   Rectangle = length × width
   Triangle = ½ × base × height
   Circle = π × r²  (π ≈ 3.14)

📦 VOLUME:
   Cuboid = length × width × height

⭕ CIRCLES:
   Circumference = 2 × π × r

📐 ANGLES:
   Triangle = 180°
   Quadrilateral = 360°
   Regular hexagon interior = 120°

🔺 PYTHAGORAS (right-angled triangles):
   a² + b² = c²  →  3²+4²=5² ✓`},
    ]
  },
  english: {
    icon:"🌲", colour:"#059669",
    topics:[
      {id:"grammar", title:"Grammar", icon:"📝", content:`PARTS OF SPEECH — know them cold!

NOUNS: naming words (happiness, London, dog)
VERBS: doing/being words (run, is, think)
ADJECTIVES: describe nouns (tall, beautiful)
ADVERBS: describe verbs, often end in -ly (quickly, very)
PRONOUNS: replace nouns (he, she, it, they)

🔑 SUBJECT vs OBJECT PRONOUNS:
  Subject: I, he, she, we, they  (doing the action)
  Object:  me, him, her, us, them (receiving it)

  ✓ "He and I went"   ✗ "Me and him went"
  TIP: remove the other person and test alone!

ACTIVE vs PASSIVE:
  Active:  "The cat ate the fish." (subject does it)
  Passive: "The fish was eaten."  (subject receives it)`},
      {id:"punctuation", title:"Punctuation", icon:"✏️", content:`APOSTROPHES — two uses only:

1. CONTRACTION (missing letters):
   it is → it's    do not → don't
   they are → they're    I am → I'm

2. POSSESSION (belonging):
   the dog's lead  (one dog)
   the dogs' leads (many dogs)
   NOTE: "its" as possession = NO apostrophe!

❌ NEVER use apostrophe for plurals:
   "apple's" = WRONG.  "apples" = correct ✓

COMMAS:
• Before a joining word (FANBOYS): but, and, or, so
• After an introductory phrase: "However, ..."
• Around extra information: "Jay, my friend, ..."

COLONS: introduce lists or explanations.
SEMICOLONS: join two related sentences.`},
      {id:"vocabulary", title:"Vocabulary", icon:"📚", content:`WORD ROOTS — crack any unknown word!

port = carry   (transport, portable, import)
aud  = hear    (audio, auditorium, audience)
vis  = see     (vision, visible, television)
bene = good    (benefit, benevolent, beneficial)
mal  = bad     (malicious, malfunction, malice)
scrib= write   (scribble, describe, script)
dict = say     (dictate, predict, dictionary)
rupt = break   (interrupt, erupt, corrupt)
flex = bend    (flexible, reflect, inflexible)
bio  = life    (biology, biography, antibiotic)
graph= write   (photograph, autograph)
tele = far     (telephone, television, telescope)

PREFIXES:
  un/dis/mis = not/opposite
  re = again    pre = before    over = too much`},
    ]
  },
  verbal: {
    icon:"🗼", colour:"#D97706",
    topics:[
      {id:"synonyms", title:"Synonyms & Antonyms", icon:"🔄", content:`SYNONYMS = same meaning
ANTONYMS = opposite meaning

WORD FAMILIES to know:

😊 Happy: joyful, elated, gleeful, blissful, content
😢 Sad: mournful, melancholy, sorrowful, dejected
💪 Brave: courageous, valiant, intrepid, bold, daring
😠 Angry: furious, irate, livid, incensed, wrathful
🌟 Excellent: superb, outstanding, exceptional, magnificent

ANTONYMS — common pairs:
  ancient ↔ modern    reveal ↔ conceal
  generous ↔ mean     genuine ↔ fake
  cautious ↔ reckless  tranquil ↔ turbulent

TIP: When in doubt, break the word into prefix/root.
  "benevolent" → bene(good) = kind/generous`},
      {id:"analogies", title:"Analogies", icon:"🔗", content:`ANALOGIES — find the relationship, then apply it.

🔑 FORMULA: State the relationship first!
  "A is the YOUNG OF B"
  "A is the TOOL FOR B"
  "A is the OPPOSITE OF B"
  "A is WHERE B lives"

EXAMPLES:
  Puppy:Dog → young of → Kitten:Cat ✓
  Brush:Paint → tool for → Pen:Write ✓
  Hot:Cold → opposite → Light:Dark ✓
  Den:Fox → home of → Burrow:Rabbit ✓
  Surgeon:Hospital → works in → Teacher:School ✓

COMMON RELATIONSHIPS:
  animal/young · tool/action · part/whole
  worker/workplace · degree (warm/hot/boiling)`},
      {id:"codes", title:"Codes & Ciphers", icon:"🔐", content:`CODE CRACKING — always write it out!

🔑 STEP-BY-STEP:
  1. Write out: A B C D E F G H...
  2. Find the shift rule (+1, +2, -1, mirror etc.)
  3. Map EVERY letter (never guess in your head!)

COMMON CODES:
  +1: A→B, B→C, C→D...
  -1: B→A, C→B, D→C...
  Mirror (A=Z): A↔Z, B↔Y, C↔X...

EXAMPLE: If CAT = DBU, what is DOG?
  Rule: each letter +1
  D→E, O→P, G→H → answer: EPH ✓

LETTER POSITIONS:
  A=1, B=2, C=3... Z=26
  (Write this out on your paper every time!)`},
      {id:"sequences", title:"Sequences", icon:"🔢", content:`SEQUENCES — find the rule between terms.

🔑 STEP BY STEP:
  1. Find the gap between each pair of numbers
  2. Is it +, -, ×, ÷?
  3. Check if it's TWO alternating rules

NUMBER EXAMPLES:
  2, 5, 8, 11... → gap = +3 → next = 14
  2, 6, 18, 54... → rule = ×3 → next = 162
  20, 17, 14, 11... → rule = −3 → next = 8

LETTER SEQUENCES:
  A, C, E, G... → +2 positions → next = I
  Z, X, V, T... → −2 positions → next = R

TWO RULE sequences:
  2, 3, 5, 6, 8, 9... → +1, +2, +1, +2...`},
    ]
  },
  nvr: {
    icon:"🔬", colour:"#DC2626",
    topics:[
      {id:"shapes2d", title:"2D Shapes", icon:"🔷", content:`POLYGONS — shapes with straight sides.

TRIANGLES (3 sides):
  Equilateral: 3 equal sides, all angles 60°
  Isosceles: 2 equal sides, 2 equal angles
  Scalene: no equal sides
  Right-angled: one 90° angle

QUADRILATERALS (4 sides):
  Square: 4 equal sides, all 90°
  Rectangle: opposite sides equal, all 90°
  Parallelogram: opposite sides parallel & equal
  Rhombus: 4 equal sides, opposite angles equal
  Trapezium: ONE pair of parallel sides

ANGLE RULES:
  All triangles → 180°
  All quadrilaterals → 360°
  Regular n-gon interior angle = (n−2)×180 ÷ n`},
      {id:"patterns", title:"Patterns & Matrices", icon:"🔲", content:`MATRIX PATTERNS — look for rules in rows AND columns.

🔑 METHOD:
  1. Check ROWS: what changes left → right?
  2. Check COLUMNS: what changes top → bottom?
  3. The rule must be consistent in BOTH directions

COMMON CHANGES TO SPOT:
  • Shape rotates (90°, 180°, 270°)
  • Shape gets larger/smaller
  • One shape added/removed each step
  • Shading changes (add/remove/alternate)
  • Number of sides increases by 1 each time

STRATEGY: If stuck, find what the top-left and top-right have in common — then apply it to the bottom row.`},
      {id:"symmetry", title:"Symmetry & Reflection", icon:"🔄", content:`LINES OF SYMMETRY: a fold line where both halves match exactly.

Regular shapes:
  Square: 4 lines · Rectangle: 2 lines
  Equilateral triangle: 3 lines · Circle: infinite

🔑 REFLECTION RULES:
  • Each point stays the SAME DISTANCE from the mirror
  • Shape is FLIPPED, not rotated
  • Vertical mirror: left ↔ right swap
  • Horizontal mirror: top ↔ bottom swap

ROTATION:
  90° clockwise: (x,y) → (y,−x)
  180°: shape is upside down
  270° clockwise = 90° anticlockwise

TIP: Count squares from the mirror line carefully — this is where most mistakes happen!`},
      {id:"3dshapes", title:"3D Shapes", icon:"🧊", content:`3D SHAPE VOCABULARY:
  Face = flat surface
  Edge = line where 2 faces meet
  Vertex (pl. Vertices) = corner point

COMMON SHAPES:
  Cube:           6F, 12E, 8V
  Cuboid:         6F, 12E, 8V
  Square pyramid: 5F, 8E, 5V
  Triangular prism: 5F, 9E, 6V
  Cylinder:       3F, 2E, 0V
  Cone:           2F, 1E, 1V
  Sphere:         1F, 0E, 0V

🔑 EULER'S FORMULA (always works for polyhedra):
  F + V − E = 2
  Cube: 6 + 8 − 12 = 2 ✓
  Use it to find any missing value in an exam!`},
    ]
  },
};

// ─── LEARN SCREEN ─────────────────────────────────────────────────────────────
function LearnScreen({goTo, player}){
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [chatMode, setChatMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {role:"tutor", text:"Hi! I'm your 11+ AI Tutor 🤖 Ask me anything about Maths, English, Verbal or Non-Verbal Reasoning — or pick a subject below!"}
  ]);
  const chatEndRef = useRef(null);

  useEffect(()=>{ if(chatEndRef.current) chatEndRef.current.scrollIntoView({behavior:"smooth"}); },[chatHistory]);

  // Simple rule-based AI tutor responses
  function getTutorResponse(q){
    const lower = q.toLowerCase();
    // Fractions
    if(lower.includes("fraction")||lower.includes("numerator")||lower.includes("denominator")){
      return "Great question! For fractions: DIVIDE by the bottom number, then MULTIPLY by the top. So ¾ of 40 → 40÷4=10, 10×3=30. To simplify, divide both top and bottom by their HCF. Want a practice question? 😊";
    }
    if(lower.includes("percentage")||lower.includes("percent")){
      return "Percentages are easy once you know your building blocks! 10%=÷10, 25%=÷4, 50%=÷2. Build any %: 35% = 25%+10%. Example: 35% of £80 → 25%=£20, 10%=£8 → 35%=£28. Got it? 💡";
    }
    if(lower.includes("ratio")){
      return "Ratio in 3 steps: ①Add all parts to get total parts. ②Divide total value by total parts to get 1 part. ③Multiply each ratio number by 1 part. Example: 2:3 sharing £30 → 5 parts → £6 each → £12 and £18. 👍";
    }
    if(lower.includes("algebra")||lower.includes("equation")){
      return "Algebra tip: whatever you do to one side, do to the other! To solve 2x+3=11 → subtract 3 both sides → 2x=8 → divide by 2 → x=4. For nth terms: find the gap (common difference), then work out the adjustment. Example: 5,8,11,14 → gap=3 → 3n, check: 3(1)=3 but need 5, so add 2 → 3n+2 ✓";
    }
    if(lower.includes("geometry")||lower.includes("area")||lower.includes("perimeter")){
      return "Key formulas: Perimeter = add all sides. Area of rectangle = l×w. Area of triangle = ½×base×height. Area of circle = πr². Pythagoras: a²+b²=c². Interior angles: triangle=180°, quadrilateral=360°. Need me to explain any of these? 📐";
    }
    if(lower.includes("grammar")||lower.includes("adjective")||lower.includes("adverb")||lower.includes("noun")||lower.includes("verb")){
      return "Grammar quick guide: Nouns=naming words, Verbs=doing words, Adjectives=describe nouns, Adverbs=describe verbs (often -ly). Remember: subject pronouns (I, he, she) vs object pronouns (me, him, her). Test: 'He and I went' ✓ vs 'Me and him went' ✗";
    }
    if(lower.includes("apostrophe")||lower.includes("punctuation")){
      return "Apostrophes have TWO uses: 1) Contractions — missing letters (it's = it is, don't = do not). 2) Possession — belonging (dog's collar = one dog, dogs' collars = many dogs). NEVER use apostrophes for plain plurals! 'Apple's' is ALWAYS wrong. ✏️";
    }
    if(lower.includes("synonym")||lower.includes("antonym")||lower.includes("vocabulary")){
      return "Synonyms = same meaning, Antonyms = opposite. Learn word families: Happy→joyful/elated/gleeful. Brave→courageous/valiant/intrepid. Use word roots too: bene=good, mal=bad, port=carry, vis=see. These help you crack unknown words! 📚";
    }
    if(lower.includes("analogy")){
      return "For analogies, ALWAYS state the relationship first! 'A is the young of B', 'A is the tool for B', 'A is the opposite of B'. Example: Puppy:Dog → young of → Kitten:Cat. Surgeon:Hospital → works in → Teacher:School. State it, then apply it! 🔗";
    }
    if(lower.includes("code")||lower.includes("cipher")){
      return "For code questions: ALWAYS write out the full alphabet first, then find the shift rule (+1, +2, -1, mirror/A=Z). Map EVERY letter on paper — never try to do it in your head! Most common shifts are +1 and -1. 🔐";
    }
    if(lower.includes("sequence")){
      return "For sequences: find the gap between each pair of terms. Is it +, -, ×, ÷? Watch for two alternating rules (2,3,5,6,8,9 → +1,+2,+1,+2). For letter sequences, count alphabet positions. Always check your rule on at least 3 terms! 🔢";
    }
    if(lower.includes("symmetry")||lower.includes("reflection")){
      return "Reflection: each point stays the SAME distance from the mirror line, but flipped. Vertical mirror: left↔right. Horizontal mirror: top↔bottom. Count squares carefully — this is where most marks are lost! 🔄";
    }
    if(lower.includes("pattern")||lower.includes("matrix")){
      return "For pattern/matrix questions: check ROWS left→right first (what changes?), then COLUMNS top→bottom. The rule must work consistently in BOTH directions. Common changes: rotation, size, shading, adding/removing shapes. 🔲";
    }
    if(lower.includes("3d")||lower.includes("cube")||lower.includes("euler")||lower.includes("face")||lower.includes("edge")||lower.includes("vertice")){
      return "Euler's Formula: Faces + Vertices − Edges = 2. Works for all polyhedra! Cube: 6+8−12=2 ✓. Use it to find any missing value. Know your shapes: Cube(6F,12E,8V), Square pyramid(5F,8E,5V), Triangular prism(5F,9E,6V). 🧊";
    }
    if(lower.includes("help")||lower.includes("how do i")||lower.includes("explain")||lower.includes("what is")||lower.includes("what are")){
      return "I'm here to help! I can explain any 11+ topic: fractions, percentages, algebra, geometry, grammar, punctuation, vocabulary, analogies, codes, sequences, symmetry, and more. What topic would you like me to explain? 🤖";
    }
    if(lower.includes("test")||lower.includes("practice")||lower.includes("question")){
      return "Great idea! Head to the 🗺 Map tab to practice with real exam questions. Each world has missions for Maths, English, Verbal and Non-Verbal Reasoning. Boss battles are timed for extra challenge! 🎮";
    }
    if(lower.includes("level")||lower.includes("xp")||lower.includes("badge")){
      return "You earn XP by completing missions with 70%+ score. Level up to unlock new ranks: Explorer → Apprentice → Scholar → Logic Warrior → Champion → 11+ Master → Legend! Badges are special achievements — check your stats in the progress tab. 🏆";
    }
    if(lower.includes("streak")){
      return "A streak means you practice every day! Your streak goes up when you complete a mission on consecutive days. 3-day streak = 🔥 badge, 7-day = 💎 badge. Try to practice a little every day — it really helps with exam prep! 📅";
    }
    // Greetings
    if(lower.includes("hello")||lower.includes("hi ")||lower.match(/^hi$/)||lower.includes("hey")){
      return "Hey there! 👋 I'm your 11+ AI Tutor. I can help you understand any topic — maths, english, verbal reasoning, or non-verbal reasoning. What would you like to learn today?";
    }
    if(lower.includes("thank")){
      return "You're welcome! 😊 Keep up the great work. Remember: a little practice every day is way better than cramming. Good luck with your 11+! 🌟";
    }
    // Generic fallback
    return `That's a great question about "${q.slice(0,40)}${q.length>40?"...":""}". I'm best at explaining 11+ topics like fractions, percentages, algebra, grammar, analogies, codes, and sequences. Try asking me something like "How do fractions work?" or "Explain codes!" 🤖`;
  }

  function sendMessage(){
    if(!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory(h=>[...h,{role:"user",text:userMsg}]);
    setTimeout(()=>{
      const resp = getTutorResponse(userMsg);
      setChatHistory(h=>[...h,{role:"tutor",text:resp}]);
    }, 600);
  }

  // Subject list view
  if(!subject && !chatMode){
    return(
      <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1042)"}}>
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
          <div style={{padding:"18px 0 12px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:6}}>🤖</div>
            <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"0 0 4px"}}>AI Tutor & Learn</h2>
            <p style={{color:"rgba(255,255,255,0.45)",fontSize:13,margin:0}}>Study lessons or chat with your personal tutor</p>
          </div>

          {/* Chat with AI button */}
          <div onClick={()=>setChatMode(true)} style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)",borderRadius:20,padding:"18px 20px",marginBottom:16,cursor:"pointer",boxShadow:"0 8px 32px rgba(79,70,229,0.4)",display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:40,flexShrink:0}}>💬</div>
            <div>
              <div style={{color:"white",fontWeight:900,fontSize:16,marginBottom:2}}>Chat with AI Tutor</div>
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:13}}>Ask anything — get instant explanations</div>
            </div>
            <div style={{marginLeft:"auto",color:"rgba(255,255,255,0.5)",fontSize:20}}>›</div>
          </div>

          {/* Subject lessons */}
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>📚 Study Lessons</div>
          {Object.entries(LESSONS).map(([id,subj])=>{
            const worldObj = getAllWorlds(player).find(w=>w.id===id);
            return(
              <div key={id} onClick={()=>setSubject(id)} style={{background:worldObj?.gradient||"rgba(255,255,255,0.08)",borderRadius:18,padding:"16px 18px",marginBottom:10,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:36,flexShrink:0}}>{subj.icon}</div>
                <div>
                  <div style={{color:"white",fontWeight:800,fontSize:16}}>{worldObj?.name||id}</div>
                  <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>{LESSONS[id].topics.length} lessons available</div>
                </div>
                <div style={{marginLeft:"auto",color:"rgba(255,255,255,0.4)",fontSize:20}}>›</div>
              </div>
            );
          })}
        </div>
        <BottomNav screen="learn" goTo={goTo}/>
      </div>
    );
  }

  // Chat mode
  if(chatMode){
    return(
      <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1042)",display:"flex",flexDirection:"column"}}>
        <div style={{maxWidth:520,margin:"0 auto",width:"100%",display:"flex",flexDirection:"column",height:"100vh"}}>
          {/* Header */}
          <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <button onClick={()=>setChatMode(false)} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:28}}>🤖</div>
              <div>
                <div style={{color:"white",fontWeight:800,fontSize:15}}>11+ AI Tutor</div>
                <div style={{color:"#4ADE80",fontSize:11,fontWeight:700}}>● Online</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px"}}>
            {chatHistory.map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
                {msg.role==="tutor"&&<div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:8,flexShrink:0,marginTop:2}}>🤖</div>}
                <div style={{maxWidth:"80%",background:msg.role==="user"?"linear-gradient(135deg,#4F46E5,#7C3AED)":"rgba(255,255,255,0.1)",borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",color:"white",fontSize:13,lineHeight:1.55,whiteSpace:"pre-wrap"}}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}/>
          </div>

          {/* Input */}
          <div style={{padding:"12px 16px",background:"rgba(15,12,41,0.98)",borderTop:"1px solid rgba(255,255,255,0.08)",flexShrink:0}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <input
                value={chatInput}
                onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),sendMessage())}
                placeholder="Ask me anything about 11+ topics..."
                style={{flex:1,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:16,padding:"12px 14px",color:"white",fontSize:13,fontFamily:"inherit",outline:"none",resize:"none"}}
              />
              <button onClick={sendMessage} style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",border:"none",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>→</button>
            </div>
            <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              {["How do fractions work?","Explain percentages","Help with algebra","What are analogies?","Crack codes tips"].map(q=>(
                <button key={q} onClick={()=>{setChatInput(q);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"4px 10px",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Topic list for a subject
  if(subject && !topic){
    const subj = LESSONS[subject];
    const world = WORLDS.find(w=>w.id===subject);
    return(
      <div style={{minHeight:"100vh",background:`linear-gradient(180deg,${world?.colour||"#4F46E5"}cc,#0f0c29)`}}>
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
          <div style={{padding:"14px 0 12px",display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setSubject(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
            <div>
              <h2 style={{color:"white",fontWeight:900,fontSize:20,margin:0}}>{subj.icon} {world?.name||subject} Lessons</h2>
              <p style={{color:"rgba(255,255,255,0.5)",fontSize:12,margin:0}}>Tap a topic to study</p>
            </div>
          </div>
          {subj.topics.map((t,i)=>(
            <div key={t.id} onClick={()=>setTopic(t)} style={{background:"rgba(255,255,255,0.08)",borderRadius:18,padding:"16px 18px",marginBottom:10,cursor:"pointer",border:"1px solid rgba(255,255,255,0.1)",animation:`slideUp ${0.1+i*0.06}s ease`,display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:32}}>{t.icon}</div>
              <div>
                <div style={{color:"white",fontWeight:800,fontSize:15}}>{t.title}</div>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>Tap to read lesson</div>
              </div>
              <div style={{marginLeft:"auto",color:"rgba(255,255,255,0.4)",fontSize:20}}>›</div>
            </div>
          ))}
          <div onClick={()=>setChatMode(true)} style={{background:"linear-gradient(135deg,rgba(79,70,229,0.4),rgba(124,58,237,0.4))",borderRadius:18,padding:"14px 18px",marginTop:8,cursor:"pointer",border:"1px solid rgba(124,58,237,0.3)",display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>💬</div>
            <div style={{color:"white",fontWeight:700,fontSize:14}}>Still confused? Ask the AI Tutor →</div>
          </div>
        </div>
        <BottomNav screen="learn" goTo={goTo}/>
      </div>
    );
  }

  // Lesson content view
  if(topic){
    const world = WORLDS.find(w=>w.id===subject);
    return(
      <div style={{minHeight:"100vh",background:`linear-gradient(180deg,${world?.colour||"#4F46E5"}cc,#0f0c29)`}}>
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
          <div style={{padding:"14px 0 12px",display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setTopic(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
            <div>
              <h2 style={{color:"white",fontWeight:900,fontSize:18,margin:0}}>{topic.icon} {topic.title}</h2>
            </div>
          </div>
          <div style={{background:"rgba(0,0,0,0.35)",borderRadius:20,padding:"20px",marginBottom:14,border:"1px solid rgba(255,255,255,0.1)"}}>
            <pre style={{color:"rgba(255,255,255,0.9)",fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{topic.content}</pre>
          </div>
          <div onClick={()=>{setTopic(null);setChatMode(true);}} style={{background:"linear-gradient(135deg,rgba(79,70,229,0.4),rgba(124,58,237,0.4))",borderRadius:18,padding:"14px 18px",cursor:"pointer",border:"1px solid rgba(124,58,237,0.3)",display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{fontSize:28}}>💬</div>
            <div>
              <div style={{color:"white",fontWeight:700,fontSize:14}}>Ask the AI Tutor about this</div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>Get more examples and explanations</div>
            </div>
          </div>
          <button onClick={()=>goTo("home")} style={{width:"100%",padding:"14px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#FCD34D,#F59E0B)",color:"#1e1b4b",fontWeight:900,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
            🎮 Practice this in a Mission →
          </button>
        </div>
        <BottomNav screen="learn" goTo={goTo}/>
      </div>
    );
  }

  return null;
}


// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING FLOW
// ═══════════════════════════════════════════════════════════════════════════════
function OnboardingScreen({onComplete}){
  const [step,setStep]=useState(0); // 0=role, 1=detail, 2=name
  const [role,setRole]=useState(null);
  const [answers,setAnswers]=useState({});
  const [name,setName]=useState("");

  const ROLES=[
    {id:"student", icon:"🎒", label:"Student",       desc:"I'm learning for fun or exams!", colour:"linear-gradient(135deg,#4F46E5,#7C3AED)"},
    {id:"parent",  icon:"👨‍👩‍👧", label:"Parent",        desc:"I'm helping my child practise",  colour:"linear-gradient(135deg,#059669,#047857)"},
    {id:"teacher", icon:"📚", label:"Teacher",       desc:"I'm using this in class",        colour:"linear-gradient(135deg,#D97706,#B45309)"},
    {id:"tutor",   icon:"🎓", label:"Tutor / Coach", desc:"I'm tutoring students",          colour:"linear-gradient(135deg,#DC2626,#991B1B)"},
  ];

  const YEAR_GROUPS=["Reception","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9"];

  function finish(){
    const ageGroup = resolveAgeGroup(role, answers);
    const profile = {role, answers, name:name||"Explorer", ageGroup, onboarded:true};
    Profile.save(profile);
    onComplete(profile);
  }

  // Step 0 — choose role
  if(step===0) return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1560)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <div style={{textAlign:"center",marginBottom:32,animation:"popIn 0.5s ease"}}>
        <div style={{fontSize:64,marginBottom:12}}>🎓</div>
        <h1 style={{color:"white",fontWeight:900,fontSize:28,margin:"0 0 8px"}}>Welcome to<br/>11+ Quest!</h1>
        <p style={{color:"rgba(255,255,255,0.55)",fontSize:15,margin:0}}>First, tell us who you are 👇</p>
      </div>
      <div style={{width:"100%",maxWidth:400,display:"flex",flexDirection:"column",gap:12}}>
        {ROLES.map(r=>(
          <button key={r.id} onClick={()=>{SFX.click();setRole(r.id);setStep(1);}}
            style={{background:r.colour,border:"none",borderRadius:20,padding:"18px 20px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,fontFamily:"inherit",boxShadow:"0 4px 20px rgba(0,0,0,0.4)",animation:"slideUp 0.3s ease"}}>
            <span style={{fontSize:36}}>{r.icon}</span>
            <div>
              <div style={{color:"white",fontWeight:900,fontSize:18}}>{r.label}</div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:13}}>{r.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 1 — role-specific details
  if(step===1) return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1560)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28,animation:"popIn 0.4s ease"}}>
          <div style={{fontSize:52,marginBottom:8}}>{ROLES.find(r=>r.id===role)?.icon}</div>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"0 0 6px"}}>
            {role==="student"&&"How old are you? 🎂"}
            {role==="parent"&&"How old is your child? 👧"}
            {(role==="teacher"||role==="tutor")&&"What year group? 📚"}
          </h2>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:13,margin:0}}>We'll pick the right content for you</p>
        </div>

        {role==="student"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[2,3,4,5,6,7,8,9,10,11,12].map(a=>(
              <button key={a} onClick={()=>{SFX.click();setAnswers({age:a});setStep(2);}}
                style={{background:answers.age===a?"#4F46E5":"rgba(255,255,255,0.1)",border:"2px solid "+(answers.age===a?"#4F46E5":"rgba(255,255,255,0.15)"),borderRadius:14,padding:"14px 8px",color:"white",fontWeight:800,fontSize:18,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                {a}
              </button>
            ))}
          </div>
        )}

        {role==="parent"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[2,3,4,5,6,7,8,9,10,11,12].map(a=>(
              <button key={a} onClick={()=>{SFX.click();setAnswers({childAge:a});setStep(2);}}
                style={{background:answers.childAge===a?"#059669":"rgba(255,255,255,0.1)",border:"2px solid "+(answers.childAge===a?"#059669":"rgba(255,255,255,0.15)"),borderRadius:14,padding:"14px 8px",color:"white",fontWeight:800,fontSize:18,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                {a}
              </button>
            ))}
          </div>
        )}

        {(role==="teacher"||role==="tutor")&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {YEAR_GROUPS.map(yg=>(
              <button key={yg} onClick={()=>{SFX.click();setAnswers({yearGroup:yg});setStep(2);}}
                style={{background:"rgba(255,255,255,0.08)",border:"2px solid rgba(255,255,255,0.15)",borderRadius:14,padding:"14px 18px",color:"white",fontWeight:700,fontSize:15,cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}}>
                📖 {yg} <span style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginLeft:8}}>{YEAR_GROUP_TO_AGE_GROUP[yg]&&"→ "+AGE_GROUPS.find(ag=>ag.id===YEAR_GROUP_TO_AGE_GROUP[yg])?.label}</span>
              </button>
            ))}
          </div>
        )}

        <button onClick={()=>setStep(0)} style={{marginTop:20,background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer",width:"100%",textAlign:"center",fontFamily:"inherit"}}>← Back</button>
      </div>
    </div>
  );

  // Step 2 — name (optional)
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1560)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <div style={{width:"100%",maxWidth:380,textAlign:"center",animation:"popIn 0.4s ease"}}>
        <div style={{fontSize:52,marginBottom:12}}>👋</div>
        <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"0 0 8px"}}>What shall we call you?</h2>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:13,margin:"0 0 24px"}}>Totally optional!</p>
        <input
          type="text"
          placeholder={role==="parent"?"Your child's name e.g. Sophie":"Your name e.g. Alex"}
          value={name}
          onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&finish()}
          maxLength={20}
          style={{width:"100%",padding:"16px 18px",borderRadius:16,border:"2px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.08)",color:"white",fontSize:16,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:16}}
        />
        <button onClick={finish}
          style={{width:"100%",padding:"16px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:900,fontSize:16,cursor:"pointer",fontFamily:"inherit",animation:"pulse 2s infinite"}}>
          Let's Go! 🚀
        </button>
        <button onClick={()=>setStep(1)} style={{marginTop:12,background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
      </div>
    </div>
  );
}

export default function App(){
  // ── Base44 SDK auth ─────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [subRecord, setSubRecord] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  // Load current user on mount
  useEffect(()=>{
    User.me().then(async u=>{
      setUser(u);
      if(u){ const sub = await loadSubStatus(u.id); setSubRecord(sub); }
    }).catch(()=>{ setUser(null); }).finally(()=>setAuthLoading(false));
  },[]);

  async function refreshSub(uid){
    setSubLoading(true);
    const sub = await loadSubStatus(uid||user?.id);
    setSubRecord(sub);
    setSubLoading(false);
  }

  function handleAuthSuccess(u){
    setUser(u);
    // Load subscription status
    loadSubStatus(u.id).then(sub=>setSubRecord(sub));
    // Load local progress keyed by user id
    const local = Progress.getLocal(u.id);
    setPlayer({xp:local.xp||0, coins:local.coins||0, streak:local.streak_days||0, last_practice:local.last_practice_date||"",
      completed_missions:local.completed_missions||[], badges:local.badges||[],
      daily_missions_done:local.daily_missions_done||0, daily_date:local.daily_date||"",
      mastery:local.mastery||{}, prestige:local.prestige||0,
      prestige_mult:getPrestigeMultiplier(local.prestige||0),
      weekly_progress:local.weekly_progress||{}, week_key:local.week_key||"",
      rival_bests:local.rival_bests||{}});
  }

  async function logout(){
    await User.logout();
    setUser(null);
    setSubRecord(null);
    setPlayer({xp:0,coins:0,streak:0,last_practice:"",completed_missions:[],badges:[],daily_missions_done:0,daily_date:""});
  }

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
  const [finalDisplayScore,setFinalDisplayScore]=useState(0);
  const [missionDone,setMissionDone]=useState(false);
  const [newTrick,setNewTrick]=useState(null);
  const [timeLeft,setTimeLeft]=useState(null);
  const [timerActive,setTimerActive]=useState(false);
  const [flashAnim,setFlashAnim]=useState(null);
  const timerRef=useRef(null);

  // Player
  const [profile,setProfile]=useState(()=>Profile.get());
  const [player,setPlayer]=useState({xp:0,coins:0,streak:0,last_practice:"",completed_missions:[],badges:[],daily_missions_done:0,daily_date:"",mastery:{},prestige:0,prestige_mult:1,weekly_progress:{},week_key:"",rival_bests:{}});
  const [visitorCount,setVisitorCount]=useState(null);

  const today=new Date().toISOString().split("T")[0];
  const {level:curLevel}=calcLevel(player.xp);
  const curRank=getRank(curLevel);
  const dailyChallenge=DAILY[new Date().getDay()];

  useEffect(()=>{
    const c = trackVisitorCount();
    if(c) setVisitorCount(c);
    // Load guest progress if not logged in
    const guestProgress = LS.get('q11_guest_progress', null);
    if(guestProgress){
      setPlayer(p=>({...p,
        xp:guestProgress.xp||0, coins:guestProgress.coins||0,
        streak:guestProgress.streak_days||0, last_practice:guestProgress.last_practice_date||"",
        completed_missions:guestProgress.completed_missions||[], badges:guestProgress.badges||[],
        daily_missions_done:guestProgress.daily_missions_done||0, daily_date:guestProgress.daily_date||"",
        mastery:guestProgress.mastery||{}, prestige:guestProgress.prestige||0,
        prestige_mult:getPrestigeMultiplier(guestProgress.prestige||0),
        weekly_progress:guestProgress.weekly_progress||{}, week_key:guestProgress.week_key||"",
        rival_bests:guestProgress.rival_bests||{}
      }));
    }
  },[]);

  // Progress is loaded in handleAuthSuccess after sign-in

  useEffect(()=>{
    if(timerActive&&timeLeft>0){timerRef.current=setTimeout(()=>setTimeLeft(t=>t-1),1000);}
    else if(timerActive&&timeLeft===0){setTimerActive(false);setMissionDone(true);}
    return()=>clearTimeout(timerRef.current);
  },[timerActive,timeLeft]);

  function isMissionUnlocked(world,mission){
    const idx=world.missions.indexOf(mission);
    if(idx===0)return true;
    return player.completed_missions.includes(world.missions[idx-1].id);
  }
  function isCompleted(id){return player.completed_missions.includes(id);}

  function startMission(mission,worldId){
    SFX.click();
    // Route toddler/early worlds to their qbank section
    const qbankKey = worldId.startsWith("t_")?"toddler":worldId.startsWith("e_")&&worldId!=="english"?"early":worldId;
    const pool=[...(QBANK[qbankKey]?.[mission.topic]||[])].sort(()=>Math.random()-0.5).slice(0,mission.questions);
    if(!pool.length)return;
    setActiveMission({...mission,_worldId:worldId});
    setMissionQs(pool);setQIdx(0);setSelected(null);setMissionScore(0);setFinalDisplayScore(0);setMissionDone(false);setNewTrick(null);setFlashAnim(null);
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

  function nextQ(){
    if(qIdx+1>=missionQs.length){
      setTimerActive(false);
      setMissionDone(true);
      // Pass final score explicitly — missionScore state may be stale on last question
      const lastWasCorrect = selected===missionQs[qIdx].answer;
      const finalScore = missionScore + (lastWasCorrect?1:0);
      setFinalDisplayScore(finalScore);
      saveResult(finalScore);
    }
    else{setQIdx(i=>i+1);setSelected(null);}
  }

  function saveResult(finalScore){
    const score = finalScore!==undefined ? finalScore : missionScore;
    const pct=Math.round((score/missionQs.length)*100);
    if(pct<70)return;
    try{
      const prev = {...player, xp:player.xp||0, coins:player.coins||0, streak_days:player.streak||0, last_practice_date:player.last_practice||'', completed_missions:player.completed_missions||[], badges:player.badges||[], daily_missions_done:player.daily_missions_done||0, daily_date:player.daily_date||''};
      const mult = getPrestigeMultiplier(prev.prestige||0);

      // ── Mastery update ─────────────────────────────────────────────────────
      const prevMastery = {...(player.mastery||{})};
      const mEntry = prevMastery[activeMission.id]||{};
      const curMasteryLevel = getMasteryLevel(activeMission.id, prevMastery);
      let newMasteryEntry = {...mEntry};
      let masteryXPBonus = 0;
      let masteryUpgrade = null;
      if(pct>=70 && !mEntry.bronze){newMasteryEntry.bronze=true; masteryXPBonus=30; masteryUpgrade=MASTERY_LEVELS[1];}
      if(pct>=80 && !mEntry.silver){newMasteryEntry.silver=true; masteryXPBonus=60; masteryUpgrade=MASTERY_LEVELS[2];}
      if(pct===100 && !mEntry.gold){newMasteryEntry.gold=true; masteryXPBonus=100; masteryUpgrade=MASTERY_LEVELS[3];}
      else if(pct===100 && mEntry.gold && !mEntry.platinum){newMasteryEntry.platinum=true; masteryXPBonus=200; masteryUpgrade=MASTERY_LEVELS[4];}
      prevMastery[activeMission.id]=newMasteryEntry;

      // ── Rival: save personal best ──────────────────────────────────────────
      const prevRivals = {...(player.rival_bests||{})};
      const prevBest = prevRivals[activeMission.id]||{pct:0,time:9999};
      const missionTime = activeMission.isBoss ? (activeMission.questions*25 - (timeLeft||0)) : null;
      if(pct>prevBest.pct||(pct===prevBest.pct&&missionTime&&missionTime<prevBest.time)){
        prevRivals[activeMission.id]={pct,time:missionTime,date:today};
      }

      // ── XP with multiplier ─────────────────────────────────────────────────
      const rawXP = activeMission.xp + masteryXPBonus;
      const earnedXP = Math.round(rawXP * mult);
      const earnedCoins = activeMission.coins;
      const newXP=(prev.xp||0)+earnedXP;
      const newCoins=(prev.coins||0)+earnedCoins;
      const prevCompleted=prev.completed_missions||[];
      const newCompleted=prevCompleted.includes(activeMission.id)?prevCompleted:[...prevCompleted,activeMission.id];

      // ── Streak ─────────────────────────────────────────────────────────────
      let streak=prev.streak_days||0;
      const yesterday=new Date(Date.now()-86400000).toISOString().split("T")[0];
      if(prev.last_practice_date===today){}else if(prev.last_practice_date===yesterday)streak++;else streak=1;
      let dd=prev.daily_missions_done||0,ddate=prev.daily_date||"";
      if(ddate!==today){dd=0;ddate=today;}dd++;

      // ── Weekly challenge progress ──────────────────────────────────────────
      const wc=getWeeklyChallenge();
      const weekNum=Math.floor(Date.now()/(7*24*60*60*1000)).toString();
      const prevWP={...(player.weekly_progress||{})};
      const prevWK=player.week_key||"";
      let wp=prevWK===weekNum?{...prevWP}:{count:0,done:false};
      if(!wp.done){
        if(wc.type==="perfect"&&pct===100)wp.count=(wp.count||0)+1;
        else if(wc.type==="boss"&&activeMission.isBoss)wp.count=(wp.count||0)+1;
        else if(wc.type==="missions")wp.count=(wp.count||0)+1;
        else if(wc.type==="mastery"&&masteryUpgrade&&(masteryUpgrade.id==="gold"||masteryUpgrade.id==="platinum"))wp.count=(wp.count||0)+1;
        else if(wc.type==="shadow"&&activeMission.id?.startsWith("sh_"))wp.count=(wp.count||0)+1;
        else if(wc.type==="streak"&&streak>=wc.target)wp.count=wc.target;
        else if(wc.type==="all_sub"){const subs=wp.subs||[];const wId=activeMission._worldId||"";if(!subs.includes(wId))wp.subs=[...subs,wId];wp.count=(wp.subs||[]).length;}
        if(wp.count>=wc.target&&!wp.done){
          wp.done=true;
          const bonusXP=Math.round(wc.xpBonus*mult);
          const finalXP=newXP+bonusXP;
          setTimeout(()=>setPopBadge({icon:wc.icon,name:"Weekly Complete! 🎉",desc:`+${bonusXP}XP bonus earned!`}),3000);
        }
      }

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
      // Prestige badges
      const prestigeCount=prev.prestige||0;
      PRESTIGE_BADGES.forEach(pb2=>{const n=parseInt(pb2.id.split("_")[1]);if(prestigeCount>=n&&!badges.includes(pb2.id))badges.push(pb2.id);});
      const earned=badges.filter(b=>!pb.includes(b));
      const BDEFS={first_quest:{icon:"🎯",name:"First Quest",desc:"Complete your first mission"},streak_3:{icon:"🔥",name:"On Fire",desc:"3-day streak"},streak_7:{icon:"💎",name:"Diamond",desc:"7-day streak"},perfect:{icon:"⭐",name:"Flawless",desc:"100% score"},boss_slayer:{icon:"👹",name:"Boss Slayer",desc:"Defeat a Boss"},level_5:{icon:"🚀",name:"Rising Star",desc:"Reach Level 5"},level_10:{icon:"👑",name:"Champion",desc:"Reach Level 10"},ten_missions:{icon:"💯",name:"Veteran",desc:"Complete 10 missions"}};
      if(earned.length>0){const b=BDEFS[earned[0]]||PRESTIGE_BADGES.find(x=>x.id===earned[0]);if(b)setTimeout(()=>setPopBadge(b),2800);}
      if(masteryUpgrade&&masteryUpgrade.id!=="none"){
        setTimeout(()=>setPopBadge({icon:masteryUpgrade.icon,name:`${masteryUpgrade.label} Star!`,desc:`${activeMission.name} — ${masteryUpgrade.label} mastery earned! +${masteryXPBonus}XP bonus`}),1500);
      }
      const data={xp:newXP,coins:newCoins,level:nl,streak_days:streak,last_practice_date:today,completed_missions:newCompleted,badges,daily_missions_done:dd,daily_date:ddate,mastery:prevMastery,prestige:prev.prestige||0,prestige_mult:mult,weekly_progress:wp,week_key:weekNum,rival_bests:prevRivals};
      if(user) Progress.saveLocal(user.id, data);
      else LS.set('q11_guest_progress', data);
      setPlayer(p=>({...p,xp:newXP,coins:newCoins,streak,last_practice:today,completed_missions:newCompleted,badges,daily_missions_done:dd,daily_date:ddate,mastery:prevMastery,weekly_progress:wp,week_key:weekNum,rival_bests:prevRivals}));
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
            {activeMission?.friendly&&q.vis&&(
              <div style={{textAlign:"center",background:"#F0F9FF",borderRadius:14,padding:"14px 10px",marginBottom:14,fontSize:q.vis.length<8?52:q.vis.length<16?36:22,lineHeight:1.4,letterSpacing:"3px",border:"2px solid #BAE6FD"}}>
                {q.vis}
              </div>
            )}
            <p style={{fontWeight:800,fontSize:activeMission?.friendly?19:18,color:"#111827",margin:"0 0 20px",lineHeight:1.5}}>{q.q}</p>
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
                    style={{padding:activeMission?.friendly?"18px 16px":"14px 16px",borderRadius:16,border,background:bg,color:col,fontWeight:700,fontSize:activeMission?.friendly?16:14,cursor:selected?"default":"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.2s",boxShadow:shadow}}>
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
      <MissionComplete mission={activeMission} score={finalDisplayScore} total={missionQs.length}
        xpEarned={Math.round((finalDisplayScore/missionQs.length)*100)>=70?activeMission?.xp:0}
        coinsEarned={Math.round((finalDisplayScore/missionQs.length)*100)>=70?activeMission?.coins:0}
        newTrick={newTrick} onContinue={()=>setScreen("map")} onRetry={()=>startMission(activeMission,activeMission._worldId)}/>
    </>
  );

  // ── WORLD DETAIL ───────────────────────────────────────────────────────────
  if(screen==="map"&&activeWorld){
    const world=activeWorld;
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
          {world.missions.map((mission,idx)=>{
            const unlocked=isMissionUnlocked(world,mission);
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
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{color:completed?"#FCD34D":unlocked?"white":"rgba(255,255,255,0.28)",fontWeight:800,fontSize:15}}>{mission.name}</div>
                        {(()=>{const ml=getMasteryLevel(mission.id,player.mastery);return ml.icon?<span style={{fontSize:13}} title={ml.label+" mastery"}>{ml.icon}</span>:null;})()}
                      </div>
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
          const world=[...WORLDS,...SHADOW_WORLDS].find(w=>w.id===trick.subject);
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


  // ── LEARN / AI TUTOR ────────────────────────────────────────────────────────
  if(screen==="learn")return <LearnScreen goTo={goTo} player={player}/>;

  // ── SCHOOLS ────────────────────────────────────────────────────────────────
  if(screen==="account"){
    const subPlanLabel = subRecord?.subscription==="trial"?"Free Trial":subRecord?.subscription==="monthly"?"Monthly (£1.99/mo)":subRecord?.subscription==="annual"?"Annual (£19.99/yr)":subRecord?.subscription==="promo"?"Promo Code (1 Month Free)":"No active plan";
    const subEndStr = subRecord?.subscription_end ? new Date(subRecord.subscription_end).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) : "—";
    return(
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63)"}}>
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
          <div style={{padding:"20px 0 10px"}}>
            <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:0}}>👤 My Account</h2>
          </div>
          <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"20px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:curRank.colour,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:"2px solid rgba(255,255,255,0.2)"}}>{curRank.icon}</div>
              <div>
                <div style={{color:"white",fontWeight:900,fontSize:17}}>{user?.full_name||user?.email?.split("@")[0]||"Explorer"}</div>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>{user?.email}</div>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:2}}>{curRank.title} · Level {curLevel}</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div style={{background:"rgba(255,255,255,0.06)",borderRadius:12,padding:"10px",textAlign:"center"}}>
                <div style={{color:"#FCD34D",fontWeight:900,fontSize:18}}>{player.xp||0}</div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,marginTop:2}}>XP</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.06)",borderRadius:12,padding:"10px",textAlign:"center"}}>
                <div style={{color:"#F97316",fontWeight:900,fontSize:18}}>{player.streak||0}</div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,marginTop:2}}>Day Streak 🔥</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.06)",borderRadius:12,padding:"10px",textAlign:"center"}}>
                <div style={{color:"#4ADE80",fontWeight:900,fontSize:18}}>{player.completed_missions?.length||0}</div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,marginTop:2}}>Missions Done</div>
              </div>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"20px",marginBottom:14}}>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>📋 Subscription</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>Plan</span>
              <span style={{color:"white",fontWeight:700,fontSize:13}}>{subPlanLabel}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>Access until</span>
              <span style={{color:"#4ADE80",fontWeight:700,fontSize:13}}>{subEndStr}</span>
            </div>
            <button onClick={()=>{setSubRecord(null);}} style={{width:"100%",padding:"12px",borderRadius:12,border:"1px solid rgba(99,102,241,0.4)",background:"rgba(79,70,229,0.15)",color:"#A78BFA",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              🔄 Change Plan / Renew
            </button>
          </div>
          {player.badges?.length>0&&(
            <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"20px",marginBottom:14}}>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>🏅 Badges ({player.badges.length})</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {player.badges.map(b=>{
                  const defs={first_quest:{icon:"🎯",name:"First Quest"},streak_3:{icon:"🔥",name:"On Fire"},streak_7:{icon:"💎",name:"Diamond"},perfect:{icon:"⭐",name:"Flawless"},boss_slayer:{icon:"👹",name:"Boss Slayer"},level_5:{icon:"🚀",name:"Rising Star"},level_10:{icon:"👑",name:"Champion"},ten_missions:{icon:"💯",name:"Veteran"}};
                  const bd=defs[b]||{icon:"🏅",name:b};
                  return <div key={b} style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"6px 10px",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:16}}>{bd.icon}</span><span style={{color:"rgba(255,255,255,0.75)",fontSize:11,fontWeight:700}}>{bd.name}</span></div>;
                })}
              </div>
            </div>
          )}
          <button onClick={logout} style={{width:"100%",padding:"14px",borderRadius:16,border:"1px solid rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.08)",color:"#FCA5A5",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
            🚪 Sign Out
          </button>
        </div>
        <BottomNav screen={screen} goTo={goTo}/>
      </div>
    );
  }

  if(screen==="schools")return <SchoolsScreen goTo={goTo}/>;



  // ── PRESTIGE SCREEN ───────────────────────────────────────────────────────
  if(screen==="prestige"){
    const allDone = getAllWorlds(player).every(w=>w.missions.every(m=>isCompleted(m.id)));
    const regularDone = WORLDS.every(w=>w.missions.every(m=>isCompleted(m.id)));
    const prestigeCount = player.prestige||0;
    const nextMult = getPrestigeMultiplier(prestigeCount+1);
    return(
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a003d,#3b0082)"}}>
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>
          <div style={{padding:"14px 0 8px",display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>goTo("home")} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"white",fontWeight:700,fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer"}}>← Back</button>
            <h2 style={{color:"white",fontWeight:900,fontSize:20,margin:0}}>🔁 Prestige Rebirth</h2>
          </div>
          <div style={{background:"rgba(255,255,255,0.07)",borderRadius:20,padding:"20px",marginBottom:16,textAlign:"center",border:"1px solid rgba(168,85,247,0.4)"}}>
            <div style={{fontSize:52,marginBottom:8}}>🌟</div>
            <h3 style={{color:"white",fontWeight:900,fontSize:22,margin:"0 0 8px"}}>Prestige {prestigeCount>0?`× ${prestigeCount}`:""}</h3>
            <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,margin:"0 0 16px"}}>
              Reset your missions and start fresh — but keep your XP, coins, badges, and tricks.
              All future XP is multiplied!
            </p>
            <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
              <div style={{background:"rgba(252,211,77,0.1)",border:"1px solid rgba(252,211,77,0.3)",borderRadius:14,padding:"12px 20px",textAlign:"center"}}>
                <div style={{color:"#FCD34D",fontWeight:900,fontSize:24}}>×{getPrestigeMultiplier(prestigeCount)}</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>Current XP mult</div>
              </div>
              <div style={{background:"rgba(168,85,247,0.15)",border:"1px solid rgba(168,85,247,0.4)",borderRadius:14,padding:"12px 20px",textAlign:"center"}}>
                <div style={{color:"#A855F7",fontWeight:900,fontSize:24}}>×{nextMult}</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>After prestige</div>
              </div>
            </div>
            <div style={{background:"rgba(0,0,0,0.3)",borderRadius:14,padding:"14px",marginBottom:16,textAlign:"left"}}>
              <div style={{color:"#4ADE80",fontWeight:800,fontSize:13,marginBottom:8}}>✅ You KEEP:</div>
              {["XP & Level","Coins","All Badges","All Tricks","Mastery stars"].map(x=><div key={x} style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginBottom:4}}>• {x}</div>)}
              <div style={{color:"#EF4444",fontWeight:800,fontSize:13,margin:"10px 0 8px"}}>🔄 RESET:</div>
              {["Mission completions (replay everything!)","Daily challenge progress","Weekly challenge progress"].map(x=><div key={x} style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:4}}>• {x}</div>)}
            </div>
            {!regularDone?(
              <div style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,padding:"12px",marginBottom:12}}>
                <div style={{color:"#EF4444",fontWeight:700,fontSize:13}}>🔒 Complete all regular worlds first!</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginTop:4}}>Finish every mission in all 10 worlds to unlock Prestige.</div>
              </div>
            ):(
              <button onClick={()=>{
                if(!window.confirm(`Prestige ${prestigeCount+1}? Your missions reset, but you keep XP, coins and badges. XP mult becomes ×${nextMult}!`)) return;
                const newPrestige = prestigeCount+1;
                const newMult = getPrestigeMultiplier(newPrestige);
                const badges=[...(player.badges||[])];
                PRESTIGE_BADGES.forEach(pb=>{const n=parseInt(pb.id.split("_")[1]);if(newPrestige>=n&&!badges.includes(pb.id))badges.push(pb.id);});
                const newPlayer={...player,completed_missions:[],daily_missions_done:0,daily_date:"",weekly_progress:{},week_key:"",prestige:newPrestige,prestige_mult:newMult,badges};
                setPlayer(newPlayer);
                if(user){const d={...newPlayer,streak_days:newPlayer.streak,last_practice_date:newPlayer.last_practice};Progress.saveLocal(user.id,d);}else{LS.set('q11_guest_progress',{...newPlayer,streak_days:newPlayer.streak,last_practice_date:newPlayer.last_practice});}
                SFX.levelup();
                setTimeout(()=>setPopBadge({icon:"🔁",name:`Prestige ${newPrestige}!`,desc:`×${newMult} XP multiplier active — you legend.`}),500);
                goTo("home");
              }} style={{width:"100%",padding:"16px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#7C3AED,#A855F7)",color:"white",fontWeight:900,fontSize:16,cursor:"pointer",fontFamily:"inherit",animation:"pulse 2s infinite"}}>
                🔁 PRESTIGE NOW → ×{nextMult} XP
              </button>
            )}
          </div>
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:"16px"}}>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"1px"}}>Prestige History</div>
            {prestigeCount===0
              ? <div style={{color:"rgba(255,255,255,0.3)",fontSize:13,textAlign:"center"}}>No prestiges yet. Complete all worlds!</div>
              : Array.from({length:prestigeCount}).map((_,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize:22}}>🔁</span>
                  <div>
                    <div style={{color:"white",fontWeight:700,fontSize:14}}>Prestige {i+1}</div>
                    <div style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>×{getPrestigeMultiplier(i+1)} XP multiplier</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <BottomNav screen={screen} goTo={goTo}/>
      </div>
    );
  }


  // ── AUTH GATE: require login ─────────────────────────────────────────────────
  if(authLoading || subLoading){
    return(
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:12,animation:"pulse 1s infinite"}}>🎓</div>
          <div style={{color:"white",fontWeight:700,fontSize:16}}>Loading...</div>
        </div>
      </div>
    );
  }

  // Must be logged in
  if(!user){
    return(
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)"}}>
        <AuthModal onClose={()=>{}} onAuthSuccess={handleAuthSuccess} canClose={false}/>
      </div>
    );
  }

  // Must have active subscription
  if(!isSubActive(subRecord)){
    return(
      <SubscriptionScreen
        user={user}
        subRecord={subRecord}
        onActivated={()=>refreshSub(user.id)}
        onLogout={logout}
      />
    );
  }

  // ── HOME ───────────────────────────────────────────────────────────────────
  const isYoungMode = profile?.ageGroup==="toddler"||profile?.ageGroup==="early";
  const homeBg = isYoungMode
    ? "linear-gradient(180deg,#0d4f8c 0%,#1a6bb5 40%,#0f3460 100%)"
    : "linear-gradient(180deg,#0f0c29 0%,#1a1560 45%,#0f0c29 100%)";

  return(
    <div style={{minHeight:"100vh",background:homeBg}}>
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuthSuccess={handleAuthSuccess}/>}
      {popBadge&&<BadgePop badge={popBadge} onClose={()=>setPopBadge(null)}/>}

      {/* Top bar */}
      <div style={{position:"sticky",top:0,zIndex:100,background:isYoungMode?"rgba(10,50,100,0.96)":"rgba(15,12,41,0.96)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(255,255,255,0.1)",padding:"10px 16px"}}>
        <div style={{maxWidth:520,margin:"0 auto",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:isYoungMode?28:22}}>{isYoungMode?"🌈":"🎓"}</span>
          <div style={{flex:1}}><XPBar xp={player.xp}/></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{background:"rgba(252,211,77,0.15)",border:"1px solid rgba(252,211,77,0.35)",borderRadius:10,padding:"4px 9px",fontSize:isYoungMode?13:12,fontWeight:800,color:"#FCD34D"}}>🪙{player.coins}</div>
            <div style={{background:"rgba(249,115,22,0.15)",border:"1px solid rgba(249,115,22,0.35)",borderRadius:10,padding:"4px 9px",fontSize:isYoungMode?13:12,fontWeight:800,color:"#F97316"}}>🔥{player.streak}</div>
              <div onClick={()=>goTo("progress")} title="My Progress" style={{width:33,height:33,borderRadius:"50%",background:curRank.colour,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,border:"2px solid rgba(255,255,255,0.25)"}}>{curRank.icon}</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"14px 16px 100px"}}>

        {/* Welcome Hero — role-aware */}
        {(()=>{
          const pName = profile?.name||(user?.full_name?.split(" ")[0])||"Explorer";
          const role = profile?.role||"student";
          const ag = AGE_GROUPS.find(a=>a.id===(profile?.ageGroup||"core"))||AGE_GROUPS[2];
          const greetings = {
            student: `Hey ${pName}! Ready to play? 🎮`,
            parent:  `Hi ${pName}! ${pName}'s learning is waiting! 📚`,
            teacher: `Welcome back! Your class awaits 🍎`,
            tutor:   `Hi ${pName}! Ready to teach? 🎓`,
          };
          return(
            <div style={{textAlign:"center",marginBottom:16,padding:"20px 16px",background:"rgba(255,255,255,0.06)",borderRadius:24,border:"1px solid rgba(255,255,255,0.1)",animation:"slideUp 0.4s ease"}}>
              {isYoungMode?(
                <>
                  <div style={{fontSize:56,marginBottom:8,animation:"worldFloat 3s infinite"}}>
                    {profile?.ageGroup==="toddler"?"🐣":"🌈"}
                  </div>
                  <div style={{color:"white",fontWeight:900,fontSize:24,marginBottom:4}}>
                    Hello {pName}! 👋
                  </div>
                  <div style={{color:"rgba(255,255,255,0.7)",fontSize:15,marginBottom:10}}>
                    Let's learn and play today! 🎉
                  </div>
                </>
              ):(
                <>
                  <div style={{color:"white",fontWeight:900,fontSize:20,marginBottom:4}}>
                    {greetings[role]||greetings.student}
                  </div>
                  <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
                    <span style={{background:"rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 12px",fontSize:12,color:"rgba(255,255,255,0.7)"}}>
                      {ag.icon} {ag.label}
                    </span>
                    <span style={{background:"rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 12px",fontSize:12,color:"rgba(255,255,255,0.7)"}}>
                      👥 {visitorCount??"..."} explorers
                    </span>
                    <span style={{background:"rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 12px",fontSize:12,color:"rgba(255,255,255,0.7)"}}>
                      {curRank.icon} {curRank.title}
                    </span>
                  </div>
                </>
              )}
              {/* Suggested next world */}
              {(()=>{
                const myGroup = profile?.ageGroup||"core";
                const suggestedWorld = getAllWorlds(player).find(w=>w.ageGroup===myGroup&&w.missions.some(m=>!isCompleted(m.id)));
                if(!suggestedWorld)return null;
                const nextM = suggestedWorld.missions.find(m=>!isCompleted(m.id)&&isMissionUnlocked(suggestedWorld,m));
                if(!nextM)return null;
                return(
                  <button onClick={()=>{SFX.click();setActiveWorld(suggestedWorld);setScreen("map");}}
                    style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)",border:"none",borderRadius:16,padding:"12px 20px",color:"white",fontWeight:800,fontSize:isYoungMode?17:15,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(79,70,229,0.4)",animation:"pulse 3s infinite"}}>
                    {isYoungMode?"▶ Play Now! 🎮":`▶ Continue: ${nextM.name}`}
                  </button>
                );
              })()}
              <button onClick={()=>{Profile.clear();setProfile(null);}} style={{marginTop:10,display:"block",background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:11,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>
                Change profile
              </button>
            </div>
          );
        })()}

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

        {/* Weekly Challenge */}
        {(()=>{
          const wc=getWeeklyChallenge();
          const weekNum=Math.floor(Date.now()/(7*24*60*60*1000)).toString();
          const wp=player.week_key===weekNum?player.weekly_progress:{count:0,done:false};
          const prog=Math.min(wp.count||0,wc.target);
          const pct=Math.round((prog/wc.target)*100);
          return(
            <div style={{background:"linear-gradient(135deg,rgba(99,102,241,0.14),rgba(168,85,247,0.14))",border:"1px solid rgba(99,102,241,0.28)",borderRadius:18,padding:"14px 16px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{color:"#A78BFA",fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>📅 Weekly Challenge</div>
                  <div style={{color:"white",fontWeight:800,fontSize:15}}>{wc.icon} {wc.name}</div>
                  <div style={{color:"rgba(255,255,255,0.55)",fontSize:12,marginTop:2}}>{wc.desc}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                  <div style={{color:"#A78BFA",fontWeight:900,fontSize:15}}>+{wc.xpBonus}XP</div>
                  {wp.done&&<div style={{color:"#4ADE80",fontSize:11,fontWeight:700,marginTop:2}}>✅ Done!</div>}
                </div>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.12)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#A78BFA,#7C3AED)",borderRadius:3,transition:"width 0.8s"}}/>
              </div>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:4}}>{prog}/{wc.target}</div>
            </div>
          );
        })()}

        {/* Prestige CTA — only show when all worlds done */}
        {WORLDS.every(w=>w.missions.every(m=>isCompleted(m.id)))&&(
          <div onClick={()=>goTo("prestige")} style={{background:"linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.2))",border:"1px solid rgba(168,85,247,0.5)",borderRadius:18,padding:"14px 16px",marginBottom:16,cursor:"pointer",animation:"pulse 3s infinite"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:36}}>🔁</span>
              <div style={{flex:1}}>
                <div style={{color:"#A855F7",fontWeight:900,fontSize:14}}>🌟 PRESTIGE AVAILABLE!</div>
                <div style={{color:"white",fontWeight:700,fontSize:15}}>You've conquered all worlds!</div>
                <div style={{color:"rgba(255,255,255,0.55)",fontSize:12}}>Prestige → reset missions, keep XP, earn ×{getPrestigeMultiplier((player.prestige||0)+1)} XP multiplier</div>
              </div>
              <span style={{color:"#A855F7",fontSize:20}}>→</span>
            </div>
          </div>
        )}

        {/* Adventure Map */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{color:"white",fontWeight:900,fontSize:18}}>🗺 Adventure Map</div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {user&&<span style={{padding:"4px 10px",borderRadius:16,background:"rgba(79,70,229,0.3)",border:"1px solid rgba(99,102,241,0.3)",color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:700}}>{subRecord?.subscription==="trial"?"🆓 Trial":subRecord?.subscription==="annual"?"🏆 Annual":subRecord?.subscription==="promo"?"🎟 Promo":"✅ Active"}</span>}
          </div>
        </div>

        {AGE_GROUPS.map(ag=>{
          const shadowLocked = ag.isShadow && !WORLDS.every(w=>w.missions.every(m=>isCompleted(m.id)));
          const groupWorlds = getAllWorlds(player).filter(w=>w.ageGroup===ag.id);
          const isMyGroup = ag.id===(profile?.ageGroup||"core");
          return(
            <div key={ag.id} style={{marginBottom:24}}>
              {/* Age group header */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${isMyGroup?"rgba(252,211,77,0.3)":"rgba(255,255,255,0.1)"}`}}>
                <span style={{fontSize:isMyGroup?26:20}}>{ag.icon}</span>
                <div>
                  <div style={{color:isMyGroup?"#FCD34D":"white",fontWeight:900,fontSize:isMyGroup?17:15}}>{ag.label}{isMyGroup?" ← Your level":""}</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{ag.desc}</div>
                </div>
                <div style={{marginLeft:"auto",background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"3px 10px"}}>
                  {ag.isShadow && shadowLocked
                    ? <span style={{color:"#EF4444",fontSize:11}}>🔒 Complete all worlds first</span>
                    : <span style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{groupWorlds.length} worlds</span>}
                </div>
              </div>
              {/* World cards for this age group */}
              {groupWorlds.map((world,i)=>{
                const done=world.missions.filter(m=>isCompleted(m.id)).length;
                const total=world.missions.length;
                const pct=Math.round((done/total)*100);
                const next=world.missions.find(m=>!isCompleted(m.id)&&isMissionUnlocked(world,m));
                return(
                  <div key={world.id} onClick={()=>{SFX.click();setActiveWorld(world);setScreen("map");}}
                    style={{background:world.gradient,borderRadius:20,padding:"16px 18px",marginBottom:10,cursor:"pointer",boxShadow:"0 6px 24px rgba(0,0,0,0.35)",animation:`slideUp ${0.1+i*0.06}s ease`,position:"relative"}}>
                    {world.free&&<div style={{position:"absolute",top:10,right:12,background:"rgba(74,222,128,0.25)",border:"1px solid rgba(74,222,128,0.5)",borderRadius:8,padding:"2px 8px",fontSize:10,fontWeight:800,color:"#4ADE80"}}>✅ FREE</div>}
                    <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                      <div style={{fontSize:world.ageGroup==="toddler"||world.ageGroup==="early"?52:38,lineHeight:1,flexShrink:0,animation:"worldFloat 4s infinite"}}>{world.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:2}}>
                          <div style={{color:"white",fontWeight:900,fontSize:16}}>{world.name}</div>
                          {done===total&&<div style={{color:"#FCD34D",fontSize:11,fontWeight:800,flexShrink:0,marginLeft:8}}>⭐ DONE!</div>}
                        </div>
                        <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,marginBottom:8}}>{world.desc}</div>
                        <div style={{height:5,background:"rgba(255,255,255,0.2)",borderRadius:3,overflow:"hidden",marginBottom:4}}>
                          <div style={{height:"100%",width:`${pct}%`,background:"rgba(255,255,255,0.85)",borderRadius:3,transition:"width 1.2s"}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{color:"rgba(255,255,255,0.55)",fontSize:11}}>{done}/{total} missions</span>
                          {next&&<span style={{background:"rgba(0,0,0,0.2)",color:"white",fontWeight:700,fontSize:10,borderRadius:8,padding:"2px 7px"}}>▶ {next.name}</span>}
                          {done===total&&<span style={{color:"#FCD34D",fontSize:11,fontWeight:800}}>Boss slain ⚔️</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <BottomNav screen={screen} goTo={goTo}/>
    </div>
  );
}
