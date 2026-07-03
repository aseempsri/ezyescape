import useTypewriter from '../hooks/useTypewriter';

export default function Typewriter({ text, className = 'typewriter-cursor', style, speed = 120, pause = 2000 }) {
  const display = useTypewriter(text, speed, pause);
  return (
    <em
      className={className}
      style={{ fontSize: 'inherit', fontStyle: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', ...style }}
    >
      {display}
    </em>
  );
}
