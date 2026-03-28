import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RegisterPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("RegisterPage", () => {
  it("renders the register heading", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Create your LearnSphere account.")).toBeInTheDocument();
  });
});
