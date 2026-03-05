import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";

export default function AppLayout() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
        <Toaster />

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} ProFi Mine. All rights reserved.
              </p>
              <p className="flex items-center gap-1">
                Built with <span className="text-red-500">♥</span> using{" "}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline font-medium"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
