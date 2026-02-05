import { type Variants } from "framer-motion";

export const cardHoverVariants: Variants = {
  visible: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 20px 40px -12px rgba(99, 102, 241, 0.15)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};
