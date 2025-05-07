import { Mail, Phone } from 'lucide-react';

const TopContactBar = () => {
  return (
    <div className="hidden lg:flex w-full bg-black text-white text-sm px-4 py-2 items-center justify-between">
      <div className="flex items-center gap-4">
        <a
          href="mailto:yourmailid@yourdomain.com"
          className="flex items-center gap-3 hover:underline"
        >
          <Mail className="w-4 h-4" />
          <span>yourmailid@yourdomain.com</span>
        </a>

        <div className="h-4 w-px bg-white opacity-50" />

        <a
          href="tel:01234567890"
          className="flex items-center gap-3 hover:underline"
        >
          <Phone className="w-4 h-4" />
          <span>01234567890</span>
        </a>
      </div>
    </div>
  );
};

export default TopContactBar;
