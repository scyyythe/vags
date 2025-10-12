import { motion } from "framer-motion";

interface ConversationListSkeletonProps {
  count?: number;
}

export const ConversationListSkeleton = ({ count = 5 }: ConversationListSkeletonProps) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => index);

  return (
    <>
      {skeletonItems.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="p-3 border-b border-gray-100"
        >
          <div className="flex items-start space-x-3">
            {/* Avatar skeleton */}
            <div className="relative">
              <motion.div
                className="h-6 w-6 bg-gray-200 rounded-full"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Online indicator skeleton */}
              <motion.div
                className="absolute -bottom-0.5 -right-1 w-2.5 h-2.5 bg-gray-200 border-2 border-white rounded-full"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {/* Header row skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {/* Pin icon skeleton (randomly show for some items) */}
                  {index % 3 === 0 && (
                    <motion.div
                      className="w-2.5 h-2.5 bg-gray-200 rounded-sm"
                      animate={{
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {/* Username skeleton */}
                  <motion.div
                    className="h-3 bg-gray-200 rounded"
                    style={{
                      width: `${Math.random() * 40 + 60}px`, // Random width between 60-100px
                    }}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.1,
                    }}
                  />
                </div>

                {/* Time skeleton */}
                <motion.div
                  className="h-2.5 w-8 bg-gray-200 rounded"
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15,
                  }}
                />
              </div>

              {/* Message preview row skeleton */}
              <div className="flex items-center justify-between">
                {/* Message text skeleton */}
                <motion.div
                  className="h-2.5 bg-gray-200 rounded flex-1 mr-2"
                  style={{
                    width: `${Math.random() * 80 + 100}px`, // Random width between 100-180px
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.12,
                  }}
                />

                {/* Unread count skeleton (randomly show for some items) */}
                {index % 4 === 0 && (
                  <motion.div
                    className="h-4 w-4 bg-gray-200 rounded-full"
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [0.9, 1.1, 0.9],
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.18,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

// Individual conversation item skeleton for more granular control
export const ConversationItemSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-3 border-b border-gray-100"
    >
      <div className="flex items-start space-x-3">
        {/* Avatar skeleton */}
        <div className="relative">
          <motion.div
            className="h-6 w-6 bg-gray-200 rounded-full"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <motion.div
                className="h-3 bg-gray-200 rounded"
                style={{ width: "80px" }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <motion.div
              className="h-2.5 w-8 bg-gray-200 rounded"
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Message preview */}
          <div className="flex items-center justify-between">
            <motion.div
              className="h-2.5 bg-gray-200 rounded flex-1 mr-2"
              style={{ width: "120px" }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Conversation loading skeleton for when redirecting to contact seller
export const ConversationLoadingSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center space-x-3 w-full">
        <motion.div
          className="h-10 w-10 bg-gray-200 rounded-full"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="flex-1 space-y-2">
          <motion.div
            className="h-4 bg-gray-200 rounded w-32"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
          <motion.div
            className="h-3 bg-gray-200 rounded w-24"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </div>
      </div>

      {/* Message skeletons */}
      <div className="w-full space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <motion.div
            key={index}
            className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div
              className={`flex items-end space-x-2 max-w-[80%] ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
            >
              {index % 2 === 0 && (
                <motion.div
                  className="h-6 w-6 bg-gray-200 rounded-full flex-shrink-0"
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3,
                  }}
                />
              )}
              <motion.div
                className={`px-3 py-2 rounded-lg bg-gray-200 ${index % 2 === 0 ? "rounded-bl-sm" : "rounded-br-sm"}`}
                style={{
                  width: `${Math.random() * 100 + 80}px`,
                  height: "32px",
                }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.25,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading text */}
      <motion.div
        className="text-gray-500 text-xs flex items-center space-x-2"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="w-1 h-1 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0,
          }}
        />
        <motion.div
          className="w-1 h-1 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
        <motion.div
          className="w-1 h-1 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
        <span className="ml-2">Opening conversation...</span>
      </motion.div>
    </div>
  );
};
