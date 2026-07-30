import LegalDocument from '@/Components/Legal/LegalDocument';
import { cguParagraphs } from '@/data/cguContent';

export const metadata = {
    title: 'Conditions générales d’utilisation (CGU) | La Propulserie',
};

export default function CguPage() {
    return (
        <LegalDocument
            title="Conditions générales d’utilisation (CGU)"
            paragraphs={cguParagraphs}
        />
    );
}
