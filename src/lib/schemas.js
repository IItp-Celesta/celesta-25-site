import { z } from "zod";

export const registrationSchema = z
  .object({
    // Form fields
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email format"),
    gender: z.enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Please select a gender" }),
    }),
    
    phone: z.string().regex(/^\d{10}$/, "Must be exactly 10 digits"),
    college: z.string().min(2, "Institute name is required"),
    cityState: z.string().min(2, "City/State is required"),
    workshop: z.string().min(1, "Please select a workshop"),

    isIITP: z.enum(["yes", "no"], {
      required_error: "Please specify IITP status",
    }),
    rollNumber: z
      .string()
      .transform((value) => value.toUpperCase())
      .optional(),
    requireAccommodation: z.enum(["yes", "no"]).default("no"),
    accommodationDays: z.string().optional(),

    id: z.string().optional(),
    workshopFee: z.number().optional(),
    accommodationFee: z.number().optional(),
    totalAmount: z.number().optional(),
    
    upiId: z.string().optional(),
    workshopTxnId: z.string().optional(),
    accomTxnId: z.string().optional(),
    
    workshopScreenshot: z.any().optional(),
    accommodationScreenshot: z.any().optional(),
    aadhaarScreenshot: z.any().optional(),
    
    registrationTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isIITP === "yes") {
      if (!data.rollNumber || data.rollNumber.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rollNumber"],
          message: "Roll Number is mandatory",
        });
        return;
      }
      if (!/^\d{4}[A-Z]{2}\d{2}$/.test(data.rollNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rollNumber"],
          message: "Enter a valid Roll Number",
        });
      }
    }
  });