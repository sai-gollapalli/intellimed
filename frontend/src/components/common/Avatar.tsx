import React, { useMemo, useState } from 'react';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const makeFallbackAvatar = (name: string) => {
  const initials = getInitials(name);
  const colors = ['#0f766e', '#2563eb', '#7c3aed', '#db2777', '#ea580c'];
  const color = colors[name.length % colors.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="32" fill="${color}"/>
      <circle cx="100" cy="82" r="36" fill="rgba(255,255,255,0.92)"/>
      <path d="M54 168c6-33 28-48 46-48s40 15 46 48" fill="rgba(255,255,255,0.92)"/>
      <text x="100" y="132" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="700" fill="white">${initials}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const resolveImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  const base = 'http://localhost:8000';
  return `${base}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
};

export const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const fallbackSrc = useMemo(() => makeFallbackAvatar(name), [name]);
  const resolvedSrc = useMemo(() => resolveImageUrl(imgError ? undefined : imageUrl), [imageUrl, imgError]);

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={name}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover border border-slate-700/60 shadow-sm ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <img
      src={fallbackSrc}
      alt={name}
      className={`rounded-full object-cover border border-slate-700/60 shadow-sm ${sizeClasses[size]} ${className}`}
    />
  );
};
