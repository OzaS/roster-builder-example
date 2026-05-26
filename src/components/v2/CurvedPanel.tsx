type Props = {
  children: React.ReactNode;
  className?: string;
};

export function CurvedPanel({ children, className = "" }: Props) {
  return <section className={`v2-curved-panel ${className}`}>{children}</section>;
}
