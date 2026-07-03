import { useEffect, useState } from 'react';

export default function useTypewriter(text, speed = 120, pause = 2000) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let index = 0;
    let timeoutId;

    function type() {
      if (index < text.length) {
        setDisplay(text.slice(0, index + 1));
        index += 1;
        timeoutId = setTimeout(type, speed);
      } else {
        timeoutId = setTimeout(() => {
          index = 0;
          setDisplay('');
          type();
        }, pause);
      }
    }

    type();
    return () => clearTimeout(timeoutId);
  }, [text, speed, pause]);

  return display;
}
