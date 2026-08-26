import { motion, useReducedMotion } from "framer-motion";
import { ILLUSTRATION_CATEGORIES, type IllustrationCategory, type Umbrella } from "@/lib/illustration-categories";

// Was its own hardcoded 6-item list, out of sync with both the hero
// carousel's list AND the DB — see illustration-categories.ts. pieceCount
// isn't tracked here anymore; the DB is the source of truth for counts if
// that's ever needed again.
export type CategoryThumbnail = IllustrationCategory;
export const CATEGORY_THUMBNAILS: CategoryThumbnail[] = ILLUSTRATION_CATEGORIES;

// The client's "Illustrations pack" PDF lays the taxonomy out as two labelled
// rows — FASHION ILLUSTRATION over four categories, LIFESTYLE ILLUSTRATION
// over five — not as one undifferentiated strip. This section used to be a
// horizontally scrolling carousel, which hid five of the nine categories
// behind an arrow and gave a first-time visitor no way to see that the work
// splits into two families at all. Grouping under real headings is the whole
// point of the structure, so the carousel is gone: every category is on the
// page at once, under the heading it belongs to.
const UMBRELLAS: { key: Umbrella; label: string }[] = [
  { key: "fashion", label: "Fashion Illustration" },
  { key: "lifestyle", label: "Lifestyle Illustration" },
];

interface CategoryThumbnailNavProps {
  onCategorySelect?: (category: CategoryThumbnail) => void;
}

const CategoryCard = ({
  category,
  onSelect,
  reduced,
}: {
  category: CategoryThumbnail;
  onSelect?: (category: CategoryThumbnail) => void;
  reduced: boolean | null;
}) => (
  <motion.button
    onClick={() => onSelect?.(category)}
    whileHover={reduced ? {} : { y: -4 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="group cursor-pointer text-left w-full"
  >
    <div
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        aspectRatio: "1",
        marginBottom: 12,
        border: "1px solid #EBEBEB",
        transition: "border-color 0.2s",
      }}
    >
      <img
        src={`/artworks/${category.image}`}
        alt={category.name}
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      />

      {/* Overlay on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          opacity: 0,
          transition: "opacity 0.3s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0";
        }}
      >
        <p
          style={{
            color: "#FFFFFF",
            fontFamily: "Montserrat, system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          View All
        </p>
      </div>
    </div>

    {/* Category label */}
    <h3
      style={{
        fontFamily: "Montserrat, system-ui, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: "#111111",
        margin: 0,
        lineHeight: 1.35,
      }}
    >
      {category.name}
    </h3>
  </motion.button>
);

export const CategoryThumbnailNav = ({ onCategorySelect }: CategoryThumbnailNavProps) => {
  const reduced = useReducedMotion();

  return (
    <section
      className="w-full py-16"
      style={{
        backgroundColor: "#FAFAFA",
        borderTop: "1px solid #EBEBEB",
        borderBottom: "1px solid #EBEBEB",
      }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
        {/* Section header */}
        <div className="mb-10">
          <p
            style={{
              fontFamily: "Montserrat, system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#111111",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Browse by Category
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 700,
              color: "#111111",
              margin: 0,
            }}
          >
            Explore Our Collections
          </h2>
        </div>

        {/* Two labelled rows — fashion, then lifestyle */}
        <div className="flex flex-col gap-12">
          {UMBRELLAS.map(({ key, label }) => {
            const categories = CATEGORY_THUMBNAILS.filter((c) => c.umbrella === key);
            if (categories.length === 0) return null;

            return (
              <div key={key}>
                <h3
                  style={{
                    fontFamily: "Montserrat, system-ui, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#111111",
                    margin: "0 0 6px 0",
                  }}
                >
                  {label}
                </h3>
                <div
                  aria-hidden
                  style={{
                    height: 1,
                    backgroundColor: "#EBEBEB",
                    marginBottom: 20,
                  }}
                />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                  {categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onSelect={onCategorySelect}
                      reduced={reduced}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryThumbnailNav;
