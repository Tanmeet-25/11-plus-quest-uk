import { useState } from "react";

// ─── LEARN CONTENT ────────────────────────────────────────────────────────────
const LEARN_TOPICS = [
  {
    id: "times_tables", icon: "🔢", title: "Times Tables", subject: "maths", colour: "#4F46E5", bg: "#EEF2FF",
    intro: "Times tables are tested in EVERY 11+ maths paper. Know them instantly and you'll save loads of time!",
    sections: [
      {
        heading: "The Clever Tricks",
        type: "cards",
        cards: [
          { icon: "×2", title: "Just double it!", body: "6 × 2 = 12\n8 × 2 = 16\nAny number × 2 = add it to itself" },
          { icon: "×5", title: "Ends in 0 or 5", body: "7 × 5 = 35\n8 × 5 = 40\nAlways ends in 0 (even) or 5 (odd)" },
          { icon: "×9", title: "Digits add to 9!", body: "9×7=63 → 6+3=9 ✓\n9×8=72 → 7+2=9 ✓\nFingers trick works too!" },
          { icon: "×11", title: "Repeat the digit", body: "3×11=33\n7×11=77\n11×11=121 (careful!)" },
          { icon: "×12", title: "Do ×10 then +×2", body: "8×12: 8×10=80, 8×2=16\n80+16 = 96 ✓\nWorks every time!" },
          { icon: "×4", title: "Double twice!", body: "7×4: double 7=14\nthen double again=28 ✓\nEasy!" },
        ],
      },
      {
        heading: "The Tricky Ones — Memorise These!",
        type: "flashcards",
        cards: [
          { q: "6 × 7 = ?", a: "42", tip: "6 and 7 walk into a shop... they buy 42 things 😄" },
          { q: "6 × 8 = ?", a: "48", tip: "Six times eight, don't be late — it's 48!" },
          { q: "7 × 8 = ?", a: "56", tip: "5, 6, 7, 8 → 56 = 7 × 8 🎵 Sing it!" },
          { q: "7 × 9 = ?", a: "63", tip: "63 = 7 × 9. Digits 6+3=9 ✓" },
          { q: "8 × 9 = ?", a: "72", tip: "72 = 8 × 9. Digits 7+2=9 ✓" },
          { q: "12 × 12 = ?", a: "144", tip: "144 is called a gross. Learn it!" },
        ],
      },
      {
        heading: "How It's Tested in 11+",
        type: "worked",
        examples: [
          { q: "What is 144 ÷ 12?", steps: ["Think: what × 12 = 144?", "12 × 12 = 144", "So 144 ÷ 12 = 12 ✓"], answer: "12", note: "In 11+, division questions test if you know your tables BACKWARDS!" },
          { q: "A box holds 8 cakes. How many cakes in 7 boxes?", steps: ["8 × 7 = ?", "7 × 8 = 56 (one of the tricky ones!)", "56 cakes total"], answer: "56", note: "Word problems still just need your tables — spot the multiplication!" },
        ],
      },
    ],
  },
  {
    id: "fractions", icon: "➗", title: "Fractions", subject: "maths", colour: "#7C3AED", bg: "#F5F3FF",
    intro: "Fractions appear in every 11+ paper. Master the rules and you'll find them easy — there are only 4 things you need to know!",
    sections: [
      {
        heading: "The 4 Big Rules",
        type: "cards",
        cards: [
          { icon: "➕", title: "Adding & Subtracting", body: "Make the bottoms EQUAL first!\n½ + ¼ → 2/4 + 1/4 = 3/4\n\nFind the LCM of the bottoms, then adjust the tops." },
          { icon: "✖️", title: "Multiplying", body: "Top × top, bottom × bottom!\n2/3 × 3/4 = 6/12 = 1/2\n\nThen simplify the answer." },
          { icon: "➗", title: "Dividing — KCF!", body: "Keep, Change, Flip!\n½ ÷ ¼ = ½ × 4/1 = 2\n\nKeep first fraction, Change ÷ to ×, Flip second fraction." },
          { icon: "🎯", title: "Fraction of Amount", body: "Divide by bottom, multiply by top!\n¾ of 40:\n÷4 = 10, ×3 = 30 ✓" },
        ],
      },
      {
        heading: "KCF — Practise Dividing Fractions",
        type: "flashcards",
        cards: [
          { q: "½ ÷ ¼ = ?", a: "2", tip: "KCF: ½ × 4/1 = 4/2 = 2" },
          { q: "¾ ÷ ½ = ?", a: "1½", tip: "KCF: ¾ × 2/1 = 6/4 = 1½" },
          { q: "⅔ ÷ ⅓ = ?", a: "2", tip: "KCF: ⅔ × 3/1 = 6/3 = 2" },
          { q: "¼ ÷ ½ = ?", a: "½", tip: "KCF: ¼ × 2/1 = 2/4 = ½" },
          { q: "⅔ of 60 = ?", a: "40", tip: "60÷3=20, 20×2=40" },
          { q: "Simplify 8/12", a: "2/3", tip: "HCF=4: 8÷4=2, 12÷4=3" },
        ],
      },
      {
        heading: "Worked Examples",
        type: "worked",
        examples: [
          { q: "A school has 840 pupils. 3/7 are girls. How many boys?", steps: ["Find 1/7 of 840 → 840÷7 = 120", "Girls = 3 × 120 = 360", "Boys = 840 − 360 = 480"], answer: "480 boys", note: "Always find 1 part first, then multiply!" },
          { q: "Which is larger: 3/4 or 5/7?", steps: ["Convert to same denominator (28)", "3/4 = 21/28", "5/7 = 20/28 → so 3/4 is larger!"], answer: "3/4", note: "When comparing fractions, always convert to the same bottom number." },
        ],
      },
    ],
  },
  {
    id: "percentages", icon: "💯", title: "Percentages", subject: "maths", colour: "#0891B2", bg: "#ECFEFF",
    intro: "Percentage questions are GUARANTEED in your 11+ paper. Learn the shortcuts and solve them in under 10 seconds!",
    sections: [
      {
        heading: "The Speed Shortcuts",
        type: "cards",
        cards: [
          { icon: "10%", title: "Divide by 10", body: "10% of 350 = 35\n10% of 84 = 8.4\nJust move the decimal point!" },
          { icon: "5%", title: "Half of 10%", body: "5% of 80:\n10% = 8, halve it = 4 ✓\nEasy!" },
          { icon: "25%", title: "Divide by 4", body: "25% of 120:\n120 ÷ 4 = 30 ✓\n(Same as finding ¼)" },
          { icon: "15%", title: "10% + 5%", body: "15% of 60:\n10%=6, 5%=3\n6+3=9 ✓" },
          { icon: "50%", title: "Divide by 2", body: "50% of 74 = 37\nHalf of anything!\nEasiest one." },
          { icon: "1%", title: "Divide by 100", body: "1% of 250 = 2.5\nThen multiply for any %!\n7% = 7 × 1%" },
        ],
      },
      {
        heading: "FDP — Know These Off By Heart",
        type: "table",
        headers: ["Fraction", "Decimal", "Percentage"],
        rows: [
          ["1/2", "0.5", "50%"],
          ["1/4", "0.25", "25%"],
          ["3/4", "0.75", "75%"],
          ["1/5", "0.2", "20%"],
          ["1/10", "0.1", "10%"],
          ["1/8", "0.125", "12.5%"],
          ["1/3", "0.333...", "33.3%"],
          ["2/3", "0.666...", "66.7%"],
        ],
      },
      {
        heading: "Worked Examples",
        type: "worked",
        examples: [
          { q: "A jacket costs £80. It's reduced by 35%. What's the sale price?", steps: ["Find 35% of £80", "10% = £8, so 30% = £24, 5% = £4", "35% = £24 + £4 = £28", "Sale price = £80 − £28 = £52"], answer: "£52", note: "Always subtract the discount from the original price!" },
          { q: "A price goes from £40 to £50. What is the % increase?", steps: ["Increase = £50 − £40 = £10", "% increase = (10 ÷ 40) × 100", "= 0.25 × 100 = 25%"], answer: "25%", note: "% change = (change ÷ original) × 100" },
        ],
      },
    ],
  },
  {
    id: "ratio", icon: "⚖️", title: "Ratio & Proportion", subject: "maths", colour: "#DC2626", bg: "#FEF2F2",
    intro: "Ratio questions test your logic — they come up in every GL and CEM paper. Once you know the method, they're actually quite quick!",
    sections: [
      {
        heading: "The 3-Step Method",
        type: "cards",
        cards: [
          { icon: "1️⃣", title: "Add the parts", body: "Ratio 2:3 → 2+3 = 5 parts total\nRatio 1:3:2 → 1+3+2 = 6 parts\nAlways add all parts!" },
          { icon: "2️⃣", title: "Find 1 part", body: "Total ÷ number of parts\n£30 ÷ 5 = £6 per part\nThis is your unit amount" },
          { icon: "3️⃣", title: "Multiply each share", body: "2:3 with £6 per part:\n2 × £6 = £12\n3 × £6 = £18 ✓" },
          { icon: "🔁", title: "Simplifying ratios", body: "Divide BOTH sides by HCF\n15:25 → HCF=5 → 3:5\n12:18 → HCF=6 → 2:3" },
        ],
      },
      {
        heading: "Quick Fire Practice",
        type: "flashcards",
        cards: [
          { q: "Share £40 in ratio 3:5. Larger share?", a: "£25", tip: "8 parts, £5 each. 5×5=£25" },
          { q: "Simplify 20:35", a: "4:7", tip: "HCF=5: 20÷5=4, 35÷5=7" },
          { q: "If 4 pens cost £2, how much do 7 cost?", a: "£3.50", tip: "1 pen=50p. 7×50p=£3.50" },
          { q: "Ratio of boys:girls is 3:4. 28 pupils total. How many girls?", a: "16", tip: "7 parts, 4 each. Girls=4×4=16" },
        ],
      },
      {
        heading: "Worked Examples",
        type: "worked",
        examples: [
          { q: "Orange juice and lemonade are mixed in ratio 2:5. There's 350ml total. How much lemonade?", steps: ["Total parts = 2+5 = 7", "1 part = 350 ÷ 7 = 50ml", "Lemonade = 5 × 50 = 250ml"], answer: "250ml", note: "Always find 1 part first!" },
        ],
      },
    ],
  },
  {
    id: "algebra", icon: "📐", title: "Algebra", subject: "maths", colour: "#059669", bg: "#ECFDF5",
    intro: "Algebra uses letters instead of unknown numbers. The 11+ tests simple equations, sequences and function machines. Don't be scared — it's just maths with letters!",
    sections: [
      {
        heading: "Solving Equations — The Balancing Act",
        type: "cards",
        cards: [
          { icon: "⚖️", title: "Keep it balanced!", body: "Whatever you do to one side, do to the other.\nx + 5 = 12\n−5 both sides: x = 7 ✓" },
          { icon: "➕", title: "Addition → Subtract", body: "x + 8 = 20\nSubtract 8: x = 12 ✓" },
          { icon: "✖️", title: "Multiply → Divide", body: "3x = 21\nDivide by 3: x = 7 ✓" },
          { icon: "🔀", title: "Two steps", body: "2x + 3 = 11\nFirst: −3 → 2x = 8\nThen: ÷2 → x = 4 ✓" },
        ],
      },
      {
        heading: "Sequences — Find the Pattern",
        type: "flashcards",
        cards: [
          { q: "3, 7, 11, 15, ___ ?", a: "19", tip: "+4 each time. 15+4=19" },
          { q: "2, 4, 8, 16, ___ ?", a: "32", tip: "×2 each time. 16×2=32" },
          { q: "nth term of 5, 8, 11, 14...?", a: "3n + 2", tip: "+3 each time, starts at 5. n=1: 3+2=5 ✓" },
          { q: "Input→×4→−3=13. Input?", a: "4", tip: "Reverse: 13+3=16, 16÷4=4" },
        ],
      },
      {
        heading: "Worked Examples",
        type: "worked",
        examples: [
          { q: "The sum of 3 consecutive numbers is 63. What are they?", steps: ["Let the numbers be n, n+1, n+2", "n + (n+1) + (n+2) = 63", "3n + 3 = 63 → 3n = 60 → n = 20", "Numbers: 20, 21, 22"], answer: "20, 21, 22", note: "Consecutive means one after another in order!" },
        ],
      },
    ],
  },
  {
    id: "synonyms", icon: "📚", title: "Synonyms & Antonyms", subject: "verbal", colour: "#059669", bg: "#ECFDF5",
    intro: "These come up constantly in verbal reasoning. Synonyms = SAME meaning. Antonyms = OPPOSITE meaning. Build your vocabulary and you'll fly through these!",
    sections: [
      {
        heading: "Key Vocabulary to Know",
        type: "cards",
        cards: [
          { icon: "😊", title: "Happy words", body: "Joyful, Elated, Content, Gleeful, Cheerful, Ecstatic\n\nOpposites: Miserable, Gloomy, Dejected, Sorrowful" },
          { icon: "💪", title: "Brave words", body: "Courageous, Valiant, Bold, Fearless, Intrepid, Gallant\n\nOpposites: Cowardly, Timid, Fearful, Meek" },
          { icon: "🌊", title: "Big words", body: "Enormous, Vast, Colossal, Immense, Gigantic, Mammoth\n\nOpposites: Tiny, Minute, Minuscule, Petite" },
          { icon: "⚡", title: "Fast words", body: "Swift, Rapid, Hasty, Brisk, Nimble, Fleet\n\nOpposites: Sluggish, Lethargic, Slow, Gradual" },
          { icon: "🎯", title: "Careful words", body: "Meticulous, Precise, Diligent, Thorough, Scrupulous\n\nOpposites: Careless, Negligent, Sloppy, Hasty" },
          { icon: "💝", title: "Kind words", body: "Benevolent, Generous, Charitable, Compassionate\n\nOpposites: Malevolent, Selfish, Cruel, Callous" },
        ],
      },
      {
        heading: "Flashcard Practice",
        type: "flashcards",
        cards: [
          { q: "Synonym of METICULOUS?", a: "Careful / Precise", tip: "Meticulous = paying great attention to detail" },
          { q: "Antonym of BENEVOLENT?", a: "Malevolent", tip: "Bene = good, Male = bad. Like benefit vs malicious!" },
          { q: "Synonym of ENORMOUS?", a: "Colossal / Vast", tip: "Think of the Colosseum — colossal means massive!" },
          { q: "Antonym of TRANSPARENT?", a: "Opaque", tip: "Transparent = see-through. Opaque = cannot see through." },
          { q: "Synonym of SWIFT?", a: "Rapid / Fleet", tip: "Swift as an arrow — fast and direct!" },
          { q: "Antonym of ANCIENT?", a: "Modern", tip: "Ancient = very old. Modern = new and current." },
        ],
      },
      {
        heading: "How 11+ Tests This",
        type: "worked",
        examples: [
          { q: "Which word is most similar to BRAVE? Cowardly / Courageous / Reckless / Timid", steps: ["Cowardly = opposite of brave ✗", "Courageous = having courage = brave ✓", "Reckless = careless, not the same ✗", "Timid = shy and fearful ✗"], answer: "Courageous", note: "Think: could both words replace each other in a sentence?" },
          { q: "Odd one out: Happy, Joyful, Cheerful, Miserable", steps: ["Happy = positive feeling", "Joyful = positive feeling", "Cheerful = positive feeling", "Miserable = negative feeling — odd one out!"], answer: "Miserable", note: "In odd one out, find the one that doesn't belong to the same group." },
        ],
      },
    ],
  },
  {
    id: "codes", icon: "🔐", title: "Letter Codes & Sequences", subject: "verbal", colour: "#D97706", bg: "#FFFBEB",
    intro: "Code questions are in every 11+ verbal reasoning paper. Once you spot the pattern, they're actually fun — like cracking a secret message!",
    sections: [
      {
        heading: "How Codes Work",
        type: "cards",
        cards: [
          { icon: "A=1", title: "Letters have numbers", body: "A=1, B=2, C=3... Z=26\nLearn this — it unlocks almost every code!\nWrite it out until you know it cold." },
          { icon: "+1", title: "Forward shift", body: "CAT → DBU (each letter +1)\nC→D, A→B, T→U\nTest: what is DOG?\nD→E, O→P, G→H = EPH" },
          { icon: "−2", title: "Backward shift", body: "FISH → DIQF (each letter −2)\nF→D, I→G, S→Q, H→F\nWatch out for A→Y (wraps around!)" },
          { icon: "🔄", title: "Reverse alphabet", body: "A↔Z, B↔Y, C↔X...\nSo CAT → ZZG\nC=3 → 26-3+1=24=X? No:\nA→Z, B→Y: CAT→XZG" },
        ],
      },
      {
        heading: "Letter Sequences",
        type: "flashcards",
        cards: [
          { q: "A, C, E, G, ___?", a: "I", tip: "Skip one letter each time: A(B)C(D)E(F)G(H)I" },
          { q: "Z, X, V, T, ___?", a: "R", tip: "Backwards, skip one: Z(Y)X(W)V(U)T(S)R" },
          { q: "A, D, G, J, ___?", a: "M", tip: "Skip 2 letters each time: +3 positions" },
          { q: "CAT in +1 code?", a: "DBU", tip: "C+1=D, A+1=B, T+1=U" },
          { q: "2-5-4 in A=1,B=2 code?", a: "BED", tip: "B=2, E=5, D=4 → BED" },
        ],
      },
      {
        heading: "Worked Examples",
        type: "worked",
        examples: [
          { q: "In a code, JUMP = KTNS. What is DIVE?", steps: ["J→K (+1), U→T (−1)... wait, check each letter", "J+1=K ✓, U+... U=21, T=20 → that's −1?", "Actually: J(10)→K(11) +1, U(21)→T(20) −1? No...", "JUMP=J(10)K(11), U(21)T(20)? Hmm try: J→K+1, U→T it's not consistent. Try +1 each: J→K,U→V,M→N,P→Q = KVNQ ≠ KTNS", "Try: J+1=K, U−1=T, M+1=N, P−1=O... nope. Pattern: +1,−1,+1,−1!", "D+1=E, I−1=H, V+1=W, E−1=D = EHWD"], answer: "EHWD", note: "Always check the pattern carefully — it might alternate!" },
        ],
      },
    ],
  },
  {
    id: "analogies", icon: "🔗", title: "Analogies & Odd One Out", subject: "verbal", colour: "#BE185D", bg: "#FDF2F8",
    intro: "Analogy questions test if you can spot relationships between words. Odd-one-out tests if you can find the word that doesn't belong. Both come up constantly!",
    sections: [
      {
        heading: "Types of Relationships",
        type: "cards",
        cards: [
          { icon: "👶", title: "Adult → Young", body: "Dog → Puppy\nCat → Kitten\nCow → Calf\nHorse → Foal\nSheep → Lamb\nFox → Cub" },
          { icon: "🏠", title: "Animal → Home", body: "Dog → Kennel\nBird → Nest\nBee → Hive\nFish → Tank/Pond\nRabbit → Warren\nHorse → Stable" },
          { icon: "🔨", title: "Tool → User", body: "Scalpel → Surgeon\nGavel → Judge\nBaton → Conductor\nTrowel → Builder\nPalette → Artist" },
          { icon: "📍", title: "Part → Whole", body: "Page → Book\nStep → Staircase\nPetal → Flower\nNote → Symphony\nWord → Sentence" },
        ],
      },
      {
        heading: "Odd One Out Practice",
        type: "flashcards",
        cards: [
          { q: "Robin, Sparrow, Penguin, Eagle — odd one out?", a: "Penguin", tip: "All the others can fly. Penguins can't!" },
          { q: "Triangle, Circle, Square, Pyramid — odd one out?", a: "Pyramid", tip: "Triangle, Circle, Square = 2D. Pyramid = 3D shape!" },
          { q: "Happy, Joyful, Cheerful, Miserable — odd one out?", a: "Miserable", tip: "All others are positive feelings. Miserable is negative." },
          { q: "Author, Scalpel, Painter, Sculptor — odd one out?", a: "Scalpel", tip: "Author, Painter, Sculptor are all people (creators). Scalpel is a tool." },
          { q: "Dog→Puppy, Cat→Kitten, Cow→___?", a: "Calf", tip: "Baby cow = calf. Learn all baby animal names!" },
        ],
      },
      {
        heading: "Worked Examples",
        type: "worked",
        examples: [
          { q: "Book is to Library as Painting is to ___?\nA) School  B) Gallery  C) Museum  D) Theatre", steps: ["What is the relationship? Books are KEPT/DISPLAYED in a library", "Where are paintings kept/displayed?", "Museum = objects from history", "Gallery = specifically for paintings and art ✓"], answer: "Gallery", note: "Ask: what is the relationship? Then apply the SAME relationship to the new word." },
        ],
      },
    ],
  },
  {
    id: "shapes", icon: "🔷", title: "Shapes & Symmetry", subject: "nvr", colour: "#7C3AED", bg: "#F5F3FF",
    intro: "Non-verbal reasoning is all about visual thinking. You need to know shapes inside out — their properties, symmetry and how they transform!",
    sections: [
      {
        heading: "2D & 3D Shapes — Must Know!",
        type: "table",
        headers: ["Shape", "Sides/Faces", "Lines of Symmetry"],
        rows: [
          ["Equilateral Triangle", "3", "3"],
          ["Square", "4", "4"],
          ["Rectangle", "4", "2"],
          ["Regular Pentagon", "5", "5"],
          ["Regular Hexagon", "6", "6"],
          ["Circle", "0 (curved)", "∞ Infinite"],
          ["Cube", "6 faces, 12 edges, 8 vertices", "—"],
          ["Cylinder", "3 faces (2 circles + 1 curved)", "—"],
          ["Cone", "2 faces, 1 edge, 1 vertex", "—"],
          ["Square Pyramid", "5 faces, 8 edges, 5 vertices", "—"],
        ],
      },
      {
        heading: "Rotations & Reflections",
        type: "cards",
        cards: [
          { icon: "↻", title: "90° clockwise = ¼ turn right", body: "An arrow pointing UP → becomes pointing RIGHT\nA square stays looking the same!" },
          { icon: "↙", title: "180° = ½ turn = upside down", body: "An arrow pointing UP → points DOWN\nA rectangle looks the same after 180°" },
          { icon: "↺", title: "270° clockwise = 90° anticlockwise", body: "270° clockwise and 90° anticlockwise give the SAME result.\n360°−270°=90° — remember this!" },
          { icon: "🪞", title: "Reflection", body: "Vertical mirror → LEFT/RIGHT flips\nHorizontal mirror → UP/DOWN flips\nThe shape stays the SAME size — just flipped!" },
        ],
      },
      {
        heading: "Counting Shapes — A Classic Trap!",
        type: "worked",
        examples: [
          { q: "How many squares are in a 2×2 grid?", steps: ["Count 1×1 squares: 4 (one in each cell)", "Count 2×2 squares: 1 (the whole grid)", "Total = 4 + 1 = 5"], answer: "5", note: "ALWAYS count shapes of every size — don't just count the small ones!" },
          { q: "How many squares in a 3×3 grid?", steps: ["1×1 squares: 9", "2×2 squares: 4 (top-left, top-right, bottom-left, bottom-right positions)", "3×3 squares: 1 (the whole grid)", "Total = 9 + 4 + 1 = 14"], answer: "14", note: "This comes up in almost every 11+ NVR paper — memorise the answers: 2×2=5, 3×3=14!" },
        ],
      },
    ],
  },
  {
    id: "patterns", icon: "🔁", title: "Patterns & Matrices", subject: "nvr", colour: "#BE185D", bg: "#FDF2F8",
    intro: "Pattern and matrix questions are a huge part of NVR. You'll see shapes that change across a sequence and need to find the missing piece. Here's how to crack them every time!",
    sections: [
      {
        heading: "What to Look For — In Order!",
        type: "cards",
        cards: [
          { icon: "📐", title: "1. Shape/Type", body: "Is the shape changing? Triangle → Square → Pentagon (gaining sides each time)?" },
          { icon: "📏", title: "2. Size", body: "Getting bigger? Smaller? Alternating? Look for a clear pattern across the row." },
          { icon: "🔄", title: "3. Rotation", body: "Is it turning? By 45°? 90°? 180°? Check consistently across rows AND columns." },
          { icon: "🎨", title: "4. Shading/Fill", body: "Black→Grey→White? Moving from left to right? This is a very common NVR pattern!" },
          { icon: "🔢", title: "5. Number", body: "How many shapes? Going 1, 2, 3... or 3, 2, 1? Or alternating?" },
          { icon: "📍", title: "6. Position", body: "A dot or small shape moving across the grid? Track exactly where it moves each step." },
        ],
      },
      {
        heading: "Matrix Strategy",
        type: "flashcards",
        cards: [
          { q: "In a 3×3 grid, ● moves diagonally. Where is it in row 3, col 3?", a: "Bottom-right corner", tip: "● goes (1,1)→(2,2)→(3,3) — the main diagonal!" },
          { q: "Each row has shapes: ■▲●. Row 3 starts with ●▲. What's last?", a: "■", tip: "Each row uses all 3 shapes exactly once!" },
          { q: "270° clockwise = same as ___ anticlockwise?", a: "90°", tip: "360−270=90. Always works!" },
          { q: "Sequence: 1 dot, 3 dots, 6 dots... next?", a: "10 dots", tip: "Triangular numbers: +2, +3, +4... so +4 = 10" },
        ],
      },
      {
        heading: "Worked Strategy",
        type: "worked",
        examples: [
          { q: "How do you approach a matrix question in the exam?", steps: ["Step 1: Look at Row 1 — what rule connects the 3 shapes?", "Step 2: Check if the SAME rule applies to Row 2", "Step 3: Use the rule to work out what goes in Row 3", "Step 4: Also check the COLUMNS to confirm your answer", "Step 5: If two answers look possible — eliminate by checking columns!"], answer: "Use rows AND columns to confirm", note: "Always double-check using both rows and columns — this saves you from tricky distractors!" },
        ],
      },
    ],
  },
];

// ─── QUESTION BANK ────────────────────────────────────────────────────────────
const QUESTIONS = {
  maths: [
    { q: "What is 7 × 8?", options: ["54", "56", "63", "48"], answer: "56", topic: "Times Tables", explanation: "5, 6, 7, 8 → 56 = 7 × 8! One of the trickiest to remember." },
    { q: "What is ¾ of 40?", options: ["20", "25", "30", "35"], answer: "30", topic: "Fractions", explanation: "Divide by 4 = 10, then multiply by 3 = 30." },
    { q: "What is 25% of 80?", options: ["16", "20", "25", "40"], answer: "20", topic: "Percentages", explanation: "25% = ¼. So 80 ÷ 4 = 20." },
    { q: "Share £30 in ratio 2:3. How much is the larger share?", options: ["£10", "£12", "£15", "£18"], answer: "£18", topic: "Ratio", explanation: "5 parts total. £30 ÷ 5 = £6 per part. Larger share = 3 × £6 = £18." },
    { q: "If x + 5 = 12, what is x?", options: ["5", "6", "7", "8"], answer: "7", topic: "Algebra", explanation: "Subtract 5 from both sides: x = 12 − 5 = 7." },
    { q: "What is the area of a rectangle 8 cm × 5 cm?", options: ["13 cm²", "26 cm²", "40 cm²", "80 cm²"], answer: "40 cm²", topic: "Geometry", explanation: "Area = length × width = 8 × 5 = 40 cm²." },
    { q: "A train leaves at 09:15 and arrives at 11:45. How long is the journey?", options: ["1h 30m", "2h", "2h 30m", "3h"], answer: "2h 30m", topic: "Word Problem", explanation: "09:15 → 11:15 = 2 hours, then +30 min to 11:45 = 2h 30m." },
    { q: "Simplify 8/12.", options: ["4/8", "2/3", "3/4", "1/2"], answer: "2/3", topic: "Fractions", explanation: "HCF of 8 and 12 is 4. 8÷4=2, 12÷4=3 → 2/3." },
    { q: "What is 10% of 350?", options: ["3.5", "25", "35", "50"], answer: "35", topic: "Percentages", explanation: "10% = divide by 10. 350 ÷ 10 = 35." },
    { q: "What is the next number? 4, 8, 12, 16, ___", options: ["18", "20", "22", "24"], answer: "20", topic: "Algebra", explanation: "Add 4 each time. 16 + 4 = 20." },
    { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: "6", topic: "Geometry", explanation: "Hex = 6. Hexagon = 6 sides. Like a honeycomb!" },
    { q: "½ ÷ ¼ = ?", options: ["⅛", "¼", "2", "4"], answer: "2", topic: "Fractions", explanation: "KCF: Keep ½, Change to ×, Flip ¼ to 4. ½ × 4 = 2." },
    { q: "A book costs £12, reduced by 50%. New price?", options: ["£4", "£6", "£8", "£10"], answer: "£6", topic: "Percentages", explanation: "50% = half. £12 ÷ 2 = £6." },
    { q: "Input → ×3 → +5 = 20. What was the input?", options: ["4", "5", "6", "7"], answer: "5", topic: "Algebra", explanation: "Reverse: 20−5=15, then 15÷3=5." },
    { q: "What is 9 × 12?", options: ["99", "108", "116", "98"], answer: "108", topic: "Times Tables", explanation: "10×12=120, subtract 12 → 108. Or 9×12: 9×10=90, 9×2=18, 90+18=108." },
    { q: "Sara has 3× as many stickers as Tom. Tom has 12. How many does Sara have?", options: ["4", "15", "36", "48"], answer: "36", topic: "Word Problem", explanation: "3 × 12 = 36. Simple multiplication!" },
    { q: "Simplify ratio 15:25.", options: ["3:4", "3:5", "5:3", "5:8"], answer: "3:5", topic: "Ratio", explanation: "HCF = 5. 15÷5=3, 25÷5=5. Answer: 3:5." },
    { q: "What is the perimeter of a square with side 7 cm?", options: ["14 cm", "21 cm", "28 cm", "49 cm"], answer: "28 cm", topic: "Geometry", explanation: "Perimeter = 4 × side = 4 × 7 = 28 cm." },
    { q: "5 oranges cost £1.50. How much do 8 cost?", options: ["£2.10", "£2.40", "£3.00", "£3.60"], answer: "£2.40", topic: "Word Problem", explanation: "1 orange = £1.50÷5 = 30p. 8 × 30p = £2.40." },
    { q: "What is the value of the digit 6 in 3,641?", options: ["6", "60", "600", "6,000"], answer: "600", topic: "Place Value", explanation: "Thousands, Hundreds, Tens, Units → the 6 is in the hundreds column = 600." },
  ],
  verbal: [
    { q: "Which word means the same as HAPPY?", options: ["Sad", "Joyful", "Angry", "Tired"], answer: "Joyful", topic: "Synonyms", explanation: "Joyful means very happy. Synonyms are words with the same meaning." },
    { q: "Which word means the OPPOSITE of ANCIENT?", options: ["Old", "Historic", "Modern", "Aged"], answer: "Modern", topic: "Antonyms", explanation: "Ancient = very old. Its opposite is modern = new and current." },
    { q: "Dog is to Puppy as Cat is to ___", options: ["Kitten", "Cub", "Foal", "Lamb"], answer: "Kitten", topic: "Analogies", explanation: "A puppy is a baby dog. A kitten is a baby cat — same relationship!" },
    { q: "Odd one out: Robin, Sparrow, Penguin, Eagle", options: ["Robin", "Sparrow", "Penguin", "Eagle"], answer: "Penguin", topic: "Odd One Out", explanation: "Robin, Sparrow and Eagle can all fly. Penguins cannot!" },
    { q: "If CAT = DBU in a code, what is DOG?", options: ["CPH", "EPH", "ENH", "EPI"], answer: "EPH", topic: "Letter Codes", explanation: "Each letter moves forward +1: D→E, O→P, G→H = EPH." },
    { q: "What comes next? A, C, E, G, ___", options: ["H", "I", "J", "K"], answer: "I", topic: "Letter Sequences", explanation: "Skip one letter each time: A(B)C(D)E(F)G(H)I ✓" },
    { q: "Which word means the same as ENORMOUS?", options: ["Tiny", "Average", "Huge", "Narrow"], answer: "Huge", topic: "Synonyms", explanation: "Enormous = very large. Huge is its synonym." },
    { q: "Which word means the OPPOSITE of GENEROUS?", options: ["Kind", "Selfish", "Brave", "Clever"], answer: "Selfish", topic: "Antonyms", explanation: "Generous = giving to others. Its opposite is selfish." },
    { q: "Book is to Library as Painting is to ___", options: ["School", "Gallery", "Museum", "Theatre"], answer: "Gallery", topic: "Analogies", explanation: "Books are in a library. Paintings are displayed in a gallery." },
    { q: "If A=1, B=2, C=3... what does code 2-5-4 spell?", options: ["BED", "CAT", "ACE", "BAD"], answer: "BED", topic: "Letter Codes", explanation: "B=2, E=5, D=4 → BED." },
    { q: "Which word is spelled CORRECTLY?", options: ["Recieve", "Achieve", "Beleive", "Freind"], answer: "Achieve", topic: "Spelling", explanation: "i before e except after c. Achieve ✓. The others all have this rule wrong." },
    { q: "Choose the best word: 'She spoke in a ___ voice so as not to wake the baby.'", options: ["loud", "harsh", "whispered", "proud"], answer: "whispered", topic: "Cloze", explanation: "To avoid waking a baby, you'd speak very quietly — in a whispered voice." },
    { q: "Odd one out: Triangle, Circle, Square, Pyramid", options: ["Triangle", "Circle", "Square", "Pyramid"], answer: "Pyramid", topic: "Odd One Out", explanation: "Triangle, Circle, Square = 2D shapes. Pyramid is 3D!" },
    { q: "What comes next? Z, X, V, T, ___", options: ["P", "Q", "R", "S"], answer: "R", topic: "Letter Sequences", explanation: "Going backwards, skip one: Z(Y)X(W)V(U)T(S)R ✓" },
    { q: "Hot is to Cold as Day is to ___", options: ["Sun", "Bright", "Night", "Time"], answer: "Night", topic: "Analogies", explanation: "Hot and Cold are opposites. Day and Night are opposites." },
  ],
  nvr: [
    { q: "A square is rotated 90° clockwise. What shape do you see?", options: ["Rectangle", "Diamond", "Square", "Trapezoid"], answer: "Square", topic: "Rotation", explanation: "A square looks exactly the same after any 90° rotation — it has 4-fold symmetry!" },
    { q: "How many lines of symmetry does an equilateral triangle have?", options: ["1", "2", "3", "6"], answer: "3", topic: "Symmetry", explanation: "An equilateral triangle has 3 equal sides and 3 lines of symmetry." },
    { q: "What comes next? ▲ ■ ▲ ■ ▲ ___", options: ["▲", "■", "●", "▲▲"], answer: "■", topic: "Patterns", explanation: "The pattern alternates triangle, square — so next is ■." },
    { q: "How many faces does a cube have?", options: ["4", "5", "6", "8"], answer: "6", topic: "3D Shapes", explanation: "A cube has 6 faces: top, bottom, front, back, left, right. Like a dice!" },
    { q: "How many lines of symmetry does a circle have?", options: ["1", "4", "8", "Infinite"], answer: "Infinite", topic: "Symmetry", explanation: "Any line through the centre of a circle is a line of symmetry — infinitely many!" },
    { q: "An arrow pointing RIGHT is reflected in a vertical mirror. What direction?", options: ["Right", "Left", "Up", "Down"], answer: "Left", topic: "Reflection", explanation: "A vertical mirror flips left and right — right becomes left." },
    { q: "How many squares are in a 2×2 grid (all sizes)?", options: ["4", "5", "6", "8"], answer: "5", topic: "Counting Shapes", explanation: "Four 1×1 squares + one big 2×2 square = 5 total!" },
    { q: "What 3D shape has 1 curved face and 2 flat circular faces?", options: ["Cone", "Sphere", "Cylinder", "Prism"], answer: "Cylinder", topic: "3D Shapes", explanation: "A cylinder (like a tin can) has 1 curved surface and 2 flat circular ends." },
    { q: "A shape is rotated 180°. This is the same as a ___", options: ["¼ turn", "½ turn", "¾ turn", "Full turn"], answer: "½ turn", topic: "Rotation", explanation: "180° = half of 360° = a ½ turn (upside down)." },
    { q: "What comes next? 2, 4, 8, 16, ___", options: ["24", "28", "32", "18"], answer: "32", topic: "Number Sequences", explanation: "Each number doubles: 16 × 2 = 32." },
    { q: "How many edges does a cube have?", options: ["6", "8", "10", "12"], answer: "12", topic: "3D Shapes", explanation: "4 on top + 4 on bottom + 4 vertical edges = 12 total." },
    { q: "A square piece of paper is folded diagonally. What shape?", options: ["Rectangle", "Square", "Triangle", "Pentagon"], answer: "Triangle", topic: "Folding", explanation: "Folding a square diagonally creates a right-angled triangle." },
    { q: "Which shape has 5 sides?", options: ["Hexagon", "Pentagon", "Octagon", "Quadrilateral"], answer: "Pentagon", topic: "2D Shapes", explanation: "Penta = 5. Pentagon = 5 sides. Think of the Pentagon building!" },
    { q: "270° clockwise = how many degrees ANTICLOCKWISE?", options: ["270°", "180°", "90°", "45°"], answer: "90°", topic: "Rotation", explanation: "360° − 270° = 90°. So 270° clockwise = 90° anticlockwise." },
    { q: "How many squares (all sizes) in a 3×3 grid?", options: ["9", "12", "14", "16"], answer: "14", topic: "Counting Shapes", explanation: "Nine 1×1 + four 2×2 + one 3×3 = 14 total. Classic 11+ question!" },
  ],
};

const SCHOOLS = [
  { name: "Queen Elizabeth's School (Boys)", borough: "Barnet", exam: "GL Assessment", subjects: "Maths & English", places: 180, tip: "Very competitive — 2,000+ apply for 180 places. Strong maths focus." },
  { name: "The Henrietta Barnett School (Girls)", borough: "Barnet", exam: "GL + School-Set", subjects: "English, VR, NVR, Maths", places: null, tip: "Two-stage exam. Stage 2 includes written English and Maths problem-solving." },
  { name: "St Michael's Catholic Grammar (Girls)", borough: "Barnet", exam: "GL Assessment", subjects: "VR, NVR, Maths", places: 96, tip: "Faith school — requires a Catholic priest's reference." },
  { name: "Beths Grammar School (Boys)", borough: "Bexley", exam: "Bexley Selection Test", subjects: "English, Maths, VR, NVR", places: 192, tip: "Register by 31 March each year. Two 50-minute papers." },
  { name: "Bexley Grammar School (Mixed)", borough: "Bexley", exam: "Bexley Selection Test", subjects: "English, Maths, VR, NVR", places: null, tip: "Two 50-minute multiple choice papers on the same day." },
  { name: "Townley Grammar School (Girls)", borough: "Bexley", exam: "Bexley Selection Test", subjects: "English, Maths, VR, NVR", places: null, tip: "No formal catchment — distance used as a tiebreaker." },
  { name: "St Olave's & St Saviour's (Boys)", borough: "Bromley", exam: "School-Specific (2-stage)", subjects: "English, Logic, Maths", places: 124, tip: "One of the top state schools in England. Extremely competitive." },
  { name: "Newstead Wood School (Girls)", borough: "Bromley", exam: "GL Assessment", subjects: "VR & NVR", places: 150, tip: "Need qualifying score of 210+. 9-mile catchment area applies." },
  { name: "The Latymer School (Mixed)", borough: "Enfield", exam: "GL + School-Set", subjects: "Maths, VR, English", places: 192, tip: "Strict postcode catchment — N, E and EN postcodes only." },
  { name: "Tiffin School (Boys)", borough: "Kingston", exam: "School-Specific", subjects: "Maths & English", places: null, tip: "Two-stage. No fixed pass mark — entry is relative to cohort." },
  { name: "The Tiffin Girls' School", borough: "Kingston", exam: "School-Specific", subjects: "English (60%) & Maths (40%)", places: null, tip: "44 designated postcode districts: KT, TW, SW, SM, CR areas." },
  { name: "Ilford County High School (Boys)", borough: "Redbridge", exam: "GL Assessment", subjects: "English, VR, NVR", places: 180, tip: "Register May–June. Exam in September each year." },
  { name: "Woodford County High School (Girls)", borough: "Redbridge", exam: "GL Assessment", subjects: "English, VR, NVR", places: 180, tip: "25% of places reserved for Pupil Premium children. Pass mark: 104." },
  { name: "Wilson's School (Boys)", borough: "Sutton", exam: "Sutton SET + Stage 2", subjects: "English & Maths", places: 180, tip: "Register by 1 August. SET exam in September." },
  { name: "Sutton Grammar School (Boys)", borough: "Sutton", exam: "Sutton SET + Stage 2", subjects: "English & Maths", places: 120, tip: "One of five Sutton schools — all use the shared Sutton SET." },
  { name: "Nonsuch High School for Girls", borough: "Sutton", exam: "Sutton SET + Stage 2", subjects: "English & Maths", places: 180, tip: "Girls' schools share the NWSSEE second-stage exam." },
  { name: "Wallington High School for Girls", borough: "Sutton", exam: "Sutton SET + Stage 2", subjects: "English & Maths", places: 180, tip: "Apply by 1 August. Same SET process as all Sutton schools." },
];

const BOROUGHS = ["All", ...new Set(SCHOOLS.map(s => s.borough))];
const SUBJECT_COLOURS = { maths: "#4F46E5", verbal: "#059669", nvr: "#7C3AED" };
const SUBJECT_BG = { maths: "#EEF2FF", verbal: "#ECFDF5", nvr: "#F5F3FF" };
const SUBJECT_LABELS = { maths: "🔢 Maths", verbal: "📖 Verbal Reasoning", nvr: "🔷 Non-Verbal Reasoning" };
const PRAISE_CORRECT = ["🌟 Brilliant!", "✅ Spot on!", "🎉 Yes! Great job!", "💪 Nailed it!", "⭐ Perfect!", "👏 Excellent!", "🏆 Outstanding!"];
const PRAISE_WRONG = ["Keep going — you'll get it! 💪", "Not quite — check the explanation below!", "Every mistake is a step forward!", "Don't worry — now you know for next time!"];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function Bold({ children }) {
  if (typeof children !== "string") return children;
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p, i) => p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p)}</>;
}

function BodyText({ text }) {
  return <>{text.split("\n").map((line, i) => line.trim() === "" ? <br key={i} /> : <p key={i} style={{ margin: "3px 0", fontSize: 13.5, color: "#374151", lineHeight: 1.65 }}><Bold>{line}</Bold></p>)}</>;
}

// ── Flashcard component ──────────────────────────────────────────────────────
function Flashcards({ cards }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[idx];
  return (
    <div>
      <div onClick={() => setFlipped(f => !f)} style={{ cursor: "pointer", background: flipped ? "#F0FDF4" : "#f8fafc", border: `2px solid ${flipped ? "#059669" : "#e2e8f0"}`, borderRadius: 16, padding: "28px 20px", textAlign: "center", minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.3s", userSelect: "none" }}>
        {!flipped ? (
          <>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#1e1b4b", margin: "0 0 10px" }}>{card.q}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>👆 Tap to reveal answer</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#059669", margin: "0 0 8px" }}>{card.a}</p>
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0, fontStyle: "italic" }}>💡 {card.tip}</p>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <button onClick={() => { setIdx(i => Math.max(0, i - 1)); setFlipped(false); }} disabled={idx === 0} style={{ padding: "8px 16px", borderRadius: 10, border: "2px solid #e5e7eb", background: "white", color: idx === 0 ? "#d1d5db" : "#374151", fontWeight: 700, cursor: idx === 0 ? "default" : "pointer", fontSize: 13 }}>← Prev</button>
        <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>{idx + 1} / {cards.length}</span>
        <button onClick={() => { setIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); }} disabled={idx === cards.length - 1} style={{ padding: "8px 16px", borderRadius: 10, border: "2px solid #e5e7eb", background: "white", color: idx === cards.length - 1 ? "#d1d5db" : "#374151", fontWeight: 700, cursor: idx === cards.length - 1 ? "default" : "pointer", fontSize: 13 }}>Next →</button>
      </div>
    </div>
  );
}

// ── Table component ──────────────────────────────────────────────────────────
function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i} style={{ padding: "10px 12px", background: "#f1f5f9", fontWeight: 800, color: "#1e1b4b", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
              {row.map((cell, j) => <td key={j} style={{ padding: "9px 12px", color: "#374151", borderBottom: "1px solid #f1f5f9", fontWeight: j === 0 ? 700 : 400 }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Worked examples component ────────────────────────────────────────────────
function WorkedExamples({ examples }) {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {examples.map((ex, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div onClick={() => setOpen(open === i ? -1 : i)} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1e1b4b", flex: 1, paddingRight: 10 }}>🔍 {ex.q}</p>
            <span style={{ color: "#9ca3af", fontSize: 16 }}>{open === i ? "▲" : "▼"}</span>
          </div>
          {open === i && (
            <div style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "16px" }}>
              {ex.steps.map((step, j) => (
                <div key={j} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#059669", color: "white", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{j + 1}</div>
                  <p style={{ margin: 0, fontSize: 13.5, color: "#166534" }}>{step}</p>
                </div>
              ))}
              <div style={{ marginTop: 10, background: "#DCFCE7", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "#166534" }}>Answer: {ex.answer}</p>
              </div>
              {ex.note && <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "#4b5563", fontStyle: "italic" }}>💡 {ex.note}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Learn section renderer ───────────────────────────────────────────────────
function LearnSection({ section, colour }) {
  if (section.type === "cards") return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {section.cards.map((c, i) => (
        <div key={i} style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 12px", border: "1.5px solid #e2e8f0" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
          <p style={{ margin: "0 0 5px", fontWeight: 800, fontSize: 13, color: "#1e1b4b" }}>{c.title}</p>
          <BodyText text={c.body} />
        </div>
      ))}
    </div>
  );
  if (section.type === "flashcards") return <Flashcards cards={section.cards} />;
  if (section.type === "table") return <DataTable headers={section.headers} rows={section.rows} />;
  if (section.type === "worked") return <WorkedExamples examples={section.examples} />;
  return null;
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [learnTopic, setLearnTopic] = useState(null);
  const [learnSec, setLearnSec] = useState(0);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [timedMode, setTimedMode] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  const [quizDone, setQuizDone] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [expandedSchool, setExpandedSchool] = useState(null);

  const startQuiz = () => {
    const pool = selectedSubjects.flatMap(s => QUESTIONS[s].map(q => ({ ...q, subject: s })));
    const picked = shuffle(pool).slice(0, questionCount).map(q => ({ ...q, shuffledOptions: shuffle(q.options) }));
    setQuestions(picked); setCurrent(0); setAnswers([]); setSelected(null);
    setShowFeedback(false); setEncouragement(""); setQuizDone(false); setQuizActive(true);
  };

  const handleAnswer = (opt) => {
    if (showFeedback) return;
    setSelected(opt); setShowFeedback(true);
    const isCorrect = opt === questions[current].answer;
    setEncouragement(isCorrect ? getRandom(PRAISE_CORRECT) : getRandom(PRAISE_WRONG));
    const newAnswers = [...answers, { question: questions[current], chosen: opt, correct: isCorrect }];
    setAnswers(newAnswers);
    setTimeout(() => {
      if (current + 1 < questions.length) { setCurrent(c => c + 1); setSelected(null); setShowFeedback(false); setEncouragement(""); }
      else { setAnswers(newAnswers); setQuizDone(true); setQuizActive(false); }
    }, 2200);
  };

  const score = answers.filter(a => a.correct).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const grade = pct >= 90 ? "A*" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : "D";
  const gradeColour = pct >= 80 ? "#059669" : pct >= 60 ? "#D97706" : "#DC2626";

  const BG = "linear-gradient(160deg, #1e1b4b 0%, #3730a3 60%, #6d28d9 100%)";
  const PageWrap = ({ children, noNav }) => (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 40 }}>
      {!noNav && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "14px 12px 0", flexWrap: "wrap" }}>
          {[{ id: "home", label: "🏠" }, { id: "learn", label: "📚 Learn" }, { id: "quiz", label: "✏️ Quiz" }, { id: "schools", label: "🏫 Schools" }].map(n => (
            <button key={n.id} onClick={() => { setTab(n.id); setLearnTopic(null); setQuizActive(false); setQuizDone(false); }} style={{ padding: "8px 14px", borderRadius: 20, fontWeight: 700, fontSize: 12.5, cursor: "pointer", border: tab === n.id ? "none" : "2px solid rgba(255,255,255,0.3)", background: tab === n.id ? "white" : "transparent", color: tab === n.id ? "#3730a3" : "white" }}>{n.label}</button>
          ))}
        </div>
      )}
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "16px 14px 0" }}>{children}</div>
    </div>
  );

  // ── ACTIVE QUIZ ────────────────────────────────────────────────────────────
  if (quizActive && !quizDone && questions.length > 0) {
    const q = questions[current];
    const colour = SUBJECT_COLOURS[q.subject];
    const progress = (current / questions.length) * 100;
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <div style={{ background: "white", borderRadius: 24, padding: "24px 20px", maxWidth: 540, width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: colour, background: colour + "18", padding: "4px 11px", borderRadius: 20 }}>{SUBJECT_LABELS[q.subject]} · {q.topic}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", background: "#F3F4F6", padding: "4px 10px", borderRadius: 8 }}>{current + 1}/{questions.length}</span>
          </div>
          <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, marginBottom: 18, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${colour}, #7C3AED)`, borderRadius: 3, transition: "width 0.4s" }} />
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: "18px", marginBottom: 16, border: "1.5px solid #e2e8f0" }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", margin: 0, lineHeight: 1.5 }}>{q.q}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {q.shuffledOptions.map((opt, i) => {
              let bg = "white", border = "#e5e7eb", col = "#1e1b4b";
              if (showFeedback) { if (opt === q.answer) { bg = "#ECFDF5"; border = "#059669"; col = "#065F46"; } else if (opt === selected) { bg = "#FEF2F2"; border = "#DC2626"; col = "#991B1B"; } }
              else if (selected === opt) { bg = SUBJECT_BG[q.subject]; border = colour; col = colour; }
              return <button key={i} onClick={() => handleAnswer(opt)} style={{ padding: "13px 10px", borderRadius: 12, border: `2px solid ${border}`, background: bg, color: col, fontWeight: 700, fontSize: 14, cursor: showFeedback ? "default" : "pointer", lineHeight: 1.3 }}>{showFeedback && opt === q.answer && "✓ "}{showFeedback && opt === selected && opt !== q.answer && "✗ "}{opt}</button>;
            })}
          </div>
          {showFeedback && (
            <div style={{ borderRadius: 12, padding: "12px 14px", background: selected === q.answer ? "#F0FDF4" : "#FEF2F2", border: `1.5px solid ${selected === q.answer ? "#86EFAC" : "#FECACA"}` }}>
              <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14, color: selected === q.answer ? "#166534" : "#991B1B" }}>{encouragement}</p>
              {selected !== q.answer && <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}><strong>✓ Correct answer:</strong> {q.answer}</p>}
              <p style={{ margin: 0, fontSize: 12.5, color: "#4b5563" }}>💡 {q.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (quizDone) {
    const msg = pct >= 90 ? { emoji: "🏆", text: "Outstanding! Grammar school ready!", col: "#059669" }
      : pct >= 80 ? { emoji: "🌟", text: "Excellent work! Really strong!", col: "#059669" }
      : pct >= 70 ? { emoji: "⭐", text: "Great effort — keep pushing!", col: "#D97706" }
      : pct >= 50 ? { emoji: "💪", text: "Good try — review and retry!", col: "#D97706" }
      : { emoji: "📚", text: "Keep practising — you've got this!", col: "#DC2626" };
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "20px 14px 40px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ background: "white", borderRadius: 24, padding: "28px 22px", marginBottom: 14, textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 56 }}>{msg.emoji}</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b", margin: "8px 0 4px" }}>{msg.text}</h2>
            <div style={{ display: "inline-flex", gap: 20, background: "#f8fafc", borderRadius: 16, padding: "14px 24px", margin: "12px 0 16px" }}>
              <div><div style={{ fontSize: 44, fontWeight: 900, color: gradeColour }}>{grade}</div><div style={{ fontSize: 12, color: "#9ca3af" }}>Grade</div></div>
              <div style={{ width: 1, background: "#e5e7eb" }} />
              <div><div style={{ fontSize: 44, fontWeight: 900, color: "#1e1b4b" }}>{pct}%</div><div style={{ fontSize: 12, color: "#9ca3af" }}>{score}/{questions.length} correct</div></div>
            </div>
            {selectedSubjects.map(s => {
              const ta = answers.filter(a => a.question.subject === s);
              if (!ta.length) return null;
              const tc = ta.filter(a => a.correct).length;
              const tp = Math.round((tc / ta.length) * 100);
              return (
                <div key={s} style={{ marginBottom: 10, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{SUBJECT_LABELS[s]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: SUBJECT_COLOURS[s] }}>{tc}/{ta.length} ({tp}%)</span>
                  </div>
                  <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${tp}%`, background: SUBJECT_COLOURS[s], borderRadius: 4, transition: "width 1s" }} />
                  </div>
                </div>
              );
            })}
          </div>
          {answers.filter(a => !a.correct).length > 0 && (
            <div style={{ background: "white", borderRadius: 20, padding: "20px", marginBottom: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
              <p style={{ fontWeight: 800, fontSize: 15, color: "#1e1b4b", margin: "0 0 12px" }}>📖 Review Your Mistakes</p>
              {answers.filter(a => !a.correct).map((a, i) => (
                <div key={i} style={{ marginBottom: 10, padding: "12px", background: "#FEF2F2", borderRadius: 12, border: "1px solid #FECACA" }}>
                  <p style={{ fontWeight: 700, color: "#1e1b4b", margin: "0 0 4px", fontSize: 13 }}>{a.question.q}</p>
                  <p style={{ margin: "0 0 2px", fontSize: 13, color: "#DC2626" }}>✗ You said: {a.chosen}</p>
                  <p style={{ margin: "0 0 5px", fontSize: 13, color: "#059669", fontWeight: 700 }}>✓ Correct: {a.question.answer}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>💡 {a.question.explanation}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button onClick={() => { setTab("learn"); setLearnTopic(null); setQuizDone(false); }} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.4)", background: "transparent", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>📚 Go Learn</button>
            <button onClick={startQuiz} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🔄 Try Again</button>
          </div>
          <button onClick={() => { setQuizDone(false); setTab("quiz"); }} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.3)", background: "transparent", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Change Topics</button>
        </div>
      </div>
    );
  }

  // ── HOME ───────────────────────────────────────────────────────────────────
  if (tab === "home") return (
    <PageWrap>
      <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
        <div style={{ fontSize: 64 }}>🎓</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", margin: "8px 0 4px" }}>11+ Practice Hub</h1>
        <p style={{ color: "#c7d2fe", fontSize: 14, margin: 0 }}>GL · CEM · ISEB · Independent Schools</p>
        <p style={{ color: "#a5b4fc", fontSize: 13, margin: "4px 0 0" }}>Learn, practise & find your grammar school</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {[{ id: "learn", icon: "📚", title: "Learn Topics", desc: "Clear explanations, tricks & worked examples", grad: "linear-gradient(135deg, #059669, #047857)" },
          { id: "quiz", icon: "✏️", title: "Practice Quiz", desc: "Real 11+ style questions with encouragement", grad: "linear-gradient(135deg, #4F46E5, #3730a3)" }
        ].map(c => (
          <button key={c.id} onClick={() => setTab(c.id)} style={{ background: c.grad, borderRadius: 20, padding: "22px 16px", border: "none", cursor: "pointer", textAlign: "left", boxShadow: "0 8px 30px rgba(0,0,0,0.3)", color: "white" }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{c.title}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{c.desc}</div>
          </button>
        ))}
      </div>
      <button onClick={() => setTab("schools")} style={{ width: "100%", background: "linear-gradient(135deg, #7C3AED, #6d28d9)", borderRadius: 20, padding: "18px 20px", border: "none", cursor: "pointer", textAlign: "left", boxShadow: "0 8px 30px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 14, color: "white" }}>
        <span style={{ fontSize: 34 }}>🏫</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Grammar Schools Near You</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>17 London schools — entry info, exam boards & tips</div>
        </div>
      </button>
      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 18px", marginTop: 14 }}>
        <p style={{ color: "white", fontWeight: 800, fontSize: 13, margin: "0 0 8px" }}>📋 How to get the most out of this</p>
        {["📚 Learn a topic first — read the tricks and worked examples", "✏️ Then test yourself on it in the quiz", "🔁 Review your mistakes and go back to Learn if needed", "🏫 Check which schools you're applying to and what they test"].map((tip, i) => (
          <p key={i} style={{ color: "#c7d2fe", fontSize: 12.5, margin: "0 0 4px" }}>{tip}</p>
        ))}
      </div>
    </PageWrap>
  );

  // ── LEARN LIST ─────────────────────────────────────────────────────────────
  if (tab === "learn" && !learnTopic) return (
    <PageWrap>
      <h2 style={{ color: "white", fontWeight: 900, fontSize: 22, margin: "16px 0 4px" }}>📚 Learn Topics</h2>
      <p style={{ color: "#c7d2fe", fontSize: 13, margin: "0 0 16px" }}>Pick a topic — clear explanations, tricks, flashcards & worked examples.</p>
      {["maths", "verbal", "nvr"].map(subj => (
        <div key={subj} style={{ marginBottom: 20 }}>
          <p style={{ color: "white", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>{SUBJECT_LABELS[subj]}</p>
          {LEARN_TOPICS.filter(t => t.subject === subj).map(t => (
            <button key={t.id} onClick={() => { setLearnTopic(t); setLearnSec(0); }} style={{ width: "100%", marginBottom: 8, background: "white", borderRadius: 16, padding: "14px 16px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.15)", textAlign: "left" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{t.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: "#1e1b4b" }}>{t.title}</div>
                <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>{t.sections.length} sections · {t.sections.map(s => s.heading.split(" ").slice(0, 2).join(" ")).join(", ")}</div>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", color: t.colour, fontWeight: 900, fontSize: 16, flexShrink: 0 }}>›</div>
            </button>
          ))}
        </div>
      ))}
    </PageWrap>
  );

  // ── LEARN TOPIC ────────────────────────────────────────────────────────────
  if (tab === "learn" && learnTopic) {
    const t = learnTopic;
    const sec = t.sections[learnSec];
    const isLast = learnSec === t.sections.length - 1;
    return (
      <PageWrap>
        <button onClick={() => setLearnTopic(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontWeight: 700, fontSize: 13, borderRadius: 20, padding: "7px 14px", cursor: "pointer", marginTop: 8, marginBottom: 14 }}>← All Topics</button>
        <div style={{ background: t.bg, borderRadius: 20, padding: "18px 18px 14px", marginBottom: 14, border: `2px solid ${t.colour}30` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>{t.icon}</span>
            <h2 style={{ fontSize: 21, fontWeight: 900, color: t.colour, margin: 0 }}>{t.title}</h2>
          </div>
          <p style={{ fontSize: 13.5, color: "#374151", margin: 0, lineHeight: 1.6 }}>{t.intro}</p>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {t.sections.map((s, i) => (
            <button key={i} onClick={() => setLearnSec(i)} style={{ padding: "7px 13px", borderRadius: 20, flexShrink: 0, fontWeight: 700, fontSize: 12, border: `2px solid ${learnSec === i ? "white" : "rgba(255,255,255,0.3)"}`, background: learnSec === i ? t.colour : "transparent", color: "white", cursor: "pointer" }}>
              {i + 1}. {s.heading.split(" ").slice(0, 3).join(" ")}
            </button>
          ))}
        </div>
        <div style={{ background: "white", borderRadius: 20, padding: "20px 18px", marginBottom: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: "1.5px solid #f1f5f9" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.colour, color: "white", fontWeight: 900, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{learnSec + 1}</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b", margin: 0 }}>{sec.heading}</h3>
          </div>
          <LearnSection section={sec} colour={t.colour} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {learnSec > 0 && <button onClick={() => setLearnSec(s => s - 1)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.4)", background: "transparent", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Prev</button>}
          {!isLast
            ? <button onClick={() => setLearnSec(s => s + 1)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: t.colour, color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Next Section →</button>
            : <button onClick={() => { setTab("quiz"); }} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>✏️ Test Yourself →</button>
          }
        </div>
      </PageWrap>
    );
  }

  // ── QUIZ SETUP ─────────────────────────────────────────────────────────────
  if (tab === "quiz") return (
    <PageWrap>
      <h2 style={{ color: "white", fontWeight: 900, fontSize: 22, margin: "16px 0 4px" }}>✏️ Practice Quiz</h2>
      <p style={{ color: "#c7d2fe", fontSize: 13, margin: "0 0 16px" }}>Real 11+ style questions with encouragement & full explanations.</p>
      <div style={{ background: "white", borderRadius: 20, padding: "22px 20px", boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}>
        <p style={{ fontWeight: 800, color: "#1e1b4b", fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 10px" }}>Choose Subjects</p>
        {Object.entries(SUBJECT_LABELS).map(([id, label]) => (
          <button key={id} onClick={() => setSelectedSubjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} style={{ width: "100%", marginBottom: 9, padding: "14px 16px", borderRadius: 14, border: `2px solid ${selectedSubjects.includes(id) ? SUBJECT_COLOURS[id] : "#e5e7eb"}`, background: selectedSubjects.includes(id) ? SUBJECT_BG[id] : "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: selectedSubjects.includes(id) ? SUBJECT_COLOURS[id] : "#374151" }}>{label}</span>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${selectedSubjects.includes(id) ? SUBJECT_COLOURS[id] : "#d1d5db"}`, background: selectedSubjects.includes(id) ? SUBJECT_COLOURS[id] : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selectedSubjects.includes(id) && <span style={{ color: "white", fontSize: 11, fontWeight: 900 }}>✓</span>}
            </div>
          </button>
        ))}
        <p style={{ fontWeight: 800, color: "#1e1b4b", fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", margin: "16px 0 10px" }}>Number of Questions</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[5, 10, 15, 20].map(n => (
            <button key={n} onClick={() => setQuestionCount(n)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `2px solid ${questionCount === n ? "#4F46E5" : "#e5e7eb"}`, background: questionCount === n ? "#EEF2FF" : "white", color: questionCount === n ? "#4F46E5" : "#374151", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>{n}</button>
          ))}
        </div>
        <div onClick={() => setTimedMode(t => !t)} style={{ padding: "14px 16px", borderRadius: 14, cursor: "pointer", marginBottom: 18, border: `2px solid ${timedMode ? "#4F46E5" : "#e5e7eb"}`, background: timedMode ? "#EEF2FF" : "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontWeight: 700, fontSize: 14, color: "#1e1b4b" }}>⏱️ Timed Mode</div><div style={{ fontSize: 12, color: "#6b7280" }}>Practise under real exam conditions</div></div>
          <div style={{ width: 44, height: 24, borderRadius: 12, background: timedMode ? "#4F46E5" : "#d1d5db", position: "relative", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: timedMode ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s", display: "block" }} />
          </div>
        </div>
        <button onClick={startQuiz} disabled={selectedSubjects.length === 0} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: selectedSubjects.length === 0 ? "#e5e7eb" : "linear-gradient(135deg, #4F46E5, #7C3AED)", color: selectedSubjects.length === 0 ? "#9ca3af" : "white", fontWeight: 800, fontSize: 16, cursor: selectedSubjects.length === 0 ? "not-allowed" : "pointer", boxShadow: selectedSubjects.length > 0 ? "0 4px 20px rgba(79,70,229,0.4)" : "none" }}>
          {selectedSubjects.length === 0 ? "👆 Select a subject first" : `Start Quiz — ${questionCount} Questions →`}
        </button>
      </div>
    </PageWrap>
  );

  // ── SCHOOLS ────────────────────────────────────────────────────────────────
  if (tab === "schools") return (
    <PageWrap>
      <h2 style={{ color: "white", fontWeight: 900, fontSize: 22, margin: "16px 0 4px" }}>🏫 London Grammar Schools</h2>
      <p style={{ color: "#c7d2fe", fontSize: 13, margin: "0 0 12px" }}>17 selective schools across 7 boroughs. Tap any school for details & tips.</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {BOROUGHS.map(b => (
          <button key={b} onClick={() => setSchoolFilter(b)} style={{ padding: "7px 14px", borderRadius: 20, flexShrink: 0, fontWeight: 700, fontSize: 12, border: `2px solid ${schoolFilter === b ? "white" : "rgba(255,255,255,0.3)"}`, background: schoolFilter === b ? "white" : "transparent", color: schoolFilter === b ? "#3730a3" : "white", cursor: "pointer" }}>{b}</button>
        ))}
      </div>
      {(schoolFilter === "All" ? SCHOOLS : SCHOOLS.filter(s => s.borough === schoolFilter)).map((s, i) => (
        <div key={i} onClick={() => setExpandedSchool(expandedSchool === i ? null : i)} style={{ background: "white", borderRadius: 16, padding: "14px 16px", marginBottom: 10, cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 14, color: "#1e1b4b" }}>{s.name}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#EEF2FF", color: "#4F46E5", padding: "2px 8px", borderRadius: 10 }}>{s.borough}</span>
                <span style={{ fontSize: 11, fontWeight: 600, background: "#F0FDF4", color: "#059669", padding: "2px 8px", borderRadius: 10 }}>{s.exam}</span>
                {s.places && <span style={{ fontSize: 11, fontWeight: 600, background: "#FEF3C7", color: "#D97706", padding: "2px 8px", borderRadius: 10 }}>{s.places} places</span>}
              </div>
            </div>
            <span style={{ color: "#9ca3af", fontSize: 16, marginLeft: 8 }}>{expandedSchool === i ? "▲" : "▼"}</span>
          </div>
          {expandedSchool === i && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
              <p style={{ margin: "0 0 5px", fontSize: 13, color: "#374151" }}><strong>📚 Tested:</strong> {s.subjects}</p>
              <div style={{ background: "#FFFBEB", borderRadius: 10, padding: "10px 12px", margin: "8px 0" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#92400E", fontWeight: 600 }}>💡 {s.tip}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setTab("quiz"); }} style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✏️ Practise for this school →</button>
            </div>
          )}
        </div>
      ))}
    </PageWrap>
  );

  return null;
}
