"use client"

import { useState } from "react"
import { Heading, Text, Input } from "@medusajs/ui" // Перевір, чи є Input в @medusajs/ui, якщо ні - використай звичайний <input>
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  FileText,
  CheckCircle2,
  Download,
  Eye,
  X,
  FlaskConical,
} from "lucide-react"

// ---MOCK DATA TODO: Replace with actual data ---
const ALL_RESULTS = [
  {
    id: 1,
    name: "Testosterone Cypionate 250",
    brand: "ZPHC",
    concentration: "242.53 mg/ml",
    date: "Jan 26, 2024",
    batch: "Z10TC-01",
    status: "PASS",
    // TODO: Replace with actual image/pdf
    imageSrc:
      "https://placehold.co/600x800/f3f4f6/111?text=Test+Cypionate+Report",
    pdfLink: "#",
  },
  {
    id: 2,
    name: "Testosterone Enanthate 250",
    brand: "ZPHC",
    concentration: "241.69 mg/ml",
    date: "Jan 26, 2024",
    batch: "Z10TE-01",
    status: "PASS",
    imageSrc:
      "https://placehold.co/600x800/f3f4f6/111?text=Test+Enanthate+Report",
    pdfLink: "#",
  },
  {
    id: 3,
    name: "Oxandrolone 10mg",
    brand: "ZPHC",
    concentration: "10.62 mg",
    date: "Jan 26, 2024",
    batch: "Z1010X-01",
    status: "PASS",
    imageSrc: "https://placehold.co/600x800/f3f4f6/111?text=Oxandrolone+Report",
    pdfLink: "#",
  },
  {
    id: 4,
    name: "Dianabol 10mg",
    brand: "Spectrum Pharma",
    concentration: "10.1 mg",
    date: "Feb 14, 2024",
    batch: "SP-DB-002",
    status: "PASS",
    imageSrc: "https://placehold.co/600x800/f3f4f6/111?text=Dianabol+Report",
    pdfLink: "#",
  },
  {
    id: 5,
    name: "Arimidex 1mg",
    brand: "Spectrum Pharma",
    concentration: "0.98 mg",
    date: "Feb 14, 2024",
    batch: "SP-AR-005",
    status: "PASS",
    imageSrc: "https://placehold.co/600x800/f3f4f6/111?text=Arimidex+Report",
    pdfLink: "#",
  },
]

export default function LabResultsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResult, setSelectedResult] = useState<
    (typeof ALL_RESULTS)[0] | null
  >(null)

  // Filtering the list
  const filteredResults = ALL_RESULTS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 1. PAGE HEADING */}
      <div className="bg-white border-b border-gray-200 pt-32 pb-12">
        <div className="content-container max-w-[1440px] mx-auto px-6 small:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="max-w-2xl">
              <span className="text-emerald-600 font-mono text-xs uppercase tracking-widest font-bold mb-2 block">
                Quality Control
              </span>
              <Heading
                level="h1"
                className="text-4xl small:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
              >
                Lab Analysis Archive
              </Heading>
              <Text className="text-gray-500 text-lg font-light leading-relaxed">
                Full transparency database. Verify the purity and concentration
                of every batch before you buy. Search by product name, brand, or
                batch code.
              </Text>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-sm flex items-start gap-3 max-w-xl">
                <div className="p-1 bg-white rounded-full border border-gray-200 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                    Database Update in Progress
                  </h4>
                  <p className="text-sm text-gray-500">
                    We are currently digitizing our historical archive. New
                    certificates (COA) are being uploaded daily.
                    <br className="hidden sm:block" />
                    If you cannot find a specific batch report, please{" "}
                    <a
                      href="/contact"
                      className="text-emerald-600 underline hover:text-emerald-700"
                    >
                      contact support
                    </a>{" "}
                    to request it manually.
                  </p>
                </div>
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="w-full md:w-auto min-w-[300px]">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search products (e.g. Dianabol)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-sm leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all shadow-sm hover:border-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RESULTS GRID */}
      <div className="content-container max-w-[1440px] mx-auto px-6 small:px-12 py-12">
        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-6">
            {filteredResults.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-sm p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedResult(item)}
              >
                {/* Header: Brand & Status */}
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                    {item.brand}
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase">
                      Pass
                    </span>
                  </div>
                </div>

                {/* Body: Name & Concentration */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {item.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-2xl font-bold text-emerald-700">
                    {item.concentration}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    Result
                  </span>
                </div>

                {/* Footer: Details & Action */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-400 font-mono">
                    Batch:{" "}
                    <span className="text-gray-600 font-semibold">
                      {item.batch}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">
                    View Report <Eye className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <FlaskConical className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">
              No results found
            </h3>
            <p className="text-gray-500">Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* 3. MODAL*/}
      <AnimatePresence>
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedResult(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-gray-200 shadow-2xl rounded-sm overflow-hidden"
            >
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                <div>
                  <h3 className="text-gray-900 font-bold text-lg">
                    {selectedResult.name}
                  </h3>
                  <p className="text-xs text-emerald-600 font-mono mt-1">
                    Batch: {selectedResult.batch} //{" "}
                    {selectedResult.concentration}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4 flex justify-center">
                <img
                  src={selectedResult.imageSrc}
                  alt={`Lab result for ${selectedResult.name}`}
                  className="w-full h-auto object-contain self-start shadow-sm bg-white"
                />
              </div>

              {/* Footer */}
              <div className="shrink-0 p-4 border-t border-gray-100 bg-white flex justify-end sm:justify-between items-center">
                <span className="text-[10px] text-gray-400 font-mono hidden sm:block">
                  VERIFIED INDEPENDENTLY
                </span>
                <a
                  href={selectedResult.pdfLink}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-2 text-xs font-bold text-white bg-black hover:bg-emerald-600 px-5 py-3 transition-colors uppercase tracking-wider rounded-sm"
                >
                  Download PDF <Download className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
