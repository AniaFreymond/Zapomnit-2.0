import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import { KaTeXComponent } from "@/lib/katex";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Tag } from "@shared/schema";

type CardFlipProps = {
  id: number;
  front: string;
  back: string;
  tags: Tag[];
  onEdit: () => void;
};

export default function CardFlip({ id, front, back, tags, onEdit }: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/flashcards/${id}`);
      
      // Invalidate flashcards query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
      
      toast({
        title: "Flashcard deleted",
        description: "The flashcard has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to delete the flashcard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className={`card-flip h-64 md:h-72 ${isFlipped ? 'card-flipped' : ''}`} 
      onClick={toggleFlip}
    >
      <div className="card-inner">
        {/* Card Front */}
        <Card className="card-front border overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="p-5 flex flex-col h-full">
            <div className="mb-3">
              <div className="flex flex-wrap gap-1 overflow-hidden">
                {tags.map((tag) => (
                  <Badge 
                    key={tag.id} 
                    style={{ backgroundColor: tag.color }}
                    className="text-white"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto flex items-center justify-center">
              <KaTeXComponent mathExpression={front} />
            </div>
          </CardContent>
        </Card>
        
        {/* Card Back */}
        <Card className="card-back border overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-indigo-950 dark:to-blue-950">
          <CardContent className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-wrap gap-1 overflow-hidden">
                {tags.map((tag) => (
                  <Badge 
                    key={tag.id} 
                    style={{ backgroundColor: tag.color }}
                    className="text-white"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-1 ml-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleEdit}
                >
                  <Edit2Icon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              <KaTeXComponent mathExpression={back} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
