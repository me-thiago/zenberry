import Link from "next/link";

export function ProductByIdBreadcrumb() {
  return (
    <div className="text-sm text-theme-text-secondary my-6 transition-colors duration-200">
      <Link href="/" className="hover:text-theme-accent-secondary">
        Home
      </Link>
      {" > "}
      <Link href="/products" className="hover:text-theme-accent-secondary">
        Products
      </Link>
      {" > "}
      <span className="text-theme-text-primary">Sleep Gummies</span>
    </div>
  );
}
