import { motion, useReducedMotion } from "framer-motion";
import { Artwork } from "./types";
import { COLORS, MOTION } from "./constants";

interface IllustrationCardProps {
  artwork: Artwork;
  index: number;
  onClick: () => void;
}

export const IllustrationCard = ({
  artwork,
  index,
  onClick,
}: IllustrationCardProps) => {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group relative w-full p-0 border-0 overflow-hidden cursor-pointer"
      style={{
        aspectRatio: "auto",
        backgroundColor: COLORS.cream,
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: reduced ? 0 : MOTION.fadeInImage.duration,
        delay: reduced ? 0 : index * 0.06,
      }}
      whileHover={
        reduced
          ? {}
          : {
              scale: 1.03,
            }
      }
      aria-label={`View ${artwork.title || `Artwork ${artwork.seq}`}`}
    >
      {/* Image */}
      <img
        src={artwork.image_url}
        alt={artwork.title || `Illustration ${artwork.seq}`}
        loading="lazy"
        decoding="async"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          aspectRatio: "auto",
        }}
        srcSet={`${artwork.image_url}?w=375 375w, ${artwork.image_url}?w=640 640w, ${artwork.image_url}?w=1024 1024w, ${artwork.image_url}?w=1440 1440w`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Hover overlay - desktop only */}
      <motion.div
        className="hidden md:flex absolute inset-0 items-center justify-center"
        style={{
          backgroundColor: COLORS.burgundyAlpha08,
          opacity: 0,
        }}
        whileHover={reduced ? {} : { opacity: 1 }}
        transition={{
          duration: reduced ? 0 : MOTION.hoverScale.duration,
        }}
      />

      {/* Title overlay on hover */}
      {artwork.title && (
        <motion.div
          className="hidden md:flex absolute inset-0 flex-col justify-end p-4"
          style={{
            background:
              "linear-gradient(to top, rgba(110, 0, 37, 0.95) 0%, rgba(110, 0, 37, 0.5) 50%, transparent 100%)",
            opacity: 0,
          }}
          whileHover={reduced ? {} : { opacity: 1 }}
          transition={{
            duration: reduced ? 0 : MOTION.hoverScale.duration,
          }}
        >
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: COLORS.gold,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {artwork.title}
          </p>
        </motion.div>
      )}
    </motion.button>
  );
};
