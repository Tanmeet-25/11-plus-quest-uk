import { useState, useEffect, useRef } from "react";
import { UserProgress, QuizSession, Leaderboard, VisitorCount } from "../api/entities";
import { useAppContext } from "../api/app-context";

// ─── BADGES ───────────────────────────────────────────────────────────────────
const BADGES = [
  { id:"first_quiz",    icon:"🎯", name:"First Steps",        desc:"Complete your first quiz",              xp:10  },
  { id:"streak_3",      icon:"🔥", name:"On Fire",            desc:"3-day practice streak",                 xp:30  },
  { id:"streak_7",      icon:"💎", name:"Diamond Streak",     desc:"7-day practice streak",                 xp:100 },
  { id:"streak_14",     icon:"🌟", name:"Fortnight Force",    desc:"14-day practice streak",                xp:200 },
  { id:"streak_30",     icon:"👑", name:"Month Master",       desc:"30-day practice streak",                xp:500 },
  { id:"perfect_10",    icon:"⭐", name:"Perfect 10",         desc:"Score 100% on a 10-question quiz",      xp:50  },
  { id:"perfect_hard",  icon:"💥", name:"Flawless Hard",      desc:"Score 100% on a Hard quiz",             xp:120 },
  { id:"century",       icon:"💯", name:"Century",            desc:"Answer 100 questions total",            xp:75  },
  { id:"five_hundred",  icon:"🚀", name:"500 Club",           desc:"Answer 500 questions total",            xp:200 },
  { id:"maths_master",  icon:"🔢", name:"Maths Master",       desc:"Score 80%+ on 5 maths quizzes",         xp:60  },
  { id:"verbal_ace",    icon:"📖", name:"Verbal Ace",         desc:"Score 80%+ on 5 verbal quizzes",        xp:60  },
  { id:"nvr_ninja",     icon:"🔷", name:"NVR Ninja",          desc:"Score 80%+ on 5 NVR quizzes",           xp:60  },
  { id:"english_star",  icon:"✍️", name:"English Star",       desc:"Score 80%+ on 5 English quizzes",       xp:60  },
  { id:"all_rounder",   icon:"🌈", name:"All Rounder",        desc:"Complete a quiz in all 4 subjects",     xp:80  },
  { id:"hard_mode",     icon:"🏆", name:"Hard Mode Hero",     desc:"Complete a Hard difficulty quiz",        xp:80  },
  { id:"level_5",       icon:"🚀", name:"Rising Star",        desc:"Reach Level 5",                         xp:0   },
  { id:"level_10",      icon:"👑", name:"Grammar Champion",   desc:"Reach Level 10",                        xp:0   },
  { id:"early_bird",    icon:"🌅", name:"Early Bird",         desc:"Practice before 8am",                   xp:25  },
  { id:"night_owl",     icon:"🦉", name:"Night Owl",          desc:"Practice after 9pm",                    xp:25  },
];

// ─── XP & LEVELS ─────────────────────────────────────────────────────────────
function xpForLevel(lvl) { return lvl * 100; }
function calcLevel(xp) {
  let l=1, x=xp;
  while(x>=xpForLevel(l)){x-=xpForLevel(l);l++;}
  return {level:l,xpInLevel:x,xpNeeded:xpForLevel(l)};
}

// ─── SUBJECT CONFIG ───────────────────────────────────────────────────────────
const SUBJECT_LABELS  = { maths:"🔢 Maths", english:"✍️ English", verbal:"📖 Verbal Reasoning", nvr:"🔷 Non-Verbal Reasoning" };
const SUBJECT_COLOURS = { maths:"#4F46E5", english:"#059669", verbal:"#D97706", nvr:"#DC2626" };
const SUBJECT_BG      = { maths:"#EEF2FF", english:"#ECFDF5", verbal:"#FFFBEB", nvr:"#FEF2F2" };
const DIFF_COLOURS    = { easy:"#059669", medium:"#D97706", hard:"#DC2626" };
const DIFF_XP         = { easy:5, medium:10, hard:20 };

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
const QUESTIONS = {
  maths:{
    easy:[
      {q:"What is 6 × 7?",         options:["36","42","48","54"],      answer:"42",   topic:"Times Tables",  explanation:"6 × 7 = 42. One of the trickiest tables — practise it daily!"},
      {q:"What is ½ of 40?",        options:["10","15","20","25"],      answer:"20",   topic:"Fractions",     explanation:"Half of 40 = 40 ÷ 2 = 20."},
      {q:"What is 10% of 80?",      options:["4","8","10","16"],        answer:"8",    topic:"Percentages",   explanation:"10% = divide by 10. 80 ÷ 10 = 8."},
      {q:"What is 25 + 37?",        options:["52","62","63","72"],      answer:"62",   topic:"Addition",      explanation:"25+37: 20+30=50, 5+7=12, 50+12=62."},
      {q:"What is 9 × 3?",          options:["21","24","27","30"],      answer:"27",   topic:"Times Tables",  explanation:"9×3=27. Tip: 10×3=30, minus 3=27."},
      {q:"Sides on a pentagon?",    options:["4","5","6","7"],          answer:"5",    topic:"Shapes",        explanation:"Penta=5. Pentagon=5 sides."},
      {q:"What is 100 − 37?",       options:["53","63","73","83"],      answer:"63",   topic:"Subtraction",   explanation:"Count up from 37: +3=40, +60=100 → total 63."},
      {q:"What is ¼ of 20?",        options:["4","5","8","10"],         answer:"5",    topic:"Fractions",     explanation:"¼ of 20 = 20 ÷ 4 = 5."},
      {q:"What is 8 × 6?",          options:["42","46","48","52"],      answer:"48",   topic:"Times Tables",  explanation:"8×6=48. Or 8×5=40, +8=48."},
      {q:"Perimeter of 5cm×3cm?",   options:["8cm","13cm","15cm","16cm"], answer:"16cm", topic:"Geometry",  explanation:"Perimeter=2×(5+3)=2×8=16cm."},
    ],
    medium:[
      {q:"What is 7 × 8?",          options:["54","56","63","48"],      answer:"56",   topic:"Times Tables",  explanation:"5,6,7,8 → 56=7×8! Sing it."},
      {q:"What is ¾ of 40?",        options:["20","25","30","35"],      answer:"30",   topic:"Fractions",     explanation:"¼ of 40=10. ¾=3×10=30."},
      {q:"What is 25% of 80?",      options:["16","20","25","40"],      answer:"20",   topic:"Percentages",   explanation:"25%=¼. 80÷4=20."},
      {q:"Ratio 2:3 of £30. Larger share?", options:["£10","£12","£15","£18"], answer:"£18", topic:"Ratio", explanation:"5 parts. £6 each. 3×£6=£18."},
      {q:"If x + 5 = 12, x = ?",    options:["5","6","7","8"],          answer:"7",    topic:"Algebra",       explanation:"x=12−5=7."},
      {q:"Area of 8cm × 5cm rect?", options:["13cm²","26cm²","40cm²","80cm²"], answer:"40cm²", topic:"Geometry", explanation:"Area=length×width=8×5=40cm²."},
      {q:"What is 9 × 12?",         options:["99","108","116","98"],    answer:"108",  topic:"Times Tables",  explanation:"10×12=120, subtract 12=108."},
      {q:"Simplify 8/12.",          options:["4/8","2/3","3/4","1/2"],  answer:"2/3",  topic:"Fractions",     explanation:"HCF=4. 8÷4=2, 12÷4=3 → 2/3."},
      {q:"Train: 09:15→11:45. Duration?", options:["1h30m","2h","2h30m","3h"], answer:"2h30m", topic:"Time", explanation:"09:15→11:15=2h, +30min=2h30m."},
      {q:"What is 10% of 350?",     options:["3.5","25","35","50"],     answer:"35",   topic:"Percentages",   explanation:"350÷10=35."},
    ],
    hard:[
      {q:"Sum of 3 consecutive numbers = 63. Smallest?", options:["19","20","21","22"], answer:"20", topic:"Algebra", explanation:"n+(n+1)+(n+2)=63 → 3n+3=63 → n=20."},
      {q:"£80 jacket, 35% off. Sale price?", options:["£44","£48","£52","£56"], answer:"£52", topic:"Percentages", explanation:"35% of £80=£28. £80−£28=£52."},
      {q:"OJ:lemonade=2:5. Total 350ml. Lemonade?", options:["100ml","150ml","200ml","250ml"], answer:"250ml", topic:"Ratio", explanation:"7 parts. 350÷7=50ml. 5×50=250ml."},
      {q:"nth term of 5,8,11,14...?", options:["n+4","2n+3","3n+2","4n+1"], answer:"3n+2", topic:"Sequences", explanation:"Difference=3. n=1: 3+2=5 ✓"},
      {q:"¾ of a number = 36. Number?", options:["24","27","48","54"],   answer:"48",   topic:"Fractions",     explanation:"¾=36 → ¼=12 → whole=48."},
      {q:"£40→£50. % increase?",    options:["10%","20%","25%","30%"],  answer:"25%",  topic:"Percentages",   explanation:"Change=£10. (10÷40)×100=25%."},
      {q:"Squares (all sizes) in 3×3 grid?", options:["9","12","14","16"], answer:"14", topic:"Shapes",        explanation:"9(1×1)+4(2×2)+1(3×3)=14."},
    ],
  },
  english:{
    easy:[
      {q:"Which sentence uses the correct punctuation?", options:["Its raining outside.","It's raining outside.","Its' raining outside.","Its raining, outside."], answer:"It's raining outside.", topic:"Punctuation", explanation:"'It's' is a contraction of 'it is'. Use an apostrophe to show where the letters are missing."},
      {q:"What type of word is 'quickly'?", options:["Noun","Verb","Adjective","Adverb"], answer:"Adverb", topic:"Grammar", explanation:"Adverbs describe how something is done. 'Quickly' describes how you do an action."},
      {q:"Which is the correct plural of 'child'?", options:["Childs","Childes","Children","Childrens"], answer:"Children", topic:"Spelling", explanation:"'Children' is an irregular plural — it doesn't follow the usual -s rule."},
      {q:"What does the prefix 'un-' mean?", options:["Again","Not","Before","After"], answer:"Not", topic:"Vocabulary", explanation:"'Un-' means not. Unhappy=not happy, unkind=not kind."},
      {q:"Which word is a synonym of 'brave'?", options:["Cowardly","Fearful","Courageous","Timid"], answer:"Courageous", topic:"Synonyms", explanation:"Courageous means showing bravery — it's a synonym of brave."},
      {q:"What is a simile?", options:["A describing word","A comparison using 'like' or 'as'","A word that sounds like its meaning","A type of verb"], answer:"A comparison using 'like' or 'as'", topic:"Literacy", explanation:"Similes compare two things using 'like' or 'as'. E.g. 'as fast as lightning'."},
      {q:"Which word is a noun?", options:["Run","Beautiful","Happiness","Quickly"], answer:"Happiness", topic:"Grammar", explanation:"Nouns are naming words — things, people, places, feelings. 'Happiness' is a noun."},
      {q:"Correct spelling?", options:["Seperate","Separate","Seperate","Separete"], answer:"Separate", topic:"Spelling", explanation:"SEParate — remember: there's 'a rat' in separate!"},
    ],
    medium:[
      {q:"What is an oxymoron?", options:["A figure of speech using contradictory terms","A type of poem","A word with the same spelling but different meaning","A comparison without 'like'"], answer:"A figure of speech using contradictory terms", topic:"Literacy", explanation:"Oxymorons combine opposites for effect: 'deafening silence', 'bittersweet'."},
      {q:"Which sentence is in the passive voice?", options:["The dog chased the cat.","The cat was chased by the dog.","The dog is chasing.","A dog chases cats."], answer:"The cat was chased by the dog.", topic:"Grammar", explanation:"In passive voice, the subject receives the action. 'Was chased' tells us the cat had something done to it."},
      {q:"What does 'ambiguous' mean?", options:["Completely clear","Open to more than one meaning","Extremely difficult","Very long"], answer:"Open to more than one meaning", topic:"Vocabulary", explanation:"Ambiguous means unclear — it could be interpreted in more than one way."},
      {q:"Which literary device is used in: 'The thunder roared'?", options:["Simile","Metaphor","Personification","Alliteration"], answer:"Personification", topic:"Literacy", explanation:"Personification gives human qualities to non-human things. Thunder can't actually roar."},
      {q:"What is the root of 'transportation'?", options:["Trans","Port","Ation","Sport"], answer:"Port", topic:"Vocabulary", explanation:"'Port' (Latin: portare) means to carry. Transport = carry across."},
      {q:"Correct sentence?", options:["Me and him went to the shop.","Him and me went to the shop.","He and I went to the shop.","I and him went to the shop."], answer:"He and I went to the shop.", topic:"Grammar", explanation:"Use 'he' and 'I' when they are the subject of the sentence."},
      {q:"What type of clause is 'which was broken'?", options:["Main clause","Subordinate clause","Noun clause","Adverbial clause"], answer:"Subordinate clause", topic:"Grammar", explanation:"A subordinate clause cannot stand alone — it depends on a main clause to make sense."},
    ],
    hard:[
      {q:"What is the effect of starting sentences with 'But' or 'And'?", options:["It is always incorrect","It creates emphasis and informal tone","It makes writing more formal","It is only used in poetry"], answer:"It creates emphasis and informal tone", topic:"Literacy", explanation:"Starting with 'But' or 'And' can create emphasis and a conversational feel — a deliberate stylistic choice."},
      {q:"'The soldier was like a lion in battle.' This is a:", options:["Metaphor","Simile","Hyperbole","Personification"], answer:"Simile", topic:"Literacy", explanation:"This uses 'like' to compare — making it a simile, not a metaphor."},
      {q:"What does 'pedantic' mean?", options:["Rude and arrogant","Overly concerned with minor details","Extremely creative","Very lazy"], answer:"Overly concerned with minor details", topic:"Vocabulary", explanation:"A pedantic person focuses excessively on small, unimportant rules or details."},
      {q:"Which word best completes: 'Despite being _____, she smiled.'?", options:["joyful","ecstatic","exhausted","energetic"], answer:"exhausted", topic:"Comprehension", explanation:"'Despite' signals a contrast. Smiling despite being exhausted creates a meaningful contrast."},
      {q:"What is the tone of: 'The empty street echoed with silence'?", options:["Joyful","Mysterious/melancholic","Angry","Humorous"], answer:"Mysterious/melancholic", topic:"Literacy", explanation:"'Empty', 'echoed', and 'silence' all create a lonely, atmospheric tone."},
    ],
  },
  verbal:{
    easy:[
      {q:"Which word means the same as HAPPY?",       options:["Sad","Joyful","Angry","Tired"],          answer:"Joyful",   topic:"Synonyms",    explanation:"Joyful = very happy. Synonyms have the same meaning."},
      {q:"Opposite of BIG?",                          options:["Large","Huge","Small","Wide"],           answer:"Small",    topic:"Antonyms",    explanation:"Big and small are opposites (antonyms)."},
      {q:"Dog : Puppy :: Cat : ___",                  options:["Kitten","Cub","Foal","Lamb"],            answer:"Kitten",   topic:"Analogies",   explanation:"Puppy=baby dog. Kitten=baby cat."},
      {q:"Odd one out: Robin, Sparrow, Penguin, Eagle",options:["Robin","Sparrow","Penguin","Eagle"],    answer:"Penguin",  topic:"Odd One Out", explanation:"Robin, Sparrow, Eagle fly. Penguins cannot!"},
      {q:"Correctly spelled?",                        options:["Recieve","Achieve","Beleive","Freind"],  answer:"Achieve",  topic:"Spelling",    explanation:"i before e except after c. Achieve ✓"},
      {q:"Next: A, C, E, G, ___",                     options:["H","I","J","K"],                        answer:"I",        topic:"Sequences",   explanation:"Skip one letter: A(B)C(D)E(F)G(H)I."},
      {q:"Which word means the same as SAD?",         options:["Gleeful","Mournful","Cheerful","Elated"], answer:"Mournful", topic:"Synonyms",   explanation:"Mournful means full of sorrow — a synonym for sad."},
    ],
    medium:[
      {q:"Opposite of ANCIENT?",                     options:["Old","Historic","Modern","Aged"],         answer:"Modern",   topic:"Antonyms",    explanation:"Ancient=very old. Opposite=modern."},
      {q:"If CAT=DBU, what is DOG?",                  options:["CPH","EPH","ENH","EPI"],                answer:"EPH",      topic:"Codes",       explanation:"+1 each letter: D→E, O→P, G→H=EPH."},
      {q:"Book : Library :: Painting : ___",          options:["School","Gallery","Museum","Theatre"],   answer:"Gallery",  topic:"Analogies",   explanation:"Books in library. Paintings in gallery."},
      {q:"Next: Z, X, V, T, ___",                     options:["P","Q","R","S"],                        answer:"R",        topic:"Sequences",   explanation:"Backwards, skip one: Z(Y)X(W)V(U)T(S)R."},
      {q:"Odd one out: Triangle, Circle, Square, Pyramid",options:["Triangle","Circle","Square","Pyramid"],answer:"Pyramid",topic:"Odd One Out", explanation:"Triangle/Circle/Square=2D. Pyramid=3D."},
      {q:"Synonym of ENORMOUS?",                      options:["Tiny","Average","Huge","Narrow"],        answer:"Huge",     topic:"Synonyms",    explanation:"Enormous=very large=huge."},
      {q:"If A=1,B=2... what does 2-5-4 spell?",     options:["BED","CAT","ACE","BAD"],                 answer:"BED",      topic:"Codes",       explanation:"B=2, E=5, D=4 → BED."},
    ],
    hard:[
      {q:"Most similar to METICULOUS?",               options:["Careless","Precise","Hasty","Vague"],    answer:"Precise",  topic:"Synonyms",    explanation:"Meticulous=very careful and precise."},
      {q:"Antonym of BENEVOLENT?",                    options:["Kind","Generous","Malevolent","Brave"],  answer:"Malevolent",topic:"Antonyms",   explanation:"Benevolent=good/kind. Malevolent=evil/wishing harm."},
      {q:"Next: A, D, G, J, ___",                     options:["K","L","M","N"],                        answer:"M",        topic:"Sequences",   explanation:"+3 positions: A→D→G→J→M."},
      {q:"Scalpel : Surgeon :: Gavel : ___",          options:["Builder","Judge","Teacher","Artist"],    answer:"Judge",    topic:"Analogies",   explanation:"A scalpel is a surgeon's tool. A gavel is a judge's tool."},
      {q:"Antonym of TRANSPARENT?",                   options:["Clear","Bright","Opaque","Shiny"],       answer:"Opaque",   topic:"Antonyms",    explanation:"Transparent=see-through. Opaque=cannot see through."},
    ],
  },
  nvr:{
    easy:[
      {q:"How many sides does a hexagon have?",  options:["5","6","7","8"],               answer:"6",  topic:"Shapes",    explanation:"Hex=6. Hexagon=6 sides. Like a honeycomb!"},
      {q:"How many faces does a cube have?",     options:["4","5","6","8"],               answer:"6",  topic:"3D Shapes", explanation:"Top, bottom, front, back, left, right = 6 faces."},
      {q:"Which shape has all equal sides AND all equal angles?", options:["Rectangle","Rhombus","Square","Trapezium"], answer:"Square", topic:"Shapes", explanation:"A square has 4 equal sides and 4 right angles (90°)."},
      {q:"If you rotate a square 90°, what do you get?", options:["Rectangle","Triangle","Square","Pentagon"], answer:"Square", topic:"Rotation", explanation:"A square looks the same after 90° rotation — rotational symmetry of order 4."},
      {q:"How many lines of symmetry does a circle have?", options:["0","1","4","Infinite"], answer:"Infinite", topic:"Symmetry", explanation:"Any line through the centre of a circle is a line of symmetry — infinite lines!"},
      {q:"What is the next shape: circle, square, triangle, circle, square, ___?", options:["Circle","Square","Triangle","Hexagon"], answer:"Triangle", topic:"Patterns", explanation:"The pattern repeats every 3 shapes: circle, square, triangle."},
    ],
    medium:[
      {q:"How many edges does a cuboid have?",   options:["8","10","12","14"],            answer:"12", topic:"3D Shapes", explanation:"A cuboid has 12 edges: 4 on top, 4 on bottom, 4 vertical."},
      {q:"A shape has 5 faces, 8 edges, 5 vertices. What is it?", options:["Cube","Cylinder","Square-based pyramid","Triangular prism"], answer:"Square-based pyramid", topic:"3D Shapes", explanation:"Square base (1) + 4 triangular faces=5 faces."},
      {q:"Which transformation preserves size and shape?", options:["Enlargement","Reflection","Distortion","Shearing"], answer:"Reflection", topic:"Transformations", explanation:"Reflection, rotation, and translation all preserve size and shape."},
      {q:"A pattern goes: 2 dots, 4 dots, 8 dots. Next?", options:["10","12","16","20"], answer:"16",  topic:"Patterns",  explanation:"Each term doubles: 2→4→8→16. Geometric sequence."},
      {q:"Lines of symmetry in an equilateral triangle?", options:["0","1","2","3"], answer:"3", topic:"Symmetry", explanation:"An equilateral triangle has 3 equal sides and 3 lines of symmetry."},
      {q:"If a square is reflected in a vertical mirror line, the result is:", options:["A rectangle","The same square","A rhombus","A parallelogram"], answer:"The same square", topic:"Transformations", explanation:"A square reflected in any axis of symmetry looks identical."},
    ],
    hard:[
      {q:"Euler's formula: F + V − E = ? for any polyhedron", options:["1","2","3","4"], answer:"2",   topic:"3D Shapes",  explanation:"Euler's formula: Faces + Vertices − Edges = 2 for all convex polyhedra."},
      {q:"Row 1: △○□  Row 2: ○□△  Row 3: □△○  Row 4: ?", options:["△○□","○□△","□△○","△□○"], answer:"△○□", topic:"Matrices", explanation:"The pattern rotates left each row. After △○□→○□△→□△○, it returns to △○□."},
      {q:"How many faces does a dodecahedron have?", options:["10","12","20","24"],       answer:"12",  topic:"3D Shapes",  explanation:"A dodecahedron has 12 pentagonal faces. Dodeca=12."},
      {q:"Which net CANNOT fold into a cube?", options:["A cross of 6 squares","A T-shape of 6 squares","An L-shape of 6 squares","A 2×3 grid of 6 squares"], answer:"A 2×3 grid of 6 squares", topic:"Nets", explanation:"A 2×3 grid cannot fold into a cube — opposite faces won't meet correctly."},
    ],
  },
};

// ─── AI TUTOR TOPICS ──────────────────────────────────────────────────────────
const AI_TUTOR_TOPICS = [
  { id:"times-tables",  subject:"maths",   icon:"✖️",  title:"Times Tables",          intro:"Times tables are the foundation of all maths. Let's master every trick." },
  { id:"fractions",     subject:"maths",   icon:"½",   title:"Fractions",             intro:"Fractions trip up loads of students — not for long. Step-by-step from basics." },
  { id:"percentages",   subject:"maths",   icon:"％",  title:"Percentages",           intro:"Percentages are everywhere in the 11+ — let me teach you the shortcuts." },
  { id:"ratio",         subject:"maths",   icon:"⚖️",  title:"Ratio & Proportion",    intro:"Ratio questions follow a simple method every time. I'll show you exactly how." },
  { id:"algebra",       subject:"maths",   icon:"🔣",  title:"Algebra & Sequences",   intro:"Algebra is just puzzles. I'll build up from basics to full confidence." },
  { id:"geometry",      subject:"maths",   icon:"📐",  title:"Geometry & Shapes",     intro:"Area, perimeter, angles, 3D — clear explanations and examples throughout." },
  { id:"punctuation",   subject:"english", icon:"✏️",  title:"Punctuation",           intro:"Apostrophes, commas, colons — every rule taught clearly." },
  { id:"grammar",       subject:"english", icon:"📝",  title:"Grammar",               intro:"Nouns, verbs, clauses, active/passive — the backbone of English." },
  { id:"vocabulary",    subject:"english", icon:"📚",  title:"Vocabulary & Roots",    intro:"Word roots, prefixes, suffixes — work out words you've never seen." },
  { id:"literacy",      subject:"english", icon:"🖊️",  title:"Literary Devices",      intro:"Similes, metaphors, personification — spot them and explain them." },
  { id:"synonyms",      subject:"verbal",  icon:"🔄",  title:"Synonyms & Antonyms",   intro:"Learn words in families and never get tripped up again." },
  { id:"analogies",     subject:"verbal",  icon:"🔗",  title:"Analogies",             intro:"The method for cracking any analogy — simpler than it looks!" },
  { id:"codes",         subject:"verbal",  icon:"🔐",  title:"Codes & Sequences",     intro:"Every type of code that appears in the 11+ — learn to crack them fast." },
  { id:"odd-one-out",   subject:"verbal",  icon:"🎯",  title:"Odd One Out",           intro:"Strategies to find what doesn't belong — every single time." },
  { id:"symmetry",      subject:"nvr",     icon:"🔄",  title:"Symmetry & Reflection", intro:"Lines of symmetry, reflections, and how to spot them in any shape." },
  { id:"patterns",      subject:"nvr",     icon:"🔲",  title:"Patterns & Matrices",   intro:"Identify rules in sequences and matrices — the core NVR skill." },
  { id:"3d-shapes",     subject:"nvr",     icon:"🧊",  title:"3D Shapes & Nets",      intro:"Faces, edges, vertices and nets — visualise 3D on paper like an expert." },
  { id:"transformations",subject:"nvr",   icon:"↩️",  title:"Transformations",        intro:"Rotation, reflection, translation — step-by-step for every type." },
];

// ─── TUTOR SCRIPTS ────────────────────────────────────────────────────────────
const TUTOR_SCRIPTS = {
  "times-tables":[
    {role:"tutor",text:"Welcome to your Times Tables lesson! 🎓 Before we dive in — which tables do you find hardest? (Type a number like '6', '7', or '8')"},
    {role:"tutor",text:"The trickiest for most students are 6×7, 6×8, 7×8, and 8×8. Here's the secret:\n\n🔑 **Trick 1: The 9× trick**\nHold up 10 fingers. For 9×3, fold down finger 3. You see 2 on the left and 7 on the right → 27!\n\nTry it: what does 9×6 give you?"},
    {role:"tutor",text:"Exactly! 9×6=54 (fold finger 6: 5 on left, 4 on right).\n\n🔑 **Trick 2: Square numbers** — memorise these:\n• 6×6=36  7×7=49  8×8=64  9×9=81  12×12=144\n\nOnce you know squares, nearby facts are easy:\n• 7×8 = 7×7+7 = 49+7 = **56** ✓\n• 8×9 = 8×8+8 = 64+8 = **72** ✓\n\nCan you work out 6×7 using 6×6?"},
    {role:"tutor",text:"6×7 = 6×6+6 = 36+6 = **42** ✓\n\n🔑 **Trick 3: The 12× table**\nBreak into 10× and 2×:\n• 12×7 = 70+14 = **84**\n• 12×9 = 90+18 = **108**\n\n💡 Quick test: What is 12×11?"},
    {role:"tutor",text:"12×11 = 110+22 = **132** ✓\n\n📋 **Learn these 10 facts and you'll know ALL the hard tables:**\n6×6=36 · 6×7=42 · 6×8=48 · 6×9=54\n7×7=49 · 7×8=56 · 7×9=63\n8×8=64 · 8×9=72 · 9×9=81\n\n🏆 **Lesson complete!** Now go test yourself in the Quiz — Maths → Easy. Well done! 🌟"},
  ],
  "fractions":[
    {role:"tutor",text:"Welcome to your Fractions lesson! 🎓\n\n**What is a fraction?**\nA fraction represents part of a whole. If you cut a pizza into 4 slices and eat 1, you've eaten **¼**.\n\n• **Numerator** (top) = how many parts you have\n• **Denominator** (bottom) = total equal parts\n\nQuick check: In the fraction **3/5**, which is the denominator?"},
    {role:"tutor",text:"Correct! The denominator is **5** — the total parts.\n\n**Finding fractions of amounts** — most common question type:\n\n🔑 **The method:**\n1. Divide by the denominator (bottom)\n2. Multiply by the numerator (top)\n\nExample: ¾ of 40\n→ 40 ÷ 4 = 10 (find ¼)\n→ 10 × 3 = **30** (get ¾)\n\n💡 Try: What is ⅔ of 18?"},
    {role:"tutor",text:"⅔ of 18:\n→ 18 ÷ 3 = 6 (⅓)\n→ 6 × 2 = **12** ✓\n\n**Simplifying fractions:**\nDivide both numbers by their HCF (Highest Common Factor).\n\nSimplify 8/12:\n→ HCF of 8 and 12 = 4\n→ 8÷4=2, 12÷4=3 → **2/3** ✓\n\n💡 Simplify 6/9. What do you get?"},
    {role:"tutor",text:"HCF of 6 and 9 = **3**. So 6÷3=2, 9÷3=3 → **2/3** ✓\n\n**Adding fractions:**\nDenominators must match first!\n\n1/3 + 1/4 → make them equal:\n→ 4/12 + 3/12 = **7/12**\n\n💡 Final challenge: What is 1/2 + 1/3?"},
    {role:"tutor",text:"1/2 + 1/3 → common denominator 6:\n→ 3/6 + 2/6 = **5/6** ✓\n\n🏆 **Lesson complete!** Summary:\n✅ Fraction of amount: divide by bottom, multiply by top\n✅ Simplify: divide by the HCF\n✅ Add/subtract: make denominators equal first\n\nHead to Quiz → Maths → Medium and try the fraction questions! 💪"},
  ],
  "grammar":[
    {role:"tutor",text:"Welcome to your Grammar lesson! 🎓\n\n**Parts of Speech:**\n📌 **Noun** — naming word: teacher, London, happiness\n📌 **Verb** — action/state: run, think, is\n📌 **Adjective** — describes a noun: brilliant, quiet\n📌 **Adverb** — describes a verb: quickly, silently\n\n💡 In 'The **brave** soldier **ran** quickly' — which word is the adjective?"},
    {role:"tutor",text:"**Brave** ✓ — it describes the noun 'soldier'. 'Quickly' is the adverb.\n\n**Clauses:**\n📌 **Main clause** — makes sense alone: 'The dog barked'\n📌 **Subordinate clause** — depends on main clause: 'because it heard a noise'\n\nSubordinate clauses start with: because, although, when, if, while, since, unless\n\n💡 Which is the subordinate clause in: 'Although she was tired, she kept studying'?"},
    {role:"tutor",text:"'Although she was tired' ✓ — it can't stand alone.\n\n**Active vs Passive Voice:**\n📌 **Active:** Subject DOES the action → 'The cat chased the mouse'\n📌 **Passive:** Subject RECEIVES the action → 'The mouse was chased by the cat'\n\nSpot passive: look for **was/were/is/are** + past participle\n\n💡 Active or passive? 'The cake was eaten by the children'"},
    {role:"tutor",text:"Passive ✓ — 'was eaten' is the giveaway.\n\n**Apostrophes:**\n📌 **Contraction:** it is → **it's** · do not → **don't**\n📌 **Possession:** The dog**'s** lead (one dog) · The dogs**'** leads (many dogs)\n⚠️ NEVER for plurals: ❌ Apple's for sale ✗\n\n💡 'The boys_ coats' — boys' or boy's (several boys)?"},
    {role:"tutor",text:"**Boys'** ✓ — apostrophe AFTER the s when noun is already plural.\n\n🏆 **Grammar lesson complete!** Summary:\n✅ Nouns name things, verbs show actions, adjectives describe nouns, adverbs describe verbs\n✅ Subordinate clauses can't stand alone\n✅ Active = subject does it. Passive = subject receives it.\n✅ Apostrophes: contractions + possession — never for plurals!\n\nNow try Quiz → English → Medium! 🌟"},
  ],
  "synonyms":[
    {role:"tutor",text:"Welcome to Synonyms & Antonyms! 🎓\n\n**Synonyms** = same meaning · **Antonyms** = opposite meaning\n\nExamples:\n• Synonym of HAPPY → joyful, elated, content, gleeful\n• Antonym of HAPPY → sad, miserable, melancholy\n\nThe 11+ uses unusual synonyms to catch you out!\n\nWhich is NOT a synonym of 'brave'? Courageous / Bold / Fearful / Valiant"},
    {role:"tutor",text:"Fearful ✓ — that's an antonym! Courageous, bold, valiant all mean brave.\n\n**Learn words in families:**\n🔵 Happy: joyful, elated, content, gleeful, blissful\n🔴 Sad: melancholy, mournful, sorrowful, despondent\n🟢 Brave: courageous, valiant, bold, daring, intrepid\n🟡 Clever: astute, shrewd, perceptive, gifted\n\n💡 Which word means 'extremely clever'? astute / stupid / clumsy / cautious"},
    {role:"tutor",text:"Astute ✓ — clever and quick to notice things.\n\n**Antonym patterns:**\n📌 Prefix antonyms: un- · in- · dis- · im-\n• happy → unhappy · correct → incorrect\n\n📌 Completely different words:\n• ancient ↔ modern · transparent ↔ opaque · benevolent ↔ malevolent\n\n💡 Antonym of 'meticulous' (meaning very careful)?"},
    {role:"tutor",text:"'Careless' ✓\n\n**Key 11+ vocab:**\n| Word | Meaning |\n|------|---------|\n| Benevolent | Kind, generous |\n| Malevolent | Evil, wishing harm |\n| Meticulous | Extremely careful |\n| Ambiguous | More than one meaning |\n| Transparent | See-through / obvious |\n| Opaque | Not see-through |\n| Astute | Clever, perceptive |\n| Timid | Shy, lacking confidence |\n\nAntonym of 'transparent'?"},
    {role:"tutor",text:"Opaque ✓ — now you know both!\n\n🏆 **Lesson complete!** Summary:\n✅ Synonyms = same meaning. Antonyms = opposite.\n✅ Learn words in families\n✅ Watch for prefix antonyms (un-, in-, dis-)\n✅ Memorise key 11+ vocab (benevolent, meticulous, astute, opaque...)\n\nHead to Quiz → Verbal Reasoning to test your vocabulary! 💪"},
  ],
  "symmetry":[
    {role:"tutor",text:"Welcome to Symmetry & Reflection! 🎓\n\n**Lines of symmetry** — if you fold a shape and both sides match exactly, that fold line is a line of symmetry.\n\n📌 Key shapes:\n• Circle: **infinite** · Square: **4** · Rectangle: **2**\n• Equilateral triangle: **3** · Regular pentagon: **5**\n\n🔑 Rule: **regular polygon with n sides → n lines of symmetry**\n\nHow many lines of symmetry does a regular octagon have?"},
    {role:"tutor",text:"8 ✓ — 8 sides, 8 lines!\n\n**Reflection rules:**\n• Shape stays same size and shape\n• Equal distance from mirror line on both sides\n• Vertical mirror line: left ↔ right flip\n• Horizontal mirror line: top ↔ bottom flip\n\nAlways check in NVR questions:\n1. Same size?\n2. Correctly flipped (not rotated)?\n3. Correct distance from mirror line?\n\n💡 A point is 3 squares LEFT of the mirror line. Where does it go in the reflection?"},
    {role:"tutor",text:"3 squares to the RIGHT ✓\n\n**Rotation vs Reflection — the common trap:**\n📌 **Reflection** = mirror image (might look different)\n📌 **Rotation** = spinning (turns but doesn't flip)\n\nKey giveaway: a reflected shape is like your mirror reflection — your right hand appears on the left. A rotated shape just turns.\n\n💡 If an arrow points RIGHT and you reflect it in a vertical line, which way does it point?"},
    {role:"tutor",text:"To the LEFT ✓ — the reflection flips it horizontally.\n\n**Rotational symmetry:**\nOrder = how many times it looks the same in one full 360° rotation.\n• Square: order **4** · Equilateral triangle: **3** · Rectangle: **2** · Regular hexagon: **6**\n\n💡 Order of rotational symmetry of a regular pentagon?"},
    {role:"tutor",text:"Order **5** ✓ — looks the same 5 times in 360°!\n\n🏆 **Lesson complete!** Summary:\n✅ Regular n-sided polygon → n lines of symmetry\n✅ Reflection: flip over mirror line, same distance, same size\n✅ Rotation ≠ Reflection — don't confuse them!\n✅ Rotational symmetry order: how many times it looks the same in 360°\n\nTest yourself in Quiz → Non-Verbal Reasoning! 🌟"},
  ],
};

function getDefaultScript(topic) {
  return [
    {role:"tutor",text:`Welcome to your ${topic.title} lesson! 🎓\n\n${topic.intro}\n\nLet's start from the very beginning — just like a classroom. Are you ready? Type anything to begin!`},
    {role:"tutor",text:`Great! This topic comes up regularly in the 11+ so understanding it properly is a real advantage.\n\nThe key to ${topic.title} is recognising patterns and applying a consistent method. Let me walk you through it step by step.\n\nWhat aspect of ${topic.title} do you find most confusing?`},
    {role:"tutor",text:`You're making great progress! 🌟\n\n💡 **Top tip:** After this lesson, go straight to the Quiz and practise ${topic.title} questions immediately. That's how knowledge sticks!\n\nAny questions before we wrap up?`},
    {role:"tutor",text:`🏆 **Lesson complete!** Well done.\n\n✅ The concepts we covered will appear in your 11+ exam\n✅ Practise regularly — even 10 minutes a day makes a huge difference\n✅ If you get a quiz question wrong, come back and we'll go through it together\n\nHead to the Quiz and put this into practice! You're doing brilliantly 💪`},
  ];
}

// ─── SCHOOLS DATA ─────────────────────────────────────────────────────────────
const SCHOOLS = [
  {name:"Queen Elizabeth's School, Barnet",  area:"Barnet",  exam:"GL Assessment", score:"Highly selective – top 250 out of ~2500"},
  {name:"Henrietta Barnett School",          area:"Barnet",  exam:"GL Assessment", score:"Most selective in London"},
  {name:"Latymer School, Edmonton",          area:"Enfield", exam:"GL Assessment", score:"Top 120 from ~1800"},
  {name:"Tiffin Boys' School",               area:"Kingston",exam:"GL Assessment", score:"Highly selective"},
  {name:"Tiffin Girls' School",              area:"Kingston",exam:"GL Assessment", score:"Highly selective"},
  {name:"Nonsuch High School for Girls",     area:"Sutton",  exam:"GL Assessment", score:"Top selective"},
  {name:"Wallington High School for Girls",  area:"Sutton",  exam:"GL Assessment", score:"Top selective"},
  {name:"Wilson's School",                   area:"Sutton",  exam:"GL Assessment", score:"Boys – top selective"},
  {name:"St Olave's Grammar School",         area:"Bromley", exam:"GL Assessment", score:"Top selective"},
  {name:"Newstead Wood School",              area:"Bromley", exam:"GL Assessment", score:"Girls – top selective"},
  {name:"Townley Grammar School",            area:"Bexley",  exam:"GL Assessment", score:"Girls – selective"},
  {name:"Beths Grammar School",              area:"Bexley",  exam:"GL Assessment", score:"Boys – selective"},
  {name:"Chislehurst & Sidcup Grammar",      area:"Bexley",  exam:"GL Assessment", score:"Mixed – selective"},
  {name:"Dartford Grammar School (Boys)",    area:"Kent",    exam:"Kent Test (GL)", score:"Selective"},
  {name:"Dartford Grammar School (Girls)",   area:"Kent",    exam:"Kent Test (GL)", score:"Selective"},
  {name:"Colchester Royal Grammar School",   area:"Essex",   exam:"CEM / CSSE",    score:"Boys – highly selective"},
  {name:"Southend High School for Boys",     area:"Southend",exam:"CSSE",          score:"Selective"},
];

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onAuth }) {
  const [mode, setMode]       = useState("login");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup }     = useAppContext();

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode==="login") await login(email, password);
      else await signup(email, password, name);
      onAuth();
    } catch(err) { setError(err.message || "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:20,fontWeight:900,color:"#1e1b4b"}}>{mode==="login"?"Sign In 🔐":"Create Account 🎓"}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#9ca3af"}}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode==="register"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" required style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>
          <input value={password} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" required style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:14,marginBottom:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
          {error&&<p style={{color:"#DC2626",fontSize:13,margin:"0 0 10px",textAlign:"center"}}>{error}</p>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {loading?"Please wait...":(mode==="login"?"Sign In →":"Create Account →")}
          </button>
        </form>
        <p style={{textAlign:"center",fontSize:13,color:"#6b7280",marginTop:14}}>
          {mode==="login"?"Don't have an account? ":"Already have an account? "}
          <span onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} style={{color:"#4F46E5",fontWeight:700,cursor:"pointer"}}>
            {mode==="login"?"Register free":"Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── BADGE CELEBRATION POPUP ──────────────────────────────────────────────────
function BadgeCelebration({ badges, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  if (!badges || badges.length === 0) return null;
  const badge = BADGES.find(b => b.id === badges[0]);
  if (!badge) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,pointerEvents:"none"}}>
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#4F46E5)",borderRadius:24,padding:"28px 32px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"bounceIn 0.5s ease",maxWidth:300,pointerEvents:"all"}}>
        <div style={{fontSize:64,marginBottom:8}}>{badge.icon}</div>
        <div style={{color:"#FDE68A",fontWeight:900,fontSize:13,textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>Badge Unlocked!</div>
        <div style={{color:"white",fontWeight:900,fontSize:20,marginBottom:6}}>{badge.name}</div>
        <div style={{color:"#c7d2fe",fontSize:13,marginBottom:12}}>{badge.desc}</div>
        {badge.xp>0&&<div style={{background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"6px 16px",display:"inline-block",color:"#FDE68A",fontWeight:800,fontSize:14}}>+{badge.xp} XP</div>}
        <button onClick={onClose} style={{display:"block",margin:"14px auto 0",background:"white",color:"#4F46E5",border:"none",borderRadius:10,padding:"8px 20px",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Awesome! 🎉</button>
      </div>
    </div>
  );
}

// ─── STREAK WIDGET ────────────────────────────────────────────────────────────
function StreakWidget({ streak }) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const today = new Date().getDay(); // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1; // convert to Mon=0
  return (
    <div style={{background:"white",borderRadius:20,padding:"16px 18px",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontWeight:900,fontSize:16,color:"#1e1b4b"}}>🔥 {streak || 0} Day Streak</div>
          <div style={{fontSize:12,color:"#6b7280"}}>{streak>=1?"Keep it going! Don't break the chain":"Start your streak today!"}</div>
        </div>
        <div style={{fontSize:36,filter:streak>=1?"none":"grayscale(1) opacity(0.3)"}}>{streak>=7?"💎":streak>=3?"🔥":"🌱"}</div>
      </div>
      <div style={{display:"flex",gap:6,justifyContent:"space-between"}}>
        {days.map((day, i) => {
          const isPast = i < todayIdx;
          const isToday = i === todayIdx;
          const isActive = isPast ? i >= todayIdx - (streak - 1) : isToday && streak >= 1;
          return (
            <div key={day} style={{flex:1,textAlign:"center"}}>
              <div style={{width:"100%",aspectRatio:"1",borderRadius:10,background:isActive?"linear-gradient(135deg,#F59E0B,#EF4444)":isToday?"rgba(79,70,229,0.15)":"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4,border:isToday?`2px solid #4F46E5`:"2px solid transparent"}}>
                <span style={{fontSize:14}}>{isActive?"🔥":"·"}</span>
              </div>
              <div style={{fontSize:10,fontWeight:700,color:isToday?"#4F46E5":isActive?"#D97706":"#9ca3af"}}>{day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
function NotificationSetup({ onDone }) {
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied | unsupported
  useEffect(() => {
    if (!("Notification" in window)) { setStatus("unsupported"); return; }
    if (Notification.permission === "granted") setStatus("granted");
    else if (Notification.permission === "denied") setStatus("denied");
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) { setStatus("unsupported"); return; }
    setStatus("requesting");
    const perm = await Notification.requestPermission();
    setStatus(perm);
    if (perm === "granted") {
      // Schedule a local "demo" notification to confirm it works
      setTimeout(() => {
        new Notification("🔥 11+ Quest", {
          body: "Notifications enabled! We'll remind you to practise daily.",
          icon: "https://11-quest-uk.base44.app/favicon.ico"
        });
      }, 1000);
      localStorage.setItem("11q_notifications", "granted");
    }
  }

  if (status === "granted") return (
    <div style={{background:"#ECFDF5",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:20}}>✅</span>
      <div>
        <div style={{fontWeight:700,fontSize:13,color:"#065F46"}}>Notifications enabled!</div>
        <div style={{fontSize:12,color:"#047857"}}>You'll get daily practice reminders</div>
      </div>
    </div>
  );

  if (status === "denied") return (
    <div style={{background:"#FEF2F2",borderRadius:14,padding:"12px 16px"}}>
      <div style={{fontWeight:700,fontSize:13,color:"#991B1B"}}>❌ Notifications blocked</div>
      <div style={{fontSize:12,color:"#B91C1C"}}>Enable them in your browser settings to get daily reminders</div>
    </div>
  );

  if (status === "unsupported") return (
    <div style={{background:"#F3F4F6",borderRadius:14,padding:"12px 16px"}}>
      <div style={{fontSize:13,color:"#6b7280"}}>Push notifications aren't supported on this device/browser. Try using Chrome on desktop.</div>
    </div>
  );

  return (
    <button onClick={requestPermission}
      style={{width:"100%",padding:"14px",borderRadius:14,border:"2px dashed #4F46E5",background:"#EEF2FF",color:"#4F46E5",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
      <span style={{fontSize:20}}>🔔</span>
      Enable Daily Practice Reminders
    </button>
  );
}

// ─── PAGE WRAP ────────────────────────────────────────────────────────────────
function PageWrap({children}) {
  return <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>{children}</div>;
}

// ─── LEADERBOARD COMPONENT ────────────────────────────────────────────────────
function LeaderboardView({ user, onSignIn }) {
  const [board, setBoard]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState("xp"); // xp | streak | correct
  const { user: ctxUser }   = useAppContext();

  useEffect(()=>{
    (async()=>{
      try {
        const recs = await UserProgress.list();
        // Try to get user names
        setBoard(recs);
      } catch {} finally { setLoading(false); }
    })();
  },[]);

  const sorted = [...board].sort((a,b)=>{
    if(tab==="xp") return (b.xp||0)-(a.xp||0);
    if(tab==="streak") return (b.streak_days||0)-(a.streak_days||0);
    if(tab==="correct") return (b.total_correct||0)-(a.total_correct||0);
    return 0;
  }).slice(0,20);

  if(loading) return <div style={{textAlign:"center",color:"white",padding:40,fontSize:18}}>Loading...</div>;

  if(board.length===0) return (
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:56,marginBottom:12}}>🏆</div>
      <p style={{color:"white",fontWeight:700,fontSize:16}}>No entries yet — be the first!</p>
      {!user&&<button onClick={onSignIn} style={{marginTop:12,padding:"12px 24px",borderRadius:12,background:"white",color:"#3730a3",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In to Compete →</button>}
    </div>
  );

  return (
    <>
      {/* tab switcher */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[{id:"xp",label:"⚡ XP"},{id:"streak",label:"🔥 Streak"},{id:"correct",label:"✅ Correct"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"8px 0",borderRadius:12,fontWeight:700,fontSize:12,cursor:"pointer",border:"none",background:tab===t.id?"white":"rgba(255,255,255,0.15)",color:tab===t.id?"#3730a3":"white"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{background:"white",borderRadius:20,padding:"18px",boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
        {/* top 3 podium */}
        {sorted.length>=3&&(
          <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:8,marginBottom:20,paddingTop:8}}>
            {[sorted[1],sorted[0],sorted[2]].map((entry,i)=>{
              const pos = i===0?2:i===1?1:3;
              const isMe = user&&entry?.user_id===user.id;
              const heights = ["80px","100px","65px"];
              const medals = ["🥈","🥇","🥉"];
              const val = tab==="xp"?`${entry?.xp||0} XP`:tab==="streak"?`🔥${entry?.streak_days||0}`:tab==="correct"?`${entry?.total_correct||0}✅`:"";
              return (
                <div key={pos} style={{textAlign:"center",flex:1}}>
                  <div style={{fontSize:24,marginBottom:4}}>{medals[i]}</div>
                  <div style={{background:isMe?"#EEF2FF":i===1?"#FEF9C3":"#f3f4f6",borderRadius:"12px 12px 0 0",height:heights[i],display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"8px 4px",border:isMe?"2px solid #4F46E5":"none"}}>
                    <div style={{fontSize:11,fontWeight:800,color:"#1e1b4b",wordBreak:"break-all"}}>{isMe?"⭐ You":`#${pos}`}</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#4F46E5"}}>{val}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* full list */}
        {sorted.map((entry,i)=>{
          const isMe = user&&entry.user_id===user.id;
          const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;
          const lvl = calcLevel(entry.xp||0).level;
          const val = tab==="xp"?`${entry.xp||0} XP`:tab==="streak"?`🔥 ${entry.streak_days||0} days`:`${entry.total_correct||0} correct`;
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px",borderRadius:10,marginBottom:4,background:isMe?"#EEF2FF":"transparent",border:isMe?"1.5px solid #c7d2fe":"1.5px solid transparent"}}>
              <div style={{width:28,textAlign:"center",fontWeight:900,fontSize:15,color:i<3?"#F59E0B":"#9ca3af",flexShrink:0}}>{medal}</div>
              <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${SUBJECT_COLOURS.maths},${SUBJECT_COLOURS.english})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,fontSize:14,flexShrink:0}}>
                {isMe?(user.full_name?user.full_name[0].toUpperCase():"U"):(i+1)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,color:"#1e1b4b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isMe?`⭐ ${user.full_name||"You"}`:`Player ${i+1}`}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>Level {lvl} · 🏅{(entry.badges||[]).length} badges</div>
              </div>
              <div style={{fontWeight:800,fontSize:14,color:"#4F46E5",flexShrink:0}}>{val}</div>
            </div>
          );
        })}
        {!user&&(
          <div style={{textAlign:"center",marginTop:14,paddingTop:14,borderTop:"1px solid #f3f4f6"}}>
            <p style={{fontSize:13,color:"#6b7280",margin:"0 0 8px"}}>Sign in to appear on the leaderboard!</p>
            <button onClick={onSignIn} style={{padding:"10px 24px",borderRadius:12,background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In to Compete →</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, logout } = useAppContext();

  const [tab, setTab]           = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [showBadgePop, setShowBadgePop] = useState(false);

  // Quiz state
  const [selSubjects, setSelSubjects] = useState(["maths"]);
  const [difficulty, setDifficulty]   = useState("medium");
  const [qCount, setQCount]           = useState(10);
  const [quiz, setQuiz]               = useState([]);
  const [qIdx, setQIdx]               = useState(0);
  const [selected, setSelected]       = useState(null);
  const [quizActive, setQuizActive]   = useState(false);
  const [quizDone, setQuizDone]       = useState(false);
  const [score, setScore]             = useState(0);
  const [answers, setAnswers]         = useState([]);

  // Progress state
  const [progress, setProgress]     = useState(null);
  const [sessions, setSessions]     = useState([]);
  const [visitorCount, setVisitorCount] = useState(null);

  // Learn / AI tutor
  const [learnSubject, setLearnSubject] = useState("maths");
  const [activeTopic, setActiveTopic]   = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput]       = useState("");
  const [scriptIdx, setScriptIdx]       = useState(0);
  const chatEndRef = useRef(null);

  // ── Visitor count ─────────────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      try {
        const records = await VisitorCount.list();
        if(records.length===0){const r=await VisitorCount.create({count:1});setVisitorCount(r.count);}
        else{const r=records[0];const u=await VisitorCount.update(r.id,{count:(r.count||0)+1});setVisitorCount(u.count);}
      } catch{setVisitorCount("...");}
    })();
  },[]);

  // ── Load progress ─────────────────────────────────────────────────────────
  useEffect(()=>{
    if(!user) return;
    (async()=>{
      try{
        const recs=await UserProgress.filter({user_id:user.id});
        if(recs.length>0) setProgress(recs[0]);
        const sess=await QuizSession.filter({user_id:user.id});
        setSessions(sess.sort((a,b)=>new Date(b.date)-new Date(a.date)));
      } catch{}
    })();
  },[user]);

  // ── Daily notification reminder ───────────────────────────────────────────
  useEffect(()=>{
    if(localStorage.getItem("11q_notifications")==="granted" && "Notification" in window && Notification.permission==="granted"){
      const lastNotif = localStorage.getItem("11q_last_notif");
      const today = new Date().toISOString().split("T")[0];
      if(lastNotif!==today){
        const hour = new Date().getHours();
        if(hour>=8 && hour<=21){
          const msgs = [
            "Time to practise! 📚 Your 11+ exam is getting closer.",
            "Don't break your streak! 🔥 Quick quiz time.",
            "5 minutes of practice = big results on exam day! 🎓",
            "Your brain is ready for a workout! 🧠 Let's go.",
          ];
          new Notification("🎓 11+ Quest", {
            body: msgs[Math.floor(Math.random()*msgs.length)],
            icon: "/favicon.ico"
          });
          localStorage.setItem("11q_last_notif", today);
        }
      }
    }
  },[]);

  // ── Scroll chat ───────────────────────────────────────────────────────────
  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[chatMessages]);

  // ── Level calc ────────────────────────────────────────────────────────────
  const { level: curLevel, xpInLevel, xpNeeded } = calcLevel(progress?.xp||0);

  // ── Start quiz ────────────────────────────────────────────────────────────
  function startQuiz() {
    let pool=[];
    selSubjects.forEach(s=>{
      const qs=QUESTIONS[s]?.[difficulty]||[];
      pool.push(...qs);
    });
    pool=pool.sort(()=>Math.random()-0.5).slice(0,qCount);
    if(pool.length===0) return;
    setQuiz(pool);setQIdx(0);setScore(0);setAnswers([]);
    setSelected(null);setQuizActive(true);setQuizDone(false);
  }

  // ── Answer ────────────────────────────────────────────────────────────────
  function handleAnswer(opt) {
    if(selected!==null) return;
    setSelected(opt);
    const correct=opt===quiz[qIdx].answer;
    if(correct) setScore(s=>s+1);
    setAnswers(a=>[...a,{q:quiz[qIdx].q,chosen:opt,correct,answer:quiz[qIdx].answer,explanation:quiz[qIdx].explanation}]);
  }

  // ── Next ──────────────────────────────────────────────────────────────────
  async function nextQ() {
    if(qIdx+1>=quiz.length){
      setQuizDone(true);setQuizActive(false);
      if(user) await saveResults();
    } else { setQIdx(i=>i+1);setSelected(null); }
  }

  // ── Save results ──────────────────────────────────────────────────────────
  async function saveResults() {
    const pct=Math.round((score/quiz.length)*100);
    const xpEarned=quiz.length*DIFF_XP[difficulty];
    const today=new Date().toISOString().split("T")[0];
    const hour=new Date().getHours();
    try {
      const existing=await UserProgress.filter({user_id:user.id});
      const prev=existing[0]||{total_questions:0,total_correct:0,streak_days:0,last_practice_date:null,badges:[],xp:0,level:1,subject_stats:{}};
      const newQ=(prev.total_questions||0)+quiz.length;
      const newC=(prev.total_correct||0)+score;
      const newXP=(prev.xp||0)+xpEarned;
      const lvl=calcLevel(newXP).level;
      // streak
      let streak=prev.streak_days||0;
      if(prev.last_practice_date===today){ /* same day, no change */ }
      else if(prev.last_practice_date===new Date(Date.now()-86400000).toISOString().split("T")[0]) streak++;
      else streak=1;
      // subject stats
      const ss={...(prev.subject_stats||{})};
      selSubjects.forEach(s=>{
        if(!ss[s]) ss[s]={q:0,c:0};
        ss[s].q+=quiz.length/selSubjects.length;
        ss[s].c+=score/selSubjects.length;
      });
      // badges
      const prevBadges=[...(prev.badges||[])];
      const badges=[...prevBadges];
      if(!badges.includes("first_quiz")) badges.push("first_quiz");
      if(streak>=3&&!badges.includes("streak_3")) badges.push("streak_3");
      if(streak>=7&&!badges.includes("streak_7")) badges.push("streak_7");
      if(streak>=14&&!badges.includes("streak_14")) badges.push("streak_14");
      if(streak>=30&&!badges.includes("streak_30")) badges.push("streak_30");
      if(pct===100&&quiz.length>=10&&!badges.includes("perfect_10")) badges.push("perfect_10");
      if(pct===100&&difficulty==="hard"&&!badges.includes("perfect_hard")) badges.push("perfect_hard");
      if(newQ>=100&&!badges.includes("century")) badges.push("century");
      if(newQ>=500&&!badges.includes("five_hundred")) badges.push("five_hundred");
      if(difficulty==="hard"&&!badges.includes("hard_mode")) badges.push("hard_mode");
      if(lvl>=5&&!badges.includes("level_5")) badges.push("level_5");
      if(lvl>=10&&!badges.includes("level_10")) badges.push("level_10");
      if(hour<8&&!badges.includes("early_bird")) badges.push("early_bird");
      if(hour>=21&&!badges.includes("night_owl")) badges.push("night_owl");
      // all rounder: check if all 4 subjects have been done
      const allSubjectsDone=["maths","english","verbal","nvr"].every(s=>(ss[s]?.q||0)>0);
      if(allSubjectsDone&&!badges.includes("all_rounder")) badges.push("all_rounder");
      // newly earned badges
      const earned=badges.filter(b=>!prevBadges.includes(b));
      if(earned.length>0){ setNewBadges(earned); setShowBadgePop(true); }
      const data={user_id:user.id,total_questions:newQ,total_correct:newC,streak_days:streak,last_practice_date:today,badges,xp:newXP,level:lvl,subject_stats:ss};
      if(existing[0]) await UserProgress.update(existing[0].id,data);
      else await UserProgress.create(data);
      setProgress(data);
      const sessData={user_id:user.id,subjects:selSubjects,difficulty,score,total:quiz.length,percentage:pct,xp_earned:xpEarned,date:today};
      await QuizSession.create(sessData);
      setSessions(s=>[sessData,...s]);
    } catch(e){console.error(e);}
  }

  // ── AI Tutor ──────────────────────────────────────────────────────────────
  function openTopic(topic) {
    setActiveTopic(topic);
    const script=TUTOR_SCRIPTS[topic.id]||getDefaultScript(topic);
    setChatMessages([script[0]]);setScriptIdx(1);setChatInput("");
  }
  function sendMessage() {
    const text=chatInput.trim(); if(!text) return;
    const userMsg={role:"user",text};
    const script=TUTOR_SCRIPTS[activeTopic.id]||getDefaultScript(activeTopic);
    const nextTutor=script[scriptIdx];
    const newMsgs=[userMsg];
    if(nextTutor) newMsgs.push(nextTutor);
    else newMsgs.push({role:"tutor",text:"Great thinking! 🌟 Keep practising and come back anytime. Head to the Quiz to test what you've learned!"});
    setChatMessages(m=>[...m,...newMsgs]);setScriptIdx(i=>i+1);setChatInput("");
  }

  function goTab(id){setTab(id);setActiveTopic(null);setQuizActive(false);setQuizDone(false);}

  // ── HOME ──────────────────────────────────────────────────────────────────
  if(tab==="home") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4F46E5 100%)"}}>
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuth={()=>setShowAuth(false)}/>}
      {showBadgePop&&<BadgeCelebration badges={newBadges} onClose={()=>setShowBadgePop(false)}/>}
      <PageWrap>
        <div style={{textAlign:"center",padding:"32px 0 16px"}}>
          <div style={{fontSize:56,marginBottom:8}}>🎓</div>
          <h1 style={{color:"white",fontWeight:900,fontSize:28,margin:"0 0 4px",letterSpacing:"-0.5px"}}>11+ Quest</h1>
          <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 16px"}}>GL · CEM · ISEB · Independent Schools</p>
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:16,padding:"12px 20px",display:"inline-flex",alignItems:"center",gap:10,marginBottom:16}}>
            <span style={{fontSize:22}}>👥</span>
            <div style={{textAlign:"left"}}>
              <div style={{color:"white",fontWeight:900,fontSize:20}}>{visitorCount??"..."}</div>
              <div style={{color:"#c7d2fe",fontSize:11}}>total visitors all time</div>
            </div>
          </div>
          {user?(
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 16px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{color:"white",fontWeight:800,fontSize:14,margin:0}}>👋 Hey, {user.full_name?.split(" ")[0]||"there"}!</p>
                <p style={{color:"#c7d2fe",fontSize:12,margin:"2px 0 0"}}>🔥 {progress?.streak_days||0} day streak · Level {curLevel} · {progress?.xp||0} XP</p>
              </div>
              <button onClick={logout} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",fontSize:11,fontWeight:700,borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>Sign out</button>
            </div>
          ):(
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 16px",marginBottom:4,textAlign:"center"}}>
              <p style={{color:"white",fontWeight:800,fontSize:13,margin:"0 0 4px"}}>🔒 Sign in to save your progress</p>
              <p style={{color:"#c7d2fe",fontSize:12,margin:"0 0 10px"}}>Track streaks · Earn badges · Climb the leaderboard</p>
              <button onClick={()=>setShowAuth(true)} style={{padding:"10px 24px",borderRadius:12,background:"white",color:"#3730a3",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In / Register →</button>
            </div>
          )}
        </div>
        {/* streak widget for logged in users */}
        {user&&<StreakWidget streak={progress?.streak_days||0}/>}
        {/* grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:4}}>
          {[
            {id:"learn",icon:"📚",title:"Learn",desc:"AI tutor — classroom style",grad:"linear-gradient(135deg,#059669,#047857)"},
            {id:"quiz",icon:"✏️",title:"Quiz",desc:"4 subjects, 3 levels",grad:"linear-gradient(135deg,#4F46E5,#3730a3)"},
            {id:"progress",icon:"📊",title:"My Stats",desc:"History & badges",grad:"linear-gradient(135deg,#D97706,#B45309)"},
            {id:"leaderboard",icon:"🏆",title:"Leaderboard",desc:"Compete with friends",grad:"linear-gradient(135deg,#DC2626,#991B1B)"},
          ].map(c=>(
            <button key={c.id} onClick={()=>goTab(c.id)} style={{padding:"20px 16px",borderRadius:20,border:"none",background:c.grad,cursor:"pointer",textAlign:"left",boxShadow:"0 8px 24px rgba(0,0,0,0.25)"}}>
              <div style={{fontSize:32,marginBottom:6}}>{c.icon}</div>
              <div style={{color:"white",fontWeight:900,fontSize:16}}>{c.title}</div>
              <div style={{color:"rgba(255,255,255,0.75)",fontSize:12}}>{c.desc}</div>
            </button>
          ))}
        </div>
        <button onClick={()=>goTab("schools")} style={{width:"100%",marginTop:12,padding:"14px",borderRadius:16,border:"2px solid rgba(255,255,255,0.3)",background:"transparent",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>🏫 Grammar School Info</button>
      </PageWrap>
    </div>
  );

  // ── SHARED WRAPPER ────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4F46E5 100%)"}}>
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuth={()=>setShowAuth(false)}/>}
      {showBadgePop&&<BadgeCelebration badges={newBadges} onClose={()=>setShowBadgePop(false)}/>}
      {/* nav */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(30,27,75,0.95)",backdropFilter:"blur(10px)",padding:"10px 16px",display:"flex",gap:6,overflowX:"auto"}}>
        {[{id:"home",label:"🏠"},{id:"learn",label:"📚 Learn"},{id:"quiz",label:"✏️ Quiz"},{id:"progress",label:"📊 Stats"},{id:"leaderboard",label:"🏆 Ranks"},{id:"schools",label:"🏫 Schools"}].map(n=>(
          <button key={n.id} onClick={()=>goTab(n.id)}
            style={{padding:"7px 12px",borderRadius:20,fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0,border:tab===n.id?"none":"2px solid rgba(255,255,255,0.3)",background:tab===n.id?"white":"transparent",color:tab===n.id?"#3730a3":"white"}}>
            {n.label}
          </button>
        ))}
        {!user&&<button onClick={()=>setShowAuth(true)} style={{marginLeft:"auto",padding:"7px 14px",borderRadius:20,fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0,border:"none",background:"#4F46E5",color:"white"}}>Sign In</button>}
      </div>

      {/* ── LEARN ── */}
      {tab==="learn"&&!activeTopic&&(
        <PageWrap>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>📚 AI Tutor</h2>
          <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>Choose a topic — your AI teacher will guide you through it like a real classroom lesson.</p>
          <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto"}}>
            {Object.entries(SUBJECT_LABELS).map(([id,label])=>(
              <button key={id} onClick={()=>setLearnSubject(id)}
                style={{padding:"8px 14px",borderRadius:20,fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0,border:`2px solid ${learnSubject===id?SUBJECT_COLOURS[id]:"rgba(255,255,255,0.3)"}`,background:learnSubject===id?SUBJECT_COLOURS[id]:"transparent",color:"white"}}>
                {label}
              </button>
            ))}
          </div>
          {AI_TUTOR_TOPICS.filter(t=>t.subject===learnSubject).map(topic=>(
            <button key={topic.id} onClick={()=>openTopic(topic)}
              style={{width:"100%",marginBottom:10,background:"white",borderRadius:16,padding:"16px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:"0 4px 15px rgba(0,0,0,0.15)",textAlign:"left"}}>
              <div style={{width:48,height:48,borderRadius:14,background:SUBJECT_BG[learnSubject],display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{topic.icon}</div>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:"#1e1b4b"}}>{topic.title}</div>
                <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Interactive lesson with your AI tutor 🤖</div>
              </div>
              <div style={{marginLeft:"auto",color:SUBJECT_COLOURS[learnSubject],fontWeight:700,fontSize:18}}>→</div>
            </button>
          ))}
        </PageWrap>
      )}

      {/* ── AI TUTOR CHAT ── */}
      {tab==="learn"&&activeTopic&&(
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px",display:"flex",flexDirection:"column",height:"calc(100vh - 50px)"}}>
          <div style={{padding:"12px 0",display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setActiveTopic(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",fontWeight:700,fontSize:13,borderRadius:20,padding:"7px 14px",cursor:"pointer"}}>← Back</button>
            <div>
              <div style={{color:"white",fontWeight:800,fontSize:16}}>{activeTopic.icon} {activeTopic.title}</div>
              <div style={{color:"#c7d2fe",fontSize:11}}>AI Tutor · {SUBJECT_LABELS[activeTopic.subject]}</div>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
            {chatMessages.map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
                {msg.role==="tutor"&&<div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginRight:8,flexShrink:0,alignSelf:"flex-start",marginTop:2}}>🤖</div>}
                <div style={{maxWidth:"82%",padding:"12px 16px",borderRadius:msg.role==="user"?"20px 20px 4px 20px":"20px 20px 20px 4px",background:msg.role==="user"?"#4F46E5":"white",color:msg.role==="user"?"white":"#1e1b4b",fontSize:14,lineHeight:1.6,whiteSpace:"pre-wrap",boxShadow:"0 2px 10px rgba(0,0,0,0.1)"}}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}/>
          </div>
          <div style={{padding:"10px 0 20px",display:"flex",gap:8}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}
              placeholder="Type your answer or question..."
              style={{flex:1,padding:"13px 16px",borderRadius:24,border:"2px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"white",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
            <button onClick={sendMessage} style={{padding:"13px 18px",borderRadius:24,border:"none",background:"white",color:"#4F46E5",fontWeight:800,fontSize:16,cursor:"pointer"}}>→</button>
          </div>
        </div>
      )}

      {/* ── QUIZ SETUP ── */}
      {tab==="quiz"&&!quizActive&&!quizDone&&(
        <PageWrap>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>✏️ Practice Quiz</h2>
          <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>Choose your subjects, difficulty & number of questions.</p>
          <div style={{background:"white",borderRadius:20,padding:"20px 18px",boxShadow:"0 8px 30px rgba(0,0,0,0.2)"}}>
            <p style={{fontWeight:800,color:"#1e1b4b",fontSize:11,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Subjects</p>
            {Object.entries(SUBJECT_LABELS).map(([id,label])=>(
              <button key={id} onClick={()=>setSelSubjects(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])}
                style={{width:"100%",marginBottom:8,padding:"13px 16px",borderRadius:12,border:`2px solid ${selSubjects.includes(id)?SUBJECT_COLOURS[id]:"#e5e7eb"}`,background:selSubjects.includes(id)?SUBJECT_BG[id]:"#fafafa",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontWeight:700,fontSize:14,color:selSubjects.includes(id)?SUBJECT_COLOURS[id]:"#374151"}}>{label}</span>
                <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${selSubjects.includes(id)?SUBJECT_COLOURS[id]:"#d1d5db"}`,background:selSubjects.includes(id)?SUBJECT_COLOURS[id]:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {selSubjects.includes(id)&&<span style={{color:"white",fontSize:11,fontWeight:900}}>✓</span>}
                </div>
              </button>
            ))}
            <p style={{fontWeight:800,color:"#1e1b4b",fontSize:11,textTransform:"uppercase",letterSpacing:"1px",margin:"16px 0 10px"}}>Difficulty</p>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {["easy","medium","hard"].map(d=>(
                <button key={d} onClick={()=>setDifficulty(d)}
                  style={{flex:1,padding:"11px 0",borderRadius:10,border:`2px solid ${difficulty===d?DIFF_COLOURS[d]:"#e5e7eb"}`,background:difficulty===d?DIFF_COLOURS[d]+"15":"white",color:difficulty===d?DIFF_COLOURS[d]:"#374151",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  {d==="easy"?"😊 Easy":d==="medium"?"🎯 Medium":"🔥 Hard"}<br/>
                  <span style={{fontSize:10,opacity:0.7}}>+{DIFF_XP[d]} XP/q</span>
                </button>
              ))}
            </div>
            <p style={{fontWeight:800,color:"#1e1b4b",fontSize:11,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Questions</p>
            <div style={{display:"flex",gap:8,marginBottom:18}}>
              {[5,10,15,20].map(n=>(
                <button key={n} onClick={()=>setQCount(n)}
                  style={{flex:1,padding:"11px 0",borderRadius:10,border:`2px solid ${qCount===n?"#4F46E5":"#e5e7eb"}`,background:qCount===n?"#EEF2FF":"white",color:qCount===n?"#4F46E5":"#374151",fontWeight:700,fontSize:15,cursor:"pointer"}}>{n}</button>
              ))}
            </div>
            {!user&&<p style={{textAlign:"center",fontSize:12,color:"#9ca3af",marginBottom:8}}>⚠️ <span style={{cursor:"pointer",color:"#4F46E5",fontWeight:700}} onClick={()=>setShowAuth(true)}>Sign in</span> to save your score & earn XP</p>}
            <button onClick={startQuiz} disabled={selSubjects.length===0}
              style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:selSubjects.length===0?"#e5e7eb":"linear-gradient(135deg,#4F46E5,#7C3AED)",color:selSubjects.length===0?"#9ca3af":"white",fontWeight:800,fontSize:16,cursor:selSubjects.length===0?"not-allowed":"pointer"}}>
              {selSubjects.length===0?"👆 Select a subject":"Start Quiz →"}
            </button>
          </div>
        </PageWrap>
      )}

      {/* ── QUIZ ACTIVE ── */}
      {tab==="quiz"&&quizActive&&!quizDone&&quiz[qIdx]&&(
        <PageWrap>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0 8px"}}>
            <span style={{color:"#c7d2fe",fontWeight:700,fontSize:13}}>Question {qIdx+1}/{quiz.length}</span>
            <span style={{color:"#c7d2fe",fontWeight:700,fontSize:13}}>✅ {score} correct</span>
          </div>
          <div style={{height:6,background:"rgba(255,255,255,0.2)",borderRadius:3,marginBottom:16}}>
            <div style={{height:"100%",width:`${((qIdx+1)/quiz.length)*100}%`,background:"white",borderRadius:3,transition:"width 0.3s"}}/>
          </div>
          <div style={{background:"white",borderRadius:20,padding:"20px 18px",marginBottom:12,boxShadow:"0 8px 30px rgba(0,0,0,0.2)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>{quiz[qIdx].topic}</div>
            <p style={{fontWeight:800,fontSize:17,color:"#1e1b4b",margin:"0 0 18px",lineHeight:1.4}}>{quiz[qIdx].q}</p>
            {quiz[qIdx].options.map(opt=>{
              let bg="#f8fafc",border="2px solid #e5e7eb",color="#374151";
              if(selected!==null){
                if(opt===quiz[qIdx].answer){bg="#ECFDF5";border="2px solid #059669";color="#065F46";}
                else if(opt===selected&&opt!==quiz[qIdx].answer){bg="#FEF2F2";border="2px solid #DC2626";color="#991B1B";}
              }
              return (
                <button key={opt} onClick={()=>handleAnswer(opt)}
                  style={{width:"100%",marginBottom:10,padding:"14px 16px",borderRadius:12,border,background:bg,color,fontWeight:700,fontSize:14,cursor:selected?"default":"pointer",textAlign:"left",transition:"all 0.2s"}}>
                  {opt}
                  {selected!==null&&opt===quiz[qIdx].answer&&<span style={{float:"right"}}>✅</span>}
                  {selected!==null&&opt===selected&&opt!==quiz[qIdx].answer&&<span style={{float:"right"}}>❌</span>}
                </button>
              );
            })}
            {selected!==null&&(
              <div style={{background:"#EEF2FF",borderRadius:12,padding:"12px 14px",marginTop:4}}>
                <p style={{fontWeight:700,fontSize:13,color:"#1e1b4b",margin:"0 0 4px"}}>💡 Explanation</p>
                <p style={{fontSize:13,color:"#374151",margin:0}}>{quiz[qIdx].explanation}</p>
              </div>
            )}
          </div>
          {selected!==null&&(
            <button onClick={nextQ} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:16,cursor:"pointer"}}>
              {qIdx+1>=quiz.length?"See Results 🏁":"Next Question →"}
            </button>
          )}
        </PageWrap>
      )}

      {/* ── QUIZ DONE ── */}
      {tab==="quiz"&&quizDone&&(
        <PageWrap>
          <div style={{textAlign:"center",padding:"24px 0 12px"}}>
            <div style={{fontSize:60}}>{score/quiz.length>=0.8?"🏆":score/quiz.length>=0.6?"⭐":"💪"}</div>
            <h2 style={{color:"white",fontWeight:900,fontSize:26,margin:"8px 0 4px"}}>{Math.round((score/quiz.length)*100)}%</h2>
            <p style={{color:"#c7d2fe",fontSize:15,margin:"0 0 4px"}}>{score}/{quiz.length} correct</p>
            {user&&<p style={{color:"#FDE68A",fontWeight:700,fontSize:14,margin:"4px 0"}}>+{quiz.length*DIFF_XP[difficulty]} XP earned!</p>}
          </div>
          <div style={{background:"white",borderRadius:20,padding:"18px",marginBottom:12,boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
            <p style={{fontWeight:800,fontSize:14,color:"#1e1b4b",margin:"0 0 12px"}}>📋 Answer Review</p>
            {answers.map((a,i)=>(
              <div key={i} style={{padding:"10px 0",borderBottom:i<answers.length-1?"1px solid #f3f4f6":"none"}}>
                <p style={{fontSize:13,fontWeight:700,color:"#374151",margin:"0 0 3px"}}>{i+1}. {a.q}</p>
                <p style={{fontSize:12,margin:"0 0 2px",color:a.correct?"#059669":"#DC2626",fontWeight:700}}>{a.correct?"✅ Correct":"❌ "+a.chosen+" → "+a.answer}</p>
                {!a.correct&&<p style={{fontSize:12,color:"#6b7280",margin:0}}>💡 {a.explanation}</p>}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setQuizDone(false);setQuizActive(false);}} style={{flex:1,padding:"14px",borderRadius:12,border:"2px solid rgba(255,255,255,0.4)",background:"transparent",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>⚙️ New Quiz</button>
            <button onClick={startQuiz} style={{flex:1,padding:"14px",borderRadius:12,border:"none",background:"white",color:"#4F46E5",fontWeight:800,fontSize:14,cursor:"pointer"}}>🔄 Try Again</button>
          </div>
        </PageWrap>
      )}

      {/* ── PROGRESS / STATS ── */}
      {tab==="progress"&&(
        <PageWrap>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>📊 My Stats</h2>
          {!user?(
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:56,marginBottom:16}}>🔒</div>
              <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"0 0 8px"}}>Sign in to see your stats</h2>
              <p style={{color:"#c7d2fe",fontSize:14,margin:"0 0 20px"}}>Track your progress, streaks and badges!</p>
              <button onClick={()=>setShowAuth(true)} style={{padding:"12px 28px",borderRadius:14,background:"white",color:"#3730a3",fontWeight:800,fontSize:15,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In / Register →</button>
            </div>
          ):(
            <>
              <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>{user.full_name||user.email}</p>
              {/* streak widget */}
              <StreakWidget streak={progress?.streak_days||0}/>
              {/* level */}
              <div style={{background:"white",borderRadius:20,padding:"18px",marginBottom:12,boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontWeight:800,fontSize:16,color:"#1e1b4b"}}>🚀 Level {curLevel}</span>
                  <span style={{fontSize:12,color:"#6b7280"}}>{xpInLevel}/{xpNeeded} XP to next level</span>
                </div>
                <div style={{height:12,background:"#e5e7eb",borderRadius:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.round((xpInLevel/xpNeeded)*100)}%`,background:"linear-gradient(90deg,#F59E0B,#EF4444)",borderRadius:6,transition:"width 1s"}}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:14}}>
                  {[{v:progress?.total_questions||0,l:"Questions",c:"#4F46E5"},{v:(progress?.total_questions>0?Math.round(((progress?.total_correct||0)/progress.total_questions)*100):0)+"%",l:"Accuracy",c:"#059669"},{v:progress?.xp||0,l:"Total XP",c:"#F59E0B"},{v:"🔥"+(progress?.streak_days||0),l:"Streak",c:"#DC2626"}].map((s,i)=>(
                    <div key={i} style={{textAlign:"center",background:"#f8fafc",borderRadius:12,padding:"10px 6px"}}>
                      <div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div>
                      <div style={{fontSize:10,color:"#6b7280"}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* subject breakdown */}
              <div style={{background:"white",borderRadius:20,padding:"18px",marginBottom:12,boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
                <p style={{fontWeight:800,fontSize:14,color:"#1e1b4b",margin:"0 0 12px"}}>📚 By Subject</p>
                {Object.entries(SUBJECT_LABELS).map(([s,label])=>{
                  const st=progress?.subject_stats?.[s]||{q:0,c:0};
                  const sp=st.q>0?Math.round((st.c/st.q)*100):0;
                  return <div key={s} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#374151"}}>{label}</span>
                      <span style={{fontSize:13,fontWeight:700,color:SUBJECT_COLOURS[s]}}>{Math.round(st.c||0)}/{Math.round(st.q||0)} ({sp}%)</span>
                    </div>
                    <div style={{height:8,background:"#e5e7eb",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${sp}%`,background:SUBJECT_COLOURS[s],borderRadius:4,transition:"width 1s"}}/>
                    </div>
                  </div>;
                })}
              </div>
              {/* badges */}
              {(()=>{
                const earned=BADGES.filter(b=>(progress?.badges||[]).includes(b.id));
                const locked=BADGES.filter(b=>!(progress?.badges||[]).includes(b.id));
                return (
                  <div style={{background:"white",borderRadius:20,padding:"18px",marginBottom:12,boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
                    <p style={{fontWeight:800,fontSize:14,color:"#1e1b4b",margin:"0 0 12px"}}>🏅 Badges ({earned.length}/{BADGES.length})</p>
                    {earned.length===0&&<p style={{color:"#9ca3af",fontSize:13,textAlign:"center",marginBottom:10}}>Complete your first quiz to earn badges!</p>}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                      {earned.map(b=>(
                        <div key={b.id} style={{background:"#FFFBEB",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"1.5px solid #FDE68A"}}>
                          <div style={{fontSize:26}}>{b.icon}</div>
                          <div style={{fontSize:11,fontWeight:800,color:"#92400E"}}>{b.name}</div>
                          <div style={{fontSize:10,color:"#6b7280"}}>{b.desc}</div>
                          {b.xp>0&&<div style={{fontSize:10,color:"#D97706",fontWeight:700}}>+{b.xp} XP</div>}
                        </div>
                      ))}
                    </div>
                    {locked.length>0&&<>
                      <p style={{fontWeight:700,fontSize:12,color:"#9ca3af",margin:"0 0 8px"}}>🔒 Locked ({locked.length})</p>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                        {locked.map(b=>(
                          <div key={b.id} style={{background:"#f8fafc",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"1.5px solid #e5e7eb",opacity:0.5}}>
                            <div style={{fontSize:26,filter:"grayscale(1)"}}>{b.icon}</div>
                            <div style={{fontSize:11,fontWeight:800,color:"#374151"}}>{b.name}</div>
                            <div style={{fontSize:10,color:"#6b7280"}}>{b.desc}</div>
                          </div>
                        ))}
                      </div>
                    </>}
                  </div>
                );
              })()}
              {/* notifications */}
              <div style={{background:"white",borderRadius:20,padding:"18px",marginBottom:12,boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
                <p style={{fontWeight:800,fontSize:14,color:"#1e1b4b",margin:"0 0 12px"}}>🔔 Daily Practice Reminders</p>
                <p style={{fontSize:13,color:"#6b7280",margin:"0 0 12px"}}>Get notified each day to keep your streak alive!</p>
                <NotificationSetup/>
              </div>
              {/* recent sessions */}
              {sessions.length>0&&(
                <div style={{background:"white",borderRadius:20,padding:"18px",boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
                  <p style={{fontWeight:800,fontSize:14,color:"#1e1b4b",margin:"0 0 12px"}}>📋 Recent Quizzes</p>
                  {sessions.slice(0,8).map((s,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<Math.min(sessions.length,8)-1?"1px solid #f3f4f6":"none"}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:"#1e1b4b"}}>{s.subjects?.map(x=>SUBJECT_LABELS[x]?.split(" ")[0]).join(", ")}</div>
                        <div style={{fontSize:11,color:"#6b7280"}}>{s.date} · {s.difficulty} · {s.total}q</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:800,fontSize:14,color:s.percentage>=80?"#059669":s.percentage>=60?"#D97706":"#DC2626"}}>{s.percentage}%</div>
                        <div style={{fontSize:11,color:"#F59E0B",fontWeight:700}}>+{s.xp_earned} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </PageWrap>
      )}

      {/* ── LEADERBOARD ── */}
      {tab==="leaderboard"&&(
        <PageWrap>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>🏆 Leaderboard</h2>
          <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>Compete with friends & siblings — who's top of the class?</p>
          {user&&progress&&(
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28}}>⭐</div>
              <div>
                <div style={{color:"white",fontWeight:800,fontSize:14}}>Your standing</div>
                <div style={{color:"#c7d2fe",fontSize:12}}>{progress.xp||0} XP · 🔥{progress.streak_days||0} streak · {(progress.badges||[]).length} badges</div>
              </div>
            </div>
          )}
          <LeaderboardView user={user} onSignIn={()=>setShowAuth(true)}/>
        </PageWrap>
      )}

      {/* ── SCHOOLS ── */}
      {tab==="schools"&&(
        <PageWrap>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>🏫 Grammar Schools</h2>
          <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>London & surrounding area — entry info & tips</p>
          {SCHOOLS.map((s,i)=>(
            <div key={i} style={{background:"white",borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:"0 4px 15px rgba(0,0,0,0.15)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontWeight:800,fontSize:14,color:"#1e1b4b",flex:1}}>{s.name}</div>
                <span style={{background:"#EEF2FF",color:"#4F46E5",fontWeight:700,fontSize:10,borderRadius:8,padding:"3px 8px",flexShrink:0,marginLeft:8}}>{s.area}</span>
              </div>
              <div style={{fontSize:12,color:"#6b7280",marginBottom:2}}>📝 {s.exam}</div>
              <div style={{fontSize:12,color:"#374151",fontWeight:600}}>🎯 {s.score}</div>
            </div>
          ))}
        </PageWrap>
      )}
    </div>
  );
}
