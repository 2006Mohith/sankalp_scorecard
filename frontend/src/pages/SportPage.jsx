import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ArrowLeft, CircleDot, CheckCircle2, CalendarDays, GitMerge } from 'lucide-react';
import TournamentBracket from '../components/TournamentBracket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SportPage = () => {
    const { sportId } = useParams();
    const [matches, setMatches] = useState([]);
    const [sport, setSport] = useState(null);
    const [filter, setFilter] = useState('All');
    const [viewMode, setViewMode] = useState('matches'); // matches | bracket
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesRes, sportsRes] = await Promise.all([
                    axios.get(`${API_URL}/matches/${sportId}`),
                    axios.get(`${API_URL}/sports`)
                ]);
                setMatches(matchesRes.data);
                setSport(sportsRes.data.find(s => s._id === sportId));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const socket = io(SOCKET_URL);
        socket.on('matchUpdated', (updatedMatch) => {
            if (updatedMatch.sport_id?._id === sportId || updatedMatch.sport_id === sportId) {
                setMatches(prev => prev.map(m => m._id === updatedMatch._id ? updatedMatch : m));
            }
        });
        socket.on('matchCreated', (newMatch) => {
            if (newMatch.sport_id?._id === sportId || newMatch.sport_id === sportId) {
                setMatches(prev => [newMatch, ...prev]);
            }
        });
        socket.on('cricketStateUpdated', (newState) => {
            setMatches(prev => prev.map(m => m._id === newState.match_id ? { ...m, cricketState: newState } : m));
        });

        return () => socket.disconnect();
    }, [sportId]);

    const filteredMatches = matches.filter(m => filter === 'All' || m.status === filter);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 transition font-medium">
                <ArrowLeft size={20} className="mr-1" /> Back to Sports
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-gray-200 dark:border-dark-700">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {sport?.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                        Category: <span className="text-primary-600 dark:text-primary-400">{sport?.category}</span>
                    </p>
                </div>

                <div className="flex space-x-2 mt-4 md:mt-0">
                    <div className="flex bg-dark-800 p-1 rounded-lg border border-dark-700 shadow-sm mr-4">
                        <button
                            onClick={() => setViewMode('matches')}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${viewMode === 'matches' ? 'bg-primary-500 text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Matches List
                        </button>
                        <button
                            onClick={() => setViewMode('bracket')}
                            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-semibold transition ${viewMode === 'bracket' ? 'bg-primary-500 text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            <GitMerge size={16} className="mr-2" /> Tournament Bracket
                        </button>
                    </div>

                    {viewMode === 'matches' && (
                        <div className="flex space-x-2 bg-dark-800 p-1 rounded-lg border border-dark-700 shadow-sm">
                            {['All', 'Live', 'Upcoming', 'Completed'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${filter === f
                                        ? 'bg-primary-500/20 text-primary-400'
                                        : 'text-gray-400 hover:bg-dark-700'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'bracket' ? (
                <div className="bg-dark-900/40 border border-white/5 rounded-2xl">
                    <TournamentBracket matches={matches} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 font-medium">
                            No matches found for this filter.
                        </div>
                    ) : (
                        filteredMatches.map(match => (
                            <Link to={`/match/${match._id}`} key={match._id} className="card relative overflow-visible hover:-translate-y-1 transition duration-200 cursor-pointer block">
                                {match.status === 'Live' && (
                                    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center animate-pulse">
                                        <CircleDot size={12} className="mr-1 animate-ping" /> LIVE
                                    </div>
                                )}
                                {match.status === 'Upcoming' && (
                                    <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                                        <CalendarDays size={12} className="mr-1" /> Upcoming
                                    </div>
                                )}
                                {match.status === 'Completed' && (
                                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                                        <CheckCircle2 size={12} className="mr-1" /> Completed
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className={`text-center flex-1 ${match.winner && match.winner._id === match.participant1_id?._id ? 'text-green-600 dark:text-green-400 flex flex-col items-center' : ''}`}>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate w-full" title={match.participant1_id?.name}>
                                                {match.participant1_id?.name || 'TBA'}
                                                {match.cricketState?.currentInnings === 1 && <span className="text-xs ml-2 bg-yellow-100 text-yellow-800 px-1 rounded">BT</span>}
                                            </h3>
                                        </div>

                                        <div className="px-4 text-center min-w-[100px]">
                                            {sport?.name === 'Cricket' && match.cricketState ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="text-xl font-black text-gray-800 dark:text-white">
                                                        {match.cricketState.currentInnings === 1
                                                            ? `${match.cricketState.team1BattingParams.runs}/${match.cricketState.team1BattingParams.wickets}`
                                                            : `${match.cricketState.team2BattingParams.runs}/${match.cricketState.team2BattingParams.wickets}`
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase">
                                                        {match.cricketState.currentInnings === 1
                                                            ? `${match.cricketState.team1BattingParams.overs} Ov`
                                                            : `${match.cricketState.team2BattingParams.overs} Ov`
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="text-3xl font-black tracking-tight text-gray-800 dark:text-white">
                                                        {match.score1} <span className="text-gray-400 text-xl font-normal mx-1">-</span> {match.score2}
                                                    </div>
                                                    {match.status === 'Completed' && match.winner && (
                                                        <div className="mt-2 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                                                            Winner: {match.winner.name}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className={`text-center flex-1 ${match.winner && match.winner._id === match.participant2_id?._id ? 'text-green-600 dark:text-green-400 flex flex-col items-center' : ''}`}>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate w-full" title={match.participant2_id?.name}>
                                                {match.participant2_id?.name || 'TBA'}
                                                {match.cricketState?.currentInnings === 2 && <span className="text-xs ml-2 bg-yellow-100 text-yellow-800 px-1 rounded">BT</span>}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="text-center text-xs text-gray-500 dark:text-gray-500 font-medium">
                                        Match ID: {match._id.slice(-6).toUpperCase()} • {new Date(match.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SportPage;
