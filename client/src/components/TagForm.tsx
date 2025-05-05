import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Color conversion functions
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const formSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color"),
});

type FormValues = z.infer<typeof formSchema>;

type TagFormProps = {
  isOpen: boolean;
  onClose: () => void;
  editTag?: Tag | null;
  onSuccess?: () => void;
};

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#84cc16", // Lime
  "#14b8a6", // Teal
];

export default function TagForm({ isOpen, onClose, editTag, onSuccess }: TagFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editTag?.name || "",
      color: editTag?.color || PRESET_COLORS[0],
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (editTag) {
        // Update existing tag
        await apiRequest("PUT", `/api/tags/${editTag.id}`, values);
        toast({
          title: "Tag updated",
          description: "The tag has been successfully updated.",
        });
      } else {
        // Create new tag
        await apiRequest("POST", "/api/tags", values);
        toast({
          title: "Tag created",
          description: "The tag has been successfully created.",
        });
      }

      // Reset form and close dialog
      form.reset();
      onClose();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving tag:", error);
      toast({
        title: "Error",
        description: `Failed to ${editTag ? "update" : "create"} tag. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editTag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tag name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Color</FormLabel>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-10 h-10 rounded-full border shadow-md"
                        style={{ backgroundColor: field.value }}
                      ></div>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                    </div>
                    
                    {/* Color wheel */}
                    <div className="color-wheel-container relative mx-auto w-48 h-48">
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div 
                          className="color-wheel-picker w-full h-full cursor-pointer" 
                          style={{
                            background: `conic-gradient(
                              #FF0000, #FFA500, #FFFF00, #00FF00, 
                              #00FFFF, #0000FF, #800080, #FF00FF, #FF0000
                            )`
                          }}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            // Store a reference to the wheel element at pointer down time
                            // Get and store initial coordinates to avoid requerying during drag
                            const wheelElement = e.currentTarget;
                            // Keep for compatibility - we'll use manually calculated values if this fails
                            let wheelRect;
                            try {
                              wheelRect = wheelElement.getBoundingClientRect();
                            } catch (err) {
                              console.log('Error with getBoundingClientRect, using fallback', err);
                              // Fallback if getBoundingClientRect fails
                              wheelRect = {
                                width: 192,  // 48rem = 12 * 16px (standard)
                                height: 192,
                                left: e.clientX - 96, // Approximate center based on click
                                top: e.clientY - 96
                              };
                            }
                            
                            const centerX = wheelRect.width / 2;
                            const centerY = wheelRect.height / 2;
                            
                            const updateColor = (event: PointerEvent | React.PointerEvent) => {
                              // Get current rect to handle any changes in position
                              let currentRect;
                              try {
                                // Try to get the updated position of the wheel
                                const currentElement = wheelElement || event.currentTarget;
                                if (currentElement && 'getBoundingClientRect' in currentElement) {
                                  currentRect = (currentElement as Element).getBoundingClientRect();
                                } else {
                                  currentRect = wheelRect;
                                }
                              } catch (err) {
                                console.log('Using fallback rect', err);
                                currentRect = wheelRect;
                              }
                              
                              // Calculate accurate coordinates relative to the wheel
                              const x = event.clientX - currentRect.left;
                              const y = event.clientY - currentRect.top;
                              
                              // Calculate angle and distance from center
                              const angle = Math.atan2(y - centerY, x - centerX);
                              const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                              
                              // Convert angle to hue (0-360) with offset correction
                              // Adjust by 110 degrees to precisely align wheel colors with click positions
                              let hue = (angle * 180 / Math.PI + 180 - 110) % 360;
                              
                              // Convert distance to saturation (0-100)
                              const maxDist = Math.min(centerX, centerY);
                              let saturation = Math.min(100, Math.max(0, (distance / maxDist) * 100));
                              
                              // Set lightness based on distance
                              let lightness = 50;
                              
                              // Convert HSL to HEX
                              const rgb = hslToRgb(hue / 360, saturation / 100, lightness / 100);
                              const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
                              
                              form.setValue("color", hex, { shouldValidate: true });
                            };
                            
                            // Initial color update on click
                            updateColor(e);
                            
                            // Add pointer move event for dragging
                            const handlePointerMove = (moveEvent: PointerEvent) => {
                              updateColor(moveEvent);
                            };
                            
                            // Add pointer up event to stop tracking
                            const handlePointerUp = () => {
                              document.removeEventListener('pointermove', handlePointerMove);
                              document.removeEventListener('pointerup', handlePointerUp);
                              wheelElement.releasePointerCapture(e.pointerId);
                            };
                            
                            // Capture the pointer to get events outside the element
                            wheelElement.setPointerCapture(e.pointerId);
                            document.addEventListener('pointermove', handlePointerMove);
                            document.addEventListener('pointerup', handlePointerUp);
                          }}
                          onClick={(e) => {
                            // Get wheel element and its dimensions
                            const wheel = e.currentTarget;
                            let rect;
                            
                            try {
                              rect = wheel.getBoundingClientRect();
                            } catch (err) {
                              console.log('Error with getBoundingClientRect in onClick, using fallback', err);
                              // Fallback if getBoundingClientRect fails
                              rect = {
                                width: 192,  // Default size
                                height: 192,
                                left: e.clientX - 96,
                                top: e.clientY - 96
                              };
                            }
                            
                            const centerX = rect.width / 2;
                            const centerY = rect.height / 2;
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            
                            // Calculate angle and distance from center
                            const angle = Math.atan2(y - centerY, x - centerX);
                            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                            
                            // Convert angle to hue (0-360) with offset correction
                            // Adjust by 110 degrees to precisely align wheel colors with click positions
                            let hue = (angle * 180 / Math.PI + 180 - 110) % 360;
                            
                            // Convert distance to saturation (0-100)
                            const maxDist = Math.min(centerX, centerY);
                            let saturation = Math.min(100, Math.max(0, (distance / maxDist) * 100));
                            
                            // Set lightness based on distance
                            let lightness = 50;
                            
                            // Convert HSL to HEX
                            const rgb = hslToRgb(hue / 360, saturation / 100, lightness / 100);
                            const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
                            
                            form.setValue("color", hex, { shouldValidate: true });
                          }}
                        ></div>
                      </div>
                      <div 
                        className="absolute w-6 h-6 rounded-full border-2 border-white shadow-xl translate-x-[-50%] translate-y-[-50%] pointer-events-none z-10"
                        style={{ 
                          backgroundColor: field.value,
                          left: "50%",
                          top: "50%",
                          // We would need state variables to track the position based on the selected color
                          // For now, this serves as a visual indicator of the selected color
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-150 hover:scale-110 ${field.value === color ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-gray-400'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => form.setValue("color", color, { shouldValidate: true })}
                        ></button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editTag
                  ? "Update Tag"
                  : "Create Tag"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
