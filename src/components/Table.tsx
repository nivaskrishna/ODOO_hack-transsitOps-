import React from 'react';

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className = '', ...props }) => (
  <div className="relative w-full overflow-auto rounded-xl border border-border-primary bg-bg-card shadow-[var(--shadow-soft)]">
    <table className={`w-full caption-bottom text-sm border-collapse ${className}`} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <thead className={`bg-bg-secondary/40 border-b border-border-primary ${className}`} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <tbody className={`divide-y divide-border-primary/60 [&_tr:last-child]:border-0 ${className}`} {...props} />
);

export const TableFooter: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <tfoot className={`border-t border-border-primary bg-bg-secondary/50 font-medium ${className}`} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', ...props }) => (
  <tr
    className={`border-b border-border-primary transition-colors hover:bg-bg-secondary/20 data-[state=selected]:bg-bg-secondary ${className}`}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-semibold text-text-secondary [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <td
    className={`p-4 align-middle text-text-primary [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
);

export const TableCaption: React.FC<React.HTMLAttributes<HTMLTableCaptionElement>> = ({ className = '', ...props }) => (
  <caption className={`mt-4 text-sm text-text-secondary ${className}`} {...props} />
);
