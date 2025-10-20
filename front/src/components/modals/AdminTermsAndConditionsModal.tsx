import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

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
  const { language } = useLanguage();

  const titleText = useAutoTranslation("Administrator and Moderator Terms & Conditions", language);
  const closeText = useAutoTranslation("Close", language);
  const lastUpdatedText = useAutoTranslation("Last Updated:", language);
  const systemNameText = useAutoTranslation("Virtual Art Gallery System", language);

  const purposeHeading = useAutoTranslation("1. Purpose", language);
  // Body text under Purpose
  const purposeIntro = useAutoTranslation("The purpose of these Admin Terms is to:", language);
  const purposeItem1 = useAutoTranslation("Ensure proper handling of administrative and moderation privileges.", language);
  const purposeItem2 = useAutoTranslation("Promote fairness, transparency, and accountability in system management.", language);
  const purposeItem3 = useAutoTranslation("Protect user data, content, and system integrity.", language);

  const definitionsHeading = useAutoTranslation("2. Definitions", language);
  const defAdmin = useAutoTranslation("Administrator (Admin): A user with full control over system functions, including managing user roles, content, and technical settings.", language);
  const defModerator = useAutoTranslation("Moderator: A user responsible for reviewing, approving, and monitoring artworks and user activity to ensure compliance with platform rules.", language);
  const defUser = useAutoTranslation("User: Any registered artist, viewer, or guest who uses the system.", language);

  const adminRespHeading = useAutoTranslation("3. Administrator Responsibilities", language);
  const adminRespIntro = useAutoTranslation("Administrators must:", language);
  const adminResp1 = useAutoTranslation("Manage and oversee user accounts, moderator actions, and system updates.", language);
  const adminResp2 = useAutoTranslation("Ensure that all users and moderators comply with the Terms & Conditions.", language);
  const adminResp3 = useAutoTranslation("Handle technical maintenance, data backups, and content organization responsibly.", language);
  const adminResp4 = useAutoTranslation("Protect all confidential information and user data stored in the system.", language);
  const adminResp5 = useAutoTranslation("Respond promptly to reported issues, system errors, or abuse complaints.", language);
  const adminResp6 = useAutoTranslation("Maintain professional and ethical conduct while performing administrative duties.", language);

  const modRespHeading = useAutoTranslation("4. Moderator Responsibilities", language);
  const modRespIntro = useAutoTranslation("Moderators must:", language);
  const modResp1 = useAutoTranslation("Review, approve, or reject artworks submitted by users according to community guidelines.", language);
  const modResp2 = useAutoTranslation("Monitor uploaded content for appropriateness, originality, and copyright compliance.", language);
  const modResp3 = useAutoTranslation("Report offensive, harmful, or plagiarized materials to the admin for further action.", language);
  const modResp4 = useAutoTranslation("Maintain neutrality and treat all artists and users fairly.", language);
  const modResp5 = useAutoTranslation("Avoid personal bias, favoritism, or discrimination in moderation decisions.", language);
  const modResp6 = useAutoTranslation("Keep all moderation actions and user reports confidential.", language);

  const privilegesHeading = useAutoTranslation("5. Use of Privileges", language);
  const privileges1 = useAutoTranslation("Admins and moderators must not misuse their access rights for personal gain or to harm others.", language);
  const privileges2 = useAutoTranslation("All moderation and administrative actions are subject to system logging and review.", language);
  const privileges3 = useAutoTranslation("Access to private data (e.g., user profiles, artwork information) must only be used for official purposes.", language);

  const confidentialityHeading = useAutoTranslation("6. Confidentiality", language);
  const confidentialityIntro = useAutoTranslation("Both administrators and moderators agree to:", language);
  const confidentiality1 = useAutoTranslation("Keep all user information, reports, and system data confidential.", language);
  const confidentiality2 = useAutoTranslation("Avoid sharing private information with unauthorized parties.", language);
  const confidentiality3 = useAutoTranslation("Securely handle system credentials and never share admin/moderator accounts.", language);
  const confidentialityNote = useAutoTranslation("Any breach of confidentiality may lead to immediate role suspension or permanent removal.", language);

  const prohibitedHeading = useAutoTranslation("7. Prohibited Actions", language);
  const prohibitedIntro = useAutoTranslation("Admins and moderators are strictly prohibited from:", language);
  const prohibited1 = useAutoTranslation("Deleting or altering artworks or data without valid reason.", language);
  const prohibited2 = useAutoTranslation("Manipulating statistics or system content for personal benefit.", language);
  const prohibited3 = useAutoTranslation("Sharing admin/moderator access with others.", language);
  const prohibited4 = useAutoTranslation("Ignoring user complaints or abusing authority.", language);
  const prohibited5 = useAutoTranslation("Disclosing confidential or sensitive system information.", language);

  const accountabilityHeading = useAutoTranslation("8. Accountability and Review", language);
  const accountability1 = useAutoTranslation("All actions performed by admins and moderators are recorded in activity logs.", language);
  const accountability2 = useAutoTranslation("The system reserves the right to review, investigate, or revoke privileges if misconduct or abuse occurs.", language);
  const accountabilityIntro = useAutoTranslation("Admins or moderators found violating these terms may face:", language);
  const accountabilityList1 = useAutoTranslation("Role removal", language);
  const accountabilityList2 = useAutoTranslation("Account suspension", language);
  const accountabilityList3 = useAutoTranslation("Reporting to higher administration or management body", language);

  const terminationHeading = useAutoTranslation("9. Termination of Role", language);
  const terminationIntro = useAutoTranslation("Admin or moderator privileges may be removed when:", language);
  const termination1 = useAutoTranslation("Duties are neglected or abused.", language);
  const termination2 = useAutoTranslation("The user voluntarily resigns from the role.", language);
  const termination3 = useAutoTranslation("The system undergoes restructuring or maintenance requiring reassignment.", language);
  const terminationNote = useAutoTranslation("After termination, the user retains a standard account but loses access to admin/moderator tools.", language);

  const liabilityHeading = useAutoTranslation("10. Limitation of Liability", language);
  const liabilityIntro = useAutoTranslation("The developers and administrators of the Virtual Art Gallery System are not liable for:", language);
  const liability1 = useAutoTranslation("Technical errors, data loss, or user misconduct beyond their control.", language);
  const liability2 = useAutoTranslation("Any damages resulting from misuse of admin or moderator privileges by individuals.", language);

  const amendmentsHeading = useAutoTranslation("11. Amendments", language);
  const amendments1 = useAutoTranslation("These Admin Terms may be updated or revised as needed.", language);
  const amendments2 = useAutoTranslation("Admins and moderators will be notified of any changes.", language);
  const amendments3 = useAutoTranslation("Continued use of admin or moderator privileges implies agreement with the updated terms.", language);

  const acknowledgmentHeading = useAutoTranslation("12. Acknowledgment and Agreement", language);
  const acknowledgmentIntro = useAutoTranslation("By accepting an Administrator or Moderator role, you confirm that:", language);
  const acknowledgment1 = useAutoTranslation("You have read, understood, and agreed to these Terms & Conditions.", language);
  const acknowledgment2 = useAutoTranslation("You will perform your duties responsibly and uphold the integrity of the system.", language);

  const agreeCheckboxLabel = useAutoTranslation(
    "I have read and agree to the Administrator and Moderator Terms & Conditions.",
    language
  );
  const agreeButtonText = useAutoTranslation("Agree & Continue", language);

  // Additional translations that were being called in JSX
  const adminTermsIntro = useAutoTranslation("These Administrator and Moderator Terms & Conditions (\"Admin Terms\") outline the roles, duties, and responsibilities of system administrators and moderators who manage and maintain the Virtual Art Gallery System (\"the System\").", language);
  const adminTermsNote = useAutoTranslation("By accepting an admin or moderator role, you agree to follow these policies in addition to the general User Terms & Conditions.", language);
  const adminDefLabel = useAutoTranslation("Administrator (Admin):", language);
  const adminDefText = useAutoTranslation("A user with full control over system functions, including managing user roles, content, and technical settings.", language);
  const moderatorDefLabel = useAutoTranslation("Moderator:", language);
  const moderatorDefText = useAutoTranslation("A user responsible for reviewing, approving, and monitoring artworks and user activity to ensure compliance with platform rules.", language);
  const userDefLabel = useAutoTranslation("User:", language);
  const userDefText = useAutoTranslation("Any registered artist, viewer, or guest who uses the system.", language);

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
            {titleText}
          </h2>
          <button
            onClick={handleExit}
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={closeText}
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
                  {lastUpdatedText} October 20, 2025
                </p>
                <p className="font-semibold text-gray-900 mb-2">
                  {systemNameText}
                </p>
                <p>
                  {adminTermsIntro}
                </p>
                <p className="mt-2">
                  {adminTermsNote}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {purposeHeading}
                </h3>
                <p>{purposeIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{purposeItem1}</li>
                  <li>{purposeItem2}</li>
                  <li>{purposeItem3}</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {definitionsHeading}
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>{adminDefLabel}</strong> {adminDefText}</li>
                  <li><strong>{moderatorDefLabel}</strong> {moderatorDefText}</li>
                  <li><strong>{userDefLabel}</strong> {userDefText}</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {adminRespHeading}
                </h3>
                <p>{adminRespIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{adminResp1}</li>
                  <li>{adminResp2}</li>
                  <li>{adminResp3}</li>
                  <li>{adminResp4}</li>
                  <li>{adminResp5}</li>
                  <li>{adminResp6}</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {modRespHeading}
                </h3>
                <p>{modRespIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{modResp1}</li>
                  <li>{modResp2}</li>
                  <li>{modResp3}</li>
                  <li>{modResp4}</li>
                  <li>{modResp5}</li>
                  <li>{modResp6}</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {privilegesHeading}
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{privileges1}</li>
                  <li>{privileges2}</li>
                  <li>{privileges3}</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {confidentialityHeading}
                </h3>
                <p>{confidentialityIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{confidentiality1}</li>
                  <li>{confidentiality2}</li>
                  <li>{confidentiality3}</li>
                </ul>
                <p className="mt-2 font-semibold">
                  {confidentialityNote}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {prohibitedHeading}
                </h3>
                <p>{prohibitedIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{prohibited1}</li>
                  <li>{prohibited2}</li>
                  <li>{prohibited3}</li>
                  <li>{prohibited4}</li>
                  <li>{prohibited5}</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {accountabilityHeading}
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{accountability1}</li>
                  <li>{accountability2}</li>
                </ul>
                <p className="mt-2">{accountabilityIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{accountabilityList1}</li>
                  <li>{accountabilityList2}</li>
                  <li>{accountabilityList3}</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {terminationHeading}
                </h3>
                <p>{terminationIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{termination1}</li>
                  <li>{termination2}</li>
                  <li>{termination3}</li>
                </ul>
                <p className="mt-2">
                  {terminationNote}
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {liabilityHeading}
                </h3>
                <p>{liabilityIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{liability1}</li>
                  <li>{liability2}</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {amendmentsHeading}
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{amendments1}</li>
                  <li>{amendments2}</li>
                  <li>{amendments3}</li>
                </ul>
              </section>

              <section className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {acknowledgmentHeading}
                </h3>
                <p>{acknowledgmentIntro}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>{acknowledgment1}</li>
                  <li>{acknowledgment2}</li>
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
                {agreeCheckboxLabel}
              </label>
            </div>

            {/* Agree Button */}
            <button
              onClick={handleAgree}
              disabled={!isAgreed}
              className="px-8 py-1 rounded-full bg-red-900 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs"
            >
              {agreeButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTermsAndConditionsModal;
