import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Undo2, Lock } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CricketScorer = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const { success, error, warning, info } = useAlert();
    const [state, setState] = useState(null);
    const [recentBalls, setRecentBalls] = useState([]);
    const [allBalls, setAllBalls] = useState([]);

    // Setup form
    const [tossWinner, setTossWinner] = useState('');
    const [tossDecision, setTossDecision] = useState('Bat');

    // New Ball Form
    const [striker, setStriker] = useState('');
    const [nonStriker, setNonStriker] = useState('');
    const [bowler, setBowler] = useState('');
    const [runs, setRuns] = useState(0);
    const [extrasType, setExtrasType] = useState('None');
    const [extrasRuns, setExtrasRuns] = useState(0);
    const [isWicket, setIsWicket] = useState(false);
    const [wicketType, setWicketType] = useState('None');
    const [batsmanDismissed, setBatsmanDismissed] = useState('');

    useEffect(() => {
        fetchState();
    }, [matchId]);

    const fetchState = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/cricket/${matchId}/state`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const allBallsRes = await axios.get(`${API_URL}/cricket/${matchId}/balls`);
            setState(data.state);
            setRecentBalls(data.recentBalls);
            setAllBalls(allBallsRes.data);
        } catch (error) {
            console.error('Error fetching cricket state:', error);
        }
    };

    const handleInit = async () => {
        try {
            const { data } = await axios.post(`${API_URL}/cricket/${matchId}/init`, {
                tossWinner, tossDecision
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
            setState(data);
            success('Match started successfully!');
        } catch (err) {
            error('Failed to init match');
        }
    };

    const submitBall = async () => {
        if (!striker || !nonStriker || !bowler) return warning('Enter players correctly');
        try {
            const currentStats = state.currentInnings === 1 ? state.team1BattingParams : state.team2BattingParams;
            const isLegal = extrasType === 'None' || extrasType === 'Bye' || extrasType === 'LegBye';
            const ballsFaced = currentStats.ballsFaced;
            const newBallsFaced = isLegal ? ballsFaced + 1 : ballsFaced;

            await axios.post(`${API_URL}/cricket/${matchId}/ball`, {
                strikerName: striker,
                nonStrikerName: nonStriker,
                bowlerName: bowler,
                runsOffBat: runs,
                extrasType,
                extrasRuns,
                isWicket,
                wicketType,
                batsmanDismissed: isWicket ? (batsmanDismissed || striker) : null,
                innings: state.currentInnings,
                overNumber: Math.floor(ballsFaced / 6),
                ballNumberInOver: ballsFaced % 6 + 1
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

            // Strike rotation logic
            let nextStriker = striker;
            let nextNonStriker = nonStriker;
            const runsForSwitch = (extrasType === 'Bye' || extrasType === 'LegBye') ? extrasRuns : runs;

            if (runsForSwitch % 2 !== 0) {
                nextStriker = nonStriker;
                nextNonStriker = striker;
            }

            let overEnded = false;
            if (isLegal && newBallsFaced > 0 && newBallsFaced % 6 === 0) {
                overEnded = true;
                const temp = nextStriker;
                nextStriker = nextNonStriker;
                nextNonStriker = temp;
            }

            if (isWicket) {
                const outPlayer = batsmanDismissed || striker;
                if (outPlayer === nextStriker) nextStriker = '';
                else nextNonStriker = '';
            }

            setStriker(nextStriker);
            setNonStriker(nextNonStriker);

            if (overEnded) {
                setBowler('');
                info('End of over! Please select a new bowler.');
            }

            // Reset common inputs
            setRuns(0);
            setExtrasType('None');
            setExtrasRuns(0);
            setIsWicket(false);
            setWicketType('None');
            setBatsmanDismissed('');

            fetchState();
            success('Delivery recorded');
        } catch (err) {
            error(err.response?.data?.error || 'Error submitting ball');
        }
    };

    const undoLast = async () => {
        if (!window.confirm('Undo last ball?')) return;
        try {
            await axios.post(`${API_URL}/cricket/${matchId}/undo`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            fetchState();
            success('Last ball undone');
        } catch (err) {
            error(err.response?.data?.error || 'Undo failed');
        }
    };

    const lockMatch = async () => {
        if (!window.confirm('Are you sure you want to end/lock this match? The winning team will be declared automatically!')) return;
        try {
            await axios.post(`${API_URL}/cricket/${matchId}/lock`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            fetchState();
            success('Match concluded successfully');
        } catch (err) {
            error('Failed to lock');
        }
    };

    if (!state) return <div className="p-6">Loading Scorer...</div>;

    const currentStats = state.currentInnings === 1 ? state.team1BattingParams : state.team2BattingParams;

    // Derived Statistics from Ball Timeline
    const batStats = {};
    const bowlStats = {};
    const innBalls = allBalls.filter(b => b.innings === state.currentInnings);

    innBalls.forEach(b => {
        if (!batStats[b.strikerName]) batStats[b.strikerName] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissedBy: null };
        batStats[b.strikerName].runs += b.runsOffBat;
        if (b.isLegalDelivery || b.extrasType === 'NoBall' || b.extrasType === 'Bye' || b.extrasType === 'LegBye') {
            if (b.extrasType !== 'Wide') batStats[b.strikerName].balls += 1;
        }
        if (b.runsOffBat === 4) batStats[b.strikerName].fours += 1;
        if (b.runsOffBat === 6) batStats[b.strikerName].sixes += 1;
        if (b.isWicket && b.batsmanDismissed) {
            if (!batStats[b.batsmanDismissed]) batStats[b.batsmanDismissed] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: true, dismissedBy: b.wicketType };
            else batStats[b.batsmanDismissed].isOut = true;
            batStats[b.batsmanDismissed].dismissedBy = b.wicketType === 'Bowled' || b.wicketType === 'LBW' ? `b ${b.bowlerName}` : `c ${b.fielderName || '?'} b ${b.bowlerName}`;
        }

        if (!bowlStats[b.bowlerName]) bowlStats[b.bowlerName] = { balls: 0, runs: 0, wickets: 0 };
        if (b.isLegalDelivery || b.extrasType === 'Bye' || b.extrasType === 'LegBye') bowlStats[b.bowlerName].balls += 1;
        if (b.isWicket && !['RunOut'].includes(b.wicketType)) bowlStats[b.bowlerName].wickets += 1;
        if (!['Bye', 'LegBye'].includes(b.extrasType)) bowlStats[b.bowlerName].runs += b.totalRunsForBall;
    });

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/admin/dashboard')} className="btn-primary flex items-center mb-4 bg-gray-500 hover:bg-gray-600">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>

            <div className="card p-4 sm:p-6 border-t-4 border-t-primary-500 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Cricket Live Scorer</h2>
                    <p className="text-gray-500 font-medium mt-1">
                        Innings {state.currentInnings} | Score: <span className="text-xl font-bold text-gray-900 dark:text-white">{currentStats.runs}/{currentStats.wickets}</span> ({currentStats.overs} Ov)
                    </p>
                </div>
                {state.isLocked ? (
                    <span className="w-full sm:w-auto justify-center bg-red-100 text-red-700 px-4 py-2 flex items-center font-bold rounded-lg border border-red-200">
                        <Lock size={16} className="mr-2" /> Match Locked
                    </span>
                ) : (
                    <button onClick={lockMatch} className="w-full sm:w-auto justify-center bg-red-500 text-white px-4 py-2 flex items-center font-medium rounded-lg hover:bg-red-600">
                        End Match
                    </button>
                )}
            </div>

            {!state.tossWinner && !state.isLocked && (
                <div className="card p-6 bg-blue-50 dark:bg-dark-800">
                    <h3 className="font-bold text-lg mb-4">Initial Setup</h3>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <input className="input-field flex-1" placeholder="Toss Winner Team ID or Name" value={tossWinner} onChange={e => setTossWinner(e.target.value)} />
                        <select className="input-field" value={tossDecision} onChange={e => setTossDecision(e.target.value)}>
                            <option>Bat</option>
                            <option>Bowl</option>
                        </select>
                        <button className="btn-primary whitespace-nowrap" onClick={handleInit}>Start Match</button>
                    </div>
                </div>
            )}

            {!state.isLocked && state.tossWinner && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Control Panel */}
                    <div className="card p-6 space-y-4">
                        <h3 className="text-xl font-bold text-primary-600">Current Action</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Striker</label>
                                <input className="input-field w-full" value={striker} onChange={e => setStriker(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Non-Striker</label>
                                <input className="input-field w-full" value={nonStriker} onChange={e => setNonStriker(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Bowler</label>
                            <input className="input-field w-full" value={bowler} onChange={e => setBowler(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t dark:border-dark-700">
                            <div>
                                <label className="block text-sm font-medium mb-1">Runs (Bat)</label>
                                <div className="flex flex-wrap gap-2">
                                    {[0, 1, 2, 3, 4, 6].map(r => (
                                        <button key={r} onClick={() => setRuns(r)} className={`p-2 rounded font-bold w-12 h-12 flex items-center justify-center ${runs === r ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Extras</label>
                                <select className="input-field w-full" value={extrasType} onChange={e => setExtrasType(e.target.value)}>
                                    <option value="None">None</option>
                                    <option value="Wide">Wide</option>
                                    <option value="NoBall">No Ball</option>
                                    <option value="Bye">Bye</option>
                                    <option value="LegBye">Leg Bye</option>
                                </select>
                                {extrasType !== 'None' && (
                                    <input type="number" className="input-field w-full mt-2" placeholder="Extras Runs" value={extrasRuns} onChange={e => setExtrasRuns(Number(e.target.value))} />
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-dark-700 space-y-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 accent-red-500" checked={isWicket} onChange={e => setIsWicket(e.target.checked)} />
                                <span className="font-bold text-red-500">Is Wicket?</span>
                            </label>

                            {isWicket && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                                    <select className="input-field" value={wicketType} onChange={e => setWicketType(e.target.value)}>
                                        <option value="None">Select Type</option>
                                        <option value="Bowled">Bowled</option>
                                        <option value="Caught">Caught</option>
                                        <option value="RunOut">Run Out</option>
                                        <option value="LBW">LBW</option>
                                    </select>
                                    <input className="input-field" placeholder="Dismissed Batsman" value={batsmanDismissed} onChange={e => setBatsmanDismissed(e.target.value)} />
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex justify-between space-x-2 sm:space-x-4">
                            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-4 rounded-xl text-lg transition shadow-md sm:text-xl active:scale-95" onClick={submitBall}>
                                Submit Delivery
                            </button>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-3 sm:py-4 rounded-xl transition shadow-md flex items-center active:scale-95" onClick={undoLast} title="Undo Last Ball">
                                <Undo2 size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2 dark:border-dark-700">Recent Deliveries</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {recentBalls.map((b, i) => (
                                <div key={b._id} className={`flex items-center justify-between p-3 rounded-lg border ${b.isWicket ? 'bg-red-50 border-red-200 dark:bg-red-900/20' : 'bg-gray-50 border-gray-200 dark:bg-dark-800 dark:border-dark-700'}`}>
                                    <div>
                                        <span className="font-bold text-gray-500 mr-3">{b.overNumber}.{b.ballNumberInOver}</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{b.bowlerName} to {b.strikerName}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {b.isWicket && <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">{b.wicketType}</span>}
                                        {b.extrasType !== 'None' && <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold">{b.extrasType}</span>}
                                        <span className={`font-bold w-6 text-center ${b.runsOffBat === 4 || b.runsOffBat === 6 ? 'text-green-500 text-lg' : ''}`}>
                                            {b.totalRunsForBall}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {recentBalls.length === 0 && <p className="text-gray-500 text-center italic mt-10">No deliveries yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {!state.isLocked && state.tossWinner && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Batting Stats */}
                    <div className="card shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
                        <div className="bg-gray-50 dark:bg-dark-800 px-4 py-3 border-b border-gray-200 dark:border-dark-700 font-bold uppercase text-sm tracking-wider">
                            Batting Scorecard
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                                    {Object.entries(batStats).reverse().map(([name, s]) => (
                                        <tr key={name} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {name} {name === striker && <span className="text-primary-600 ml-1 text-xs font-black">*</span>}
                                                </div>
                                                <div className="text-xs font-medium text-gray-400">{s.isOut ? s.dismissedBy : 'not out'}</div>
                                            </td>
                                            <td className="px-2 py-3 text-right font-bold text-gray-900 dark:text-white">{s.runs}</td>
                                            <td className="px-2 py-3 text-right text-gray-500">{s.balls}</td>
                                            <td className="px-2 py-3 text-right text-gray-400">{s.fours}</td>
                                            <td className="px-2 py-3 text-right text-gray-400">{s.sixes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bowling Stats */}
                    <div className="card shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
                        <div className="bg-gray-50 dark:bg-dark-800 px-4 py-3 border-b border-gray-200 dark:border-dark-700 font-bold uppercase text-sm tracking-wider">
                            Bowling Scorecard
                        </div>
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-900 border-b">
                                    <tr>
                                        <th className="px-4 py-2">Bowler</th>
                                        <th className="px-2 py-2 text-right">O</th>
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
                                                    {name} {name === bowler && <span className="text-primary-600 ml-1 text-xs font-black">*</span>}
                                                </td>
                                                <td className="px-2 py-3 text-right text-gray-500">{oversStr}</td>
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
            )}
        </div>
    );
};

export default CricketScorer;
