type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-[#cfd4ca] pb-6">
      <h1 className="text-4xl font-black leading-[0.95] tracking-normal text-[#0e0f0c]">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-[#454745]">{description}</p>
      ) : null}
    </header>
  );
}
