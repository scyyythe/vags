import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 relative">
          <h2 className="text-md font-semibold text-gray-900 mb-2">
            Terms & Conditions
          </h2>
          <button
            onClick={handleExit}
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="text-xs text-gray-700 leading-relaxed space-y-4">
            <div className="space-y-4">
              <section>
                <p className="font-semibold text-gray-900 mb-2">
                  Welcome to the Virtual Art Gallery System
                </p>
                <p>
                  By registering, accessing, or using this platform, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using our services.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By creating an account or using the System, you acknowledge that you have read, understood, and agreed to these Terms & Conditions. If you do not agree with any part of these terms, you must not use the platform.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  2. Purpose of the System
                </h3>
                <p>
                  The Virtual Art Gallery System is an online platform designed to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Allow artists to showcase, promote, and manage their artworks virtually.</li>
                  <li>Enable users and art enthusiasts to view, appreciate, and engage with digital art exhibitions.</li>
                </ul>
                <p className="mt-2">
                  This platform is for educational and creative purposes and must not be used for unlawful or inappropriate activities.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  3. User Responsibilities
                </h3>
                <p>Users must:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide accurate and truthful information during registration.</li>
                  <li>Maintain the confidentiality of their account credentials.</li>
                  <li>Use the platform respectfully and avoid posting, uploading, or sharing inappropriate, offensive, or copyrighted content without permission.</li>
                  <li>Not post false information or materials intended to deceive others.</li>
                  <li>Not post content that violates privacy, copyright, or intellectual property rights of others.</li>
                </ul>
                <p className="mt-2">
                  Users are solely responsible for all activities performed under their account.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  4. Artwork Ownership and Copyright
                </h3>
                <p>
                  Artists retain full ownership and copyright of the artworks they upload. By uploading artwork, you grant the System a non-exclusive right to display it on the platform for viewing and promotional purposes. Users must not copy, download, reproduce, or distribute artworks without the owner's written consent.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  5. Content Moderation
                </h3>
                <p>The administrators reserve the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Review, approve, or remove any artwork or content that violates these Terms.</li>
                  <li>Suspend or terminate user accounts involved in misconduct or abuse.</li>
                </ul>
                <p className="mt-2">
                  This ensures a safe, respectful, and professional environment for all users.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  6. Privacy and Data Protection
                </h3>
                <p>
                  The System collects and stores basic user information for identification, account access, and gallery management purposes. We do not share personal data with third parties without consent. Users are encouraged to read the Privacy Policy for more details on how data is handled and protected.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  7. Prohibited Activities
                </h3>
                <p>Users are strictly prohibited from:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Uploading malware, viruses, or malicious files.</li>
                  <li>Attempting to hack, modify, or disrupt system operations.</li>
                  <li>Impersonating other users or claiming ownership of others' works.</li>
                  <li>Using the platform for commercial activities without authorization.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  8. Account Suspension and Termination
                </h3>
                <p>
                  The System administrators may suspend or delete accounts that violate these Terms & Conditions, display inappropriate or plagiarized content, or engage in fraudulent or harmful activities. Suspended users may contact the admin for appeal or review.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  9. Limitation of Liability
                </h3>
                <p>
                  The Virtual Art Gallery System and its developers are not responsible for any loss, damage, or misuse of artworks uploaded by users, or any technical issues, errors, or interruptions that may occur. Users agree to use the platform at their own risk.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  10. Changes to the Terms
                </h3>
                <p>
                  We reserve the right to modify or update these Terms & Conditions at any time. Users will be notified of significant changes via email or platform notification. Continued use of the system after updates means you accept the revised terms.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  11. Contact Information
                </h3>
                <p>
                  For questions, concerns, or feedback regarding these Terms, please contact the system administrator through the Help Center or via email at:
                </p>
                <p className="mt-1">
                  worxist@gmail.com
                </p>
              </section>

              <section className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Agreement
                </h3>
                <p>
                  By clicking "Agree & Continue", you confirm that:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>You have read and understood the Terms & Conditions.</li>
                  <li>You agree to comply with all rules and responsibilities stated herein.</li>
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
                className="h-3 w-3"
              />
              <label
                htmlFor="terms-agreement"
                className="text-[10px] text-gray-700 cursor-pointer"
              >
                I have read and agree to the Terms & Conditions.
              </label>
            </div>

            {/* Agree Button */}
            <button
              onClick={handleAgree}
              disabled={!isAgreed}
              className="px-8 py-1 rounded-full bg-red-900 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs"
            >
              Agree & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
