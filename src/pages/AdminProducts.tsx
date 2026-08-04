import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Save, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Product {
  id?: string;
  title: string;
  subtitle: string;
  type: "garment" | "print";
  badge: string;
  images: string[];
  price_ngn: number;
  price_usd: number;
  description: string;
  full_description?: string;
  materials?: string;
  care_instructions?: string;
  size_guide?: string;
  style_notes?: string;
  occasions?: string[];
  colors?: string[];
  fit_details?: string;
  ai_enhanced?: boolean;
  featured?: boolean;
  active?: boolean;
  sort_order?: number;
}

const COLORS = {
  ALABASTER: "#FAF9F6",
  BURGUNDY: "#6E0025",
  GOLD: "#D4AF37",
  DARK_TEXT: "#221A1A",
  BURG_ALPHA: "rgba(110,0,37,0.14)",
};

const CORMORANT = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>({
    title: "",
    subtitle: "",
    type: "garment",
    badge: "",
    images: [],
    price_ngn: 0,
    price_usd: 0,
    description: "",
    full_description: "",
    materials: "",
    care_instructions: "",
    size_guide: "",
    style_notes: "",
    occasions: [],
    colors: [],
    fit_details: "",
    featured: false,
    active: true,
    sort_order: 0,
  });

  // Load products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (e) {
      console.error("Failed to load products:", e);
      // Fallback: show empty state or cached data
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert([formData]);

        if (error) throw error;
      }

      await fetchProducts();
      setEditingId(null);
      setShowNewForm(false);
      setFormData({
        title: "",
        subtitle: "",
        type: "garment",
        badge: "",
        images: [],
        price_ngn: 0,
        price_usd: 0,
        description: "",
      } as Product);
    } catch (e) {
      alert("Failed to save product: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchProducts();
    } catch (e) {
      alert("Failed to delete product: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  const handleAIEnhance = async (product: Product) => {
    if (!product.id || enhancing === product.id) return;

    setEnhancing(product.id);
    try {
      const response = await fetch("/api/enhance-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!response.ok) throw new Error("AI enhancement failed");
      const enhanced = await response.json();

      // Update product with AI-generated details
      const { error } = await supabase
        .from("products")
        .update({
          ...enhanced,
          ai_enhanced: true,
        })
        .eq("id", product.id);

      if (error) throw error;
      await fetchProducts();
    } catch (e) {
      alert("AI enhancement failed: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setEnhancing(null);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id || null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNewForm(false);
    setFormData({
      title: "",
      subtitle: "",
      type: "garment",
      badge: "",
      images: [],
      price_ngn: 0,
      price_usd: 0,
      description: "",
    } as Product);
  };

  return (
    <div style={{ background: COLORS.ALABASTER, minHeight: "100vh" }}>
      <NavBar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: CORMORANT, fontSize: 48, fontWeight: 700, color: COLORS.BURGUNDY, margin: 0 }}>
            Product Management
          </h1>
          <motion.button
            onClick={() => setShowNewForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: COLORS.BURGUNDY,
              color: COLORS.GOLD,
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontFamily: "DM Sans",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={18} /> New Product
          </motion.button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", fontSize: 16, color: COLORS.BURGUNDY }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", fontSize: 16, color: COLORS.BURGUNDY }}>
            No products yet. Create your first one!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                style={{
                  background: "white",
                  borderRadius: 12,
                  border: `1px solid ${COLORS.BURG_ALPHA}`,
                  overflow: "hidden",
                }}
              >
                {editingId === product.id ? (
                  <ProductEditForm
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ) : (
                  <ProductRow
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAIEnhance={handleAIEnhance}
                    isEnhancing={enhancing === product.id}
                    isExpanded={expandedId === product.id}
                    onToggleExpand={() =>
                      setExpandedId(expandedId === product.id ? null : product.id)
                    }
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* New Product Form */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 20,
              }}
              onClick={() => handleCancel()}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "white",
                  borderRadius: 16,
                  maxWidth: 700,
                  width: "100%",
                  maxHeight: "90vh",
                  overflow: "auto",
                  padding: 40,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontFamily: CORMORANT, fontSize: 32, fontWeight: 700, color: COLORS.BURGUNDY, margin: 0 }}>
                    Create Product
                  </h2>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: COLORS.BURGUNDY,
                      padding: 8,
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <ProductEditForm
                  formData={formData}
                  setFormData={setFormData}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isModal
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAIEnhance: (product: Product) => void;
  isEnhancing: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ProductRow = ({
  product,
  onEdit,
  onDelete,
  onAIEnhance,
  isEnhancing,
  isExpanded,
  onToggleExpand,
}: ProductRowProps) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: 20,
          borderBottom: isExpanded ? `1px solid ${COLORS.BURG_ALPHA}` : "none",
          background: product.featured ? "rgba(212,175,55,0.05)" : "transparent",
        }}
      >
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.title}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        )}

        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: CORMORANT, fontSize: 18, fontWeight: 700, color: COLORS.BURGUNDY, margin: "0 0 4px 0" }}>
            {product.title}
          </h3>
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", margin: "0 0 4px 0" }}>
            {product.subtitle}
          </p>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
            <span>{product.type}</span>
            <span>₦{product.price_ngn?.toLocaleString()} / ${product.price_usd}</span>
            {product.ai_enhanced && <span style={{ color: COLORS.GOLD }}>✓ AI Enhanced</span>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            onClick={() => onAIEnhance(product)}
            disabled={isEnhancing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="AI Enhance Description"
            style={{
              background: isEnhancing ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.2)",
              color: COLORS.GOLD,
              border: "none",
              borderRadius: 6,
              padding: 8,
              cursor: isEnhancing ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={16} />
          </motion.button>

          <motion.button
            onClick={() => onEdit(product)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "rgba(110,0,37,0.1)",
              color: COLORS.BURGUNDY,
              border: "none",
              borderRadius: 6,
              padding: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Edit size={16} />
          </motion.button>

          <motion.button
            onClick={() => onDelete(product.id!)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "rgba(220,38,38,0.1)",
              color: "#dc2626",
              border: "none",
              borderRadius: 6,
              padding: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 size={16} />
          </motion.button>

          <motion.button
            onClick={onToggleExpand}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: COLORS.BURGUNDY,
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          style={{
            padding: 20,
            background: "rgba(0,0,0,0.02)",
            borderTop: `1px solid ${COLORS.BURG_ALPHA}`,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 12 }}>
            <div>
              <strong>Description:</strong>
              <p style={{ margin: "4px 0 0 0", color: "rgba(0,0,0,0.7)", lineHeight: 1.5 }}>
                {product.description}
              </p>
            </div>
            {product.full_description && (
              <div>
                <strong>Full Description:</strong>
                <p style={{ margin: "4px 0 0 0", color: "rgba(0,0,0,0.7)", lineHeight: 1.5 }}>
                  {product.full_description}
                </p>
              </div>
            )}
            {product.materials && (
              <div>
                <strong>Materials:</strong>
                <p style={{ margin: "4px 0 0 0", color: "rgba(0,0,0,0.7)", lineHeight: 1.5 }}>
                  {product.materials}
                </p>
              </div>
            )}
            {product.care_instructions && (
              <div>
                <strong>Care:</strong>
                <p style={{ margin: "4px 0 0 0", color: "rgba(0,0,0,0.7)", lineHeight: 1.5 }}>
                  {product.care_instructions}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

interface ProductEditFormProps {
  formData: Product;
  setFormData: (data: Product) => void;
  onSave: () => void;
  onCancel: () => void;
  isModal?: boolean;
}

const ProductEditForm = ({ formData, setFormData, onSave, onCancel, isModal }: ProductEditFormProps) => {
  const inputStyle: React.CSSProperties = {
    fontFamily: "DM Sans",
    fontSize: 13,
    padding: "10px 12px",
    border: `1px solid ${COLORS.BURG_ALPHA}`,
    borderRadius: 6,
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "DM Sans",
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.BURGUNDY,
    marginBottom: 4,
    display: "block",
  };

  return (
    <div style={{ padding: isModal ? 0 : 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={inputStyle}
            placeholder="Product name"
          />
        </div>
        <div>
          <label style={labelStyle}>Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as "garment" | "print" })}
            style={inputStyle}
          >
            <option value="garment">Garment</option>
            <option value="print">Print</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Subtitle *</label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          style={inputStyle}
          placeholder="e.g., Look 01 · Collection"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Badge</label>
          <input
            type="text"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            style={inputStyle}
            placeholder="e.g., Made to Order"
          />
        </div>
        <div>
          <label style={labelStyle}>Images (comma-separated URLs)</label>
          <input
            type="text"
            value={formData.images?.join(", ") || ""}
            onChange={(e) =>
              setFormData({ ...formData, images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
            style={inputStyle}
            placeholder="/viva/look-1.webp, /viva/look-2.webp"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Price (NGN)</label>
          <input
            type="number"
            value={formData.price_ngn}
            onChange={(e) => setFormData({ ...formData, price_ngn: Number(e.target.value) })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Price (USD)</label>
          <input
            type="number"
            value={formData.price_usd}
            onChange={(e) => setFormData({ ...formData, price_usd: Number(e.target.value) })}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Short Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{ ...inputStyle, minHeight: 80, fontFamily: "DM Sans", resize: "vertical" }}
          placeholder="One-line description"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Full Description</label>
        <textarea
          value={formData.full_description || ""}
          onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
          style={{ ...inputStyle, minHeight: 100, fontFamily: "DM Sans", resize: "vertical" }}
          placeholder="Detailed product story"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Materials</label>
        <textarea
          value={formData.materials || ""}
          onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
          style={{ ...inputStyle, minHeight: 60, fontFamily: "DM Sans", resize: "vertical" }}
          placeholder="Fabric composition and materials"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Care Instructions</label>
        <textarea
          value={formData.care_instructions || ""}
          onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
          style={{ ...inputStyle, minHeight: 60, fontFamily: "DM Sans", resize: "vertical" }}
          placeholder="How to care for this item"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Fit Details</label>
        <textarea
          value={formData.fit_details || ""}
          onChange={(e) => setFormData({ ...formData, fit_details: e.target.value })}
          style={{ ...inputStyle, minHeight: 60, fontFamily: "DM Sans", resize: "vertical" }}
          placeholder="Sizing, fit notes, style recommendations"
        />
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <motion.button
          onClick={onSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: "12px 20px",
            background: COLORS.BURGUNDY,
            color: COLORS.GOLD,
            border: "none",
            borderRadius: 6,
            fontFamily: "DM Sans",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Save size={16} /> Save Product
        </motion.button>
        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: "12px 20px",
            background: "transparent",
            color: COLORS.BURGUNDY,
            border: `1.5px solid ${COLORS.BURGUNDY}`,
            borderRadius: 6,
            fontFamily: "DM Sans",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
};

export default AdminProducts;
