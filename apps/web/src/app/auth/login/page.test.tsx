import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("LoginPage", () => {
  it("renders the login heading", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sign in to your LearnSphere.")).toBeInTheDocument();
  });
});
