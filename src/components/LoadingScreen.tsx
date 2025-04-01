'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingMessages = [
  { text: 'Ищем товар на складе...', emoji: '🔍' },
  { text: 'Делаем затяжку...', emoji: '💨' },
  { text: 'Проверяем остатки...', emoji: '📦' },
  { text: 'Настраиваем ватты...', emoji: '⚡' },
  { text: 'Подбираем вкус...', emoji: '👅' },
  { text: 'Проверяем аккумулятор...', emoji: '🔋' },
  { text: 'Собираем заказ...', emoji: '🛍️' },
  { text: 'Настраиваем температуру...', emoji: '🌡️' },
  { text: 'Проверяем сопротивление...', emoji: '⚡' },
  { text: 'Готовим к отправке...', emoji: '🚚' }
];

const MESSAGE_INTERVAL = 600; // 0.6 секунды между сообщениями

export default function LoadingScreen() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const showNextMessage = useCallback(() => {
    setCurrentMessageIndex((prevIndex) => {
      if (prevIndex >= loadingMessages.length - 1) {
        setTimeout(() => {
          setIsLoading(false);
        }, 600);
        return prevIndex;
      }
      return prevIndex + 1;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(showNextMessage, MESSAGE_INTERVAL);
    return () => clearInterval(interval);
  }, [showNextMessage]);

  if (!isLoading) {
    return null;
  }

  const currentMessage = loadingMessages[currentMessageIndex];
  const progress = ((currentMessageIndex + 1) / loadingMessages.length) * 100;

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="loading-emoji"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {currentMessage.emoji}
              </motion.div>
              <motion.div
                className="loading-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {currentMessage.text}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="loading-progress">
          <motion.div
            className="loading-progress-bar"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
} 