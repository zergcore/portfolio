import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from '@mui/icons-material/Telegram';

const MediaButtons = () => {
  const socialLinks = [
    {
      href: "https://www.linkedin.com/in/zaidibethramos",
      label: "LinkedIn Profile",
      icon: LinkedInIcon,
      color: "text-blue-400 hover:text-blue-600"
    },
    {
      href: "https://github.com/zergcore",
      label: "GitHub Profile", 
      icon: GitHubIcon,
      color: "text-gray-400 hover:text-gray-800"
    },
    {
      href: "mailto:zaidibethramos@gmail.com",
      label: "Send an email",
      icon: EmailIcon,
      color: "text-pink-400 hover:text-pink-600"
    },
    {
      href: "https://wa.me/584245092375",
      label: "Send a WhatsApp message",
      icon: WhatsAppIcon,
      color: "text-green-400 hover:text-green-600"
    },
    {
      href: "https://zergcore.t.me",
      label: "Send a telegram message",
      icon: TelegramIcon,
      color: "text-blue-400 hover:text-blue-500"
    }
  ];

  return (
    <div className="w-full flex justify-center items-center">
      <div className="flex gap-4" role="group" aria-label="Social media and contact links">
        {socialLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              aria-label={link.label}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-full transition-all duration-200 ${link.color} hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <IconComponent className="w-6 h-6" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default MediaButtons;