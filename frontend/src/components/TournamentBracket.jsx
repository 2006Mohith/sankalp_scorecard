import React from 'react';

const TournamentBracket = ({ matches }) => {
    // Filter matches that are part of the bracket (have a valid round_index)
    const bracketMatches = matches.filter(m => m.round_index !== undefined && m.round_index !== null);

    // Group matches by round_index
    const rounds = {};
    bracketMatches.forEach(m => {
        if (!rounds[m.round_index]) rounds[m.round_index] = [];
        rounds[m.round_index].push(m);
    });

    // Sort matches within each round by match_index
    Object.keys(rounds).forEach(roundIdx => {
        rounds[roundIdx].sort((a, b) => a.match_index - b.match_index);
    });

    const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));

    if (roundKeys.length === 0) {
        return (
            <div className="flex justify-center items-center py-12 text-gray-500 font-medium bg-dark-800/20 rounded-xl border border-white/5">
                No active knockout bracket available for this sport. Generate one in the Admin Dashboard!
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto py-10 px-4 scrollbar-hidden">
            <div className="flex" style={{ minWidth: `${roundKeys.length * 300}px` }}>
                {roundKeys.map((roundIdx, idx) => {
                    const isLastRound = idx === roundKeys.length - 1;

                    return (
                        <div key={roundIdx} className="flex-1 min-w-[280px] px-4 flex flex-col justify-around relative">
                            {/* Round Title */}
                            <div className="text-center font-black uppercase text-primary-500 tracking-widest text-sm mb-6 absolute top-0 w-full left-0">
                                {rounds[roundIdx][0]?.stage || `Round ${Number(roundIdx) + 1}`}
                            </div>

                            {/* Matches */}
                            <div className="flex flex-col flex-1 justify-around mt-12">
                                {rounds[roundIdx].map(match => (
                                    <div key={match._id} className="relative mb-6">

                                        {/* Connector Lines to next round */}
                                        {!isLastRound && (
                                            <>
                                                <div className="absolute top-1/2 right-0 translate-x-full w-4 border-t-2 border-primary-500/50 -mt-px z-0"></div>
                                                {match.match_index % 2 === 0 ? (
                                                    <div className="absolute top-1/2 right-[-1rem] h-[50%] border-r-2 border-primary-500/50 z-0"></div>
                                                ) : (
                                                    <div className="absolute bottom-1/2 right-[-1rem] h-[50%] border-r-2 border-primary-500/50 z-0 border-b-0"></div>
                                                )}
                                                {/* Line entering the next match node */}
                                                {(match.match_index % 2 === 0) && (
                                                    <div className="absolute bottom-[-10px] right-[-1rem] md:h-[120%] h-full flex flex-col justify-end pb-[10px]">
                                                        {/* <div className="border-t-2 border-primary-500/50 w-4 translate-x-full"></div> */}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Match Box */}
                                        <div className={`relative z-10 glass-panel p-0 border ${match.status === 'Live' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10'} rounded-lg overflow-hidden`}>

                                            {(!match.participant1_id && !match.participant2_id && Number(roundIdx) > 0) ? (
                                                <div className="flex flex-col items-center justify-center p-6 bg-dark-800/20 opacity-50">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Waiting for<br />Previous Results</span>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Top Team */}
                                                    <div className="flex justify-between items-center p-3 border-b border-white/5 bg-dark-800/40">
                                                        <span className={`font-bold text-sm truncate pr-2 ${match.winner && match.winner === match.participant1_id?._id ? 'text-primary-400' : 'text-gray-300'}`}>
                                                            {match.participant1_id?.name || 'TBA'}
                                                        </span>
                                                        <span className="font-bold text-lg text-white">
                                                            {match.score1 > 0 || match.score2 > 0 || match.status === 'Completed' ? match.score1 : '-'}
                                                        </span>
                                                    </div>

                                                    {/* Bottom Team */}
                                                    <div className="flex justify-between items-center p-3 bg-dark-900/60">
                                                        <span className={`font-bold text-sm truncate pr-2 ${match.winner && match.winner === match.participant2_id?._id ? 'text-primary-400' : 'text-gray-300'}`}>
                                                            {match.participant2_id?.name || 'TBA'}
                                                        </span>
                                                        <span className="font-bold text-lg text-white">
                                                            {match.score1 > 0 || match.score2 > 0 || match.status === 'Completed' ? match.score2 : '-'}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Champion Plaque */}
                {roundKeys.length > 0 && rounds[roundKeys[roundKeys.length - 1]][0]?.status === 'Completed' && (
                    <div className="flex-1 min-w-[200px] px-4 flex flex-col justify-center relative pl-8">
                        <div className="absolute top-1/2 left-0 -translate-x-full w-8 border-t-2 border-primary-500/50 -mt-px z-0"></div>
                        <div className="glass-panel text-center border-primary-500 shadow-[0_0_30px_rgba(250,204,21,0.3)] bg-primary-500/10">
                            <div className="text-xs uppercase tracking-widest text-primary-400 font-bold mb-2">Champion</div>
                            <div className="text-xl font-black text-white px-2">
                                {rounds[roundKeys[roundKeys.length - 1]][0].winner?.name || 'Winner'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TournamentBracket;
