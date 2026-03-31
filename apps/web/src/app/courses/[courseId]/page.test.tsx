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
vi.mock("@/shared/api", () => ({
  getJson: (...args: unknown[]) => getJsonMock(...args),
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

    render(<CourseDetailPage params={{ courseId: "course-1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Momentum Mastery")).toBeInTheDocument();
      expect(screen.getByText("Foundations")).toBeInTheDocument();
    });
  });
});
