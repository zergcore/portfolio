import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import AdminLocaleSwitcher from "@/components/admin/AdminLocaleSwitcher";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

const renderWithIntl = (locale: string) => {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={{
        adminCommon: {
          language: "Language",
        },
      }}
    >
      <AdminLocaleSwitcher />
    </NextIntlClientProvider>
  );
};

describe("AdminLocaleSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = "";
  });

  it("renders correctly in English and displays ES toggle", () => {
    renderWithIntl("en");
    
    const button = screen.getByRole("button", { name: "Language" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("ES");
  });

  it("renders correctly in Spanish and displays EN toggle", () => {
    renderWithIntl("es");
    
    const button = screen.getByRole("button", { name: "Language" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("EN");
  });

  it("toggles cookie to 'es' and calls router.refresh() when clicked in 'en' locale", () => {
    renderWithIntl("en");
    
    const button = screen.getByRole("button", { name: "Language" });
    fireEvent.click(button);
    
    expect(document.cookie).toContain("NEXT_LOCALE=es");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("toggles cookie to 'en' and calls router.refresh() when clicked in 'es' locale", () => {
    renderWithIntl("es");
    
    const button = screen.getByRole("button", { name: "Language" });
    fireEvent.click(button);
    
    expect(document.cookie).toContain("NEXT_LOCALE=en");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
