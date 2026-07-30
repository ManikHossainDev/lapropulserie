import LegalDocument from '@/Components/Legal/LegalDocument';
import { mentionsLegalesParagraphs } from '@/data/mentionsLegalesContent';

export const metadata = {
    title: 'Mentions légales | La Propulserie',
};

export default function MentionsLegalesPage() {
    return (
        <LegalDocument
            title="Mentions légales"
            paragraphs={mentionsLegalesParagraphs}
        />
    );
}
