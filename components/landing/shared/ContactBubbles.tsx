"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Tooltip from "@/components/landing/common/Tooltip";
import { ZaloIcon, MessengerIcon } from "@/components/landing/icons";

interface ContactItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  link: string;
  bgColor: string;
  tooltip: string;
}

const CONTACTS: ContactItem[] = [
  {
    id: "zalo",
    name: "Zalo",
    icon: <ZaloIcon size={32} />,
    link: "https://zalo.me/0965322136",
    bgColor: "bg-blue-500",
    tooltip: "Chat qua Zalo",
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: <MessengerIcon size={32} />,
    link: "https://m.me/chen.shi.hong.yu",
    bgColor: "bg-blue-500",
    tooltip: "Chat qua Messenger",
  },
];

const springTransition = { type: "spring", stiffness: 260, damping: 20 } as const;
const pulseAnimation = { scale: [1, 1.3, 1], opacity: [0.75, 0, 0.75] } as const;
const badgeAnimation = { scale: [1, 1.2, 1] } as const;

export default function ContactBubbles() {
  const [visible, setVisible] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CONTACTS.map((c) => [c.id, true]))
  );

  const visibleList = CONTACTS.filter((c) => visible[c.id]);

  if (visibleList.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-22 right-4 sm:right-6 z-40 flex flex-col gap-2 sm:gap-3">
      <AnimatePresence>
        {visibleList.map((contact, index) => (
          <Tooltip key={contact.id} content={contact.tooltip} placement="left" animation="scale">
            <motion.div
              className="relative group/bubble"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ ...springTransition, delay: index * 0.1 }}
            >
              <motion.a
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={contact.tooltip}
                className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${contact.bgColor} text-white shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Pulse ring */}
                <motion.span
                  className={`absolute inset-0 rounded-full ${contact.bgColor} opacity-75`}
                  animate={pulseAnimation}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Icon */}
                <span className="relative z-10 scale-75 sm:scale-100 group-hover/bubble:scale-110 transition-transform duration-300">
                  {contact.icon}
                </span>
                {/* Notification dot */}
                <motion.span
                  className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-red-500 rounded-full border-2 border-white"
                  animate={badgeAnimation}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.a>

              {/* Close button */}
              <motion.button
                onClick={() => setVisible((prev) => ({ ...prev, [contact.id]: false }))}
                className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 h-4 w-4 sm:h-5 sm:w-5 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center shadow-md z-20 cursor-pointer transition-all opacity-0 group-hover/bubble:opacity-100"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Đóng ${contact.name}`}
              >
                <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
              </motion.button>
            </motion.div>
          </Tooltip>
        ))}
      </AnimatePresence>
    </div>
  );
}
