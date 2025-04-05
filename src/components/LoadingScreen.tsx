'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LoadingScreen.module.css';

const loadingMessages = [
  { text: 'Ищем товар на складе...', emoji: '🔍' },
  { text: 'Делаем затяжку...', emoji: '💨' },
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
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
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
                className={styles.loadingEmoji}
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
                className={styles.loadingText}
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

        <div className={styles.loadingProgress}>
          <motion.div
            className={styles.loadingProgressBar}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
} 