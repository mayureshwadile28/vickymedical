'use server';
/**
 * @fileOverview A flow for scanning and interpreting medical prescriptions.
 *
 * - scanPrescription - A function that takes an image of a prescription and returns a list of identified medicine names.
 * - ScanPrescriptionInput - The input type for the scanPrescription function.
 * - ScanPrescriptionOutput - The return type for the scanPrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanPrescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a medical prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanPrescriptionInput = z.infer<typeof ScanPrescriptionInputSchema>;

const ScanPrescriptionOutputSchema = z.object({
  medicines: z.array(z.string()).describe('A list of medicine names identified from the prescription.'),
});
export type ScanPrescriptionOutput = z.infer<typeof ScanPrescriptionOutputSchema>;


export async function scanPrescription(input: ScanPrescriptionInput): Promise<ScanPrescriptionOutput> {
  return scanPrescriptionFlow(input);
}


const prescriptionPrompt = ai.definePrompt({
    name: 'prescriptionPrompt',
    input: { schema: ScanPrescriptionInputSchema },
    output: { schema: ScanPrescriptionOutputSchema },
    model: 'googleai/gemini-pro-vision',
    prompt: `You are an expert pharmacist. Your task is to analyze the provided image of a medical prescription.
    The handwriting may be messy. Use your knowledge of common medicines to decipher the text.
    Identify only the names of the medicines prescribed and list them.
    
    Prescription Image: {{media url=photoDataUri}}`,
});


const scanPrescriptionFlow = ai.defineFlow(
  {
    name: 'scanPrescriptionFlow',
    inputSchema: ScanPrescriptionInputSchema,
    outputSchema: ScanPrescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prescriptionPrompt(input);
    if (!output) {
      return { medicines: [] };
    }
    return output;
  }
);
