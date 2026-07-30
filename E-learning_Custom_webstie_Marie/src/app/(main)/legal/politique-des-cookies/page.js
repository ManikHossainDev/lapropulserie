import LegalDocument from '@/Components/Legal/LegalDocument';
import { cookiesParagraphs } from '@/data/cookiesContent';

export const metadata = {
    title: 'Politique des cookies | La Propulserie',
};

export default function CookiesPage() {
    return (
        <LegalDocument
            title="Politique des cookies"
            paragraphs={cookiesParagraphs}
        />
    );
}
