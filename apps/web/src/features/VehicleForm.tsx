import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Vehicle } from "../types";
const schema = z.object({
  make: z.string().trim().min(1, "Make is required").max(80),
  model: z.string().trim().min(1, "Model is required").max(100),
  category: z.string().trim().min(1, "Category is required").max(50),
  price: z
    .string()
    .regex(
      /^(0|[1-9]\d{0,11})(\.\d{1,2})?$/,
      "Enter a valid price with up to two decimals",
    )
    .refine((v) => /[1-9]/.test(v), "Price must be positive"),
  quantity: z.number().int().min(0).max(2147483647),
});
export type VehicleValues = z.infer<typeof schema>;
export function VehicleForm({
  vehicle,
  onSave,
  pending,
  error,
}: {
  vehicle?: Vehicle;
  onSave: (values: VehicleValues) => void;
  pending: boolean;
  error?: string;
}) {
  const form = useForm<VehicleValues>({
    resolver: zodResolver(schema),
    defaultValues: vehicle
      ? {
          make: vehicle.make,
          model: vehicle.model,
          category: vehicle.category,
          price: vehicle.price,
          quantity: vehicle.quantity,
        }
      : { make: "", model: "", category: "SUV", price: "", quantity: 1 },
  });
  return (
    <form noValidate onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      {(["make", "model", "category", "price", "quantity"] as const).map(
        (key) => (
          <label key={key} className="field">
            {key === "price"
              ? "Price (INR)"
              : key[0].toUpperCase() + key.slice(1)}
            <input
              {...form.register(
                key,
                key === "quantity" ? { valueAsNumber: true } : {},
              )}
              type={key === "quantity" ? "number" : "text"}
              inputMode={key === "price" ? "decimal" : undefined}
            />
            {form.formState.errors[key] && (
              <span className="field-error">
                {form.formState.errors[key]?.message}
              </span>
            )}
          </label>
        ),
      )}
      {vehicle && (
        <p className="text-xs text-slate-400">
          Quantity replaces current stock. Refresh before editing; use Restock
          to add units.
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="primary w-full" disabled={pending}>
        {pending ? "Saving…" : "Save vehicle"}
      </button>
    </form>
  );
}
