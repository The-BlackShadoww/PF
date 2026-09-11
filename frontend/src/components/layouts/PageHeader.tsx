type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">{description}</p>
      ) : null}
    </header>
  );
}
