import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useScenarios } from '../../contexts/ScenarioContext';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import ScenarioEditor from './ScenarioEditor';

export default function ScenarioComparison() {
  const { scenarios, activeScenario, setActiveScenario } = useScenarios();
  const [editingScenario, setEditingScenario] = useState<'base' | 'optimistic' | 'pessimistic' | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Base Case</TableHead>
                <TableHead className="text-right">Optimistic</TableHead>
                <TableHead className="text-right">Pessimistic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">NPV</TableCell>
                <TableCell className="text-right">{formatCurrency(scenarios.base.npv)}</TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-400">{formatCurrency(scenarios.optimistic.npv)}</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">{formatCurrency(scenarios.pessimistic.npv)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">IRR</TableCell>
                <TableCell className="text-right">{formatPercentage(scenarios.base.irr)}</TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-400">{formatPercentage(scenarios.optimistic.irr)}</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">{formatPercentage(scenarios.pessimistic.irr)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ROI</TableCell>
                <TableCell className="text-right">{formatPercentage(scenarios.base.roi)}</TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-400">{formatPercentage(scenarios.optimistic.roi)}</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">{formatPercentage(scenarios.pessimistic.roi)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">LOM</TableCell>
                <TableCell className="text-right">{formatNumber(scenarios.base.lom, 1)} years</TableCell>
                <TableCell className="text-right">{formatNumber(scenarios.optimistic.lom, 1)} years</TableCell>
                <TableCell className="text-right">{formatNumber(scenarios.pessimistic.lom, 1)} years</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setEditingScenario('base')}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Base
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditingScenario('optimistic')}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Optimistic
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditingScenario('pessimistic')}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Pessimistic
          </Button>
        </div>
      </div>

      {editingScenario && (
        <ScenarioEditor
          scenario={editingScenario}
          open={!!editingScenario}
          onOpenChange={(open) => !open && setEditingScenario(null)}
        />
      )}
    </>
  );
}
