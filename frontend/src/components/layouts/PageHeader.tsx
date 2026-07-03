type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-slate-200 pb-6">
      <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
    </header>
  );
}
