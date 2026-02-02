import { APP_CONFIG } from "@/config/app-config";

export const users = [
  {
    id: "1",
    name: "Alchemy Tech",
    username: "alchemytech",
    email: "hello@alchemytech.ca",
    avatar: APP_CONFIG.logoUrl,
    role: "administrator",
  },
  {
    id: "2",
    name: "Alchemy Tech 2",
    username: "alchemytech2",
    email: "hello@alchemytech2.ca",
    avatar: "",
    role: "admin",
  },
];

export const rootUser = users[0];
