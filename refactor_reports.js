const fs = require('fs');
const path = 'c:/dev/CS2/src/features/reports/components/ReportsView.tsx';

let content = fs.readFileSync(path, 'utf8');

// Using Unicode for backticks
const bt = String.fromCharCode(96);

// 1. Header Replacement
const targetHeader = "        {/* Header Section */}\n" +
"        <div className=\"flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-100 pb-8\">\n" +
"          <div className=\"space-y-1\">\n" +
"            <h2 className=\"text-2xl font-bold text-slate-800 font-outfit tracking-tight flex items-center gap-3\">\n" +
"              Reports & Statistics\n" +
"            </h2>\n" +
"            <div className=\"flex items-center gap-2.5 text-slate-400 font-noto text-[9px] uppercase tracking-[0.2em] font-medium\">\n" +
"              <div className=\"w-1 h-1 rounded-full bg-blue-500\"></div>\n" +
"              Command Console • 27 Mar 2026\n" +
"            </div>\n" +
"          </div>\n" +
"\n" +
"          <div className=\"flex items-center gap-4 w-full md:w-auto\">\n" +
"             {/* Mode Switcher */}\n" +
"             <div className=\"inline-flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-100 shadow-sm relative z-10 shrink-0\">\n" +
"                <button \n" +
"                  onClick={() => setViewMode('report')}\n" +
"                  title=\"Report Matrix\"\n" +
"                  className={" + bt + "p-2 rounded-xl transition-all duration-300 ${viewMode === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}" + bt + "}\n" +
"                >\n" +
"                  <FileText size={18} />\n" +
"                </button>\n" +
"                <button \n" +
"                  onClick={() => setViewMode('stats')}\n" +
"                  title=\"Performance Statistics\"\n" +
"                  className={" + bt + "p-2 rounded-xl transition-all duration-300 ${viewMode === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}" + bt + "}\n" +
"                >\n" +
"                  <BarChart2 size={18} />\n" +
"                </button>\n" +
"             </div>\n" +
"\n" +
"             <div className=\"relative group w-full md:w-64\">\n" +
"                <Search className=\"absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors\" size={16} />\n" +
"                <input \n" +
"                  type=\"text\"\n" +
"                  placeholder=\"Search by name...\"\n" +
"                  value={searchTerm}\n" +
"                  onChange={(e) => setSearchTerm(e.target.value)}\n" +
"                  className=\"w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-[13px] font-medium text-slate-600 focus:outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-50/20 transition-all placeholder:text-slate-300\"\n" +
"                />\n" +
"             </div>\n" +
"          </div>\n" +
"        </div>";

const replacementHeader = "        {/* Page Header (Golden Rules Mode 1) */}\n" +
"        <div className=\"flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pt-4 pb-6 mb-6\">\n" +
"          <div className=\"flex flex-col gap-1\">\n" +
"            <div className=\"flex items-center gap-2\">\n" +
"              <h2 className=\"text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none\">\n" +
"                REPORTS & STATISTICS\n" +
"              </h2>\n" +
"            </div>\n" +
"            <p className=\"text-slate-400 font-noto text-[11px] mt-1.5\">\n" +
"              รายงานและสถิติการปฏิบัติงาน • <span className=\"text-[var(--primary-theme)] font-bold\">Command Console</span>\n" +
"            </p>\n" +
"          </div>\n" +
"\n" +
"          <div className=\"flex items-center gap-4 w-full md:w-auto\">\n" +
"             {/* Mode Switcher */}\n" +
"             <div className=\"inline-flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-100 shadow-sm relative z-10 shrink-0\">\n" +
"                <button \n" +
"                  onClick={() => setViewMode('report')}\n" +
"                  title=\"Report Matrix\"\n" +
"                  className={" + bt + "p-2 rounded-xl transition-all duration-300 ${viewMode === 'report' ? 'bg-white text-[var(--primary-theme)] shadow-sm' : 'text-slate-400 hover:text-[var(--primary-theme)]'}" + bt + "}\n" +
"                >\n" +
"                  <FileText size={18} />\n" +
"                </button>\n" +
"                <button \n" +
"                  onClick={() => setViewMode('stats')}\n" +
"                  title=\"Performance Statistics\"\n" +
"                  className={" + bt + "p-2 rounded-xl transition-all duration-300 ${viewMode === 'stats' ? 'bg-white text-[var(--primary-theme)] shadow-sm' : 'text-slate-400 hover:text-[var(--primary-theme)]'}" + bt + "}\n" +
"                >\n" +
"                  <BarChart2 size={18} />\n" +
"                </button>\n" +
"             </div>\n" +
"\n" +
"             <div className=\"relative group w-full md:w-64\">\n" +
"                <Search className=\"absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--primary-theme)] transition-colors\" size={16} />\n" +
"                <input \n" +
"                  type=\"text\"\n" +
"                  placeholder=\"Search by name...\"\n" +
"                  value={searchTerm}\n" +
"                  onChange={(e) => setSearchTerm(e.target.value)}\n" +
"                  className=\"w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-[13px] font-medium text-slate-600 focus:outline-none focus:border-[var(--primary-theme)] focus:ring-4 focus:ring-blue-100/50 transition-all placeholder:text-slate-300\"\n" +
"                />\n" +
"             </div>\n" +
"          </div>\n" +
"        </div>";

if (!content.includes(targetHeader)) {
    console.warn('Target Header not found exactly format. Will skip header string replace and try regex.');
} else {
    content = content.replace(targetHeader, replacementHeader);
}

// Global color sweeps
content = content.replace(/text-blue-500/g, 'text-[var(--primary-theme)]');
content = content.replace(/text-blue-600/g, 'text-[var(--primary-theme)]');
content = content.replace(/bg-blue-600/g, 'bg-[var(--primary-theme)]');
content = content.replace(/bg-blue-500/g, 'bg-[var(--primary-theme)]');
content = content.replace(/fill-blue-500/g, 'fill-[var(--primary-theme)]');
content = content.replace(/border-blue-600/g, 'border-[var(--primary-theme)]');
content = content.replace(/border-blue-300/g, 'border-[var(--primary-theme)]');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully refactored ReportsView.tsx');
