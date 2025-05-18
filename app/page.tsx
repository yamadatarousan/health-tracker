'use client';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Health Record App
      </motion.div>
      <p className="mt-2">Welcome!</p>
    </div>
  );
}