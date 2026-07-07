import { Breadcrumbs, type BreadcrumbItem } from "@/components/app/Breadcrumbs";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">{eyebrow}</p> : null}
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
