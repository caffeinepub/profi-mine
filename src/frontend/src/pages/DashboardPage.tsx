import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Database,
  Download,
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
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("inputs");
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (!identity) {
      navigate({ to: "/" });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  return (
    <ProjectProvider>
      <ScenarioProvider>
        <div className="min-h-screen bg-background">
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
                >
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Inputs</span>
                </TabsTrigger>
                <TabsTrigger
                  value="projections"
                  className="flex items-center gap-2 py-3"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Projections</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sensitivity"
                  className="flex items-center gap-2 py-3"
                >
                  <Sliders className="w-4 h-4" />
                  <span className="hidden sm:inline">Sensitivity</span>
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  className="flex items-center gap-2 py-3"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </TabsTrigger>
                <TabsTrigger
                  value="guide"
                  className="flex items-center gap-2 py-3"
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
