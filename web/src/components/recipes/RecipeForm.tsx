"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";
import type { Recipe, IngredientItem, StepItem } from "@/types";

interface RecipeFormProps {
  initialData?: Partial<Recipe>;
  onSubmit: (data: Partial<Recipe>) => Promise<void>;
  isLoading?: boolean;
}

export function RecipeForm({ initialData, onSubmit, isLoading }: RecipeFormProps) {
  const [type, setType] = useState<"link" | "manual">(initialData?.type || "manual");
  const [name, setName] = useState(initialData?.name || "");
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [servings, setServings] = useState(String(initialData?.servings || ""));
  const [prepTime, setPrepTime] = useState(String(initialData?.prepTimeMins || ""));
  const [cookTime, setCookTime] = useState(String(initialData?.cookTimeMins || ""));
  const [ingredients, setIngredients] = useState<IngredientItem[]>(initialData?.ingredients || []);
  const [steps, setSteps] = useState<StepItem[]>(initialData?.steps || []);

  const addIngredient = () => setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  const updateIngredient = (i: number, field: keyof IngredientItem, value: string) => {
    const updated = [...ingredients];
    updated[i] = { ...updated[i], [field]: value };
    setIngredients(updated);
  };
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));

  const addStep = () => setSteps([...steps, { order: steps.length + 1, instruction: "" }]);
  const updateStep = (i: number, instruction: string) => {
    const updated = [...steps];
    updated[i] = { ...updated[i], instruction };
    setSteps(updated);
  };
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name, type, sourceUrl: sourceUrl || undefined, description: description || undefined,
      servings: servings ? parseInt(servings) : undefined,
      prepTimeMins: prepTime ? parseInt(prepTime) : undefined,
      cookTimeMins: cookTime ? parseInt(cookTime) : undefined,
      ingredients: type === "manual" && ingredients.length > 0 ? ingredients.filter(i => i.name) : undefined,
      steps: type === "manual" && steps.length > 0 ? steps.filter(s => s.instruction) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        {(["manual", "link"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${type === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
          >
            {t === "manual" ? "Manual" : "Link"}
          </button>
        ))}
      </div>
      <Input label="Recipe name" value={name} onChange={(e) => setName(e.target.value)} required />
      {type === "link" ? (
        <Input label="Recipe URL" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
      ) : (
        <>
          <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2">
            <Input label="Servings" type="number" value={servings} onChange={(e) => setServings(e.target.value)} className="flex-1" />
            <Input label="Prep (mins)" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="flex-1" />
            <Input label="Cook (mins)" type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="flex-1" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Ingredients</label>
              <Button type="button" variant="ghost" size="sm" onClick={addIngredient}><Plus size={14} /></Button>
            </div>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-1 mb-1">
                <Input placeholder="Name" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} className="flex-1" />
                <Input placeholder="Qty" value={ing.quantity || ""} onChange={(e) => updateIngredient(i, "quantity", e.target.value)} className="w-16" />
                <Input placeholder="Unit" value={ing.unit || ""} onChange={(e) => updateIngredient(i, "unit", e.target.value)} className="w-16" />
                <button type="button" onClick={() => removeIngredient(i)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Steps</label>
              <Button type="button" variant="ghost" size="sm" onClick={addStep}><Plus size={14} /></Button>
            </div>
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2 mb-2 items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-medium mt-2">{step.order}</span>
                <textarea
                  value={step.instruction}
                  onChange={(e) => updateStep(i, e.target.value)}
                  placeholder="Describe this step..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                  rows={2}
                />
                <button type="button" onClick={() => removeStep(i)} className="p-2 text-gray-400 hover:text-red-400 mt-1"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </>
      )}
      <Button type="submit" disabled={!name || isLoading} size="lg" className="w-full">
        {isLoading ? "Saving..." : "Save Recipe"}
      </Button>
    </form>
  );
}
