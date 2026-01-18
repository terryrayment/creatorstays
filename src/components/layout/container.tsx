import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}

export function Container({ children, className, size = 'default' }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6 md:px-10 lg:px-12',
        {
          'max-w-[1200px]': size === 'default',
          'max-w-[900px]': size === 'narrow',
          'max-w-[1400px]': size === 'wide',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

export default Container;
