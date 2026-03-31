import { findUserByEmail } from "../../auth/infra/user-store";
import {
  createCourse,
  createLesson,
  createModule,
  deleteCourseById,
  listCourses,
  updateCourseStatus,
} from "../infra/course-store";

type SeedDemoCourseInput = {
  enabled: boolean;
  instructorEmail?: string;
};

export const seedDemoCourse = async ({
  enabled,
  instructorEmail,
}: SeedDemoCourseInput): Promise<void> => {
  if (!enabled) {
    return;
  }

  const instructor = instructorEmail ? await findUserByEmail(instructorEmail) : undefined;
  if (!instructor) {
    console.warn("Demo course seed skipped: instructor email not found.");
    return;
  }

  const existingCourses = await listCourses({
    page: 1,
    pageSize: 500,
    instructorId: instructor.id,
    q: "React Fundamentals",
  });

  const existingReactCourses = existingCourses.items.filter(
    (course) => course.title === "React Fundamentals"
  );

  for (const course of existingReactCourses) {
    await deleteCourseById(course.id);
  }

  const reactCourse = await createCourse({
    title: "React Fundamentals",
    summary: "Ship production-grade React apps with modern patterns, tooling, and UX.",
    category: "Frontend",
    level: "beginner",
    instructorId: instructor.id,
  });

  const introModule = await createModule({
    courseId: reactCourse.id,
    title: "Kickoff and Tooling",
    summary: "Set up a professional React workflow and know the mental model.",
    order: 1,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: introModule.id,
    title: "React in the product stack",
    type: "video",
    resourceUrl: "https://cdn.example.com/react-fundamentals/intro.mp4",
    content: "How React fits in modern product teams and delivery pipelines.",
    order: 1,
    durationMinutes: 12,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: introModule.id,
    title: "Vite + React setup",
    type: "link",
    resourceUrl: "https://vitejs.dev/guide/",
    content: "Reference guide for fast project setup and scripts.",
    order: 2,
    durationMinutes: 8,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: introModule.id,
    title: "Design systems starter kit",
    type: "pdf",
    resourceUrl: "https://cdn.example.com/react-fundamentals/design-system.pdf",
    content: "Download the UI kit used in this course.",
    order: 3,
    durationMinutes: 5,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: introModule.id,
    title: "Developer workflow playbook",
    type: "text",
    content: "Git branching, PR templates, and release checklists for React teams.",
    order: 4,
    durationMinutes: 7,
  });

  const coreModule = await createModule({
    courseId: reactCourse.id,
    title: "Core React Concepts",
    summary: "Components, props, state, and composition patterns.",
    order: 2,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: coreModule.id,
    title: "JSX, components, and props",
    type: "video",
    resourceUrl: "https://cdn.example.com/react-fundamentals/jsx-components.mp4",
    content: "Build reusable UI blocks and manage data flow.",
    order: 1,
    durationMinutes: 18,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: coreModule.id,
    title: "Component composition patterns",
    type: "text",
    content: "Render props, slots, and compound components for scale.",
    order: 2,
    durationMinutes: 14,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: coreModule.id,
    title: "Props and state troubleshooting guide",
    type: "pdf",
    resourceUrl: "https://cdn.example.com/react-fundamentals/props-state-guide.pdf",
    content: "Debugging checklist for common state bugs.",
    order: 3,
    durationMinutes: 6,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: coreModule.id,
    title: "Core concepts check",
    type: "quiz",
    order: 4,
    durationMinutes: 6,
    quiz: {
      title: "Core concepts",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          prompt: "Props are primarily used to:",
          options: [
            { id: "q1a", text: "Pass data into a component", isCorrect: true },
            { id: "q1b", text: "Store local component state", isCorrect: false },
            { id: "q1c", text: "Fetch remote data", isCorrect: false },
          ],
        },
        {
          id: "q2",
          prompt: "Which pattern helps share stateful logic between components?",
          options: [
            { id: "q2a", text: "Custom hooks", isCorrect: true },
            { id: "q2b", text: "Inline styles", isCorrect: false },
            { id: "q2c", text: "Static HTML", isCorrect: false },
          ],
        },
      ],
    },
  });

  const stateModule = await createModule({
    courseId: reactCourse.id,
    title: "State, Effects, and Data",
    summary: "Master hooks, async data, and side effects.",
    order: 3,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: stateModule.id,
    title: "State patterns with useState",
    type: "video",
    resourceUrl: "https://cdn.example.com/react-fundamentals/use-state.mp4",
    content: "Derived state, reset patterns, and controlled inputs.",
    order: 1,
    durationMinutes: 16,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: stateModule.id,
    title: "Effects and data fetching",
    type: "text",
    content: "Fetching, cancellation, and race-condition safe patterns.",
    order: 2,
    durationMinutes: 15,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: stateModule.id,
    title: "State management decision matrix",
    type: "link",
    resourceUrl: "https://react.dev/learn/state-a-components-memory",
    content: "When to use context, reducers, or external stores.",
    order: 3,
    durationMinutes: 8,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: stateModule.id,
    title: "Forms and validation checklist",
    type: "pdf",
    resourceUrl: "https://cdn.example.com/react-fundamentals/forms-checklist.pdf",
    content: "Reusable checklist for production-ready forms.",
    order: 4,
    durationMinutes: 7,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: stateModule.id,
    title: "Hooks checkpoint",
    type: "quiz",
    order: 5,
    durationMinutes: 7,
    quiz: {
      title: "Hooks checkpoint",
      passingScore: 75,
      questions: [
        {
          id: "q1",
          prompt: "Which hook is best for memoizing expensive calculations?",
          options: [
            { id: "q1a", text: "useMemo", isCorrect: true },
            { id: "q1b", text: "useEffect", isCorrect: false },
            { id: "q1c", text: "useRef", isCorrect: false },
          ],
        },
        {
          id: "q2",
          prompt: "What does the dependency array in useEffect control?",
          options: [
            { id: "q2a", text: "When the effect re-runs", isCorrect: true },
            { id: "q2b", text: "Component render order", isCorrect: false },
            { id: "q2c", text: "Props validation", isCorrect: false },
          ],
        },
      ],
    },
  });

  const routingModule = await createModule({
    courseId: reactCourse.id,
    title: "Routing and API Integration",
    summary: "Routing, auth guards, and API workflows.",
    order: 4,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: routingModule.id,
    title: "React Router essentials",
    type: "video",
    resourceUrl: "https://cdn.example.com/react-fundamentals/react-router.mp4",
    content: "Nested routing, loaders, and error boundaries.",
    order: 1,
    durationMinutes: 14,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: routingModule.id,
    title: "API contracts and error handling",
    type: "text",
    content: "Design resilient fetch layers and UI error states.",
    order: 2,
    durationMinutes: 13,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: routingModule.id,
    title: "Route protection playbook",
    type: "pdf",
    resourceUrl: "https://cdn.example.com/react-fundamentals/route-protection.pdf",
    content: "Auth guard patterns and redirect logic.",
    order: 3,
    durationMinutes: 6,
  });

  const perfModule = await createModule({
    courseId: reactCourse.id,
    title: "Performance and Quality",
    summary: "Measure performance and keep the codebase healthy.",
    order: 5,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: perfModule.id,
    title: "Rendering performance",
    type: "video",
    resourceUrl: "https://cdn.example.com/react-fundamentals/performance.mp4",
    content: "Memoization, virtualization, and profiling workflows.",
    order: 1,
    durationMinutes: 17,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: perfModule.id,
    title: "Testing strategy",
    type: "link",
    resourceUrl: "https://testing-library.com/docs/react-testing-library/intro/",
    content: "Focus on user-centric tests and reliable selectors.",
    order: 2,
    durationMinutes: 9,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: perfModule.id,
    title: "Performance review",
    type: "quiz",
    order: 3,
    durationMinutes: 6,
    quiz: {
      title: "Performance review",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          prompt: "What tool should you use to inspect React component renders?",
          options: [
            { id: "q1a", text: "React DevTools Profiler", isCorrect: true },
            { id: "q1b", text: "TypeScript", isCorrect: false },
            { id: "q1c", text: "Prettier", isCorrect: false },
          ],
        },
      ],
    },
  });

  const capstoneModule = await createModule({
    courseId: reactCourse.id,
    title: "Capstone Build",
    summary: "Launch a production-quality React app.",
    order: 6,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: capstoneModule.id,
    title: "Capstone brief and deliverables",
    type: "text",
    content: "Ship a responsive dashboard with auth, charts, and notifications.",
    order: 1,
    durationMinutes: 11,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: capstoneModule.id,
    title: "Final submission checklist",
    type: "pdf",
    resourceUrl: "https://cdn.example.com/react-fundamentals/capstone-checklist.pdf",
    content: "Checklist to validate your final build.",
    order: 2,
    durationMinutes: 6,
  });

  await createLesson({
    courseId: reactCourse.id,
    moduleId: capstoneModule.id,
    title: "Demo day script",
    type: "text",
    content: "How to present your app, tell the story, and answer questions.",
    order: 3,
    durationMinutes: 5,
  });

  await updateCourseStatus({ courseId: reactCourse.id, status: "published" });
  console.log("Demo course seeded: React Fundamentals.");
};
