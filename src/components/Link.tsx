import { ReactNode } from 'react';

interface LinkProps {
  to: string;
  className?: string;
  children: ReactNode;
}

export const Link = ({ to, className = '', children }: LinkProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};
