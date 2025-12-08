import { useState, useEffect } from 'react';

interface TimeState {
  date: Date;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export const useClockTime = (continuous: boolean = false): TimeState => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    let animationFrameId: number;
    let intervalId: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;

    const update = () => {
      setTime(new Date());
    };

    if (continuous) {
      const loop = () => {
        update();
        animationFrameId = requestAnimationFrame(loop);
      };
      loop();
    } else {
      update();
      // Align with the next second to prevent lag
      const now = new Date();
      const msUntilNextSecond = 1000 - now.getMilliseconds();

      timeoutId = setTimeout(() => {
        update();
        intervalId = setInterval(update, 1000);
      }, msUntilNextSecond);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [continuous]);

  return {
    date: time,
    hours: time.getHours(),
    minutes: time.getMinutes(),
    seconds: time.getSeconds(),
    milliseconds: time.getMilliseconds(),
  };
};