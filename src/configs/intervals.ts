let intervalsIds;

export const initIntervals = () => {
  intervalsIds = new Map();
}

export const getIntervalId = (chatId: number): number | null => {
  if (intervalsIds.has(chatId)) {
    return intervalsIds.get(chatId);
  }

  return null;
}

export const isIntervalExist = (chatId: number): boolean => {
  return intervalsIds.has(chatId);
}

export const setIntervalId = (chatId: number, intervalId: NodeJS.Timeout) => {
  intervalsIds.set(chatId, intervalId);
}

export const clearCurrentInterval = (chatId) => {
  if (intervalsIds.has(chatId)) {
    clearInterval(intervalsIds.get(chatId));
  }
}

export const deleteCurrentInterval = (chatId) => {
  if (intervalsIds.has(chatId)) {
    intervalsIds.delete(chatId);
  }
}