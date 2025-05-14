export const calculateTimeRemaining = (targetTime: string | Date) => {
  const now = new Date().getTime();
  const distance = new Date(targetTime).getTime() - now;

  const hrs = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    hrs: hrs >= 0 ? hrs : 0,
    mins: mins >= 0 ? mins : 0,
    secs: secs >= 0 ? secs : 0,
    finished: distance <= 0,
  };
};
