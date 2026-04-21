import { Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      <Link
        to="/"
        className="flex items-center gap-1 text-gray-500 hover:text-[#d4af37] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Accueil</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item.path} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="text-[#d4af37] font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="text-gray-500 hover:text-[#d4af37] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
