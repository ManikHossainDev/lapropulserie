import LegalDocument from '@/Components/Legal/LegalDocument';
import { privacyParagraphs } from '@/data/privacyContent';

export const metadata = {
    title: 'Politique de confidentialité | La Propulserie',
};

export default function PrivacyPage() {
    return (
        <LegalDocument
            title="Politique de confidentialité"
            paragraphs={privacyParagraphs}
        />
    );
}
