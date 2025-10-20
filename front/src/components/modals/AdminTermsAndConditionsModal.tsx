import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface AdminTermsAndConditionsModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onExit: () => void;
}

const AdminTermsAndConditionsModal: React.FC<AdminTermsAndConditionsModalProps> = ({
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 relative">
          <h2 className="text-md font-semibold text-gray-900 mb-2">
            Administrator and Moderator Terms & Conditions
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
                <p className="text-xs text-gray-500 mb-4">
                  Last Updated: October 20, 2025
                </p>
                <p className="font-semibold text-gray-900 mb-2">
                  Virtual Art Gallery System
                </p>
                <p>
                  These Administrator and Moderator Terms & Conditions ("Admin Terms") outline the roles, duties, and responsibilities of system administrators and moderators who manage and maintain the Virtual Art Gallery System ("the System").
                </p>
                <p className="mt-2">
                  By accepting an admin or moderator role, you agree to follow these policies in addition to the general User Terms & Conditions.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  1. Purpose
                </h3>
                <p>The purpose of these Admin Terms is to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Ensure proper handling of administrative and moderation privileges.</li>
                  <li>Promote fairness, transparency, and accountability in system management.</li>
                  <li>Protect user data, content, and system integrity.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  2. Definitions
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Administrator (Admin):</strong> A user with full control over system functions, including managing user roles, content, and technical settings.</li>
                  <li><strong>Moderator:</strong> A user responsible for reviewing, approving, and monitoring artworks and user activity to ensure compliance with platform rules.</li>
                  <li><strong>User:</strong> Any registered artist, viewer, or guest who uses the system.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  3. Administrator Responsibilities
                </h3>
                <p>Administrators must:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Manage and oversee user accounts, moderator actions, and system updates.</li>
                  <li>Ensure that all users and moderators comply with the Terms & Conditions.</li>
                  <li>Handle technical maintenance, data backups, and content organization responsibly.</li>
                  <li>Protect all confidential information and user data stored in the system.</li>
                  <li>Respond promptly to reported issues, system errors, or abuse complaints.</li>
                  <li>Maintain professional and ethical conduct while performing administrative duties.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  4. Moderator Responsibilities
                </h3>
                <p>Moderators must:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Review, approve, or reject artworks submitted by users according to community guidelines.</li>
                  <li>Monitor uploaded content for appropriateness, originality, and copyright compliance.</li>
                  <li>Report offensive, harmful, or plagiarized materials to the admin for further action.</li>
                  <li>Maintain neutrality and treat all artists and users fairly.</li>
                  <li>Avoid personal bias, favoritism, or discrimination in moderation decisions.</li>
                  <li>Keep all moderation actions and user reports confidential.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  5. Use of Privileges
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Admins and moderators must not misuse their access rights for personal gain or to harm others.</li>
                  <li>All moderation and administrative actions are subject to system logging and review.</li>
                  <li>Access to private data (e.g., user profiles, artwork information) must only be used for official purposes.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  6. Confidentiality
                </h3>
                <p>Both administrators and moderators agree to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Keep all user information, reports, and system data confidential.</li>
                  <li>Avoid sharing private information with unauthorized parties.</li>
                  <li>Securely handle system credentials and never share admin/moderator accounts.</li>
                </ul>
                <p className="mt-2 font-semibold">
                  Any breach of confidentiality may lead to immediate role suspension or permanent removal.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  7. Prohibited Actions
                </h3>
                <p>Admins and moderators are strictly prohibited from:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Deleting or altering artworks or data without valid reason.</li>
                  <li>Manipulating statistics or system content for personal benefit.</li>
                  <li>Sharing admin/moderator access with others.</li>
                  <li>Ignoring user complaints or abusing authority.</li>
                  <li>Disclosing confidential or sensitive system information.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  8. Accountability and Review
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All actions performed by admins and moderators are recorded in activity logs.</li>
                  <li>The system reserves the right to review, investigate, or revoke privileges if misconduct or abuse occurs.</li>
                </ul>
                <p className="mt-2">Admins or moderators found violating these terms may face:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Role removal</li>
                  <li>Account suspension</li>
                  <li>Reporting to higher administration or management body</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  9. Termination of Role
                </h3>
                <p>Admin or moderator privileges may be removed when:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Duties are neglected or abused.</li>
                  <li>The user voluntarily resigns from the role.</li>
                  <li>The system undergoes restructuring or maintenance requiring reassignment.</li>
                </ul>
                <p className="mt-2">
                  After termination, the user retains a standard account but loses access to admin/moderator tools.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  10. Limitation of Liability
                </h3>
                <p>The developers and administrators of the Virtual Art Gallery System are not liable for:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Technical errors, data loss, or user misconduct beyond their control.</li>
                  <li>Any damages resulting from misuse of admin or moderator privileges by individuals.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  11. Amendments
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>These Admin Terms may be updated or revised as needed.</li>
                  <li>Admins and moderators will be notified of any changes.</li>
                  <li>Continued use of admin or moderator privileges implies agreement with the updated terms.</li>
                </ul>
              </section>

              <section className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  12. Acknowledgment and Agreement
                </h3>
                <p>By accepting an Administrator or Moderator role, you confirm that:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>You have read, understood, and agreed to these Terms & Conditions.</li>
                  <li>You will perform your duties responsibly and uphold the integrity of the system.</li>
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
                id="admin-terms-agreement"
                checked={isAgreed}
                onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
                className="h-3 w-3"
              />
              <label
                htmlFor="admin-terms-agreement"
                className="text-[10px] text-gray-700 cursor-pointer"
              >
                I have read and agree to the Administrator and Moderator Terms & Conditions.
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

export default AdminTermsAndConditionsModal;
