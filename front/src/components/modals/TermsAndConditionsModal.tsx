import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onExit: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onAgree,
  onExit,
}) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const { language } = useLanguage();

  const titleText = useAutoTranslation("Terms & Conditions", language);
  const closeText = useAutoTranslation("Close", language);
  const welcomeText = useAutoTranslation("Welcome to the Virtual Art Gallery System", language);
  const acceptanceHeading = useAutoTranslation("1. Acceptance of Terms", language);
  const purposeHeading = useAutoTranslation("2. Purpose of the System", language);
  const userRespHeading = useAutoTranslation("3. User Responsibilities", language);
  const ownershipHeading = useAutoTranslation("4. Artwork Ownership and Copyright", language);
  const moderationHeading = useAutoTranslation("5. Content Moderation", language);
  const privacyHeading = useAutoTranslation("6. Privacy and Data Protection", language);
  const prohibitedHeading = useAutoTranslation("7. Prohibited Activities", language);
  const suspensionHeading = useAutoTranslation("8. Account Suspension and Termination", language);
  const limitationHeading = useAutoTranslation("9. Limitation of Liability", language);
  const changesHeading = useAutoTranslation("10. Changes to the Terms", language);
  const contactHeading = useAutoTranslation("11. Contact Information", language);

  const introParagraph = useAutoTranslation(
    "By registering, accessing, or using this platform, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using our services.",
    language
  );
  const acceptanceParagraph = useAutoTranslation(
    "By creating an account or using the System, you acknowledge that you have read, understood, and agreed to these Terms & Conditions. If you do not agree with any part of these terms, you must not use the platform.",
    language
  );

  const purposeIntro = useAutoTranslation("The Virtual Art Gallery System is an online platform designed to:", language);
  const purposeItem1 = useAutoTranslation("Allow artists to showcase, promote, and manage their artworks virtually.", language);
  const purposeItem2 = useAutoTranslation("Enable users and art enthusiasts to view, appreciate, and engage with digital art exhibitions.", language);
  const purposeNote = useAutoTranslation(
    "This platform is for educational and creative purposes and must not be used for unlawful or inappropriate activities.",
    language
  );

  const userMustText = useAutoTranslation("Users must:", language);
  const userItem1 = useAutoTranslation("Provide accurate and truthful information during registration.", language);
  const userItem2 = useAutoTranslation("Maintain the confidentiality of their account credentials.", language);
  const userItem3 = useAutoTranslation(
    "Use the platform respectfully and avoid posting, uploading, or sharing inappropriate, offensive, or copyrighted content without permission.",
    language
  );
  const userItem4 = useAutoTranslation("Not post false information or materials intended to deceive others.", language);
  const userItem5 = useAutoTranslation(
    "Not post content that violates privacy, copyright, or intellectual property rights of others.",
    language
  );
  const userNote = useAutoTranslation("Users are solely responsible for all activities performed under their account.", language);

  const ownershipParagraph = useAutoTranslation(
    "Artists retain full ownership and copyright of the artworks they upload. By uploading artwork, you grant the System a non-exclusive right to display it on the platform for viewing and promotional purposes. Users must not copy, download, reproduce, or distribute artworks without the owner's written consent.",
    language
  );

  const moderationIntro = useAutoTranslation("The administrators reserve the right to:", language);
  const moderationItem1 = useAutoTranslation(
    "Review, approve, or remove any artwork or content that violates these Terms.",
    language
  );
  const moderationItem2 = useAutoTranslation(
    "Suspend or terminate user accounts involved in misconduct or abuse.",
    language
  );
  const moderationNote = useAutoTranslation(
    "This ensures a safe, respectful, and professional environment for all users.",
    language
  );

  const privacyParagraph = useAutoTranslation(
    "The System collects and stores basic user information for identification, account access, and gallery management purposes. We do not share personal data with third parties without consent. Users are encouraged to read the Privacy Policy for more details on how data is handled and protected.",
    language
  );

  const prohibitedIntro = useAutoTranslation("Users are strictly prohibited from:", language);
  const prohibitedItem1 = useAutoTranslation("Uploading malware, viruses, or malicious files.", language);
  const prohibitedItem2 = useAutoTranslation("Attempting to hack, modify, or disrupt system operations.", language);
  const prohibitedItem3 = useAutoTranslation("Impersonating other users or claiming ownership of others' works.", language);
  const prohibitedItem4 = useAutoTranslation("Using the platform for commercial activities without authorization.", language);

  const suspensionParagraph = useAutoTranslation(
    "The System administrators may suspend or delete accounts that violate these Terms & Conditions, display inappropriate or plagiarized content, or engage in fraudulent or harmful activities. Suspended users may contact the admin for appeal or review.",
    language
  );

  const limitationParagraph = useAutoTranslation(
    "The Virtual Art Gallery System and its developers are not responsible for any loss, damage, or misuse of artworks uploaded by users, or any technical issues, errors, or interruptions that may occur. Users agree to use the platform at their own risk.",
    language
  );

  const changesParagraph = useAutoTranslation(
    "We reserve the right to modify or update these Terms & Conditions at any time. Users will be notified of significant changes via email or platform notification. Continued use of the system after updates means you accept the revised terms.",
    language
  );

  const contactParagraph = useAutoTranslation(
    "For questions, concerns, or feedback regarding these Terms, please contact the system administrator through the Help Center or via email at:",
    language
  );

  const agreementHeading = useAutoTranslation("Agreement", language);
  const agreeConfirmText = useAutoTranslation("By clicking \"Agree & Continue\", you confirm that:", language);
  const agreeListItem1 = useAutoTranslation("You have read and understood the Terms & Conditions.", language);
  const agreeListItem2 = useAutoTranslation("You agree to comply with all rules and responsibilities stated herein.", language);
  const agreeCheckboxLabel = useAutoTranslation("I have read and agree to the Terms & Conditions.", language);
  const agreeButtonText = useAutoTranslation("Agree & Continue", language);

  if (!isOpen) return null;

  const handleAgree = () => {
    if (isAgreed) {
      onAgree();
    }
  };

  const handleExit = () => {
    onExit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 relative">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {titleText}
          </p>
          {/* <button
            onClick={handleExit}
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={closeText}
          >
            <X className="h-5 w-5" />
          </button> */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="text-[11px] text-gray-700 leading-relaxed space-y-4">
            <div className="space-y-4">
              <section>
                <p className="font-semibold text-gray-900 mb-2">
                  {welcomeText}
                </p>
                <p>
                  {introParagraph}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {acceptanceHeading}
                </h3>
                <p>
                  {acceptanceParagraph}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {purposeHeading}
                </h3>
                <p>
                  {purposeIntro}
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{purposeItem1}</li>
                  <li>{purposeItem2}</li>
                </ul>
                <p className="mt-2">
                  {purposeNote}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {userRespHeading}
                </h3>
                <p>{userMustText}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{userItem1}</li>
                  <li>{userItem2}</li>
                  <li>{userItem3}</li>
                  <li>{userItem4}</li>
                  <li>{userItem5}</li>
                </ul>
                <p className="mt-2">
                  {userNote}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {ownershipHeading}
                </h3>
                <p>
                  {ownershipParagraph}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {moderationHeading}
                </h3>
                <p>{moderationIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{moderationItem1}</li>
                  <li>{moderationItem2}</li>
                </ul>
                <p className="mt-2">
                  {moderationNote}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {privacyHeading}
                </h3>
                <p>
                  {privacyParagraph}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {prohibitedHeading}
                </h3>
                <p>{prohibitedIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{prohibitedItem1}</li>
                  <li>{prohibitedItem2}</li>
                  <li>{prohibitedItem3}</li>
                  <li>{prohibitedItem4}</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {suspensionHeading}
                </h3>
                <p>
                  {suspensionParagraph}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {limitationHeading}
                </h3>
                <p>
                  {limitationParagraph}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {changesHeading}
                </h3>
                <p>
                  {changesParagraph}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {contactHeading}
                </h3>
                <p>
                  {contactParagraph}
                </p>
                <p className="mt-1">
                  worxist@gmail.com
                </p>
              </section>

              <section className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {agreementHeading}
                </h3>
                <p>
                  {agreeConfirmText}
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>{agreeListItem1}</li>
                  <li>{agreeListItem2}</li>
                </ul>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pt-2 pb-6">
          {/* Checkbox and Button Row */}
          <div className="flex items-center justify-between">
            {/* Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms-agreement"
                checked={isAgreed}
                onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
                className="h-[15px] w-[15px]  data-[state=checked]:bg-red-900 data-[state=checked]:border-red-900"
              />
              <label
                htmlFor="terms-agreement"
                className="text-[9px] text-gray-700 cursor-pointer"
              >
                {agreeCheckboxLabel}
              </label>
            </div>

            {/* Agree Button */}
            <button
              onClick={handleAgree}
              disabled={!isAgreed}
              className="px-8 py-1 rounded-full bg-red-900 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] whitespace-nowrap"
            >
              {agreeButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
