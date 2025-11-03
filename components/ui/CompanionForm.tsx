"use client"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { subjects } from "@/constants"
import { Textarea } from "@/components/ui/textarea"
import { createCompanion } from "@/assets/lib/actions/companion.actions"



const formSchema = z.object({
  name: z.string().min(1, { message: 'Companion is required.' }),
  subject: z.string().min(1, { message: 'Subject is required.' }),
  topic: z.string().min(1, { message: 'Topic is required.' }),
  voice: z.string().min(1, { message: 'Voice is required.' }),
  style: z.string().min(1, { message: 'Style is required.' }),
  duration: z.coerce.number().min(1, { message: 'Duration is required.' })
})

function CompanionForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      topic: "",
      voice: "",
      style: "",
      duration: 15,
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log("Submitting companion data:", data);
      // Server action now handles redirect internally
      await createCompanion(data);
      // If we reach here without redirect, there might be an issue
      console.log("CreateCompanion completed without redirect");
    } catch (err) {
      console.error("Error creating companion:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (

    <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-title">
                Companion Name
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                placeholder="Enter the Companion Name"
                className="input"
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="subject"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              // orientation="responsive"
              data-invalid={fieldState.invalid}
            >

              <FieldLabel htmlFor="form-rhf-select-language">
                Subject
              </FieldLabel>

              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger
                  className="input capitalize"
                >
                  <SelectValue placeholder="Select the subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem
                      key={subject}
                      value={subject}
                      className="capitalize"
                    >
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="topic"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-textarea-about">
                What should the companion help with?
              </FieldLabel>
              <Textarea
                {...field}
                id="form-rhf-textarea-about"
                aria-invalid={fieldState.invalid}
                placeholder="Ex: Derivatives and Integrals"
                className="input"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="voice"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              // orientation="responsive"
              data-invalid={fieldState.invalid}
            >

              <FieldLabel htmlFor="form-rhf-select-language">
                Voice
              </FieldLabel>

              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger
                  className="input"
                >
                  <SelectValue placeholder="Select the Voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">
                    Male</SelectItem>
                  <SelectItem value="female">
                    Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="style"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              // orientation="responsive"
              data-invalid={fieldState.invalid}
            >

              <FieldLabel htmlFor="form-rhf-select-language">
                Style
              </FieldLabel>

              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger
                  className="input"
                >
                  <SelectValue placeholder="Select the Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">
                    Formal</SelectItem>
                  <SelectItem value="casual">
                    Casual</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="duration"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-title">
                Estimated Session Duration in Minutes
              </FieldLabel>
              <Input
                {...field}
                type="number"
                aria-invalid={fieldState.invalid}
                placeholder="15"
                className="input"
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Companion..." : "Build Your Companion"}
        </Button>
      </FieldGroup>
    </form >

  )

}

export default CompanionForm