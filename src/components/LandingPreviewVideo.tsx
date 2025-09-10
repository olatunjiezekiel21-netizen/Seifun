import React from 'react';

interface LandingPreviewVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

const LandingPreviewVideo: React.FC<LandingPreviewVideoProps> = ({ src, poster, className }) => {
  return (
    <div className={className || ''}>
      <video
        className="w-full h-full rounded-lg object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
      >
        <source src={src} type="video/webm" />
        {/* Optional MP4 fallback if provided later through the same path but different extension */}
        <source src={src.replace(/\.webm$/i, '.mp4')} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default LandingPreviewVideo;

