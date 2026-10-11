interface MascotProps {
  size?: number;
  expression?: 'happy' | 'excited' | 'thinking' | 'celebrating';
  className?: string;
}

export function Mascot({ size = 120, expression = 'happy', className = '' }: MascotProps) {
  const eyeY = expression === 'thinking' ? 52 : 50;
  const mouthPath = {
    happy: 'M55 68 Q65 76 75 68',
    excited: 'M55 66 Q65 80 75 66',
    thinking: 'M58 70 Q68 70 72 72',
    celebrating: 'M50 65 Q65 85 80 65',
  }[expression];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 130 130"
      fill="none"
      className={className}
      aria-label="BingeLingo mascot"
    >
      {/* Speech bubble body */}
      <ellipse cx="65" cy="65" rx="55" ry="50" fill="#ffb3cc" stroke="#f74e88" strokeWidth="2.5" />
      {/* Bubble tail */}
      <path d="M45 105 Q35 115 25 118 Q40 112 48 108" fill="#ffb3cc" stroke="#f74e88" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Cheeks */}
      <circle cx="38" cy="65" r="8" fill="#ff8fb3" opacity="0.6" />
      <circle cx="92" cy="65" r="8" fill="#ff8fb3" opacity="0.6" />
      {/* Eyes */}
      {expression === 'thinking' ? (
        <>
          <ellipse cx="48" cy={eyeY} rx="4" ry="5" fill="#2d1b3d" />
          <path d="M78 48 Q82 44 84 48" stroke="#2d1b3d" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : expression === 'celebrating' ? (
        <>
          <path d="M42 48 L52 50 M42 50 L52 48" stroke="#2d1b3d" strokeWidth="3" strokeLinecap="round" />
          <path d="M78 48 L88 50 M78 50 L88 48" stroke="#2d1b3d" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="48" cy={eyeY} rx="4.5" ry={expression === 'excited' ? 6 : 5.5} fill="#2d1b3d" />
          <ellipse cx="82" cy={eyeY} rx="4.5" ry={expression === 'excited' ? 6 : 5.5} fill="#2d1b3d" />
          <circle cx="49.5" cy={eyeY - 1.5} r="1.5" fill="#fff" />
          <circle cx="83.5" cy={eyeY - 1.5} r="1.5" fill="#fff" />
        </>
      )}
      {/* Mouth */}
      <path d={mouthPath} stroke="#2d1b3d" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Sparkle decoration */}
      <g className="animate-sparkle" style={{ transformOrigin: '105px 30px' }}>
        <path d="M105 25 L107 30 L112 32 L107 34 L105 39 L103 34 L98 32 L103 30 Z" fill="#ffe866" stroke="#f5c706" strokeWidth="1" />
      </g>
      <g className="animate-sparkle" style={{ transformOrigin: '22px 45px', animationDelay: '0.3s' }}>
        <path d="M22 42 L23 45 L26 46 L23 47 L22 50 L21 47 L18 46 L21 45 Z" fill="#a06be0" opacity="0.7" />
      </g>
    </svg>
  );
}
