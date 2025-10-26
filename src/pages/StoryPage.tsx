import React from 'react';
import { ArrowLeft } from 'phosphor-react';
import { ShimmerSkeleton } from '../components/ShimmerSkeleton';
import { colors } from '../tokens/colors';

interface StoryPageProps {
  id?: string;
  username?: string;
  avatarUrl?: string;
  videoSrc?: string;
}

// Local default video
const DEFAULT_VIDEO = '/src/assets/video_1.mp4';

const StoryPage: React.FC<StoryPageProps> = ({
  id,
  username = '@cr_ia.pro',
  avatarUrl = '/src/assets/logo.jpg',
  videoSrc = DEFAULT_VIDEO,
}) => {
  const [isVideoReady, setIsVideoReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // 0 - 100
  const [isPaused, setIsPaused] = React.useState(false);
  const progressRef = React.useRef<number>(0);
  const timerRef = React.useRef<number | null>(null);
  const scrollLockRef = React.useRef<boolean>(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Playlist support: current index and list of videos
  const videos = React.useMemo(() => [
    '/src/assets/video_2.mp4',
    videoSrc || DEFAULT_VIDEO,
    '/src/assets/video_3.mp4',
    'landing-page-placeholder', // Placeholder for the landing page
  ], [videoSrc]);

  // Video metadata mapping
  const videoMetadata = React.useMemo(() => [
    {
      title: 'CR_IA - Pro',
      subtitle: 'O futuro dos vídeos de IA com o Sora 2'
    },
    {
      title: 'CR_IA - Pro',
      subtitle: 'Ética e responsabilidade no uso da IA'
    },
    {
      title: 'CR_IA - Pro',
      subtitle: 'Rinha de ideias com GPT e Claude'
    },
    { // Metadata for the landing page
      title: 'CR_IA - Pro',
      subtitle: 'Domine a IA em 6 semanas!'
    }
  ], []);

  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const currentVideoSrc = videos[currentVideoIndex] || videoSrc;
  const currentMetadata = videoMetadata[currentVideoIndex] || videoMetadata[0];
  const isLandingPageActive = currentVideoSrc === 'landing-page-placeholder';

  const nextVideo = React.useCallback(() => {
    setProgress(0);
    progressRef.current = 0;
    setIsPaused(false); // Reset pause state
    setCurrentVideoIndex((idx) => {
      const newIdx = idx < videos.length - 1 ? idx + 1 : idx;
      if (newIdx === idx) {
        // End of playlist, do nothing or loop, or navigate away
        // eslint-disable-next-line no-console
        console.log('End of playlist');
      }
      // Set isVideoReady based on the *new* item type
      if (videos[newIdx] === 'landing-page-placeholder') {
        setIsVideoReady(true); // Landing page is "ready" immediately
      } else {
        setIsVideoReady(false); // Video needs to load
      }
      return newIdx;
    });
  }, [videos.length, videos]);

  const prevVideo = React.useCallback(() => {
    setProgress(0);
    progressRef.current = 0;
    setIsPaused(false); // Reset pause state
    setCurrentVideoIndex((idx) => {
      const newIdx = idx > 0 ? idx - 1 : 0;
      // Set isVideoReady based on the *new* item type
      if (videos[newIdx] === 'landing-page-placeholder') {
        setIsVideoReady(true); // Landing page is "ready" immediately
      } else {
        setIsVideoReady(false); // Video needs to load
      }
      return newIdx;
    });
  }, [videos]);

  const handleNext = React.useCallback(() => {
    // Placeholder next story behavior
    // eslint-disable-next-line no-console
    console.log('Next story');
    // Reset progress for demo purposes
    setProgress(0);
    progressRef.current = 0;
    nextVideo();
  }, []);

  const handlePrev = React.useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Previous story');
    setProgress(0);
    progressRef.current = 0;
    prevVideo();
  }, []);

  const handlePauseToggle = React.useCallback(() => {
    if (isLandingPageActive) return; // Don't pause landing page
    
    setIsPaused(!isPaused);
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPaused, isLandingPageActive]);

  React.useEffect(() => {
    // Only start timer if the current item is "ready" (video loaded or landing page active) and not paused
    if (!isVideoReady || isPaused) return;

    const totalMs = isLandingPageActive ? 15000 : 5000; // 15s for landing page, 5s for videos
    const stepMs = 50;
    const step = 100 / (totalMs / stepMs);

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = window.setInterval(() => {
      progressRef.current = Math.min(100, progressRef.current + step);
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // eslint-disable-next-line no-console
        console.log('Auto next');
        handleNext(); // This will now advance to the next item in the playlist, or stop if it's the very last item.
      }
    }, stepMs);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isVideoReady, isLandingPageActive, isPaused, currentVideoSrc, videos.length, handleNext]);

  // Advance to next/prev video based on mouse wheel scroll
  React.useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (scrollLockRef.current) return;
      if (e.deltaY > 0) {
        nextVideo();
      } else if (e.deltaY < 0) {
        prevVideo();
      }
      scrollLockRef.current = true;
      window.setTimeout(() => {
        scrollLockRef.current = false;
      }, 600);
    };

    window.addEventListener('wheel', onWheel, { passive: true } as any);
    return () => window.removeEventListener('wheel', onWheel);
  }, [nextVideo, prevVideo]);

  return (
    <div
      className="w-screen h-screen bg-black text-white overflow-hidden relative select-none"
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000', color: '#fff', position: 'relative', overflow: 'hidden', userSelect: 'none' }}
    >
      {/* Story indicators (multi-segment) */}
      <div className="absolute top-0 left-0 right-0 z-30" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: '8px 8px' }}>
        <div
          className="w-full"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${videos.length}, 1fr)`, columnGap: '6px' }}
        >
          {videos.map((_, i) => {
            const filled = i < currentVideoIndex ? 100 : i === currentVideoIndex ? (isVideoReady ? progress : 0) : 0;
            return (
              <div key={i} className="h-1 bg-white/20" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div className="h-1 bg-white" style={{ height: '4px', backgroundColor: '#fff', width: `${filled}%`, transition: 'width 50ms linear' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30" style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', zIndex: 30 }}>
        <div className="bg-black/60 rounded-full px-3 py-2 flex items-center justify-start" style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '9999px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <a
            href="https://www.instagram.com/cr_ia.pro/"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline"
            style={{ display: 'grid', gridTemplateColumns: '32px 1fr', alignItems: 'center', columnGap: '12px', textDecoration: 'none', color: 'inherit' }}
          >
            <div className="h-8 w-8 rounded-full bg-white/20 overflow-hidden" style={{ height: '32px', width: '32px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden', gridColumn: '1 / 2' }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              ) : null}
            </div>
            <div className="flex flex-col leading-tight" style={{ gridColumn: '2 / 3' }}>
              <div className="text-white text-sm font-semibold" style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                {currentMetadata.title}
              </div>
              <div className="text-white/80 text-xs" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                {currentMetadata.subtitle}
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Tap zones - Bigger areas */}
      <button
        className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
        onClick={handlePrev}
        aria-label="Previous story"
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '33vw', zIndex: 10, cursor: 'pointer', background: 'transparent', border: 'none' }}
      />
      <button
        className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
        onClick={handleNext}
        aria-label="Next story"
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '33vw', zIndex: 10, cursor: 'pointer', background: 'transparent', border: 'none' }}
      />
      {/* Middle pause area */}
      <button
        className="absolute inset-y-0 left-1/3 right-1/3 z-10 cursor-pointer"
        onClick={handlePauseToggle}
        aria-label={isPaused ? "Play video" : "Pause video"}
        style={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          left: '33vw', 
          right: '33vw', 
          width: '34vw', 
          zIndex: 10, 
          cursor: 'pointer', 
          background: 'transparent', 
          border: 'none',
          display: isLandingPageActive ? 'none' : 'block'
        }}
      />

      {/* Back button - Bottom left */}
      <div className="absolute bottom-0 left-0 p-4 z-30" style={{ position: 'absolute', bottom: 0, left: 0, padding: '16px', zIndex: 30 }}>
        <a
          href="https://www.instagram.com/reel/DPmpT9ggj8h/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black/60 rounded-full px-4 py-2 flex items-center gap-2 text-white hover:bg-black/80 transition-colors"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.6)', 
            borderRadius: '9999px', 
            padding: '8px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#fff', 
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <ArrowLeft size={16} />
        </a>
      </div>

      {/* Subscribe button - Bottom right */}
      <div className="absolute bottom-0 right-0 p-4 z-30" style={{ position: 'absolute', bottom: 0, right: 0, padding: '16px', zIndex: 30 }}>
        <a
          href="https://www.instagram.com/cr_ia.pro/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-6 py-3 flex items-center text-white hover:opacity-90 transition-opacity font-semibold"
          style={{ 
            backgroundColor: colors.primary, 
            borderRadius: '9999px', 
            padding: '12px 24px', 
            display: 'flex', 
            alignItems: 'center', 
            color: '#fff', 
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: 'inherit'
          }}
        >
          {currentVideoIndex === 0 ? 'Ver aula grátis' : 'Assinar CR_IA - Pro!'}
        </a>
      </div>

      {/* Content - Fullscreen video or Landing Page */}
      {isLandingPageActive ? (
        // Landing Page Content
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center text-white p-8"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            background: `linear-gradient(135deg, ${colors.primary} 0%, #3B82F6 50%, #4F46E5 100%)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            padding: '32px',
            animation: 'fadeIn 0.5s ease-in'
          }}
        >
          {/* Header */}
          <div className="flex items-center mb-8 animate-slideInDown" style={{ animationDelay: '0.1s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/src/assets/logo.jpg" alt="CR_IA Logo" className="h-16 w-16 mr-4" style={{ height: '64px', width: '64px', marginRight: '16px' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/src/assets/crialab.svg" alt="CR_IA Lab" className="h-12" style={{ height: '48px' }} />
          </div>

          {/* Benefits */}
          <ul className="text-center text-xl space-y-4 mb-8 animate-slideInLeft" style={{ animationDelay: '0.3s' }}>
            <li className="flex items-center">
              <span className="text-green-400 mr-2 text-2xl">✔</span> +40% produtividade
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2 text-2xl">✔</span> Aulas novas toda semana
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2 text-2xl">✔</span> 6 meses de acesso
            </li>
          </ul>

          {/* CTA Button */}
          <a
            href="https://pay.hotmart.com/L99601159N?checkoutMode=10&bid=1761434411795"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-purple-800 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out mt-8 flex flex-col items-center justify-center no-underline"
            style={{
              backgroundColor: '#fff',
              color: colors.primary,
              padding: '12px 24px',
              borderRadius: '9999px',
              fontWeight: 'bold',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease-in-out',
              marginTop: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}
          >
            <span className="text-lg">Quero participar!</span>
            <span className="text-2xl">R$ 697</span>
          </a>

          {/* Payment Info */}
          <p className="text-white/80 text-sm mt-4 animate-slideInUp" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginTop: '16px', animationDelay: '0.7s' }}>
            PIX à vista ou 12x no cartão
          </p>
        </div>
      ) : (
        // Video Content
        <div className="absolute inset-0 z-0" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 0 }}>
          {!isVideoReady && (
            <div className="absolute inset-0">
              <ShimmerSkeleton
                variant="rectangle"
                width="100vw"
                height="100vh"
                style={{ borderRadius: '0' }}
                aria-label="Loading story"
              />
            </div>
          )}
          <video
            ref={videoRef}
            src={currentVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            onCanPlayThrough={() => setIsVideoReady(true)}
            className="absolute inset-0 w-[100vw] h-[100vh] object-cover"
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover' }}
          />
        </div>
      )}


      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInDown {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StoryPage;


