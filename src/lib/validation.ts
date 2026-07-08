import { z } from "zod"

export const numberString = z
  .string()
  .refine((value) => value === "" || !Number.isNaN(Number(value)), "Debe ser un número")
  .refine((value) => value === "" || Number(value) >= 0, "Debe ser mayor o igual a 0")

export const positiveNumberString = z
  .string()
  .refine((value) => value !== "" && !Number.isNaN(Number(value)), "Debe ser un número")
  .refine((value) => value === "" || Number(value) > 0, "Debe ser mayor a 0")
