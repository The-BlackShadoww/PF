type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-20">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-5 text-muted">{description}</p>
      ) : null}
    </header>
  );
}
