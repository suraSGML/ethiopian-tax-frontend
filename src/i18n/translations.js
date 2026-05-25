/**
 * Amharic Translation System
 * Provides bilingual support (English/Amharic) for the Ethiopian Tax System
 */

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    taxFilings: 'Tax Filings',
    payments: 'Payments',
    compliance: 'Compliance',
    taxCalculator: 'Tax Calculator',
    profile: 'Profile',
    notifications: 'Notifications',
    
    // Admin/Officer Navigation
    reviewQueue: 'Review Queue',
    allFilings: 'All Filings',
    users: 'Taxpayers',
    reports: 'Reports',
    fraudAlerts: 'Fraud Alerts',
    auditLogs: 'Audit Logs',
    
    // Common
    welcome: 'Welcome',
    logout: 'Sign Out',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    print: 'Print',
    download: 'Download',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Tax Filing
    newFiling: 'New Filing',
    filingDetails: 'Filing Details',
    referenceNumber: 'Reference Number',
    taxType: 'Tax Type',
    filingPeriod: 'Filing Period',
    fiscalYear: 'Fiscal Year',
    grossIncome: 'Gross Income',
    allowableDeductions: 'Allowable Deductions',
    taxableIncome: 'Taxable Income',
    calculatedTax: 'Calculated Tax',
    totalDue: 'Total Due',
    amountPaid: 'Amount Paid',
    balanceDue: 'Balance Due',
    status: 'Status',
    submissionDate: 'Submission Date',
    dueDate: 'Due Date',
    
    // Status
    draft: 'Draft',
    submitted: 'Submitted',
    underReview: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    paid: 'Paid',
    overdue: 'Overdue',
    amended: 'Amended',
    appealed: 'Under Appeal',
    
    // Tax Types
    personalIncome: 'Personal Income Tax',
    businessIncome: 'Business Income Tax',
    vat: 'Value Added Tax (VAT)',
    turnover: 'Turnover Tax (TOT)',
    withholding: 'Withholding Tax',
    
    // Filing Periods
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annual: 'Annual',
    
    // Actions
    uploadDocument: 'Upload Document',
    submitFiling: 'Submit Filing',
    payNow: 'Pay Now',
    fileAppeal: 'File Appeal',
    amendFiling: 'Amend Filing',
    reviewFiling: 'Review Filing',
    resolveAppeal: 'Resolve Appeal',
    
    // Documents
    supportingDocuments: 'Supporting Documents',
    incomeStatement: 'Income Statement',
    balanceSheet: 'Balance Sheet',
    receipt: 'Receipt',
    invoice: 'Invoice',
    bankStatement: 'Bank Statement',
    other: 'Other',
    
    // Payments
    paymentHistory: 'Payment History',
    paymentMethod: 'Payment Method',
    transactionId: 'Transaction ID',
    receiptNumber: 'Receipt Number',
    paymentDate: 'Payment Date',
    
    // Compliance
    complianceScore: 'Compliance Score',
    complianceCertificate: 'Compliance Certificate',
    taxClearance: 'Tax Clearance',
    
    // Notifications
    newFilingSubmitted: 'New Filing Submitted',
    filingApproved: 'Filing Approved',
    filingRejected: 'Filing Rejected',
    paymentConfirmed: 'Payment Confirmed',
    penaltyNotice: 'Penalty Notice',
    
    // Ethiopian Calendar
    ethiopianCalendar: 'Ethiopian Calendar',
    ethiopianDate: 'Ethiopian Date',
    ethiopianFiscalYear: 'Ethiopian Fiscal Year',
    gregorianDate: 'Gregorian Date',
    
    // Ethiopian Months
    meskerem: 'Meskerem',
    tikimt: 'Tikimt',
    hidar: 'Hidar',
    tahsas: 'Tahsas',
    tir: 'Tir',
    yekatit: 'Yekatit',
    megabit: 'Megabit',
    miazia: 'Miazia',
    genbot: 'Genbot',
    sene: 'Sene',
    hamle: 'Hamle',
    nehase: 'Nehase',
    pagume: 'Pagume',
    
    // Ethiopian Holidays
    ethiopianChristmas: 'Ethiopian Christmas (Genna)',
    epiphany: 'Epiphany (Timket)',
    goodFriday: 'Good Friday (Siklet)',
    easter: 'Easter (Fasika)',
    ethiopianNewYear: 'Ethiopian New Year (Enkutatash)',
    findingTrueCross: 'Finding of the True Cross (Meskel)',
    
    // Regions
    addisAbaba: 'Addis Ababa',
    oromia: 'Oromia',
    amhara: 'Amhara',
    tigray: 'Tigray',
    somali: 'Somali',
    afar: 'Afar',
    southern: 'Southern Nations',
    gambela: 'Gambela',
    benishangul: 'Benishangul-Gumuz',
  },
  
  am: {
    // Navigation
    dashboard: 'ዳሽቦርድ',
    taxFilings: 'ግብር ማስመዝያ',
    payments: 'ክፍዎቶች',
    compliance: 'አስተካከል',
    taxCalculator: 'ግብር ማስላት',
    profile: 'መገለጫ',
    notifications: 'ማስታወሻያዎች',
    
    // Admin/Officer Navigation
    reviewQueue: 'ማጽያየት ሰርዝ',
    allFilings: 'ሁሉም ግብር ማስመዝያ',
    users: 'ግብር ከፈልዎች',
    reports: 'ሪፖርቶች',
    fraudAlerts: 'ፈተና ማስታወሻያዎች',
    auditLogs: 'የቅጥር መዝገብ',
    
    // Common
    welcome: 'እንኳን አደስች',
    logout: 'ውጣ',
    search: 'ፈልግ',
    filter: 'አጣራ',
    export: 'ወጥቀ',
    print: 'አትም',
    download: 'አውርድ',
    view: 'ተመልከት',
    edit: 'አርትዕ',
    delete: 'አጥፋ',
    save: 'አስቀምር',
    cancel: 'ተው',
    submit: 'አስገባ',
    confirm: 'አረጋግጥ',
    back: 'ተመለስ',
    next: 'ቀጣይ',
    previous: 'ቀድሞ',
    loading: 'በመጫን...',
    error: 'ስህተት',
    success: 'ስኬስ',
    
    // Tax Filing
    newFiling: 'አዲስ ግብር ማስመዝያ',
    filingDetails: 'የግብር ማስመዝያ ዝርዝሮች',
    referenceNumber: 'ማመልከቻ ቁጥር',
    taxType: 'የግብር ዓይነት',
    filingPeriod: 'የማስመዝያ ጊዜ',
    fiscalYear: 'የፋይስካል ዓመት',
    grossIncome: 'ጠቅላላ ገቢ',
    allowableDeductions: 'የሚፈቀዱ ቅነሳዎች',
    taxableIncome: 'የግብር ተገኝተኛ ገቢ',
    calculatedTax: 'የተሰበሰበ ግብር',
    totalDue: 'ጠቅላል የሚከፈል',
    amountPaid: 'የተከፈል መጠን',
    balanceDue: 'ቀሪ የሚከፈል',
    status: 'ሁኔታ',
    submissionDate: 'የማስመዝያ ቀን',
    dueDate: 'የመጨረሻ ቀን',
    
    // Status
    draft: 'ንዳት',
    submitted: 'ተልኳኳ',
    underReview: 'በማጽያየት ላይ',
    approved: 'ተፈቀደ',
    rejected: 'ተከለከ',
    paid: 'ተከፈለ',
    overdue: 'ከጊዜ ወጣ',
    amended: 'ተሻሻለ',
    appealed: 'በአራጊው ላይ',
    
    // Tax Types
    personalIncome: 'የግል ገቢ ግብር',
    businessIncome: 'የንግስ ገቢ ግብር',
    vat: 'የዋጋ ውስጥ ግብር (VAT)',
    turnover: 'የሽውስ ግብር (TOT)',
    withholding: 'የተያዘ ግብር',
    
    // Filing Periods
    monthly: 'ወርሳዊ',
    quarterly: 'ሩብን ወር',
    annual: 'ዓመታዊ',
    
    // Actions
    uploadDocument: 'ሰነድ አስገባ',
    submitFiling: 'ግብር ማስመዝያ አስገባ',
    payNow: 'አሁን ክፍል',
    fileAppeal: 'አራጊ ማቅረብ',
    amendFiling: 'ግብር ማሻሻል',
    reviewFiling: 'ግብር ማጽያየት',
    resolveAppeal: 'አራጊ መፍታት',
    
    // Documents
    supportingDocuments: 'የሚደግፍ ሰነዶች',
    incomeStatement: 'የገቢ መግለጫ',
    balanceSheet: 'ባላንስ',
    receipt: 'ደረስያ',
    invoice: 'ኢንቮይስ',
    bankStatement: 'የባንክ መግለጫ',
    other: 'ሌላ',
    
    // Payments
    paymentHistory: 'የክፍያ ታሪክ',
    paymentMethod: 'የክፍያ ዘዴ',
    transactionId: 'የግብይነት መለያ',
    receiptNumber: 'የደረስያ ቁጥር',
    paymentDate: 'የክፍያ ቀን',
    
    // Compliance
    complianceScore: 'የአስተካከል ነጥታ',
    complianceCertificate: 'የአስተካከል ማረጋግጫ',
    taxClearance: 'የግብር ፍቃድ',
    
    // Notifications
    newFilingSubmitted: 'አዲስ ግብር ማስመዝያ ተልኳኳ',
    filingApproved: 'ግብር ማስመዝያ ተፈቀደ',
    filingRejected: 'ግብር ማስመዝያ ተከለከ',
    paymentConfirmed: 'ክፍያ ተረጋገጠ',
    penaltyNotice: 'የቅጣት ማስታወሻያ',
    
    // Ethiopian Calendar
    ethiopianCalendar: 'የኢትዮጵያ ቀን መቁጽራፊ',
    ethiopianDate: 'የኢትዮጵያ ቀን',
    ethiopianFiscalYear: 'የኢትዮጵያ ፋይስካል ዓመት',
    gregorianDate: 'የግሪጎሪያን ቀን',
    
    // Ethiopian Months
    meskerem: 'መስከረም',
    tikimt: 'ጥቅምት',
    hidar: 'ህዳር',
    tahsas: 'ታህሳስ',
    tir: 'ጥር',
    yekatit: 'የካቲት',
    megabit: 'መጋቢት',
    miazia: 'ሚያዝያ',
    genbot: 'ገንቦት',
    sene: 'ሰኔ',
    hamle: 'ሐምሌ',
    nehase: 'ነሐሴ',
    pagume: 'ጳጉሜ',
    
    // Ethiopian Holidays
    ethiopianChristmas: 'የኢትዮጵያ ገና (ገና)',
    epiphany: 'ጥምቀት (ጥምቀት)',
    goodFriday: 'ዓርቢ ዕርሳ (ሲክሌት)',
    easter: 'ፋሲካ (ፋሲካ)',
    ethiopianNewYear: 'የኢትዮጵያ አዲስ ዓመት (እንቁጣሽ)',
    findingTrueCross: 'የእውል መስቀል ፍልል (መስቀል)',
    
    // Regions
    addisAbaba: 'አዲስ አበባ',
    oromia: 'ኦሮሚያ',
    amhara: 'አማራ',
    tigray: 'ትግራይ',
    somali: 'ሶማሌ',
    afar: 'አፋር',
    southern: 'ደቡብ ብሔሮች',
    gambela: 'ጋምቤላ',
    benishangul: 'ቤንሻንጉል-ጉሙዝ',
  },
};

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {string} language - Language code ('en' or 'am')
 * @returns {string} Translated text
 */
export function t(key, language = 'en') {
  const keys = key.split('.');
  let value = translations[language];
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = translations['en'];
      for (const k2 of keys) {
        if (value && value[k2]) {
          value = value[k2];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }
  
  return value || key;
}

/**
 * Get all translations for a language
 * @param {string} language - Language code ('en' or 'am')
 * @returns {object} Translation object
 */
export function getTranslations(language = 'en') {
  return translations[language] || translations['en'];
}

/**
 * Check if language is RTL (Right-to-Left)
 * @param {string} language - Language code
 * @returns {boolean}
 */
export function isRTL(language) {
  return language === 'am';
}

/**
 * Get available languages
 * @returns {array} Array of language codes
 */
export function getAvailableLanguages() {
  return ['en', 'am'];
}

/**
 * Get language name
 * @param {string} language - Language code
 * @returns {string} Language name
 */
export function getLanguageName(language) {
  const names = {
    en: 'English',
    am: 'አማርኛ (Amharic)',
  };
  return names[language] || language;
}

export default translations;
