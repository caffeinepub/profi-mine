import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Database,
  Download,
  LogOut,
  Sliders,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ExportTab from "../components/export/ExportTab";
import UsageGuideTab from "../components/guide/UsageGuideTab";
import InputsTab from "../components/inputs/InputsTab";
import ProjectionsTab from "../components/projections/ProjectionsTab";
import SensitivityTab from "../components/sensitivity/SensitivityTab";
import { ProjectProvider } from "../contexts/ProjectContext";
import { ScenarioProvider } from "../contexts/ScenarioContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("inputs");
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();

  useEffect(() => {
    if (!identity) {
      navigate({ to: "/" });
    }
  }, [identity, navigate]);

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .isCurrentUserActive()
      .then((active) => setIsActive(active))
      .catch(() => setIsActive(true));
  }, [actor, isFetching]);

  if (!identity) {
    return null;
  }

  const handleLogout = () => {
    clear();
    navigate({ to: "/" });
  };

  return (
    <ProjectProvider>
      <ScenarioProvider>
        <div className="min-h-screen bg-background">
          {/* Deactivation overlay */}
          {isActive === false && (
            <div
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
              data-ocid="dashboard.modal"
            >
              <div className="max-w-sm w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
                  <LogOut className="w-8 h-8 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h2
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
                  >
                    Account Deactivated
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your account has been deactivated. Please contact the
                    administrator to restore access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
                  data-ocid="dashboard.cancel_button"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}

          <DashboardHeader />

          <main className="container mx-auto px-4 py-6 max-w-7xl">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5 mb-6 h-auto p-1 bg-muted/50">
                <TabsTrigger
                  value="inputs"
                  className="flex items-center gap-2 py-3"
                  data-ocid="dashboard.inputs.tab"
                >
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Inputs</span>
                </TabsTrigger>
                <TabsTrigger
                  value="projections"
                  className="flex items-center gap-2 py-3"
                  data-ocid="dashboard.projections.tab"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Projections</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sensitivity"
                  className="flex items-center gap-2 py-3"
                  data-ocid="dashboard.sensitivity.tab"
                >
                  <Sliders className="w-4 h-4" />
                  <span className="hidden sm:inline">Sensitivity</span>
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  className="flex items-center gap-2 py-3"
                  data-ocid="dashboard.export.tab"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </TabsTrigger>
                <TabsTrigger
                  value="guide"
                  className="flex items-center gap-2 py-3"
                  data-ocid="dashboard.guide.tab"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Guide</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inputs" className="mt-0">
                <InputsTab />
              </TabsContent>

              <TabsContent value="projections" className="mt-0">
                <ProjectionsTab />
              </TabsContent>

              <TabsContent value="sensitivity" className="mt-0">
                <SensitivityTab />
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                <ExportTab />
              </TabsContent>

              <TabsContent value="guide" className="mt-0">
                <UsageGuideTab />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </ScenarioProvider>
    </ProjectProvider>
  );
}
