import { FaLinkedin, FaGithub, FaWhatsapp } from "react-icons/fa";

export const links = [
    {
        key: "whatsapp",
        href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890"}`,
        icon: FaWhatsapp,
        color: "hover:text-green-400",
        label: "WhatsApp",
    },
    {
        key: "linkedin",
        href: "https://linkedin.com/in/zaidibethramos",
        icon: FaLinkedin,
        color: "hover:text-blue-400",
        label: "LinkedIn",
    },
    {
        key: "github",
        href: "https://github.com/zergcore",
        icon: FaGithub,
        color: "hover:text-white",
        label: "GitHub",
    },
];