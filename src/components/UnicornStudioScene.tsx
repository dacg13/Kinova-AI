import React, { useEffect, useRef } from 'react';

interface UnicornStudioSceneProps {
  projectId: string;
  className?: string;
  style?: React.CSSProperties;
}

export const UnicornStudioScene: React.FC<UnicornStudioSceneProps> = ({
  projectId,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Native JavaScript SDK loader & initializer
    const scriptId = 'unicorn-studio-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initScene = () => {
      const w = window as any;
      if (w.UnicornStudio && typeof w.UnicornStudio.init === 'function') {
        try {
          w.UnicornStudio.init();
        } catch (e) {
          console.warn('Unicorn Studio initialization warning:', e);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js';
      script.onload = initScene;
      (document.head || document.body).appendChild(script);
    } else {
      const w = window as any;
      if (w.UnicornStudio) {
        initScene();
      } else {
        script.addEventListener('load', initScene);
      }
    }

    return () => {
      // Clean up event listener if the script hasn't loaded yet
      if (script) {
        script.removeEventListener('load', initScene);
      }
    };
  }, [projectId]);

  return (
    <div
      ref={containerRef}
      data-us-project={projectId}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...style,
      }}
    />
  );
};
