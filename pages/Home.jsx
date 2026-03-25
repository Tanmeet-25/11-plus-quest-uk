import { useState, useEffect, useCallback } from "react";

const QUESTIONS = {
  maths_times_tables: [
    { q: "7 × 8 = ?", options: ["54", "56", "63", "48"], answer: "56" },
    { q: "9 × 6 = ?", options: ["54", "56", "45", "63"], answer: "54" },
    { q: "12 × 7 = ?", options: ["74", "84", "96", "72"], answer: "84" },
    { q: "8 × 9 = ?", options: ["72", "64", "81", "78"], answer: "72" },
    { q: "11 × 12 = ?", options: ["121", "132", "144", "112"], answer: "132" },
    { q: "6 × 7 = ?", options: ["42", "48", "36", "54"], answer: "42" },
    { q: "9 × 9 = ?", options: ["72", "81", "90", "63"], answer: "81" },
    { q: "12 × 8 = ?", options: ["96", "84", "108", "92"], answer: "96" },
    { q: "7 × 6 = ?", options: ["36", "49", "42", "48"], answer: "42" },
    { q: "11 × 9 = ?", options: ["90", "99", "108", "81"], answer: "99" },
    { q: "8 × 7 = ?", options: ["54", "56", "63", "72"], answer: "56" },
    { q: "12 × 11 = ?", options: ["121", "132", "142", "144"], answer: "132" },
  ],
  maths_fractions: [
    { q: "½ ÷ ¾ = ?", options: ["⅜", "⅔", "¼", "⅚"], answer: "⅔" },
    { q: "¾ ÷ ½ = ?", options: ["⅜", "1½", "¼", "⅔"], answer: "1½" },
    { q: "⅔ ÷ ⅓ = ?", options: ["1", "2", "⅙", "4"], answer: "2" },
    { q: "¼ ÷ ½ = ?", options: ["⅛", "½", "2", "¾"], answer: "½" },
    { q: "⅗ ÷ ⅖ = ?", options: ["⅖", "1½", "⅙", "2"], answer: "1½" },
    { q: "⅔ × ¾ = ?", options: ["½", "⅙", "8/9", "¼"], answer: "½" },
    { q: "¾ + ½ = ?", options: ["1", "1¼", "5/4", "1½"], answer: "1¼" },
    { q: "⅘ − ¼ = ?", options: ["11/20", "½", "⅗", "9/20"], answer: "11/20" },
    { q: "⅙ ÷ ⅓ = ?", options: ["2", "½", "⅛", "¼"], answer: "½" },
    { q: "What is ⅗ of 40?", options: ["20", "24", "16", "28"], answer: "24" },
    { q: "Which is largest? ¾, ⅗, ⅔, ⅞", options: ["¾", "⅗", "⅔", "⅞"], answer: "⅞" },
    { q: "5/6 − ½ = ?", options: ["⅓", "¼", "½", "⅙"], answer: "⅓" },
  ],
  verbal_reasoning: [
    { q: "Which word means the same as BRAVE?", options: ["Cowardly", "Courageous", "Reckless", "Timid"], answer: "Courageous" },
    { q: "Complete the analogy: Dog is to Puppy as Cat is to ___", options: ["Kitten", "Cub", "Foal", "Calf"], answer: "Kitten" },
    { q: "Which word is the odd one out?", options: ["Robin", "Sparrow", "Penguin", "Eagle"], answer: "Penguin" },
    { q: "Rearrange the letters NOLDE to make a city:", options: ["LONDE", "DOLEN", "LONDON", "LOEND"], answer: "LOEND" },
    { q: "Which word means the OPPOSITE of ANCIENT?", options: ["Old", "Modern", "Historic", "Dated"], answer: "Modern" },
    { q: "Identify the hidden word: 'THEYCANSWIM' — find an animal:", options: ["THEY", "CAN", "YAK", "SWIM"], answer: "YAK" },
    { q: "Complete: SUN is to DAY as MOON is to ___", options: ["Star", "Sky", "Night", "Dark"], answer: "Night" },
    { q: "Which word cannot be made from the letters in GARDEN?", options: ["RANG", "DARE", "GRADE", "GANDER"], answer: "GANDER" },
    { q: "Choose the word that means ENORMOUS:", options: ["Tiny", "Gigantic", "Average", "Slight"], answer: "Gigantic" },
    { q: "TRAIN is to TRACK as SHIP is to ___", options: ["Dock", "Sea", "Sail", "Port"], answer: "Sea" },
    { q: "Which word is spelled correctly?", options: ["Recieve", "Achieve", "Beleive", "Concieve"], answer: "Achieve" },
    { q: "Find the missing word: BREAD + _____ = BREADWINNER", options: ["WIN", "WINNER", "EARN", "MONEY"], answer: "WINNER" },
  ],
  non_verbal_reasoning: [
    { q: "Which shape has 5 sides?", options: ["Hexagon", "Pentagon", "Octagon", "Square"], answer: "Pentagon" },
    { q: "If you rotate a square 90°, what shape do you get?", options: ["Rectangle", "Diamond", "Square", "Trapezoid"], answer: "Square" },
    { q: "How many lines of symmetry does a regular hexagon have?", options: ["4", "5", "6", "8"], answer: "6" },
    { q: "Which is the next in the sequence: 2, 4, 8, 16, ___?", options: ["24", "28", "32", "36"], answer: "32" },
    { q: "A cube has how many faces?", options: ["4", "6", "8", "12"], answer: "6" },
    { q: "If △ = 3 and ○ = 5, what is △ + ○ + △?", options: ["8", "10", "11", "13"], answer: "11" },
    { q: "Which 3D shape has a circular base and comes to a point?", options: ["Cylinder", "Cone", "Pyramid", "Sphere"], answer: "Cone" },
    { q: "How many edges does a cube have?", options: ["6", "8", "10", "12"], answer: "12" },
    { q: "In a pattern: ■ ▲ ■ ▲ ■ ___ — what comes next?", options: ["■", "▲", "○", "▲▲"], answer: "▲" },
    { q: "Which shape has the most lines of symmetry?", options: ["Rectangle", "Square", "Equilateral Triangle", "Circle"], answer: "Circle" },
    { q: "A shape has 4 equal sides and 4 right angles. What is it?", options: ["Rectangle", "Rhombus", "Square", "Parallelogram"], answer: "Square" },
    { q: "If you fold a square diagonally, what shape do you get?", options: ["Rectangle", "Triangle", "Pentagon", "Trapezoid"], answer: "Triangle" },
  ],
};

const TOPICS = [
  { id: "maths_times_tables", label: "🔢 Times Tables", color: "#4F46E5", bg: "#EEF2FF" },
  { id: "maths_fractions", label: "➗ Fractions & Division", color: "#7C3AED", bg: "#F5F3FF" },
  { id: "verbal_reasoning", label: "📖 Verbal Reasoning", color: "#059669", bg: "#ECFDF5" },
  { id: "non_verbal_reasoning", label: "🔷 Non-Verbal Reasoning", color: "#D97706", bg: "#FFFBEB" },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function App() {
  const [screen, setScreen] = useState("home"); // home | quiz | result
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timedMode, setTimedMode] = useState(false);

  const startQuiz = () => {
    const pool = selectedTopics.flatMap(t => QUESTIONS[t].map(q => ({ ...q, topic: t })));
    const picked = shuffle(pool).slice(0, questionCount).map(q => ({
      ...q,
      options: shuffle(q.options),
    }));
    setQuestions(picked);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setShowFeedback(false);
    if (timedMode) setTimeLeft(questionCount * 45);
    setScreen("quiz");
  };

  useEffect(() => {
    if (screen !== "quiz" || !timedMode) return;
    if (timeLeft <= 0) {
      finishQuiz([...answers]);
      return;
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, screen, timedMode]);

  const handleAnswer = (opt) => {
    if (showFeedback) return;
    setSelected(opt);
    setShowFeedback(true);
    const isCorrect = opt === questions[current].answer;
    const newAnswers = [...answers, { question: questions[current], chosen: opt, correct: isCorrect }];
    setAnswers(newAnswers);
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setShowFeedback(false);
      } else {
        finishQuiz(newAnswers);
      }
    }, 1000);
  };

  const finishQuiz = (ans) => {
    setAnswers(ans);
    setScreen("result");
  };

  const toggleTopic = (id) => {
    setSelectedTopics(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const score = answers.filter(a => a.correct).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : "D";
  const gradeColor = pct >= 80 ? "#059669" : pct >= 60 ? "#D97706" : "#DC2626";

  const topicLabel = (id) => TOPICS.find(t => t.id === id)?.label || id;

  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "white", borderRadius: 24, padding: "36px 32px", maxWidth: 520, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48 }}>🎓</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e1b4b", margin: "8px 0 4px" }}>11+ Practice Quiz</h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>GL / CEM / ISEB — Test your skills!</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 700, color: "#374151", marginBottom: 10, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>Choose Topics</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {TOPICS.map(t => (
              <button key={t.id} onClick={() => toggleTopic(t.id)} style={{
                padding: "12px 10px", borderRadius: 12, border: `2px solid ${selectedTopics.includes(t.id) ? t.color : "#e5e7eb"}`,
                background: selectedTopics.includes(t.id) ? t.bg : "white",
                color: selectedTopics.includes(t.id) ? t.color : "#374151",
                fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {selectedTopics.includes(t.id) && <span style={{ color: t.color }}>✓</span>}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 700, color: "#374151", marginBottom: 10, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>Number of Questions</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[5, 10, 15, 20].map(n => (
              <button key={n} onClick={() => setQuestionCount(n)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${questionCount === n ? "#4F46E5" : "#e5e7eb"}`,
                background: questionCount === n ? "#EEF2FF" : "white",
                color: questionCount === n ? "#4F46E5" : "#374151",
                fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.15s",
              }}>{n}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f9fafb", borderRadius: 12 }}>
          <span style={{ fontWeight: 600, color: "#374151", fontSize: 14, flex: 1 }}>⏱ Timed Mode ({questionCount * 45}s)</span>
          <button onClick={() => setTimedMode(t => !t)} style={{
            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
            background: timedMode ? "#4F46E5" : "#d1d5db", position: "relative", transition: "background 0.2s",
          }}>
            <span style={{
              position: "absolute", top: 2, left: timedMode ? 22 : 2, width: 20, height: 20,
              borderRadius: "50%", background: "white", transition: "left 0.2s", display: "block",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </button>
        </div>

        <button onClick={startQuiz} disabled={selectedTopics.length === 0} style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "none",
          background: selectedTopics.length === 0 ? "#d1d5db" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white", fontWeight: 800, fontSize: 17, cursor: selectedTopics.length === 0 ? "not-allowed" : "pointer",
          letterSpacing: "0.3px", transition: "opacity 0.15s",
        }}>
          {selectedTopics.length === 0 ? "Select at least one topic" : "Start Quiz →"}
        </button>
      </div>
    </div>
  );

  if (screen === "quiz") {
    const q = questions[current];
    const progress = ((current) / questions.length) * 100;
    const topic = TOPICS.find(t => t.id === q.topic);
    const mins = timedMode ? Math.floor(timeLeft / 60) : 0;
    const secs = timedMode ? timeLeft % 60 : 0;

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ background: "white", borderRadius: 24, padding: "32px", maxWidth: 540, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: topic.color, background: topic.bg, padding: "4px 12px", borderRadius: 20 }}>{topic.label}</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {timedMode && (
                <span style={{ fontSize: 14, fontWeight: 700, color: timeLeft < 30 ? "#DC2626" : "#374151", background: timeLeft < 30 ? "#FEF2F2" : "#f3f4f6", padding: "4px 10px", borderRadius: 8 }}>
                  ⏱ {mins}:{secs.toString().padStart(2, "0")}
                </span>
              )}
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{current + 1} / {questions.length}</span>
            </div>
          </div>

          {/* Progress */}
          <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, marginBottom: 28, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${topic.color}, #764ba2)`, borderRadius: 3, transition: "width 0.3s" }} />
          </div>

          {/* Question */}
          <div style={{ background: "#f9fafb", borderRadius: 16, padding: "24px", marginBottom: 24, textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#1e1b4b", margin: 0, lineHeight: 1.4 }}>{q.q}</p>
          </div>

          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {q.options.map((opt, i) => {
              let bg = "white", border = "#e5e7eb", color = "#374151";
              if (showFeedback) {
                if (opt === q.answer) { bg = "#ECFDF5"; border = "#059669"; color = "#059669"; }
                else if (opt === selected) { bg = "#FEF2F2"; border = "#DC2626"; color = "#DC2626"; }
              } else if (selected === opt) { bg = "#EEF2FF"; border = "#4F46E5"; color = "#4F46E5"; }
              return (
                <button key={i} onClick={() => handleAnswer(opt)} style={{
                  padding: "14px 12px", borderRadius: 12, border: `2px solid ${border}`,
                  background: bg, color, fontWeight: 700, fontSize: 16, cursor: showFeedback ? "default" : "pointer",
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                }}>
                  {showFeedback && opt === q.answer && <span>✓</span>}
                  {showFeedback && opt === selected && opt !== q.answer && <span>✗</span>}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "result") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "white", borderRadius: 24, padding: "36px 32px", maxWidth: 560, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "💪"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: "8px 0 4px" }}>Quiz Complete!</h2>
          <div style={{ fontSize: 48, fontWeight: 900, color: gradeColor, marginTop: 8 }}>{grade}</div>
          <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: 16 }}>{score} / {questions.length} correct ({pct}%)</p>
          <p style={{ color: gradeColor, fontWeight: 700, fontSize: 15, marginTop: 4 }}>
            {pct >= 90 ? "Outstanding! 🌟" : pct >= 80 ? "Excellent work!" : pct >= 70 ? "Good effort! Keep practising." : pct >= 60 ? "Getting there — review your mistakes." : "More practice needed. Don't give up!"}
          </p>
        </div>

        {/* Topic breakdown */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontWeight: 700, color: "#374151", marginBottom: 10, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>Topic Breakdown</p>
          {TOPICS.filter(t => selectedTopics.includes(t.id)).map(t => {
            const topicAnswers = answers.filter(a => a.question.topic === t.id);
            if (!topicAnswers.length) return null;
            const tc = topicAnswers.filter(a => a.correct).length;
            const tp = Math.round((tc / topicAnswers.length) * 100);
            return (
              <div key={t.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{t.label}</span>
                  <span style={{ fontSize: 13, color: t.color, fontWeight: 700 }}>{tc}/{topicAnswers.length} ({tp}%)</span>
                </div>
                <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${tp}%`, background: t.color, borderRadius: 4, transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Review wrong answers */}
        {answers.filter(a => !a.correct).length > 0 && (
          <div style={{ marginBottom: 24, background: "#FEF2F2", borderRadius: 14, padding: 16 }}>
            <p style={{ fontWeight: 700, color: "#991B1B", marginBottom: 10, fontSize: 14 }}>❌ Review Mistakes</p>
            {answers.filter(a => !a.correct).map((a, i) => (
              <div key={i} style={{ marginBottom: 8, padding: "10px 12px", background: "white", borderRadius: 10, fontSize: 13 }}>
                <p style={{ fontWeight: 700, color: "#374151", margin: "0 0 4px" }}>{a.question.q}</p>
                <p style={{ margin: "2px 0", color: "#DC2626" }}>Your answer: {a.chosen}</p>
                <p style={{ margin: 0, color: "#059669", fontWeight: 700 }}>✓ Correct: {a.question.answer}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setScreen("home"); setSelectedTopics([]); }} style={{
            flex: 1, padding: "14px", borderRadius: 12, border: "2px solid #e5e7eb",
            background: "white", color: "#374151", fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>← New Quiz</button>
          <button onClick={startQuiz} style={{
            flex: 1, padding: "14px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>🔄 Retry Same</button>
        </div>
      </div>
    </div>
  );
}
