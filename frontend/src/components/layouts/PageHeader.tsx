type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-7">
      <h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-foreground md:text-[46px]">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{description}</p>
      ) : null}
    </header>
  );
}
