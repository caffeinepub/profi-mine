import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { GUIDE_CONTENT } from '../../constants/guideContent';
import Glossary from './Glossary';

export default function UsageGuideTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Table of Contents */}
      <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Contents</h3>
          <nav className="space-y-2">
            {GUIDE_CONTENT.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {section.title}
              </a>
            ))}
            <a
              href="#glossary"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Glossary
            </a>
          </nav>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-8">
            {GUIDE_CONTENT.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
              </section>
            ))}

            <section id="glossary" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Glossary</h2>
              <Glossary />
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
