import { findUserByEmail } from "../../auth/infra/user-store";
import {
  createCourse,
  createLesson,
  createModule,
  listCourses,
  updateCourseStatus,
} from "../infra/course-store";

type SeedDemoCourseInput = {
  enabled: boolean;
  instructorEmail?: string;
};

export const seedDemoCourse = ({ enabled, instructorEmail }: SeedDemoCourseInput): void => {
  if (!enabled) {
    return;
  }

  const instructor = instructorEmail ? findUserByEmail(instructorEmail) : undefined;
  if (!instructor) {
    console.warn("Demo course seed skipped: instructor email not found.");
    return;
  }

  const existing = listCourses({
    page: 1,
    pageSize: 200,
    instructorId: instructor.id,
    q: "Momentum Mastery",
  }).items.find((course) => course.title === "Momentum Mastery");

  if (existing) {
    return;
  }

  const course = createCourse({
    title: "Momentum Mastery",
    summary: "Build consistent learning habits with a structured weekly rhythm.",
    category: "Growth",
    level: "beginner",
    instructorId: instructor.id,
  });

  const moduleOne = createModule({
    courseId: course.id,
    title: "Foundations",
    summary: "Lay the groundwork for steady progress.",
    order: 1,
  });

  createLesson({
    courseId: course.id,
    moduleId: moduleOne.id,
    title: "Welcome and orientation",
    content: "Overview of the course structure and outcomes.",
    order: 1,
    durationMinutes: 8,
  });

  createLesson({
    courseId: course.id,
    moduleId: moduleOne.id,
    title: "Designing your weekly cadence",
    content: "Plan a realistic learning schedule.",
    order: 2,
    durationMinutes: 12,
  });

  const moduleTwo = createModule({
    courseId: course.id,
    title: "Execution",
    summary: "Turn plans into repeatable actions.",
    order: 2,
  });

  createLesson({
    courseId: course.id,
    moduleId: moduleTwo.id,
    title: "Momentum rituals",
    content: "Daily and weekly rituals that keep you on track.",
    order: 1,
    durationMinutes: 10,
  });

  createLesson({
    courseId: course.id,
    moduleId: moduleTwo.id,
    title: "Handling setbacks",
    content: "Recover from missed sessions without losing pace.",
    order: 2,
    durationMinutes: 9,
  });

  updateCourseStatus({ courseId: course.id, status: "published" });
  console.log("Demo course seeded: Momentum Mastery.");
};
