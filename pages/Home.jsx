import { useState, useEffect, useCallback } from "react";
import { UserProgress, QuizSession, Leaderboard, VisitorCount } from "../api/entities";
import { useAppContext } from "../api/app-context";

// ─── BADGES ──────────────────────────────────────────────────────────────────
const BADGES = [
  { id: "first_quiz",    icon: "🎯", name: "First Steps",      desc: "Complete your first quiz",              xp: 10  },
  { id: "streak_3",      icon: "🔥", name: "On Fire",          desc: "3-day practice streak",                 xp: 30  },
  { id: "streak_7",      icon: "💎", name: "Diamond Streak",   desc: "7-day practice streak",                 xp: 100 },
  { id: "perfect_10",    icon: "⭐", name: "Perfect 10",       desc: "Score 100% on a 10-question quiz",      xp: 50  },
  { id: "century",       icon: "💯", name: "Century",          desc: "Answer 100 questions total",            xp: 75  },
  { id: "maths_master",  icon: "🔢", name: "Maths Master",     desc: "Score 80%+ on 5 maths quizzes",         xp: 60  },
  { id: "verbal_ace",    icon: "📖", name: "Verbal Ace",       desc: "Score 80%+ on 5 verbal quizzes",        xp: 60  },
  { id: "nvr_ninja",     icon: "🔷", name: "NVR Ninja",        desc: "Score 80%+ on 5 NVR quizzes",           xp: 60  },
  { id: "hard_mode",     icon: "🏆", name: "Hard Mode Hero",   desc: "Complete a Hard difficulty quiz",        xp: 80  },
  { id: "level_5",       icon: "🚀", name: "Rising Star",      desc: "Reach Level 5",                         xp: 0   },
  { id: "level_10",      icon: "👑", name: "Grammar Champion", desc: "Reach Level 10",                        xp: 0   },
];

// ─── XP & LEVELS ─────────────────────────────────────────────────────────────
function xpForLevel(lvl) { return lvl * 100; }
function calcLevel(xp) {
  let l = 1;
  while (xp >= xpForLevel(l)) { xp -= xpForLevel(l); l++; }
  return { level: l, xpInLevel: xp, xpNeeded: xpForLevel(l) };
}

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
const QUESTIONS = {
  maths: {
    easy: [
      { q: "What is 6 × 7?", options: ["36", "42", "48", "54"], answer: "42", topic: "Times Tables", explanation: "6 × 7 = 42. One of the trickiest to remember!" },
      { q: "What is ½ of 40?", options: ["10", "15", "20", "25"], answer: "20", topic: "Fractions", explanation: "Half of 40 = 40 ÷ 2 = 20." },
      { q: "What is 10% of 80?", options: ["4", "8", "10", "16"], answer: "8", topic: "Percentages", explanation: "10% = divide by 10. 80 ÷ 10 = 8." },
      { q: "What is 25 + 37?", options: ["52", "62", "63", "72"], answer: "62", topic: "Addition", explanation: "25 + 37: 20+30=50, 5+7=12, 50+12=62." },
      { q: "What is 9 × 3?", options: ["21", "24", "27", "30"], answer: "27", topic: "Times Tables", explanation: "9 × 3 = 27. Or: 10×3=30, minus 3 = 27." },
      { q: "How many sides does a pentagon have?", options: ["4", "5", "6", "7"], answer: "5", topic: "Shapes", explanation: "Penta = 5. Pentagon = 5 sides." },
      { q: "What is 100 − 37?", options: ["53", "63", "73", "83"], answer: "63", topic: "Subtraction", explanation: "100 − 37 = 63. Count up: 37+3=40, 40+60=100 → 63." },
      { q: "What is ¼ of 20?", options: ["4", "5", "8", "10"], answer: "5", topic: "Fractions", explanation: "¼ of 20 = 20 ÷ 4 = 5." },
    ],
    medium: [
      { q: "What is 7 × 8?", options: ["54", "56", "63", "48"], answer: "56", topic: "Times Tables", explanation: "5, 6, 7, 8 → 56 = 7 × 8! Sing it." },
      { q: "What is ¾ of 40?", options: ["20", "25", "30", "35"], answer: "30", topic: "Fractions", explanation: "¼ of 40=10. ¾ = 3×10 = 30." },
      { q: "What is 25% of 80?", options: ["16", "20", "25", "40"], answer: "20", topic: "Percentages", explanation: "25% = ¼. 80 ÷ 4 = 20." },
      { q: "Share £30 in ratio 2:3. Larger share?", options: ["£10", "£12", "£15", "£18"], answer: "£18", topic: "Ratio", explanation: "5 parts. £6 each. 3×£6=£18." },
      { q: "If x + 5 = 12, what is x?", options: ["5", "6", "7", "8"], answer: "7", topic: "Algebra", explanation: "x = 12 − 5 = 7." },
      { q: "What is the area of a 8cm × 5cm rectangle?", options: ["13cm²", "26cm²", "40cm²", "80cm²"], answer: "40cm²", topic: "Geometry", explanation: "Area = length × width = 8 × 5 = 40." },
      { q: "What is 9 × 12?", options: ["99", "108", "116", "98"], answer: "108", topic: "Times Tables", explanation: "10×12=120, subtract 12 = 108." },
      { q: "Simplify 8/12.", options: ["4/8", "2/3", "3/4", "1/2"], answer: "2/3", topic: "Fractions", explanation: "HCF=4. 8÷4=2, 12÷4=3 → 2/3." },
      { q: "A train leaves at 09:15, arrives 11:45. How long?", options: ["1h30m", "2h", "2h30m", "3h"], answer: "2h30m", topic: "Time", explanation: "09:15→11:15=2h, +30min = 2h30m." },
      { q: "What is 10% of 350?", options: ["3.5", "25", "35", "50"], answer: "35", topic: "Percentages", explanation: "350 ÷ 10 = 35." },
    ],
    hard: [
      { q: "The sum of 3 consecutive numbers is 63. Smallest?", options: ["19", "20", "21", "22"], answer: "20", topic: "Algebra", explanation: "n+(n+1)+(n+2)=63 → 3n+3=63 → n=20." },
      { q: "A jacket costs £80, reduced by 35%. Sale price?", options: ["£44", "£48", "£52", "£56"], answer: "£52", topic: "Percentages", explanation: "35% of £80 = £28. £80−£28=£52." },
      { q: "OJ:lemonade = 2:5. Total 350ml. How much lemonade?", options: ["100ml", "150ml", "200ml", "250ml"], answer: "250ml", topic: "Ratio", explanation: "7 parts. 350÷7=50ml each. 5×50=250ml." },
      { q: "nth term of 5, 8, 11, 14...?", options: ["n+4", "2n+3", "3n+2", "4n+1"], answer: "3n+2", topic: "Algebra", explanation: "Difference=3. n=1: 3+2=5 ✓" },
      { q: "3/4 of a number is 36. What is the number?", options: ["24", "27", "48", "54"], answer: "48", topic: "Fractions", explanation: "If ¾=36, then ¼=12, whole=48." },
      { q: "Price increases from £40 to £50. % increase?", options: ["10%", "20%", "25%", "30%"], answer: "25%", topic: "Percentages", explanation: "Change=£10. (10÷40)×100=25%." },
      { q: "How many squares (all sizes) in a 3×3 grid?", options: ["9", "12", "14", "16"], answer: "14", topic: "Shapes", explanation: "9(1×1)+4(2×2)+1(3×3)=14." },
    ],
  },
  verbal: {
    easy: [
      { q: "Which word means the same as HAPPY?", options: ["Sad", "Joyful", "Angry", "Tired"], answer: "Joyful", topic: "Synonyms", explanation: "Joyful = very happy. Synonyms have the same meaning." },
      { q: "Which word means the OPPOSITE of BIG?", options: ["Large", "Huge", "Small", "Wide"], answer: "Small", topic: "Antonyms", explanation: "Big and small are opposites (antonyms)." },
      { q: "Dog is to Puppy as Cat is to ___", options: ["Kitten", "Cub", "Foal", "Lamb"], answer: "Kitten", topic: "Analogies", explanation: "Puppy = baby dog. Kitten = baby cat." },
      { q: "Odd one out: Robin, Sparrow, Penguin, Eagle", options: ["Robin", "Sparrow", "Penguin", "Eagle"], answer: "Penguin", topic: "Odd One Out", explanation: "Robin, Sparrow, Eagle can fly. Penguins cannot!" },
      { q: "Which word is spelled correctly?", options: ["Recieve", "Achieve", "Beleive", "Freind"], answer: "Achieve", topic: "Spelling", explanation: "i before e except after c. Achieve ✓" },
      { q: "What comes next? A, C, E, G, ___", options: ["H", "I", "J", "K"], answer: "I", topic: "Sequences", explanation: "Skip one letter: A(B)C(D)E(F)G(H)I." },
    ],
    medium: [
      { q: "Which word means the OPPOSITE of ANCIENT?", options: ["Old", "Historic", "Modern", "Aged"], answer: "Modern", topic: "Antonyms", explanation: "Ancient=very old. Opposite=modern." },
      { q: "If CAT = DBU, what is DOG?", options: ["CPH", "EPH", "ENH", "EPI"], answer: "EPH", topic: "Codes", explanation: "+1 each letter: D→E, O→P, G→H=EPH." },
      { q: "Book is to Library as Painting is to ___", options: ["School", "Gallery", "Museum", "Theatre"], answer: "Gallery", topic: "Analogies", explanation: "Books in library. Paintings in gallery." },
      { q: "What comes next? Z, X, V, T, ___", options: ["P", "Q", "R", "S"], answer: "R", topic: "Sequences", explanation: "Backwards, skip one: Z(Y)X(W)V(U)T(S)R." },
      { q: "Odd one out: Triangle, Circle, Square, Pyramid", options: ["Triangle", "Circle", "Square", "Pyramid"], answer: "Pyramid", topic: "Odd One Out", explanation: "Triangle/Circle/Square=2D. Pyramid=3D." },
      { q: "Which word means the same as ENORMOUS?", options: ["Tiny", "Average", "Huge", "Narrow"], answer: "Huge", topic: "Synonyms", explanation: "Enormous = very large = huge." },
      { q: "If A=1, B=2... what does 2-5-4 spell?", options: ["BED", "CAT", "ACE", "BAD"], answer: "BED", topic: "Codes", explanation: "B=2, E=5, D=4 → BED." },
    ],
    hard: [
      { q: "Which word is most similar to METICULOUS?", options: ["Careless", "Precise", "Hasty", "Vague"], answer: "Precise", topic: "Synonyms", explanation: "Meticulous = very careful and precise." },
      { q: "Antonym of BENEVOLENT?", options: ["Kind", "Generous", "Malevolent", "Brave"], answer: "Malevolent", topic: "Antonyms", explanation: "Benevolent=good/kind. Malevolent=evil/wishing harm." },
      { q: "What comes next? A, D, G, J, ___", options: ["K", "L", "M", "N"], answer: "M", topic: "Sequences", explanation: "+3 positions each time: A→D→G→J→M." },
      { q: "Scalpel is to Surgeon as Gavel is to ___", options: ["Builder", "Judge", "Teacher", "Artist"], answer: "Judge", topic: "Analogies", explanation: "A scalpel is a surgeon's tool. A gavel is a judge's tool." },
      { q: "Antonym of TRANSPARENT?", options: ["Clear", "Bright", "Opaque", "Shiny"], answer: "Opaque", topic: "Antonyms", explanation: "Transparent=see-through. Opaque=cannot see through." },
    ],
  },
  nvr: {
    easy: [
      { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: "6", topic: "Shapes", explanation: "Hex=6. Hexagon=6 sides. Like a honeycomb!" },
      { q: "How many faces does a cube have?", options: ["4", "5", "6", "8"], answer: "6", topic: "3D Shapes", explanation: "Top, bottom, front, back, left, right = 6 faces." },
      { q: "A square rotated 90°. What do you see?", options: ["Rectangle", "Diamond", "Square", "Trapezoid"], answer: "Square", topic: "Rotation", explanation: "A square has 4-fold symmetry — looks same after 90°." },
      { q: "What comes next? ▲ ■ ▲ ■ ▲ ___", options: ["▲", "■", "●", "▲▲"], answer: "■", topic: "Patterns", explanation: "Alternating triangle, square → next is ■." },
      { q: "Equilateral triangle — how many lines of symmetry?", options: ["1", "2", "3", "6"], answer: "3", topic: "Symmetry", explanation: "3 equal sides = 3 lines of symmetry." },
      { q: "Which shape has 5 sides?", options: ["Hexagon", "Pentagon", "Octagon", "Square"], answer: "Pentagon", topic: "Shapes", explanation: "Penta=5. Pentagon=5 sides." },
    ],
    medium: [
      { q: "How many squares (all sizes) in a 2×2 grid?", options: ["4", "5", "6", "8"], answer: "5", topic: "Counting", explanation: "Four 1×1 + one 2×2 = 5." },
      { q: "Arrow pointing RIGHT reflected in vertical mirror?", options: ["Right", "Left", "Up", "Down"], answer: "Left", topic: "Reflection", explanation: "Vertical mirror flips left/right → right becomes left." },
      { q: "A shape rotated 180° = a ___ turn?", options: ["¼ turn", "½ turn", "¾ turn", "Full"], answer: "½ turn", topic: "Rotation", explanation: "180° = half of 360° = ½ turn." },
      { q: "What comes next? 2, 4, 8, 16, ___", options: ["24", "28", "32", "18"], answer: "32", topic: "Sequences", explanation: "Each doubles: 16×2=32." },
      { q: "How many lines of symmetry does a circle have?", options: ["1", "4", "8", "Infinite"], answer: "Infinite", topic: "Symmetry", explanation: "Any line through the centre = line of symmetry." },
      { q: "Cylinder — how many flat faces?", options: ["0", "1", "2", "3"], answer: "2", topic: "3D Shapes", explanation: "A cylinder has 2 flat circular faces (top+bottom)." },
    ],
    hard: [
      { q: "How many squares (all sizes) in a 3×3 grid?", options: ["9", "12", "14", "16"], answer: "14", topic: "Counting", explanation: "9(1×1)+4(2×2)+1(3×3)=14." },
      { q: "270° clockwise = how many degrees anticlockwise?", options: ["270°", "180°", "90°", "45°"], answer: "90°", topic: "Rotation", explanation: "360−270=90. Always works!" },
      { q: "Square paper folded diagonally. What shape?", options: ["Rectangle", "Square", "Triangle", "Pentagon"], answer: "Triangle", topic: "Folding", explanation: "Diagonal fold of a square = right-angled triangle." },
      { q: "Regular hexagon — how many lines of symmetry?", options: ["3", "4", "6", "8"], answer: "6", topic: "Symmetry", explanation: "Regular hexagon: 6 equal sides = 6 lines of symmetry." },
      { q: "In a 3×3 matrix, ● is at (1,1),(2,2),(3,_). Which column?", options: ["1", "2", "3", "4"], answer: "3", topic: "Matrices", explanation: "● moves diagonally: column 1→2→3." },
    ],
  },
  english: {
    easy: [
      { q: "Which word is a noun?", options: ["Run", "Happy", "Cat", "Quickly"], answer: "Cat", topic: "Grammar", explanation: "A noun is a person, place or thing. Cat = a thing/animal." },
      { q: "Which sentence has correct punctuation?", options: ["i love school", "I love school.", "I love school!", "i Love school."], answer: "I love school.", topic: "Punctuation", explanation: "Start with capital letter, end with full stop." },
      { q: "What is the plural of 'child'?", options: ["Childs", "Childes", "Children", "Childrens"], answer: "Children", topic: "Grammar", explanation: "Child → Children. Irregular plural — must memorise!" },
      { q: "Which word rhymes with LIGHT?", options: ["Left", "Night", "List", "Live"], answer: "Night", topic: "Phonics", explanation: "Light and night both end in the '-ight' sound." },
      { q: "What is a verb?", options: ["A describing word", "A doing/action word", "A naming word", "A joining word"], answer: "A doing/action word", topic: "Grammar", explanation: "Verbs are action/doing words — run, jump, eat, think." },
      { q: "Which word is an adjective?", options: ["Run", "Quickly", "Enormous", "And"], answer: "Enormous", topic: "Grammar", explanation: "Adjectives describe nouns. Enormous describes size." },
    ],
    medium: [
      { q: "What is a simile?", options: ["A comparison using 'like' or 'as'", "A made-up story", "A type of poem", "A naming word"], answer: "A comparison using 'like' or 'as'", topic: "Literary Devices", explanation: "'As brave as a lion' = simile. Uses 'like' or 'as'." },
      { q: "What is the correct form? 'She ___ to school every day.'", options: ["go", "goes", "going", "gone"], answer: "goes", topic: "Grammar", explanation: "Third person singular: she/he/it + goes (not go)." },
      { q: "What does the prefix 'un-' mean?", options: ["Again", "Not/reverse", "Before", "After"], answer: "Not/reverse", topic: "Vocabulary", explanation: "Un- = not or reverse. Unhappy = not happy. Undo = reverse." },
      { q: "Which is a compound sentence?", options: ["The dog ran.", "Because it rained.", "She sang and he danced.", "Running fast."], answer: "She sang and he danced.", topic: "Sentences", explanation: "Compound = two main clauses joined by a conjunction (and, but, or)." },
      { q: "What is an antonym of 'BRAVE'?", options: ["Bold", "Fearless", "Courageous", "Cowardly"], answer: "Cowardly", topic: "Vocabulary", explanation: "Brave = courageous. Antonym (opposite) = cowardly." },
      { q: "What does 'BENEVOLENT' mean?", options: ["Cruel", "Kind and generous", "Brave", "Clever"], answer: "Kind and generous", topic: "Vocabulary", explanation: "Bene = good (Latin). Benevolent = well-meaning and kind." },
    ],
    hard: [
      { q: "What literary device is: 'The wind whispered through the trees'?", options: ["Simile", "Metaphor", "Personification", "Alliteration"], answer: "Personification", topic: "Literary Devices", explanation: "Giving human qualities (whispered) to a non-human (wind) = personification." },
      { q: "What is the subjunctive mood in: 'I suggest that he ___ early'?", options: ["comes", "come", "came", "coming"], answer: "come", topic: "Grammar", explanation: "Subjunctive: 'I suggest that he come' (not comes). Used for wishes/suggestions." },
      { q: "Identify the clause type: 'Although it was raining, she went out.'", options: ["Main clause", "Relative clause", "Adverbial clause", "Noun clause"], answer: "Adverbial clause", topic: "Grammar", explanation: "'Although it was raining' modifies the main verb — it's an adverbial clause of concession." },
      { q: "What does the word 'LOQUACIOUS' mean?", options: ["Quiet", "Talkative", "Brave", "Lazy"], answer: "Talkative", topic: "Vocabulary", explanation: "Loquacious = talking a great deal. From Latin 'loqui' = to speak." },
      { q: "Which is an example of alliteration?", options: ["She sells sea shells", "The moon is a lantern", "As cold as ice", "He ran quickly"], answer: "She sells sea shells", topic: "Literary Devices", explanation: "Alliteration = repetition of the same initial consonant sound. S-S-S!" },
    ],
  },
};

// ─── LEARN TOPICS ─────────────────────────────────────────────────────────────
const LEARN_TOPICS = [
  {
    id: "times_tables", icon: "🔢", title: "Times Tables", subject: "maths", colour: "#4F46E5", bg: "#EEF2FF",
    intro: "Times tables are tested in EVERY 11+ maths paper. Know them instantly and you'll work much faster!",
    sections: [
      { heading: "The Clever Tricks", type: "cards", cards: [
        { icon: "×9", title: "Digits add to 9!", body: "9×7=63 → 6+3=9 ✓\n9×8=72 → 7+2=9 ✓\nWorks for ALL 9× tables!" },
        { icon: "×5", title: "Ends in 0 or 5", body: "7×5=35, 8×5=40\nAlways 0 (even) or 5 (odd)\nSuper easy!" },
        { icon: "×12", title: "Do ×10 then +×2", body: "8×12: 8×10=80, 8×2=16\n80+16=96 ✓\nWorks every time!" },
        { icon: "×4", title: "Double twice!", body: "7×4: double 7=14\ndouble again=28 ✓" },
      ]},
      { heading: "The Trickiest Ones", type: "flashcards", cards: [
        { q: "6 × 7 = ?", a: "42", tip: "6 and 7 walk into a shop... 42 things 😄" },
        { q: "7 × 8 = ?", a: "56", tip: "5, 6, 7, 8 → 56 = 7×8 🎵" },
        { q: "8 × 9 = ?", a: "72", tip: "72 = 8×9. Digits 7+2=9 ✓" },
        { q: "12 × 12 = ?", a: "144", tip: "144 is called a gross. Learn it!" },
      ]},
    ],
  },
  {
    id: "fractions", icon: "➗", title: "Fractions", subject: "maths", colour: "#7C3AED", bg: "#F5F3FF",
    intro: "Fractions appear in every 11+ paper. Just 4 rules to master!",
    sections: [
      { heading: "The 4 Big Rules", type: "cards", cards: [
        { icon: "➕", title: "Add/Subtract", body: "Make bottoms EQUAL first!\n½+¼ → 2/4+1/4=3/4" },
        { icon: "✖️", title: "Multiply", body: "Top×top, bottom×bottom!\n2/3×3/4=6/12=1/2" },
        { icon: "➗", title: "Divide — KCF!", body: "Keep, Change, Flip!\n½÷¼=½×4=2" },
        { icon: "🎯", title: "Fraction of Amount", body: "÷ bottom, × top!\n¾ of 40: ÷4=10, ×3=30 ✓" },
      ]},
      { heading: "Quick Practice", type: "flashcards", cards: [
        { q: "½ ÷ ¼ = ?", a: "2", tip: "KCF: ½×4=2" },
        { q: "¾ of 40 = ?", a: "30", tip: "40÷4=10, 10×3=30" },
        { q: "Simplify 8/12", a: "2/3", tip: "HCF=4: 8÷4=2, 12÷4=3" },
      ]},
    ],
  },
  {
    id: "percentages", icon: "💯", title: "Percentages", subject: "maths", colour: "#0891B2", bg: "#ECFEFF",
    intro: "Percentage questions are GUARANTEED. Learn the shortcuts!",
    sections: [
      { heading: "Speed Shortcuts", type: "cards", cards: [
        { icon: "10%", title: "Divide by 10", body: "350×10%=35\nJust move decimal!" },
        { icon: "25%", title: "Divide by 4", body: "120×25%=30\nSame as finding ¼" },
        { icon: "15%", title: "10% + 5%", body: "60×15%: 10%=6, 5%=3\n6+3=9 ✓" },
        { icon: "1%", title: "Divide by 100", body: "1% of 250=2.5\nThen × for any %!" },
      ]},
      { heading: "FDP Table", type: "table", headers: ["Fraction","Decimal","Percentage"], rows: [["1/2","0.5","50%"],["1/4","0.25","25%"],["3/4","0.75","75%"],["1/5","0.2","20%"],["1/10","0.1","10%"],["1/8","0.125","12.5%"]] },
    ],
  },
  {
    id: "synonyms", icon: "📚", title: "Synonyms & Antonyms", subject: "verbal", colour: "#059669", bg: "#ECFDF5",
    intro: "Build your vocabulary — these come up constantly in verbal reasoning!",
    sections: [
      { heading: "Key Word Groups", type: "cards", cards: [
        { icon: "😊", title: "Happy", body: "Joyful, Elated, Content, Cheerful\nOpposites: Miserable, Gloomy, Dejected" },
        { icon: "💪", title: "Brave", body: "Courageous, Valiant, Bold, Fearless\nOpposites: Cowardly, Timid, Meek" },
        { icon: "🌊", title: "Big", body: "Enormous, Vast, Colossal, Immense\nOpposites: Tiny, Minute, Minuscule" },
        { icon: "💝", title: "Kind", body: "Benevolent, Generous, Compassionate\nOpposites: Malevolent, Selfish, Cruel" },
      ]},
      { heading: "Flashcard Practice", type: "flashcards", cards: [
        { q: "Synonym of METICULOUS?", a: "Precise / Careful", tip: "Meticulous = very detailed and careful" },
        { q: "Antonym of BENEVOLENT?", a: "Malevolent", tip: "Bene=good, Male=bad" },
        { q: "Synonym of SWIFT?", a: "Rapid / Fleet", tip: "Swift = fast and direct" },
        { q: "Antonym of ANCIENT?", a: "Modern", tip: "Ancient=very old. Modern=new." },
      ]},
    ],
  },
  {
    id: "codes", icon: "🔐", title: "Letter Codes", subject: "verbal", colour: "#D97706", bg: "#FFFBEB",
    intro: "Crack the code — these are fun once you know how they work!",
    sections: [
      { heading: "How Codes Work", type: "cards", cards: [
        { icon: "A=1", title: "Letters = Numbers", body: "A=1, B=2, C=3... Z=26\nLearn this — unlocks all codes!" },
        { icon: "+1", title: "Forward shift", body: "CAT+1=DBU\nC→D, A→B, T→U" },
        { icon: "−2", title: "Backward shift", body: "FISH−2=DIQF\nWatch for A→Y wrap!" },
      ]},
      { heading: "Practice", type: "flashcards", cards: [
        { q: "A,C,E,G,___?", a: "I", tip: "Skip one: A(B)C(D)E(F)G(H)I" },
        { q: "Z,X,V,T,___?", a: "R", tip: "Backwards, skip one" },
        { q: "CAT in +1 code?", a: "DBU", tip: "C+1=D, A+1=B, T+1=U" },
      ]},
    ],
  },
  {
    id: "shapes", icon: "🔷", title: "Shapes & Symmetry", subject: "nvr", colour: "#7C3AED", bg: "#F5F3FF",
    intro: "Know your shapes inside out — their properties and how they transform!",
    sections: [
      { heading: "Must-Know Properties", type: "table", headers: ["Shape","Sides/Faces","Lines of Symmetry"], rows: [["Equilateral Triangle","3","3"],["Square","4","4"],["Rectangle","4","2"],["Regular Hexagon","6","6"],["Circle","∞","∞"],["Cube","6 faces","—"],["Cylinder","3 faces","—"]] },
      { heading: "Rotations", type: "cards", cards: [
        { icon: "↻", title: "90° = ¼ turn right", body: "UP arrow → points RIGHT" },
        { icon: "↙", title: "180° = ½ turn", body: "UP arrow → points DOWN" },
        { icon: "🪞", title: "Reflection", body: "Vertical mirror: left↔right\nHorizontal mirror: up↔down" },
      ]},
    ],
  },
  {
    id: "grammar", icon: "✏️", title: "English Grammar", subject: "english", colour: "#DC2626", bg: "#FEF2F2",
    intro: "English grammar is tested at every level. Master the key terms and you'll ace comprehension and writing questions!",
    sections: [
      { heading: "Parts of Speech", type: "cards", cards: [
        { icon: "🏷️", title: "Noun", body: "A person, place or thing.\nDog, London, happiness, book\nProper nouns = capital letters!" },
        { icon: "⚡", title: "Verb", body: "An action or doing word.\nRun, think, eat, was, is\n'Being' verbs count too!" },
        { icon: "🎨", title: "Adjective", body: "Describes a noun.\nHuge, red, meticulous, brave\nComes before the noun." },
        { icon: "🏃", title: "Adverb", body: "Describes a verb.\nQuickly, very, carefully, often\nMany end in -ly!" },
      ]},
      { heading: "Literary Devices", type: "flashcards", cards: [
        { q: "What is a simile?", a: "A comparison using 'like' or 'as'", tip: "'As brave as a lion'" },
        { q: "What is personification?", a: "Giving human qualities to non-humans", tip: "'The wind whispered'" },
        { q: "What is alliteration?", a: "Repeating the same initial sound", tip: "'She sells sea shells'" },
        { q: "What is a metaphor?", a: "Saying something IS something else", tip: "'The world is a stage'" },
      ]},
    ],
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const SUBJECT_COLOURS = { maths: "#4F46E5", verbal: "#059669", nvr: "#7C3AED", english: "#DC2626" };
const SUBJECT_BG = { maths: "#EEF2FF", verbal: "#ECFDF5", nvr: "#F5F3FF", english: "#FEF2F2" };
const SUBJECT_LABELS = { maths: "🔢 Maths", verbal: "📖 Verbal Reasoning", nvr: "🔷 Non-Verbal Reasoning", english: "✏️ English" };
const DIFF_COLOURS = { easy: "#059669", medium: "#D97706", hard: "#DC2626" };
const DIFF_XP = { easy: 5, medium: 10, hard: 20 };
const PRAISE_CORRECT = ["🌟 Brilliant!", "✅ Spot on!", "🎉 Yes! Great job!", "💪 Nailed it!", "⭐ Perfect!"];
const PRAISE_WRONG = ["Keep going! 💪", "Not quite — check below!", "Every mistake helps!", "You'll get it next time!"];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function today() { return new Date().toISOString().split("T")[0]; }

function Bold({ children }) {
  if (typeof children !== "string") return children;
  return <>{children.split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2,-2)}</strong> : p)}</>;
}
function BodyText({ text }) {
  return <>{text.split("\n").map((l, i) => l.trim() === "" ? <br key={i}/> : <p key={i} style={{margin:"3px 0",fontSize:13.5,color:"#374151",lineHeight:1.65}}><Bold>{l}</Bold></p>)}</>;
}

function Flashcards({ cards }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const c = cards[idx];
  return (
    <div>
      <div onClick={() => setFlipped(f=>!f)} style={{cursor:"pointer",background:flipped?"#F0FDF4":"#f8fafc",border:`2px solid ${flipped?"#059669":"#e2e8f0"}`,borderRadius:16,padding:"28px 20px",textAlign:"center",minHeight:130,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"all 0.3s",userSelect:"none"}}>
        {!flipped ? <><p style={{fontSize:19,fontWeight:800,color:"#1e1b4b",margin:"0 0 8px"}}>{c.q}</p><p style={{fontSize:12,color:"#9ca3af",margin:0}}>👆 Tap to reveal</p></>
          : <><p style={{fontSize:24,fontWeight:900,color:"#059669",margin:"0 0 8px"}}>{c.a}</p><p style={{fontSize:12.5,color:"#6b7280",margin:0,fontStyle:"italic"}}>💡 {c.tip}</p></>}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
        <button onClick={()=>{setIdx(i=>Math.max(0,i-1));setFlipped(false);}} disabled={idx===0} style={{padding:"7px 14px",borderRadius:10,border:"2px solid #e5e7eb",background:"white",color:idx===0?"#d1d5db":"#374151",fontWeight:700,cursor:idx===0?"default":"pointer",fontSize:13}}>← Prev</button>
        <span style={{fontSize:13,color:"#9ca3af",fontWeight:600}}>{idx+1}/{cards.length}</span>
        <button onClick={()=>{setIdx(i=>Math.min(cards.length-1,i+1));setFlipped(false);}} disabled={idx===cards.length-1} style={{padding:"7px 14px",borderRadius:10,border:"2px solid #e5e7eb",background:"white",color:idx===cards.length-1?"#d1d5db":"#374151",fontWeight:700,cursor:idx===cards.length-1?"default":"pointer",fontSize:13}}>Next →</button>
      </div>
    </div>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr>{headers.map((h,i)=><th key={i} style={{padding:"10px 12px",background:"#f1f5f9",fontWeight:800,color:"#1e1b4b",textAlign:"left",borderBottom:"2px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row,i)=><tr key={i} style={{background:i%2===0?"white":"#f9fafb"}}>{row.map((cell,j)=><td key={j} style={{padding:"9px 12px",color:"#374151",borderBottom:"1px solid #f1f5f9",fontWeight:j===0?700:400}}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function LearnSection({ section }) {
  if (section.type === "cards") return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{section.cards.map((c,i)=><div key={i} style={{background:"#f8fafc",borderRadius:14,padding:"14px 12px",border:"1.5px solid #e2e8f0"}}><div style={{fontSize:22,marginBottom:6}}>{c.icon}</div><p style={{margin:"0 0 4px",fontWeight:800,fontSize:13,color:"#1e1b4b"}}>{c.title}</p><BodyText text={c.body}/></div>)}</div>;
  if (section.type === "flashcards") return <Flashcards cards={section.cards}/>;
  if (section.type === "table") return <DataTable headers={section.headers} rows={section.rows}/>;
  return null;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, logout } = useAppContext();

  // Navigation
  const [tab, setTab] = useState("home");

  // Learn
  const [learnTopic, setLearnTopic] = useState(null);
  const [learnSec, setLearnSec] = useState(0);

  // Quiz setup
  const [selSubjects, setSelSubjects] = useState([]);
  const [difficulty, setDifficulty] = useState("medium");
  const [qCount, setQCount] = useState(10);

  // Active quiz
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  const [quizActive, setQuizActive] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [newBadges, setNewBadges] = useState([]);

  // Progress & leaderboard
  const [progress, setProgress] = useState(null);
  const [progressId, setProgressId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [visitorCount, setVisitorCount] = useState(null);

  // Schools
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [expandedSchool, setExpandedSchool] = useState(null);

  // ── Load visitor count (public) ───────────────────────────────────────────
  useEffect(() => {
    fetch("/functions/trackVisitor", { method: "POST" })
      .then(r => r.json()).then(d => { if (d.count) setVisitorCount(d.count); }).catch(() => {});
  }, []);

  // ── Load user progress ────────────────────────────────────────────────────
  const loadProgress = useCallback(async () => {
    if (!user) return;
    try {
      const all = await UserProgress.filter({ user_id: user.id });
      if (all.length > 0) {
        setProgress(all[0]); setProgressId(all[0].id);
      } else {
        const created = await UserProgress.create({
          user_id: user.id, total_questions: 0, total_correct: 0,
          streak_days: 0, last_practice_date: "", badges: [], xp: 0, level: 1,
          subject_stats: { maths: { q:0,c:0 }, verbal: { q:0,c:0 }, nvr: { q:0,c:0 }, english: { q:0,c:0 } }
        });
        setProgress(created); setProgressId(created.id);
      }
    } catch(e) {}
  }, [user]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const all = await Leaderboard.list();
      setLeaderboard(all.sort((a,b) => (b.xp||0)-(a.xp||0)).slice(0,10));
    } catch(e) {}
  }, []);

  const loadSessions = useCallback(async () => {
    if (!user) return;
    try {
      const all = await QuizSession.filter({ user_id: user.id });
      setSessions(all.sort((a,b) => new Date(b.created_date)-new Date(a.created_date)).slice(0,10));
    } catch(e) {}
  }, [user]);

  useEffect(() => { loadProgress(); loadLeaderboard(); loadSessions(); }, [loadProgress, loadLeaderboard, loadSessions]);

  // ── Save progress after quiz ──────────────────────────────────────────────
  const saveProgress = useCallback(async (quizAnswers, earned) => {
    if (!user || !progress) return;
    const correct = quizAnswers.filter(a => a.correct).length;
    const total = quizAnswers.length;
    const todayStr = today();
    const lastDate = progress.last_practice_date || "";
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yStr = yesterday.toISOString().split("T")[0];
    let streak = progress.streak_days || 0;
    if (lastDate === todayStr) { /* same day, no change */ }
    else if (lastDate === yStr) { streak += 1; }
    else { streak = 1; }

    const newTotalQ = (progress.total_questions||0) + total;
    const newTotalC = (progress.total_correct||0) + correct;
    const newXP = (progress.xp||0) + earned;
    const { level } = calcLevel(newXP);

    // Update subject stats
    const stats = progress.subject_stats || { maths:{q:0,c:0}, verbal:{q:0,c:0}, nvr:{q:0,c:0}, english:{q:0,c:0} };
    quizAnswers.forEach(a => {
      const s = a.question.subject;
      if (stats[s]) { stats[s].q++; if(a.correct) stats[s].c++; }
    });

    // Check badges
    const earnedBadges = [...(progress.badges||[])];
    const newB = [];
    const addBadge = (id) => { if (!earnedBadges.includes(id)) { earnedBadges.push(id); newB.push(id); } };
    if (newTotalQ >= 1) addBadge("first_quiz");
    if (streak >= 3) addBadge("streak_3");
    if (streak >= 7) addBadge("streak_7");
    if (correct === total && total >= 10) addBadge("perfect_10");
    if (newTotalQ >= 100) addBadge("century");
    if (difficulty === "hard") addBadge("hard_mode");
    if (level >= 5) addBadge("level_5");
    if (level >= 10) addBadge("level_10");
    setNewBadges(newB);

    const update = { total_questions: newTotalQ, total_correct: newTotalC, streak_days: streak,
      last_practice_date: todayStr, badges: earnedBadges, xp: newXP, level, subject_stats: stats };
    await UserProgress.update(progressId, update);
    setProgress({ ...progress, ...update });

    // Save quiz session
    const pct = Math.round((correct/total)*100);
    await QuizSession.create({ user_id: user.id, subjects: selSubjects, difficulty, score: correct, total, percentage: pct, xp_earned: earned, date: todayStr });

    // Update leaderboard
    const name = user.full_name || user.email?.split("@")[0] || "User";
    const lb = await Leaderboard.filter({ user_id: user.id });
    if (lb.length > 0) {
      await Leaderboard.update(lb[0].id, { xp: newXP, streak_days: streak, total_correct: newTotalC, badges_count: earnedBadges.length, display_name: name });
    } else {
      await Leaderboard.create({ user_id: user.id, display_name: name, xp: newXP, streak_days: streak, total_correct: newTotalC, badges_count: earnedBadges.length });
    }
    await loadLeaderboard();
    await loadSessions();
  }, [user, progress, progressId, difficulty, selSubjects, loadLeaderboard, loadSessions]);

  // ── Quiz logic ────────────────────────────────────────────────────────────
  const startQuiz = () => {
    const pool = selSubjects.flatMap(s => (QUESTIONS[s]?.[difficulty] || []).map(q => ({ ...q, subject: s })));
    if (!pool.length) return;
    const picked = shuffle(pool).slice(0, qCount).map(q => ({ ...q, shuffledOptions: shuffle(q.options) }));
    setQuestions(picked); setCurrent(0); setAnswers([]); setSelected(null);
    setShowFeedback(false); setEncouragement(""); setQuizDone(false); setXpEarned(0); setNewBadges([]);
    setQuizActive(true);
  };

  const handleAnswer = (opt) => {
    if (showFeedback) return;
    setSelected(opt); setShowFeedback(true);
    const isCorrect = opt === questions[current].answer;
    setEncouragement(isCorrect ? getRandom(PRAISE_CORRECT) : getRandom(PRAISE_WRONG));
    const newAnswers = [...answers, { question: questions[current], chosen: opt, correct: isCorrect }];
    setAnswers(newAnswers);
    setTimeout(() => {
      if (current + 1 < questions.length) { setCurrent(c=>c+1); setSelected(null); setShowFeedback(false); setEncouragement(""); }
      else {
        const earned = newAnswers.filter(a=>a.correct).length * DIFF_XP[difficulty];
        setXpEarned(earned); setAnswers(newAnswers); setQuizDone(true); setQuizActive(false);
        if (user) saveProgress(newAnswers, earned);
      }
    }, 2200);
  };

  const score = answers.filter(a=>a.correct).length;
  const pct = questions.length > 0 ? Math.round((score/questions.length)*100) : 0;
  const grade = pct>=90?"A*":pct>=80?"A":pct>=70?"B":pct>=60?"C":"D";
  const gradeColour = pct>=80?"#059669":pct>=60?"#D97706":"#DC2626";

  const BG = "linear-gradient(160deg,#1e1b4b 0%,#3730a3 60%,#6d28d9 100%)";
  const { level: curLevel, xpInLevel, xpNeeded } = calcLevel(progress?.xp||0);

  const NavBar = () => (
    <div style={{display:"flex",justifyContent:"center",gap:6,padding:"14px 12px 0",flexWrap:"wrap"}}>
      {[{id:"home",label:"🏠"},{id:"learn",label:"📚 Learn"},{id:"quiz",label:"✏️ Quiz"},{id:"progress",label:"📊 Stats"},{id:"leaderboard",label:"🏆 Ranks"},{id:"schools",label:"🏫 Schools"}].map(n=>(
        <button key={n.id} onClick={()=>{setTab(n.id);setLearnTopic(null);setQuizActive(false);setQuizDone(false);}} style={{padding:"7px 12px",borderRadius:20,fontWeight:700,fontSize:12,cursor:"pointer",border:tab===n.id?"none":"2px solid rgba(255,255,255,0.3)",background:tab===n.id?"white":"transparent",color:tab===n.id?"#3730a3":"white"}}>{n.label}</button>
      ))}
    </div>
  );

  const PageWrap = ({children}) => (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Segoe UI',system-ui,sans-serif",paddingBottom:40}}>
      <NavBar/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"16px 14px 0"}}>{children}</div>
    </div>
  );

  // ── ACTIVE QUIZ ───────────────────────────────────────────────────────────
  if (quizActive && !quizDone && questions.length>0) {
    const q = questions[current];
    const colour = SUBJECT_COLOURS[q.subject];
    return (
      <div style={{minHeight:"100vh",background:BG,fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
        <div style={{background:"white",borderRadius:24,padding:"24px 20px",maxWidth:540,width:"100%",boxShadow:"0 20px 50px rgba(0,0,0,0.3)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:11.5,fontWeight:700,color:colour,background:colour+"18",padding:"4px 11px",borderRadius:20}}>{SUBJECT_LABELS[q.subject]} · {q.topic}</span>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:11,fontWeight:700,color:DIFF_COLOURS[difficulty],background:DIFF_COLOURS[difficulty]+"18",padding:"3px 8px",borderRadius:10}}>{difficulty.toUpperCase()}</span>
              <span style={{fontSize:13,fontWeight:700,color:"#6b7280",background:"#F3F4F6",padding:"4px 10px",borderRadius:8}}>{current+1}/{questions.length}</span>
            </div>
          </div>
          <div style={{height:6,background:"#e5e7eb",borderRadius:3,marginBottom:18,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(current/questions.length)*100}%`,background:`linear-gradient(90deg,${colour},#7C3AED)`,borderRadius:3,transition:"width 0.4s"}}/>
          </div>
          <div style={{background:"#f8fafc",borderRadius:16,padding:"18px",marginBottom:16,border:"1.5px solid #e2e8f0"}}>
            <p style={{fontSize:18,fontWeight:800,color:"#1e1b4b",margin:0,lineHeight:1.5}}>{q.q}</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {q.shuffledOptions.map((opt,i)=>{
              let bg="white",border="#e5e7eb",col="#1e1b4b";
              if(showFeedback){if(opt===q.answer){bg="#ECFDF5";border="#059669";col="#065F46";}else if(opt===selected){bg="#FEF2F2";border="#DC2626";col="#991B1B";}}
              else if(selected===opt){bg=SUBJECT_BG[q.subject];border=colour;col=colour;}
              return <button key={i} onClick={()=>handleAnswer(opt)} style={{padding:"13px 10px",borderRadius:12,border:`2px solid ${border}`,background:bg,color:col,fontWeight:700,fontSize:14,cursor:showFeedback?"default":"pointer",lineHeight:1.3}}>{showFeedback&&opt===q.answer&&"✓ "}{showFeedback&&opt===selected&&opt!==q.answer&&"✗ "}{opt}</button>;
            })}
          </div>
          {showFeedback&&(
            <div style={{borderRadius:12,padding:"12px 14px",background:selected===q.answer?"#F0FDF4":"#FEF2F2",border:`1.5px solid ${selected===q.answer?"#86EFAC":"#FECACA"}`}}>
              <p style={{margin:"0 0 4px",fontWeight:800,fontSize:14,color:selected===q.answer?"#166534":"#991B1B"}}>{encouragement}</p>
              {selected!==q.answer&&<p style={{margin:"0 0 4px",fontSize:13,color:"#374151"}}><strong>✓ Answer:</strong> {q.answer}</p>}
              <p style={{margin:0,fontSize:12.5,color:"#4b5563"}}>💡 {q.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (quizDone) {
    const msg = pct>=90?{emoji:"🏆",text:"Outstanding! Grammar school ready!"}:pct>=80?{emoji:"🌟",text:"Excellent work!"}:pct>=70?{emoji:"⭐",text:"Great effort!"}:pct>=50?{emoji:"💪",text:"Good try — keep going!"}:{emoji:"📚",text:"Keep practising!"};
    return (
      <div style={{minHeight:"100vh",background:BG,fontFamily:"'Segoe UI',system-ui,sans-serif",padding:"20px 14px 40px"}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <div style={{background:"white",borderRadius:24,padding:"28px 22px",marginBottom:14,textAlign:"center",boxShadow:"0 20px 50px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:56}}>{msg.emoji}</div>
            <h2 style={{fontSize:22,fontWeight:900,color:"#1e1b4b",margin:"8px 0 4px"}}>{msg.text}</h2>
            <div style={{display:"inline-flex",gap:20,background:"#f8fafc",borderRadius:16,padding:"14px 24px",margin:"12px 0 10px"}}>
              <div><div style={{fontSize:44,fontWeight:900,color:gradeColour}}>{grade}</div><div style={{fontSize:12,color:"#9ca3af"}}>Grade</div></div>
              <div style={{width:1,background:"#e5e7eb"}}/>
              <div><div style={{fontSize:44,fontWeight:900,color:"#1e1b4b"}}>{pct}%</div><div style={{fontSize:12,color:"#9ca3af"}}>{score}/{questions.length} correct</div></div>
              <div style={{width:1,background:"#e5e7eb"}}/>
              <div><div style={{fontSize:44,fontWeight:900,color:"#F59E0B"}}>+{xpEarned}</div><div style={{fontSize:12,color:"#9ca3af"}}>XP earned</div></div>
            </div>
            {newBadges.length>0&&(
              <div style={{background:"#FFFBEB",border:"1.5px solid #FDE68A",borderRadius:14,padding:"12px 16px",marginBottom:12}}>
                <p style={{margin:"0 0 8px",fontWeight:800,color:"#92400E",fontSize:14}}>🎉 New Badges Unlocked!</p>
                <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                  {newBadges.map(bid=>{const b=BADGES.find(x=>x.id===bid);return b?<div key={bid} style={{background:"white",borderRadius:10,padding:"8px 12px",textAlign:"center",border:"1px solid #FDE68A"}}><div style={{fontSize:24}}>{b.icon}</div><div style={{fontSize:11,fontWeight:700,color:"#92400E"}}>{b.name}</div></div>:null;})}
                </div>
              </div>
            )}
            {selSubjects.map(s=>{
              const ta=answers.filter(a=>a.question.subject===s);if(!ta.length)return null;
              const tc=ta.filter(a=>a.correct).length,tp=Math.round((tc/ta.length)*100);
              return <div key={s} style={{marginBottom:10,textAlign:"left"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:700,color:"#374151"}}>{SUBJECT_LABELS[s]}</span><span style={{fontSize:13,fontWeight:700,color:SUBJECT_COLOURS[s]}}>{tc}/{ta.length} ({tp}%)</span></div><div style={{height:8,background:"#e5e7eb",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${tp}%`,background:SUBJECT_COLOURS[s],borderRadius:4,transition:"width 1s"}}/></div></div>;
            })}
          </div>
          {answers.filter(a=>!a.correct).length>0&&(
            <div style={{background:"white",borderRadius:20,padding:"20px",marginBottom:14,boxShadow:"0 10px 30px rgba(0,0,0,0.2)"}}>
              <p style={{fontWeight:800,fontSize:15,color:"#1e1b4b",margin:"0 0 12px"}}>📖 Review Your Mistakes</p>
              {answers.filter(a=>!a.correct).map((a,i)=>(
                <div key={i} style={{marginBottom:10,padding:"12px",background:"#FEF2F2",borderRadius:12,border:"1px solid #FECACA"}}>
                  <p style={{fontWeight:700,color:"#1e1b4b",margin:"0 0 4px",fontSize:13}}>{a.question.q}</p>
                  <p style={{margin:"0 0 2px",fontSize:13,color:"#DC2626"}}>✗ You said: {a.chosen}</p>
                  <p style={{margin:"0 0 5px",fontSize:13,color:"#059669",fontWeight:700}}>✓ Correct: {a.question.answer}</p>
                  <p style={{margin:0,fontSize:12,color:"#6B7280",fontStyle:"italic"}}>💡 {a.question.explanation}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:10,marginBottom:10}}>
            <button onClick={()=>{setTab("learn");setLearnTopic(null);setQuizDone(false);}} style={{flex:1,padding:"13px",borderRadius:12,border:"2px solid rgba(255,255,255,0.4)",background:"transparent",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>📚 Learn</button>
            <button onClick={startQuiz} style={{flex:1,padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 4px 15px rgba(79,70,229,0.4)"}}>🔄 Again</button>
          </div>
          <button onClick={()=>{setQuizDone(false);setTab("quiz");}} style={{width:"100%",padding:"13px",borderRadius:12,border:"2px solid rgba(255,255,255,0.3)",background:"transparent",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>← Change Topics</button>
        </div>
      </div>
    );
  }

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (tab==="home") return (
    <PageWrap>
      <div style={{textAlign:"center",padding:"20px 0 14px"}}>
        <div style={{fontSize:56}}>🎓</div>
        <h1 style={{fontSize:26,fontWeight:900,color:"white",margin:"8px 0 4px"}}>11+ Quest</h1>
        <p style={{color:"#c7d2fe",fontSize:13,margin:0}}>GL · CEM · ISEB · Independent Schools</p>
        {user ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:10}}>
            <div style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"6px 14px",display:"inline-flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14}}>👋</span>
              <span style={{color:"white",fontWeight:700,fontSize:13}}>{user.full_name||user.email?.split("@")[0]}</span>
              {progress&&<span style={{background:"#F59E0B",color:"white",fontWeight:800,fontSize:11,padding:"2px 8px",borderRadius:10}}>Lvl {curLevel}</span>}
              {progress&&progress.streak_days>0&&<span style={{color:"#FCD34D",fontWeight:800,fontSize:12}}>🔥{progress.streak_days}</span>}
            </div>
          </div>
        ):(
          <p style={{color:"#a5b4fc",fontSize:12,margin:"8px 0 0"}}>Sign in to save your progress & compete!</p>
        )}
      </div>

      {/* Visitor counter */}
      <div style={{background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.2)",borderRadius:16,padding:"12px 20px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
        <span style={{fontSize:24}}>👥</span>
        <div>
          <p style={{margin:0,color:"white",fontWeight:900,fontSize:20}}>{visitorCount!==null?visitorCount.toLocaleString():"..."}</p>
          <p style={{margin:0,color:"#c7d2fe",fontSize:11,fontWeight:600}}>total visitors all time</p>
        </div>
      </div>

      {/* XP bar if logged in */}
      {user&&progress&&(
        <div style={{background:"white",borderRadius:16,padding:"14px 16px",marginBottom:12,boxShadow:"0 4px 15px rgba(0,0,0,0.2)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontWeight:800,fontSize:13,color:"#1e1b4b"}}>🚀 Level {curLevel}</span>
            <span style={{fontSize:12,color:"#6b7280"}}>{xpInLevel}/{xpNeeded} XP to next level</span>
          </div>
          <div style={{height:10,background:"#e5e7eb",borderRadius:5,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.round((xpInLevel/xpNeeded)*100)}%`,background:"linear-gradient(90deg,#F59E0B,#EF4444)",borderRadius:5,transition:"width 0.5s"}}/>
          </div>
          <div style={{display:"flex",gap:12,marginTop:10}}>
            <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:18,color:"#4F46E5"}}>{progress.total_questions||0}</div><div style={{fontSize:11,color:"#6b7280"}}>questions</div></div>
            <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:18,color:"#059669"}}>{progress.total_questions>0?Math.round(((progress.total_correct||0)/(progress.total_questions||1))*100):0}%</div><div style={{fontSize:11,color:"#6b7280"}}>accuracy</div></div>
            <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:18,color:"#F59E0B"}}>{progress.xp||0}</div><div style={{fontSize:11,color:"#6b7280"}}>total XP</div></div>
            <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:18,color:"#DC2626"}}>🔥{progress.streak_days||0}</div><div style={{fontSize:11,color:"#6b7280"}}>day streak</div></div>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        {[{id:"learn",icon:"📚",title:"Learn",desc:"Tricks, flashcards & examples",grad:"linear-gradient(135deg,#059669,#047857)"},
          {id:"quiz",icon:"✏️",title:"Quiz",desc:"4 subjects, 3 difficulty levels",grad:"linear-gradient(135deg,#4F46E5,#3730a3)"}
        ].map(c=>(
          <button key={c.id} onClick={()=>setTab(c.id)} style={{background:c.grad,borderRadius:18,padding:"20px 14px",border:"none",cursor:"pointer",textAlign:"left",boxShadow:"0 8px 25px rgba(0,0,0,0.3)",color:"white"}}>
            <div style={{fontSize:30,marginBottom:6}}>{c.icon}</div>
            <div style={{fontWeight:800,fontSize:15,marginBottom:3}}>{c.title}</div>
            <div style={{fontSize:11,opacity:0.85}}>{c.desc}</div>
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        {[{id:"progress",icon:"📊",title:"My Stats",desc:"History & badges",grad:"linear-gradient(135deg,#0891B2,#0E7490)"},
          {id:"leaderboard",icon:"🏆",title:"Leaderboard",desc:"Compete with friends",grad:"linear-gradient(135deg,#D97706,#B45309)"}
        ].map(c=>(
          <button key={c.id} onClick={()=>setTab(c.id)} style={{background:c.grad,borderRadius:18,padding:"20px 14px",border:"none",cursor:"pointer",textAlign:"left",boxShadow:"0 8px 25px rgba(0,0,0,0.3)",color:"white"}}>
            <div style={{fontSize:30,marginBottom:6}}>{c.icon}</div>
            <div style={{fontWeight:800,fontSize:15,marginBottom:3}}>{c.title}</div>
            <div style={{fontSize:11,opacity:0.85}}>{c.desc}</div>
          </button>
        ))}
      </div>
      <button onClick={()=>setTab("schools")} style={{width:"100%",background:"linear-gradient(135deg,#7C3AED,#6d28d9)",borderRadius:18,padding:"16px 20px",border:"none",cursor:"pointer",textAlign:"left",boxShadow:"0 8px 25px rgba(0,0,0,0.3)",display:"flex",alignItems:"center",gap:12,color:"white"}}>
        <span style={{fontSize:30}}>🏫</span>
        <div><div style={{fontWeight:800,fontSize:15}}>Grammar Schools</div><div style={{fontSize:11,opacity:0.85}}>17 London schools — entry info & tips</div></div>
      </button>

      {!user&&(
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:16,padding:"16px",marginTop:12,textAlign:"center"}}>
          <p style={{color:"white",fontWeight:800,fontSize:14,margin:"0 0 4px"}}>🔒 Sign in to unlock:</p>
          <p style={{color:"#c7d2fe",fontSize:12,margin:"0 0 10px"}}>Progress saving · Streaks · Badges · Leaderboard</p>
          <button onClick={()=>window.location.href="/login"} style={{padding:"10px 24px",borderRadius:12,background:"white",color:"#3730a3",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In / Register →</button>
        </div>
      )}
      {user&&(
        <button onClick={logout} style={{width:"100%",marginTop:12,padding:"10px",borderRadius:12,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.6)",fontWeight:600,fontSize:12,cursor:"pointer"}}>Sign Out</button>
      )}
    </PageWrap>
  );

  // ── LEARN LIST ────────────────────────────────────────────────────────────
  if (tab==="learn"&&!learnTopic) return (
    <PageWrap>
      <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>📚 Learn Topics</h2>
      <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 16px"}}>Pick a topic — tricks, flashcards & worked examples.</p>
      {["maths","verbal","nvr","english"].map(subj=>(
        <div key={subj} style={{marginBottom:18}}>
          <p style={{color:"white",fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>{SUBJECT_LABELS[subj]}</p>
          {LEARN_TOPICS.filter(t=>t.subject===subj).map(t=>(
            <button key={t.id} onClick={()=>{setLearnTopic(t);setLearnSec(0);}} style={{width:"100%",marginBottom:8,background:"white",borderRadius:16,padding:"14px 16px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 15px rgba(0,0,0,0.15)",textAlign:"left"}}>
              <div style={{width:42,height:42,borderRadius:12,background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{t.icon}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14,color:"#1e1b4b"}}>{t.title}</div><div style={{fontSize:11.5,color:"#6b7280",marginTop:2}}>{t.sections.length} sections</div></div>
              <span style={{color:t.colour,fontSize:18,fontWeight:900}}>›</span>
            </button>
          ))}
        </div>
      ))}
    </PageWrap>
  );

  // ── LEARN TOPIC ───────────────────────────────────────────────────────────
  if (tab==="learn"&&learnTopic) {
    const t=learnTopic,sec=t.sections[learnSec],isLast=learnSec===t.sections.length-1;
    return (
      <PageWrap>
        <button onClick={()=>setLearnTopic(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",fontWeight:700,fontSize:13,borderRadius:20,padding:"7px 14px",cursor:"pointer",marginTop:8,marginBottom:12}}>← Topics</button>
        <div style={{background:t.bg,borderRadius:18,padding:"16px 18px 14px",marginBottom:12,border:`2px solid ${t.colour}30`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><span style={{fontSize:30}}>{t.icon}</span><h2 style={{fontSize:20,fontWeight:900,color:t.colour,margin:0}}>{t.title}</h2></div>
          <p style={{fontSize:13,color:"#374151",margin:0,lineHeight:1.6}}>{t.intro}</p>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
          {t.sections.map((s,i)=><button key={i} onClick={()=>setLearnSec(i)} style={{padding:"7px 12px",borderRadius:20,flexShrink:0,fontWeight:700,fontSize:12,border:`2px solid ${learnSec===i?"white":"rgba(255,255,255,0.3)"}`,background:learnSec===i?t.colour:"transparent",color:"white",cursor:"pointer"}}>{i+1}. {s.heading.split(" ").slice(0,3).join(" ")}</button>)}
        </div>
        <div style={{background:"white",borderRadius:18,padding:"18px 16px",marginBottom:12,boxShadow:"0 8px 30px rgba(0,0,0,0.2)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:10,borderBottom:"1.5px solid #f1f5f9"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:t.colour,color:"white",fontWeight:900,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>{learnSec+1}</div>
            <h3 style={{fontSize:16,fontWeight:800,color:"#1e1b4b",margin:0}}>{sec.heading}</h3>
          </div>
          <LearnSection section={sec}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          {learnSec>0&&<button onClick={()=>setLearnSec(s=>s-1)} style={{flex:1,padding:"12px",borderRadius:12,border:"2px solid rgba(255,255,255,0.4)",background:"transparent",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>← Prev</button>}
          {!isLast?<button onClick={()=>setLearnSec(s=>s+1)} style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:t.colour,color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>Next →</button>
            :<button onClick={()=>setTab("quiz")} style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>✏️ Test Yourself →</button>}
        </div>
      </PageWrap>
    );
  }

  // ── QUIZ SETUP ────────────────────────────────────────────────────────────
  if (tab==="quiz") return (
    <PageWrap>
      <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>✏️ Practice Quiz</h2>
      <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>Choose your subjects, difficulty & number of questions.</p>
      <div style={{background:"white",borderRadius:20,padding:"20px 18px",boxShadow:"0 8px 30px rgba(0,0,0,0.2)"}}>
        {/* Subjects */}
        <p style={{fontWeight:800,color:"#1e1b4b",fontSize:11,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Subjects</p>
        {Object.entries(SUBJECT_LABELS).map(([id,label])=>(
          <button key={id} onClick={()=>setSelSubjects(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])} style={{width:"100%",marginBottom:8,padding:"13px 16px",borderRadius:12,border:`2px solid ${selSubjects.includes(id)?SUBJECT_COLOURS[id]:"#e5e7eb"}`,background:selSubjects.includes(id)?SUBJECT_BG[id]:"#fafafa",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontWeight:700,fontSize:14,color:selSubjects.includes(id)?SUBJECT_COLOURS[id]:"#374151"}}>{label}</span>
            <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${selSubjects.includes(id)?SUBJECT_COLOURS[id]:"#d1d5db"}`,background:selSubjects.includes(id)?SUBJECT_COLOURS[id]:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {selSubjects.includes(id)&&<span style={{color:"white",fontSize:11,fontWeight:900}}>✓</span>}
            </div>
          </button>
        ))}
        {/* Difficulty */}
        <p style={{fontWeight:800,color:"#1e1b4b",fontSize:11,textTransform:"uppercase",letterSpacing:"1px",margin:"16px 0 10px"}}>Difficulty</p>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {["easy","medium","hard"].map(d=>(
            <button key={d} onClick={()=>setDifficulty(d)} style={{flex:1,padding:"11px 0",borderRadius:10,border:`2px solid ${difficulty===d?DIFF_COLOURS[d]:"#e5e7eb"}`,background:difficulty===d?DIFF_COLOURS[d]+"15":"white",color:difficulty===d?DIFF_COLOURS[d]:"#374151",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              {d==="easy"?"😊 Easy":d==="medium"?"🎯 Medium":"🔥 Hard"}<br/>
              <span style={{fontSize:10,opacity:0.7}}>+{DIFF_XP[d]} XP/q</span>
            </button>
          ))}
        </div>
        {/* Count */}
        <p style={{fontWeight:800,color:"#1e1b4b",fontSize:11,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Questions</p>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {[5,10,15,20].map(n=>(
            <button key={n} onClick={()=>setQCount(n)} style={{flex:1,padding:"11px 0",borderRadius:10,border:`2px solid ${qCount===n?"#4F46E5":"#e5e7eb"}`,background:qCount===n?"#EEF2FF":"white",color:qCount===n?"#4F46E5":"#374151",fontWeight:700,fontSize:15,cursor:"pointer"}}>{n}</button>
          ))}
        </div>
        <button onClick={startQuiz} disabled={selSubjects.length===0} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:selSubjects.length===0?"#e5e7eb":"linear-gradient(135deg,#4F46E5,#7C3AED)",color:selSubjects.length===0?"#9ca3af":"white",fontWeight:800,fontSize:16,cursor:selSubjects.length===0?"not-allowed":"pointer",boxShadow:selSubjects.length>0?"0 4px 20px rgba(79,70,229,0.4)":"none"}}>
          {selSubjects.length===0?"👆 Select a subject":"Start Quiz →"}
        </button>
        {!user&&<p style={{textAlign:"center",fontSize:12,color:"#9ca3af",marginTop:8}}>⚠️ Sign in to save your score & earn XP</p>}
      </div>
    </PageWrap>
  );

  // ── PROGRESS / STATS ──────────────────────────────────────────────────────
  if (tab==="progress") {
    if (!user) return (
      <PageWrap>
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{fontSize:56,marginBottom:16}}>🔒</div>
          <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"0 0 8px"}}>Sign in to see your stats</h2>
          <p style={{color:"#c7d2fe",fontSize:14,margin:"0 0 20px"}}>Track your progress, streaks and badges!</p>
          <button onClick={()=>window.location.href="/login"} style={{padding:"12px 28px",borderRadius:14,background:"white",color:"#3730a3",fontWeight:800,fontSize:15,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In / Register →</button>
        </div>
      </PageWrap>
    );
    const acc = progress?.total_questions>0 ? Math.round(((progress?.total_correct||0)/(progress?.total_questions||1))*100) : 0;
    const earnedBadges = BADGES.filter(b=>(progress?.badges||[]).includes(b.id));
    const lockedBadges = BADGES.filter(b=>!(progress?.badges||[]).includes(b.id));
    return (
      <PageWrap>
        <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>📊 My Stats</h2>
        <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>{user.full_name||user.email}</p>
        {/* Level card */}
        <div style={{background:"white",borderRadius:20,padding:"18px",marginBottom:12,boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontWeight:800,fontSize:16,color:"#1e1b4b"}}>🚀 Level {curLevel}</span>
            <span style={{fontSize:12,color:"#6b7280"}}>{xpInLevel}/{xpNeeded} XP</span>
          </div>
          <div style={{height:12,background:"#e5e7eb",borderRadius:6,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.round((xpInLevel/xpNeeded)*100)}%`,background:"linear-gradient(90deg,#F59E0B,#EF4444)",borderRadius:6}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:14}}>
            {[{v:progress?.total_questions||0,l:"Questions",c:"#4F46E5"},{v:acc+"%",l:"Accuracy",c:"#059669"},{v:progress?.xp||0,l:"Total XP",c:"#F59E0B"},{v:`🔥${progress?.streak_days||0}`,l:"Streak",c:"#DC2626"}].map((s,i)=>(
              <div key={i} style={{textAlign:"center",background:"#f8fafc",borderRadius:12,padding:"10px 6px"}}><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:10,color:"#6b7280"}}>{s.l}</div></div>
            ))}
          </div>
        </div>
        {/* Subject breakdown */}
        <div style={{background:"white",borderRadius:20,padding:"18px",marginBottom:12,boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
          <p style={{fontWeight:800,fontSize:14,color:"#1e1b4b",margin:"0 0 12px"}}>📚 By Subject</p>
          {Object.entries(SUBJECT_LABELS).map(([s,label])=>{
            const st=progress?.subject_stats?.[s]||{q:0,c:0};
            const sp=st.q>0?Math.round((st.c/st.q)*100):0;
            return <div key={s} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:700,color:"#374151"}}>{label}</span><span style={{fontSize:13,fontWeight:700,color:SUBJECT_COLOURS[s]}}>{st.c}/{st.q} ({sp}%)</span></div><div style={{height:8,background:"#e5e7eb",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${sp}%`,background:SUBJECT_COLOURS[s],borderRadius:4,transition:"width 1s"}}/></div></div>;
          })}
        </div>
        {/* Badges */}
        <div style={{background:"white",borderRadius:20,padding:"18px",marginBottom:12,boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
          <p style={{fontWeight:800,fontSize:14,color:"#1e1b4b",margin:"0 0 12px"}}>🏅 Badges ({earnedBadges.length}/{BADGES.length})</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
            {earnedBadges.map(b=><div key={b.id} style={{background:b.id?"#FFFBEB":"#f8fafc",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"1.5px solid #FDE68A"}}><div style={{fontSize:26}}>{b.icon}</div><div style={{fontSize:11,fontWeight:800,color:"#92400E"}}>{b.name}</div><div style={{fontSize:10,color:"#6b7280"}}>{b.desc}</div></div>)}
          </div>
          {lockedBadges.length>0&&<>
            <p style={{fontWeight:700,fontSize:12,color:"#9ca3af",margin:"0 0 8px"}}>Locked ({lockedBadges.length})</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {lockedBadges.map(b=><div key={b.id} style={{background:"#f8fafc",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"1.5px solid #e5e7eb",opacity:0.5}}><div style={{fontSize:26,filter:"grayscale(1)"}}>{b.icon}</div><div style={{fontSize:11,fontWeight:800,color:"#374151"}}>{b.name}</div><div style={{fontSize:10,color:"#6b7280"}}>{b.desc}</div></div>)}
            </div>
          </>}
        </div>
        {/* Recent sessions */}
        {sessions.length>0&&(
          <div style={{background:"white",borderRadius:20,padding:"18px",boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
            <p style={{fontWeight:800,fontSize:14,color:"#1e1b4b",margin:"0 0 12px"}}>📋 Recent Quizzes</p>
            {sessions.slice(0,5).map((s,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<4?"1px solid #f3f4f6":"none"}}>
                <div><div style={{fontWeight:700,fontSize:13,color:"#1e1b4b"}}>{s.subjects?.map(x=>SUBJECT_LABELS[x]?.split(" ")[0]).join(", ")}</div><div style={{fontSize:11,color:"#6b7280"}}>{s.date} · {s.difficulty}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:14,color:s.percentage>=80?"#059669":s.percentage>=60?"#D97706":"#DC2626"}}>{s.percentage}%</div><div style={{fontSize:11,color:"#F59E0B",fontWeight:700}}>+{s.xp_earned} XP</div></div>
              </div>
            ))}
          </div>
        )}
      </PageWrap>
    );
  }

  // ── LEADERBOARD ───────────────────────────────────────────────────────────
  if (tab==="leaderboard") return (
    <PageWrap>
      <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>🏆 Leaderboard</h2>
      <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 14px"}}>Top 10 players by XP. Compete with friends!</p>
      <div style={{background:"white",borderRadius:20,padding:"18px",boxShadow:"0 8px 25px rgba(0,0,0,0.2)"}}>
        {leaderboard.length===0?(
          <div style={{textAlign:"center",padding:"30px 0"}}>
            <p style={{fontSize:40,margin:"0 0 8px"}}>🏁</p>
            <p style={{fontWeight:700,color:"#374151"}}>No players yet!</p>
            <p style={{color:"#6b7280",fontSize:13}}>Complete a quiz to appear here.</p>
          </div>
        ):leaderboard.map((p,i)=>{
          const isMe = user && p.user_id===user.id;
          const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<leaderboard.length-1?"1px solid #f3f4f6":"none",background:isMe?"#EEF2FF":"transparent",borderRadius:isMe?10:0,paddingLeft:isMe?8:0,paddingRight:isMe?8:0}}>
              <div style={{width:32,textAlign:"center",fontSize:i<3?22:14,fontWeight:800,color:"#6b7280"}}>{medal}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:14,color:"#1e1b4b"}}>{p.display_name||"Player"}{isMe?" (you)":""}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>🔥{p.streak_days||0} streak · {p.total_correct||0} correct · {p.badges_count||0} badges</div>
              </div>
              <div style={{textAlign:"right"}}><div style={{fontWeight:900,fontSize:16,color:"#F59E0B"}}>{(p.xp||0).toLocaleString()}</div><div style={{fontSize:10,color:"#9ca3af"}}>XP</div></div>
            </div>
          );
        })}
      </div>
      {!user&&<div style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"14px",marginTop:12,textAlign:"center"}}><p style={{color:"white",fontWeight:700,fontSize:13,margin:"0 0 8px"}}>Sign in to appear on the leaderboard!</p><button onClick={()=>window.location.href="/login"} style={{padding:"9px 20px",borderRadius:10,background:"white",color:"#3730a3",fontWeight:800,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign In →</button></div>}
    </PageWrap>
  );

  // ── SCHOOLS ───────────────────────────────────────────────────────────────
  const SCHOOLS = [
    {name:"Queen Elizabeth's School (Boys)",borough:"Barnet",exam:"GL Assessment",subjects:"Maths & English",places:180,tip:"Very competitive — 2,000+ apply for 180 places."},
    {name:"The Henrietta Barnett School (Girls)",borough:"Barnet",exam:"GL + School-Set",subjects:"English, VR, NVR, Maths",places:null,tip:"Two-stage exam. Stage 2 includes written English & Maths."},
    {name:"St Michael's Catholic Grammar (Girls)",borough:"Barnet",exam:"GL Assessment",subjects:"VR, NVR, Maths",places:96,tip:"Faith school — requires a Catholic priest's reference."},
    {name:"Beths Grammar School (Boys)",borough:"Bexley",exam:"Bexley Selection Test",subjects:"English, Maths, VR, NVR",places:192,tip:"Register by 31 March. Two 50-minute papers."},
    {name:"Bexley Grammar School (Mixed)",borough:"Bexley",exam:"Bexley Selection Test",subjects:"English, Maths, VR, NVR",places:null,tip:"Two 50-minute multiple choice papers on the same day."},
    {name:"Townley Grammar School (Girls)",borough:"Bexley",exam:"Bexley Selection Test",subjects:"English, Maths, VR, NVR",places:null,tip:"No formal catchment — distance used as tiebreaker."},
    {name:"St Olave's & St Saviour's (Boys)",borough:"Bromley",exam:"School-Specific (2-stage)",subjects:"English, Logic, Maths",places:124,tip:"One of the top state schools in England. Very competitive."},
    {name:"Newstead Wood School (Girls)",borough:"Bromley",exam:"GL Assessment",subjects:"VR & NVR",places:150,tip:"Need qualifying score of 210+. 9-mile catchment area."},
    {name:"The Latymer School (Mixed)",borough:"Enfield",exam:"GL + School-Set",subjects:"Maths, VR, English",places:192,tip:"Strict postcode catchment — N, E and EN postcodes only."},
    {name:"Tiffin School (Boys)",borough:"Kingston",exam:"School-Specific",subjects:"Maths & English",places:null,tip:"Two-stage. No fixed pass mark — relative to cohort."},
    {name:"The Tiffin Girls' School",borough:"Kingston",exam:"School-Specific",subjects:"English (60%) & Maths (40%)",places:null,tip:"44 designated postcode districts: KT, TW, SW, SM, CR."},
    {name:"Ilford County High School (Boys)",borough:"Redbridge",exam:"GL Assessment",subjects:"English, VR, NVR",places:180,tip:"Register May–June. Exam in September each year."},
    {name:"Woodford County High School (Girls)",borough:"Redbridge",exam:"GL Assessment",subjects:"English, VR, NVR",places:180,tip:"25% of places for Pupil Premium children. Pass mark: 104."},
    {name:"Wilson's School (Boys)",borough:"Sutton",exam:"Sutton SET + Stage 2",subjects:"English & Maths",places:180,tip:"Register by 1 August. SET exam in September."},
    {name:"Sutton Grammar School (Boys)",borough:"Sutton",exam:"Sutton SET + Stage 2",subjects:"English & Maths",places:120,tip:"One of five Sutton schools — all use the shared SET."},
    {name:"Nonsuch High School for Girls",borough:"Sutton",exam:"Sutton SET + Stage 2",subjects:"English & Maths",places:180,tip:"Girls' schools share the NWSSEE second-stage exam."},
    {name:"Wallington High School for Girls",borough:"Sutton",exam:"Sutton SET + Stage 2",subjects:"English & Maths",places:180,tip:"Apply by 1 August. Same SET as all Sutton schools."},
  ];
  const BOROUGHS=["All",...new Set(SCHOOLS.map(s=>s.borough))];
  if (tab==="schools") return (
    <PageWrap>
      <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"16px 0 4px"}}>🏫 London Grammar Schools</h2>
      <p style={{color:"#c7d2fe",fontSize:13,margin:"0 0 12px"}}>17 schools across 7 boroughs. Tap for details & tips.</p>
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {BOROUGHS.map(b=><button key={b} onClick={()=>setSchoolFilter(b)} style={{padding:"7px 13px",borderRadius:20,flexShrink:0,fontWeight:700,fontSize:12,border:`2px solid ${schoolFilter===b?"white":"rgba(255,255,255,0.3)"}`,background:schoolFilter===b?"white":"transparent",color:schoolFilter===b?"#3730a3":"white",cursor:"pointer"}}>{b}</button>)}
      </div>
      {(schoolFilter==="All"?SCHOOLS:SCHOOLS.filter(s=>s.borough===schoolFilter)).map((s,i)=>(
        <div key={i} onClick={()=>setExpandedSchool(expandedSchool===i?null:i)} style={{background:"white",borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:"pointer",boxShadow:"0 4px 15px rgba(0,0,0,0.15)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}><p style={{margin:"0 0 6px",fontWeight:800,fontSize:14,color:"#1e1b4b"}}>{s.name}</p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                <span style={{fontSize:11,fontWeight:700,background:"#EEF2FF",color:"#4F46E5",padding:"2px 8px",borderRadius:10}}>{s.borough}</span>
                <span style={{fontSize:11,fontWeight:600,background:"#F0FDF4",color:"#059669",padding:"2px 8px",borderRadius:10}}>{s.exam}</span>
                {s.places&&<span style={{fontSize:11,fontWeight:600,background:"#FEF3C7",color:"#D97706",padding:"2px 8px",borderRadius:10}}>{s.places} places</span>}
              </div>
            </div>
            <span style={{color:"#9ca3af",fontSize:16,marginLeft:8}}>{expandedSchool===i?"▲":"▼"}</span>
          </div>
          {expandedSchool===i&&(
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #f3f4f6"}}>
              <p style={{margin:"0 0 5px",fontSize:13,color:"#374151"}}><strong>📚 Tested:</strong> {s.subjects}</p>
              <div style={{background:"#FFFBEB",borderRadius:10,padding:"10px 12px",margin:"8px 0"}}><p style={{margin:0,fontSize:13,color:"#92400E",fontWeight:600}}>💡 {s.tip}</p></div>
              <button onClick={e=>{e.stopPropagation();setTab("quiz");}} style={{padding:"9px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>✏️ Practise for this school →</button>
            </div>
          )}
        </div>
      ))}
    </PageWrap>
  );

  return null;
}
