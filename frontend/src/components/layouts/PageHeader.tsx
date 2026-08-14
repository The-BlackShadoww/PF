type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-[#e0e0e0] pb-6">
      <h1 className="text-[42px] font-light leading-[1.2] tracking-normal text-[#161616] md:text-[60px]">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-lg leading-7 text-[#525252]">{description}</p>
      ) : null}
    </header>
  );
}
