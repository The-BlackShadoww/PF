type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-[var(--border)] pb-6">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      ) : null}
    </header>
  );
}
