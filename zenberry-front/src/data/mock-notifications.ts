import { Notification } from "../types/notification";

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "Order Shipped",
    message: "Your order #12345 has been shipped and is on its way!",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "promotion",
    title: "Flash Sale Alert",
    message: "30% off on CBD Gummies - Limited time offer!",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "stock",
    title: "Back in Stock",
    message: "CBD Sleep Tincture is now available again.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "system",
    title: "Account Updated",
    message: "Your profile information has been successfully updated.",
    time: "2 days ago",
    read: true,
  },
];
