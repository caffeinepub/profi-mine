import { useNavigate } from "@tanstack/react-router";
import { Pickaxe } from "lucide-react";
import { useEffect } from "react";
import LoginButton from "../components/auth/LoginButton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: "/dashboard" });
    }
  }, [identity, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[oklch(0.35_0.08_60)] via-[oklch(0.25_0.06_50)] to-[oklch(0.20_0.05_40)]">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url(/assets/generated/mining-equipment.dim_1200x800.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-border">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_60)] to-[oklch(0.45_0.12_50)] mb-4 shadow-lg">
              <Pickaxe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              ProFi Mine
            </h1>
            <p className="text-muted-foreground text-lg">
              Financial Modeling for Mining Projects
            </p>
          </div>

          {/* Description */}
          <div className="mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              Generate comprehensive 10-year financial projections for investor
              presentations with advanced sensitivity analysis and professional
              exports.
            </p>
          </div>

          {/* Login Button */}
          <div className="flex justify-center">
            <LoginButton />
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-border">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_60)]" />
                Comprehensive financial modeling
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_60)]" />
                Real-time sensitivity analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_60)]" />
                Professional CSV exports
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
