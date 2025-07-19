'use client';

import { useParams } from 'next/navigation';
import { FaBed, FaBath, FaCar, FaTree } from 'react-icons/fa';
import Link from 'next/link';
import { HiArrowLeft, HiShare } from 'react-icons/hi';

export default function PropertyDetailPage() {
  const { id } = useParams();

  // Données simulées basées sur l'ID (à personnaliser avec des données réelles)
  const property = {
    id: parseInt(id),
    images: [
      `/maison${id}.jpg`,
      `/maison${id}-1.jpg`,
      `/maison${id}-2.jpg`,
    ].map(img => img || `https://via.placeholder.com/600x400?text=Image+${id}-${Math.floor(Math.random() * 3) + 1}`),
    surface: 80 + parseInt(id) * 20,
    price: 200000 + parseInt(id) * 10000,
    date: new Date().toLocaleDateString('fr-FR'),
    description: `Découvrez ce superbe bien immobilier n°${id} situé dans un quartier prisé. Cette propriété offre une surface habitable de ${80 + parseInt(id) * 20} m², idéale pour une famille ou un investissement. Lumineuse et moderne, elle dispose d’un design contemporain avec des finitions haut de gamme. Profitez d’un emplacement calme avec accès facile aux commodités locales.`,
    address: `${['Paris', 'Lyon', 'Marseille'][parseInt(id) - 1]} Centre, 7500${parseInt(id)}`,
    rooms: 3 + parseInt(id),
    bathrooms: 1 + parseInt(id) % 2,
    parking: true,
    garden: parseInt(id) % 2 === 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-start space-y-6">
        {/* Gallery */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <div className="relative w-full h-[600px]">
            <img
              src={property.images[0]}
              alt="photo principale"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          {/* <div className="grid grid-cols-2 gap-2 mt-2">
            {property.images.slice(1).map((img, i) => (
              <img key={i} src={img} alt="miniature" className="h-32 object-cover rounded" />
            ))}
          </div> */}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            {property.surface} m² - {property.price.toLocaleString()} €
          </h1>
          <p className="text-gray-600 mb-4 text-sm">{property.address} - Publié le {property.date}</p>

          <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm mb-6">
            <div className="flex items-center gap-2"><FaBed className="text-[#6AD1E3]" /> {property.rooms} chambres</div>
            <div className="flex items-center gap-2"><FaBath className="text-[#6AD1E3]" /> {property.bathrooms} salles de bain</div>
            <div className="flex items-center gap-2"><FaCar className="text-[#6AD1E3]" /> Parking : {property.parking ? 'Oui' : 'Non'}</div>
            <div className="flex items-center gap-2"><FaTree className="text-[#6AD1E3]" /> Jardin : {property.garden ? 'Oui' : 'Non'}</div>
          </div>

          <p className="text-gray-800 leading-relaxed text-[15px]">{property.description}</p>

          <div className="flex gap-4 mt-12">
            <button className="bg-[#6AD1E3] hover:bg-[#56bdd3] text-white px-5 py-2 rounded-lg font-medium transition transform hover:scale-105 shadow-md">
              Contacter l'agent
            </button>
            <button className="border border-[#6AD1E3] text-[#6AD1E3] px-5 py-2 rounded-lg font-medium hover:bg-[#e0f7fb] transition transform hover:scale-105">
              Proposer de collaborer
            </button>
          </div>
        </div>

        {/* Navigation en haut */}
        <div className="absolute top-20 left-4 right-4 z-10 flex justify-between">
          <Link href="/#ventes" className="flex items-center gap-1 text-gray-800 text-sm hover:underline hover:text-black transition">
            <HiArrowLeft className="text-xl" />
            Retour aux ventes
          </Link>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(window.location.href);
              alert('Lien copié dans le presse-papiers !');
            }}
            className="flex items-center gap-1 text-gray-800 text-sm hover:underline hover:text-black transition"
          >
            Partager la fiche
            <HiShare className="text-xl" />
          </a>
        </div>
      </div>
    </div>
  );
}