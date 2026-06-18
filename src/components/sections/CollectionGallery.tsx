import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Artwork } from "@/lib/gallery-data";

export interface CollectionItem {
  id: string;
  title: string;
  image: string;
  description?: string;
  featured?: boolean;
}

export interface Collection {
  name: string;
  count: number;
  artworks: Artwork[];
}

interface CollectionGalleryProps {
  collection: Collection;
  onClose?: () => void;
}

export const CollectionGallery = ({ collection, onClose }: CollectionGalleryProps) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);
  const reduced = useReducedMotion();

  const currentItem = collection.artworks[currentItemIndex];
  const itemCount = collection.artworks.length;

  const navigate = (direction: "next" | "prev") => {
    if (direction === "next") {
      setCurrentItemIndex((prev) => (prev + 1) % itemCount);
    } else {
      setCurrentItemIndex((prev) => (prev - 1 + itemCount) % itemCount);
    }
  };

  return (
    <section
      className="w-full py-20"
      style={{
        backgroundColor: "#FAFAFA",
        borderTop: "1px solid #EBEBEB",
      }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
        {/* Collection header */}
        <div className="mb-12">
          <p
            style={{
              fontFamily: "Montserrat, system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#666666",
              margin: "0 0 8px 0",
            }}
          >
            Collection
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              color: "#111111",
              margin: "0 0 12px 0",
              lineHeight: 1.2,
            }}
          >
            {collection.name}
          </h2>
          <p
            style={{
              fontFamily: "Montserrat, system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 300,
              color: "#666666",
              margin: 0,
              maxWidth: 600,
              lineHeight: 1.7,
            }}
          >
            {collection.description}
          </p>
        </div>

        {/* Gallery grid with featured item */}
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {collection.artworks.map((item, idx) => (
            <motion.button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              whileHover={reduced ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative group cursor-pointer overflow-hidden rounded-lg"
              style={{
                aspectRatio: "1",
                background: "#FFFFFF",
                border: selectedItem?.id === item.id ? "2px solid #111111" : "1px solid #EBEBEB",
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s",
                }}
                className="group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  opacity: 0,
                  transition: "opacity 0.3s",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 16,
                }}
                className="group-hover:opacity-100"
              >
                <p
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "Montserrat, system-ui, sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {item.title}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Item detail modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center px-4"
              style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X size={24} color="#111111" />
                </button>

                {/* Image */}
                <div style={{ aspectRatio: "1", width: "100%", overflow: "hidden" }}>
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Content */}
                <div style={{ padding: 32 }}>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#111111",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {selectedItem.title}
                  </h3>

                  {selectedItem.story && (
                    <p
                      style={{
                        fontFamily: "Montserrat, system-ui, sans-serif",
                        fontSize: 14,
                        color: "#666666",
                        lineHeight: 1.7,
                        margin: "0 0 24px 0",
                      }}
                    >
                      {selectedItem.story}
                    </p>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => {
                      const whatsappNumber = "2348074022917";
                      const message = `Hi, I'd like to commission: ${selectedItem.title}\n\n${selectedItem.story}`;
                      const encodedMessage = encodeURIComponent(message);
                      const whatsappLink = `https://wa.me/${whatsappNumber}/?text=${encodedMessage}`;
                      window.open(whatsappLink, "_blank");
                    }}
                    style={{
                      fontFamily: "Montserrat, system-ui, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      padding: "12px 32px",
                      background: "#111111",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#333333";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#111111";
                    }}
                  >
                    Commission This Style
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CollectionGallery;
