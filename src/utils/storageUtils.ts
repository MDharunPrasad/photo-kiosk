export const clearOldSessions = (hoursToKeep: number = 24): void => {
  try {
    const sessions = JSON.parse(localStorage.getItem('photoBoothSessions') || '[]');
    const cutoffTime = new Date().getTime() - (hoursToKeep * 60 * 60 * 1000);
    
    const recentSessions = sessions.filter((session: any) => {
      const sessionTime = new Date(session.date).getTime();
      return session.status === 'Active' || sessionTime > cutoffTime;
    });
    
    localStorage.setItem('photoBoothSessions', JSON.stringify(recentSessions));
    console.log(`Cleaned up ${sessions.length - recentSessions.length} old sessions`);
  } catch (error) {
    console.error('Error cleaning up old sessions:', error);
  }
};

export const getStorageInfo = (): string => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  
  const mb = total / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};