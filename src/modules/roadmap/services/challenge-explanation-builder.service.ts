import { Injectable } from '@nestjs/common';

export type BuildChallengeExplanationInput = {
  mode: 'easy' | 'medium' | 'hard';
  challengeType: string;
  title: string;
  question: string;
  correctAnswerText?: string;
  selectedAnswerText?: string;
  options?: Array<{ id: string; text: string }>;
  codeSnippet?: unknown;
  baseExplanation?: string;
  topicTitle?: string;
};

export type BuiltChallengeExplanation = {
  explanation: string;
  learningPoint: string;
  whyCorrect?: string;
  commonMistake?: string;
  steps?: string[];
};

const GENERIC_PHRASES = [
  'the key is to understand each step without rushing',
  'you are making steady progress; keep this rhythm',
  'this is a foundation concept',
  'let me walk through it slowly',
  'matches the key rule',
  'key rule in the checkpoint',
];

@Injectable()
export class ChallengeExplanationBuilderService {
  build(input: BuildChallengeExplanationInput): BuiltChallengeExplanation {
    const question = this.clean(input.question);
    const title = this.clean(input.title || input.topicTitle || 'checkpoint');
    const correctAnswerText = this.clean(input.correctAnswerText);
    const selectedAnswerText = this.clean(input.selectedAnswerText);
    const baseExplanation = this.clean(input.baseExplanation);
    const usableBase = this.isSpecificBase(baseExplanation)
      ? baseExplanation
      : undefined;
    const challengeType = input.challengeType || 'multiple_choice';

    if (this.isPythonRoleQuestion(input, correctAnswerText)) {
      return this.result({
        explanation:
          `${question} The correct idea is that Python executes the instructions saved in a program step by step. ` +
          'It does not guess missing logic; it follows the syntax and statements written by the developer, then reports errors when the program breaks those rules.',
        learningPoint:
          'Python runs saved program instructions step by step instead of guessing intent.',
        whyCorrect:
          'The answer focuses on execution: Python follows the written instructions in the program.',
        commonMistake:
          'A common mistake is treating Python like it can infer missing logic instead of executing the code exactly as written.',
        steps: [
          'Read the role asked by the prompt.',
          'Match that role to executing saved program instructions.',
          'Reject options that imply guessing or inventing logic.',
        ],
      });
    }

    if (this.isAppPyCommandQuestion(input, correctAnswerText)) {
      return this.result({
        explanation:
          `${question} The command is ${correctAnswerText || 'python app.py'} because the terminal sends the saved file name ` +
          'to the Python interpreter. The word python starts the interpreter, and app.py tells it which file to run.',
        learningPoint:
          'Run a saved Python file from the terminal with the interpreter name followed by the file name.',
        whyCorrect: `${correctAnswerText || 'python app.py'} names both the Python interpreter and the saved file to execute.`,
        commonMistake:
          'A common mistake is typing only the file name or only python, which does not clearly run that saved script.',
        steps: [
          'Open the terminal in the folder with the saved file.',
          'Start the Python interpreter with python.',
          'Pass the file name app.py as the command target.',
        ],
      });
    }

    if (challengeType === 'multiple_choice') {
      return this.buildMultipleChoice({
        question,
        title,
        correctAnswerText,
        selectedAnswerText,
        options: input.options,
        usableBase,
      });
    }

    if (challengeType === 'code_trace') {
      return this.result({
        explanation:
          `${question} This is a trace question, so follow the code in execution order and update the state after each line. ` +
          `${usableBase ?? 'The correct result is the value produced after the last relevant statement runs.'}`,
        learningPoint:
          'For code tracing, update state line by line and use the final state as the answer.',
        whyCorrect: usableBase,
        commonMistake:
          'A common mistake is reading the code by intention instead of by the actual execution order.',
        steps: [
          'Start with the initial values.',
          'Apply each statement in order.',
          'Use the final state or output requested by the prompt.',
        ],
      });
    }

    if (
      challengeType === 'drag_drop' ||
      challengeType === 'drag_drop_matching'
    ) {
      return this.result({
        explanation:
          `${question} This placement works because each item must match the role required by its blank or target. ` +
          `${usableBase ?? 'Check the surrounding code or wording, then place the item that makes that role true.'}`,
        learningPoint:
          'For drag-and-drop questions, match each item by role before checking details.',
        whyCorrect: usableBase,
        commonMistake:
          'A common mistake is matching by familiar words instead of by the role each blank needs.',
        steps: [
          'Name the role of each blank or target.',
          'Match the item that satisfies that role.',
          'Verify the completed result still reads or runs correctly.',
        ],
      });
    }

    if (challengeType === 'ordering_steps') {
      return this.result({
        explanation:
          `${question} The correct order follows dependency order: do the step that creates or prepares information before the step that uses it. ` +
          `${usableBase ?? 'That keeps the process valid from the first step through the final result.'}`,
        learningPoint:
          'Order steps by dependency: prepare first, use later, verify last.',
        whyCorrect: usableBase,
        commonMistake:
          'A common mistake is choosing a step that sounds important before checking whether its inputs exist yet.',
        steps: [
          'Find the first required setup step.',
          'Place dependent actions after their inputs exist.',
          'End with the step that produces or verifies the requested result.',
        ],
      });
    }

    return this.result({
      explanation:
        `${question} The correct response is tied to the requirement in "${title}". ` +
        `${usableBase ?? 'Identify what the prompt asks for, apply the relevant rule, and check that the result satisfies that requirement.'}`,
      learningPoint:
        'Tie the answer back to the exact requirement in the prompt.',
      whyCorrect: usableBase,
      commonMistake:
        'A common mistake is answering from a familiar pattern without checking the exact wording of the prompt.',
      steps: [
        'Read the requirement.',
        'Apply the matching rule or operation.',
        'Check the answer against the requested result.',
      ],
    });
  }

  private buildMultipleChoice(input: {
    question: string;
    title: string;
    correctAnswerText?: string;
    selectedAnswerText?: string;
    options?: Array<{ id: string; text: string }>;
    usableBase?: string;
  }): BuiltChallengeExplanation {
    const answer = input.correctAnswerText;
    const distractors = this.optionTexts(input.options).filter(
      (option) => option !== answer,
    );
    const selectedMismatch =
      input.selectedAnswerText && input.selectedAnswerText !== answer
        ? ` The selected option "${input.selectedAnswerText}" does not match that requirement as directly.`
        : '';
    const whyDistractors = distractors.length
      ? ` The other options are distractors because they do not satisfy the prompt requirement in "${input.title}".`
      : '';
    const answerSentence = answer
      ? `The correct answer is "${answer}" because it directly answers: ${input.question}.`
      : `The correct answer is the option that directly answers: ${input.question}.`;

    return this.result({
      explanation: `${answerSentence} ${input.usableBase ?? 'It matches the rule or behavior the question is testing.'}${selectedMismatch}${whyDistractors} Takeaway: connect the requirement to the rule, then to the result.`,
      learningPoint:
        'In multiple choice questions, match the option to the exact requirement before eliminating distractors.',
      whyCorrect: input.usableBase ?? answerSentence,
      commonMistake:
        'A common mistake is choosing a familiar-looking option before checking whether it answers this prompt.',
      steps: [
        'Underline what the question asks.',
        'Match the correct option to that requirement.',
        'Eliminate options that describe a different role or result.',
      ],
    });
  }

  private isPythonRoleQuestion(
    input: BuildChallengeExplanationInput,
    correctAnswerText?: string,
  ) {
    const combined = this.searchText(input, correctAnswerText);
    return (
      combined.includes('python') &&
      (combined.includes('instructions') ||
        combined.includes('program') ||
        combined.includes('step by step')) &&
      !combined.includes('app.py')
    );
  }

  private isAppPyCommandQuestion(
    input: BuildChallengeExplanationInput,
    correctAnswerText?: string,
  ) {
    const combined = this.searchText(input, correctAnswerText);
    return combined.includes('app.py') && combined.includes('python');
  }

  private searchText(
    input: BuildChallengeExplanationInput,
    correctAnswerText?: string,
  ) {
    return [
      input.title,
      input.question,
      input.baseExplanation,
      correctAnswerText,
      ...this.optionTexts(input.options),
    ]
      .join(' ')
      .toLowerCase();
  }

  private optionTexts(options?: Array<{ text: string }>) {
    return (
      options?.map((option) => this.clean(option.text)).filter(Boolean) ?? []
    );
  }

  private isSpecificBase(text?: string) {
    if (!text) return false;
    const lower = text.toLowerCase();
    if (GENERIC_PHRASES.some((phrase) => lower.includes(phrase))) return false;
    return text.length >= 24;
  }

  private result(output: BuiltChallengeExplanation): BuiltChallengeExplanation {
    return {
      ...output,
      explanation: this.clean(output.explanation),
      learningPoint: this.clean(output.learningPoint),
      whyCorrect: this.clean(output.whyCorrect),
      commonMistake: this.clean(output.commonMistake),
      steps: output.steps?.map((step) => this.clean(step)).filter(Boolean),
    };
  }

  private clean(text?: string) {
    return text?.trim().replace(/\s+/g, ' ') ?? '';
  }
}
