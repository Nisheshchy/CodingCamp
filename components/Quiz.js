import { useState } from "react";
import { useRouter } from "next/router";

/**
 * Quiz component — displays questions one at a time, calculates score,
 * and persists the result to the database via POST /api/quiz/submit.
 *
 * @param {{ questions: Array<{question: string, options: Array<{answer: string, isCorrect: boolean}>}> }} props
 */
function Quiz({ questions }) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const submitScore = async (finalScore) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const courseSlug = router.query.course;
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: courseSlug,
          score: finalScore,
          total: questions.length,
        }),
      });
    } catch (err) {
      setSubmitError("Could not save your score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerButtonClick = (isCorrect) => {
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
      submitScore(newScore);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSubmitError(null);
  };

  if (!questions || questions.length === 0) {
    return <p className="course__quiz-empty">No quiz questions available for this course yet.</p>;
  }

  return (
    <>
      {showScore ? (
        <div className="course__quiz-score">
          <p>
            Your score: <strong>{score}/{questions.length}</strong>{" "}
            {score >= Math.ceil(questions.length * 0.7) && (
              <span role="img" aria-label="confetti">🎉</span>
            )}
          </p>
          {submitting && <p className="course__quiz-saving">Saving your score…</p>}
          {submitError && <p className="course__quiz-error">{submitError}</p>}
          <button className="course__quiz-restart" onClick={handleRestart} aria-label="Restart quiz">
            Play Again
          </button>
        </div>
      ) : (
        <>
          <div className="course__quiz-progress" aria-label="Quiz progress">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="course__quiz-question" role="heading" aria-level="2">
            {questions[currentQuestion].question}
          </div>
          <div className="course__quiz-options" role="group" aria-label="Answer options">
            {questions[currentQuestion].options.map((option) => (
              <button
                key={option.answer}
                onClick={() => handleAnswerButtonClick(option.isCorrect)}
                className="course__quiz-select"
                aria-label={`Answer: ${option.answer}`}
              >
                {option.answer}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default Quiz;
