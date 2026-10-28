import Image from 'next/image';
import Link from 'next/link';
import { Character } from '@/types/rickandmorty';

interface CharacterCardProps {
  character: Character;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const statusColor = {
    Alive: 'bg-green-500',
    Dead: 'bg-red-500',
    unknown: 'bg-gray-500',
  };

  return (
    <Link href={`/character/${character.id}`} className="block group">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl border border-gray-700">
        <div className="relative h-64 w-full">
          <Image
            src={character.image}
            alt={character.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
            {character.name}
          </h2>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`h-3 w-3 rounded-full ${statusColor[character.status] || 'bg-gray-500'}`} />
            <span className="text-gray-300 font-medium">
              {character.status} - {character.species}
            </span>
          </div>
          <div className="text-gray-400 text-sm mt-2">
            <span className="block text-gray-500">Last known location:</span>
            <span className="text-gray-300 hover:text-orange-300 transition-colors">
              {character.location.name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
