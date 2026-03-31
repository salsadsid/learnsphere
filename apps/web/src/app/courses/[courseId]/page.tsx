"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authGetJson, authPostJson, getJson } from "@/shared/api";

type Lesson = {
  id: string;
  title: string;
  order: number;
  durationMinutes?: number;
};

type Module = {
  id: string;
  title: string;
  summary?: string;
  order: number;
  lessonCount: number;
  lessons: Lesson[];
};

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

type CourseProgress = {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  completedLessonIds: string[];
};

type EnrollmentStatus = {
  enrolled: boolean;
  access: "owner" | "enrolled" | "none";
};

type EnrollmentResponse = {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
};

type CheckoutResponse = {
  paymentId: string;
  sessionId: string;
  checkoutUrl: string;
  amountCents: number;
  currency: string;
  status: "pending" | "paid" | "failed";
};

type PaymentStatus = {
  courseId: string;
  hasPayment: boolean;
  paymentId?: string;
  status?: "pending" | "paid" | "failed";
  amountCents?: number;
  currency?: string;
  updatedAt?: string;
};

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CourseDetail };

type CourseDetailPageProps = {
  params: { courseId: string };
};

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentStatus | null>(null);
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      const result = await getJson<CourseDetail>(`/api/v1/courses/${params.courseId}`);
      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setState({ status: "error", message: result.error ?? "Unable to load course." });
        return;
      }

      setState({ status: "ready", data: result.data });

      const progressResult = await authGetJson<CourseProgress>(
        `/api/v1/progress/course/${params.courseId}`
      );

      const enrollmentResult = await authGetJson<EnrollmentStatus>(
        `/api/v1/enrollments/${params.courseId}`
      );

      const paymentResult = await authGetJson<PaymentStatus>(
        `/api/v1/payments/status/${params.courseId}`
      );

      if (!active) {
        return;
      }

      if (progressResult.ok && progressResult.data) {
        setProgress(progressResult.data);
      }

      if (enrollmentResult.ok && enrollmentResult.data) {
        setEnrollment(enrollmentResult.data);
      } else if (enrollmentResult.status === 401) {
        setEnrollment({ enrolled: false, access: "none" });
      }

      if (paymentResult.ok && paymentResult.data) {
        setPaymentStatus(paymentResult.data);
      }
    };

    loadCourse();

    return () => {
      active = false;
    };
  }, [params.courseId]);

  if (state.status === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-16 text-sm text-slate-600">
        Loading course...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Course</p>
        <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
          Course not available
        </h1>
        <p className="text-sm text-rose-600">{state.message}</p>
        <Link className="text-sm font-semibold text-slate-900" href="/courses">
          Back to courses
        </Link>
      </div>
    );
  }

  const { data } = state;
  const firstLessonId = data.modules[0]?.lessons[0]?.id;
  const hasAccess = enrollment?.access === "owner" || enrollment?.access === "enrolled";
  const paymentState = paymentStatus?.status;
  const isPaymentPending = paymentState === "pending";
  const isPaymentPaid = paymentState === "paid";
  const isPaymentFailed = paymentState === "failed";

  const handleEnroll = async () => {
    setEnrollMessage(null);
    setIsEnrolling(true);

    const result = await authPostJson<EnrollmentResponse>("/api/v1/enrollments", {
      courseId: data.id,
    });

    if (!result.ok || !result.data) {
      setEnrollMessage(result.error ?? "Unable to enroll.");
      setIsEnrolling(false);
      return;
    }

    setEnrollment({ enrolled: true, access: "enrolled" });
    setEnrollMessage("Enrollment confirmed.");
    setIsEnrolling(false);
  };

  const handleCheckout = async () => {
    setCheckoutMessage(null);
    setCheckout(null);

    const idempotencyKey = typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`;
    const result = await authPostJson<CheckoutResponse>(
      "/api/v1/payments/checkout",
      { courseId: data.id },
      {
        headers: {
          "x-idempotency-key": idempotencyKey,
        },
      }
    );

    if (!result.ok || !result.data) {
      setCheckoutMessage(result.error ?? "Unable to start checkout.");
      return;
    }

    setCheckout(result.data);
    setPaymentStatus({
      courseId: data.id,
      hasPayment: true,
      paymentId: result.data.paymentId,
      status: result.data.status,
      amountCents: result.data.amountCents,
      currency: result.data.currency,
    });
    setCheckoutMessage("Checkout session created.");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>{data.category ?? "General"}</span>
          <span className="rounded-full border border-slate-900/10 px-3 py-1">{data.status}</span>
        </div>
        <h1 className="text-4xl font-semibold text-slate-900 font-[var(--font-display)]">
          {data.title}
        </h1>
        <p className="text-sm text-slate-600">
          {data.summary ?? "A guided track built to help you build momentum."}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>Level: {data.level ?? "intro"}</span>
          <span>{data.modules.length} modules</span>
          {progress && (
            <span>
              Progress: {progress.completedLessons}/{progress.totalLessons} ({progress.percentComplete}
              %)
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <Link className="text-sm font-semibold text-slate-900" href={`/courses/${data.id}/edit`}>
            Edit course
          </Link>
          {hasAccess ? (
            <Link
              className="text-sm font-semibold text-slate-900"
              href={
                firstLessonId
                  ? `/courses/${data.id}/watch?lessonId=${firstLessonId}`
                  : `/courses/${data.id}/watch`
              }
            >
              Start lesson
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="text-sm font-semibold text-slate-900"
            >
              Enroll to access lessons
            </button>
          )}
        </div>
        {!hasAccess && (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-6 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Enrollment required
            </p>
            <p className="mt-2">Enroll to unlock the lessons and watch experience.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isPaymentPending || isPaymentPaid}
                className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white"
              >
                {isPaymentFailed ? "Retry checkout" : "Start checkout"}
              </button>
              <button
                type="button"
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="h-10 rounded-full border border-slate-900/10 px-4 text-sm font-semibold text-slate-900"
              >
                Enroll without checkout
              </button>
            </div>
            {paymentStatus?.status && (
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                Payment status: {paymentStatus.status}
              </p>
            )}
            {checkoutMessage && (
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                {checkoutMessage}
              </p>
            )}
            {checkout && (
              <p className="mt-2 text-xs text-slate-500">
                Checkout URL: {checkout.checkoutUrl}
              </p>
            )}
            {enrollMessage && (
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-600">
                {enrollMessage}
              </p>
            )}
          </div>
        )}
      </header>

      <section className="space-y-6">
        {data.modules.length === 0 ? (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
            No modules have been added yet.
          </div>
        ) : !hasAccess ? (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
            Enroll to view lesson details and start learning.
          </div>
        ) : (
          data.modules.map((moduleItem) => (
            <div
              key={moduleItem.id}
              className="rounded-3xl border border-slate-900/10 bg-white/70 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Module {moduleItem.order}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    {moduleItem.title}
                  </h2>
                  {moduleItem.summary && (
                    <p className="mt-2 text-sm text-slate-600">{moduleItem.summary}</p>
                  )}
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {moduleItem.lessonCount} lessons
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                {moduleItem.lessons.length === 0 ? (
                  <p className="text-sm text-slate-500">No lessons yet.</p>
                ) : (
                  moduleItem.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          className="text-sm font-semibold text-slate-900"
                          href={`/courses/${data.id}/watch?lessonId=${lesson.id}`}
                        >
                          {lesson.order}. {lesson.title}
                        </Link>
                        {lesson.durationMinutes !== undefined && (
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            {lesson.durationMinutes} min
                          </span>
                        )}
                      </div>
                      {progress?.completedLessonIds.includes(lesson.id) && (
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-600">
                          Completed
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
