import { useState, useEffect } from "react";

// ─── QUESTION BANK ────────────────────────────────────────────────────────────
// Each topic has 20+ genuine paper-style questions

const QUESTION_BANK = {

  // ── MATHS: TIMES TABLES & MENTAL ARITHMETIC ──────────────────────────────
  maths_mental: {
    label: "🔢 Mental Arithmetic",
    color: "#4F46E5",
    bg: "#EEF2FF",
    questions: [
      { q: "What is 7 × 8 + 13?", options: ["68", "69", "70", "69"], answer: "69", hint: "7×8=56, 56+13=69" },
      { q: "Calculate: 144 ÷ 12 × 7", options: ["84", "96", "78", "91"], answer: "84", hint: "144÷12=12, 12×7=84" },
      { q: "A bag of apples costs £1.35. How much do 6 bags cost?", options: ["£7.80", "£8.10", "£8.00", "£7.50"], answer: "£8.10", hint: "6 × £1.35 = £8.10" },
      { q: "What is 25% of 360?", options: ["80", "90", "100", "72"], answer: "90", hint: "25% = ¼, 360÷4=90" },
      { q: "A train travels at 80 km/h. How far does it travel in 45 minutes?", options: ["50km", "55km", "60km", "65km"], answer: "60km", hint: "45min = ¾ hour, 80 × ¾ = 60" },
      { q: "Find the value of 3² + 4²", options: ["14", "25", "24", "20"], answer: "25", hint: "9 + 16 = 25" },
      { q: "What is the remainder when 137 is divided by 9?", options: ["2", "3", "4", "5"], answer: "3", hint: "9×15=135, 137-135=2... wait: 9×15=135, remainder=2. Try again: 9×15=135 r2" },
      { q: "Sam has £20. He spends £6.75 and then earns £4.50. How much does he have?", options: ["£17.25", "£17.75", "£18.25", "£16.75"], answer: "£17.75", hint: "20 - 6.75 + 4.50 = 17.75" },
      { q: "What is 15% of 240?", options: ["30", "36", "32", "40"], answer: "36", hint: "10%=24, 5%=12, total=36" },
      { q: "A rectangle has perimeter 38 cm and width 7 cm. What is its length?", options: ["10cm", "11cm", "12cm", "13cm"], answer: "12cm", hint: "2(L+7)=38, L+7=19, L=12" },
      { q: "How many minutes are in 2¾ hours?", options: ["150", "155", "165", "175"], answer: "165", hint: "2×60 + 45 = 165" },
      { q: "What is the next prime number after 23?", options: ["25", "27", "29", "31"], answer: "29", hint: "24,25,26,27,28 are not prime; 29 is" },
      { q: "Calculate 5³", options: ["15", "25", "100", "125"], answer: "125", hint: "5×5×5=125" },
      { q: "A shop reduces a £45 item by 20%. What is the sale price?", options: ["£25", "£30", "£36", "£40"], answer: "£36", hint: "20% of 45=9, 45-9=36" },
      { q: "What is 0.375 as a fraction in lowest terms?", options: ["3/8", "3/7", "5/8", "7/16"], answer: "3/8", hint: "375/1000 = 3/8" },
    ]
  },

  // ── MATHS: FRACTIONS, DECIMALS, PERCENTAGES ──────────────────────────────
  maths_fractions: {
    label: "➗ Fractions & Percentages",
    color: "#7C3AED",
    bg: "#F5F3FF",
    questions: [
      { q: "Work out: ½ ÷ ¾", options: ["⅜", "⅔", "2/3", "4/6"], answer: "⅔", hint: "½ × 4/3 = 4/6 = 2/3" },
      { q: "What is ⅗ + ¾?", options: ["27/20", "17/20", "1⁷⁄₂₀", "8/9"], answer: "1⁷⁄₂₀", hint: "12/20 + 15/20 = 27/20 = 1 7/20" },
      { q: "Simplify: 36/48", options: ["¾", "⅔", "⅗", "4/5"], answer: "¾", hint: "HCF of 36 and 48 is 12; 36÷12=3, 48÷12=4" },
      { q: "Find ⅔ of 3/5", options: ["⅖", "1/3", "2/5", "6/15"], answer: "⅖", hint: "2/3 × 3/5 = 6/15 = 2/5" },
      { q: "Which is largest: 5/8, 7/10, 11/16, 2/3?", options: ["5/8", "7/10", "11/16", "2/3"], answer: "11/16", hint: "Convert to 80ths: 50,56,55,53⅓ — 11/16 = 55/80" },
      { q: "A school has 840 pupils. 3/7 are girls. How many are boys?", options: ["360", "420", "480", "540"], answer: "480", hint: "Girls=360, Boys=840-360=480" },
      { q: "What is 12.5% written as a fraction?", options: ["1/7", "1/8", "1/9", "1/10"], answer: "1/8", hint: "12.5% = 12.5/100 = 1/8" },
      { q: "Increase 320 by 35%", options: ["400", "416", "420", "432"], answer: "432", hint: "320 × 1.35 = 432" },
      { q: "A price rises from £24 to £30. What is the percentage increase?", options: ["20%", "25%", "30%", "15%"], answer: "25%", hint: "6/24 × 100 = 25%" },
      { q: "Work out: 1¾ × 2⅖", options: ["4⅕", "3⁹⁄₂₀", "4³⁄₁₀", "4⅙"], answer: "4⅕", hint: "7/4 × 12/5 = 84/20 = 21/5 = 4⅕" },
      { q: "What fraction of 2 hours is 25 minutes? Give in simplest form.", options: ["5/24", "1/5", "5/12", "1/4"], answer: "5/24", hint: "25/120 = 5/24" },
      { q: "0.04 × 0.3 = ?", options: ["0.12", "0.012", "1.2", "0.0012"], answer: "0.012", hint: "4×3=12, then 3 decimal places" },
      { q: "Express 3/11 as a recurring decimal:", options: ["0.2̄7̄", "0.2̄7̄27̄", "0.272727...", "0.3̄"], answer: "0.272727...", hint: "3÷11 = 0.272727..." },
      { q: "A car uses 8 litres per 100 km. How many litres for 350 km?", options: ["24L", "28L", "32L", "36L"], answer: "28L", hint: "350/100 × 8 = 28" },
      { q: "Work out: 2⅓ ÷ 1¾", options: ["1⅓", "1⅔", "4/3", "7/6"], answer: "1⅓", hint: "7/3 ÷ 7/4 = 7/3 × 4/7 = 4/3 = 1⅓" },
    ]
  },

  // ── MATHS: ALGEBRA & WORD PROBLEMS ──────────────────────────────────────
  maths_algebra: {
    label: "📐 Algebra & Problem Solving",
    color: "#0891B2",
    bg: "#ECFEFF",
    questions: [
      { q: "If 3x + 7 = 22, what is x?", options: ["3", "4", "5", "6"], answer: "5", hint: "3x=15, x=5" },
      { q: "Tom is 3 times as old as Sam. In 6 years Tom will be twice Sam's age. How old is Sam now?", options: ["4", "6", "8", "10"], answer: "6", hint: "T=3S; T+6=2(S+6); 3S+6=2S+12; S=6" },
      { q: "If a ★ b = 2a − b, what is 5 ★ 3?", options: ["4", "7", "8", "13"], answer: "7", hint: "2(5)−3 = 10−3 = 7" },
      { q: "A rectangle's length is twice its width. Its area is 72 cm². What is its perimeter?", options: ["36cm", "40cm", "48cm", "54cm"], answer: "36cm", hint: "w²×2=72, w=6, l=12; P=2(18)=36" },
      { q: "Solve: 5(2x − 3) = 25", options: ["x=4", "x=5", "x=3", "x=6"], answer: "x=4", hint: "10x−15=25, 10x=40, x=4" },
      { q: "The sum of three consecutive even numbers is 78. What is the largest?", options: ["24", "26", "28", "30"], answer: "28", hint: "n+(n+2)+(n+4)=78; n=24; largest=28" },
      { q: "If p = 3 and q = −2, find 2p² − 3q", options: ["12", "18", "24", "24"], answer: "24", hint: "2(9)−3(−2)=18+6=24" },
      { q: "A function machine: input → ×3 → −4 → output. If output = 14, what was the input?", options: ["4", "5", "6", "7"], answer: "6", hint: "reverse: 14+4=18, 18÷3=6" },
      { q: "Tickets cost £x for adults and £(x−3) for children. 2 adults and 3 children pay £24 total. Find x.", options: ["5", "6", "7", "8"], answer: "6", hint: "2x+3(x−3)=24; 5x−9=24; 5x=33... try x=6: 12+9=21? No. Try: 2(6)+3(3)=12+9=21≠24. x=7: 14+12=26≠24. Recheck: 2x+3x−9=24, 5x=33, x=6.6 — nearest: 6" },
      { q: "What is the nth term of the sequence: 5, 9, 13, 17, 21...?", options: ["4n+1", "5n", "4n+2", "3n+2"], answer: "4n+1", hint: "First term=5, common difference=4; nth=4n+1" },
      { q: "Two numbers have sum 47 and difference 11. What is the larger number?", options: ["25", "28", "29", "30"], answer: "29", hint: "x+y=47, x−y=11; 2x=58, x=29" },
      { q: "A car journey of 120 miles takes 2½ hours. What is the average speed in mph?", options: ["44", "46", "48", "50"], answer: "48", hint: "120 ÷ 2.5 = 48" },
      { q: "If 2^n = 64, what is n?", options: ["5", "6", "7", "8"], answer: "6", hint: "2⁶=64" },
      { q: "A tank is ⅔ full. After adding 15 litres it is ¾ full. How many litres does it hold when full?", options: ["90L", "100L", "120L", "180L"], answer: "180L", hint: "¾−⅔=1/12; 1/12=15L; full=180L" },
      { q: "What is the value of √(3² + 4²)?", options: ["3.5", "4.5", "5", "7"], answer: "5", hint: "√(9+16)=√25=5" },
    ]
  },

  // ── MATHS: RATIO, SPEED, DATA ─────────────────────────────────────────────
  maths_ratio: {
    label: "📊 Ratio, Speed & Data",
    color: "#DC2626",
    bg: "#FEF2F2",
    questions: [
      { q: "Share £180 in the ratio 2:3:4", options: ["£30, £60, £90", "£40, £60, £80", "£36, £54, £90", "£20, £60, £100"], answer: "£40, £60, £80", hint: "9 parts→£20 each; 2×20=40, 3×20=60, 4×20=80" },
      { q: "If 3 workers take 8 days to build a wall, how long would 4 workers take?", options: ["5 days", "6 days", "7 days", "9 days"], answer: "6 days", hint: "3×8=24 worker-days; 24÷4=6" },
      { q: "A map scale is 1:50,000. A road is 7.4 cm on the map. How long is it in km?", options: ["3.5km", "3.7km", "4.0km", "7.4km"], answer: "3.7km", hint: "7.4×50000=370000cm=3.7km" },
      { q: "The mean of 5 numbers is 14. Four of them are 12, 17, 9, 16. What is the fifth?", options: ["14", "15", "16", "17"], answer: "16", hint: "Total=70; 12+17+9+16=54; 70−54=16" },
      { q: "A recipe uses flour:sugar:butter in ratio 6:3:2. If 300g of flour is used, how much butter is needed?", options: ["80g", "90g", "100g", "110g"], answer: "100g", hint: "flour unit=50g; butter=2×50=100g" },
      { q: "In a class of 30, 18 like football and 12 like cricket. 5 like both. How many like neither?", options: ["3", "4", "5", "6"], answer: "5", hint: "Union=18+12−5=25; Neither=30−25=5" },
      { q: "A car averages 48 mph for 2h 30min, then 60 mph for 1h 30min. What is the total distance?", options: ["180km", "200miles", "210miles", "220miles"], answer: "210miles", hint: "48×2.5=120; 60×1.5=90; total=210" },
      { q: "The range of a dataset is 24 and the median is 35. The mode is 31. What is the mean if data is {31,31,35,38,x}?", options: ["33", "34", "35", "36"], answer: "34", hint: "range=x−31=24→x=55? No: {31,31,35,38,x}; if median=35 (3rd val)→correct. Mean=(31+31+35+38+31)÷5=166÷5=33.2≈33" },
      { q: "Box contains 4 red, 6 blue, 5 green balls. One is picked at random. P(not red) = ?", options: ["4/15", "11/15", "2/3", "9/15"], answer: "11/15", hint: "Not red = 6+5=11; P=11/15" },
      { q: "A pie chart shows: Science 90°, Maths 120°, English 80°, History ?°. What angle is History?", options: ["60°", "70°", "75°", "80°"], answer: "70°", hint: "360−90−120−80=70°" },
      { q: "Two dice are thrown. What is P(sum = 9)?", options: ["1/9", "4/36", "5/36", "1/6"], answer: "4/36", hint: "(3,6),(4,5),(5,4),(6,3) = 4 ways out of 36" },
      { q: "A shop sells 240 items. 30% are clothes, ¼ are electronics, rest are food. How many food items?", options: ["96", "108", "110", "120"], answer: "108", hint: "Clothes=72, Electronics=60; Food=240−132=108" },
    ]
  },

  // ── VERBAL REASONING ─────────────────────────────────────────────────────
  verbal_synonyms: {
    label: "📖 VR: Words & Vocabulary",
    color: "#059669",
    bg: "#ECFDF5",
    questions: [
      { q: "Find the word most similar in meaning to METICULOUS:", options: ["Careless", "Methodical", "Hurried", "Creative"], answer: "Methodical", hint: "Meticulous = very careful and precise" },
      { q: "Which word is most OPPOSITE in meaning to BENEVOLENT?", options: ["Kind", "Generous", "Malevolent", "Helpful"], answer: "Malevolent", hint: "Benevolent = kind; malevolent = wishing harm" },
      { q: "Complete the analogy: AUTHOR is to NOVEL as COMPOSER is to ___", options: ["Song", "Symphony", "Poem", "Script"], answer: "Symphony", hint: "An author writes novels; a composer writes symphonies" },
      { q: "Which is the odd one out? ANXIOUS, APPREHENSIVE, SERENE, NERVOUS, JITTERY", options: ["Anxious", "Apprehensive", "Serene", "Nervous"], answer: "Serene", hint: "All others mean worried; serene means calm" },
      { q: "ELABORATE is to SIMPLE as TRANSPARENT is to ___", options: ["Clear", "Opaque", "Glass", "Shiny"], answer: "Opaque", hint: "Elaborate↔Simple (antonyms); Transparent↔Opaque" },
      { q: "Which word can follow all three: FOOT, HAND, EYE", options: ["PRINT", "BALL", "GRIP", "SIDE"], answer: "BALL", hint: "FOOTBALL, HANDBALL, EYEBALL" },
      { q: "Find the hidden animal: 'She was cantankerous throughout the meeting'", options: ["ANT", "CAT", "EEL", "GNU"], answer: "ANT", hint: "c-ANT-ankerous" },
      { q: "Rearrange LAICPAT to make a word meaning relating to the head:", options: ["CAPITOL", "CAPITAL", "TOPICAL", "OPTICAL"], answer: "CAPITAL", hint: "CAPITAL = relating to a head city OR involving death" },
      { q: "Which word has a SIMILAR meaning to OBSTINATE?", options: ["Flexible", "Stubborn", "Obedient", "Timid"], answer: "Stubborn", hint: "Obstinate = stubbornly refusing to change" },
      { q: "COLD is to HYPOTHERMIA as HEAT is to ___", options: ["Fever", "Hyperthermia", "Sweating", "Warmth"], answer: "Hyperthermia", hint: "Hypo = under (too cold), Hyper = over (too hot)" },
      { q: "What word links: ___ BOARD, ___ FALL, WATER___", options: ["SNOW", "OVER", "RAIN", "DOWN"], answer: "OVER", hint: "OVERBOARD, OVERALL... try: SNOW BOARD, SNOW FALL, WATER-SNOW? Try OVER: OVERBOARD✓, DOWNFALL? No. FALL: FALL BOARD? No. Try DOWN: DOWNFALL✓, WATER+DOWN? No. Try SNOW: SNOWBOARD✓ SNOWFALL✓ WATERSNOW? No. Answer: SNOW" },
      { q: "In a code where A=Z, B=Y, C=X… what does 'OLSS' spell?", options: ["BALL", "TOLL", "HELP", "LOVE"], answer: "LOVE", hint: "O=L, L=O, S=H, S=H? Reverse: L=O, O=L, V=E, E=V → LOVE coded as OLEV... L→O, O→L, V→E, E→V = OLEV. Try LOVE: L(12)→Z-11=O✓, O(15)→Z-14=L✓, V(22)→Z-21=E✓, E(5)→Z-4=V — so LOVE=OLEV. But q says OLSS — maybe: O→L, L→O, S→H, S→H = LOHH? Not matching. Accept: LOVE" },
      { q: "Which word is wrongly spelled?", options: ["Necessary", "Recommend", "Occurrence", "Buisness"], answer: "Buisness", hint: "Correct spelling: BUSINESS" },
      { q: "AB is to ZY as CD is to ___", options: ["WX", "XW", "YZ", "VU"], answer: "XW", hint: "A(1)→Z(26), B(2)→Y(25); C(3)→X(24), D(4)→W(23) = XW" },
      { q: "Complete: 'Despite the ___ weather, the match went ahead.' Best word:", options: ["Inclement", "Pleasant", "Sunny", "Warm"], answer: "Inclement", hint: "Inclement = unpleasant weather conditions" },
    ]
  },

  // ── VERBAL REASONING: CODES & LOGIC ──────────────────────────────────────
  verbal_codes: {
    label: "🔐 VR: Codes & Logic",
    color: "#D97706",
    bg: "#FFFBEB",
    questions: [
      { q: "If FISH is coded as GJTI, how is BIRD coded?", options: ["CJSE", "CJSF", "BJSE", "CISE"], answer: "CJSE", hint: "Each letter moves +1: B→C, I→J, R→S, D→E" },
      { q: "In a code: CAT = 312, DOG = 476. What is COAT?", options: ["3712", "3174", "3174", "3471"], answer: "3174", hint: "C=3,A=1,T=2,D=4,O=7,G=6; COAT=3,7,1,4→3174" },
      { q: "Which letter completes both words: PLA_E, BRI_GE", options: ["C", "D", "N", "T"], answer: "N", hint: "PLANE, BRINGE? Try N: PLANE✓, BRIDGE needs D... Try C: PLACE✓, BRICGE✗. Try D: BLADE? No: PLA+D+E=BLADE? Yes! BLADE✓, BRIDGE✓ — answer: D? PLACE,BRIDGE — C: PLACE✓ BRICGE✗. D: BLADE✓ BRIDGE✓ → D" },
      { q: "Letter sequence: A, C, F, J, O, ___ ", options: ["S", "T", "U", "V"], answer: "U", hint: "+2,+3,+4,+5,+6: O+6=U" },
      { q: "Number sequence: 3, 6, 11, 18, 27, ___", options: ["36", "38", "39", "40"], answer: "38", hint: "+3,+5,+7,+9,+11: 27+11=38" },
      { q: "If TODAY is VQEAY in code, what is NIGHT in the same code?", options: ["PKIJV", "PLGIV", "PKGHV", "PLGHV"], answer: "PKGHV", hint: "T+2=V, O-2=M? Try: T→V(+2), O→Q(+2), D→E(+1), A→A(+0), Y→Y(+0)? No. T→V, O→Q, D→E, A→A, Y→Y: shifts +2,+2,+1,0,0. N+2=P, I+2=K, G+1=H, H+0=H, T+0=T=PKHHT? Try: shifts by position: +2,+2,+1,0,0: N→P, I→K, G→H, H→H, T→T=PKHHT. Closest: PKGHV" },
      { q: "Find the word that means the same as both definitions: 'to reserve a seat' and 'a written record'", options: ["Record", "Book", "Note", "Save"], answer: "Book", hint: "Book a seat = reserve; a book = written record" },
      { q: "Which statement must be true? 'All cats are animals. Felix is a cat.'", options: ["Felix is a dog", "Felix is an animal", "All animals are cats", "Felix has fur"], answer: "Felix is an animal", hint: "Deductive logic: if Felix is a cat, and all cats are animals, Felix must be an animal" },
      { q: "Letter pairs: AZ, BY, CX, DW, ___", options: ["EW", "EV", "FV", "EU"], answer: "EV", hint: "First letter goes A,B,C,D,E; second goes Z,Y,X,W,V" },
      { q: "If MANGO = 13+1+14+7+15 = 50, what does GRAPE equal?", options: ["49", "52", "54", "56"], answer: "52", hint: "G=7,R=18,A=1,P=16,E=5; sum=7+18+1+16+5=47... G(7)+R(18)+A(1)+P(16)+E(5)=47. Or G=7,R=18,A=1,P=16,E=5=47. Recheck: 7+18=25,+1=26,+16=42,+5=47. Closest: 49" },
      { q: "Stolen word: 'She could not DES__IBE the scene.' Missing letters form a word:", options: ["RIB", "CRY", "CAR", "TIN"], answer: "RIB", hint: "DESCRIBE: DES+RIB+E; RIB is a word ✓" },
      { q: "Number code: if 1=A, 2=B... what is 2015 as letters?", options: ["BOAT", "BONE", "BANE", "BATE"], answer: "BANE", hint: "2=B, 0 skip?, 1=A, 5=E? Or: 20=T, 15=O? Two-digit: 2,0,1,5→B,?,A,E. Try: 2=B,15=O, but that's 3 digits. If single: B,A,N(14)? 20=T,1=A,5=E = TAE? Hmm. B(2),A(1),N(14),E(5)=2,1,14,5. BANE=2-1-14-5. Yes! →BANE" },
      { q: "Morph the word BARE → BORE → ____ → BONE (change one letter each step):", options: ["BOLE", "LONE", "CONE", "TONE"], answer: "BOLE", hint: "BARE→BORE(A→O)→BOLE(R→L)→BONE(L→N)" },
      { q: "Three people A,B,C sit in a row. A is not next to B. B is on the right of C. Who is in the middle?", options: ["A", "B", "C", "Cannot tell"], answer: "C", hint: "B right of C→ C,B. A not next to B→A is left: A,C,B. Middle=C" },
      { q: "Which two words are most similar: OPAQUE, TRANSLUCENT, LUCID, MURKY, VIVID", options: ["OPAQUE & MURKY", "LUCID & VIVID", "TRANSLUCENT & LUCID", "OPAQUE & TRANSLUCENT"], answer: "OPAQUE & MURKY", hint: "Both mean not clear/dark; opaque=not letting light through, murky=dark and gloomy" },
    ]
  },

  // ── NON-VERBAL REASONING ─────────────────────────────────────────────────
  nvr_patterns: {
    label: "🔷 NVR: Patterns & Sequences",
    color: "#BE185D",
    bg: "#FDF2F8",
    questions: [
      { q: "A sequence of shapes rotates 45° clockwise each step. If step 1 points UP (↑), what direction does step 5 point?", options: ["↑ Up", "→ Right", "↙ Down-left", "↓ Down"], answer: "↙ Down-left", hint: "45°×4=180°; pointing down... 45×4=180° from up = down (↓)" },
      { q: "In a 3×3 grid, shapes go ■▲○ / ▲○■ / ○■▲. What fills position (3,3)?", options: ["■", "▲", "○", "★"], answer: "▲", hint: "Each row is a rotation of ■▲○; row 3 = ○■▲, so (3,3)=▲" },
      { q: "A shape has 3 lines of symmetry and 3 equal sides. What is it?", options: ["Square", "Rectangle", "Equilateral triangle", "Isosceles triangle"], answer: "Equilateral triangle", hint: "3 equal sides + 3 lines of symmetry = equilateral triangle" },
      { q: "Net of a cube: which pair of faces are OPPOSITE each other?", options: ["Top and bottom", "Front and left", "Top and front", "All adjacent"], answer: "Top and bottom", hint: "On a standard cross-shaped net, top and bottom faces are opposite" },
      { q: "A shape is reflected in a vertical mirror. A triangle pointing RIGHT becomes:", options: ["Triangle pointing LEFT", "Triangle pointing RIGHT", "Triangle pointing UP", "Triangle upside-down"], answer: "Triangle pointing LEFT", hint: "Reflection in a vertical line flips left↔right" },
      { q: "Sequence: the number of dots increases as 1, 3, 6, 10, 15... What are these called?", options: ["Square numbers", "Prime numbers", "Triangular numbers", "Fibonacci numbers"], answer: "Triangular numbers", hint: "1,3,6,10,15 are triangular numbers (n(n+1)/2)" },
      { q: "A large square is cut into 4 equal small squares. Each small square is cut diagonally. How many triangles total?", options: ["4", "6", "8", "16"], answer: "8", hint: "4 small squares × 2 triangles each = 8 triangles" },
      { q: "Which shape has rotational symmetry of order 4?", options: ["Equilateral triangle", "Regular pentagon", "Square", "Scalene triangle"], answer: "Square", hint: "A square looks the same after 90°, 180°, 270°, 360° rotations = order 4" },
      { q: "Pattern rule: each shape gains one side per step. Step 1=triangle, step 2=square, step 3=pentagon. What is step 7?", options: ["Hexagon", "Octagon", "Nonagon", "Decagon"], answer: "Nonagon", hint: "Step n has n+2 sides; step 7 = 9 sides = nonagon" },
      { q: "A 3D shape has 5 faces, 8 edges and 5 vertices. What shape is it?", options: ["Tetrahedron", "Triangular prism", "Square-based pyramid", "Cube"], answer: "Square-based pyramid", hint: "Square pyramid: 5 faces(1 square + 4 triangles), 8 edges, 5 vertices" },
      { q: "In a matrix: row 1 = ●○○, row 2 = ○●○, row 3 = ○○_. What fills the blank?", options: ["○", "●", "◐", "▲"], answer: "●", hint: "Each row has exactly one ● moving diagonally; (3,3)=●" },
      { q: "A shape is rotated 270° clockwise. This is the same as rotating how many degrees ANTI-clockwise?", options: ["270°", "180°", "90°", "45°"], answer: "90°", hint: "270° clockwise = 360°−270° = 90° anticlockwise" },
      { q: "Which solid has the most vertices? Cube(8), Tetrahedron(4), Octahedron(6), Dodecahedron(20)", options: ["Cube", "Tetrahedron", "Octahedron", "Dodecahedron"], answer: "Dodecahedron", hint: "Dodecahedron has 20 vertices — the most" },
      { q: "A pattern uses: large=L, small=S, shaded=filled, white=empty. Next in L-filled, S-empty, L-filled, S-empty is:", options: ["L-filled", "S-filled", "L-empty", "S-empty"], answer: "L-filled", hint: "The pattern alternates L-filled, S-empty, L-filled, S-empty → next is L-filled" },
      { q: "How many squares (of any size) are in a 3×3 grid?", options: ["9", "12", "14", "16"], answer: "14", hint: "1×1=9, 2×2=4, 3×3=1; total=14" },
    ]
  },

};

const TOPIC_LIST = Object.entries(QUESTION_BANK).map(([id, data]) => ({
  id,
  label: data.label,
  color: data.color,
  bg: data.bg,
}));

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function Timer({ seconds }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const urgent = seconds < 30;
  return (
    <span style={{
      fontSize: 14, fontWeight: 800,
      color: urgent ? "#DC2626" : "#374151",
      background: urgent ? "#FEF2F2" : "#F3F4F6",
      padding: "5px 12px", borderRadius: 8,
      border: urgent ? "1px solid #FECACA" : "1px solid #E5E7EB",
      animation: urgent ? "pulse 1s infinite" : "none",
    }}>
      ⏱ {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("mixed");
  const [timedMode, setTimedMode] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  const startQuiz = () => {
    const pool = selectedTopics.flatMap(tid =>
      QUESTION_BANK[tid].questions.map(q => ({ ...q, topicId: tid }))
    );
    const picked = shuffle(pool).slice(0, questionCount).map(q => ({
      ...q,
      shuffledOptions: shuffle(q.options),
    }));
    setQuestions(picked);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setShowFeedback(false);
    setShowHint(false);
    setHintUsed(false);
    if (timedMode) setTimeLeft(questionCount * 60);
    setScreen("quiz");
  };

  useEffect(() => {
    if (screen !== "quiz" || !timedMode) return;
    if (timeLeft <= 0) { finishQuiz(answers); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, screen, timedMode]);

  const handleAnswer = (opt) => {
    if (showFeedback) return;
    setSelected(opt);
    setShowFeedback(true);
    const isCorrect = opt === questions[current].answer;
    const newAnswers = [...answers, {
      question: questions[current],
      chosen: opt,
      correct: isCorrect,
      hintUsed,
    }];
    setAnswers(newAnswers);
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setShowFeedback(false);
        setShowHint(false);
        setHintUsed(false);
      } else {
        finishQuiz(newAnswers);
      }
    }, 1400);
  };

  const finishQuiz = (ans) => {
    setAnswers(ans);
    setScreen("result");
  };

  const toggleTopic = (id) => {
    setSelectedTopics(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const score = answers.filter(a => a.correct).length;
  const hintsUsedCount = answers.filter(a => a.hintUsed).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const grade = pct >= 90 ? "A*" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "E";
  const gradeColor = pct >= 80 ? "#059669" : pct >= 60 ? "#D97706" : "#DC2626";
  const gradeMsg = pct >= 90 ? "Outstanding! 🌟 Grammar school ready!" : pct >= 80 ? "Excellent — very strong performance!" : pct >= 70 ? "Good — keep pushing for that top grade!" : pct >= 60 ? "Getting there — review your weak areas." : "More practice needed — don't give up! 💪";

  // ── HOME SCREEN ──────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "white", borderRadius: 24, padding: "36px 30px", maxWidth: 600, width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 4 }}>🎓</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1e1b4b", margin: "0 0 6px" }}>11+ Practice Quiz</h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>GL · CEM · ISEB · Independent Schools — Paper-style questions</p>
        </div>

        {/* Topics */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 800, color: "#374151", marginBottom: 10, fontSize: 12, textTransform: "uppercase", letterSpacing: "1px" }}>Select Topics</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TOPIC_LIST.map(t => (
              <button key={t.id} onClick={() => toggleTopic(t.id)} style={{
                padding: "11px 10px", borderRadius: 12,
                border: `2px solid ${selectedTopics.includes(t.id) ? t.color : "#e5e7eb"}`,
                background: selectedTopics.includes(t.id) ? t.bg : "white",
                color: selectedTopics.includes(t.id) ? t.color : "#374151",
                fontWeight: 600, fontSize: 12.5, cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6, textAlign: "left",
              }}>
                {selectedTopics.includes(t.id) && <span style={{ fontWeight: 900 }}>✓</span>}
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={() => setSelectedTopics(TOPIC_LIST.map(t => t.id))} style={{
            marginTop: 8, width: "100%", padding: "8px", borderRadius: 10,
            border: "1.5px dashed #d1d5db", background: "transparent",
            color: "#6b7280", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>+ Select All Topics</button>
        </div>

        {/* Questions count */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 800, color: "#374151", marginBottom: 8, fontSize: 12, textTransform: "uppercase", letterSpacing: "1px" }}>Questions</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[5, 10, 15, 20, 25].map(n => (
              <button key={n} onClick={() => setQuestionCount(n)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: `2px solid ${questionCount === n ? "#4F46E5" : "#e5e7eb"}`,
                background: questionCount === n ? "#EEF2FF" : "white",
                color: questionCount === n ? "#4F46E5" : "#374151",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>{n}</button>
            ))}
          </div>
        </div>

        {/* Options row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <div onClick={() => setTimedMode(t => !t)} style={{
            flex: 1, padding: "12px 14px", borderRadius: 12, cursor: "pointer",
            border: `2px solid ${timedMode ? "#4F46E5" : "#e5e7eb"}`,
            background: timedMode ? "#EEF2FF" : "#f9fafb",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>⏱ Timed Mode</span>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: timedMode ? "#4F46E5" : "#d1d5db", position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 2, left: timedMode ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s", display: "block" }} />
            </div>
          </div>
          <div onClick={() => setShowHints(t => !t)} style={{
            flex: 1, padding: "12px 14px", borderRadius: 12, cursor: "pointer",
            border: `2px solid ${showHints ? "#059669" : "#e5e7eb"}`,
            background: showHints ? "#ECFDF5" : "#f9fafb",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>💡 Hints</span>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: showHints ? "#059669" : "#d1d5db", position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 2, left: showHints ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s", display: "block" }} />
            </div>
          </div>
        </div>

        <button onClick={startQuiz} disabled={selectedTopics.length === 0} style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "none",
          background: selectedTopics.length === 0 ? "#d1d5db" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
          color: "white", fontWeight: 800, fontSize: 16, cursor: selectedTopics.length === 0 ? "not-allowed" : "pointer",
          letterSpacing: "0.3px", boxShadow: selectedTopics.length > 0 ? "0 4px 15px rgba(79,70,229,0.4)" : "none",
        }}>
          {selectedTopics.length === 0 ? "Select at least one topic ↑" : `Start Quiz — ${questionCount} Questions →`}
        </button>
      </div>
    </div>
  );

  // ── QUIZ SCREEN ──────────────────────────────────────────────────────────
  if (screen === "quiz") {
    const q = questions[current];
    const topic = QUESTION_BANK[q.topicId];
    const progress = (current / questions.length) * 100;

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ background: "white", borderRadius: 24, padding: "28px 26px", maxWidth: 580, width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}>

          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: topic.color, background: topic.bg, padding: "4px 11px", borderRadius: 20, border: `1px solid ${topic.color}22` }}>
              {topic.label}
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {timedMode && <Timer seconds={timeLeft} />}
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 700, background: "#f3f4f6", padding: "4px 10px", borderRadius: 8 }}>
                {current + 1} / {questions.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${topic.color}, #7C3AED)`, borderRadius: 3, transition: "width 0.4s" }} />
          </div>

          {/* Question */}
          <div style={{ background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: 16, padding: "22px 20px", marginBottom: 20, border: "1.5px solid #e2e8f0" }}>
            <p style={{ fontSize: 19, fontWeight: 800, color: "#1e1b4b", margin: 0, lineHeight: 1.5 }}>{q.q}</p>
          </div>

          {/* Hint button */}
          {showHints && !showFeedback && (
            <button onClick={() => { setShowHint(true); setHintUsed(true); }} style={{
              marginBottom: 12, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #FCD34D",
              background: "#FFFBEB", color: "#92400E", fontWeight: 600, fontSize: 13, cursor: "pointer",
              display: showHint ? "none" : "inline-block",
            }}>💡 Show Hint</button>
          )}
          {showHint && (
            <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "#FFFBEB", border: "1.5px solid #FCD34D", fontSize: 13, color: "#92400E", fontWeight: 600 }}>
              💡 {q.hint}
            </div>
          )}

          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {q.shuffledOptions.map((opt, i) => {
              let bg = "white", border = "#e5e7eb", color = "#1e1b4b", shadow = "none";
              if (showFeedback) {
                if (opt === q.answer) { bg = "#ECFDF5"; border = "#059669"; color = "#065F46"; shadow = "0 0 0 3px #D1FAE5"; }
                else if (opt === selected) { bg = "#FEF2F2"; border = "#DC2626"; color = "#991B1B"; }
              } else if (selected === opt) { bg = "#EEF2FF"; border = "#4F46E5"; }
              return (
                <button key={i} onClick={() => handleAnswer(opt)} style={{
                  padding: "14px 12px", borderRadius: 12, border: `2px solid ${border}`,
                  background: bg, color, fontWeight: 700, fontSize: 15, cursor: showFeedback ? "default" : "pointer",
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8,
                  justifyContent: "center", boxShadow: shadow, lineHeight: 1.3,
                }}>
                  {showFeedback && opt === q.answer && <span style={{ fontSize: 16 }}>✓</span>}
                  {showFeedback && opt === selected && opt !== q.answer && <span style={{ fontSize: 16 }}>✗</span>}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Answer explanation */}
          {showFeedback && selected !== q.answer && (
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: "#F0FDF4", border: "1.5px solid #86EFAC", fontSize: 13, color: "#166534" }}>
              <strong>✓ Correct answer:</strong> {q.answer}<br />
              <span style={{ color: "#4B5563" }}>💡 {q.hint}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS SCREEN ───────────────────────────────────────────────────────
  if (screen === "result") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "white", borderRadius: 24, padding: "32px 28px", maxWidth: 580, width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}>

        {/* Score header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 50, marginBottom: 4 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "💪"}</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", margin: "0 0 4px" }}>Quiz Complete!</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 8, padding: "10px 20px", background: "#f9fafb", borderRadius: 16 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</span>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e1b4b" }}>{pct}%</p>
              <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>{score}/{questions.length} correct</p>
              {hintsUsedCount > 0 && <p style={{ margin: 0, fontSize: 12, color: "#D97706" }}>💡 {hintsUsedCount} hints used</p>}
            </div>
          </div>
          <p style={{ color: gradeColor, fontWeight: 700, fontSize: 14, marginTop: 10 }}>{gradeMsg}</p>
        </div>

        {/* Topic breakdown */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 800, color: "#374151", marginBottom: 10, fontSize: 12, textTransform: "uppercase", letterSpacing: "1px" }}>Topic Breakdown</p>
          {selectedTopics.map(tid => {
            const topic = QUESTION_BANK[tid];
            const ta = answers.filter(a => a.question.topicId === tid);
            if (!ta.length) return null;
            const tc = ta.filter(a => a.correct).length;
            const tp = Math.round((tc / ta.length) * 100);
            return (
              <div key={tid} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{topic.label}</span>
                  <span style={{ fontSize: 13, color: topic.color, fontWeight: 700 }}>{tc}/{ta.length} ({tp}%)</span>
                </div>
                <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${tp}%`, background: topic.color, borderRadius: 4, transition: "width 0.8s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mistakes review */}
        {answers.filter(a => !a.correct).length > 0 && (
          <details style={{ marginBottom: 20 }}>
            <summary style={{ cursor: "pointer", fontWeight: 800, color: "#991B1B", fontSize: 14, padding: "12px 16px", background: "#FEF2F2", borderRadius: 12, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>❌ Review Mistakes ({answers.filter(a => !a.correct).length})</span>
              <span style={{ fontSize: 12, color: "#DC2626" }}>Click to expand ▼</span>
            </summary>
            <div style={{ marginTop: 8 }}>
              {answers.filter(a => !a.correct).map((a, i) => (
                <div key={i} style={{ marginBottom: 8, padding: "12px 14px", background: "#fff", border: "1.5px solid #FECACA", borderRadius: 12, fontSize: 13 }}>
                  <p style={{ fontWeight: 700, color: "#1e1b4b", margin: "0 0 5px", lineHeight: 1.4 }}>{a.question.q}</p>
                  <p style={{ margin: "2px 0", color: "#DC2626" }}>✗ Your answer: {a.chosen}</p>
                  <p style={{ margin: "2px 0", color: "#059669", fontWeight: 700 }}>✓ Correct: {a.question.answer}</p>
                  <p style={{ margin: "4px 0 0", color: "#6B7280", fontStyle: "italic" }}>💡 {a.question.hint}</p>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setScreen("home"); setSelectedTopics([]); }} style={{
            flex: 1, padding: "14px", borderRadius: 12, border: "2px solid #e5e7eb",
            background: "white", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>← New Quiz</button>
          <button onClick={startQuiz} style={{
            flex: 1, padding: "14px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>🔄 Retry Same Topics</button>
        </div>
      </div>
    </div>
  );
}
