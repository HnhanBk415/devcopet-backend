import { ChallengeExplanationBuilderService } from './challenge-explanation-builder.service';

describe('ChallengeExplanationBuilderService', () => {
  const service = new ChallengeExplanationBuilderService();

  it('builds a Python role explanation with question-specific terms', () => {
    const result = service.build({
      mode: 'easy',
      challengeType: 'multiple_choice',
      title: 'What Python Does',
      question: 'What is Python doing when it runs your program?',
      correctAnswerText: 'It follows saved instructions step by step.',
      options: [
        { id: 'A', text: 'It follows saved instructions step by step.' },
        { id: 'B', text: 'It guesses what the developer wanted.' },
      ],
      baseExplanation: 'This is a foundation concept, so lock it in.',
    });

    expect(result.explanation).toContain('Python executes');
    expect(result.explanation).toContain('instructions');
    expect(result.explanation).toContain('program');
    expect(result.explanation).toContain('does not guess');
    expect(result.explanation).toContain('step by step');
    expect(result.explanation).not.toContain('foundation concept');
    expect(result.explanation).not.toContain('...');
  });

  it('builds an app.py command explanation with terminal details', () => {
    const result = service.build({
      mode: 'easy',
      challengeType: 'multiple_choice',
      title: 'Run a Python File',
      question: 'Which command runs the saved app.py file?',
      correctAnswerText: 'python app.py',
      options: [
        { id: 'A', text: 'python app.py' },
        { id: 'B', text: 'python' },
      ],
      baseExplanation: 'The key is to understand each step without rushing.',
    });

    expect(result.explanation).toContain('python app.py');
    expect(result.explanation).toContain('terminal');
    expect(result.explanation).toContain('saved file');
    expect(result.explanation).toContain('interpreter');
    expect(result.explanation).toContain('file name');
    expect(result.explanation).toContain('command');
    expect(result.explanation).not.toContain('without rushing');
  });

  it('keeps different questions specific instead of returning one generic suffix', () => {
    const pythonRole = service.build({
      mode: 'easy',
      challengeType: 'multiple_choice',
      title: 'Python Role',
      question: 'What does Python do with a program?',
      correctAnswerText: 'It follows saved instructions step by step.',
      baseExplanation: 'This is a foundation concept.',
    });
    const command = service.build({
      mode: 'easy',
      challengeType: 'multiple_choice',
      title: 'Command',
      question: 'Which terminal command runs app.py?',
      correctAnswerText: 'python app.py',
      baseExplanation: 'This is a foundation concept.',
    });

    expect(pythonRole.explanation).not.toBe(command.explanation);
    expect(pythonRole.explanation).toContain('instructions');
    expect(command.explanation).toContain('terminal');
  });
});
