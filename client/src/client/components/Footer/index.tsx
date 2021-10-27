import Link from "next/link";

export default function Footer() {
  return (
    <div className="text-center flex-shrink-0 bg-gray-100 px-4 py-2 text-xs z-10 bg-gray-800 text-white">
      © {new Date().getFullYear()}
      {" · "}
      <Link href="/privacy">Privacy policy</Link>
      {" · "}
      <Link href="/terms">Terms of Service</Link>
    </div>
  );
}
