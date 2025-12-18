"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScriptParams } from "@/types";
import { showError, showSuccess } from "@/utils/toast"; // Import toast utilities
import { parseDocx, parsePdf } from "@/utils/fileParsers"; // Import new file parsers

const formSchema = z.object({
  scriptTitle: z.string().min(3, { message: "Script title must be at least 3 characters." }), // New field
  scriptText: z.string().min(10, { message: "Script must be at least 10 characters." }),
  targetProductionBudget: z.coerce.number().min(0, { message: "Budget cannot be negative." }),
  targetAudience: z.string().min(3, { message: "Target audience is required." }),
  creativeFlexibility: z.enum(['no-changes', 'minor-dialogue-changes', 'scene-level-changes']),
  creativeDirectionNotes: z.string().optional(),
});

interface ScriptInputFormProps {
  onSubmit: (scriptText: string, params: ScriptParams) => void;
}

const ScriptInputForm: React.FC<ScriptInputFormProps> = ({ onSubmit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scriptTitle: "", // Default value for new field
      scriptText: "",
      targetProductionBudget: 100000,
      targetAudience: "Young Adults (18-34)",
      creativeFlexibility: "minor-dialogue-changes",
      creativeDirectionNotes: "",
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.split('.').slice(0, -1).join('.');
    form.setValue("scriptTitle", fileName); // Pre-fill title from filename

    let parsedContent = "";
    let errorOccurred = false;

    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        parsedContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        parsedContent = await parseDocx(file);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        parsedContent = await parsePdf(file);
      } else {
        showError("Unsupported file type. Please upload a .txt, .docx, or .pdf file.");
        errorOccurred = true;
      }

      if (!errorOccurred) {
        form.setValue("scriptText", parsedContent);
        showSuccess("Script file loaded successfully!");
      }
    } catch (error: unknown) {
      console.error("File parsing error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to read script file.";
      showError(errorMessage);
      errorOccurred = true;
    } finally {
      if (errorOccurred) {
        event.target.value = ''; // Clear the file input on error
        form.setValue("scriptText", ""); // Clear script text if parsing failed
      }
    }
  };

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const { scriptText, scriptTitle, ...rest } = values;
    // Map form fields to ScriptParams interface
    const params: ScriptParams = {
      title: scriptTitle,
      targetProductionBudget: values.targetProductionBudget,
      targetAudience: values.targetAudience,
      creativeFlexibility: values.creativeFlexibility,
      creativeDirectionNotes: values.creativeDirectionNotes,
    };
    onSubmit(scriptText, params);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Upload Script & Set Parameters</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="scriptTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Script Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., My Awesome Web Series Pilot" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive title for your script.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scriptText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Script Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste your script here or upload a .txt, .docx, or .pdf file..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Paste the full text of your script or treatment.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Upload Script File</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".txt,.docx,.pdf"
                onChange={handleFileChange}
                className="file:text-primary file:font-medium"
              />
            </FormControl>
            <FormDescription>
              Upload a plain text (.txt), Microsoft Word (.docx), or PDF (.pdf) file. The title will be pre-filled from the filename.
            </FormDescription>
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="targetProductionBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Production Budget ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Your estimated total budget for this production.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Demographic/Audience</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Young Adults (18-34)" {...field} />
                </FormControl>
                <FormDescription>
                  Who is your primary audience? (e.g., 'Teens', 'Families', 'Tech Enthusiasts')
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creativeFlexibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Willingness to Adapt Creative</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flexibility level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no-changes">No changes</SelectItem>
                    <SelectItem value="minor-dialogue-changes">Minor dialogue changes</SelectItem>
                    <SelectItem value="scene-level-changes">Scene-level changes</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How open are you to making creative adjustments for sponsorships?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creativeDirectionNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Optional Creative Direction Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any specific creative notes for the AI..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide any additional context that might help identify opportunities.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">Analyze Script</Button>
        </form>
      </Form>
    </div>
  );
};

export default ScriptInputForm;