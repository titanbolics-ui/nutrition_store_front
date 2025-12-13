"use client"

import { useState } from "react" // Додав стейт
import { Button, Heading, Text } from "@medusajs/ui"
import { motion, AnimatePresence } from "framer-motion" // Додав AnimatePresence
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  Eye,
  X,
  Download,
} from "lucide-react" // Додав іконки Eye, X
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Дані (Додав поле 'imageSrc' - поки поставимо заглушки, заміниш на реальні посилання на скріншоти тестів)
const LATEST_RESULTS = [
  {
    id: 1,
    name: "Testosterone Cypionate 250mg/ml",
    purity: "242.53mg/ml",
    date: "Jan 26, 2024",
    batch: "Z101TC-01",
    method: "HPLC",
    status: "PASS",
    imageSrc:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/TestC.png",
    pdfLink: "#",
  },
  {
    id: 2,
    name: "Testosterone Enanthate 250mg/ml",
    purity: "241.69mg/ml",
    date: "Jan 26, 2024",
    batch: "Z101TE-01",
    method: "HPLC",
    status: "PASS",
    imageSrc:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/test%20e.jpg",
    pdfLink: "#",
  },
  {
    id: 3,
    name: "Oxandrolone 10mg",
    purity: "10.62mg",
    date: "Jan 26, 2024",
    batch: "Z101OX-01",
    method: "HPLC",
    status: "PASS",
    imageSrc:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/Test-oxan.png",
    pdfLink: "#",
  },
]

const LabResults = () => {
  // Стейт для відкриття модалки: null = закрито, object = дані відкритого тесту
  const [selectedResult, setSelectedResult] = useState<
    (typeof LATEST_RESULTS)[0] | null
  >(null)

  return (
    <section className="relative w-full py-24 bg-black overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>

      <div className="content-container relative z-10 max-w-[1440px] mx-auto px-6 small:px-12">
        {/* Header Section */}
        <div className="flex flex-col small:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-emerald-500"></span>
                <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest">
                  Transparency First
                </span>
              </div>
              <Heading
                level="h2"
                className="text-3xl small:text-5xl text-white font-black uppercase mb-4 tracking-tight"
              >
                Independently <span className="text-gray-500">Verified.</span>
              </Heading>
              <Text className="text-gray-400 text-lg font-light leading-relaxed">
                We don't just claim purity; we prove it. Click on any report
                below to view the full HPLC chromatogram instantly.
              </Text>
            </motion.div>
          </div>

          <div className="hidden small:block">
            <LocalizedClientLink href="/lab-results">
              <Button
                variant="secondary"
                className="border-gray-700 text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all bg-transparent rounded-none px-8 py-3 uppercase tracking-widest text-xs font-bold"
              >
                View Archive <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </LocalizedClientLink>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
          {LATEST_RESULTS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-gray-900/40 border border-white/10 p-6 hover:border-emerald-500/50 transition-colors duration-300 backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-gray-800/50 rounded-sm">
                    <FileText className="w-6 h-6 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-mono font-bold text-emerald-500 tracking-wider">
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="mb-6">
                  <h3 className="text-white text-xl font-bold mb-1 tracking-wide">
                    {item.name}
                  </h3>
                  <div className="text-gray-500 text-xs font-mono mb-4">
                    Batch: {item.batch}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white group-hover:text-emerald-400 transition-colors">
                      {item.purity}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">
                      Purity
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button (Trigger Modal) */}
              <div className="pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                <div className="text-xs text-gray-500 font-mono">
                  {item.date}
                </div>

                {/* Змінили кнопку на View Report */}
                <button
                  onClick={() => setSelectedResult(item)}
                  className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider hover:text-emerald-400 transition-colors"
                >
                  View Report <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* --- MODAL WINDOW --- */}
        <AnimatePresence>
          {selectedResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResult(null)}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                // 1. Зробили flex-col і обмежили висоту (max-h-[90vh])
                className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-gray-900 border border-gray-700 shadow-2xl rounded-sm overflow-hidden"
              >
                {/* --- HEADER (Fixed) --- */}
                <div className="shrink-0 flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {selectedResult.name}
                    </h3>
                    <p className="text-xs text-emerald-500 font-mono mt-1">
                      Batch: {selectedResult.batch} // Purity:{" "}
                      {selectedResult.purity}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* --- CONTENT (Scrollable) --- */}
                {/* 2. Додали overflow-y-auto і flex-1, щоб скролилась тільки картинка */}
                <div className="flex-1 overflow-y-auto bg-white p-1 flex justify-center">
                  {/* Картинка на всю ширину */}
                  <img
                    src={selectedResult.imageSrc}
                    alt={`Lab result for ${selectedResult.name}`}
                    className="w-full h-auto object-contain self-start"
                  />
                </div>

                {/* --- FOOTER (Fixed) --- */}
                <div className="shrink-0 p-4 border-t border-gray-800 bg-gray-950 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-mono hidden sm:block">
                    VERIFIED BY JANOSHIK ANALYTICS
                  </span>

                  {/* 3. Кнопка скачування */}
                  <a
                    href={selectedResult.pdfLink}
                    target="_blank"
                    rel="noreferrer" // або rel="noopener noreferrer"
                    download // Цей атрибут форсує скачування (якщо сервер дозволяє)
                    className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition-colors uppercase tracking-wider"
                  >
                    Download PDF <Download className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Button Link */}
        <div className="block small:hidden mt-8 w-full">
          <LocalizedClientLink href="/lab-results">
            <Button
              variant="secondary"
              className="w-full border-gray-700 text-gray-300 hover:bg-white hover:text-black hover:border-white bg-transparent rounded-none py-4 uppercase tracking-widest text-xs font-bold"
            >
              View Archive
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default LabResults
