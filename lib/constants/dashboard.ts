import { FiBriefcase, FiEdit3, FiLayout } from "react-icons/fi";

export const quickLinks = [
    {
        href: "/admin/projects",
        label: "Manage Projects",
        icon: FiLayout,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10"
    },
    {
        href: "/admin/experience",
        label: "Update Experience",
        icon: FiBriefcase,
        color: "text-violet-400",
        bg: "bg-violet-400/10"
    },
    {
        href: "/admin/blog",
        label: "Draft a Blog Post",
        icon: FiEdit3,
        color: "text-pink-400",
        bg: "bg-pink-400/10"
    },
];
