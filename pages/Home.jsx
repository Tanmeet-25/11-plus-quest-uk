import { useState, useEffect, useRef } from "react";
import { UserProgress, QuizSession, Leaderboard, VisitorCount } from "../api/entities";
import { useAppContext } from "../api/app-context";

// ─── BADGES ───────────────────────────────────────────────────────────────────
const BADGES = [
  { id:"first_quiz",   icon:"🎯", name:"First Steps",       desc:"Complete your first quiz",             xp:10  },
  { id:"streak_3",     icon:"🔥", name:"On Fire",           desc:"3-day practice streak",                xp:30  },
  { id:"streak_7",     icon:"💎", name:"Diamond Streak",    desc:"7-day practice streak",                xp:100 },
  { id:"perfect_10",   icon:"⭐", name:"Perfect 10",        desc:"Score 100% on a 10-question quiz",     xp:50  },
  { id:"century",      icon:"💯", name:"Century",           desc:"Answer 100 questions total",           xp:75  },
  { id:"maths_master", icon:"🔢", name:"Maths Master",      desc:"Score 80%+ on 5 maths quizzes",        xp:60  },
  { id:"verbal_ace",   icon:"📖", name:"Verbal Ace",        desc:"Score 80%+ on 5 verbal quizzes",       xp:60  },
  { id:"nvr_ninja",    icon:"🔷", name:"NVR Ninja",         desc:"Score 80%+ on 5 NVR quizzes",          xp:60  },
  { id:"english_star", icon:"✍️", name:"English Star",      desc:"Score 80%+ on 5 English quizzes",      xp:60  },
  { id:"hard_mode",    icon:"🏆", name:"Hard Mode Hero",    desc:"Complete a Hard difficulty quiz",       xp:80  },
  { id:"level_5",      icon:"🚀", name:"Rising Star",       desc:"Reach Level 5",                        xp:0   },
  { id:"level_10",     icon:"👑", name:"Grammar Champion",  desc:"Reach Level 10",                       xp:0   },
];

function xpForLevel(lvl) { return lvl * 100; }
function calcLevel(xp) {
  let l=1, x=xp;
  while(x>=xpForLevel(l)){x-=xpForLevel(l);l++;}
  return {level:l,xpInLevel:x,xpNeeded:xpForLevel(l)};
}

// ─── SUBJECT CONFIG ───────────────────────────────────────────────────────────
const SUBJECT_LABELS   = { maths:"🔢 Maths", english:"✍️ English", verbal:"📖 Verbal Reasoning", nvr:"🔷 Non-Verbal Reasoning" };
const SUBJECT_COLOURS  = { maths:"#4F46E5", english:"#059669", verbal:"#D97706", nvr:"#DC2626" };
const SUBJECT_BG       = { maths:"#EEF2FF", english:"#ECFDF5", verbal:"#FFFBEB", nvr:"#FEF2F2" };
const DIFF_COLOURS     = { easy:"#059669", medium:"#D97706", hard:"#DC2626" };
const DIFF_XP          = { easy:5, medium:10, hard:20 };

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
      {q:"Which sentence is in the passive voice?", options:["The dog chased the cat.","The cat was chased by the dog.","The dog is chasing.","A dog chases cats."], answer:"The cat was chased by the dog.", topic:"Grammar", explanation:"In passive voice, the subject receives the action. The verb 'was chased' tells us the cat had something done to it."},
      {q:"What does 'ambiguous' mean?", options:["Completely clear","Open to more than one meaning","Extremely difficult","Very long"], answer:"Open to more than one meaning", topic:"Vocabulary", explanation:"Ambiguous means unclear — it could be interpreted in more than one way."},
      {q:"Which literary device is used in: 'The thunder roared'?", options:["Simile","Metaphor","Personification","Alliteration"], answer:"Personification", topic:"Literacy", explanation:"Personification gives human qualities to non-human things. Thunder can't actually roar — it's given a human quality."},
      {q:"What is the root of 'transportation'?", options:["Trans","Port","Ation","Sport"], answer:"Port", topic:"Vocabulary", explanation:"'Port' (Latin: portare) means to carry. Transport = carry across. This root appears in portable, export, import."},
      {q:"Correct sentence?", options:["Me and him went to the shop.","Him and me went to the shop.","He and I went to the shop.","I and him went to the shop."], answer:"He and I went to the shop.", topic:"Grammar", explanation:"Use 'he' and 'I' when they are the subject of the sentence (doing the action)."},
      {q:"What type of clause is 'which was broken'?", options:["Main clause","Subordinate clause","Noun clause","Adverbial clause"], answer:"Subordinate clause", topic:"Grammar", explanation:"A subordinate clause cannot stand alone — it depends on a main clause to make sense."},
    ],
    hard:[
      {q:"What is the effect of starting sentences with 'But' or 'And'?", options:["It is always incorrect","It creates emphasis and informal tone","It makes writing more formal","It is only used in poetry"], answer:"It creates emphasis and informal tone", topic:"Literacy", explanation:"Starting with 'But' or 'And' can create emphasis and a conversational feel. It's a deliberate stylistic choice."},
      {q:"'The soldier was like a lion in battle.' This is a:", options:["Metaphor","Simile","Hyperbole","Personification"], answer:"Simile", topic:"Literacy", explanation:"This uses 'like' to compare — making it a simile, not a metaphor."},
      {q:"What does 'pedantic' mean?", options:["Rude and arrogant","Overly concerned with minor details","Extremely creative","Very lazy"], answer:"Overly concerned with minor details", topic:"Vocabulary", explanation:"A pedantic person focuses excessively on small, unimportant rules or details."},
      {q:"Which word best completes: 'Despite being _____, she smiled.'?", options:["joyful","ecstatic","exhausted","energetic"], answer:"exhausted", topic:"Comprehension", explanation:"'Despite' signals a contrast. Smiling despite being exhausted creates a meaningful contrast."},
      {q:"What is the tone of: 'The empty street echoed with silence'?", options:["Joyful","Mysterious/melancholic","Angry","Humorous"], answer:"Mysterious/melancholic", topic:"Literacy", explanation:"'Empty', 'echoed', and 'silence' all create a lonely, atmospheric tone."},
    ],
  },
  verbal:{
    easy:[
      {q:"Which word means the same as HAPPY?",       options:["Sad","Joyful","Angry","Tired"],          answer:"Joyful",   topic:"Synonyms",   explanation:"Joyful = very happy. Synonyms have the same meaning."},
      {q:"Opposite of BIG?",                          options:["Large","Huge","Small","Wide"],           answer:"Small",    topic:"Antonyms",   explanation:"Big and small are opposites (antonyms)."},
      {q:"Dog : Puppy :: Cat : ___",                  options:["Kitten","Cub","Foal","Lamb"],            answer:"Kitten",   topic:"Analogies",  explanation:"Puppy=baby dog. Kitten=baby cat."},
      {q:"Odd one out: Robin, Sparrow, Penguin, Eagle",options:["Robin","Sparrow","Penguin","Eagle"],    answer:"Penguin",  topic:"Odd One Out",explanation:"Robin, Sparrow, Eagle fly. Penguins cannot!"},
      {q:"Correctly spelled?",                        options:["Recieve","Achieve","Beleive","Freind"],  answer:"Achieve",  topic:"Spelling",   explanation:"i before e except after c. Achieve ✓"},
      {q:"Next: A, C, E, G, ___",                     options:["H","I","J","K"],                        answer:"I",        topic:"Sequences",  explanation:"Skip one letter: A(B)C(D)E(F)G(H)I."},
      {q:"Which word means the same as SAD?",         options:["Gleeful","Mournful","Cheerful","Elated"], answer:"Mournful", topic:"Synonyms",  explanation:"Mournful means full of sorrow — a synonym for sad."},
    ],
    medium:[
      {q:"Opposite of ANCIENT?",                     options:["Old","Historic","Modern","Aged"],         answer:"Modern",   topic:"Antonyms",   explanation:"Ancient=very old. Opposite=modern."},
      {q:"If CAT=DBU, what is DOG?",                  options:["CPH","EPH","ENH","EPI"],                answer:"EPH",      topic:"Codes",      explanation:"+1 each letter: D→E, O→P, G→H=EPH."},
      {q:"Book : Library :: Painting : ___",          options:["School","Gallery","Museum","Theatre"],   answer:"Gallery",  topic:"Analogies",  explanation:"Books in library. Paintings in gallery."},
      {q:"Next: Z, X, V, T, ___",                     options:["P","Q","R","S"],                        answer:"R",        topic:"Sequences",  explanation:"Backwards, skip one: Z(Y)X(W)V(U)T(S)R."},
      {q:"Odd one out: Triangle, Circle, Square, Pyramid",options:["Triangle","Circle","Square","Pyramid"],answer:"Pyramid",topic:"Odd One Out",explanation:"Triangle/Circle/Square=2D. Pyramid=3D."},
      {q:"Synonym of ENORMOUS?",                      options:["Tiny","Average","Huge","Narrow"],        answer:"Huge",     topic:"Synonyms",   explanation:"Enormous=very large=huge."},
      {q:"If A=1,B=2... what does 2-5-4 spell?",     options:["BED","CAT","ACE","BAD"],                 answer:"BED",      topic:"Codes",      explanation:"B=2, E=5, D=4 → BED."},
    ],
    hard:[
      {q:"Most similar to METICULOUS?",               options:["Careless","Precise","Hasty","Vague"],    answer:"Precise",  topic:"Synonyms",   explanation:"Meticulous=very careful and precise."},
      {q:"Antonym of BENEVOLENT?",                    options:["Kind","Generous","Malevolent","Brave"],  answer:"Malevolent",topic:"Antonyms",  explanation:"Benevolent=good/kind. Malevolent=evil/wishing harm."},
      {q:"Next: A, D, G, J, ___",                     options:["K","L","M","N"],                        answer:"M",        topic:"Sequences",  explanation:"+3 positions: A→D→G→J→M."},
      {q:"Scalpel : Surgeon :: Gavel : ___",          options:["Builder","Judge","Teacher","Artist"],    answer:"Judge",    topic:"Analogies",  explanation:"A scalpel is a surgeon's tool. A gavel is a judge's tool."},
      {q:"Antonym of TRANSPARENT?",                   options:["Clear","Bright","Opaque","Shiny"],       answer:"Opaque",   topic:"Antonyms",   explanation:"Transparent=see-through. Opaque=cannot see through."},
    ],
  },
  nvr:{
    easy:[
      {q:"How many sides does a hexagon have?",  options:["5","6","7","8"],               answer:"6",  topic:"Shapes",    explanation:"Hex=6. Hexagon=6 sides. Like a honeycomb!"},
      {q:"How many faces does a cube have?",     options:["4","5","6","8"],               answer:"6",  topic:"3D Shapes", explanation:"Top, bottom, front, back, left, right = 6 faces."},
      {q:"Which shape has all equal sides AND all equal angles?", options:["Rectangle","Rhombus","Square","Trapezium"], answer:"Square", topic:"Shapes", explanation:"A square has 4 equal sides and 4 right angles (90°)."},
      {q:"If you rotate a square 90°, what do you get?", options:["Rectangle","Triangle","Square","Pentagon"], answer:"Square", topic:"Rotation", explanation:"A square looks the same after 90° rotation — it has rotational symmetry of order 4."},
      {q:"How many lines of symmetry does a circle have?", options:["0","1","4","Infinite"], answer:"Infinite", topic:"Symmetry", explanation:"Any line through the centre of a circle is a line of symmetry — infinite lines!"},
      {q:"What is the next shape if the pattern is: circle, square, triangle, circle, square, ___?", options:["Circle","Square","Triangle","Hexagon"], answer:"Triangle", topic:"Patterns", explanation:"The pattern repeats every 3 shapes: circle, square, triangle."},
    ],
    medium:[
      {q:"How many edges does a cuboid have?",   options:["8","10","12","14"],            answer:"12", topic:"3D Shapes", explanation:"A cuboid has 12 edges: 4 on top, 4 on bottom, 4 vertical."},
      {q:"A shape has 5 faces, 8 edges, 5 vertices. What is it?", options:["Cube","Cylinder","Square-based pyramid","Triangular prism"], answer:"Square-based pyramid", topic:"3D Shapes", explanation:"Square base (1) + 4 triangular faces=5 faces. This is a square-based pyramid."},
      {q:"Which transformation preserves size and shape?", options:["Enlargement","Reflection","Distortion","Shearing"], answer:"Reflection", topic:"Transformations", explanation:"Reflection, rotation, and translation all preserve size and shape. Enlargement changes size."},
      {q:"A pattern goes: 2 dots, 4 dots, 8 dots. Next?", options:["10","12","16","20"], answer:"16",  topic:"Patterns",  explanation:"Each term doubles: 2→4→8→16. This is a geometric sequence."},
      {q:"How many lines of symmetry does an equilateral triangle have?", options:["0","1","2","3"], answer:"3", topic:"Symmetry", explanation:"An equilateral triangle has 3 equal sides and 3 lines of symmetry."},
      {q:"If a square is reflected in a vertical mirror line, the result is:", options:["A rectangle","The same square","A rhombus","A parallelogram"], answer:"The same square", topic:"Transformations", explanation:"A square reflected in any axis of symmetry looks identical."},
    ],
    hard:[
      {q:"Euler's formula: F + V − E = ? for any polyhedron", options:["1","2","3","4"], answer:"2",   topic:"3D Shapes",  explanation:"Euler's formula: Faces + Vertices − Edges = 2 for all convex polyhedra."},
      {q:"A grid has a repeating pattern. Row 1: △○□. Row 2: ○□△. Row 3: □△○. Row 4: ?", options:["△○□","○□△","□△○","△□○"], answer:"△○□", topic:"Matrices", explanation:"The pattern rotates left each row. After △○□ → ○□△ → □△○, it returns to △○□."},
      {q:"How many faces does a dodecahedron have?", options:["10","12","20","24"],       answer:"12",  topic:"3D Shapes",  explanation:"A dodecahedron has 12 pentagonal faces. Dodeca=12."},
      {q:"Which net CANNOT fold into a cube?", options:["A cross of 6 squares","A T-shape of 6 squares","An L-shape of 6 squares","A 2×3 grid of 6 squares"], answer:"A 2×3 grid of 6 squares", topic:"Nets", explanation:"A 2×3 grid cannot fold into a cube — opposite faces won't meet correctly. This is a key NVR skill to visualise."},
    ],
  },
};

// ─── AI TUTOR TOPICS ──────────────────────────────────────────────────────────
const AI_TUTOR_TOPICS = [
  { id:"times-tables",  subject:"maths",   icon:"✖️",  title:"Times Tables",         intro:"Great choice! Times tables are the foundation of all maths. I'll teach you every trick to master them — let's start from the beginning like a real lesson." },
  { id:"fractions",     subject:"maths",   icon:"½",   title:"Fractions",            intro:"Fractions trip up loads of students — but not for long! I'll walk you through what fractions actually mean, then build up to the tricky stuff step by step." },
  { id:"percentages",   subject:"maths",   icon:"％",  title:"Percentages",          intro:"Percentages are everywhere in the 11+ — let me teach you the shortcuts that make them quick and easy, just like a classroom lesson." },
  { id:"ratio",         subject:"maths",   icon:"⚖️",  title:"Ratio & Proportion",   intro:"Ratio questions look scary but follow a simple method every time. Let me show you exactly how — step by step, with worked examples." },
  { id:"algebra",       subject:"maths",   icon:"🔣",  title:"Algebra & Sequences",  intro:"Algebra might sound complicated, but it's just solving puzzles. I'll build up from the very basics and get you confident with any 11+ algebra question." },
  { id:"geometry",      subject:"maths",   icon:"📐",  title:"Geometry & Shapes",    intro:"From area and perimeter to angles and 3D shapes — let me guide you through all the key geometry you'll need, with clear explanations and examples." },
  { id:"punctuation",   subject:"english", icon:"✏️",  title:"Punctuation",          intro:"Punctuation is one of the most tested areas in 11+ English. Let me teach you every rule — apostrophes, commas, colons — clearly and properly." },
  { id:"grammar",       subject:"english", icon:"📝",  title:"Grammar",              intro:"Nouns, verbs, adjectives, clauses — grammar is the backbone of English. Let me walk you through each part of speech and how sentences work." },
  { id:"vocabulary",    subject:"english", icon:"📚",  title:"Vocabulary & Roots",   intro:"Having a wide vocabulary is a huge advantage in the 11+. I'll teach you word roots, prefixes, and suffixes so you can work out words you've never seen." },
  { id:"literacy",      subject:"english", icon:"🖊️",  title:"Literary Devices",     intro:"Similes, metaphors, personification, oxymorons — these come up constantly in comprehension. Let me teach you what they are and how to spot them." },
  { id:"synonyms",      subject:"verbal",  icon:"🔄",  title:"Synonyms & Antonyms",  intro:"Synonym and antonym questions test how wide your vocabulary is. Let me teach you the best strategies and the most common words that come up in the 11+." },
  { id:"analogies",     subject:"verbal",  icon:"🔗",  title:"Analogies",            intro:"Analogies test logical thinking and vocabulary together. I'll teach you the method for cracking any analogy question — it's simpler than it looks!" },
  { id:"codes",         subject:"verbal",  icon:"🔐",  title:"Codes & Sequences",    intro:"Code questions seem mysterious — but they always follow a pattern. Let me teach you every type of code that appears in the 11+ and how to crack them fast." },
  { id:"odd-one-out",   subject:"verbal",  icon:"🎯",  title:"Odd One Out",          intro:"Odd one out questions test categories and lateral thinking. I'll show you the strategies to find what doesn't belong — every single time." },
  { id:"symmetry",      subject:"nvr",     icon:"🔄",  title:"Symmetry & Reflection",intro:"Symmetry is a core NVR skill. I'll walk you through lines of symmetry, reflections, and how to spot them in any shape — with clear visual examples." },
  { id:"patterns",      subject:"nvr",     icon:"🔲",  title:"Patterns & Matrices",  intro:"Pattern recognition is what NVR is all about. I'll teach you how to identify rules in sequences and matrices — the skill that most students struggle with." },
  { id:"3d-shapes",     subject:"nvr",     icon:"🧊",  title:"3D Shapes & Nets",     intro:"Visualising 3D shapes is tough on paper — but I'll teach you exactly how to think about faces, edges, vertices and nets like an expert." },
  { id:"transformations",subject:"nvr",   icon:"↩️",  title:"Transformations",       intro:"Rotation, reflection, translation — these are all tested in NVR. I'll explain each one with step-by-step examples so you can tackle any transformation question." },
];

// ─── AI TUTOR CHAT ───────────────────────────────────────────────────────────
const TUTOR_SCRIPTS = {
  "times-tables": [
    { role:"tutor", text:"Welcome to your Times Tables lesson! 🎓 Before we dive in, I want to ask — which tables do you find hardest? (Type a number like '6', '7', or '8')" },
    { role:"tutor", text:"Great! The trickiest tables for most students are 6×7, 6×8, 7×8, and 8×8. Here's the secret: instead of memorising them all separately, you just need a few tricks.\n\n🔑 **Trick 1: The 9× trick**\nHold up all 10 fingers. For 9×3, fold down finger 3. You'll see 2 fingers on the left and 7 on the right → 27!\n\nTry it with 9×6. What do you get?" },
    { role:"tutor", text:"Exactly! 9×6=54 (fold finger 6: 5 on left, 4 on right).\n\n🔑 **Trick 2: Square numbers** — memorise these:\n• 6×6=36 • 7×7=49 • 8×8=64 • 9×9=81 • 12×12=144\n\nOnce you know the squares, you can work out nearby facts:\n• 7×8 = 7×7+7 = 49+7 = **56** ✓\n• 8×9 = 8×8+8 = 64+8 = **72** ✓\n\nCan you work out 6×7 using 6×6?" },
    { role:"tutor", text:"Perfect! 6×7 = 6×6+6 = 36+6 = **42** ✓\n\n🔑 **Trick 3: The 12× table**\nBreak it into 10× and 2×:\n• 12×7 = (10×7)+(2×7) = 70+14 = **84**\n• 12×9 = (10×9)+(2×9) = 90+18 = **108**\n\n💡 **Quick test:** What is 12×11?" },
    { role:"tutor", text:"Brilliant! 12×11 = (10×11)+(2×11) = 110+22 = **132** ✓\n\n📋 **Your revision list** — learn these 10 facts and you'll know ALL the hard tables:\n1. 6×6=36  2. 6×7=42  3. 6×8=48\n4. 6×9=54  5. 7×7=49  6. 7×8=56\n7. 7×9=63  8. 8×8=64  9. 8×9=72\n10. 9×9=81\n\n🏆 You've completed the Times Tables lesson! Now go test yourself in the Quiz section with Maths → Easy difficulty. Well done!" },
  ],
  "fractions": [
    { role:"tutor", text:"Welcome to your Fractions lesson! 🎓 Fractions are one of the most common topics in the 11+. Let's start right from the beginning.\n\n**What is a fraction?**\nA fraction represents a part of a whole. For example, if you cut a pizza into 4 equal slices and eat 1, you've eaten **¼** (one quarter).\n\n• The **numerator** (top) = how many parts you have\n• The **denominator** (bottom) = total number of equal parts\n\nQuick check: In the fraction **3/5**, which is the denominator?" },
    { role:"tutor", text:"Correct! The denominator is **5** — the total number of parts. The numerator is 3.\n\n**Finding fractions of amounts** — this is the most common question type:\n\n🔑 **The method:**\n1. Divide by the denominator (bottom)\n2. Multiply by the numerator (top)\n\n**Example:** ¾ of 40\n→ Step 1: 40 ÷ 4 = 10 (find ¼)\n→ Step 2: 10 × 3 = 30 (multiply to get ¾)\n\n💡 Try this: What is ⅔ of 18?" },
    { role:"tutor", text:"Let's check: ⅔ of 18\n→ 18 ÷ 3 = 6 (find ⅓)\n→ 6 × 2 = **12** (multiply to get ⅔) ✓\n\n**Equivalent fractions** — fractions that are equal in value:\n½ = 2/4 = 4/8 = 5/10\n\nTo find them, multiply or divide top AND bottom by the same number.\n\n**Simplifying fractions:**\nDivide both numbers by their Highest Common Factor (HCF).\n\nExample: Simplify 8/12\n→ HCF of 8 and 12 = 4\n→ 8÷4 = 2, 12÷4 = 3 → **2/3** ✓\n\n💡 Simplify 6/9. What do you get?" },
    { role:"tutor", text:"HCF of 6 and 9 is **3**. So 6÷3=2, 9÷3=3 → **2/3** ✓\n\n**Adding and subtracting fractions:**\nThe denominators must be the same first!\n\n1/4 + 2/4 = 3/4 ← easy, same denominator\n1/3 + 1/4 → make them the same: 4/12 + 3/12 = **7/12**\n\n💡 Final challenge: What is 1/2 + 1/3?" },
    { role:"tutor", text:"1/2 + 1/3 → common denominator is 6:\n→ 3/6 + 2/6 = **5/6** ✓\n\n🏆 **Lesson complete!** Here's your summary:\n\n✅ Fraction of an amount: divide by bottom, multiply by top\n✅ Simplify: divide by the HCF\n✅ Add/subtract: make denominators equal first\n✅ Equivalent fractions: multiply or divide top and bottom by the same number\n\nHead to the Quiz — Maths → Medium — and try the fraction questions! You're ready 💪" },
  ],
  "grammar": [
    { role:"tutor", text:"Welcome to your Grammar lesson! 🎓 Grammar is tested heavily in 11+ English — understanding it properly can make a huge difference.\n\n**Parts of Speech — the building blocks:**\n\n📌 **Noun** — a naming word (person, place, thing, feeling)\n*Examples: teacher, London, happiness, cat*\n\n📌 **Verb** — an action or state word\n*Examples: run, think, is, became*\n\n📌 **Adjective** — describes a noun\n*Examples: brilliant, quiet, ancient*\n\n📌 **Adverb** — describes a verb, adjective or other adverb\n*Examples: quickly, very, silently*\n\n💡 Quick test: In 'The **brave** soldier **ran** quickly', which word is the adjective?" },
    { role:"tutor", text:"Correct! **Brave** is the adjective — it describes the noun 'soldier'. And 'quickly' is the adverb — it tells us HOW he ran.\n\n**Clauses — this is really important:**\n\n📌 **Main clause** — makes sense on its own\n*'The dog barked'* ✓ (complete sentence)\n\n📌 **Subordinate clause** — depends on the main clause\n*'because it heard a noise'* ✗ (doesn't make sense alone)\n\nTogether: *'The dog barked because it heard a noise.'*\n\nSubordinate clauses often start with: because, although, when, if, while, since, unless\n\n💡 Which part is the subordinate clause in: 'Although she was tired, she kept studying.'?" },
    { role:"tutor", text:"'Although she was tired' — correct! It can't stand alone. 'She kept studying' is the main clause.\n\n**Active vs Passive Voice:**\n\n📌 **Active:** The subject DOES the action\n*'The cat chased the mouse.'*\n\n📌 **Passive:** The subject RECEIVES the action\n*'The mouse was chased by the cat.'*\n\nHow to spot passive: look for **was/were/is/are** + past participle (chased, eaten, broken)\n\n💡 Is this active or passive? 'The cake was eaten by the children.'" },
    { role:"tutor", text:"Passive ✓ — 'was eaten' is the giveaway. The subject (cake) is receiving the action.\n\n**Apostrophes — the most common punctuation mistake:**\n\n📌 **Contraction apostrophes** — show missing letters:\n• it is → **it's**\n• do not → **don't**\n• they are → **they're**\n\n📌 **Possession apostrophes** — show belonging:\n• The dog's lead (one dog)\n• The dogs' leads (multiple dogs)\n\n⚠️ **Never use an apostrophe for a simple plural!**\n❌ Apple's for sale ← WRONG\n✅ Apples for sale ← correct\n\n💡 Which is correct: 'The boys' coats' or 'The boy's coats' if there are several boys?" },
    { role:"tutor", text:"'The boys' coats' ✓ — the apostrophe goes AFTER the 's' when the noun is already plural.\n\n🏆 **Grammar lesson complete!** Your summary:\n\n✅ Nouns name things, verbs show actions, adjectives describe nouns, adverbs describe verbs\n✅ Subordinate clauses can't stand alone — they depend on a main clause\n✅ Active = subject does it. Passive = subject receives it.\n✅ Apostrophes: contractions (it's) and possession (the dog's) — never for plurals!\n\nNow try the Quiz — English → Medium — to practise what you've learned! 🌟" },
  ],
  "synonyms": [
    { role:"tutor", text:"Welcome to your Synonyms & Antonyms lesson! 🎓 These are some of the most common question types in Verbal Reasoning — and the best way to get good is to understand patterns.\n\n**Synonyms** = words with the SAME (or similar) meaning\n**Antonyms** = words with the OPPOSITE meaning\n\n💡 Quick ones:\n• Synonym of HAPPY → joyful, elated, content, gleeful\n• Antonym of HAPPY → sad, miserable, melancholy, sorrowful\n\nNotice how there are MULTIPLE synonyms — the 11+ might use an unusual one to catch you out!\n\nWhich of these is NOT a synonym of 'brave'? Courageous / Bold / Fearful / Valiant" },
    { role:"tutor", text:"Fearful ✓ — that's actually an antonym! The others (courageous, bold, valiant) all mean brave.\n\n**The key to synonyms: word families**\nLearn groups of words together:\n\n🔵 **Happy family:** joyful, elated, content, gleeful, cheerful, blissful\n🔴 **Sad family:** melancholy, mournful, sorrowful, despondent, glum\n🟢 **Brave family:** courageous, valiant, bold, daring, intrepid\n🟡 **Clever family:** intelligent, astute, shrewd, perceptive, gifted\n\n💡 Which word means 'extremely clever'? astute / stupid / clumsy / cautious" },
    { role:"tutor", text:"Astute ✓ — it means clever and quick to notice things.\n\n**Antonym strategy — watch out for these patterns:**\n\n📌 **Prefix antonyms:** add a prefix to flip the meaning\n• happy → **un**happy\n• correct → **in**correct\n• loyal → **dis**loyal\n• honest → **dis**honest\n\n📌 **Completely different word:**\n• ancient ↔ modern\n• transparent ↔ opaque\n• benevolent ↔ malevolent\n\n💡 What is the antonym of 'meticulous' (meaning very careful)?" },
    { role:"tutor", text:"'Careless' — or any word meaning sloppy, negligent ✓\n\n**Tricky vocabulary for the 11+** — these come up regularly:\n\n| Word | Meaning |\n|------|---------|\n| Benevolent | Kind, generous |\n| Malevolent | Evil, wishing harm |\n| Meticulous | Extremely careful |\n| Ambiguous | Having more than one meaning |\n| Transparent | See-through / obvious |\n| Opaque | Not see-through / unclear |\n| Astute | Clever, quick to understand |\n| Timid | Shy, lacking confidence |\n\nTest yourself: what's the antonym of 'transparent'?" },
    { role:"tutor", text:"Opaque ✓ — and now you know both words!\n\n🏆 **Lesson complete!** Your summary:\n\n✅ Synonyms = same meaning. Antonyms = opposite meaning.\n✅ Learn words in families — it's more efficient than memorising one at a time\n✅ Watch for prefix antonyms (un-, in-, dis-, im-)\n✅ Memorise the key 11+ vocab list (benevolent, meticulous, astute, opaque...)\n\nNow head to the Quiz — Verbal Reasoning — and test your vocabulary! 💪" },
  ],
  "symmetry": [
    { role:"tutor", text:"Welcome to your Symmetry & Reflection lesson! 🎓 This is a core NVR skill — and once you understand it properly, it becomes one of the easiest topics.\n\n**What is a line of symmetry?**\nIf you can fold a shape in half and both sides match exactly — that fold line is a line of symmetry.\n\n📌 Lines of symmetry for common shapes:\n• Circle: **infinite** (any line through centre)\n• Square: **4** (2 across, 2 diagonal)\n• Rectangle: **2** (across and down)\n• Equilateral triangle: **3**\n• Regular pentagon: **5**\n• Regular hexagon: **6**\n\n💡 The rule: **a regular polygon with n sides has n lines of symmetry!**\n\nHow many lines of symmetry does a regular octagon have?" },
    { role:"tutor", text:"8 ✓ — an octagon has 8 sides, so 8 lines of symmetry!\n\n**Reflection — how it works:**\nWhen you reflect a shape, every point moves to the mirror image on the other side of the mirror line.\n\n🔑 Key rules:\n• The shape stays the same SIZE and SHAPE\n• The distance from the mirror line stays the same\n• Left ↔ Right flip (for vertical mirror line)\n• Top ↔ Bottom flip (for horizontal mirror line)\n\nIn NVR questions, you'll often see a shape and need to pick its reflection. Always check:\n1. Is it the same size?\n2. Is it correctly flipped (not rotated)?\n3. Is it the right distance from the mirror line?\n\n💡 If a shape has a point 3 squares to the LEFT of the mirror line, where does that point go in the reflection?" },
    { role:"tutor", text:"3 squares to the RIGHT ✓ — it's equidistant on the other side.\n\n**Common NVR trap: Rotation vs Reflection**\nStudents often confuse rotated shapes with reflected shapes!\n\n📌 **Reflection** = mirror image (might look different from the original)\n📌 **Rotation** = spinning the shape (it turns but isn't flipped)\n\nThe key giveaway: **a reflected shape is like your reflection in a mirror** — your right hand appears on the left. **A rotated shape** is like turning a page — it spins but doesn't flip.\n\n💡 If an arrow points to the RIGHT, and you reflect it in a vertical line, which way does it point?" },
    { role:"tutor", text:"To the LEFT ✓ — the reflection flips it horizontally.\n\n**Rotational symmetry** — a separate but related idea:\nA shape has rotational symmetry if it looks the same after being rotated less than 360°.\n\n📌 **Order of rotational symmetry** = how many times it looks the same in one full rotation\n• Square: order **4** (looks same at 90°, 180°, 270°, 360°)\n• Equilateral triangle: order **3**\n• Rectangle: order **2**\n• Regular hexagon: order **6**\n• Circle: infinite\n\n💡 What is the order of rotational symmetry of a regular pentagon?" },
    { role:"tutor", text:"Order **5** ✓ — a regular pentagon looks the same 5 times in a full 360° rotation!\n\n🏆 **Lesson complete!** Your summary:\n\n✅ Lines of symmetry: regular polygon with n sides → n lines\n✅ Reflection: flip over the mirror line, same distance, same size\n✅ Rotation ≠ Reflection — don't confuse them!\n✅ Rotational symmetry order: how many times it looks the same in 360°\n\nNow test yourself in the Quiz — Non-Verbal Reasoning! You've got this 🌟" },
  ],
};

// For topics without full scripts, generate a conversational placeholder
function getDefaultScript(topic) {
  return [
    { role:"tutor", text:`Welcome to your ${topic.title} lesson! 🎓 I'm going to walk you through everything you need to know about this topic — just like a real classroom.\n\nLet's start with the basics. ${topic.intro}\n\nAre you ready to begin? Type 'yes' or ask me any question about ${topic.title} to get started!` },
    { role:"tutor", text:`Great! Let's dive deeper into ${topic.title}. This topic appears regularly in the 11+ — so understanding it properly will give you a real advantage.\n\nAs we go through this, feel free to ask me anything. If something isn't clear, just say so and I'll explain it a different way. That's what a good teacher does!\n\nWhat aspect of ${topic.title} do you find most confusing?` },
    { role:"tutor", text:`You're making great progress! 🌟\n\nHere's the key thing to remember about ${topic.title}: it's all about practice and pattern recognition. The more questions you do, the more the patterns become automatic.\n\n💡 **Top tip:** After this lesson, head straight to the Quiz section and practise ${topic.title} questions immediately. That's how knowledge sticks!\n\nDo you have any questions before we finish?` },
    { role:"tutor", text:`🏆 **Lesson complete!** Well done for working through this with me.\n\nRemember:\n✅ The concepts we covered today will come up in your 11+ exam\n✅ Practise regularly — even 10 minutes a day makes a huge difference\n✅ If you get a quiz question wrong, come back here and we'll go through it together\n\nNow head to the Quiz and put your knowledge to the test! You're doing brilliantly 💪` },
  ];
}

// ─── SCHOOLS DATA ─────────────────────────────────────────────────────────────
const SCHOOLS = [
  {name:"Queen Elizabeth's School, Barnet",type:"Grammar",area:"Barnet",exam:"GL Assessment",score:"Highly selective – top 250 out of ~2500",url:"https://www.qebarnet.co.uk"},
  {name:"Henrietta Barnett School",type:"Grammar",area:"Barnet",exam:"GL Assessment",score:"Most selective in London",url:"https://www.hbschool.org.uk"},
  {name:"Latymer School, Edmonton",type:"Grammar",area:"Enfield",exam:"GL Assessment",score:"Top 120 from ~1800",url:"https://www.latymer.co.uk"},
  {name:"Tiffin Boys' School",type:"Grammar",area:"Kingston",exam:"GL Assessment",score:"Highly selective",url:"https://www.tiffin.kingston.sch.uk"},
  {name:"Tiffin Girls' School",type:"Grammar",area:"Kingston",exam:"GL Assessment",score:"Highly selective",url:"https://www.tiffingirls.org"},
  {name:"Nonsuch High School for Girls",type:"Grammar",area:"Sutton",exam:"GL Assessment",score:"Top selective",url:"https://www.nonsuchschool.org"},
  {name:"Wallington High School for Girls",type:"Grammar",area:"Sutton",exam:"GL Assessment",score:"Top selective",url:"https://www.wallingtongirls.sutton.sch.uk"},
  {name:"Wilson's School",type:"Grammar",area:"Sutton",exam:"GL Assessment",score:"Boys – top selective",url:"https://www.wilsons.school"},
  {name:"St Olave's Grammar School",type:"Grammar",area:"Bromley",exam:"GL Assessment",score:"Top selective",url:"https://www.saintolaves.net"},
  {name:"Newstead Wood School",type:"Grammar",area:"Bromley",exam:"GL Assessment",score:"Girls – top selective",url:"https://www.newsteadwood.co.uk"},
  {name:"Townley Grammar School",type:"Grammar",area:"Bexley",exam:"GL Assessment",score:"Girls – selective",url:"https://www.townleygrammar.org.uk"},
  {name:"Beths Grammar School",type:"Grammar",area:"Bexley",exam:"GL Assessment",score:"Boys – selective",url:"https://www.beths.bexley.sch.uk"},
  {name:"Chislehurst & Sidcup Grammar",type:"Grammar",area:"Bexley",exam:"GL Assessment",score:"Mixed – selective",url:"https://www.csgrammar.com"},
  {name:"Dartford Grammar School (Boys)",type:"Grammar",area:"Kent",exam:"Kent Test (GL)",score:"Selective",url:"https://www.dartfordgrammarschool.org.uk"},
  {name:"Dartford Grammar School (Girls)",type:"Grammar",area:"Kent",exam:"Kent Test (GL)",score:"Selective",url:"https://www.dartfordgrammarschoolforgirls.org"},
  {name:"Colchester Royal Grammar School",type:"Grammar",area:"Essex",exam:"CEM / CSSE",score:"Boys – highly selective",url:"https://www.crgs.co.uk"},
  {name:"Southend High School for Boys",type:"Grammar",area:"Southend",exam:"CSSE",score:"Selective",url:"https://www.shsb.org.uk"},
];

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onAuth }) {
  const [mode, setMode]       = useState("login"); // login | register
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup }     = useAppContext();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode==="login") {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      onAuth();
    } catch(err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:20,fontWeight:900,color:"#1e1b4b"}}>{mode==="login"?"Sign In 🔐":"Create Account 🎓"}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#9ca3af"}}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode==="register" && (
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required
              style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>
          )}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" required
            style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>
          <input value={password} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" required
            style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:14,marginBottom:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
          {error && <p style={{color:"#DC2626",fontSize:13,margin:"0 0 10px",textAlign:"center"}}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
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

// ─── PAGE WRAP ────────────────────────────────────────────────────────────────
function PageWrap({children}) {
  return <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 100px"}}>{children}</div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, logout } = useAppContext();

  const [tab, setTab]             = useState("home");
  const [showAuth, setShowAuth]   = useState(false);

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
  const [progress, setProgress]   = useState(null);
  const [sessions, setSessions]   = useState([]);
  const [visitorCount, setVisitorCount] = useState(null);

  // Learn / AI tutor
  const [learnSubject, setLearnSubject] = useState("maths");
  const [activeTopic, setActiveTopic]   = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput]       = useState("");
  const [scriptIdx, setScriptIdx]       = useState(0);
  const chatEndRef = useRef(null);

  // ── Visitor count ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const records = await VisitorCount.list();
        if (records.length === 0) {
          const rec = await VisitorCount.create({ count: 1 });
          setVisitorCount(rec.count);
        } else {
          const rec = records[0];
          const updated = await VisitorCount.update(rec.id, { count: (rec.count || 0) + 1 });
          setVisitorCount(updated.count);
        }
      } catch { setVisitorCount("..."); }
    })();
  }, []);

  // ── Load progress ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const recs = await UserProgress.filter({ user_id: user.id });
        if (recs.length > 0) setProgress(recs[0]);
        const sess = await QuizSession.filter({ user_id: user.id });
        setSessions(sess.sort((a,b) => new Date(b.date) - new Date(a.date)));
      } catch {}
    })();
  }, [user]);

  // ── Scroll chat ────────────────────────────────────────────────────────────
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);

  // ── Level calc ─────────────────────────────────────────────────────────────
  const { level: curLevel, xpInLevel, xpNeeded } = calcLevel(progress?.xp || 0);

  // ── Start quiz ─────────────────────────────────────────────────────────────
  function startQuiz() {
    let pool = [];
    selSubjects.forEach(s => {
      const qs = QUESTIONS[s]?.[difficulty] || [];
      pool.push(...qs);
    });
    pool = pool.sort(() => Math.random() - 0.5).slice(0, qCount);
    if (pool.length === 0) return;
    setQuiz(pool); setQIdx(0); setScore(0); setAnswers([]);
    setSelected(null); setQuizActive(true); setQuizDone(false);
  }

  // ── Answer ────────────────────────────────────────────────────────────────
  function handleAnswer(opt) {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === quiz[qIdx].answer;
    if (correct) setScore(s => s + 1);
    setAnswers(a => [...a, { q: quiz[qIdx].q, chosen: opt, correct, answer: quiz[qIdx].answer, explanation: quiz[qIdx].explanation }]);
  }

  // ── Next ──────────────────────────────────────────────────────────────────
  async function nextQ() {
    if (qIdx + 1 >= quiz.length) {
      setQuizDone(true); setQuizActive(false);
      // save results
      if (user) await saveResults();
    } else {
      setQIdx(i => i + 1); setSelected(null);
    }
  }

  // ── Save results ──────────────────────────────────────────────────────────
  async function saveResults() {
    const pct   = Math.round((score / quiz.length) * 100);
    const xpEarned = quiz.length * DIFF_XP[difficulty];
    const today = new Date().toISOString().split("T")[0];
    try {
      const existing = await UserProgress.filter({ user_id: user.id });
      const prev = existing[0] || { total_questions:0, total_correct:0, streak_days:0, last_practice_date:null, badges:[], xp:0, level:1, subject_stats:{} };
      const newQ = (prev.total_questions||0) + quiz.length;
      const newC = (prev.total_correct||0) + score;
      const newXP = (prev.xp||0) + xpEarned;
      const lvl = calcLevel(newXP).level;
      // streak
      let streak = prev.streak_days || 0;
      if (prev.last_practice_date === today) { /* same day */ }
      else if (prev.last_practice_date === new Date(Date.now()-86400000).toISOString().split("T")[0]) streak++;
      else streak = 1;
      // subject stats
      const ss = { ...(prev.subject_stats || {}) };
      selSubjects.forEach(s => {
        const sq = quiz.filter(q => QUESTIONS[s]?.[difficulty]?.includes(q));
        if (!ss[s]) ss[s] = { q:0, c:0 };
        ss[s].q += quiz.length / selSubjects.length;
        ss[s].c += score / selSubjects.length;
      });
      // badges
      const badges = [...(prev.badges||[])];
      if (!badges.includes("first_quiz")) badges.push("first_quiz");
      if (streak>=3 && !badges.includes("streak_3")) badges.push("streak_3");
      if (streak>=7 && !badges.includes("streak_7")) badges.push("streak_7");
      if (pct===100 && quiz.length>=10 && !badges.includes("perfect_10")) badges.push("perfect_10");
      if (newQ>=100 && !badges.includes("century")) badges.push("century");
      if (difficulty==="hard" && !badges.includes("hard_mode")) badges.push("hard_mode");
      if (lvl>=5 && !badges.includes("level_5")) badges.push("level_5");
      if (lvl>=10 && !badges.includes("level_10")) badges.push("level_10");
      const data = { user_id:user.id, total_questions:newQ, total_correct:newC, streak_days:streak, last_practice_date:today, badges, xp:newXP, level:lvl, subject_stats:ss };
      if (existing[0]) { await UserProgress.update(existing[0].id, data); }
      else { await UserProgress.create(data); }
      setProgress(data);
      // save session
      const sessData = { user_id:user.id, subjects:selSubjects, difficulty, score, total:quiz.length, percentage:pct, xp_earned:xpEarned, date:today };
      await QuizSession.create(sessData);
      setSessions(s => [sessData, ...s]);
    } catch(e) { console.error(e); }
  }

  // ── AI Tutor ──────────────────────────────────────────────────────────────
  function openTopic(topic) {
    setActiveTopic(topic);
    const script = TUTOR_SCRIPTS[topic.id] || getDefaultScript(topic);
    setChatMessages([script[0]]);
    setScriptIdx(1);
    setChatInput("");
  }

  function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg = { role:"user", text };
    const script = TUTOR_SCRIPTS[activeTopic.id] || getDefaultScript(activeTopic);
    const nextTutor = script[scriptIdx];
    const newMsgs = [userMsg];
    if (nextTutor) newMsgs.push(nextTutor);
    else newMsgs.push({ role:"tutor", text:"Great thinking! 🌟 Keep practising and come back anytime. Head to the Quiz to test what you've learned!" });
    setChatMessages(m => [...m, ...newMsgs]);
    setScriptIdx(i => i + 1);
    setChatInput("");
  }

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (tab==="home") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4F46E5 100%)"}}>
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onAuth={()=>setShowAuth(false)}/>}
      <PageWrap>
        <div style={{textAlign:"center",padding:"32px 0 16px"}}>
          <div style={{fontSize:56,marginBottom:8}}>🎓</div>
          <h1 style={{color:"white",fontWeight:900,fontSize:28,margin:"0 0 4px",letterSpacing:"-0.5px"}}>11+ Quest</h1>
          <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 16px"}}>GL · CEM · ISEB · Independent Schools</p>
          {/* visitor */}
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:16,padding:"12px 20px",display:"inline-flex",alignItems:"center",gap:10,marginBottom:16}}>
            <span style={{fontSize:22}}>👥</span>
            <div style={{textAlign:"left"}}>
              <div style={{color:"white",fontWeight:900,fontSize:20}}>{visitorCount ?? "..."}</div>
              <div style={{color:"#c7d2fe",fontSize:11}}>total visitors all time</div>
            </div>
          </div>
          {/* user greeting or login prompt */}
          {user ? (
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 16px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{color:"white",fontWeight:800,fontSize:14,margin:0}}>👋 Hey, {user.full_name?.split(" ")[0] || "there"}!</p>
                <p style={{color:"#c7d2fe",fontSize:12,margin:"2px 0 0"}}>🔥 {progress?.streak_days||0} day streak · Level {curLevel} · {progress?.xp||0} XP</p>
              </div>
              <button onClick={logout} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",fontSize:11,fontWeight:700,borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>Sign out</button>
            </div>
          ) : (
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 16px",marginBottom:4,textAlign:"center"}}>
              <p style={{color:"white",fontWeight:800,fontSize:13,margin:"0 0 4px"}}>🔒 Sign in to save your progress</p>
              <p style={{color:"#c7d2fe",fontSize:12,margin:"0 0 10px"}}>Track streaks · Earn badges · Climb the leaderboard</p>
              <button onClick={()=>setShowAuth(true)} style={{padding:"10px 24px",borderRadius:12,background:"white",color:"#3730a3",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In / Register →</button>
            </div>
          )}
        </div>
        {/* grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
          {[
            {id:"learn",icon:"📚",title:"Learn",desc:"AI tutor — classroom style",grad:"linear-gradient(135deg,#059669,#047857)"},
            {id:"quiz",icon:"✏️",title:"Quiz",desc:"4 subjects, 3 levels",grad:"linear-gradient(135deg,#4F46E5,#3730a3)"},
            {id:"progress",icon:"📊",title:"My Stats",desc:"History & badges",grad:"linear-gradient(135deg,#D97706,#B45309)"},
            {id:"leaderboard",icon:"🏆",title:"Leaderboard",desc:"Compete with others",grad:"linear-gradient(135deg,#DC2626,#991B1B)"},
          ].map(c=>(
            <button key={c.id} onClick={()=>setTab(c.id)} style={{padding:"20px 16px",borderRadius:20,border:"none",background:c.grad,cursor:"pointer",textAlign:"left",boxShadow:"0 8px 24px rgba(0,0,0,0.25)"}}>
              <div style={{fontSize:32,marginBottom:6}}>{c.icon}</div>
              <div style={{color:"white",fontWeight:900,fontSize:16}}>{c.title}</div>
              <div style={{color:"rgba(255,255,255,0.75)",fontSize:12}}>{c.desc}</div>
            </button>
          ))}
        </div>
        {/* subjects */}
        <div style={{marginTop:16,background:"rgba(255,255,255,0.08)",borderRadius:20,padding:"16px"}}>
          <p style={{color:"#c7d2fe",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>All 4 Subjects</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {Object.entries(SUBJECT_LABELS).map(([id,label])=>(
              <div key={id} style={{background:SUBJECT_BG[id],borderRadius:12,padding:"10px 12px",border:`1.5px solid ${SUBJECT_COLOURS[id]}30`}}>
                <div style={{fontWeight:800,fontSize:13,color:SUBJECT_COLOURS[id]}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={()=>setTab("schools")} style={{width:"100%",marginTop:12,padding:"14px",borderRadius:16,border:"2px solid rgba(255,255,255,0.3)",background:"transparent",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>🏫 Grammar School Info</button>
      </PageWrap>
    </div>
  );

  // ─── SHARED WRAPPER ───────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4F46E5 100%)"}}>
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onAuth={()=>setShowAuth(false)}/>}
      {/* nav */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(30,27,75,0.95)",backdropFilter:"blur(10px)",padding:"10px 16px",display:"flex",gap:6,overflowX:"auto"}}>
        {[{id:"home",label:"🏠"},{id:"learn",label:"📚 Learn"},{id:"quiz",label:"✏️ Quiz"},{id:"progress",label:"📊 Stats"},{id:"leaderboard",label:"🏆 Ranks"},{id:"schools",label:"🏫 Schools"}].map(n=>(
          <button key={n.id} onClick={()=>{setTab(n.id);setActiveTopic(null);setQuizActive(false);setQuizDone(false);}}
            style={{padding:"7px 12px",borderRadius:20,fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0,border:tab===n.id?"none":"2px solid rgba(255,255,255,0.3)",background:tab===n.id?"white":"transparent",color:tab===n.id?"#3730a3":"white"}}>
            {n.label}
          </button>
        ))}
        {!user && <button onClick={()=>setShowAuth(true)} style={{marginLeft:"auto",padding:"7px 14px",borderRadius:20,fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0,border:"none",background:"#4F46E5",color:"white"}}>Sign In</button>}
      </div>

      {/* ── LEARN ── */}
      {tab==="learn" && !activeTopic && (
        <PageWrap>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>📚 AI Tutor</h2>
          <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>Choose a topic — your AI teacher will guide you through it like a real classroom lesson.</p>
          {/* subject tabs */}
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
      {tab==="learn" && activeTopic && (
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px",display:"flex",flexDirection:"column",height:"calc(100vh - 50px)"}}>
          {/* header */}
          <div style={{padding:"12px 0",display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setActiveTopic(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",fontWeight:700,fontSize:13,borderRadius:20,padding:"7px 14px",cursor:"pointer"}}>← Back</button>
            <div>
              <div style={{color:"white",fontWeight:800,fontSize:16}}>{activeTopic.icon} {activeTopic.title}</div>
              <div style={{color:"#c7d2fe",fontSize:11}}>AI Tutor · {SUBJECT_LABELS[activeTopic.subject]}</div>
            </div>
          </div>
          {/* chat */}
          <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
            {chatMessages.map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
                {msg.role==="tutor" && <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginRight:8,flexShrink:0,alignSelf:"flex-start",marginTop:2}}>🤖</div>}
                <div style={{maxWidth:"82%",padding:"12px 16px",borderRadius:msg.role==="user"?"20px 20px 4px 20px":"20px 20px 20px 4px",background:msg.role==="user"?"#4F46E5":"white",color:msg.role==="user"?"white":"#1e1b4b",fontSize:14,lineHeight:1.6,whiteSpace:"pre-wrap",boxShadow:"0 2px 10px rgba(0,0,0,0.1)"}}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}/>
          </div>
          {/* input */}
          <div style={{padding:"10px 0 20px",display:"flex",gap:8}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendMessage()}
              placeholder="Type your answer or question..."
              style={{flex:1,padding:"13px 16px",borderRadius:24,border:"2px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"white",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
            <button onClick={sendMessage}
              style={{padding:"13px 18px",borderRadius:24,border:"none",background:"white",color:"#4F46E5",fontWeight:800,fontSize:16,cursor:"pointer"}}>→</button>
          </div>
        </div>
      )}

      {/* ── QUIZ SETUP ── */}
      {tab==="quiz" && !quizActive && !quizDone && (
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
            {!user && <p style={{textAlign:"center",fontSize:12,color:"#9ca3af",marginBottom:8}}>⚠️ <span style={{cursor:"pointer",color:"#4F46E5",fontWeight:700}} onClick={()=>setShowAuth(true)}>Sign in</span> to save your score & earn XP</p>}
            <button onClick={startQuiz} disabled={selSubjects.length===0}
              style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:selSubjects.length===0?"#e5e7eb":"linear-gradient(135deg,#4F46E5,#7C3AED)",color:selSubjects.length===0?"#9ca3af":"white",fontWeight:800,fontSize:16,cursor:selSubjects.length===0?"not-allowed":"pointer",boxShadow:selSubjects.length>0?"0 4px 20px rgba(79,70,229,0.4)":"none"}}>
              {selSubjects.length===0?"👆 Select a subject":"Start Quiz →"}
            </button>
          </div>
        </PageWrap>
      )}

      {/* ── QUIZ ACTIVE ── */}
      {tab==="quiz" && quizActive && !quizDone && quiz[qIdx] && (
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
      {tab==="quiz" && quizDone && (
        <PageWrap>
          <div style={{textAlign:"center",padding:"24px 0 12px"}}>
            <div style={{fontSize:60}}>{score/quiz.length>=0.8?"🏆":score/quiz.length>=0.6?"⭐":"💪"}</div>
            <h2 style={{color:"white",fontWeight:900,fontSize:26,margin:"8px 0 4px"}}>{Math.round((score/quiz.length)*100)}%</h2>
            <p style={{color:"#c7d2fe",fontSize:15,margin:"0 0 4px"}}>{score}/{quiz.length} correct</p>
            {user&&<p style={{color:"#FDE68A",fontWeight:700,fontSize:14,margin:"4px 0"}}>+{quiz.length*DIFF_XP[difficulty]} XP earned!</p>}
          </div>
          {/* review */}
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
      {tab==="progress" && (
        <PageWrap>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>📊 My Stats</h2>
          {!user ? (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:56,marginBottom:16}}>🔒</div>
              <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"0 0 8px"}}>Sign in to see your stats</h2>
              <p style={{color:"#c7d2fe",fontSize:14,margin:"0 0 20px"}}>Track your progress, streaks and badges!</p>
              <button onClick={()=>setShowAuth(true)} style={{padding:"12px 28px",borderRadius:14,background:"white",color:"#3730a3",fontWeight:800,fontSize:15,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In / Register →</button>
            </div>
          ) : (
            <>
              <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>{user.full_name||user.email}</p>
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
              {(() => {
                const earned = BADGES.filter(b=>(progress?.badges||[]).includes(b.id));
                const locked = BADGES.filter(b=>!(progress?.badges||[]).includes(b.id));
                return (
                  <div style={{background:"white",borderRadius:20,padding:"18px",marginBottom:12,boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
                    <p style={{fontWeight:800,fontSize:14,color:"#1e1b4b",margin:"0 0 12px"}}>🏅 Badges ({earned.length}/{BADGES.length})</p>
                    {earned.length===0&&<p style={{color:"#9ca3af",fontSize:13,textAlign:"center"}}>Complete your first quiz to earn badges!</p>}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                      {earned.map(b=><div key={b.id} style={{background:"#FFFBEB",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"1.5px solid #FDE68A"}}>
                        <div style={{fontSize:26}}>{b.icon}</div>
                        <div style={{fontSize:11,fontWeight:800,color:"#92400E"}}>{b.name}</div>
                      </div>)}
                    </div>
                    {locked.length>0&&<>
                      <p style={{fontWeight:700,fontSize:12,color:"#9ca3af",margin:"0 0 8px"}}>Locked ({locked.length})</p>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                        {locked.map(b=><div key={b.id} style={{background:"#f8fafc",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"1.5px solid #e5e7eb",opacity:0.5}}>
                          <div style={{fontSize:26,filter:"grayscale(1)"}}>{b.icon}</div>
                          <div style={{fontSize:11,fontWeight:800,color:"#374151"}}>{b.name}</div>
                        </div>)}
                      </div>
                    </>}
                  </div>
                );
              })()}
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
      {tab==="leaderboard" && (
        <PageWrap>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>🏆 Leaderboard</h2>
          <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>Top students by XP</p>
          <LeaderboardView user={user} progress={progress} onSignIn={()=>setShowAuth(true)}/>
        </PageWrap>
      )}

      {/* ── SCHOOLS ── */}
      {tab==="schools" && (
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

// ─── LEADERBOARD COMPONENT ────────────────────────────────────────────────────
function LeaderboardView({ user, progress, onSignIn }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      try {
        const recs = await UserProgress.list();
        const sorted = recs.sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,20);
        setBoard(sorted);
      } catch {} finally { setLoading(false); }
    })();
  },[]);

  if(loading) return <div style={{textAlign:"center",color:"white",padding:40}}>Loading...</div>;

  if(board.length===0) return (
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:48,marginBottom:12}}>🏆</div>
      <p style={{color:"white",fontWeight:700,fontSize:16}}>No entries yet — be the first!</p>
      {!user && <button onClick={onSignIn} style={{marginTop:12,padding:"12px 24px",borderRadius:12,background:"white",color:"#3730a3",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In to Compete →</button>}
    </div>
  );

  return (
    <div style={{background:"white",borderRadius:20,padding:"18px",boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
      {board.map((entry,i)=>{
        const isMe = user && entry.user_id===user.id;
        const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":"";
        const lvl = calcLevel(entry.xp||0).level;
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<board.length-1?"1px solid #f3f4f6":"none",background:isMe?"#EEF2FF":"transparent",borderRadius:isMe?8:0,paddingLeft:isMe?8:0,paddingRight:isMe?8:0}}>
            <div style={{width:32,textAlign:"center",fontWeight:900,fontSize:16,color:i<3?"#F59E0B":"#9ca3af"}}>{medal||`#${i+1}`}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:"#1e1b4b"}}>{isMe?"⭐ You":entry.user_id?.slice(0,8)+"..."}</div>
              <div style={{fontSize:11,color:"#6b7280"}}>Level {lvl} · 🔥{entry.streak_days||0} streak</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:800,fontSize:15,color:"#4F46E5"}}>{entry.xp||0} XP</div>
              <div style={{fontSize:11,color:"#6b7280"}}>{entry.total_correct||0} correct</div>
            </div>
          </div>
        );
      })}
      {!user && (
        <div style={{textAlign:"center",marginTop:14}}>
          <button onClick={onSignIn} style={{padding:"10px 24px",borderRadius:12,background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In to Compete →</button>
        </div>
      )}
    </div>
  );
}
