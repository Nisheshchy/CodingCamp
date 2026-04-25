import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { useRouter } from "next/router";

import { useClerk } from "@clerk/nextjs";
import ReactPlayer from "react-player/youtube";
import toast, { Toaster } from "react-hot-toast";
import { ExternalLink } from "react-feather";

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

  const quizRef = useRef(null);

  const onEnded = async () => {
    quizRef.current.scrollIntoView({ behavior: "smooth" });

    if (checkCourseCompleted) {
      return;
    }
    toast("Yay! Completed 🎉", {
      duration: 2000,
      style: toastStyles,
    });
    try {
      const res = await fetch("/api/updateCourse", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: router.query.course,
          completed: true,
        }),
      });
      setCheckCourseCompleted(true);

      if (!res.ok) {
        throw new Error("Something went wrong");
      }
    } catch (err) {
      toast.error(err.message, {
        id: "error",
        style: toastStyles,
      });
    }
  };

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const res = await fetch(`/api/user/${user.id}`);
        const data = await res.json();

        // No user doc yet — create one
        if (!data.length) {
          const res = await fetch(`/api/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: user.id,
              courses: [{ course: router.query.course, completed: false }],
            }),
          });
          if (!res.ok) throw new Error("Something went wrong");
          return;
        }

        const courseObj = data[0].courses.find(
          (c) => c.course === router.query.course
        );

        if (courseObj) {
          setCheckCourseCompleted(courseObj.completed);
        }

        // User exists but hasn't enrolled — add the course
        if (!courseObj) {
          const res = await fetch(`/api/user/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              course: router.query.course,
              completed: false,
            }),
          });
          if (!res.ok) throw new Error("Something went wrong");
        }
      } catch (err) {
        toast.error(err.message, { style: toastStyles });
      }
    };
    getUserDetails();
  }, []);

  return (
    <>
      <Script src="/scripts/smoothscroll.min.js" strategy="beforeInteractive" />
      <div className="course">
        <div className="course__player">
          <ReactPlayer
            onError={() => console.log("Something Went Wrong")}
            url={course.ytURL}
            className="react-player"
            controls={true}
            onEnded={onEnded}
          />
        </div>

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
        <div className="course__quiz" ref={quizRef}>
          <div className="course__quiz-header">
            <h1 className="course__quiz-heading">Quiz</h1>
          </div>
          <Quiz questions={course.quiz} />
        </div>
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
