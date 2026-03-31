"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/shared/auth-guard";
import { authDeleteJson, authGetJson, authPatchJson, authPostJson } from "@/shared/api";
import { GlassCard, PageShell, Pill, SectionHeading } from "@/shared/ui";

type CourseDetail = {
  id: string;
  title: string;
  summary?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published";
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
};

type LessonType = "video" | "link" | "text" | "pdf" | "quiz";

type LessonQuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type LessonQuizQuestion = {
  id: string;
  prompt: string;
  options: LessonQuizOption[];
  multipleCorrect?: boolean;
};

type LessonQuiz = {
  title?: string;
  passingScore?: number;
  questions: LessonQuizQuestion[];
};

type Lesson = {
  id: string;
  title: string;
  type: LessonType;
  order: number;
  durationMinutes?: number;
  content?: string;
  resourceUrl?: string;
  quiz?: LessonQuiz;
};

type Module = {
  id: string;
  title: string;
  summary?: string;
  order: number;
  lessonCount: number;
  lessons: Lesson[];
};

type CourseStatusResponse = {
  id: string;
  title: string;
  summary?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published";
  instructorId: string;
  createdAt: string;
  updatedAt: string;
};

type VideoUploadResponse = {
  uploadUrl: string;
  assetUrl: string;
  expiresAt: string;
};

type MeResponse = {
  id: string;
  email: string;
  role: "student" | "instructor" | "admin";
  createdAt: string;
};

type EditState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CourseDetail };

type FormState = {
  title: string;
  summary: string;
  category: string;
  level: "" | "beginner" | "intermediate" | "advanced";
};

type LessonQuizOptionDraft = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type LessonQuizQuestionDraft = {
  id: string;
  prompt: string;
  options: LessonQuizOptionDraft[];
  multipleCorrect: boolean;
};

type LessonQuizDraft = {
  title: string;
  passingScore: string;
  questions: LessonQuizQuestionDraft[];
};

type LessonDraft = {
  title: string;
  type: LessonType;
  durationMinutes: string;
  content: string;
  resourceUrl: string;
  quiz: LessonQuizDraft;
};

type LessonFieldErrors = {
  title?: string;
  content?: string;
  resourceUrl?: string;
  durationMinutes?: string;
  quiz?: string;
};

type ModuleDraft = {
  title: string;
  summary: string;
  order: string;
};

const lessonTypeCopy: Record<LessonType, { label: string; helper: string }> = {
  video: { label: "Video", helper: "MP4/WebM hosted in your CDN or storage." },
  link: { label: "External link", helper: "Reference a lab, doc, or website." },
  text: { label: "Text lesson", helper: "Rich notes, transcripts, or guides." },
  pdf: { label: "PDF", helper: "Workbook or downloadable resource." },
  quiz: { label: "Quiz", helper: "Interactive assessment for learners." },
};

const createDraftId = (): string => Math.random().toString(36).slice(2, 10);

const createQuizDraft = (): LessonQuizDraft => ({
  title: "",
  passingScore: "",
  questions: [
    {
      id: createDraftId(),
      prompt: "",
      multipleCorrect: false,
      options: [
        { id: createDraftId(), text: "", isCorrect: true },
        { id: createDraftId(), text: "", isCorrect: false },
      ],
    },
  ],
});

const createLessonDraft = (): LessonDraft => ({
  title: "",
  type: "video",
  durationMinutes: "",
  content: "",
  resourceUrl: "",
  quiz: createQuizDraft(),
});

const createModuleDraftFromModule = (moduleItem: Module): ModuleDraft => ({
  title: moduleItem.title,
  summary: moduleItem.summary ?? "",
  order: moduleItem.order.toString(),
});

const validateLessonDraft = (draft: LessonDraft): LessonFieldErrors => {
  const errors: LessonFieldErrors = {};
  const title = draft.title.trim();
  if (!title) {
    errors.title = "Lesson title is required.";
  } else if (title.length < 3) {
    errors.title = "Lesson title must be at least 3 characters.";
  }

  const durationValue = draft.durationMinutes.trim();
  if (durationValue) {
    const parsed = Number(durationValue);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.durationMinutes = "Duration must be a positive number.";
    }
  }

  if (draft.type === "text" && !draft.content.trim()) {
    errors.content = "Text lessons need content.";
  }

  if (draft.type !== "text" && draft.type !== "quiz" && !draft.resourceUrl.trim()) {
    errors.resourceUrl = "Resource URL is required for this lesson type.";
  }

  if (draft.type === "quiz") {
    const questions = draft.quiz.questions
      .map((question) => {
        const options = question.options
          .map((option) => ({
            ...option,
            text: option.text.trim(),
          }))
          .filter((option) => option.text.length > 0);

        return {
          ...question,
          prompt: question.prompt.trim(),
          options,
        };
      })
      .filter((question) => question.prompt.length > 0);

    if (questions.length === 0) {
      errors.quiz = "Add at least one quiz question with two options.";
    } else if (
      questions.some(
        (question) =>
          question.options.length < 2 ||
          question.options.filter((option) => option.isCorrect).length === 0
      )
    ) {
      errors.quiz = "Each quiz question needs two options and a correct answer.";
    }
  }

  return errors;
};

const buildLessonUpdatePayload = (lesson: Lesson): Record<string, unknown> => ({
  title: lesson.title,
  type: lesson.type,
  ...(lesson.content !== undefined ? { content: lesson.content } : {}),
  ...(lesson.resourceUrl !== undefined ? { resourceUrl: lesson.resourceUrl } : {}),
  ...(lesson.quiz !== undefined ? { quiz: lesson.quiz } : {}),
  ...(lesson.durationMinutes !== undefined ? { durationMinutes: lesson.durationMinutes } : {}),
  ...(lesson.order !== undefined ? { order: lesson.order } : {}),
});

const createLessonDraftFromLesson = (lesson: Lesson): LessonDraft => ({
  title: lesson.title,
  type: lesson.type,
  durationMinutes: lesson.durationMinutes?.toString() ?? "",
  content: lesson.content ?? "",
  resourceUrl: lesson.resourceUrl ?? "",
  quiz: lesson.quiz
    ? {
        title: lesson.quiz.title ?? "",
        passingScore: lesson.quiz.passingScore?.toString() ?? "",
        questions: lesson.quiz.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          multipleCorrect: question.multipleCorrect ?? false,
          options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        })),
      }
    : createQuizDraft(),
});

type CourseEditPageProps = {
  params: Promise<{ courseId: string }>;
};

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const { courseId } = use(params);
  const router = useRouter();
  const [state, setState] = useState<EditState>({ status: "loading" });
  const [viewer, setViewer] = useState<MeResponse | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    summary: "",
    category: "",
    level: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoMessage, setAutoMessage] = useState<string | null>(null);
  const [curriculumMessage, setCurriculumMessage] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", summary: "" });
  const [moduleSaving, setModuleSaving] = useState(false);
  const [moduleEditDrafts, setModuleEditDrafts] = useState<Record<string, ModuleDraft>>({});
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleUpdating, setModuleUpdating] = useState<string | null>(null);
  const [moduleEditMessage, setModuleEditMessage] = useState<string | null>(null);
  const [lessonDrafts, setLessonDrafts] = useState<Record<string, LessonDraft>>({});
  const [lessonSteps, setLessonSteps] = useState<Record<string, 1 | 2 | 3>>({});
  const [lessonSaving, setLessonSaving] = useState<string | null>(null);
  const [lessonEditDrafts, setLessonEditDrafts] = useState<Record<string, LessonDraft>>({});
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonUpdating, setLessonUpdating] = useState<string | null>(null);
  const [lessonDeleting, setLessonDeleting] = useState<string | null>(null);
  const [lessonEditMessage, setLessonEditMessage] = useState<string | null>(null);
  const [lessonEditErrors, setLessonEditErrors] = useState<
    Record<string, LessonFieldErrors>
  >({});
  const [lessonAutoSavingId, setLessonAutoSavingId] = useState<string | null>(null);
  const [lessonAutoMessage, setLessonAutoMessage] = useState<string | null>(null);
  const [lessonSavedDrafts, setLessonSavedDrafts] = useState<Record<string, LessonDraft>>({});
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);
  const [dragOverModuleId, setDragOverModuleId] = useState<string | null>(null);
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"module" | "lesson" | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadResponse, setUploadResponse] = useState<VideoUploadResponse | null>(null);
  const autoSaveTimer = useRef<number | null>(null);
  const lessonAutoSaveTimer = useRef<number | null>(null);
  const dragItemRef = useRef<
    | { type: "module"; moduleId: string }
    | { type: "lesson"; moduleId: string; lessonId: string }
    | null
  >(null);

  const canEditCourse =
    state.status === "ready" &&
    viewer?.role === "instructor" &&
    viewer.id === state.data.instructorId;
  const canDeleteCourse = viewer?.role === "admin";

  const updateLessonDraft = useCallback(
    (moduleId: string, updates: Partial<LessonDraft>) => {
      setLessonDrafts((prev) => ({
        ...prev,
        [moduleId]: {
          ...(prev[moduleId] ?? createLessonDraft()),
          ...updates,
        },
      }));
    },
    []
  );

  const setLessonStep = useCallback((moduleId: string, step: 1 | 2 | 3) => {
    setLessonSteps((prev) => ({ ...prev, [moduleId]: step }));
  }, []);

  const applyLessonTemplate = useCallback(
    (moduleId: string, template: "video" | "text" | "quiz") => {
      if (template === "video") {
        updateLessonDraft(moduleId, {
          type: "video",
          title: "Video lesson",
          durationMinutes: "12",
          resourceUrl: "https://",
          content: "",
        });
        setLessonStep(moduleId, 2);
        return;
      }

      if (template === "text") {
        updateLessonDraft(moduleId, {
          type: "text",
          title: "Reading lesson",
          content: "",
          durationMinutes: "8",
          resourceUrl: "",
        });
        setLessonStep(moduleId, 2);
        return;
      }

      updateLessonDraft(moduleId, {
        type: "quiz",
        title: "Quiz check-in",
        durationMinutes: "5",
        quiz: createQuizDraft(),
      });
      setLessonStep(moduleId, 3);
    },
    [setLessonStep, updateLessonDraft]
  );

  const updateModuleEditDraft = useCallback(
    (moduleId: string, updates: Partial<ModuleDraft>) => {
      setModuleEditDrafts((prev) => ({
        ...prev,
        [moduleId]: {
          ...(prev[moduleId] ?? { title: "", summary: "", order: "" }),
          ...updates,
        },
      }));
    },
    []
  );

  const updateLessonEditDraft = useCallback(
    (lessonId: string, updates: Partial<LessonDraft>) => {
      setLessonEditDrafts((prev) => ({
        ...prev,
        [lessonId]: {
          ...(prev[lessonId] ?? createLessonDraft()),
          ...updates,
        },
      }));
    },
    []
  );

  const updateQuizQuestion = useCallback(
    (moduleId: string, questionId: string, updates: Partial<LessonQuizQuestionDraft>) => {
      setLessonDrafts((prev) => {
        const current = prev[moduleId] ?? createLessonDraft();
        const nextQuestions = current.quiz.questions.map((question) =>
          question.id === questionId ? { ...question, ...updates } : question
        );
        return {
          ...prev,
          [moduleId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
        };
      });
    },
    []
  );

  const updateEditQuizQuestion = useCallback(
    (lessonId: string, questionId: string, updates: Partial<LessonQuizQuestionDraft>) => {
      setLessonEditDrafts((prev) => {
        const current = prev[lessonId] ?? createLessonDraft();
        const nextQuestions = current.quiz.questions.map((question) =>
          question.id === questionId ? { ...question, ...updates } : question
        );
        return {
          ...prev,
          [lessonId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
        };
      });
    },
    []
  );

  const updateQuizOption = useCallback(
    (
      moduleId: string,
      questionId: string,
      optionId: string,
      updates: Partial<LessonQuizOptionDraft>
    ) => {
      setLessonDrafts((prev) => {
        const current = prev[moduleId] ?? createLessonDraft();
        const nextQuestions = current.quiz.questions.map((question) => {
          if (question.id !== questionId) {
            return question;
          }

          const nextOptions = question.options.map((option) =>
            option.id === optionId ? { ...option, ...updates } : option
          );

          return { ...question, options: nextOptions };
        });

        return {
          ...prev,
          [moduleId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
        };
      });
    },
    []
  );

  const updateEditQuizOption = useCallback(
    (
      lessonId: string,
      questionId: string,
      optionId: string,
      updates: Partial<LessonQuizOptionDraft>
    ) => {
      setLessonEditDrafts((prev) => {
        const current = prev[lessonId] ?? createLessonDraft();
        const nextQuestions = current.quiz.questions.map((question) => {
          if (question.id !== questionId) {
            return question;
          }

          const nextOptions = question.options.map((option) =>
            option.id === optionId ? { ...option, ...updates } : option
          );

          return { ...question, options: nextOptions };
        });

        return {
          ...prev,
          [lessonId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
        };
      });
    },
    []
  );

  const addQuizQuestion = useCallback((moduleId: string) => {
    setLessonDrafts((prev) => {
      const current = prev[moduleId] ?? createLessonDraft();
      const newQuestion: LessonQuizQuestionDraft = {
        id: createDraftId(),
        prompt: "",
        multipleCorrect: false,
        options: [
          { id: createDraftId(), text: "", isCorrect: true },
          { id: createDraftId(), text: "", isCorrect: false },
        ],
      };
      return {
        ...prev,
        [moduleId]: {
          ...current,
          quiz: { ...current.quiz, questions: [...current.quiz.questions, newQuestion] },
        },
      };
    });
  }, []);

  const addEditQuizQuestion = useCallback((lessonId: string) => {
    setLessonEditDrafts((prev) => {
      const current = prev[lessonId] ?? createLessonDraft();
      const newQuestion: LessonQuizQuestionDraft = {
        id: createDraftId(),
        prompt: "",
        multipleCorrect: false,
        options: [
          { id: createDraftId(), text: "", isCorrect: true },
          { id: createDraftId(), text: "", isCorrect: false },
        ],
      };
      return {
        ...prev,
        [lessonId]: {
          ...current,
          quiz: { ...current.quiz, questions: [...current.quiz.questions, newQuestion] },
        },
      };
    });
  }, []);

  const removeQuizQuestion = useCallback((moduleId: string, questionId: string) => {
    setLessonDrafts((prev) => {
      const current = prev[moduleId] ?? createLessonDraft();
      const nextQuestions = current.quiz.questions.filter(
        (question) => question.id !== questionId
      );
      return {
        ...prev,
        [moduleId]: {
          ...current,
          quiz: {
            ...current.quiz,
            questions: nextQuestions.length > 0 ? nextQuestions : current.quiz.questions,
          },
        },
      };
    });
  }, []);

  const removeEditQuizQuestion = useCallback((lessonId: string, questionId: string) => {
    setLessonEditDrafts((prev) => {
      const current = prev[lessonId] ?? createLessonDraft();
      const nextQuestions = current.quiz.questions.filter(
        (question) => question.id !== questionId
      );
      return {
        ...prev,
        [lessonId]: {
          ...current,
          quiz: {
            ...current.quiz,
            questions: nextQuestions.length > 0 ? nextQuestions : current.quiz.questions,
          },
        },
      };
    });
  }, []);

  const addQuizOption = useCallback((moduleId: string, questionId: string) => {
    setLessonDrafts((prev) => {
      const current = prev[moduleId] ?? createLessonDraft();
      const nextQuestions = current.quiz.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }
        return {
          ...question,
          options: [
            ...question.options,
            { id: createDraftId(), text: "", isCorrect: false },
          ],
        };
      });
      return {
        ...prev,
        [moduleId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
      };
    });
  }, []);

  const addEditQuizOption = useCallback((lessonId: string, questionId: string) => {
    setLessonEditDrafts((prev) => {
      const current = prev[lessonId] ?? createLessonDraft();
      const nextQuestions = current.quiz.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }
        return {
          ...question,
          options: [
            ...question.options,
            { id: createDraftId(), text: "", isCorrect: false },
          ],
        };
      });
      return {
        ...prev,
        [lessonId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
      };
    });
  }, []);

  const setSingleCorrectOption = useCallback(
    (moduleId: string, questionId: string, optionId: string) => {
      setLessonDrafts((prev) => {
        const current = prev[moduleId] ?? createLessonDraft();
        const nextQuestions = current.quiz.questions.map((question) => {
          if (question.id !== questionId) {
            return question;
          }
          return {
            ...question,
            options: question.options.map((option) => ({
              ...option,
              isCorrect: option.id === optionId,
            })),
          };
        });
        return {
          ...prev,
          [moduleId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
        };
      });
    },
    []
  );

  const setEditSingleCorrectOption = useCallback(
    (lessonId: string, questionId: string, optionId: string) => {
      setLessonEditDrafts((prev) => {
        const current = prev[lessonId] ?? createLessonDraft();
        const nextQuestions = current.quiz.questions.map((question) => {
          if (question.id !== questionId) {
            return question;
          }
          return {
            ...question,
            options: question.options.map((option) => ({
              ...option,
              isCorrect: option.id === optionId,
            })),
          };
        });
        return {
          ...prev,
          [lessonId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
        };
      });
    },
    []
  );

  const removeQuizOption = useCallback(
    (moduleId: string, questionId: string, optionId: string) => {
      setLessonDrafts((prev) => {
        const current = prev[moduleId] ?? createLessonDraft();
        const nextQuestions = current.quiz.questions.map((question) => {
          if (question.id !== questionId) {
            return question;
          }
          const nextOptions = question.options.filter((option) => option.id !== optionId);
          return {
            ...question,
            options: nextOptions.length >= 2 ? nextOptions : question.options,
          };
        });
        return {
          ...prev,
          [moduleId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
        };
      });
    },
    []
  );

  const removeEditQuizOption = useCallback(
    (lessonId: string, questionId: string, optionId: string) => {
      setLessonEditDrafts((prev) => {
        const current = prev[lessonId] ?? createLessonDraft();
        const nextQuestions = current.quiz.questions.map((question) => {
          if (question.id !== questionId) {
            return question;
          }
          const nextOptions = question.options.filter((option) => option.id !== optionId);
          return {
            ...question,
            options: nextOptions.length >= 2 ? nextOptions : question.options,
          };
        });
        return {
          ...prev,
          [lessonId]: { ...current, quiz: { ...current.quiz, questions: nextQuestions } },
        };
      });
    },
    []
  );

  const startLessonEdit = useCallback((_moduleId: string, lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonEditDrafts((prev) => ({
      ...prev,
      [lesson.id]: createLessonDraftFromLesson(lesson),
    }));
    setLessonSavedDrafts((prev) => ({
      ...prev,
      [lesson.id]: createLessonDraftFromLesson(lesson),
    }));
    setLessonEditErrors((prev) => ({
      ...prev,
      [lesson.id]: {},
    }));
    setLessonEditMessage(null);
    setLessonAutoMessage(null);
  }, []);

  const startModuleEdit = useCallback((moduleItem: Module) => {
    setEditingModuleId(moduleItem.id);
    setModuleEditDrafts((prev) => ({
      ...prev,
      [moduleItem.id]: createModuleDraftFromModule(moduleItem),
    }));
    setModuleEditMessage(null);
  }, []);

  const cancelLessonEdit = useCallback(() => {
    setEditingLessonId(null);
    setLessonEditMessage(null);
    setLessonAutoMessage(null);
  }, []);

  const cancelModuleEdit = useCallback(() => {
    setEditingModuleId(null);
    setModuleEditMessage(null);
  }, []);

  const refreshCourse = useCallback(async () => {
    const result = await authGetJson<CourseDetail>(`/api/v1/courses/${courseId}`);
    if (!result.ok || !result.data) {
      setState({ status: "error", message: result.error ?? "Unable to load course." });
      return;
    }

    setState({ status: "ready", data: result.data });
    setForm({
      title: result.data.title,
      summary: result.data.summary ?? "",
      category: result.data.category ?? "",
      level: result.data.level ?? "",
    });
  }, [courseId]);

  useEffect(() => {
    let active = true;

    const loadViewer = async () => {
      const result = await authGetJson<MeResponse>("/api/v1/auth/me");
      if (!active) {
        return;
      }

      if (result.ok && result.data) {
        setViewer(result.data);
      }
    };

    loadViewer();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    refreshCourse();

    return () => {
      active = false;
    };
  }, [refreshCourse]);

  const isDirty = useMemo(() => {
    if (state.status !== "ready") {
      return false;
    }

    return (
      form.title !== state.data.title ||
      form.summary !== (state.data.summary ?? "") ||
      form.category !== (state.data.category ?? "") ||
      form.level !== (state.data.level ?? "")
    );
  }, [form, state]);

  const updateField = (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const buildPayload = useCallback((): Record<string, string> => {
    const payload: Record<string, string> = {};
    if (form.title.trim()) {
      payload.title = form.title.trim();
    }
    if (form.summary.trim()) {
      payload.summary = form.summary.trim();
    }
    if (form.category.trim()) {
      payload.category = form.category.trim();
    }
    if (form.level) {
      payload.level = form.level;
    }

    return payload;
  }, [form]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEditCourse) {
      setMessage("Only the course instructor can update this course.");
      return;
    }
    if (!isDirty) {
      setMessage("No changes to save yet.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = buildPayload();

    const result = await authPatchJson<CourseDetail>(
      `/api/v1/courses/${courseId}`,
      payload
    );

    if (!result.ok || !result.data) {
      setSaving(false);
      setMessage(result.error ?? "Unable to update course.");
      return;
    }

    setState({ status: "ready", data: result.data });
    setMessage("Course updated successfully.");
    setSaving(false);
  };

  useEffect(() => {
    if (state.status !== "ready") {
      return;
    }

    if (!isDirty || saving || statusUpdating) {
      return;
    }

    if (autoSaveTimer.current !== null) {
      window.clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = window.setTimeout(async () => {
      const payload = buildPayload();
      if (Object.keys(payload).length === 0) {
        return;
      }

      setAutoSaving(true);
      const result = await authPatchJson<CourseDetail>(
        `/api/v1/courses/${courseId}`,
        payload
      );

      if (result.ok && result.data) {
        setState({ status: "ready", data: result.data });
        setAutoMessage("Draft autosaved just now.");
      }

      setAutoSaving(false);
    }, 1200);

    return () => {
      if (autoSaveTimer.current !== null) {
        window.clearTimeout(autoSaveTimer.current);
      }
    };
  }, [buildPayload, isDirty, courseId, saving, state.status, statusUpdating]);

  useEffect(() => {
    if (state.status !== "ready" || !editingLessonId) {
      return;
    }

    if (lessonUpdating || lessonDeleting || lessonAutoSavingId) {
      return;
    }

    const draft = lessonEditDrafts[editingLessonId];
    if (!draft) {
      return;
    }

    const errors = validateLessonDraft(draft);
    setLessonEditErrors((prev) => ({
      ...prev,
      [editingLessonId]: errors,
    }));

    if (Object.values(errors).some((value) => value)) {
      return;
    }

    const lastSaved = lessonSavedDrafts[editingLessonId];
    if (lastSaved && JSON.stringify(lastSaved) === JSON.stringify(draft)) {
      return;
    }

    if (lessonAutoSaveTimer.current !== null) {
      window.clearTimeout(lessonAutoSaveTimer.current);
    }

    lessonAutoSaveTimer.current = window.setTimeout(async () => {
      const moduleId = state.data.modules.find((moduleItem) =>
        moduleItem.lessons.some((lesson) => lesson.id === editingLessonId)
      )?.id;

      if (!moduleId) {
        return;
      }

      const quizTitle = draft.quiz.title.trim();
      const passingScoreValue = Number(draft.quiz.passingScore);
      const duration = Number(draft.durationMinutes);
      const quizPayload: LessonQuiz | undefined =
        draft.type === "quiz"
          ? {
              questions: draft.quiz.questions
                .map((question) => ({
                  ...question,
                  prompt: question.prompt.trim(),
                  options: question.options
                    .map((option) => ({
                      ...option,
                      text: option.text.trim(),
                    }))
                    .filter((option) => option.text.length > 0),
                }))
                .filter((question) => question.prompt.length > 0),
              ...(quizTitle ? { title: quizTitle } : {}),
              ...(draft.quiz.passingScore.trim() && !Number.isNaN(passingScoreValue)
                ? { passingScore: passingScoreValue }
                : {}),
            }
          : undefined;

      const payload = {
        title: draft.title.trim(),
        type: draft.type,
        ...(draft.content.trim() ? { content: draft.content.trim() } : {}),
        ...(draft.resourceUrl.trim() ? { resourceUrl: draft.resourceUrl.trim() } : {}),
        ...(quizPayload ? { quiz: quizPayload } : {}),
        ...(draft.durationMinutes.trim() && !Number.isNaN(duration)
          ? { durationMinutes: duration }
          : {}),
      };

      setLessonAutoSavingId(editingLessonId);
      const result = await authPatchJson<Lesson>(
        `/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${editingLessonId}`,
        payload
      );

      if (result.ok && result.data) {
        setLessonSavedDrafts((prev) => ({ ...prev, [editingLessonId]: draft }));
        setLessonAutoMessage("Autosaved just now.");
        setState((prev) => {
          if (prev.status !== "ready") {
            return prev;
          }
          return {
            status: "ready",
            data: {
              ...prev.data,
              modules: prev.data.modules.map((moduleItem) => ({
                ...moduleItem,
                lessons: moduleItem.lessons.map((lesson) =>
                  lesson.id === editingLessonId ? result.data : lesson
                ),
              })),
            },
          };
        });
      }

      setLessonAutoSavingId(null);
    }, 1200);

    return () => {
      if (lessonAutoSaveTimer.current !== null) {
        window.clearTimeout(lessonAutoSaveTimer.current);
      }
    };
  }, [
    courseId,
    editingLessonId,
    lessonAutoSavingId,
    lessonDeleting,
    lessonEditDrafts,
    lessonSavedDrafts,
    lessonUpdating,
    state,
  ]);

  const handleStatusUpdate = async (nextStatus: "published" | "draft") => {
    if (state.status !== "ready") {
      return;
    }
    if (!canEditCourse) {
      setMessage("Only the course instructor can update this course.");
      return;
    }

    setStatusUpdating(true);
    setMessage(null);

    const endpoint = nextStatus === "published" ? "publish" : "unpublish";
    const result = await authPostJson<CourseStatusResponse>(
      `/api/v1/courses/${courseId}/${endpoint}`,
      {}
    );

    if (!result.ok || !result.data) {
      setStatusUpdating(false);
      setMessage(result.error ?? "Unable to update course visibility.");
      return;
    }

    setState({
      status: "ready",
      data: {
        ...state.data,
        status: result.data.status,
        updatedAt: result.data.updatedAt,
        title: result.data.title,
        summary: result.data.summary,
        category: result.data.category,
        level: result.data.level,
      },
    });
    setMessage(
      nextStatus === "published"
        ? "Course published successfully."
        : "Course moved back to draft."
    );
    setStatusUpdating(false);
  };

  const handleDelete = async () => {
    if (state.status !== "ready") {
      return;
    }
    if (!canDeleteCourse) {
      setMessage("Only admins can delete a course.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this course? This cannot be undone and will remove modules and lessons."
    );
    if (!confirmed) {
      return;
    }

    setStatusUpdating(true);
    setMessage(null);

    const result = await authDeleteJson<CourseDetail>(`/api/v1/courses/${courseId}`);
    if (!result.ok) {
      setStatusUpdating(false);
      setMessage(result.error ?? "Unable to delete course.");
      return;
    }

    router.push("/dashboard");
  };

  const handleCreateModule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurriculumMessage(null);

    if (!canEditCourse) {
      setCurriculumMessage("Only the course instructor can update this course.");
      return;
    }

    const moduleTitle = moduleForm.title.trim();
    if (!moduleTitle) {
      setCurriculumMessage("Module title is required.");
      return;
    }

    if (moduleTitle.length < 3) {
      setCurriculumMessage("Module title must be at least 3 characters.");
      return;
    }

    setModuleSaving(true);
    const payload = {
      title: moduleTitle,
      ...(moduleForm.summary.trim() ? { summary: moduleForm.summary.trim() } : {}),
    };

    const result = await authPostJson<Module>(
      `/api/v1/courses/${courseId}/modules`,
      payload
    );

    if (!result.ok || !result.data) {
      setModuleSaving(false);
      setCurriculumMessage(result.error ?? "Unable to add module.");
      return;
    }

    setModuleForm({ title: "", summary: "" });
    setModuleSaving(false);
    setCurriculumMessage("Module added.");
    await refreshCourse();
  };

  const handleUpdateModule = async (moduleItem: Module) => {
    if (!canEditCourse) {
      setModuleEditMessage("Only the course instructor can update this module.");
      return;
    }

    const draft = moduleEditDrafts[moduleItem.id] ?? createModuleDraftFromModule(moduleItem);
    const title = draft.title.trim();

    if (!title) {
      setModuleEditMessage("Module title is required.");
      return;
    }

    if (title.length < 3) {
      setModuleEditMessage("Module title must be at least 3 characters.");
      return;
    }

    const orderValue = Number(draft.order);
    const payload = {
      title,
      ...(draft.summary.trim() ? { summary: draft.summary.trim() } : {}),
      ...(draft.order.trim() && !Number.isNaN(orderValue)
        ? { order: orderValue }
        : {}),
    };

    setModuleUpdating(moduleItem.id);
    setModuleEditMessage(null);
    const result = await authPatchJson<Module>(
      `/api/v1/courses/${courseId}/modules/${moduleItem.id}`,
      payload
    );

    if (!result.ok || !result.data) {
      setModuleUpdating(null);
      setModuleEditMessage(result.error ?? "Unable to update module.");
      return;
    }

    setModuleUpdating(null);
    setModuleEditMessage("Module updated.");
    await refreshCourse();
    cancelModuleEdit();
  };

  const handleCreateLesson = async (moduleId: string) => {
    if (!canEditCourse) {
      setCurriculumMessage("Only the course instructor can update this course.");
      return;
    }
    const draft = lessonDrafts[moduleId] ?? createLessonDraft();

    const lessonTitle = draft.title.trim();
    if (!lessonTitle) {
      setCurriculumMessage("Lesson title is required.");
      return;
    }

    if (lessonTitle.length < 3) {
      setCurriculumMessage("Lesson title must be at least 3 characters.");
      return;
    }

    if (draft.type === "text" && !draft.content.trim()) {
      setCurriculumMessage("Text lessons need content.");
      return;
    }

    if (draft.type !== "text" && draft.type !== "quiz" && !draft.resourceUrl.trim()) {
      setCurriculumMessage("Add a resource URL for this lesson type.");
      return;
    }

    if (draft.type === "quiz") {
      const quizTitle = draft.quiz.title.trim();
      const passingScoreValue = Number(draft.quiz.passingScore);
      const questions = draft.quiz.questions
        .map((question) => {
          const options = question.options
            .map((option) => ({
              ...option,
              text: option.text.trim(),
            }))
            .filter((option) => option.text.length > 0);

          return {
            ...question,
            prompt: question.prompt.trim(),
            options,
          };
        })
        .filter((question) => question.prompt.length > 0 && question.options.length >= 2);

      if (questions.length === 0) {
        setCurriculumMessage("Add at least one quiz question with two options.");
        return;
      }

      for (const question of questions) {
        const correctCount = question.options.filter((option) => option.isCorrect).length;
        if (correctCount === 0) {
          setCurriculumMessage("Each quiz question needs a correct answer.");
          return;
        }
      }

      const quizPayload: LessonQuiz = {
        questions,
        ...(quizTitle ? { title: quizTitle } : {}),
        ...(draft.quiz.passingScore.trim() && !Number.isNaN(passingScoreValue)
          ? { passingScore: passingScoreValue }
          : {}),
      };

      const duration = Number(draft.durationMinutes);
      const payload = {
        title: lessonTitle,
        type: draft.type,
        quiz: quizPayload,
        ...(draft.durationMinutes.trim() && !Number.isNaN(duration)
          ? { durationMinutes: duration }
          : {}),
      };

      setLessonSaving(moduleId);
      setCurriculumMessage(null);
      const result = await authPostJson<Lesson>(
        `/api/v1/courses/${courseId}/modules/${moduleId}/lessons`,
        payload
      );

      if (!result.ok || !result.data) {
        setLessonSaving(null);
        setCurriculumMessage(result.error ?? "Unable to add lesson.");
        return;
      }

      setLessonDrafts((prev) => ({
        ...prev,
        [moduleId]: createLessonDraft(),
      }));
      setLessonSaving(null);
      setCurriculumMessage("Lesson added.");
      await refreshCourse();
      return;
    }

    const duration = Number(draft.durationMinutes);
    const payload = {
      title: lessonTitle,
      type: draft.type,
      ...(draft.content.trim() ? { content: draft.content.trim() } : {}),
      ...(draft.resourceUrl.trim() ? { resourceUrl: draft.resourceUrl.trim() } : {}),
      ...(draft.durationMinutes.trim() && !Number.isNaN(duration)
        ? { durationMinutes: duration }
        : {}),
    };

    setLessonSaving(moduleId);
    setCurriculumMessage(null);
    const result = await authPostJson<Lesson>(
      `/api/v1/courses/${courseId}/modules/${moduleId}/lessons`,
      payload
    );

    if (!result.ok || !result.data) {
      setLessonSaving(null);
      setCurriculumMessage(result.error ?? "Unable to add lesson.");
      return;
    }

    setLessonDrafts((prev) => ({
      ...prev,
      [moduleId]: createLessonDraft(),
    }));
    setLessonSaving(null);
    setCurriculumMessage("Lesson added.");
    await refreshCourse();
  };

  const handleUpdateLesson = async (moduleId: string, lesson: Lesson) => {
    if (!canEditCourse) {
      setLessonEditMessage("Only the course instructor can update this lesson.");
      return;
    }

    const draft = lessonEditDrafts[lesson.id] ?? createLessonDraftFromLesson(lesson);
    const errors = validateLessonDraft(draft);
    setLessonEditErrors((prev) => ({
      ...prev,
      [lesson.id]: errors,
    }));

    if (Object.values(errors).some((value) => value)) {
      setLessonEditMessage("Fix the highlighted fields before saving.");
      return;
    }

    const lessonTitle = draft.title.trim();

    const duration = Number(draft.durationMinutes);

    if (draft.type === "quiz") {
      const quizTitle = draft.quiz.title.trim();
      const passingScoreValue = Number(draft.quiz.passingScore);
      const questions = draft.quiz.questions
        .map((question) => ({
          ...question,
          prompt: question.prompt.trim(),
          options: question.options
            .map((option) => ({
              ...option,
              text: option.text.trim(),
            }))
            .filter((option) => option.text.length > 0),
        }))
        .filter((question) => question.prompt.length > 0);

      const quizPayload: LessonQuiz = {
        questions,
        ...(quizTitle ? { title: quizTitle } : {}),
        ...(draft.quiz.passingScore.trim() && !Number.isNaN(passingScoreValue)
          ? { passingScore: passingScoreValue }
          : {}),
      };

      const payload = {
        title: lessonTitle,
        type: draft.type,
        quiz: quizPayload,
        ...(draft.durationMinutes.trim() && !Number.isNaN(duration)
          ? { durationMinutes: duration }
          : {}),
      };

      setLessonUpdating(lesson.id);
      setLessonEditMessage(null);
      const result = await authPatchJson<Lesson>(
        `/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`,
        payload
      );

      if (!result.ok || !result.data) {
        setLessonUpdating(null);
        setLessonEditMessage(result.error ?? "Unable to update lesson.");
        return;
      }

      setLessonUpdating(null);
      setLessonEditMessage("Lesson updated.");
      await refreshCourse();
      cancelLessonEdit();
      return;
    }

    const payload = {
      title: lessonTitle,
      type: draft.type,
      ...(draft.content.trim() ? { content: draft.content.trim() } : {}),
      ...(draft.resourceUrl.trim() ? { resourceUrl: draft.resourceUrl.trim() } : {}),
      ...(draft.durationMinutes.trim() && !Number.isNaN(duration)
        ? { durationMinutes: duration }
        : {}),
    };

    setLessonUpdating(lesson.id);
    setLessonEditMessage(null);
    const result = await authPatchJson<Lesson>(
      `/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`,
      payload
    );

    if (!result.ok || !result.data) {
      setLessonUpdating(null);
      setLessonEditMessage(result.error ?? "Unable to update lesson.");
      return;
    }

    setLessonUpdating(null);
    setLessonEditMessage("Lesson updated.");
    await refreshCourse();
    cancelLessonEdit();
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!canEditCourse) {
      setLessonEditMessage("Only the course instructor can delete this lesson.");
      return;
    }

    const confirmed = window.confirm("Delete this lesson? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setLessonDeleting(lessonId);
    setLessonEditMessage(null);
    const result = await authDeleteJson<{ deleted: boolean }>(
      `/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`
    );

    if (!result.ok) {
      setLessonDeleting(null);
      setLessonEditMessage(result.error ?? "Unable to delete lesson.");
      return;
    }

    setLessonDeleting(null);
    if (editingLessonId === lessonId) {
      cancelLessonEdit();
    }
    await refreshCourse();
  };

  const handleModuleDragStart = (moduleId: string) => {
    dragItemRef.current = { type: "module", moduleId };
    setReorderMessage("Drop on another module to reorder.");
    setIsDragging(true);
    setDragType("module");
  };

  const handleLessonDragStart = (moduleId: string, lessonId: string) => {
    dragItemRef.current = { type: "lesson", moduleId, lessonId };
    setReorderMessage("Drop on another lesson to reorder inside this module.");
    setIsDragging(true);
    setDragType("lesson");
  };

  const handleModuleDrop = async (targetModuleId: string) => {
    if (state.status !== "ready" || !canEditCourse) {
      return;
    }

    const dragItem = dragItemRef.current;
    if (!dragItem || dragItem.type !== "module" || dragItem.moduleId === targetModuleId) {
      return;
    }

    setDragOverModuleId(null);
    setIsDragging(false);
    setDragType(null);

    const currentModules = state.data.modules.slice();
    const fromIndex = currentModules.findIndex((moduleItem) => moduleItem.id === dragItem.moduleId);
    const toIndex = currentModules.findIndex((moduleItem) => moduleItem.id === targetModuleId);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const [moved] = currentModules.splice(fromIndex, 1);
    currentModules.splice(toIndex, 0, moved);
    const reordered = currentModules.map((moduleItem, index) => ({
      ...moduleItem,
      order: index + 1,
    }));

    setState({ status: "ready", data: { ...state.data, modules: reordered } });
    setReorderMessage("Module order updated.");

    await Promise.all(
      reordered.map((moduleItem) =>
        authPatchJson<Module>(`/api/v1/courses/${courseId}/modules/${moduleItem.id}`, {
          order: moduleItem.order,
        })
      )
    );
  };

  const handleLessonDrop = async (moduleId: string, targetLessonId: string) => {
    if (state.status !== "ready" || !canEditCourse) {
      return;
    }

    const dragItem = dragItemRef.current;
    if (!dragItem || dragItem.type !== "lesson") {
      return;
    }

    if (dragItem.moduleId !== moduleId || dragItem.lessonId === targetLessonId) {
      return;
    }

    setDragOverLessonId(null);
    setIsDragging(false);
    setDragType(null);

    const moduleItem = state.data.modules.find((moduleEntry) => moduleEntry.id === moduleId);
    if (!moduleItem) {
      return;
    }

    const lessons = moduleItem.lessons.slice();
    const fromIndex = lessons.findIndex((lesson) => lesson.id === dragItem.lessonId);
    const toIndex = lessons.findIndex((lesson) => lesson.id === targetLessonId);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const [moved] = lessons.splice(fromIndex, 1);
    lessons.splice(toIndex, 0, moved);
    const reorderedLessons = lessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));

    setState({
      status: "ready",
      data: {
        ...state.data,
        modules: state.data.modules.map((entry) =>
          entry.id === moduleId ? { ...entry, lessons: reorderedLessons } : entry
        ),
      },
    });
    setReorderMessage("Lesson order updated.");

    await Promise.all(
      reorderedLessons.map((lesson) =>
        authPatchJson<Lesson>(
          `/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`,
          buildLessonUpdatePayload(lesson)
        )
      )
    );
  };

  const handleVideoUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEditCourse) {
      setUploadMessage("Only the course instructor can upload videos.");
      return;
    }
    setUploadMessage(null);
    setUploadResponse(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("video") as File | null;

    if (!file) {
      setUploadMessage("Please select a video file.");
      return;
    }

    if (!file.type.startsWith("video/")) {
      setUploadMessage("Unsupported file format. Use MP4 or WebM.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadMessage("File is too large. Max size is 50MB.");
      return;
    }

    const result = await authPostJson<VideoUploadResponse>("/api/v1/videos/upload-url", {
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });

    if (!result.ok || !result.data) {
      setUploadMessage(result.error ?? "Unable to create upload URL.");
      return;
    }

    setUploadResponse(result.data);
    setUploadMessage("Upload URL generated. Use it to upload your video.");
  };

  return (
    <AuthGuard>
      <PageShell maxWidth="max-w-none" className="gap-8">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3">
            <SectionHeading
              eyebrow="Instructor studio"
              title="Build the learning experience"
              description="Design modules, lessons, and interactive checks in one view."
            />
            {state.status === "ready" && (
              <div className="flex flex-wrap items-center gap-2">
                <Pill label={state.data.status} tone={state.data.status === "published" ? "success" : "warning"} />
                <Pill label={`Updated ${new Date(state.data.updatedAt).toLocaleDateString()}`} />
              </div>
            )}
          </div>
          <Link
            className="rounded-full border border-slate-900/10 bg-white px-5 py-2 text-sm font-semibold text-slate-900"
            href={`/courses/${courseId}`}
          >
            Back to course
          </Link>
        </header>

        {state.status === "loading" && (
          <GlassCard className="text-sm text-slate-600">Loading course...</GlassCard>
        )}

        {state.status === "error" && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
            {state.message}
          </div>
        )}

        {state.status === "ready" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)]">
            <main className="grid gap-6">
              <GlassCard>
                <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <label className="grid gap-2 text-sm text-slate-700">
                  Course title
                  <input
                    className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                    value={form.title}
                    onChange={updateField("title")}
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm text-slate-700">
                  Summary
                  <textarea
                    className="min-h-[120px] rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm"
                    value={form.summary}
                    onChange={updateField("summary")}
                  />
                </label>

                <label className="grid gap-2 text-sm text-slate-700">
                  Category
                  <input
                    className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                    value={form.category}
                    onChange={updateField("category")}
                  />
                </label>

                <label className="grid gap-2 text-sm text-slate-700">
                  Level
                  <select
                    className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                    value={form.level}
                    onChange={updateField("level")}
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>

                {message && <p className="text-sm text-slate-600">{message}</p>}
                {autoMessage && (
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {autoSaving ? "Saving draft..." : autoMessage}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving || !canEditCourse}
                    className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  {canDeleteCourse && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={statusUpdating}
                      className="h-11 rounded-full border border-rose-200 bg-rose-50 px-6 text-sm font-semibold text-rose-700 transition hover:border-rose-300 disabled:opacity-60"
                    >
                      Delete course
                    </button>
                  )}
                </div>
              </div>
                </form>
              </GlassCard>

              <GlassCard>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Curriculum</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Modules and lessons
                </h2>
                <p className="text-sm text-slate-600">
                  Build out the course structure for learners.
                </p>
                {canEditCourse && (
                  <p className="text-xs text-slate-500">
                    Drag modules or lessons to reorder. Drop on the card where you want it placed.
                  </p>
                )}
                {!canEditCourse && (
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-600">
                    Editing locked: only the course instructor can make changes.
                  </p>
                )}
              </div>

              <form onSubmit={handleCreateModule} className="mt-6 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-slate-700">
                    Module title
                    <input
                      className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                      value={moduleForm.title}
                      onChange={(event) =>
                        setModuleForm((prev) => ({ ...prev, title: event.target.value }))
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-slate-700">
                    Module summary
                    <input
                      className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                      value={moduleForm.summary}
                      onChange={(event) =>
                        setModuleForm((prev) => ({ ...prev, summary: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={moduleSaving || !canEditCourse}
                    className="h-10 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {moduleSaving ? "Adding..." : "Add module"}
                  </button>
                  {curriculumMessage && (
                    <span className="text-sm text-slate-600">{curriculumMessage}</span>
                  )}
                  {reorderMessage && (
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {reorderMessage}
                    </span>
                  )}
                </div>
              </form>

                <div className="mt-6 grid gap-4">
                {state.data.modules.length === 0 ? (
                  <p className="text-sm text-slate-600">No modules yet.</p>
                ) : (
                  state.data.modules.map((moduleItem) => {
                    const lessonDraft = lessonDrafts[moduleItem.id] ?? createLessonDraft();
                    const activeStep = lessonSteps[moduleItem.id] ?? 1;
                    const isModuleDragOver = dragOverModuleId === moduleItem.id;

                    return (
                        <div
                          key={moduleItem.id}
                          className={`rounded-3xl border bg-white/80 p-6 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.2)] ${
                            isModuleDragOver ? "border-slate-900/30" : "border-slate-900/10"
                          } ${isDragging ? "transition-none" : ""}`}
                          onDragOver={(event) => {
                            if (dragType !== "module") {
                              return;
                            }
                            event.preventDefault();
                            setDragOverModuleId(moduleItem.id);
                          }}
                          onDragLeave={() => setDragOverModuleId(null)}
                          onDrop={() => handleModuleDrop(moduleItem.id)}
                        >
                          {isModuleDragOver && (
                            <div className="mb-4 rounded-2xl border border-dashed border-slate-900/20 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                              Drop here to move this module.
                            </div>
                          )}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Module {moduleItem.order}
                              </p>
                            <h3 className="mt-1 text-lg font-semibold text-slate-900">
                              {moduleItem.title}
                            </h3>
                            {moduleItem.summary && (
                              <p className="mt-1 text-sm text-slate-600">
                                {moduleItem.summary}
                              </p>
                            )}
                          </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                {moduleItem.lessonCount} lessons
                              </span>
                              {canEditCourse && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    draggable
                                    onDragStart={() => handleModuleDragStart(moduleItem.id)}
                                    onDragEnd={() => {
                                      setIsDragging(false);
                                      setDragType(null);
                                    }}
                                    className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500"
                                  >
                                    Drag
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => startModuleEdit(moduleItem)}
                                    className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                                  >
                                    {editingModuleId === moduleItem.id ? "Editing" : "Edit module"}
                                  </button>
                                </div>
                              )}
                            </div>
                        </div>

                          {editingModuleId === moduleItem.id && (
                            <div className="mt-4 grid gap-3 rounded-2xl border border-slate-900/10 bg-slate-50/80 p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <label className="grid gap-2 text-sm text-slate-700">
                                  Module title
                                  <input
                                    className="h-10 rounded-xl border border-slate-900/10 bg-white px-4 text-sm normal-case"
                                    value={(moduleEditDrafts[moduleItem.id] ?? createModuleDraftFromModule(moduleItem)).title}
                                    onChange={(event) =>
                                      updateModuleEditDraft(moduleItem.id, {
                                        title: event.target.value,
                                      })
                                    }
                                  />
                                </label>
                                <label className="grid gap-2 text-sm text-slate-700">
                                  Order
                                  <input
                                    className="h-10 rounded-xl border border-slate-900/10 bg-white px-4 text-sm normal-case"
                                    value={(moduleEditDrafts[moduleItem.id] ?? createModuleDraftFromModule(moduleItem)).order}
                                    onChange={(event) =>
                                      updateModuleEditDraft(moduleItem.id, {
                                        order: event.target.value,
                                      })
                                    }
                                  />
                                </label>
                              </div>
                              <label className="grid gap-2 text-sm text-slate-700">
                                Module summary
                                <input
                                  className="h-10 rounded-xl border border-slate-900/10 bg-white px-4 text-sm normal-case"
                                  value={(moduleEditDrafts[moduleItem.id] ?? createModuleDraftFromModule(moduleItem)).summary}
                                  onChange={(event) =>
                                    updateModuleEditDraft(moduleItem.id, {
                                      summary: event.target.value,
                                    })
                                  }
                                />
                              </label>
                              {moduleEditMessage && (
                                <p className="text-sm text-slate-600">{moduleEditMessage}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-3">
                                <button
                                  type="button"
                                  disabled={moduleUpdating === moduleItem.id || !canEditCourse}
                                  onClick={() => handleUpdateModule(moduleItem)}
                                  className="h-10 rounded-full bg-slate-900 px-5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                                >
                                  {moduleUpdating === moduleItem.id ? "Saving..." : "Save module"}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelModuleEdit}
                                  className="h-10 rounded-full border border-slate-900/15 bg-white px-5 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                        <div className="mt-5 grid gap-3">
                          {moduleItem.lessons.length === 0 ? (
                            <p className="text-sm text-slate-600">
                              No lessons yet.
                            </p>
                          ) : (
                            moduleItem.lessons.map((lesson) => {
                              const isEditing = editingLessonId === lesson.id;
                              const editDraft =
                                lessonEditDrafts[lesson.id] ?? createLessonDraftFromLesson(lesson);
                              const displayTitle =
                                isEditing && editDraft.title.trim() ? editDraft.title : lesson.title;
                              const displayType = isEditing ? editDraft.type : lesson.type;
                              const displayDuration =
                                isEditing && editDraft.durationMinutes.trim()
                                  ? Number(editDraft.durationMinutes)
                                  : lesson.durationMinutes;
                              const fieldErrors = lessonEditErrors[lesson.id] ?? {};
                              const isLessonDragOver = dragOverLessonId === lesson.id;

                              return (
                                <div
                                  key={lesson.id}
                                  className={`rounded-2xl border bg-white px-4 py-3 text-sm ${
                                    isLessonDragOver ? "border-slate-900/30" : "border-slate-900/10"
                                  } ${isDragging ? "transition-none" : ""}`}
                                  onDragOver={(event) => {
                                    if (dragType !== "lesson") {
                                      return;
                                    }
                                    event.preventDefault();
                                    setDragOverLessonId(lesson.id);
                                  }}
                                  onDragLeave={() => setDragOverLessonId(null)}
                                  onDrop={() => handleLessonDrop(moduleItem.id, lesson.id)}
                                >
                                  {isLessonDragOver && (
                                    <div className="mb-3 rounded-2xl border border-dashed border-slate-900/20 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                                      Drop to reorder lessons here.
                                    </div>
                                  )}
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                        Lesson {lesson.order}
                                      </p>
                                      <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-slate-900">{displayTitle}</p>
                                        <span className="rounded-full border border-slate-900/10 bg-slate-50 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                          {lessonTypeCopy[displayType].label}
                                        </span>
                                      </div>
                                      {displayType === "quiz" && (
                                        <p className="mt-1 text-xs text-slate-500">
                                          Quiz with {lesson.quiz?.questions.length ?? 0} questions
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      {displayDuration !== undefined && !Number.isNaN(displayDuration) && (
                                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                          {displayDuration} min
                                        </span>
                                      )}
                                      {canEditCourse && (
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            draggable
                                            onDragStart={() => handleLessonDragStart(moduleItem.id, lesson.id)}
                                            onDragEnd={() => {
                                              setIsDragging(false);
                                              setDragType(null);
                                            }}
                                            className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500"
                                          >
                                            Drag
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => startLessonEdit(moduleItem.id, lesson)}
                                            className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                                          >
                                            {isEditing ? "Editing" : "Edit lesson"}
                                          </button>
                                          <button
                                            type="button"
                                            disabled={lessonDeleting === lesson.id}
                                            onClick={() => handleDeleteLesson(moduleItem.id, lesson.id)}
                                            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 disabled:opacity-60"
                                          >
                                            {lessonDeleting === lesson.id ? "Deleting..." : "Delete"}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {isEditing && (
                                    <div className="mt-4 grid gap-4 rounded-2xl border border-slate-900/10 bg-slate-50/80 p-4">
                                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                                        <div className="grid gap-3">
                                          <label className="grid gap-2 text-sm text-slate-700">
                                            Lesson title
                                            <input
                                              className={`h-10 rounded-xl border bg-white px-4 text-sm normal-case ${
                                                fieldErrors.title
                                                  ? "border-rose-300"
                                                  : "border-slate-900/10"
                                              }`}
                                              value={editDraft.title}
                                              onChange={(event) =>
                                                updateLessonEditDraft(lesson.id, {
                                                  title: event.target.value,
                                                })
                                              }
                                            />
                                            {fieldErrors.title && (
                                              <span className="text-xs text-rose-600 normal-case">
                                                {fieldErrors.title}
                                              </span>
                                            )}
                                          </label>
                                          <label className="grid gap-2 text-sm text-slate-700">
                                            Lesson type
                                            <select
                                              className="h-10 rounded-xl border border-slate-900/10 bg-white px-4 text-sm normal-case"
                                              value={editDraft.type}
                                              onChange={(event) =>
                                                updateLessonEditDraft(lesson.id, {
                                                  type: event.target.value as LessonType,
                                                })
                                              }
                                            >
                                              {Object.entries(lessonTypeCopy).map(([value, meta]) => (
                                                <option key={value} value={value}>
                                                  {meta.label}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                          <label className="grid gap-2 text-sm text-slate-700">
                                            Duration (minutes)
                                            <input
                                              className={`h-10 rounded-xl border bg-white px-4 text-sm normal-case ${
                                                fieldErrors.durationMinutes
                                                  ? "border-rose-300"
                                                  : "border-slate-900/10"
                                              }`}
                                              value={editDraft.durationMinutes}
                                              onChange={(event) =>
                                                updateLessonEditDraft(lesson.id, {
                                                  durationMinutes: event.target.value,
                                                })
                                              }
                                            />
                                            {fieldErrors.durationMinutes && (
                                              <span className="text-xs text-rose-600 normal-case">
                                                {fieldErrors.durationMinutes}
                                              </span>
                                            )}
                                          </label>
                                          <p className="text-xs text-slate-500">
                                            {lessonTypeCopy[editDraft.type].helper}
                                          </p>
                                        </div>

                                        <div className="grid gap-3">
                                          {editDraft.type !== "quiz" && editDraft.type !== "text" && (
                                            <label className="grid gap-2 text-sm text-slate-700">
                                              Resource URL
                                              <input
                                                className={`h-10 rounded-xl border bg-white px-4 text-sm normal-case ${
                                                  fieldErrors.resourceUrl
                                                    ? "border-rose-300"
                                                    : "border-slate-900/10"
                                                }`}
                                                placeholder="https://"
                                                value={editDraft.resourceUrl}
                                                onChange={(event) =>
                                                  updateLessonEditDraft(lesson.id, {
                                                    resourceUrl: event.target.value,
                                                  })
                                                }
                                              />
                                              {fieldErrors.resourceUrl && (
                                                <span className="text-xs text-rose-600 normal-case">
                                                  {fieldErrors.resourceUrl}
                                                </span>
                                              )}
                                            </label>
                                          )}

                                          {editDraft.type === "text" && (
                                            <label className="grid gap-2 text-sm text-slate-700">
                                              Lesson content
                                              <textarea
                                                className={`min-h-[120px] rounded-xl border bg-white px-4 py-3 text-sm normal-case ${
                                                  fieldErrors.content
                                                    ? "border-rose-300"
                                                    : "border-slate-900/10"
                                                }`}
                                                value={editDraft.content}
                                                onChange={(event) =>
                                                  updateLessonEditDraft(lesson.id, {
                                                    content: event.target.value,
                                                  })
                                                }
                                              />
                                              {fieldErrors.content && (
                                                <span className="text-xs text-rose-600 normal-case">
                                                  {fieldErrors.content}
                                                </span>
                                              )}
                                            </label>
                                          )}

                                          {editDraft.type !== "quiz" && editDraft.type !== "text" && (
                                            <label className="grid gap-2 text-sm text-slate-700">
                                              Notes (optional)
                                              <textarea
                                                className="min-h-[120px] rounded-xl border border-slate-900/10 bg-white px-4 py-3 text-sm normal-case"
                                                value={editDraft.content}
                                                onChange={(event) =>
                                                  updateLessonEditDraft(lesson.id, {
                                                    content: event.target.value,
                                                  })
                                                }
                                              />
                                            </label>
                                          )}
                                        </div>
                                      </div>

                                      {editDraft.type === "quiz" && (
                                        <div className="mt-2 grid gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                                          <div className="grid gap-3 md:grid-cols-2">
                                            <label className="grid gap-2 text-sm text-amber-700">
                                              Quiz title
                                              <input
                                                className="h-10 rounded-xl border border-amber-200 bg-white px-4 text-sm normal-case"
                                                value={editDraft.quiz.title}
                                                onChange={(event) =>
                                                  updateLessonEditDraft(lesson.id, {
                                                    quiz: {
                                                      ...editDraft.quiz,
                                                      title: event.target.value,
                                                    },
                                                  })
                                                }
                                              />
                                            </label>
                                            <label className="grid gap-2 text-sm text-amber-700">
                                              Passing score (%)
                                              <input
                                                className="h-10 rounded-xl border border-amber-200 bg-white px-4 text-sm normal-case"
                                                value={editDraft.quiz.passingScore}
                                                onChange={(event) =>
                                                  updateLessonEditDraft(lesson.id, {
                                                    quiz: {
                                                      ...editDraft.quiz,
                                                      passingScore: event.target.value,
                                                    },
                                                  })
                                                }
                                              />
                                            </label>
                                          </div>

                                          <div className="grid gap-4">
                                            {editDraft.quiz.questions.map((question, questionIndex) => (
                                              <div
                                                key={question.id}
                                                className="rounded-xl border border-amber-200/60 bg-white p-4"
                                              >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                  <p className="text-xs uppercase tracking-[0.2em] text-amber-700">
                                                    Question {questionIndex + 1}
                                                  </p>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      removeEditQuizQuestion(lesson.id, question.id)
                                                    }
                                                    className="text-xs font-semibold text-amber-700"
                                                  >
                                                    Remove
                                                  </button>
                                                </div>
                                                <input
                                                  className="mt-2 h-10 w-full rounded-xl border border-amber-200 bg-white px-4 text-sm"
                                                  value={question.prompt}
                                                  onChange={(event) =>
                                                    updateEditQuizQuestion(lesson.id, question.id, {
                                                      prompt: event.target.value,
                                                    })
                                                  }
                                                />
                                                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                                                  <input
                                                    type="checkbox"
                                                    checked={question.multipleCorrect}
                                                    onChange={(event) =>
                                                      updateEditQuizQuestion(lesson.id, question.id, {
                                                        multipleCorrect: event.target.checked,
                                                      })
                                                    }
                                                  />
                                                  Allow multiple correct answers
                                                </div>

                                                <div className="mt-3 grid gap-2">
                                                  {question.options.map((option, optionIndex) => (
                                                    <div key={option.id} className="flex flex-wrap items-center gap-2">
                                                      <input
                                                        type={question.multipleCorrect ? "checkbox" : "radio"}
                                                        name={`edit-question-${question.id}`}
                                                        checked={option.isCorrect}
                                                        onChange={() => {
                                                          if (!question.multipleCorrect) {
                                                            setEditSingleCorrectOption(
                                                              lesson.id,
                                                              question.id,
                                                              option.id
                                                            );
                                                            return;
                                                          }

                                                          updateEditQuizOption(
                                                            lesson.id,
                                                            question.id,
                                                            option.id,
                                                            { isCorrect: !option.isCorrect }
                                                          );
                                                        }}
                                                      />
                                                      <input
                                                        className="h-10 flex-1 rounded-xl border border-amber-200 bg-white px-3 text-sm"
                                                        value={option.text}
                                                        onChange={(event) =>
                                                          updateEditQuizOption(
                                                            lesson.id,
                                                            question.id,
                                                            option.id,
                                                            { text: event.target.value }
                                                          )
                                                        }
                                                      />
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          removeEditQuizOption(
                                                            lesson.id,
                                                            question.id,
                                                            option.id
                                                          )
                                                        }
                                                        className="text-xs font-semibold text-amber-700"
                                                      >
                                                        Remove
                                                      </button>
                                                    </div>
                                                  ))}
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => addEditQuizOption(lesson.id, question.id)}
                                                  className="mt-3 text-xs font-semibold text-amber-700"
                                                >
                                                  Add option
                                                </button>
                                              </div>
                                            ))}
                                            <button
                                              type="button"
                                              onClick={() => addEditQuizQuestion(lesson.id)}
                                              className="text-xs font-semibold text-amber-700"
                                            >
                                              Add question
                                            </button>
                                            {fieldErrors.quiz && (
                                              <p className="text-xs text-rose-600 normal-case">
                                                {fieldErrors.quiz}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {lessonEditMessage && (
                                        <p className="text-sm text-slate-600">{lessonEditMessage}</p>
                                      )}
                                      {lessonAutoMessage && isEditing && (
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                          {lessonAutoSavingId === lesson.id
                                            ? "Autosaving..."
                                            : lessonAutoMessage}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap items-center gap-3">
                                        <button
                                          type="button"
                                          disabled={lessonUpdating === lesson.id || !canEditCourse}
                                          onClick={() => handleUpdateLesson(moduleItem.id, lesson)}
                                          className="h-10 rounded-full bg-slate-900 px-5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                                        >
                                          {lessonUpdating === lesson.id ? "Saving..." : "Save lesson"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={cancelLessonEdit}
                                          className="h-10 rounded-full border border-slate-900/15 bg-white px-5 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                          <div className="mt-6 grid gap-4 rounded-2xl border border-slate-900/10 bg-slate-50/80 p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">Add lesson</p>
                            <p className="text-xs text-slate-500">
                              Pick a format and fill the details. You can edit later.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => applyLessonTemplate(moduleItem.id, "video")}
                              className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              Video lesson preset
                            </button>
                            <button
                              type="button"
                              onClick={() => applyLessonTemplate(moduleItem.id, "text")}
                              className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              Reading preset
                            </button>
                            <button
                              type="button"
                              onClick={() => applyLessonTemplate(moduleItem.id, "quiz")}
                              className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              Quiz check-in
                            </button>
                          </div>
                          <div className="grid gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step</p>
                              <div className="flex items-center gap-2">
                                {([
                                  { id: 1, label: "Type" },
                                  { id: 2, label: "Details" },
                                  { id: 3, label: "Quiz" },
                                ] as const).map((step) => {
                                  const activeStep = lessonSteps[moduleItem.id] ?? 1;
                                  const isActive = activeStep === step.id;
                                  const isDisabled = step.id === 3 && (lessonDraft.type !== "quiz");
                                  return (
                                    <button
                                      key={step.id}
                                      type="button"
                                      disabled={isDisabled}
                                      onClick={() => setLessonStep(moduleItem.id, step.id)}
                                      className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] transition ${
                                        isActive
                                          ? "bg-slate-900 text-white"
                                          : "border border-slate-900/10 bg-white text-slate-500"
                                      } ${isDisabled ? "opacity-40" : ""}`}
                                    >
                                      {step.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                            {(lessonSteps[moduleItem.id] ?? 1) === 1 && (
                              <div className="grid gap-3">
                                <label className="grid gap-2 text-sm text-slate-700">
                                  Lesson type
                                  <select
                                    className="h-10 rounded-xl border border-slate-900/10 bg-white px-4 text-sm normal-case"
                                    value={lessonDraft.type}
                                    onChange={(event) => {
                                      const nextType = event.target.value as LessonType;
                                      updateLessonDraft(moduleItem.id, { type: nextType });
                                        if (nextType !== "quiz" && activeStep === 3) {
                                          setLessonStep(moduleItem.id, 2);
                                        }
                                    }}
                                  >
                                    {Object.entries(lessonTypeCopy).map(([value, meta]) => (
                                      <option key={value} value={value}>
                                        {meta.label}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label className="grid gap-2 text-sm text-slate-700">
                                  Lesson title
                                  <input
                                    className="h-10 rounded-xl border border-slate-900/10 bg-white px-4 text-sm normal-case"
                                    placeholder="Lesson title"
                                    value={lessonDraft.title}
                                    onChange={(event) =>
                                      updateLessonDraft(moduleItem.id, { title: event.target.value })
                                    }
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setLessonStep(moduleItem.id, 2)}
                                  className="mt-2 h-10 rounded-full bg-slate-900 px-5 text-xs font-semibold text-white"
                                >
                                  Continue to details
                                </button>
                              </div>
                            )}

                            {(lessonSteps[moduleItem.id] ?? 1) === 2 && (
                              <>
                                <div className="grid gap-3">
                                  <label className="grid gap-2 text-sm text-slate-700">
                                    Lesson title
                                    <input
                                      className="h-10 rounded-xl border border-slate-900/10 bg-white px-4 text-sm normal-case"
                                      placeholder="Lesson title"
                                      value={lessonDraft.title}
                                      onChange={(event) =>
                                        updateLessonDraft(moduleItem.id, { title: event.target.value })
                                      }
                                    />
                                  </label>
                                  <label className="grid gap-2 text-sm text-slate-700">
                                    Duration (minutes)
                                    <input
                                      className="h-10 rounded-xl border border-slate-900/10 bg-white px-4 text-sm normal-case"
                                      placeholder="30"
                                      value={lessonDraft.durationMinutes}
                                      onChange={(event) =>
                                        updateLessonDraft(moduleItem.id, {
                                          durationMinutes: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <p className="text-xs text-slate-500">
                                    {lessonTypeCopy[lessonDraft.type].helper}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setLessonStep(moduleItem.id, 1)}
                                      className="h-10 rounded-full border border-slate-900/10 bg-white px-4 text-xs font-semibold text-slate-700"
                                    >
                                      Back
                                    </button>
                                    {lessonDraft.type === "quiz" && (
                                      <button
                                        type="button"
                                        onClick={() => setLessonStep(moduleItem.id, 3)}
                                        className="h-10 rounded-full bg-slate-900 px-4 text-xs font-semibold text-white"
                                      >
                                        Continue to quiz
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="grid gap-3">
                                  {lessonDraft.type !== "quiz" && lessonDraft.type !== "text" && (
                                    <label className="grid gap-2 text-sm text-slate-700">
                                      Resource URL
                                      <input
                                        className="h-10 rounded-xl border border-slate-900/10 bg-white px-4 text-sm normal-case"
                                        placeholder="https://"
                                        value={lessonDraft.resourceUrl}
                                        onChange={(event) =>
                                          updateLessonDraft(moduleItem.id, {
                                            resourceUrl: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                  )}

                                  {lessonDraft.type === "text" && (
                                    <label className="grid gap-2 text-sm text-slate-700">
                                      Lesson content
                                      <textarea
                                        className="min-h-[120px] rounded-xl border border-slate-900/10 bg-white px-4 py-3 text-sm normal-case"
                                        placeholder="Write the lesson content..."
                                        value={lessonDraft.content}
                                        onChange={(event) =>
                                          updateLessonDraft(moduleItem.id, {
                                            content: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                  )}

                                  {lessonDraft.type !== "quiz" && lessonDraft.type !== "text" && (
                                    <label className="grid gap-2 text-sm text-slate-700">
                                      Notes (optional)
                                      <textarea
                                        className="min-h-[120px] rounded-xl border border-slate-900/10 bg-white px-4 py-3 text-sm normal-case"
                                        placeholder="Add notes, transcript, or summary..."
                                        value={lessonDraft.content}
                                        onChange={(event) =>
                                          updateLessonDraft(moduleItem.id, {
                                            content: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                  )}
                                </div>
                              </>
                            )}

                            {activeStep === 3 && lessonDraft.type === "quiz" && (
                              <div className="lg:col-span-2">
                                <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <label className="grid gap-2 text-sm text-amber-700">
                                      Quiz title
                                      <input
                                        className="h-10 rounded-xl border border-amber-200 bg-white px-4 text-sm normal-case"
                                        placeholder="Lesson check-in"
                                        value={lessonDraft.quiz.title}
                                        onChange={(event) =>
                                          updateLessonDraft(moduleItem.id, {
                                            quiz: { ...lessonDraft.quiz, title: event.target.value },
                                          })
                                        }
                                      />
                                    </label>
                                    <label className="grid gap-2 text-sm text-amber-700">
                                      Passing score (%)
                                      <input
                                        className="h-10 rounded-xl border border-amber-200 bg-white px-4 text-sm normal-case"
                                        placeholder="70"
                                        value={lessonDraft.quiz.passingScore}
                                        onChange={(event) =>
                                          updateLessonDraft(moduleItem.id, {
                                            quiz: {
                                              ...lessonDraft.quiz,
                                              passingScore: event.target.value,
                                            },
                                          })
                                        }
                                      />
                                    </label>
                                  </div>

                                  <div className="grid gap-4">
                                    {lessonDraft.quiz.questions.map((question, questionIndex) => (
                                      <div
                                        key={question.id}
                                        className="rounded-xl border border-amber-200/60 bg-white p-4"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <p className="text-xs uppercase tracking-[0.2em] text-amber-700">
                                            Question {questionIndex + 1}
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() => removeQuizQuestion(moduleItem.id, question.id)}
                                            className="text-xs font-semibold text-amber-700"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                        <input
                                          className="mt-2 h-10 w-full rounded-xl border border-amber-200 bg-white px-4 text-sm"
                                          placeholder="Question prompt"
                                          value={question.prompt}
                                          onChange={(event) =>
                                            updateQuizQuestion(moduleItem.id, question.id, {
                                              prompt: event.target.value,
                                            })
                                          }
                                        />
                                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                                          <input
                                            type="checkbox"
                                            checked={question.multipleCorrect}
                                            onChange={(event) =>
                                              updateQuizQuestion(moduleItem.id, question.id, {
                                                multipleCorrect: event.target.checked,
                                              })
                                            }
                                          />
                                          Allow multiple correct answers
                                        </div>

                                        <div className="mt-3 grid gap-2">
                                          {question.options.map((option, optionIndex) => (
                                            <div key={option.id} className="flex flex-wrap items-center gap-2">
                                              <input
                                                type={question.multipleCorrect ? "checkbox" : "radio"}
                                                name={`question-${question.id}`}
                                                checked={option.isCorrect}
                                                onChange={() => {
                                                  if (!question.multipleCorrect) {
                                                    setSingleCorrectOption(
                                                      moduleItem.id,
                                                      question.id,
                                                      option.id
                                                    );
                                                    return;
                                                  }

                                                  updateQuizOption(
                                                    moduleItem.id,
                                                    question.id,
                                                    option.id,
                                                    { isCorrect: !option.isCorrect }
                                                  );
                                                }}
                                              />
                                              <input
                                                className="h-10 flex-1 rounded-xl border border-amber-200 bg-white px-3 text-sm"
                                                placeholder={`Option ${optionIndex + 1}`}
                                                value={option.text}
                                                onChange={(event) =>
                                                  updateQuizOption(
                                                    moduleItem.id,
                                                    question.id,
                                                    option.id,
                                                    { text: event.target.value }
                                                  )
                                                }
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeQuizOption(moduleItem.id, question.id, option.id)
                                                }
                                                className="text-xs font-semibold text-amber-700"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => addQuizOption(moduleItem.id, question.id)}
                                          className="mt-3 text-xs font-semibold text-amber-700"
                                        >
                                          Add option
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => addQuizQuestion(moduleItem.id)}
                                      className="text-xs font-semibold text-amber-700"
                                    >
                                      Add question
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setLessonStep(moduleItem.id, 2)}
                                      className="h-10 rounded-full border border-amber-200 bg-white px-4 text-xs font-semibold text-amber-700"
                                    >
                                      Back to details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {lessonDraft.type === "quiz" && (
                            <div className="mt-2 grid gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                              <div className="grid gap-3 md:grid-cols-2">
                                <label className="grid gap-2 text-sm text-amber-700">
                                  Quiz title
                                  <input
                                    className="h-10 rounded-xl border border-amber-200 bg-white px-4 text-sm normal-case"
                                    placeholder="Lesson check-in"
                                    value={lessonDraft.quiz.title}
                                    onChange={(event) =>
                                      updateLessonDraft(moduleItem.id, {
                                        quiz: { ...lessonDraft.quiz, title: event.target.value },
                                      })
                                    }
                                  />
                                </label>
                                <label className="grid gap-2 text-sm text-amber-700">
                                  Passing score (%)
                                  <input
                                    className="h-10 rounded-xl border border-amber-200 bg-white px-4 text-sm normal-case"
                                    placeholder="70"
                                    value={lessonDraft.quiz.passingScore}
                                    onChange={(event) =>
                                      updateLessonDraft(moduleItem.id, {
                                        quiz: {
                                          ...lessonDraft.quiz,
                                          passingScore: event.target.value,
                                        },
                                      })
                                    }
                                  />
                                </label>
                              </div>

                              <div className="grid gap-4">
                                {lessonDraft.quiz.questions.map((question, questionIndex) => (
                                  <div
                                    key={question.id}
                                    className="rounded-xl border border-amber-200/60 bg-white p-4"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <p className="text-xs uppercase tracking-[0.2em] text-amber-700">
                                        Question {questionIndex + 1}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => removeQuizQuestion(moduleItem.id, question.id)}
                                        className="text-xs font-semibold text-amber-700"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    <input
                                      className="mt-2 h-10 w-full rounded-xl border border-amber-200 bg-white px-4 text-sm"
                                      placeholder="Question prompt"
                                      value={question.prompt}
                                      onChange={(event) =>
                                        updateQuizQuestion(moduleItem.id, question.id, {
                                          prompt: event.target.value,
                                        })
                                      }
                                    />
                                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                                      <input
                                        type="checkbox"
                                        checked={question.multipleCorrect}
                                        onChange={(event) =>
                                          updateQuizQuestion(moduleItem.id, question.id, {
                                            multipleCorrect: event.target.checked,
                                          })
                                        }
                                      />
                                      Allow multiple correct answers
                                    </div>

                                    <div className="mt-3 grid gap-2">
                                      {question.options.map((option, optionIndex) => (
                                        <div
                                          key={option.id}
                                          className="flex flex-wrap items-center gap-2"
                                        >
                                          <input
                                            type={question.multipleCorrect ? "checkbox" : "radio"}
                                            name={`question-${question.id}`}
                                            checked={option.isCorrect}
                                            onChange={() => {
                                              if (!question.multipleCorrect) {
                                                setSingleCorrectOption(
                                                  moduleItem.id,
                                                  question.id,
                                                  option.id
                                                );
                                                return;
                                              }

                                              updateQuizOption(
                                                moduleItem.id,
                                                question.id,
                                                option.id,
                                                { isCorrect: !option.isCorrect }
                                              );
                                            }}
                                          />
                                          <input
                                            className="h-10 flex-1 rounded-xl border border-amber-200 bg-white px-3 text-sm"
                                            placeholder={`Option ${optionIndex + 1}`}
                                            value={option.text}
                                            onChange={(event) =>
                                              updateQuizOption(
                                                moduleItem.id,
                                                question.id,
                                                option.id,
                                                { text: event.target.value }
                                              )
                                            }
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeQuizOption(moduleItem.id, question.id, option.id)
                                            }
                                            className="text-xs font-semibold text-amber-700"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => addQuizOption(moduleItem.id, question.id)}
                                      className="mt-3 text-xs font-semibold text-amber-700"
                                    >
                                      Add option
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addQuizQuestion(moduleItem.id)}
                                  className="text-xs font-semibold text-amber-700"
                                >
                                  Add question
                                </button>
                              </div>
                            </div>
                          )}

                          {moduleItem.lessons.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-900/10 bg-white px-4 py-3 text-xs text-slate-500">
                              No lessons yet. Try a preset to get started quickly.
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              disabled={lessonSaving === moduleItem.id || !canEditCourse}
                              onClick={() => handleCreateLesson(moduleItem.id)}
                              className="h-10 rounded-full border border-slate-900/15 bg-white px-5 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                            >
                              {lessonSaving === moduleItem.id ? "Adding..." : "Add lesson"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                </div>
              </GlassCard>
            </main>

            <aside className="grid gap-6">
              <GlassCard>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Visibility</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {state.data.status === "published" ? "Published" : "Draft"}
                    </p>
                  </div>
                  {state.data.status === "published" ? (
                    <button
                      type="button"
                      disabled={statusUpdating || !canEditCourse}
                      onClick={() => handleStatusUpdate("draft")}
                      className="h-11 rounded-full border border-slate-900/15 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                    >
                      {statusUpdating ? "Updating..." : "Unpublish"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={statusUpdating || !canEditCourse}
                      onClick={() => handleStatusUpdate("published")}
                      className="h-11 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                    >
                      {statusUpdating ? "Publishing..." : "Publish"}
                    </button>
                  )}
                </div>
              </GlassCard>

              <GlassCard>
                <form className="grid gap-4" onSubmit={handleVideoUpload}>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Video upload
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      Prepare a lesson video
                    </h2>
                  </div>
                  <input
                    name="video"
                    type="file"
                    accept="video/mp4,video/webm"
                    className="text-sm text-slate-700"
                  />
                  {uploadMessage && (
                    <p className="text-sm text-slate-600">{uploadMessage}</p>
                  )}
                  {uploadResponse && (
                    <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      <p>Upload URL: {uploadResponse.uploadUrl}</p>
                      <p>Asset URL: {uploadResponse.assetUrl}</p>
                      <p>Expires: {new Date(uploadResponse.expiresAt).toLocaleString()}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Generate upload URL
                  </button>
                </form>
              </GlassCard>

              <GlassCard className="text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Studio tips</p>
                <p className="mt-2">
                  Mix formats: video walkthroughs, text recaps, PDFs, and quizzes keep
                  learners engaged and help retention.
                </p>
              </GlassCard>
            </aside>
          </div>
        )}
      </PageShell>
    </AuthGuard>
  );
}
