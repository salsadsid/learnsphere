import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CourseWatchPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("lessonId=lesson-1"),
}));

vi.mock("@/shared/auth-guard", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/shared/video-progress", () => ({
  getDeviceId: () => "device-test",
  getLocalProgress: () => null,
  setLocalProgress: () => {},
}));

const authGetJsonMock = vi.fn();
const authPostJsonMock = vi.fn();
vi.mock("@/shared/api", () => ({
  authGetJson: (...args: unknown[]) => authGetJsonMock(...args),
  authPostJson: (...args: unknown[]) => authPostJsonMock(...args),
}));

describe("CourseWatchPage", () => {
  it("renders lesson playback and navigation", async () => {
    authGetJsonMock.mockImplementation((path: string) => {
      if (path.startsWith("/api/v1/courses/")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          data: {
            id: "course-1",
            title: "Momentum Mastery",
            status: "published",
            modules: [
              {
                id: "module-1",
                title: "Foundations",
                order: 1,
                lessonCount: 2,
                lessons: [
                  { id: "lesson-1", title: "Kickoff", order: 1, durationMinutes: 10 },
                  { id: "lesson-2", title: "Cadence", order: 2, durationMinutes: 12 },
                ],
              },
            ],
          },
        });
      }

      if (path.startsWith("/api/v1/progress/course/")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          data: {
            courseId: "course-1",
            totalLessons: 2,
            completedLessons: 0,
            percentComplete: 0,
            completedLessonIds: [],
          },
        });
      }

      if (path.startsWith("/api/v1/enrollments/")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          data: {
            enrolled: true,
            access: "enrolled",
          },
        });
      }

      if (path.startsWith("/api/v1/progress/")) {
        return Promise.resolve({ ok: false, status: 404 });
      }

      return Promise.resolve({ ok: false, status: 500, error: "Unexpected" });
    });

    authPostJsonMock.mockResolvedValue({ ok: true, status: 201, data: {} });

    render(<CourseWatchPage params={{ courseId: "course-1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Kickoff")).toBeInTheDocument();
      expect(screen.getByText("Next lesson")).toBeInTheDocument();
    });
  });
});
