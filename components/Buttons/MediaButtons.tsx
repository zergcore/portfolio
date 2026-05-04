import { FaLinkedinIn, FaGithub, FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { FiMail } from "react-icons/fi";

const socialLinks = [
  {
    href: "https://www.linkedin.com/in/zaidibethramos",
    label: "LinkedIn Profile",
    Icon: FaLinkedinIn,
    className: "text-blue-400 hover:text-blue-300",
  },
  {
    href: "https://github.com/zergcore",
    label: "GitHub Profile",
    Icon: FaGithub,
    className: "text-slate-400 hover:text-slate-200",
  },
  {
    href: "mailto:zaidibethramos@gmail.com",
    label: "Send an email",
    Icon: FiMail,
    className: "text-pink-400 hover:text-pink-300",
  },
  {
    href: "https://wa.me/584245092375",
    label: "Send a WhatsApp message",
    Icon: FaWhatsapp,
    className: "text-green-400 hover:text-green-300",
  },
  {
    href: "https://zergcore.t.me",
    label: "Send a Telegram message",
    Icon: FaTelegramPlane,
    className: "text-sky-400 hover:text-sky-300",
  },
];

interface MediaButtonsProps {
  /** Show only a subset of links (by label). Defaults to all. */
  filter?: string[];
}

const MediaButtons = ({ filter }: MediaButtonsProps = {}) => {
  const links = filter
    ? socialLinks.filter((l) => filter.includes(l.label))
    : socialLinks;

  return (
    <div className="flex gap-3" role="group" aria-label="Social media and contact links">
      {links.map(({ href, label, Icon, className }) => (
        <a
          key={href}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-full transition-all duration-200 ${className}
            hover:scale-110 hover:bg-white/5
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
        >
          <Icon size={20} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
};

export default MediaButtons;