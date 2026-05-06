import { useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  /** true = hero/above-fold: loading=eager + fetchpriority=high */
  priority?: boolean;
  /** shown if the primary src fails */
  fallbackSrc?: string;
};

export function LazyImage({ src, alt = '', priority = false, fallbackSrc, onError, ...props }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed && fallbackSrc ? fallbackSrc : src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={e => {
        if (fallbackSrc && !failed) setFailed(true);
        onError?.(e);
      }}
      {...props}
    />
  );
}
