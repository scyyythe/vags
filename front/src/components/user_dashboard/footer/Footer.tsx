import { ThemeToggle } from "./ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { languages } from "@/components/constants/languages";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { language: selectedLanguage } = useLanguage();

  // Auto-translated labels
  const privacyPolicyLabel = useAutoTranslation("Privacy Policy", selectedLanguage);
  const licenseLabel = useAutoTranslation("License", selectedLanguage);
  const allRightsReservedLabel = useAutoTranslation("All rights reserved", selectedLanguage);

  // Dynamically find the language name based on selectedLanguage code
  const currentLanguageName =
    languages.find((lang) => lang.code === selectedLanguage)?.name || "English";

  return (
    <div className="w-[100%] bg-gray-100 dark:bg-gray-800 py-2">
      <div className="container flex items-center justify-between px-4 md:px-6">
        <div className="flex gap-4 text-[10px] text-muted-foreground dark:text-gray-400">
            <a href="/privacy" className="hover:text-foreground transition-colors">
                {privacyPolicyLabel}
            </a>
            <a href="/license" className="hover:text-foreground transition-colors">
                {licenseLabel}
            </a>
        </div>
        
        <div className="text-[10px] text-muted-foreground dark:text-gray-400">
            &copy;{currentYear} {allRightsReservedLabel}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="text-[10px] text-muted-foreground dark:text-gray-400 mr-2">{currentLanguageName}</span>
            <i className='bx bx-world text-gray-400' ></i>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
