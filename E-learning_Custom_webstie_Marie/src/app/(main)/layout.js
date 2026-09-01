import { Geist, Geist_Mono } from "next/font/google";
import "./../globals.css";
import Header from "@/Components/Common/Header";
import Footer from "@/Components/Common/Footer";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "La Propulserie",
    description: "La Propulserie — accompagnement et capsules pour propulser ton parcours.",
};

// ce n'est pas la mise en page racine, c'est la mise en page principale

export default function Layout({ children }) {
    return (
        <div className="relative background-userFull_landingPage">
            <Header />
            {children}
            <Footer />
        </div>
    );
}
