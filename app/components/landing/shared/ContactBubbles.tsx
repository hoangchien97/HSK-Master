"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Tooltip from "@/app/components/landing/common/Tooltip";

const ContactBubbles = () => {
  const [visibleContacts, setVisibleContacts] = useState({
    zalo: true,
    messenger: true,
  });

  const contacts = [
    {
      id: "zalo",
      name: "Zalo",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="32px"
          height="32px"
        >
          <path
            fill="#2962ff"
            d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10	c4.722,0,8.883-2.348,11.417-5.931V36H15z"
          />
          <path
            fill="#eee"
            d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19	c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742	c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083	C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"
          />
          <path
            fill="#2962ff"
            d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75	S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"
          />
          <path
            fill="#2962ff"
            d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"
          />
          <path
            fill="#2962ff"
            d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75	S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5	c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"
          />
          <path
            fill="#2962ff"
            d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5	c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"
          />
        </svg>
      ),
      link: "https://zalo.me/your-zalo-id",
      bgColor: "bg-blue-500",
      tooltip: "Chat qua Zalo",
    },
    {
      id: "messenger",
      name: "Messenger",
      icon: (
        <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
          <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.15 5.51 3.03 7.42V22l2.76-1.52c1.3.36 2.69.56 4.14.56 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.09 12.91l-2.61-2.77-5.11 2.77 5.62-5.96 2.68 2.77 5.03-2.77-5.61 5.96z"></path>
        </svg>
      ),
      link: "https://m.me/your-facebook-page",
      bgColor: "bg-blue-500",
      tooltip: "Chat qua Messenger",
    },
  ];

  const handleClose = (contactId: string) => {
    setVisibleContacts((prev) => ({
      ...prev,
      [contactId]: false,
    }));
  };

  const visibleContactsList = contacts.filter(
    (contact) => visibleContacts[contact.id as keyof typeof visibleContacts]
  );

  if (visibleContactsList.length === 0) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-40 flex flex-col gap-2 sm:gap-3">
      <AnimatePresence>
        {visibleContactsList.map((contact, index) => (
          <Tooltip
            key={contact.id}
            content={contact.tooltip}
            placement="left"
            animation="scale"
          >
            <motion.div
              className="relative group/bubble"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: index * 0.1,
              }}
            >
              <motion.a
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${contact.bgColor} text-white shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer relative`}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Pulse Animation Ring */}
                <motion.span
                  className={`absolute inset-0 rounded-full ${contact.bgColor} opacity-75`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.75, 0, 0.75],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Icon */}
                <span className="relative z-10 scale-75 sm:scale-100 group-hover/bubble:scale-110 transition-transform duration-300">
                  {contact.icon}
                </span>

                {/* Notification Badge */}
                <motion.span
                  className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-red-500 rounded-full border-2 border-white"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.a>

              {/* Close Button - Only show on hover */}
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  handleClose(contact.id);
                }}
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
};

export default ContactBubbles;
