import { getCharacter, getEpisodes } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = await getCharacter(id);
  
  const episodeIds = character.episode.map((url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  });
  
  const episodes = await getEpisodes(episodeIds);

  const formattedDate = new Date(character.created).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-block mb-6 text-orange-500 hover:text-orange-400 font-semibold transition-colors">
        &larr; Back to Characters
      </Link>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-700 max-w-5xl mx-auto animate-fadeIn">
        <div className="md:flex">
          <div className="md:w-1/2 relative h-96 md:h-auto min-h-[400px]">
             <Image
              src={character.image}
              alt={character.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{character.name}</h1>
            
            <div className="space-y-6 text-gray-300">
              <div className="flex items-center text-xl">
                <span className={`h-4 w-4 rounded-full mr-3 ${
                  character.status === 'Alive' ? 'bg-green-500' : 
                  character.status === 'Dead' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <span className="font-medium">{character.status} - {character.species}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-gray-500 text-sm uppercase tracking-wide font-semibold mb-1">Gender</span>
                  <span className="font-medium text-lg">{character.gender}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm uppercase tracking-wide font-semibold mb-1">Type</span>
                  <span className="font-medium text-lg">{character.type || 'Unknown'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm uppercase tracking-wide font-semibold mb-1">Origin</span>
                  <span className="font-medium text-lg hover:text-orange-400 transition-colors">{character.origin.name}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm uppercase tracking-wide font-semibold mb-1">Location</span>
                  <span className="font-medium text-lg hover:text-orange-400 transition-colors">{character.location.name}</span>
                </div>
                 <div>
                  <span className="block text-gray-500 text-sm uppercase tracking-wide font-semibold mb-1">Created</span>
                  <span className="font-medium text-lg">{formattedDate}</span>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Episodes ({episodes.length})</h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {episodes.map((ep) => (
                    <span key={ep.id} className="px-3 py-1 bg-gray-700 rounded-full text-sm hover:bg-orange-500 hover:text-white transition-all cursor-default" title={`${ep.name} - ${ep.air_date}`}>
                      {ep.episode}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
