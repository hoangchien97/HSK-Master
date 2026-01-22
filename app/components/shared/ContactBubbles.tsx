'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Tooltip from './Tooltip';

const ContactBubbles = () => {
  const [visibleContacts, setVisibleContacts] = useState({
    zalo: true,
    messenger: true,
  });

  const contacts = [
    {
      id: 'zalo',
      name: 'Zalo',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 4C12.96 4 4 12.96 4 24c0 5.52 2.28 10.56 6 14.16V44l5.88-3.24C18.48 42.24 21.12 43 24 43c11.04 0 20-8.96 20-20S35.04 4 24 4z"
            fill="currentColor"
          />
          <path
            d="M17.28 28.68l-2.4-3.6 9.36-7.2 2.88 4.32c.48.72 1.44.96 2.16.48l6.24-3.84c.48-.24.96-.12 1.2.36.24.48.12.96-.36 1.2l-7.2 4.44c-1.44.84-3.24.48-4.32-.72l-1.56-2.4-6 4.56c-.48.36-1.2.24-1.56-.24-.36-.48-.24-1.2.24-1.56l6.96-5.28"
            fill="white"
          />
        </svg>
      ),
      link: 'https://zalo.me/your-zalo-id',
      bgColor: 'bg-blue-500',
      tooltip: 'Chat qua Zalo',
    },
    {
      id: 'messenger',
      name: 'Messenger',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 4C12.96 4 4 12.48 4 23.28c0 6.12 3.12 11.52 8 15.12V44l5.52-3.12c1.44.36 3 .6 4.48.6 11.04 0 20-8.4 20-19.2S35.04 4 24 4z"
            fill="currentColor"
          />
          <path
            d="M25.2 26.4l-5.04-5.52-10.08 5.52 11.04-11.76 5.28 5.52 9.84-5.52L25.2 26.4z"
            fill="white"
          />
        </svg>
      ),
      link: 'https://m.me/your-facebook-page',
      bgColor: 'bg-gradient-to-br from-pink-500 to-purple-600',
      tooltip: 'Chat qua Messenger',
    },
  ];

  const handleClose = (contactId: string) => {
    setVisibleContacts(prev => ({
      ...prev,
      [contactId]: false,
    }));
  };

  const visibleContactsList = contacts.filter(contact => 
    visibleContacts[contact.id as keyof typeof visibleContacts]
  );

  if (visibleContactsList.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col gap-3">
      <AnimatePresence>
        {visibleContactsList.map((contact, index) => (
          <Tooltip
            key={contact.id}
            content={contact.tooltip}
            placement="left"
            animation="scale"
          >
            <motion.div
              className="relative"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: index * 0.1,
              }}
            >
              <motion.a
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-12 w-12 items-center justify-center rounded-full ${contact.bgColor} text-white shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400 cursor-pointer group relative`}
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
                    ease: 'easeInOut',
                  }}
                />

                {/* Icon */}
                <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                  {contact.icon}
                </span>

                {/* Notification Badge */}
                <motion.span
                  className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 rounded-full border-2 border-white"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.a>

              {/* Close Button */}
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  handleClose(contact.id);
                }}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center shadow-md z-20 cursor-pointer transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Đóng ${contact.name}`}
              >
                <X className="w-3 h-3" strokeWidth={3} />
              </motion.button>
            </motion.div>
          </Tooltip>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ContactBubbles;
