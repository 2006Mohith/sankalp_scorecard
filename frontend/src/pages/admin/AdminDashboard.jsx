import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { LogOut, PlusCircle, Activity, LayoutDashboard, Settings, ShieldCheck, Gamepad2, Users } from 'lucide-react';
import CricketScorer from './CricketScorer';
import { useAlert } from '../../context/AlertContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Components
const AddSport = () => {
    // Basic AddSport implementation
    const { success, error } = useAlert();
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Men');
    return (
        <div className="card p-6">
            <h3 className="text-xl font-bold mb-4">Add New Sport</h3>
            <div className="space-y-4 max-w-md">
                <input className="input-field" placeholder="Sport Name" value={name} onChange={e => setName(e.target.value)} />
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Men</option><option>Women</option><option>Mixed</option>
                </select>
                <button className="btn-primary w-full" onClick={async () => {
                    try {
                        await axios.post(`${API_URL}/sports`, { name, category }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
                        success('Sport added');
                        setName('');
                    } catch (err) {
                        error('Failed to add sport');
                    }
                }}>Save</button>
            </div>
        </div>
    );
};

const PlayerDraft = () => {
    const { success, error } = useAlert();
    const [sports, setSports] = useState([]);
    const [selectedSport, setSelectedSport] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adminRole, setAdminRole] = useState('Master');

    useEffect(() => {
        const role = localStorage.getItem('adminRole') || 'Master';
        const sId = localStorage.getItem('adminSportId');
        setAdminRole(role);

        axios.get(`${API_URL}/sports`).then(res => {
            if (role === 'SportAdmin' && sId) {
                const filtered = res.data.filter(s => s._id === sId);
                setSports(filtered);
                if (filtered.length > 0) setSelectedSport(filtered[0]);
            } else {
                setSports(res.data);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedSport) return;
        setLoading(true);
        axios.get(`${API_URL}/admin/registrations/${selectedSport._id}/${selectedSport.name}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }).then(res => {
            setPlayers(res.data);
            setLoading(false);
        }).catch(err => {
            error('Failed to load registered players');
            setLoading(false);
        });
    }, [selectedSport]);

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Select Sport Draft Board</h3>
                <select
                    className="input-field max-w-md"
                    value={selectedSport?._id || ''}
                    onChange={(e) => {
                        const sport = sports.find(s => s._id === e.target.value);
                        setSelectedSport(sport);
                    }}
                    disabled={adminRole === 'SportAdmin'}
                >
                    <option value="">-- Select Sport --</option>
                    {sports.map(s => <option key={s._id} value={s._id}>{s.name} ({s.category})</option>)}
                </select>
            </div>

            {selectedSport && (
                <div className="card p-6 border-l-4 border-l-primary-500">
                    <h3 className="text-xl font-bold mb-4 text-primary-600">Registered Student Athletes</h3>

                    {loading ? (
                        <p className="text-gray-500 animate-pulse">Loading core system records...</p>
                    ) : players.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-gray-400 uppercase tracking-widest text-xs">
                                        <th className="py-3 px-4 font-bold">Athlete Name</th>
                                        <th className="py-3 px-4 font-bold">Hall Ticket</th>
                                        <th className="py-3 px-4 font-bold">Branch</th>
                                        <th className="py-3 px-4 font-bold">Year</th>
                                        <th className="py-3 px-4 font-bold">Sec</th>
                                        <th className="py-3 px-4 font-bold">Status</th>
                                        <th className="py-3 px-4 font-bold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map(p => (
                                        <tr key={p._id} className="border-b border-white/5 hover:bg-dark-800/30 transition-colors">
                                            <td className="py-4 px-4 font-bold text-gray-200">{p.name}</td>
                                            <td className="py-4 px-4 font-mono text-gray-400">{p.hallTicket}</td>
                                            <td className="py-4 px-4 font-medium text-gray-300 uppercase">{p.branch || '-'}</td>
                                            <td className="py-4 px-4 font-medium text-gray-500">{p.year || '-'}</td>
                                            <td className="py-4 px-4 font-bold text-primary-400">{p.section || '-'}</td>
                                            <td className="py-4 px-4">
                                                {p.isAssignedToTeam ? (
                                                    <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Drafted</span>
                                                ) : (
                                                    <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Free Agent</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    className="bg-dark-800 hover:bg-primary-500/20 text-primary-400 border border-white/5 hover:border-primary-500/50 px-3 py-1 rounded text-xs font-bold uppercase transition"
                                                    onClick={() => alert('Future Feature: Open Team Assignment Model')}
                                                >
                                                    Assign Team
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 font-medium">No athletes have registered for this sport yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const ManageMatches = () => {
    // Basic implementation for manage matches 
    const { success, error, warning } = useAlert();
    const [sports, setSports] = useState([]);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [selectedSport, setSelectedSport] = useState('');
    const [adminRole, setAdminRole] = useState('Master');
    const [adminSportId, setAdminSportId] = useState(null);

    useEffect(() => {
        const role = localStorage.getItem('adminRole') || 'Master';
        const sId = localStorage.getItem('adminSportId');
        setAdminRole(role);
        setAdminSportId(sId);

        axios.get(`${API_URL}/sports`).then(res => {
            if (role === 'SportAdmin' && sId) {
                const filteredSports = res.data.filter(s => s._id === sId);
                setSports(filteredSports);
                if (filteredSports.length > 0) setSelectedSport(filteredSports[0]._id);
            } else {
                setSports(res.data);
            }
        });
        axios.get(`${API_URL}/teams`).then(res => setTeams(res.data));
    }, []);

    useEffect(() => {
        if (adminRole === 'MatchScorer') {
            axios.get(`${API_URL}/sports`).then(res => {
                const cricket = res.data.find(s => s.name === 'Cricket');
                if (cricket) {
                    axios.get(`${API_URL}/matches/${cricket._id}`).then(mRes => setMatches(mRes.data));
                }
            });
        } else if (selectedSport) {
            axios.get(`${API_URL}/matches/${selectedSport}`).then(res => setMatches(res.data));
        }
    }, [selectedSport, adminRole]);

    const [newTeamName, setNewTeamName] = useState('');
    const [team1Id, setTeam1Id] = useState('');
    const [team2Id, setTeam2Id] = useState('');

    const handleCreateTeam = async () => {
        if (!newTeamName || !selectedSport) return;
        try {
            const { data } = await axios.post(`${API_URL}/teams`,
                { name: newTeamName, sport_id: selectedSport, type: 'Team' },
                { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
            );
            setTeams([...teams, data]);
            setNewTeamName('');
            success('Team/Player added successfully!');
        } catch (err) {
            error('Error adding team');
        }
    };

    const handleCreateMatch = async () => {
        if (!team1Id || !team2Id || team1Id === team2Id || !selectedSport) return warning('Invalid team selection');
        try {
            const { data } = await axios.post(`${API_URL}/matches`,
                { sport_id: selectedSport, participant1_id: team1Id, participant2_id: team2Id, status: 'Upcoming' },
                { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
            );
            setMatches([data, ...matches]);
            setTeam1Id('');
            setTeam2Id('');
            success('Match created successfully!');
        } catch (err) {
            error('Error creating match');
        }
    };

    const handleUpdateMatch = async (match, payload) => {
        if (payload.status === 'Completed') {
            const tempScore1 = payload.score1 ?? match.score1;
            const tempScore2 = payload.score2 ?? match.score2;

            if (!match.participant1_id || !match.participant2_id) {
                error('Cannot complete a match that is waiting for participants!');
                return;
            }

            if (tempScore1 > tempScore2) payload.winner = match.participant1_id._id || match.participant1_id;
            else if (tempScore2 > tempScore1) payload.winner = match.participant2_id._id || match.participant2_id;
            else {
                warning('Cannot complete a Bracket match with a tie! Please update scores to determine a clear winner.');
                return;
            }
        } else if (payload.status) {
            // Reversing completion
            payload.winner = null;
        }

        try {
            const { data } = await axios.put(`${API_URL}/matches/${match._id}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

            // Re-fetch all matches cleanly to capture any cascading NEXT ROUND updates
            const refreshRes = await axios.get(`${API_URL}/matches/${selectedSport}`);
            setMatches(refreshRes.data);

            if (payload.status === 'Completed') success(`Match completed! Winner advanced to next round.`);
        } catch (err) {
            error(err.response?.data?.error || 'Failed to update match');
        }
    };

    const handleGenerateBracket = async () => {
        if (!selectedSport) return;
        if (!window.confirm('WARNING: This will delete ALL existing matches for this sport and automatically generate a single-elimination tournament bracket from the registered teams. Continue?')) return;

        try {
            const { data } = await axios.post(`${API_URL}/matches/generate-bracket/${selectedSport}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            // We fully overwrite local state matches with the complete fresh fetched bracket payload
            setMatches(data.matches);

            // Fetch teams again because the bracket generator automatically converts Free Agents into Solo Teams!
            const teamsRes = await axios.get(`${API_URL}/teams`);
            setTeams(teamsRes.data);

            success(data.message || 'Bracket successfully generated!');
        } catch (err) {
            error(err.response?.data?.error || 'Failed to auto-generate bracket');
        }
    };

    const sportTeams = teams.filter(t => t.sport_id?._id === selectedSport || t.sport_id === selectedSport);

    if (adminRole === 'MatchScorer') {
        const assigned = JSON.parse(localStorage.getItem('assignedMatches') || '[]');
        return (
            <div className="space-y-6">
                <div className="card p-6 border-l-4 border-l-primary-500">
                    <h3 className="text-xl font-bold mb-4 text-primary-600">Your Assigned Matches</h3>
                    <div className="space-y-4">
                        {matches.length === 0 ? (
                            <p className="text-gray-500 font-medium">Loading your matches...</p>
                        ) : (
                            matches.filter(m => assigned.includes(m._id)).map(m => (
                                <div key={m._id} className="flex flex-col md:flex-row justify-between items-center p-4 border rounded-lg hover:shadow-sm dark:border-dark-700 transition">
                                    <div className="font-bold flex-1 text-center md:text-left">{m.participant1_id?.name || 'TBA'} <span className="text-primary-500 px-2">vs</span> {m.participant2_id?.name || 'TBA'}</div>
                                    <div className="flex items-center space-x-2 flex-1 justify-center md:justify-end">
                                        <Link to={`/admin/dashboard/cricket/${m._id}`} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition">
                                            <Gamepad2 size={16} className="mr-2" /> Open Scorer Console
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                        {matches.length > 0 && matches.filter(m => assigned.includes(m._id)).length === 0 && (
                            <p className="text-gray-500 font-medium">You have no matches assigned to you right now.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Select Sport to Manage</h3>
                <select className="input-field max-w-md" value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} disabled={adminRole === 'SportAdmin'}>
                    <option value="">--Select--</option>
                    {sports.map(s => <option key={s._id} value={s._id}>{s.name} ({s.category})</option>)}
                </select>
            </div>

            {selectedSport && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4">1. Add New Team/Player</h3>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                <input className="input-field flex-1" placeholder="Team/Player Name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
                                <button className="btn-primary whitespace-nowrap" onClick={handleCreateTeam}>Add Team</button>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4">2. Create New Match</h3>
                            <div className="flex flex-col space-y-3">
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center">
                                    <select className="input-field flex-1 w-full" value={team1Id} onChange={e => setTeam1Id(e.target.value)}>
                                        <option value="">Select Team 1</option>
                                        {sportTeams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                    <span className="flex items-center font-bold text-gray-400 py-1 sm:py-0">VS</span>
                                    <select className="input-field flex-1 w-full" value={team2Id} onChange={e => setTeam2Id(e.target.value)}>
                                        <option value="">Select Team 2</option>
                                        {sportTeams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <button className="btn-primary w-full" onClick={handleCreateMatch}>Create Match</button>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <button
                                        className="w-full bg-accent-blue/20 text-accent-blue hover:bg-accent-blue hover:text-white border border-accent-blue/50 py-3 rounded-lg font-bold transition-all shadow-lg active:scale-95 flex justify-center items-center"
                                        onClick={handleGenerateBracket}
                                    >
                                        <Activity size={18} className="mr-2" /> Auto-Generate Tournament Bracket
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2 text-center">Randomly seeds teams into a structured Knockout Bracket</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 border-l-4 border-l-primary-500">
                        <h3 className="text-xl font-bold mb-4 text-primary-600">Matches List (Live Updating)</h3>
                        <div className="space-y-4">
                            {matches.map(m => (
                                <div key={m._id} className="flex flex-col md:flex-row justify-between items-center p-4 border rounded-lg hover:shadow-sm dark:border-dark-700 transition">
                                    <div className="font-bold flex-1 text-center md:text-left">{m.participant1_id?.name || 'TBA'} <span className="text-primary-500 px-2">vs</span> {m.participant2_id?.name || 'TBA'}</div>
                                    <div className="flex items-center space-x-4 my-4 md:my-0">
                                        <input type="number" className="w-16 input-field text-center font-bold text-lg" defaultValue={m.score1} onBlur={e => {
                                            handleUpdateMatch(m, { score1: Number(e.target.value) })
                                        }} disabled={m.status === 'Completed'} />
                                        <span className="font-bold">-</span>
                                        <input type="number" className="w-16 input-field text-center font-bold text-lg" defaultValue={m.score2} onBlur={e => {
                                            handleUpdateMatch(m, { score2: Number(e.target.value) })
                                        }} disabled={m.status === 'Completed'} />
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-1 justify-center md:justify-end md:mt-0 mt-4">
                                        <select className="input-field w-full sm:w-32 font-medium" value={m.status} onChange={e => handleUpdateMatch(m, { status: e.target.value })}>
                                            <option value="Upcoming">Upcoming</option>
                                            <option value="Live">Live</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                        {m.sport_id?.name === 'Cricket' && (
                                            <Link to={`/admin/dashboard/cricket/${m._id}`} className="flex items-center justify-center w-full sm:w-auto bg-blue-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-600 transition">
                                                <Gamepad2 size={16} className="mr-1" /> Open Scorer
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {matches.length === 0 && <p className="text-gray-500 font-medium">No matches available. Create one above.</p>}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('Master');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        setRole(localStorage.getItem('adminRole') || 'Master');

        axios.get(`${API_URL}/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminSportId');
            navigate('/admin/login');
        });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminSportId');
        navigate('/admin/login');
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
            {/* Sidebar */}
            <div className="w-full md:w-64 space-y-2 shrink-0">
                <div className="card p-4 space-y-2 sticky top-24">
                    <Link to="" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-200 transition font-medium">
                        <LayoutDashboard size={20} className="text-primary-500" /> <span>Overview</span>
                    </Link>
                    <Link to="matches" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-200 transition font-medium">
                        <Activity size={20} className="text-green-500" /> <span>Live Scorer</span>
                    </Link>
                    <Link to="draft" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-200 transition font-medium">
                        <Users size={20} className="text-purple-500" /> <span>Player Draft</span>
                    </Link>
                    {role === 'Master' && (
                        <Link to="sports" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-200 transition font-medium">
                            <PlusCircle size={20} className="text-blue-500" /> <span>Add Sport</span>
                        </Link>
                    )}
                    <hr className="border-gray-200 dark:border-dark-700 my-2" />
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition font-medium">
                        <LogOut size={20} /> <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                    <ShieldCheck className="mr-2 text-primary-500" size={28} /> Admin Control Panel
                </h2>
                <Routes>
                    <Route path="/" element={<div className="card p-6 font-medium text-gray-600 dark:text-gray-300">Welcome to SANKALP Scoreboard Admin Panel. Select an option from the sidebar.</div>} />
                    <Route path="matches" element={<ManageMatches />} />
                    <Route path="draft" element={<PlayerDraft />} />
                    <Route path="sports" element={<AddSport />} />
                    <Route path="cricket/:matchId" element={<CricketScorer />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;
