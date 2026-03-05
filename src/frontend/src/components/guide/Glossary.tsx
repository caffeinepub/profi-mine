import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { GLOSSARY } from "../../constants/glossary";

export default function Glossary() {
  const [search, setSearch] = useState("");

  const glossaryEntries = Object.entries(GLOSSARY).filter(
    ([key, value]) =>
      key.toLowerCase().includes(search.toLowerCase()) ||
      value.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search terms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Accordion type="single" collapsible className="w-full">
        {glossaryEntries.map(([key, value]) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger className="text-left">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{value}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
