import LegalDocument from '@/Components/Legal/LegalDocument';
import { cgvParagraphs } from '@/data/cgvContent';

export const metadata = {
    title: 'Conditions générales de vente – Mentors (CGV) | La Propulserie',
};

export default function CgvMentorsPage() {
    return (
        <LegalDocument
            title="Conditions générales de vente – Mentors (CGV)"
            paragraphs={cgvParagraphs}
        />
    );
}
