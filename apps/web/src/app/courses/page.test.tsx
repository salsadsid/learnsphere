import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CoursesPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const getJsonMock = vi.fn();
vi.mock("@/shared/api", () => ({
  getJson: (...args: unknown[]) => getJsonMock(...args),
}));

describe("CoursesPage", () => {
  it("renders course list data", async () => {
    getJsonMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          categories: ["Growth"],
        },
      })
      .mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        items: [
          {
            id: "course-1",
            title: "Momentum Mastery",
            summary: "Build habits that stick.",
            category: "Growth",
            level: "beginner",
            status: "published",
            instructorId: "instructor-1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        page: 1,
        pageSize: 12,
        total: 1,
        totalPages: 1,
        nextPage: null,
        },
      });

    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText("Momentum Mastery")).toBeInTheDocument();
    });
  });
});
