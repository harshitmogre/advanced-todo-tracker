export type MotivationTone = 'start' | 'progress' | 'close' | 'done';

export interface MotivationResult {
  message: string;
  subtext: string;
  tone: MotivationTone;
}

export function getMotivationMessage(completed: number, total: number): MotivationResult {
  const pending = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  if (total === 0) {
    return { message: 'Your first task is waiting.', subtext: 'Add something small to get moving.', tone: 'start' };
  }

  if (rate === 100) {
    return { message: 'Nothing left unfinished.', subtext: 'You did it. Enjoy the rest of your day.', tone: 'done' };
  }

  if (pending === 1 && rate >= 70) {
    return { message: 'One task stands between you and a complete day.', subtext: 'Finish it now.', tone: 'close' };
  }

  if (rate >= 90) {
    return { message: "Don't stop at 90%.", subtext: `Just ${pending} task${pending === 1 ? '' : 's'} left.`, tone: 'close' };
  }

  if (rate >= 80) {
    return { message: "You're almost there.", subtext: 'Finish strong.', tone: 'close' };
  }

  if (rate >= 60) {
    return { message: "You're close to completing your day.", subtext: `${pending} task${pending === 1 ? '' : 's'} to go.`, tone: 'progress' };
  }

  if (rate >= 50) {
    return { message: "You're halfway there.", subtext: 'Keep the momentum going.', tone: 'progress' };
  }

  return {
    message: `You have ${pending} unfinished task${pending === 1 ? '' : 's'} today.`,
    subtext: 'Pick one and start.',
    tone: 'start'
  };
}
