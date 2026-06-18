/**
 * DTO for submitting onboarding assessment answers.
 *
 * FE collects all 15 answers client-side, then submits once.
 */
export class AnswerItemDto {
  questionNumber!: number;
  selectedOption!: string; // "A" | "B" | "C" | "D" (or "E" | "F" for Q15)
}

export class SubmitAnswersDto {
  answers!: AnswerItemDto[];
}
