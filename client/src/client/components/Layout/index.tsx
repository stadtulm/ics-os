import Footer from "../Footer";
import Navbar from "../Navbar";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="w-full h-full relative flex flex-col">
      <Navbar />
      <div className="flex-1 flex-grow">{children}</div>
      <Footer />
    </div>
  );
}
