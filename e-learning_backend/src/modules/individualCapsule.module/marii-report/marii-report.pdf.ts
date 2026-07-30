import PDFDocument from 'pdfkit';
import { IMariiReportContent } from './marii-report.interface';

/** Generate a PDF buffer from structured Marii report content. */
export async function buildMariiReportPdf(
  report: IMariiReportContent,
  title: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#2d2a71').text('Rapport de Marii', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).fillColor('#1a1a2e').text(title, { align: 'center' });
    doc.moveDown(1.5);

    const section = (heading: string, body: string | string[]) => {
      doc.fontSize(14).fillColor('#2d2a71').text(heading);
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor('#333');
      if (Array.isArray(body)) {
        body.forEach((line) => doc.text(`• ${line}`, { indent: 10 }));
      } else {
        doc.text(body, { align: 'justify' });
      }
      doc.moveDown();
    };

    doc.fontSize(11).text(report.greeting);
    doc.moveDown();
    section('Thème principal', report.mainTheme);
    section('Ce que j\'observe', report.observations);
    section('Tes forces', report.strengths);
    section('Points de vigilance', report.vigilancePoints);
    section('Questions à explorer', report.reflectionQuestions);
    section('Prochaines étapes', report.recommendations);

    const { resources } = report;
    section('Ressources — Livres', resources.books.length ? resources.books : ['—']);
    section('Ressources — Podcasts', resources.podcasts.length ? resources.podcasts : ['—']);
    section('Ressources — Exercices', resources.exercises.length ? resources.exercises : ['—']);

    if (report.mentorSuggestion) {
      section('Mentorat', report.mentorSuggestion);
    }
    section('Message final', report.closingMessage);

    doc.end();
  });
}
