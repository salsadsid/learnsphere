import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CourseDetailPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const getJsonMock = vi.fn();
const authGetJsonMock = vi.fn();
vi.mock("@/shared/api", () => ({
  getJson: (...args: unknown[]) => getJsonMock(...args),
  authGetJson: (...args: unknown[]) => authGetJsonMock(...args),
  authPostJson: vi.fn(),
}));

describe("CourseDetailPage", () => {
  it("renders course detail data", async () => {
    getJsonMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        id: "course-1",
        title: "Momentum Mastery",
        summary: "Build habits that stick.",
        category: "Growth",
        level: "beginner",
        status: "published",
        instructorId: "instructor-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modules: [
          {
            id: "module-1",
            title: "Foundations",
            summary: "Start here",
            order: 1,
            lessonCount: 1,
            lessons: [
              {
                id: "lesson-1",
                title: "Kickoff",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
    });
    authGetJsonMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        courseId: "course-1",
        totalLessons: 1,
        completedLessons: 0,
        percentComplete: 0,
        completedLessonIds: [],
      },
    });
    authGetJsonMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        enrolled: true,
        access: "enrolled",
      },
    });
    authGetJsonMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        courseId: "course-1",
        hasPayment: true,
        paymentId: "payment-1",
        status: "paid",
        amountCents: 9900,
        currency: "usd",
        updatedAt: new Date().toISOString(),
      },
    });

    render(<CourseDetailPage params={{ courseId: "course-1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Momentum Mastery")).toBeInTheDocument();
      expect(screen.getByText("Foundations")).toBeInTheDocument();
    });
  });
});
