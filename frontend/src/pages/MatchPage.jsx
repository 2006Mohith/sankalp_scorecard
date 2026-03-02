import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const MatchPage = () => {
    const { matchId } = useParams();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/match/${matchId}`);
                setMatch(data);
            } catch (error) {
                console.error('Error fetching match:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatch();

        const socket = io(SOCKET_URL);

        socket.on('matchUpdated', (updatedMatch) => {
            if (updatedMatch._id === matchId) {
                setMatch(prev => ({ ...prev, ...updatedMatch }));
            }
        });

        socket.on('cricketStateUpdated', (newState) => {
            if (newState.match_id === matchId) {
                setMatch(prev => ({ ...prev, cricketState: newState }));
            }
        });

        return () => socket.disconnect();
    }, [matchId]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    if (!match) {
        return <div className="text-center py-12 text-gray-500 font-medium">Match not found. <Link to="/" className="text-primary-600 ml-2">Go Home</Link></div>;
    }

    const { participant1_id: t1, participant2_id: t2, sport_id: sport } = match;

    if (sport.name === 'Cricket') {
        return <CricketScorecard match={match} matchId={matchId} />;
    }

    // Standard Layout for other sports
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link to={`/sport/${sport._id}`} className="inline-flex items-center text-gray-500 hover:text-primary-600 transition font-medium">
                <ArrowLeft size={20} className="mr-1" /> Back to {sport.name}
            </Link>

            <div className="card p-8 text-center mt-6">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
                    {sport.name} - {match.status}
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                    <div className="flex-1 flex flex-col items-center">
                        <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-4xl font-extrabold mb-4">
                            {t1?.name?.charAt(0) || '?'}
                        </div>
                        <h2 className="text-2xl font-bold">{t1?.name || 'TBA'}</h2>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-5xl font-black mb-2">
                            {match.score1} <span className="text-gray-300">-</span> {match.score2}
                        </div>
                        <div className="text-gray-500 font-medium px-4 border border-gray-200 rounded-full bg-gray-50">vs</div>
                    </div>

                    <div className="flex-1 flex flex-col items-center">
                        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl font-extrabold mb-4">
                            {t2?.name?.charAt(0) || '?'}
                        </div>
                        <h2 className="text-2xl font-bold">{t2?.name || 'TBA'}</h2>
                    </div>
                </div>

                {match.status === 'Completed' && match.winner && (
                    <div className="mt-8 mb-4 bg-green-50 shadow text-green-700 py-4 px-6 rounded-2xl font-black text-lg text-center border-2 border-green-200 uppercase tracking-widest relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 text-6xl">🏆</div>
                        <span className="relative z-10 text-2xl">🏆 {match.winner.name}</span>
                        <div className="relative z-10 text-sm font-semibold opacity-80 mt-1">won the match</div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Extracted Component for Cricket Live Match Card
const CricketScorecard = ({ match, matchId }) => {
    const state = match.cricketState;
    const [balls, setBalls] = useState([]);

    useEffect(() => {
        const fetchBalls = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/cricket/${matchId}/balls`);
                setBalls(data);
            } catch (err) { }
        };
        fetchBalls();

        const socket = io(SOCKET_URL);
        socket.on(`cricketBall-${matchId}`, newBall => {
            setBalls(prev => [...prev, newBall]);
        });
        socket.on(`cricketUndo-${matchId}`, badBallId => {
            setBalls(prev => prev.filter(b => b._id !== badBallId));
        });

        return () => socket.disconnect();
    }, [matchId]);

    // Derived Statistics from Ball Timeline
    const batStats = {};
    const bowlStats = {};
    // Calculate individual stats for current innings
    const currentInn = state?.currentInnings || 1;

    // Only analyze balls from the current innings
    const innBalls = balls.filter(b => b.innings === currentInn);

    innBalls.forEach(b => {
        // Batsman logic
        if (!batStats[b.strikerName]) {
            batStats[b.strikerName] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissedBy: null };
        }
        batStats[b.strikerName].runs += b.runsOffBat;
        if (b.isLegalDelivery || b.extrasType === 'NoBall' || b.extrasType === 'Bye' || b.extrasType === 'LegBye') {
            if (b.extrasType !== 'Wide') batStats[b.strikerName].balls += 1; // Wides don't count towards balls faced
        }

        if (b.runsOffBat === 4) batStats[b.strikerName].fours += 1;
        if (b.runsOffBat === 6) batStats[b.strikerName].sixes += 1;

        if (b.isWicket && b.batsmanDismissed) {
            if (!batStats[b.batsmanDismissed]) batStats[b.batsmanDismissed] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: true, dismissedBy: b.wicketType };
            else batStats[b.batsmanDismissed].isOut = true;
            batStats[b.batsmanDismissed].dismissedBy = b.wicketType === 'Bowled' || b.wicketType === 'LBW' ? `b ${b.bowlerName}` : `c ${b.fielderName || '?'} b ${b.bowlerName}`;
        }

        // Bowler logic
        if (!bowlStats[b.bowlerName]) {
            bowlStats[b.bowlerName] = { balls: 0, runs: 0, wickets: 0, maidenRunsThisOver: 0, maidens: 0 };
        }

        // Count legal balls for the bowler
        if (b.isLegalDelivery || b.extrasType === 'Bye' || b.extrasType === 'LegBye') {
            bowlStats[b.bowlerName].balls += 1;
        }

        // Wickets for the bowler
        if (b.isWicket && !['RunOut'].includes(b.wicketType)) {
            bowlStats[b.bowlerName].wickets += 1;
        }

        // Runs against bowler (including Wides and NoBalls, but not byes/legbyes)
        if (!['Bye', 'LegBye'].includes(b.extrasType)) {
            bowlStats[b.bowlerName].runs += b.totalRunsForBall;
        }

        // Complex: calculating maidens would require tracking complete overs. We simplify by showing overall balls
    });

    const { participant1_id: t1, participant2_id: t2, sport_id: sport } = match;

    const isTeam1Batting = (state?.tossDecision === 'Bat' && state?.tossWinner === t1?.name) || (state?.tossDecision === 'Bowl' && state?.tossWinner === t2?.name) ? (currentInn === 1) : (currentInn === 2);
    // Note: robust implementation requires tracking proper toss winner team ID bindings to team 1/2.
    // For simplicity we show "Batting Team" and "Bowling Team".

    if (!state) return (
        <div>
            <Link to={`/sport/${sport._id}`} className="mb-4 inline-flex items-center text-primary-600"><ArrowLeft size={16} className="mr-1" /> Back</Link>
            <h2 className="text-2xl font-bold text-center mt-10">Waiting for toss...</h2>
        </div>
    );

    const activeStats = currentInn === 1 ? state.team1BattingParams : state.team2BattingParams;

    // Last 6 balls text
    const recent6 = innBalls.slice(-6).map(b => (b.isWicket ? 'W' : (b.extrasType !== 'None' ? b.extrasType[0] : b.totalRunsForBall)));

    return (
        <div className="space-y-6 max-w-4xl mx-auto font-sans tracking-tight">
            <Link to={`/sport/${sport._id}`} className="inline-flex items-center text-gray-500 hover:text-primary-600 transition font-medium">
                <ArrowLeft size={20} className="mr-1" /> Back
            </Link>

            {/* Scorecard Hero */}
            <div className={`rounded-xl p-6 text-white shadow-2xl relative overflow-hidden ${match.status === 'Completed' ? 'bg-gradient-to-r from-green-800 to-emerald-900' : 'bg-gradient-to-r from-blue-900 to-indigo-900'}`}>
                <div className="absolute top-0 right-0 opacity-10 text-9xl">🏏</div>
                <div className="text-xs font-bold text-blue-200 uppercase mb-4 tracking-widest">{match.status} • {sport.name} {match.status === 'Completed' && '• FINAL'}</div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="text-lg font-semibold">{t1?.name} vs {t2?.name}</div>
                        </div>
                        <div className="text-5xl font-black tabular-nums tracking-tighter">
                            {activeStats.runs}<span className="text-blue-300 mx-1">/</span>{activeStats.wickets}
                            <span className="text-2xl ml-3 text-blue-200">({activeStats.overs})</span>
                        </div>
                        {state.target && <div className="mt-2 text-sm font-semibold text-yellow-300">Target: {state.target}</div>}
                    </div>

                    <div className="mt-6 md:mt-0 text-right">
                        <div className="text-sm text-blue-200 uppercase font-semibold">Current Run Rate</div>
                        <div className="text-2xl font-bold">{(activeStats.runs / Math.max(1, (activeStats.ballsFaced / 6))).toFixed(2)}</div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-blue-200 whitespace-nowrap">RECENT:</span>
                        <div className="flex space-x-1.5 overflow-x-auto pb-1 md:pb-0">
                            {recent6.map((s, i) => (
                                <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow ${s === 'W' ? 'bg-red-500 text-white' : (['Wd', 'N'].includes(s) ? 'bg-yellow-500 text-white' : (s == '4' || s == '6' ? 'bg-green-500 text-white' : 'bg-white/20'))}`}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    {match.status === 'Completed' && match.winner && (
                        <div className="bg-white/20 px-4 py-2 rounded flex items-center shadow-sm">
                            <div className="font-bold tracking-tight">🏆 {match.winner.name} won</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Batting Card */}
                <div className="card shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-dark-800 px-4 py-3 border-b border-gray-200 dark:border-dark-700 font-bold uppercase text-sm tracking-wider">
                        Batters
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-900 border-b">
                                <tr>
                                    <th className="px-4 py-2">Batsman</th>
                                    <th className="px-2 py-2 text-right">R</th>
                                    <th className="px-2 py-2 text-right">B</th>
                                    <th className="px-2 py-2 text-right text-gray-400">4s</th>
                                    <th className="px-2 py-2 text-right text-gray-400">6s</th>
                                    <th className="px-4 py-2 text-right">SR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                                {Object.entries(batStats).reverse().map(([name, s]) => (
                                    <tr key={name} className="hover:bg-gray-50 dark:hover:bg-dark-800/50 group">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {name}
                                                {!s.isOut && name === state?.currentStriker && <span className="text-primary-600 ml-1 text-xs font-black">*</span>}
                                            </div>
                                            <div className="text-xs font-medium text-gray-400">
                                                {s.isOut ? s.dismissedBy : 'not out'}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-right font-bold text-gray-900 dark:text-white">{s.runs}</td>
                                        <td className="px-2 py-3 text-right text-gray-500">{s.balls}</td>
                                        <td className="px-2 py-3 text-right text-gray-400">{s.fours}</td>
                                        <td className="px-2 py-3 text-right text-gray-400">{s.sixes}</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-500">
                                            {s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : '0.0'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bowling Card */}
                <div className="card shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-dark-800 px-4 py-3 border-b border-gray-200 dark:border-dark-700 font-bold uppercase text-sm tracking-wider">
                        Bowlers
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-900 border-b">
                                <tr>
                                    <th className="px-4 py-2">Bowler</th>
                                    <th className="px-2 py-2 text-right">O</th>
                                    <th className="px-2 py-2 text-right text-gray-400">M</th>
                                    <th className="px-2 py-2 text-right">R</th>
                                    <th className="px-2 py-2 text-right font-bold text-gray-700 dark:text-gray-300">W</th>
                                    <th className="px-4 py-2 text-right">ECON</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                                {Object.entries(bowlStats).map(([name, s]) => {
                                    const oversFull = Math.floor(s.balls / 6);
                                    const ballsRem = s.balls % 6;
                                    const oversStr = `${oversFull}.${ballsRem}`;
                                    const oversMath = s.balls / 6;

                                    return (
                                        <tr key={name} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                                            <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                                {name}
                                                {name === state?.currentBowler && <span className="text-primary-600 font-black ml-1 text-xs">*</span>}
                                            </td>
                                            <td className="px-2 py-3 text-right text-gray-500">{oversStr}</td>
                                            <td className="px-2 py-3 text-right text-gray-400">0</td>
                                            <td className="px-2 py-3 text-right font-medium">{s.runs}</td>
                                            <td className="px-2 py-3 text-right font-bold text-red-500">{s.wickets}</td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-500">
                                                {oversMath > 0 ? (s.runs / oversMath).toFixed(1) : '0.0'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchPage;
