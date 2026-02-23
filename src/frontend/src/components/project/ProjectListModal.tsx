import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLoadProjects, useDeleteProject } from '../../hooks/useQueries';
import { useProject } from '../../contexts/ProjectContext';
import { toast } from 'sonner';
import { Loader2, Trash2, FolderOpen } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDate } from '../../utils/formatters';

interface ProjectListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectListModal({ open, onOpenChange }: ProjectListModalProps) {
  const { data: projects, isLoading } = useLoadProjects();
  const { loadProject } = useProject();
  const deleteProject = useDeleteProject();

  const handleLoad = async (projectId: Uint8Array, projectName: string) => {
    try {
      await loadProject(projectId);
      toast.success(`Loaded project: ${projectName}`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to load project');
      console.error(error);
    }
  };

  const handleDelete = async (projectId: Uint8Array, projectName: string) => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast.success(`Deleted project: ${projectName}`);
    } catch (error) {
      toast.error('Failed to delete project');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Load Project</DialogTitle>
          <DialogDescription>
            Select a project to load its data and continue working.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No saved projects yet.</p>
              <p className="text-sm mt-1">Create and save your first project to see it here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id.toString()}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDate(project.creationDate)} • Modified: {formatDate(project.lastModified)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleLoad(project.id, project.name)}
                    >
                      Load
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{project.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(project.id, project.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
