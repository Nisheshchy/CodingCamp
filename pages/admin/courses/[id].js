import { CourseForm } from "../../../components/admin/CourseForm";

/**
 * Edit course page — loaded via getServerSideProps so the form
 * is pre-populated with the current course data from MongoDB.
 */
export default function EditCoursePage({ course }) {
  if (!course) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
        Course not found.
      </div>
    );
  }
  return <CourseForm initial={course} courseSlug={course.course} />;
}

export async function getServerSideProps(context) {
  const { connect } = await import("../../../utils/db");
  const Course = (await import("../../../models/Course")).default;
  await connect();

  const { id } = context.params;
  const course = await Course.findOne({ course: id });
  if (!course) return { notFound: true };

  return {
    props: { course: JSON.parse(JSON.stringify(course)) },
  };
}
