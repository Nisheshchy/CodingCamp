import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { useRouter } from "next/router";

import { useClerk } from "@clerk/nextjs";
import ReactPlayer from "react-player/youtube";
import toast, { Toaster } from "react-hot-toast";
import { ExternalLink, Award } from "react-feather";
import jsPDF from "jspdf";

import Quiz from "../../components/Quiz";

const toastStyles = {
  fontSize: "1.2rem",
  fontWeight: "600",
  backgroundColor: "#212529",
  color: "#fff",
};

function CoursePage({ course }) {
  const router = useRouter();
  const { user } = useClerk();
  
  const [checkCourseCompleted, setCheckCourseCompleted] = useState(false);
  const [maxPlayedSeconds, setMaxPlayedSeconds] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const lastSavedSecRef = useRef(0); // track last save to avoid duplicate API hits
  
  const playerRef = useRef(null);
  const quizRef = useRef(null);

  // Initialize progress
  useEffect(() => {
    const initUserProgress = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/user/${user.id}`, { cache: "no-store" });
        const data = await res.json();

        if (!data.length) {
          await fetch(`/api/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: user.id,
              courses: [{ course: router.query.course, completed: false, videoProgress: 0 }],
            }),
          });
          return;
        }

        const courseObj = data[0].courses.find((c) => c.course === router.query.course);

        if (courseObj) {
          setCheckCourseCompleted(courseObj.completed);
          setMaxPlayedSeconds(courseObj.videoProgress || 0);
          // Auto-seek to where they left off
          if (playerRef.current && courseObj.videoProgress > 0 && !courseObj.videoCompleted) {
            playerRef.current.seekTo(courseObj.videoProgress, "seconds");
          }
        } else {
          await fetch(`/api/user/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ course: router.query.course, completed: false }),
          });
        }
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    };
    initUserProgress();
  }, [user?.id, router.query.course]);

  const saveProgressToDB = async (playedSeconds, duration) => {
    if (!router.query.course) return; // guard: no course slug yet
    try {
      const res = await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: router.query.course,
          playedSeconds,
          duration
        }),
      });
      const data = await res.json();
      console.log(`[progress] status=${res.status} course=${router.query.course} played=${Math.floor(playedSeconds)}s`, data);
      if (!res.ok) {
        console.error("[progress] API error:", res.status, data);
        return;
      }
      if (data.completed) {
        setCheckCourseCompleted(true);
        toast.success("Course completely finished! 🎉", { style: toastStyles });
      }
    } catch (err) {
      console.error("Progress save failed", err);
    }
  };

  // Anti-skip logic
  const handleProgress = (state) => {
    // Only block progress tracking during an active seek scrub, NOT during normal pause
    if (isSeeking || !isReady || !duration) return;

    // Allow a 2-second buffer for natural playback drift.
    // If they scrub forward beyond their maximum allowed time, forcefully rewind.
    if (state.playedSeconds > maxPlayedSeconds + 2) {
      if (playerRef.current) playerRef.current.seekTo(maxPlayedSeconds, "seconds");
      toast("Skipping forward is disabled 🛑", { icon: "🛑" });
      return;
    }

    const newMax = Math.max(maxPlayedSeconds, state.playedSeconds);
    setMaxPlayedSeconds(newMax);

    // Save progress to DB roughly every 10 seconds to avoid spamming the API
    const flooredSec = Math.floor(state.playedSeconds);
    if (flooredSec > 0 && flooredSec % 10 === 0 && flooredSec !== lastSavedSecRef.current) {
      lastSavedSecRef.current = flooredSec;
      saveProgressToDB(state.playedSeconds, duration);
    }
  };

  // Save progress when user pauses — captures partial progress even if they don't finish
  const handlePause = () => {
    if (isReady && duration > 0 && maxPlayedSeconds > 0) {
      saveProgressToDB(maxPlayedSeconds, duration);
    }
  };

  const handleEnded = () => {
    if (duration > 0) {
      saveProgressToDB(duration, duration); // Save 100%
    }
    if (course.quiz && course.quiz.length > 0 && !checkCourseCompleted) {
       toast("Video done! Scroll down to pass the quiz.", { style: toastStyles });
       quizRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Force re-evaluation of completion when quiz is passed
  const handleQuizPassed = async () => {
    if (duration > 0) {
      // Triggering progress save again will re-evaluate video+quiz completion on the backend
      await saveProgressToDB(maxPlayedSeconds, duration);
    }
  };

  const generateCertificate = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [800, 600]
    });
    
    // Attempt to load the pre-designed certificate base image if available
    try {
        const img = new Image();
        img.src = "/certificate.png"; // Fallback to basic text if image doesn't exist
        doc.addImage(img, "PNG", 0, 0, 800, 600);
    } catch (e) {
        // Just draw a border if no image
        doc.setLineWidth(4);
        doc.rect(20, 20, 760, 560);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.text("Certificate of Completion", 400, 150, null, null, "center");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.text("This certifies that", 400, 250, null, null, "center");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(35);
    const userName = user?.fullName || user?.firstName || "Student";
    doc.text(userName, 400, 300, null, null, "center");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.text(`has successfully completed the course:`, 400, 370, null, null, "center");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(course.name, 400, 420, null, null, "center");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    const date = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Awarded on ${date}`, 400, 500, null, null, "center");

    doc.save(`${course.course}-certificate.pdf`);
  };

  return (
    <>
      <Script src="/scripts/smoothscroll.min.js" strategy="beforeInteractive" />
      <div className="course">
        <div className="course__player">
          <ReactPlayer
            ref={playerRef}
            url={course.ytURL}
            className="react-player"
            controls={true}
            onReady={() => setIsReady(true)}
            onDuration={(d) => setDuration(d)}
            onProgress={handleProgress}
            onSeek={() => setIsSeeking(true)}  // Only set seeking during actual scrub
            onPlay={() => setIsSeeking(false)} // Resume tracking on play
            onPause={handlePause}              // Save progress on pause (NOT seeking)
            onEnded={handleEnded}
            progressInterval={1000} // Fire onProgress every 1s
          />
        </div>

        {course.resources && course.resources.length > 0 && (
          <div className="course__resources">
            <h1 className="course__resources-heading">Resources</h1>
            <div className="course__resources-list">
              {course.resources.map((resource, index) => (
                <a
                  href={resource.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="course__resources-link"
                  key={index}
                >
                  <span className="course__resources-text">{resource.name}</span>
                  <ExternalLink />
                </a>
              ))}
            </div>
          </div>
        )}

        {course.quiz && course.quiz.length > 0 && (
          <div className="course__quiz" ref={quizRef}>
            <div className="course__quiz-header">
              <h1 className="course__quiz-heading">Quiz</h1>
            </div>
            <Quiz questions={course.quiz} onQuizPassed={handleQuizPassed} />
          </div>
        )}
        
        {checkCourseCompleted && (
          <div className="course__certificate" style={{ textAlign: "center", marginTop: "40px", paddingBottom: "50px" }}>
             <button 
                onClick={generateCertificate}
                style={{
                  backgroundColor: "#0070f3", color: "white", padding: "15px 30px",
                  fontSize: "1.2rem", borderRadius: "8px", border: "none", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: "10px", fontWeight: "bold"
                }}>
                <Award size={24} />
                Download Certificate
             </button>
          </div>
        )}

        <Toaster position="bottom-right" />
      </div>
    </>
  );
}

export const getStaticPaths = async () => {
  const { connect } = await import("../../utils/db");
  const Course = (await import("../../models/Course")).default;
  await connect();
  const courses = await Course.find({}, "course");
  const paths = JSON.parse(JSON.stringify(courses)).map((c) => ({
    params: { course: c.course },
  }));
  return { paths, fallback: "blocking" };
};

export const getStaticProps = async (context) => {
  const { connect } = await import("../../utils/db");
  const Course = (await import("../../models/Course")).default;
  await connect();
  const courseID = context.params.course;
  const course = await Course.findOne({ course: courseID });
  if (!course) return { notFound: true };
  return {
    props: { course: JSON.parse(JSON.stringify(course)) },
    revalidate: 60,
  };
};

export default CoursePage;
